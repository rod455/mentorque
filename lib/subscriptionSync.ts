import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { planForPrice } from "@/lib/stripe";

// Grava/atualiza a linha de `subscriptions` a partir de um objeto de assinatura
// do Stripe. Fonte única usada pelo webhook e pelas rotas de checkout/cancel/
// reactivate/sync — para o banco nunca depender só do webhook.
export async function upsertSubscription(admin: SupabaseClient, sub: Stripe.Subscription, fallbackUserId?: string | null) {
  const userId = sub.metadata?.user_id || fallbackUserId;
  if (!userId) return;
  const item = sub.items.data[0];
  const price = item?.price;
  // current_period_end migrou do objeto subscription para o item nas versões novas.
  const periodEnd =
    (item as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  await admin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    status: sub.status,
    price_id: price?.id ?? null,
    plan: planForPrice(price?.id),
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
}
