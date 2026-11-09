import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { cabemAinda, creditosRestantes, passeValendo } from "@/lib/avulsa/direito";
import { adotarCompras, anonSeguro, avulsaPronta, gravarCompra, lerSaldo } from "@/lib/avulsa/servidor";
import { LIMITE_GRATIS_POR_MES, mesDe } from "@/lib/biela/limite";
import { eventoDeFunil } from "@/lib/funilServidor";

// A volta do checkout avulso, e o saldo (09/11/2026).
//
// O app chama isto ao reabrir pelo `mentorque://compra?sessao=...` e também
// quando volta para a frente com uma sessão pendente guardada, porque quem
// paga e fecha o navegador não passa pela página de volta. O webhook do Stripe
// grava a mesma compra pelo outro lado; o id da sessão é único, então os dois
// caminhos nunca contam a compra duas vezes.
//
// Sem `sessao`, devolve só o saldo: é como a tela da Biela sabe, ao abrir,
// quantas perguntas ainda cabem.

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  if (!(await avulsaPronta(admin))) return NextResponse.json({ ok: true, ligada: false });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  let userId: string | null = null;
  if (bearer) {
    const { data } = await admin.auth.getUser(bearer).catch(() => ({ data: { user: null } }));
    userId = data?.user?.id ?? null;
  }
  const anonId = anonSeguro(typeof body.anonId === "string" ? body.anonId : null);
  if (!userId && !anonId) return NextResponse.json({ error: "sem_identidade" }, { status: 400 });

  let compra: "gravou" | "ja_existia" | "recusou" | "pendente" | null = null;
  const sessao = typeof body.sessao === "string" && /^cs_[A-Za-z0-9_]{8,200}$/.test(body.sessao) ? body.sessao : null;
  if (sessao) {
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: "not_configured" }, { status: 501 });
    try {
      const s = await stripe.checkout.sessions.retrieve(sessao);
      // A sessão tem de ser DESTA pessoa: sem isto, quem soubesse o id de uma
      // sessão alheia veria o saldo dela, e nada mais (a compra é gravada com o
      // dono que foi para o Stripe, não com quem pergunta).
      const dono = s.metadata?.user_id ?? null;
      const aparelho = s.metadata?.anon_id ?? null;
      const daPessoa = (!!userId && dono === userId) || (!!anonId && aparelho === anonId);
      if (!daPessoa) compra = "recusou";
      else if (s.payment_status !== "paid") compra = "pendente";
      else {
        compra = await gravarCompra(admin, s);
        if (compra === "gravou") {
          await eventoDeFunil(admin, "comprou_avulsa", {
            userId: dono,
            anonId: aparelho,
            origem: s.metadata?.produto ?? "avulsa",
            plataforma: s.metadata?.plataforma || undefined,
            extra: { sessao: s.id, pagoCentavos: s.amount_total ?? null, por: "confirmacao" },
          });
        }
      }
    } catch (e) {
      console.error("[avulsa] confirmação falhou", { sessao, motivo: e instanceof Error ? e.message : String(e) });
      return NextResponse.json({ error: "confirmacao_falhou" }, { status: 502 });
    }
  }

  await adotarCompras(admin, userId, anonId);
  const saldo = await lerSaldo(admin, userId, anonId);

  let premium = false;
  if (userId) {
    const { data: sub } = await admin.from("subscriptions").select("status").eq("user_id", userId).maybeSingle();
    premium = sub?.status === "active" || sub?.status === "trialing";
  }
  const q = admin.from("biela_perguntas").select("id", { count: "exact", head: true }).eq("mes", mesDe()).eq("premium", false).is("pago_com", null);
  const { count } = userId ? await q.eq("user_id", userId) : await q.eq("anon_id", anonId!);
  const agora = new Date();
  const contexto = { premium, gratisFeitasNoMes: count ?? 0, limiteGratis: LIMITE_GRATIS_POR_MES, saldo, agora };

  return NextResponse.json({
    ok: true,
    ligada: true,
    compra,
    restantes: cabemAinda(contexto),
    creditos: creditosRestantes(saldo),
    passeAte: passeValendo(saldo, agora) ? saldo.passeAte!.toISOString() : null,
  });
}
