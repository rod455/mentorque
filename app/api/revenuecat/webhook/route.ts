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

  if (ACTIVE.has(event.type)) {
    await admin.from("subscriptions").upsert({
      user_id: userId,
      status: "active",
      plan,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });
  } else if (event.type === "CANCELLATION") {
    // Desligou a renovação: continua ativo até o fim do período.
    await admin.from("subscriptions").upsert({
      user_id: userId,
      status: "active",
      plan,
      current_period_end: periodEnd,
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    });
  } else if (event.type === "EXPIRATION") {
    await admin.from("subscriptions").upsert({
      user_id: userId,
      status: "inactive",
      plan,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });
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
