import { NextResponse } from "next/server";
import { chaveDadosOk, negada } from "@/lib/chaveDados";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CHAVE_DO_ENVIO_DE_SAIDA, emailDeSaida, type Idioma } from "@/lib/email/saida";
import { linkDeSaida } from "@/lib/jornada/saida";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Teto de tempo: cada envio tem pausa para respeitar o limite do Resend, e o
// padrão da Vercel neste plano é 10 segundos. A lista de cancelamentos é curta
// hoje, e vai ser curta por muito tempo, mas contar com isso é o jeito de o
// disparo morrer no meio no dia em que não for.
export const maxDuration = 60;

// O e-mail de quem cancelou, com a pergunta do motivo.
//
// POR QUE EXISTE (02/10/2026), e o pedido é do dono: "um e-mail para comunicar
// quem cancelar a assinatura, com uma pesquisa de satisfação e perguntando os
// principais motivos, para a gente continuar evoluindo". Em 02/10 os três
// assinantes do Stripe saíram no mesmo dia, e a casa sabe QUE saíram e não sabe
// POR QUÊ.
//
// POR QUE UMA ROTA, E NÃO UM PASSO DA JORNADA. A jornada tem espaçamento
// mínimo de 3 dias e teto de 6 e-mails por janela, que existem para ninguém
// receber demais. Este e-mail não pode esperar vaga: ou sai perto do
// cancelamento, ou vira uma pergunta sobre uma decisão que a pessoa já
// esqueceu. Colocá-lo lá significaria abrir exceção no teto, e teto com
// exceção é teto que a próxima rodada amplia.
//
// AS TRÊS TRAVAS, as mesmas de /api/email/lancamento:
//
//   1. DADOS_CHAVE, como todo agregado da operação.
//   2. `disparar: true` no corpo. Nenhum GET, nenhum rastreador, nenhum
//      pré-carregamento manda e-mail para ninguém.
//   3. A marca no banco, por destinatário, gravada DEPOIS DE CADA envio e não
//      uma vez no fim: se a rota morrer no meio, quem já recebeu está marcado
//      e a segunda chamada continua de onde parou.
//
// A marca mora em `jornada_envios` com a chave `saida-pesquisa`, e não numa
// coluna nova. Assim ela entra de graça no `email30d` do retrato, que mede
// entrega, abertura e clique POR CHAVE: no dia em que alguém perguntar se este
// e-mail funciona, a resposta já vai estar medida.
//
// QUEM FICA DE FORA: quem pediu para sair da lista (`jornada_saidas`) e quem
// voltou a assinar entre o cancelamento e o disparo. A consulta é feita na hora
// do disparo, não antes: entre escrever e mandar, alguém pode reassinar, e
// perguntar "por que você cancelou?" para quem está pagando é pior do que não
// perguntar nada.
//
// DISPARAR É DO DONO, sempre, e cada disparo é uma decisão. Esta rota só
// existe armada.

const FROM = process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";
const RESPONDE = "contato@mentorque.com.br";
// A chave vem de lib/email/saida.ts, onde o retrato também a lê: o
// denominador das respostas é a contagem desta chave, e duas cópias da palavra
// em dois arquivos é o jeito de o retrato medir uma chave que ninguém envia.
const CHAVE_DO_ENVIO = CHAVE_DO_ENVIO_DE_SAIDA;

/** Janela de cancelamentos que a rota olha. */
const DIAS = 30;

/** O Resend aceita 2 chamadas por segundo. */
const ESPERA_MS = 350;
const dorme = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Alvo = { userId: string; email: string; nome: string | null; fimDoCiclo: string | null; idioma: Idioma };

async function enviar(chave: string, alvo: Alvo, hoje: string): Promise<{ erro: string | null; id: string | null }> {
  const pronto = emailDeSaida({
    userId: alvo.userId,
    nome: alvo.nome,
    fimDoCiclo: alvo.fimDoCiclo,
    hoje,
    idioma: alvo.idioma,
  });
  // Sem segredo no servidor não há link assinado, e e-mail de pesquisa sem a
  // pesquisa é só um aviso de cancelamento. Gastar a única chance de perguntar
  // com metade da coisa é pior do que não mandar.
  if (!pronto) return { erro: "sem_assinatura_de_link", id: null };

  const sair = linkDeSaida(alvo.userId);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${chave}` },
      body: JSON.stringify({
        from: FROM,
        to: [alvo.email],
        subject: pronto.assunto,
        html: pronto.html,
        text: pronto.texto,
        // `Reply-To` explícito porque o e-mail PEDE resposta: "é só responder"
        // tem de cair numa caixa que alguém lê.
        reply_to: RESPONDE,
        headers: {
          "List-Unsubscribe": sair
            ? `<${sair}>, <mailto:${RESPONDE}?subject=Sair%20da%20lista>`
            : `<mailto:${RESPONDE}?subject=Sair%20da%20lista>`,
        },
      }),
    });
    if (!res.ok) return { erro: `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300), id: null };
    const corpo = (await res.json().catch(() => ({}))) as { id?: string };
    return { erro: null, id: corpo?.id ?? null };
  } catch (err) {
    return { erro: String(err).slice(0, 300), id: null };
  }
}

