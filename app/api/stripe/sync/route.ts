import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertSubscription } from "@/lib/subscriptionSync";

export const runtime = "nodejs";

// Sincroniza a assinatura do usuário lendo o estado autoritativo do Stripe e
// gravando no banco. Chamado ao voltar do checkout — não depende do webhook.
export async function POST(req: Request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  if (!stripe || !admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: userData, error: uErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (uErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: row } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  const customerId = row?.stripe_customer_id as string | undefined;
  if (!customerId) return NextResponse.json({ ok: true, subscription: null });

  const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
  const sub = subs.data[0];
  if (!sub) {
    await admin.from("subscriptions").update({ status: "inactive", updated_at: new Date().toISOString() }).eq("user_id", user.id);
    return NextResponse.json({ ok: true, subscription: null });
  }
  await upsertSubscription(admin, sub, user.id);
  return NextResponse.json({ ok: true, status: sub.status });
}
