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
    // Guardar o cliente do Stripe não é enfeite: é ele que amarra esta conta ao
    // cadastro de lá. Se esta linha se perde em silêncio, a próxima compra da
    // MESMA pessoa cria um cliente novo no Stripe, e aí a mesma pessoa passa a
    // ter duas fichas, dois históricos de cobrança e um /api/stripe/sync que lê
    // a ficha errada. Falhar aqui é melhor que seguir: nada foi cobrado ainda.
    const { error } = await admin.from("subscriptions").upsert({ user_id: user.id, stripe_customer_id: customerId });
    if (error) {
      console.error("[checkout] cliente do Stripe não gravado:", error.message);
      return NextResponse.json({ error: "cliente_nao_gravado" }, { status: 500 });
    }
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

  // Cupom vindo do link de venda (/app?assinar=...&cupom=PREMIUM30): o código
  // é o mesmo que a pessoa digitaria, então resolvê-lo aqui não abre nada que
  // o campo de digitar já não abrisse. Código inexistente ou inativo cai no
  // campo de digitar, e a compra segue; a oferta de saída, quando existe, tem
  // prioridade porque ela é uma negociação já em andamento no app.
  const cupomCode = typeof body?.cupom === "string" ? body.cupom.trim().toUpperCase() : "";
  let cupomPromo: string | null = null;
  if (!exitCoupon && /^[A-Z0-9-]{3,30}$/.test(cupomCode)) {
    try {
      const found = await stripe.promotionCodes.list({ code: cupomCode, active: true, limit: 1 });
      cupomPromo = found.data[0]?.id ?? null;
    } catch { cupomPromo = null; }
  }

  // O CÓDIGO DO CUPOM VIAJA COM A ASSINATURA, e não só com a sessão.
  //
  // Em 02/09/2026 o dono perguntou quantas vendas vieram com cupom e a
  // resposta não existia do nosso lado: nem o funil nem `subscriptions`
  // guardavam o código, só o Stripe sabia. Depender do Stripe para uma
  // pergunta de rotina é não ter a resposta na maioria dos dias.
  //
  // A metadata da ASSINATURA é o lugar certo porque ela sobrevive: o
  // `upsertSubscription` já lê esse objeto em toda porta (webhook, sync,
  // cancelar, reativar), então o código chega ao nosso banco sem uma chamada
  // nova. Guardamos o código, não o id do desconto, porque o código é o que
  // aparece no link de venda e é por ele que a pergunta é feita.
  //
  // Fica NULO quando a pessoa digitou o código na tela do Stripe em vez de vir
  // pelo link, e isso é honesto: aqui só sabemos o que nós aplicamos.
  const cupomDaVenda = exitCoupon ?? (cupomPromo ? cupomCode : null);

  // O ID DO CLIQUE DO GOOGLE VIAJA COM A ASSINATURA.
  //
  // Ele chega do aparelho (lib/app/campanha.ts guarda na chegada) e vai para a
  // metadata, pelo mesmo caminho do cupom: o `upsertSubscription` já lê esse
  // objeto em toda porta, então o valor chega ao nosso banco sem chamada nova.
  //
  // É o elo que faltava para o Google saber que um clique virou VENDA. Hoje ele
  // só enxerga o toque no botão de download, que é a conversão configurada na
  // tag, e o lance automático persegue o que enxerga. Ver a coluna `gclid` em
  // supabase e a proposta em docs/agentes/propostas/agente-de-midia-paga.md.
  const gclid = typeof body?.gclid === "string" && /^[\w.-]{10,200}$/.test(body.gclid) ? body.gclid : null;

  const criarSessao = (desconto: { coupon: string } | { promotion_code: string } | null) => stripe.checkout.sessions.create({
    mode: "subscription",
    ui_mode: "embedded", // formulário embutido no app
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: {
      // O cupom entra só quando o desconto de fato foi aplicado nesta sessão:
      // a segunda tentativa (sem desconto) não pode carimbar uma venda como
      // "veio com cupom" quando o Stripe recusou o cupom.
      metadata: {
        user_id: user.id,
        ...(desconto && cupomDaVenda ? { cupom: cupomDaVenda } : {}),
        ...(gclid ? { gclid } : {}),
      },
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
    // Ofertas de saída e cupom do link entram por `discounts`, e o Stripe não
    // deixa combinar os dois: ou o cupom já aplicado, ou o campo para digitar.
    ...(desconto ? { discounts: [desconto] } : { allow_promotion_codes: true }),
    locale: "pt-BR",
    return_url: `${origin}/app?checkout=success`,
  });

  let session;
  try {
    session = await criarSessao(
      exitCoupon ? { coupon: exitCoupon } : cupomPromo ? { promotion_code: cupomPromo } : null
    );
  } catch (e) {
    // O cupom do link pode ser recusado pelo Stripe mesmo existindo: os cupons
    // de convite nascem presos ao produto (applies_to), então PREMIUM1MES no
    // plano anual é erro na criação da sessão. A compra não pode morrer por
    // causa do desconto: refaz sem ele, com o campo de digitar aberto.
    if (!cupomPromo) throw e;
    session = await criarSessao(null);
  }

  return NextResponse.json({ clientSecret: session.client_secret });
}
