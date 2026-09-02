import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { planForPrice } from "@/lib/stripe";

// Grava/atualiza a linha de `subscriptions` a partir de um objeto de assinatura
// do Stripe. Fonte única usada pelo webhook e pelas rotas de checkout/cancel/
// reactivate/sync — para o banco nunca depender só do webhook.
//
// ESTA ESCRITA É O DINHEIRO, e é por isso que ela LANÇA quando falha.
//
// Até 02/09/2026 ela fazia `await admin.from(...).upsert(...)` e descartava o
// erro. É a linha de `subscriptions` que libera o Premium: se ela não é
// gravada, a pessoa pagou e continua sem o que comprou. E como quem chama
// respondia 200 de qualquer jeito, o Stripe (e o RevenueCat, no gêmeo desta
// rota) considerava entregue e nunca reenviava. Um erro de banco de um segundo
// virava um cliente pagante sem Premium, para sempre, em silêncio.
//
// Lançar é o oposto de derrubar o serviço: é o que faz a rota responder um
// código de erro, e é o código de erro que faz o provedor REENVIAR o webhook.
// O upsert é idempotente, então reentrega não cobra ninguém duas vezes nem
// duplica linha. O risco de tentar de novo é nenhum; o risco de calar é um
// cliente perdido.
//
// A regra vale só para `subscriptions`. Evento de funil é métrica e continua
// silencioso e tolerante (ver lib/funilServidor.ts): perder uma medição é
// ruim, perder uma assinatura paga é outra categoria de problema.
export async function upsertSubscription(admin: SupabaseClient, sub: Stripe.Subscription, fallbackUserId?: string | null) {
  const userId = sub.metadata?.user_id || fallbackUserId;
  if (!userId) return;
  const item = sub.items.data[0];
  const price = item?.price;
  // current_period_end migrou do objeto subscription para o item nas versões novas.
  const periodEnd =
    (item as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  const { error } = await admin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    status: sub.status,
    price_id: price?.id ?? null,
    plan: planForPrice(price?.id),
    // O cupom que originou a venda, carimbado na metadata da assinatura pela
    // /api/stripe/checkout. Sem isto, "quantas vendas vieram com cupom" só o
    // Stripe responde.
    cupom: typeof sub.metadata?.cupom === "string" && sub.metadata.cupom ? sub.metadata.cupom : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    throw new Error(`assinatura de ${userId} não foi gravada: ${error.message}`);
  }
}
