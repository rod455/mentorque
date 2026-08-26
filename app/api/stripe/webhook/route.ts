import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertSubscription } from "@/lib/subscriptionSync";
import { eventoDeFunil } from "@/lib/funilServidor";

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

  // Funil: os eventos financeiros nascem no SERVIDOR, confirmados pelo
  // processador, nunca pelo app. O registro em si vive em lib/funilServidor.ts,
  // compartilhado com o /api/stripe/sync — as duas portas gravam o mesmo
  // `assinou` e o índice único do banco fica com um só.
  //
  // Antes, o insert daqui engolia QUALQUER erro (`.then(() => undefined)`).
  // Isso é o que faz uma etapa ficar em zero parecendo desinteresse de quem usa
  // o app, quando na verdade o banco recusou a linha. Agora duplicado sai em
  // silêncio, que é o esperado, e o resto vai para o log.
  const funil = (evento: string, userId?: string | null, extra?: Record<string, unknown>) =>
    eventoDeFunil(admin, evento, { userId, origem: "stripe", extra });

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
