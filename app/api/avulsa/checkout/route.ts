import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ehProdutoAvulso, PRODUTOS } from "@/lib/avulsa/direito";
import { anonSeguro, avulsaPronta } from "@/lib/avulsa/servidor";

// O checkout da compra avulsa (09/11/2026, decisão do dono de 08/11: no
// Android a compra passa pelo Stripe, fora do app, e volta para ele).
//
// NÃO EXIGE CONTA: sem Bearer, o direito fica com o aparelho (`anonId`). O
// preço mora em lib/avulsa/direito.ts e vai como `price_data`, sem produto
// pré-criado no painel do Stripe: o valor que a pessoa paga é o que o código
// diz, e não um id que alguém precisa lembrar de copiar.
//
// A volta passa pela página /compra-concluida, que reabre o app pelo
// `mentorque://compra`; o app confirma a sessão em /api/avulsa/confirmar.

export const runtime = "nodejs";

const SITE = "https://www.mentorque.com.br";

export async function POST(req: Request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  if (!stripe || !admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  if (!(await avulsaPronta(admin))) return NextResponse.json({ error: "avulsa_desligada" }, { status: 503 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const produto = body?.produto;
  if (!ehProdutoAvulso(produto)) return NextResponse.json({ error: "produto_invalido" }, { status: 400 });

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  let userId: string | null = null;
  let email: string | undefined;
  if (bearer) {
    const { data } = await admin.auth.getUser(bearer).catch(() => ({ data: { user: null } }));
    userId = data?.user?.id ?? null;
    email = data?.user?.email ?? undefined;
  }
  const anonId = anonSeguro(typeof body.anonId === "string" ? body.anonId : null);
  if (!userId && !anonId) return NextResponse.json({ error: "sem_identidade" }, { status: 400 });

  const p = PRODUTOS[produto];
  const metadata: Record<string, string> = {
    tipo: "avulsa",
    produto,
    ...(userId ? { user_id: userId } : {}),
    ...(anonId ? { anon_id: anonId } : {}),
    plataforma: typeof body.plataforma === "string" ? body.plataforma.slice(0, 16) : "",
    versao: typeof body.versao === "string" ? body.versao.slice(0, 16) : "",
  };

  const deOnde = metadata.plataforma === "android" || metadata.plataforma === "ios" ? "app" : "web";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "pt-BR",
      line_items: [{ quantity: 1, price_data: { currency: "brl", unit_amount: p.centavos, product_data: { name: p.nome } } }],
      ...(email ? { customer_email: email } : {}),
      ...(userId ? { client_reference_id: userId } : {}),
      metadata,
      payment_intent_data: { metadata },
      // `de` diz à página de volta se reabre o app ou volta para o /app da web.
      success_url: `${SITE}/compra-concluida?sessao={CHECKOUT_SESSION_ID}&de=${deOnde}`,
      cancel_url: `${SITE}/compra-concluida?cancelou=1&de=${deOnde}`,
    });
    return NextResponse.json({ ok: true, url: session.url, sessao: session.id });
  } catch (e) {
    console.error("[avulsa] checkout não criado", { motivo: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ error: "checkout_falhou" }, { status: 502 });
  }
}
