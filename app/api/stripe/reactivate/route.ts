import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertSubscription } from "@/lib/subscriptionSync";

export const runtime = "nodejs";

// Reverte um cancelamento agendado (cancel_at_period_end = false).
export async function POST(req: Request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  if (!stripe || !admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: userData, error: uErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (uErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: row } = await admin.from("subscriptions").select("stripe_subscription_id").eq("user_id", user.id).maybeSingle();
  const subId = row?.stripe_subscription_id as string | undefined;
  if (!subId) return NextResponse.json({ error: "no_subscription" }, { status: 400 });

  const sub = await stripe.subscriptions.update(subId, { cancel_at_period_end: false });
  await upsertSubscription(admin, sub, user.id); // grava direto (não depende do webhook)
  return NextResponse.json({ ok: true });
}
