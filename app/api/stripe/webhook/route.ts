import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertSubscription } from "@/lib/subscriptionSync";

export const runtime = "nodejs";

// Stripe webhook — keeps the `subscriptions` table in sync with Stripe.
// Configure the endpoint in Stripe (Developers → Webhooks) pointing to
// /api/stripe/webhook and set STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !admin || !secret) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  // Funil: os eventos financeiros nascem AQUI (e no webhook do RevenueCat),
  // confirmados pelo processador — nunca pelo app. Falha no registro não pode
  // derrubar o webhook: o insert não lança, e o funil é métrica, não caixa.
  const funil = (evento: string, userId?: string | null, extra?: Record<string, unknown>) =>
    admin.from("funil_eventos").insert({
      evento,
      user_id: userId && /^[0-9a-f-]{36}$/i.test(userId) ? userId : null,
      plataforma: "web",
      origem: "stripe",
      extra: extra ?? null,
    }).then(() => undefined);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(admin, sub, session.client_reference_id);
          await funil("assinou", session.client_reference_id ?? sub.metadata?.user_id, { sub: sub.id });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(admin, sub);
        const prev = (event.data as { previous_attributes?: { cancel_at_period_end?: boolean } }).previous_attributes;
        if (event.type === "customer.subscription.deleted") {
          await funil("expirou", sub.metadata?.user_id, { sub: sub.id });
        } else if (event.type === "customer.subscription.updated" && prev?.cancel_at_period_end === false && sub.cancel_at_period_end) {
          // Desligou a renovação agora (o flip é o evento; o estado sozinho
          // repetiria "cancelou" a cada update qualquer da assinatura).
          await funil("cancelou", sub.metadata?.user_id, { sub: sub.id });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook]", err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
