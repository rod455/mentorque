import { NextResponse } from "next/server";
import { chaveDadosOk, negada } from "@/lib/chaveDados";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { aulas } from "@/lib/app/conteudo/aulas";
import { lessonPublicada } from "@/lib/app/regrasDeConteudo";
import { LIMITE_GRATIS_POR_MES } from "@/lib/biela/limite";
import { CUPOM_DA_CAMPANHA, PRECO_MENSAL, cupomAindaTemVaga } from "@/lib/email/cupomDisponivel";
import { CHAVE_DO_CONVITE_PREMIUM, emailDoConvitePremium } from "@/lib/email/convitePremium";
import { linkDeSaida } from "@/lib/jornada/saida";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Teto de tempo: 23 pessoas com pausa de 350 ms entre envios não cabem nos 10
// segundos padrão do plano. Ver a skill de mensagem a cliente.
export const maxDuration = 60;

// O convite do Premium para quem usa o app com frequência (24/10/2026).
// O texto e o porquê estão em lib/email/convitePremium.ts; o público, em
// supabase/convite_premium.sql.
//
// AS TRÊS TRAVAS, as mesmas de /api/email/lancamento e /api/email/saida:
//
//   1. DADOS_CHAVE, como todo agregado da operação.
//   2. `disparar: true` no corpo. Nenhum GET nem rastreador manda e-mail.
//   3. A marca em `jornada_envios`, chave datada, gravada DEPOIS DE CADA envio.
//      A função do público já tira quem tem a marca, então uma segunda chamada
//      continua de onde a primeira parou.
//
// UMA QUARTA, que esta rota precisa e as outras não: `jornada_envios` aceita UM
// envio por pessoa por dia (índice `jornada_envios_um_por_dia`). Quem já
// recebeu e-mail da jornada hoje fica de fora deste disparo, senão o convite
// sai e a marca é recusada, e a próxima chamada mandaria de novo. Por isso o
// disparo é depois da jornada do dia (cron das 11h UTC).
//
// E O CUPOM É CONFERIDO ANTES: se a conta da casa disser que o teto acabou, a
// rota não manda nada. Cupom esgotado não dá erro, abre o checkout com preço
// cheio para quem leu "por nossa conta".
//
// DISPARAR É DO DONO, sempre, e cada disparo é uma decisão.

const FROM = process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";
const RESPONDE = "contato@mentorque.com.br";
const ESPERA_MS = 350;
const dorme = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Alvo = { userId: string; email: string; nome: string | null };

function numerosDoCatalogo() {
  const { lessons } = aulas((pt: string) => pt);
  const publicadas = lessons.filter((l) => lessonPublicada(l, new Date()));
  return { aulas: publicadas.length, aulasPremium: publicadas.filter((l) => l.premium).length };
}

async function enviar(chave: string, alvo: Alvo): Promise<{ erro: string | null; id: string | null }> {
  const sair = linkDeSaida(alvo.userId);
  const pronto = emailDoConvitePremium({
    nome: alvo.nome,
    cupom: CUPOM_DA_CAMPANHA,
    precoMensal: PRECO_MENSAL,
    limiteBiela: LIMITE_GRATIS_POR_MES,
    sair,
    ...numerosDoCatalogo(),
  });
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
        // O texto diz "é só responder": a resposta tem de cair numa caixa lida.
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
  if (typeof body?.teste === "string" && body.teste.includes("@")) {
    const { erro } = await enviar(chave, {
      userId: "00000000-0000-4000-8000-000000000000",
      email: body.teste.trim(),
      nome: typeof body?.nome === "string" ? body.nome : null,
    });
    return NextResponse.json(erro ? { ok: false, erro } : { ok: true, teste: body.teste.trim(), ...numerosDoCatalogo(), cupom: CUPOM_DA_CAMPANHA });
  }

  // ── a prévia: quem receberia agora, sem mandar nada ───────────────────────
  if (body?.previa === true) {
    const { data, error } = await admin.rpc("publico_convite_premium", { p_chave: CHAVE_DO_CONVITE_PREMIUM });
    if (error) return NextResponse.json({ error: "publico_falhou", detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, pessoas: (data ?? []).length });
  }

  if (body?.disparar !== true) {
    return NextResponse.json(
      { error: "faltou_disparar", comoUsar: 'POST com { "disparar": true }, { "previa": true } para contar, ou { "teste": "voce@exemplo.com" } para a copia de prova' },
      { status: 400 },
    );
  }

  // O cupom tem vaga? Mesma conta da jornada, e na dúvida NÃO manda.
  const { count: resgates, error: erroCupom } = await admin
    .from("subscriptions")
    .select("user_id", { count: "exact", head: true })
    .eq("cupom", CUPOM_DA_CAMPANHA);
  if (erroCupom || !cupomAindaTemVaga(resgates ?? 0)) {
    return NextResponse.json({ error: "cupom_sem_vaga_ou_sem_leitura", resgates, detalhe: erroCupom?.message ?? null }, { status: 409 });
  }

  // Quem recebe, consultado AGORA: quem assinou entre a escrita e o disparo
  // já está fora, e quem já tem a marca deste convite também.
  const { data: publico, error: erroPublico } = await admin.rpc("publico_convite_premium", { p_chave: CHAVE_DO_CONVITE_PREMIUM });
  if (erroPublico) return NextResponse.json({ error: "publico_falhou", detalhe: erroPublico.message }, { status: 500 });
  const lista = (publico ?? []) as { user_id: string; email: string; nome: string | null }[];

  // A quarta trava: quem já recebeu e-mail hoje fica para outro dia.
  const ids = lista.map((p) => p.user_id);
  const { data: jaHoje } = ids.length
    ? await admin.from("jornada_envios").select("user_id").eq("dia", hoje).in("user_id", ids)
    : { data: [] as { user_id: string }[] };
  const recebeuHoje = new Set((jaHoje ?? []).map((r) => String(r.user_id)));

  const resultado = { enviados: 0, adiados: [] as string[], falhas: [] as { userId: string; erro: string }[] };
  for (const p of lista) {
    if (recebeuHoje.has(p.user_id)) { resultado.adiados.push(p.user_id); continue; }
    const { erro, id } = await enviar(chave, { userId: p.user_id, email: p.email, nome: p.nome });
    if (erro) {
      resultado.falhas.push({ userId: p.user_id, erro });
      await dorme(ESPERA_MS);
      continue;
    }
    // A MARCA VEM LOGO DEPOIS DESTE ENVIO, e não no fim do laço.
    const { error: erroMarca } = await admin
      .from("jornada_envios")
      .insert({ user_id: p.user_id, chave: CHAVE_DO_CONVITE_PREMIUM, dia: hoje, canais: ["email"], email_id: id });
    if (erroMarca) {
      console.error("[convite-premium] e-mail enviado e NAO marcado", { userId: p.user_id, erro: erroMarca.message });
      resultado.falhas.push({ userId: p.user_id, erro: `enviado_sem_marca: ${erroMarca.message}` });
    }
    resultado.enviados += 1;
    await dorme(ESPERA_MS);
  }

  return NextResponse.json({ ok: true, ...resultado, candidatos: lista.length, resgatesAntes: resgates ?? 0 });
}