export async function POST(req: Request) {
  if (!chaveDadosOk(req)) return negada();

  const chave = process.env.RESEND_API_KEY;
  if (!chave) return NextResponse.json({ error: "resend_nao_configurado" }, { status: 501 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "banco_nao_configurado" }, { status: 501 });

  const body = await req.json().catch(() => ({}));
  const hoje = new Date().toISOString().slice(0, 10);

  // ── a cópia de prova, sem tocar na lista nem na marca ─────────────────────
  //
  // Primeiro passo do roteiro da skill: o dono recebe e abre no celular. Aqui
  // ela também serve para conferir os SEIS links, que são o e-mail inteiro.
  if (typeof body?.teste === "string" && body.teste.includes("@")) {
    const alvo: Alvo = {
      userId: typeof body?.userId === "string" ? body.userId : "00000000-0000-4000-8000-000000000000",
      email: body.teste.trim(),
      nome: typeof body?.nome === "string" ? body.nome : null,
      fimDoCiclo: typeof body?.fimDoCiclo === "string" ? body.fimDoCiclo : null,
      idioma: body?.locale === "en" ? "en" : "pt",
    };
    const { erro } = await enviar(chave, alvo, hoje);
    return NextResponse.json(erro ? { ok: false, erro } : { ok: true, teste: alvo.email });
  }

  if (body?.disparar !== true) {
    return NextResponse.json(
      { error: "faltou_disparar", comoUsar: 'POST com { "disparar": true }, ou { "teste": "voce@exemplo.com" } para a copia de prova' },
      { status: 400 },
    );
  }

  const desde = new Date(Date.now() - DIAS * 86400000).toISOString();

  // Quem cancelou: a assinatura saiu de ativa (ou está marcada para sair) e o
  // banco registrou isso na janela. `updated_at` é o carimbo do webhook.
  const { data: assinaturas, error: erroAss } = await admin
    .from("subscriptions")
    .select("user_id, status, cancel_at_period_end, current_period_end, updated_at")
    .gte("updated_at", desde);
  if (erroAss) return NextResponse.json({ error: "consulta_falhou", detalhe: erroAss.message }, { status: 502 });

  const cancelaram = (assinaturas ?? []).filter(
    (s) => s.status === "canceled" || (s.status === "active" && s.cancel_at_period_end),
  );
  if (cancelaram.length === 0) return NextResponse.json({ ok: true, enviados: 0, motivo: "ninguem_cancelou_na_janela" });

  const ids = cancelaram.map((s) => String(s.user_id));

  // Quem já recebeu, quem pediu para sair. As duas consultas são feitas AGORA,
  // e não numa lista escrita antes.
  const [{ data: jaRecebeu }, { data: saiuDaLista }] = await Promise.all([
    admin.from("jornada_envios").select("user_id").eq("chave", CHAVE_DO_ENVIO).in("user_id", ids),
    admin.from("jornada_saidas").select("user_id").in("user_id", ids),
  ]);
  const fora = new Set([
    ...(jaRecebeu ?? []).map((r) => String(r.user_id)),
    ...(saiuDaLista ?? []).map((r) => String(r.user_id)),
  ]);

  const alvos: Alvo[] = [];
  for (const s of cancelaram) {
    const userId = String(s.user_id);
    if (fora.has(userId)) continue;
    const { data: conta } = await admin.auth.admin.getUserById(userId);
    const email = conta?.user?.email ?? "";
    if (!email) continue;
    const meta = (conta?.user?.user_metadata ?? {}) as { name?: string; full_name?: string };
    const nomeInteiro = String(meta.full_name ?? meta.name ?? "").trim();
    alvos.push({
      userId,
      email,
      nome: nomeInteiro ? nomeInteiro.split(/\s+/)[0]! : null,
      fimDoCiclo: (s.current_period_end as string | null) ?? null,
      idioma: "pt",
    });
  }

  const resultado: { enviados: number; falhas: { userId: string; erro: string }[] } = { enviados: 0, falhas: [] };
  for (const alvo of alvos) {
    const { erro, id } = await enviar(chave, alvo, hoje);
    if (erro) {
      resultado.falhas.push({ userId: alvo.userId, erro });
      continue;
    }
    // A MARCA VEM LOGO DEPOIS DESTE ENVIO, e não no fim do laço. Se a rota
    // morrer agora, quem já recebeu está marcado.
    const { error: erroMarca } = await admin
      .from("jornada_envios")
      .insert({ user_id: alvo.userId, chave: CHAVE_DO_ENVIO, dia: hoje, canais: ["email"], email_id: id });
    if (erroMarca) {
      // O e-mail já saiu: não dá para desfazer. O que não pode é isso sair
      // calado, porque sem a marca a próxima chamada manda de novo.
      console.error("[saida] e-mail enviado e NAO marcado", { userId: alvo.userId, erro: erroMarca.message });
      resultado.falhas.push({ userId: alvo.userId, erro: `enviado_sem_marca: ${erroMarca.message}` });
    }
    resultado.enviados += 1;
    await dorme(ESPERA_MS);
  }

  return NextResponse.json({ ok: true, ...resultado, candidatos: alvos.length });
}
