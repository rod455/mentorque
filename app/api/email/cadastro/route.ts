import { NextResponse } from "next/server";
import { chaveDadosOk, negada } from "@/lib/chaveDados";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { emailTermineOCadastro } from "@/lib/email/termineOCadastro";
import { linkDeSaida } from "@/lib/jornada/saida";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// O padrão da Vercel neste plano é 10 segundos, e a lista não cabe: são 32
// envios com pausa entre eles. Sem esta linha o disparo morreria no meio.
export const maxDuration = 60;

// O convite para quem criou conta e parou antes de cadastrar o carro.
//
// POR QUE EXISTE (03/10/2026), pedido do dono: "um e-mail oferecendo 1 mês de
// Premium grátis, com o cupom do Stripe, para os clientes que criaram conta e
// não cadastraram o carro".
//
// AS TRÊS TRAVAS DE SEMPRE, as mesmas de /api/email/lancamento e /api/email/saida:
//
//   1. DADOS_CHAVE, como todo agregado da operação.
//   2. `disparar: true` no corpo. Nenhum GET, nenhum rastreador, nenhum
//      pré-carregamento manda e-mail para ninguém.
//   3. A marca em `jornada_envios` com a chave `termine-o-cadastro`, gravada
//      DEPOIS DE CADA envio e não uma vez no fim: se a rota morrer no meio,
//      quem já recebeu está marcado e a segunda chamada continua de onde parou.
//      A marca entra de graça no `email30d` do retrato, que mede entrega,
//      abertura e clique POR CHAVE.
//
// E A QUARTA, QUE É DESTE CASO: O TETO DO CUPOM.
//
// Cupom do Stripe tem `max_redemptions` e ele NÃO é editável depois de criado
// (registrado em docs/lancamento/email-lista-de-espera.md, em 03/09, quando o
// pedido de subir de 10 para 25 só pôde ser atendido criando cupom novo). Um
// e-mail para mais gente do que o teto entrega um link que funciona para os
// primeiros e FALHA CALADO para os últimos: o checkout abre sem o desconto,
// com o preço cheio na tela de quem acabou de ler "por nossa conta".
//
// Por isso `cupons` é obrigatório no corpo e a rota NÃO envia para mais gente
// do que esse número. Quem dispara lê o resgate restante no painel do Stripe
// na hora e passa aqui. Não dá para ler daqui: a integração do Stripe não está
// autorizada nesta sessão, e chutar o número é exatamente o defeito que esta
// trava existe para impedir.
//
// QUEM FICA DE FORA, pela consulta e não por lista escrita antes: quem já tem
// carro (o convite perdeu o sentido), quem já assina, quem pediu para sair da
// lista e quem já recebeu este e-mail. A consulta é feita na hora do disparo
// porque entre escrever e mandar alguém pode cadastrar o carro, e mandar
// "falta o seu carro" para quem acabou de cadastrar é o tipo de erro que faz a
// pessoa desconfiar de tudo o que vier depois.
//
// DISPARAR É DO DONO, sempre, e cada disparo é uma decisão. Esta rota só existe
// armada.

const FROM = process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";
const RESPONDE = "contato@mentorque.com.br";
const CHAVE_DO_ENVIO = "termine-o-cadastro";

/** O código do Stripe, o mesmo do lançamento. */
const CUPOM = "LANCAMENTO1MES";
const PRECO_MENSAL = "R$ 29,90";

/** O Resend aceita 2 chamadas por segundo. */
const ESPERA_MS = 350;
const dorme = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Alvo = { userId: string; email: string; nome: string | null };

