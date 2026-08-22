import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Funil da operação (tabela public.funil_eventos — ver supabase/funil_eventos.sql).
//
// POST: grava eventos de COMPORTAMENTO vindos do app. A lista é fechada de
// propósito: os eventos financeiros (assinou/renovou/cancelou/expirou) só
// nascem nos webhooks do RevenueCat e do Stripe, confirmados pela loja —
// nenhum fetch fabrica conversão.
//
// GET: agregados sem PII (a visão semanal + o retrato das assinaturas), a
// fonte dos relatórios dos agentes e de qualquer painel.
const EVENTOS_DO_APP = new Set(["abriu_app", "cadastro", "viu_paywall", "iniciou_checkout"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const corta = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let b: Record<string, unknown> | undefined;
  try { b = (await req.json()) as Record<string, unknown>; } catch { /* abaixo */ }
  const evento = typeof b?.evento === "string" ? b.evento : "";
  if (!EVENTOS_DO_APP.has(evento)) return NextResponse.json({ error: "evento_invalido" }, { status: 400 });

  const userId = typeof b?.userId === "string" && UUID_RE.test(b.userId) ? b.userId : null;

  // UTM da campanha (guardada pela LP no aparelho): só as chaves conhecidas,
  // cortadas. É o que liga anúncio a cadastro e a assinatura.
  let utm: Record<string, string> | null = null;
  if (b?.utm && typeof b.utm === "object") {
    const bruto = b.utm as Record<string, unknown>;
    const limpo: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "v", "em"]) {
      const val = corta(bruto[k], 80);
      if (val) limpo[k] = val;
    }
    if (Object.keys(limpo).length) utm = limpo;
  }

  await admin.from("funil_eventos").insert({
    evento,
    anon_id: corta(b?.anonId, 64),
    user_id: userId,
    plataforma: corta(b?.plataforma, 16),
    versao: corta(b?.versao, 16),
    origem: corta(b?.origem, 32),
    extra: utm ? { utm } : null,
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const [{ data: semanas }, { data: subs }] = await Promise.all([
    admin.from("funil_semana").select("*").limit(12),
    admin.from("subscriptions").select("status, cancel_at_period_end, plan"),
  ]);
  const ativas = (subs ?? []).filter((s) => s.status === "active");
  return NextResponse.json({
    semanas: semanas ?? [],
    assinaturas: {
      ativas: ativas.length,
      cancelando: ativas.filter((s) => s.cancel_at_period_end).length,
      anuais: ativas.filter((s) => s.plan === "annual").length,
      mensais: ativas.filter((s) => s.plan === "monthly").length,
    },
  });
}
