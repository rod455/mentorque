import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { chaveDadosOk, negada } from "@/lib/chaveDados";

export const runtime = "nodejs";
// Teto de duracao: funcao pendurada segura memoria provisionada (e cota).
export const maxDuration = 10;

// Erros capturados dentro do app (tabela public.app_erros — ver
// supabase/app_erros.sql).
//
// POST: grava um erro relatado pelo coletor (lib/app/erros.ts). O coletor já
// limita por sessão; aqui os campos são cortados de novo porque a rota é
// pública e não confia em ninguém.
//
// GET: agregado dos últimos 7 dias para o agente de QA: contagem por dia e
// as mensagens mais frequentes, sem nada de usuário.
const corta = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let b: Record<string, unknown> | undefined;
  try { b = (await req.json()) as Record<string, unknown>; } catch { /* abaixo */ }
  const mensagem = corta(b?.mensagem, 500);
  if (!mensagem) return NextResponse.json({ error: "sem_mensagem" }, { status: 400 });

  await admin.from("app_erros").insert({
    tipo: corta(b?.tipo, 16) ?? "erro",
    mensagem,
    stack: corta(b?.stack, 2000),
    origem: corta(b?.origem, 200),
    plataforma: corta(b?.plataforma, 16),
    versao: corta(b?.versao, 16),
  });
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin
    .from("app_erros")
    .select("criado_em, mensagem, plataforma, versao")
    .gte("criado_em", desde)
    .order("criado_em", { ascending: false })
    .limit(2000);

  const linhas = data ?? [];
  const porDia: Record<string, number> = {};
  const porMensagem: Record<string, { total: number; plataformas: Record<string, number>; versoes: Record<string, number> }> = {};
  for (const l of linhas) {
    const dia = String(l.criado_em).slice(0, 10);
    porDia[dia] = (porDia[dia] ?? 0) + 1;
    const m = String(l.mensagem).slice(0, 160);
    porMensagem[m] ??= { total: 0, plataformas: {}, versoes: {} };
    porMensagem[m].total += 1;
    const p = l.plataforma ?? "?";
    const v = l.versao ?? "?";
    porMensagem[m].plataformas[p] = (porMensagem[m].plataformas[p] ?? 0) + 1;
    porMensagem[m].versoes[v] = (porMensagem[m].versoes[v] ?? 0) + 1;
  }
  const top = Object.entries(porMensagem)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([mensagem, info]) => ({ mensagem, ...info }));

  return NextResponse.json({ total7d: linhas.length, porDia, top });
}
