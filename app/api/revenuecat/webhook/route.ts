import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { eventoDeFunil } from "@/lib/funilServidor";

export const runtime = "nodejs";

// Webhook do RevenueCat (compras via Apple IAP). Configure no painel do
// RevenueCat (Project → Integrations → Webhooks) apontando para
// https://mentorque.com.br/api/revenuecat/webhook com o header Authorization
// igual ao env REVENUECAT_WEBHOOK_AUTH. O app_user_id é o id do usuário
// Supabase (definido no Purchases.configure), então o Premium liberado aqui
// vale em todos os aparelhos e na web.
const ACTIVE = new Set(["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RcEvent = {
  // Id do EVENTO no RevenueCat (não da assinatura). A reentrega de um webhook
  // repete o mesmo id, e é isso que permite distinguir "chegou duas vezes" de
  // "aconteceu duas vezes". Ver o índice único em supabase/funil_eventos.sql.
  id?: string;
  type?: string;
  app_user_id?: string;
  product_id?: string;
  expiration_at_ms?: number;
  store?: string; // PLAY_STORE | APP_STORE | …
};

// Funil: o lado financeiro das lojas. O mapa é deliberadamente curto —
// UNCANCELLATION e PRODUCT_CHANGE mexem na assinatura mas não são um degrau
// novo do funil, então não geram evento.
const FUNIL: Record<string, string> = {
  INITIAL_PURCHASE: "assinou",
  NON_RENEWING_PURCHASE: "assinou",
  RENEWAL: "renovou",
  CANCELLATION: "cancelou",
  EXPIRATION: "expirou",
};

export async function POST(req: Request) {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (expected && req.headers.get("authorization") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let event: RcEvent | undefined;
  try { event = (await req.json())?.event as RcEvent; } catch { /* below */ }
  if (!event?.type) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const userId = event.app_user_id ?? "";
  if (!UUID_RE.test(userId)) return NextResponse.json({ ok: true, skipped: "anonymous_user" });

  const productId = (event.product_id ?? "").toLowerCase();
  // No Google o produto chega como "assinatura:planoBase" (ex.:
  // "annual100:monthly"), e quem diz o plano é o PLANO BASE, não a assinatura.
  // Farejar a string inteira classificava errado quando o id da assinatura
  // continha "annual". Na Apple não há dois-pontos e o id inteiro vale.
  const base = productId.includes(":") ? productId.split(":").pop()! : productId;
  const plan = /month|mensal/.test(base)
    ? "monthly"
    : /annual|year|anual/.test(base) || /annual|year|anual/.test(productId)
      ? "annual"
      : "monthly";
  const periodEnd = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  // ESTA ESCRITA É O DINHEIRO, e falhar nela não pode sair calado.
  //
  // Até 02/09/2026 os três upserts abaixo descartavam o erro e a rota
  // respondia 200 do mesmo jeito. É a linha de `subscriptions` que libera o
  // Premium: sem ela, a pessoa pagou na Apple ou na Play e continua sem o que
  // comprou. E o 200 fazia o RevenueCat considerar entregue e nunca reenviar,
  // então um erro de banco de um segundo virava um cliente pagante sem
  // Premium, para sempre, sem uma linha em lugar nenhum.
  //
  // Aqui isso é pior que no Stripe: lá existe o /api/stripe/sync como segunda
  // porta, disparado pelo app ao voltar do checkout. Do lado da loja não há
  // segunda porta nenhuma. Este webhook é a única chance.
  //
  // Responder 500 é o que faz o RevenueCat reenviar, e reenviar é seguro: o
  // upsert é idempotente (não cobra ninguém de novo, não duplica linha) e o
  // evento de funil é barrado pelo índice de reentrega. O risco de tentar de
  // novo é nenhum; o risco de calar é um cliente perdido.
  const gravaAssinatura = async (campos: Record<string, unknown>): Promise<string | null> => {
    const { error } = await admin.from("subscriptions").upsert({
      user_id: userId,
      plan,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
      ...campos,
    });
    return error?.message ?? null;
  };

  let erroDaAssinatura: string | null = null;
  if (ACTIVE.has(event.type)) {
    erroDaAssinatura = await gravaAssinatura({ status: "active", cancel_at_period_end: false });
  } else if (event.type === "CANCELLATION") {
    // Desligou a renovação: continua ativo até o fim do período.
    erroDaAssinatura = await gravaAssinatura({ status: "active", cancel_at_period_end: true });
  } else if (event.type === "EXPIRATION") {
    erroDaAssinatura = await gravaAssinatura({ status: "inactive", cancel_at_period_end: false });
  }

  if (erroDaAssinatura) {
    console.error(`[revenuecat] ${event.type} de ${userId} não gravado:`, erroDaAssinatura);
    // Sai ANTES do evento de funil: sem a assinatura gravada, medir a venda
    // seria registrar como concluído um caminho que não se concluiu. O reenvio
    // grava as duas coisas na ordem certa.
    return NextResponse.json({ error: "assinatura_nao_gravada" }, { status: 500 });
  }

  const passoFunil = FUNIL[event.type];
  if (passoFunil) {
    // Passa pelo mesmo escritor do lado do Stripe, e não por um insert próprio,
    // por duas razões que já custaram caro antes:
    //
    // 1. O insert daqui NÃO olhava o `error`. É o mesmo padrão que deixou uma
    //    etapa em zero parecendo desinteresse de quem usa o app (26/08). Aqui
    //    seria pior: o evento perdido é o FINANCEIRO, e a resposta continua
    //    200, então o RevenueCat considera entregue e nunca reenvia.
    // 2. Duplicado é esperado e sai calado; o resto vai para o log.
    //
    // `rc_event` é a chave de deduplicação da loja. O índice do `assinou`
    // existente casa por `extra->>'sub'`, que só o Stripe escreve: reentrega da
    // Apple ou da Play passava direto e contava a mesma venda de novo. Por id
    // do evento a proteção vale para os quatro passos, inclusive `renovou`,
    // onde travar por assinatura apagaria receita (renovar de novo é fato
    // novo, receber a mesma renovação duas vezes não é).
    await eventoDeFunil(admin, passoFunil, {
      userId,
      origem: "revenuecat",
      plataforma: event.store === "PLAY_STORE" ? "android" : event.store === "APP_STORE" ? "ios" : "loja",
      extra: { product: productId, ...(event.id ? { rc_event: event.id } : {}) },
    });
  }

  return NextResponse.json({ ok: true });
}
