import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Avaliações do app nas lojas (tabela public.lojas_avaliacoes).
//
// POST: recebe o lote coletado pelo Analista de Dados (n8n) e grava sem
// duplicar (o id da avaliação na loja é a chave). A rota é pública como as
// irmãs, então corta e valida tudo; o pior que um curioso consegue é gravar
// uma avaliação falsa NESTA tabela interna, nunca na loja.
//
// GET: o resumo para o Diretor e para a curadoria de depoimentos da LP:
// totais, média, distribuição por nota e as mais recentes.
const LOJAS = new Set(["app_store", "google_play"]);
const corta = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let b: Record<string, unknown> | undefined;
  try { b = (await req.json()) as Record<string, unknown>; } catch { /* abaixo */ }
  const lote = Array.isArray(b?.avaliacoes) ? (b.avaliacoes as Record<string, unknown>[]).slice(0, 200) : [];

  const linhas = lote
    .map((a) => {
      const nota = Number(a?.nota);
      const quando = typeof a?.avaliadoEm === "string" ? Date.parse(a.avaliadoEm) : NaN;
      return {
        id: corta(a?.id, 160),
        loja: typeof a?.loja === "string" && LOJAS.has(a.loja) ? a.loja : null,
        nota: Number.isInteger(nota) && nota >= 1 && nota <= 5 ? nota : null,
        titulo: corta(a?.titulo, 200),
        texto: corta(a?.texto, 2000),
        autor: corta(a?.autor, 80),
        versao: corta(a?.versao, 16),
        avaliado_em: Number.isFinite(quando) ? new Date(quando).toISOString() : null,
      };
    })
    .filter((l): l is typeof l & { id: string; loja: string; nota: number } => !!l.id && !!l.loja && l.nota != null);

  if (linhas.length === 0) return NextResponse.json({ ok: true, gravadas: 0 });

  const { error } = await admin.from("lojas_avaliacoes").upsert(linhas, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "gravacao_falhou" }, { status: 500 });
  return NextResponse.json({ ok: true, gravadas: linhas.length });
}

export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const { data } = await admin
    .from("lojas_avaliacoes")
    .select("loja, nota, titulo, texto, autor, versao, coletado_em")
    .order("coletado_em", { ascending: false })
    .limit(500);

  const linhas = data ?? [];
  const porNota: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  const porLoja: Record<string, number> = {};
  let soma = 0;
  for (const l of linhas) {
    porNota[String(l.nota)] = (porNota[String(l.nota)] ?? 0) + 1;
    porLoja[l.loja] = (porLoja[l.loja] ?? 0) + 1;
    soma += l.nota ?? 0;
  }
  return NextResponse.json({
    total: linhas.length,
    media: linhas.length ? Math.round((soma / linhas.length) * 10) / 10 : null,
    porNota,
    porLoja,
    recentes: linhas.slice(0, 10).map((l) => ({
      loja: l.loja,
      nota: l.nota,
      titulo: l.titulo,
      texto: l.texto ? String(l.texto).slice(0, 300) : null,
      autor: l.autor,
      versao: l.versao,
    })),
  });
}
