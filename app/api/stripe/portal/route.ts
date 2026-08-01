import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Opens the Stripe Billing Portal so the user can manage/cancel the plan.
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
  if (!customerId) return NextResponse.json({ error: "no_customer" }, { status: 400 });

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://mentorque.com.br";
  const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${origin}/app` });
  return NextResponse.json({ url: portal.url });
}
