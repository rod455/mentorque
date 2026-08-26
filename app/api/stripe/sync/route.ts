import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertSubscription } from "@/lib/subscriptionSync";
import { eventoDeFunil } from "@/lib/funilServidor";

export const runtime = "nodejs";

// Sincroniza a assinatura do usuário lendo o estado autoritativo do Stripe e
// gravando no banco. Chamado ao voltar do checkout — não depende do webhook.
//
// E é justamente por não depender do webhook que ele também grava o `assinou`
// do funil. Em 25/08 uma assinatura real, paga, entrou no banco POR AQUI, e
// `funil_eventos` ficou sem um único `assinou` porque só o webhook gravava
// esse evento. O funil dizia zero com dinheiro entrando.
//
// Isso não fere a regra de "o app não fabrica conversão": quem confirma aqui é
// o servidor, lendo a assinatura no Stripe com a chave secreta. O app só pediu
// a sincronização. Contagem dobrada com o webhook é impossível pelo índice
// `funil_eventos_assinou_unico` — um `assinou` por assinatura, no banco.
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

  // `trialing` conta como assinatura: o cartão foi dado, a cobrança está
  // agendada e a pessoa é assinante desde já. Tratar teste como "ainda não"
  // esconderia toda conversão nova por sete dias, que é o oposto do que um
  // funil serve para mostrar. Cancelamento no teste vira `cancelou` depois,
  // pelo webhook, e é lá que ele deve aparecer.
  if (sub.status === "active" || sub.status === "trialing") {
    await eventoDeFunil(admin, "assinou", {
      userId: user.id,
      origem: "stripe-sync",
      extra: { sub: sub.id },
    });
  }

  return NextResponse.json({ ok: true, status: sub.status });
}
