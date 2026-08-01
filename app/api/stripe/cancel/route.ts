import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Cancels the user's subscription at the end of the current period (they keep
// Premium until then). The webhook keeps the `subscriptions` table in sync.
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

  await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
  return NextResponse.json({ ok: true });
}