async function enviar(chave: string, alvo: Alvo): Promise<{ erro: string | null; id: string | null }> {
  const pronto = emailTermineOCadastro({
    userId: alvo.userId,
    nome: alvo.nome,
    cupom: CUPOM,
    precoMensal: PRECO_MENSAL,
  });
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
  // Primeiro passo do roteiro da skill: o dono recebe e abre no celular. As
  // imagens vêm do site, e imagem quebrada não tem conserto depois de enviada.
  if (typeof body?.teste === "string" && body.teste.includes("@")) {
    const alvo: Alvo = {
      userId: typeof body?.userId === "string" ? body.userId : "00000000-0000-4000-8000-000000000000",
      email: body.teste.trim(),
      nome: typeof body?.nome === "string" ? body.nome : null,
    };
    const { erro } = await enviar(chave, alvo);
    return NextResponse.json(erro ? { ok: false, erro } : { ok: true, teste: alvo.email });
  }

  if (body?.disparar !== true) {
    return NextResponse.json(
      {
        error: "faltou_disparar",
        comoUsar: 'POST com { "disparar": true, "cupons": N }, ou { "teste": "voce@exemplo.com" } para a copia de prova',
      },
      { status: 400 },
    );
  }

  // O TETO DO CUPOM, lido no painel do Stripe na hora e passado aqui. Sem ele
  // a rota não manda nada: e-mail de presente que entrega preço cheio para os
  // últimos é pior do que e-mail nenhum.
  const cupons = Number(body?.cupons);
  if (!Number.isInteger(cupons) || cupons <= 0) {
    return NextResponse.json(
      {
        error: "faltou_cupons",
        comoUsar:
          'Quantos resgates o cupom LANCAMENTO1MES ainda aguenta, lidos no painel do Stripe agora. A rota nao manda para mais gente do que isso, porque o teto nao e editavel e o checkout abriria com preco cheio para quem passar.',
      },
      { status: 400 },
    );
  }

  // Quem tem carro sai daqui. `user_state.data->vehicles` é a mesma fonte da
  // view `estado_da_base`: é ESTADO, não evento, então cobre também quem
  // cadastrou carro antes de a medição existir.
  const { data: estados, error: erroEstado } = await admin.from("user_state").select("user_id, data");
  if (erroEstado) return NextResponse.json({ error: "consulta_falhou", detalhe: erroEstado.message }, { status: 502 });
  const comCarro = new Set(
    (estados ?? [])
      .filter((e) => {
        const v = (e.data as { vehicles?: unknown })?.vehicles;
        return Array.isArray(v) && v.length > 0;
      })
      .map((e) => String(e.user_id)),
  );

  const [{ data: jaRecebeu }, { data: hojeJa }, { data: saiuDaLista }, { data: assinantes }] = await Promise.all([
    admin.from("jornada_envios").select("user_id").eq("chave", CHAVE_DO_ENVIO),
    // QUEM JÁ RECEBEU ALGO HOJE (03/10/2026), e isto nasceu de um erro meu com
    // gente de verdade do outro lado.
    //
    // No primeiro disparo, 8 das 32 pessoas tinham recebido um e-mail da
    // jornada às 11h47 e receberam este às 12h34: **dois e-mails nossos em 47
    // minutos**. A regra "nunca dois no mesmo dia" existe desde 12/09, está
    // escrita no banco como índice único `(user_id, dia)` e no código da
    // jornada, e esta rota passou por fora dela, porque eu copiei as três
    // travas de /api/email/saida sem conferir a quarta regra que a jornada já
    // tinha. O índice recusou a marca e foi assim que o erro apareceu: ele
    // avisou DEPOIS do envio, que é o único momento em que não adianta mais.
    //
    // Agora a regra é consultada ANTES. Quem já recebeu qualquer e-mail hoje
    // fica para a próxima rodada, e isso aparece na resposta em vez de sumir.
    admin.from("jornada_envios").select("user_id").eq("dia", hoje),
    admin.from("jornada_saidas").select("user_id"),
    admin.from("subscriptions").select("user_id, status").in("status", ["active", "trialing"]),
  ]);
  const recebeuHoje = new Set((hojeJa ?? []).map((r) => String(r.user_id)));
  const fora = new Set([
    ...comCarro,
    ...(jaRecebeu ?? []).map((r) => String(r.user_id)),
    ...recebeuHoje,
    ...(saiuDaLista ?? []).map((r) => String(r.user_id)),
    ...(assinantes ?? []).map((r) => String(r.user_id)),
  ]);

  // A lista de contas. `listUsers` pagina, e a base cabe em duas páginas hoje;
  // o laço existe para o dia em que não couber.
  const alvos: Alvo[] = [];
  for (let pagina = 1; pagina <= 10; pagina++) {
    const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: 200 });
    if (error) return NextResponse.json({ error: "contas_falhou", detalhe: error.message }, { status: 502 });
    const contas = data?.users ?? [];
    for (const u of contas) {
      const userId = String(u.id);
      if (fora.has(userId)) continue;
      const email = u.email ?? "";
      if (!email) continue;
      const meta = (u.user_metadata ?? {}) as { name?: string; full_name?: string };
      const nomeInteiro = String(meta.full_name ?? meta.name ?? "").trim();
      alvos.push({ userId, email, nome: nomeInteiro ? nomeInteiro.split(/\s+/)[0]! : null });
    }
    if (contas.length < 200) break;
  }

  // O CORTE PELO TETO, e ele é dito na resposta em vez de silencioso: quem
  // dispara precisa saber quantas pessoas ficaram para a próxima leva.
  const cabem = alvos.slice(0, cupons);
  const sobraram = alvos.length - cabem.length;

  const resultado: { enviados: number; falhas: { userId: string; erro: string }[] } = { enviados: 0, falhas: [] };
  for (const alvo of cabem) {
    const { erro, id } = await enviar(chave, alvo);
    if (erro) {
      resultado.falhas.push({ userId: alvo.userId, erro });
      continue;
    }
    // A MARCA VEM LOGO DEPOIS DESTE ENVIO, e não no fim do laço.
    const { error: erroMarca } = await admin
      .from("jornada_envios")
      .insert({ user_id: alvo.userId, chave: CHAVE_DO_ENVIO, dia: hoje, canais: ["email"], email_id: id });
    if (erroMarca) {
      // O e-mail já saiu: não dá para desfazer. O que não pode é isso sair
      // calado, porque sem a marca a próxima chamada manda de novo.
      console.error("[cadastro] e-mail enviado e NAO marcado", { userId: alvo.userId, erro: erroMarca.message });
      resultado.falhas.push({ userId: alvo.userId, erro: `enviado_sem_marca: ${erroMarca.message}` });
    }
    resultado.enviados += 1;
    await dorme(ESPERA_MS);
  }

  return NextResponse.json({
    ok: true,
    ...resultado,
    candidatos: alvos.length,
    tetoDoCupom: cupons,
    ficaramDeFora: sobraram,
    // Quantos ficaram para a próxima rodada por já terem recebido um e-mail
    // hoje. Dito, e não escondido: é o número que prova que a regra de um por
    // dia foi respeitada neste disparo.
    adiadosPorJaTeremRecebidoHoje: recebeuHoje.size,
  });
}
