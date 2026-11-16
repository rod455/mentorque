import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { completa, PESQUISA_ID, respostasValidas } from "@/lib/pesquisa/perguntas";

export const runtime = "nodejs";

// A pesquisa curta do app (16/11/2026, plano de receita). Ver
// lib/pesquisa/perguntas.ts para o porquê de cada pergunta.
//
// Escreve com a chave de serviço: a tabela fica sem política nenhuma de RLS,
// como `biela_votos` (supabase/pesquisa_respostas.sql). Valor que não está na
// lista é descartado, e a folha só grava com as quatro respostas de escolha.

const corta = (v: unknown, max: number): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  const r = respostasValidas(body.respostas);
  if (!completa(r)) return NextResponse.json({ ok: false, error: "incompleta" }, { status: 422 });

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.warn("[pesquisa] Supabase não configurado: resposta descartada");
    return NextResponse.json({ ok: true, guardado: false });
  }

  const anon = typeof body.anonId === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(body.anonId) ? body.anonId : null;
  const { error } = await admin.from("pesquisa_respostas").upsert(
    {
      pesquisa: PESQUISA_ID,
      anon_id: anon,
      sentir: r.sentir,
      gasto: r.gasto,
      seguro: r.seguro,
      preco: r.preco,
      livre: r.livre ?? null,
      plataforma: corta(body.plataforma, 20),
      versao: corta(body.versao, 20),
    },
    { onConflict: "pesquisa,anon_id", ignoreDuplicates: true },
  );
  if (error) {
    console.error("[pesquisa] insert falhou:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 502 });
  }
  console.log(`[pesquisa] gravada: sentir=${r.sentir} gasto=${r.gasto} seguro=${r.seguro} preco=${r.preco}`);
  return NextResponse.json({ ok: true, guardado: true });
}
