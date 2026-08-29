import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { chaveDadosOk, negada } from "@/lib/chaveDados";

export const runtime = "nodejs";
// Teto de duracao: funcao pendurada segura memoria provisionada (e cota).
export const maxDuration = 10;

// Funil da operação (tabela public.funil_eventos — ver supabase/funil_eventos.sql).
//
// POST: grava eventos de COMPORTAMENTO vindos do app. A lista é fechada de
// propósito: os eventos financeiros (assinou/renovou/cancelou/expirou) só
// nascem nos webhooks do RevenueCat e do Stripe, confirmados pela loja —
// nenhum fetch fabrica conversão.
//
// GET: agregados sem PII (a visão semanal + o retrato das assinaturas), a
// fonte dos relatórios dos agentes e de qualquer painel.
const EVENTOS_DO_APP = new Set([
  "abriu_app", "cadastro", "viu_paywall", "iniciou_checkout",
  // Primeira ação de valor: é o que separa "criou conta" de "experimentou
  // de verdade" (ativação real na skill de análise).
  "abriu_trilha", "cadastrou_carro",
  // Desfecho da inicialização do SDK de atribuição (ok | sem-plugin | erro na
  // origem). É o único evento técnico da lista: sem ele, o SDK falhando em
  // silêncio é indistinguível do SDK funcionando. Ver lib/app/atribuicao.ts.
  "atribuicao",
]);
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

  // Testes A/B em curso no aparelho (carimbo dos experimentos): no máximo 6
  // pares, chaves e valores curtos. É o que permite ler conversão por
  // variante sem tabela nova (view experimentos_resultados).
  let exp: Record<string, string> | null = null;
  if (b?.exp && typeof b.exp === "object" && !Array.isArray(b.exp)) {
    const bruto = b.exp as Record<string, unknown>;
    const limpo: Record<string, string> = {};
    for (const k of Object.keys(bruto).slice(0, 6)) {
      const chave = k.trim().slice(0, 32);
      const val = corta(bruto[k], 16);
      if (chave && val) limpo[chave] = val;
    }
    if (Object.keys(limpo).length) exp = limpo;
  }

  const extra = utm || exp ? { ...(utm ? { utm } : {}), ...(exp ? { exp } : {}) } : null;

  const { error } = await admin.from("funil_eventos").insert({
    evento,
    anon_id: corta(b?.anonId, 64),
    user_id: userId,
    plataforma: corta(b?.plataforma, 16),
    versao: corta(b?.versao, 16),
    origem: corta(b?.origem, 32),
    extra,
  });
  // O erro do insert era descartado e a rota respondia ok do mesmo jeito. Um
  // evento recusado pelo banco (a restrição `evento in (...)` é o caso real:
  // a lista daqui e a de lá são mantidas à mão em arquivos diferentes) some
  // sem deixar rastro, e a etapa fica em zero parecendo comportamento das
  // pessoas. O cliente é fire-and-forget e ignora a resposta, então isto não
  // muda nada para quem usa o app: serve para a falha aparecer no log.
  if (error) {
    console.error("[funil] insert recusado", { evento, motivo: error.message });
    return NextResponse.json({ error: "insert_falhou" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  if (!chaveDadosOk(req)) return negada();
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
