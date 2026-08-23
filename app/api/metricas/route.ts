import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { chaveDadosOk, negada } from "@/lib/chaveDados";

export const runtime = "nodejs";
// Teto de duracao: funcao pendurada segura memoria provisionada (e cota).
export const maxDuration = 10;

// Métricas diárias das fontes externas (tabela public.metricas_diarias).
//
// POST: recebe do Analista de Dados (n8n) o pacote de UMA fonte para UM dia
// e grava por cima se já existir (chave dia + fonte). A rota é pública como
// as irmãs, então valida fonte, formato do dia e tamanho do pacote; o pior
// que um curioso consegue é sujar uma métrica interna de um dia.
//
// GET: os últimos 30 dias agrupados por fonte, para o /api/dados e para
// conferência manual.
const FONTES = new Set([
  "search_console", "stripe", "youtube", "meta_ads", "google_ads",
  "revenuecat", "vercel", "admob", "app_store_connect", "play_console",
  // Downloads reais das lojas (relatório de vendas da Apple exclui
  // TestFlight; o do Play virá do export no Cloud Storage).
  "app_store_downloads", "play_downloads",
]);
const MAX_DADOS = 20000; // bytes de JSON por pacote

// Dia local do Brasil, para a linha de "hoje" bater com o dia do Rodrigo.
const diaBrasil = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

export async function POST(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let b: Record<string, unknown> | undefined;
  try { b = (await req.json()) as Record<string, unknown>; } catch { /* abaixo */ }

  const fonte = typeof b?.fonte === "string" && FONTES.has(b.fonte) ? b.fonte : null;
  const dia = typeof b?.dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.dia) ? b.dia : diaBrasil();
  const dados = b?.dados && typeof b.dados === "object" && !Array.isArray(b.dados)
    ? (b.dados as Record<string, unknown>)
    : null;

  if (!fonte || !dados) return NextResponse.json({ error: "pacote_invalido" }, { status: 400 });
  if (JSON.stringify(dados).length > MAX_DADOS) {
    return NextResponse.json({ error: "pacote_grande" }, { status: 413 });
  }

  const { error } = await admin
    .from("metricas_diarias")
    .upsert({ dia, fonte, dados, coletado_em: new Date().toISOString() }, { onConflict: "dia,fonte" });
  if (error) return NextResponse.json({ error: "gravacao_falhou" }, { status: 500 });
  return NextResponse.json({ ok: true, dia, fonte });
}

export async function GET(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data } = await admin
    .from("metricas_diarias")
    .select("dia, fonte, dados, coletado_em")
    .gte("dia", d30)
    .order("dia", { ascending: false })
    .limit(400);

  const fontes: Record<string, { dia: string; dados: unknown }[]> = {};
  for (const l of data ?? []) {
    (fontes[l.fonte] ??= []).push({ dia: l.dia, dados: l.dados });
  }
  return NextResponse.json({ fontes });
}
