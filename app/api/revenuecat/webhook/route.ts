import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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
  type?: string;
  app_user_id?: string;
  product_id?: string;
  expiration_at_ms?: number;
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

  return NextResponse.json({ ok: true });
}
