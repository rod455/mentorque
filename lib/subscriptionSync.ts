import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { planForPrice } from "@/lib/stripe";
import { fimDoCiclo } from "@/lib/ciclo";

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
/** O `current_period_end` que o banco guarda hoje para esta assinatura, em segundos. */
export async function cicloNoBanco(admin: SupabaseClient, subId: string): Promise<number | null> {
  const { data } = await admin
    .from("subscriptions")
    .select("current_period_end")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();
  const t = data?.current_period_end ? Date.parse(String(data.current_period_end)) : NaN;
  return Number.isFinite(t) ? Math.round(t / 1000) : null;
}

export async function upsertSubscription(admin: SupabaseClient, sub: Stripe.Subscription, fallbackUserId?: string | null) {
  const userId = sub.metadata?.user_id || fallbackUserId;
  if (!userId) return;
  const item = sub.items.data[0];
  const price = item?.price;
  const periodEnd = fimDoCiclo(sub);
  const { error } = await admin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    status: sub.status,
    price_id: price?.id ?? null,
    plan: planForPrice(price?.id),
    // O CUPOM E O GCLID SÓ ENTRAM QUANDO EXISTEM (02/10/2026), e a diferença
    // entre isto e o que havia aqui é apagar ou não apagar dado de venda.
    //
    // O QUE ESTAVA ESCRITO: `cupom: ... ? sub.metadata.cupom : null`. Ou seja,
    // metadata sem cupom gravava NULL por cima do que já estava na linha. Este
    // upsert roda a cada webhook, inclusive na renovação, então qualquer valor
    // que não viesse da metadata era apagado no evento seguinte.
    //
    // O QA pegou o sintoma em 01/10, de passagem: as três assinaturas têm
    // `cupom` nulo, e o diário de 02/09 registra os três códigos preenchidos à
    // mão a partir do Stripe. A conclusão dele: preenchimento retroativo em
    // coluna que um upsert idempotente governa não sobrevive ao próximo
    // webhook. Certa, e o conserto não é parar de preencher à mão: é o upsert
    // deixar de afirmar ausência quando o que ele tem é desconhecimento.
    //
    // O `gclid` é a parte que dói mais, porque é a chave da devolução da
    // conversão ao Google Ads: apagado, a campanha otimiza no escuro.
    //
    // Chave omitida em `upsert` não é tocada no UPDATE do conflito, e no INSERT
    // entra como o padrão da coluna. É exatamente o que se quer: quem sabe
    // escreve, quem não sabe cala.
    ...(typeof sub.metadata?.cupom === "string" && sub.metadata.cupom ? { cupom: sub.metadata.cupom } : {}),
    ...(typeof sub.metadata?.gclid === "string" && sub.metadata.gclid ? { gclid: sub.metadata.gclid } : {}),
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    throw new Error(`assinatura de ${userId} não foi gravada: ${error.message}`);
  }
}
