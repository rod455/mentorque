import { NextResponse } from "next/server";
import { getStripe, priceFor } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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
  // O id salvo pode ser de outra conta/modo do Stripe (ex.: dados do modo de
  // teste após ir pro live). Valida antes de usar; inválido → recria.
  if (customerId) {
    try {
      const cust = await stripe.customers.retrieve(customerId);
      if ((cust as { deleted?: boolean }).deleted) customerId = undefined;
    } catch {
      customerId = undefined;
    }
  }
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email ?? undefined, metadata: { user_id: user.id } });
    customerId = customer.id;
    await admin.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customerId });
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://mentorque.com.br";
  // Teste grátis: 3 dias SÓ quando o cliente declara iOS nativo (app da
  // Apple); web (inclusive Safari/iPhone) e Android ganham 7. Não usamos o
  // user-agent — Safari no iPhone é web e leva 7.
  const iosDays = Number(process.env.STRIPE_TRIAL_DAYS_IOS ?? 3);
  const otherDays = Number(process.env.STRIPE_TRIAL_DAYS ?? 7);
  const trialDays = body?.platform === "ios" ? iosDays : otherDays; // 0 = sem teste grátis
  // Ofertas de saída do paywall: aplicam o cupom direto (o Stripe não permite
  // combinar `discounts` com `allow_promotion_codes`).
  const exitCoupon =
    body?.offer === "exit10"
      ? process.env.STRIPE_EXIT_COUPON || "EXIT10"
      : body?.offer === "exit25"
        ? process.env.STRIPE_EXIT25_COUPON || "EXIT25"
        : null;
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
    // Cartão SEMPRE exigido, mesmo quando a primeira fatura sai zerada.
    //
    // É o padrão do Stripe hoje, e está escrito aqui de propósito: com um cupom
    // de 100% ou um teste grátis, `if_required` deixaria a pessoa assinar sem
    // meio de pagamento — e quando o desconto acabasse a cobrança falharia,
    // cancelando a assinatura de quem achava que estava tudo certo. Explícito,
    // ninguém troca sem perceber o que está trocando.
    payment_method_collection: "always",
    // Campo de código promocional nos DOIS planos.
    //
    // Antes só existia no mensal, e o motivo era real: os cupons de convite de
    // 100% não tinham restrição de produto, então um código feito para valer
    // R$ 29,90 valeria R$ 239,90 se digitado no anual. Sem o campo não havia
    // onde digitar, e essa ausência era a única proteção de pé.
    //
    // Em 25/08/2026, por decisão do dono de ter convite dos dois lados, os
    // cupons foram RECRIADOS presos ao seu produto (`applies_to.products`):
    //   mensal  prod_V5FXz22xLMjrWp   MENSAL-LANCAMENTO100, MENSAL-ALESSANDRO100
    //   anual   prod_V5FXazQcVcz4zm   ANUAL-LANCAMENTO30
    // Agora quem recusa um código fora do lugar é o próprio Stripe, então o
    // campo pode existir nos dois sem dar desconto de ano em preço de mês.
    //
    // ARMADILHA para quem criar cupom novo: `applies_to` só pode ser definido na
    // CRIAÇÃO. O Stripe não deixa alterar depois e NÃO devolve esse campo ao ler
    // o cupom, então não dá para conferir olhando. Cupom de convite nasce
    // restrito ou nasce errado, e o conserto é recriar.
    //
    // Ofertas de saída entram por `discounts`, e o Stripe não deixa combinar os
    // dois: ou o cupom já aplicado, ou o campo para digitar um.
    ...(exitCoupon ? { discounts: [{ coupon: exitCoupon }] } : { allow_promotion_codes: true }),
    locale: "pt-BR",
    return_url: `${origin}/app?checkout=success`,
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
