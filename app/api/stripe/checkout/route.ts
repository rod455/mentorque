import { NextResponse } from "next/server";
import { getStripe, priceFor } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { detectPlatform } from "@/lib/app/platform";

export const runtime = "nodejs";

// Creates a Stripe Checkout Session (subscription) for the logged-in user and
// returns its URL. The client must send the Supabase access token as a Bearer.
export async function POST(req: Request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  if (!stripe || !admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: userData, error: uErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (uErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan: "monthly" | "annual" = body?.plan === "monthly" ? "monthly" : "annual";
  const priceId = priceFor(plan);
  if (!priceId) return NextResponse.json({ error: "no_price" }, { status: 501 });

  // Reuse the user's Stripe customer, or create + persist one.
  const { data: row } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  let customerId = row?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email ?? undefined, metadata: { user_id: user.id } });
    customerId = customer.id;
    await admin.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customerId });
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://mentorque.com.br";
  // Teste grátis por plataforma: 3 dias no iPhone, 7 no Android/outros.
  const platform =
    body?.platform === "ios" || body?.platform === "android"
      ? body.platform
      : detectPlatform(req.headers.get("user-agent") ?? undefined);
  const iosDays = Number(process.env.STRIPE_TRIAL_DAYS_IOS ?? 3);
  const otherDays = Number(process.env.STRIPE_TRIAL_DAYS ?? 7);
  const trialDays = platform === "ios" ? iosDays : otherDays; // 0 = sem teste grátis
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ui_mode: "embedded", // formulário embutido no app
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: {
      metadata: { user_id: user.id },
      ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
    },
    allow_promotion_codes: true,
    locale: "pt-BR",
    return_url: `${origin}/app?checkout=success`,
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
