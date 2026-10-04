import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Voto numa resposta da Biela.
//
// O 👍 já servia para armar o pedido de nota; aqui os dois viram registro, e o
// 👎 vira o material para a Biela melhorar. Guardamos o PAR pergunta+resposta,
// e não a conversa inteira: o par é o que a pessoa julgou ao tocar no polegar.
// Desde que a Biela passou a receber os três últimos turnos, o par pode ter
// dependido do que veio antes — se um 👎 não fizer sentido isolado, é aí que
// está o motivo.
//
// Escreve com a chave de serviço de propósito: assim o aplicativo nunca toca na
// tabela, e ela pode ficar sem política nenhuma de RLS. Ver supabase/biela_votos.sql.

type Body = {
  // Com `id`, o pedido COMPLETA uma linha já gravada (motivo, comentário ou o
  // voto desfeito), em vez de abrir outra. Existe desde a 3.0 (04/10/2026),
  // quando o 👎 passou a ser gravado no toque e o motivo a chegar depois.
  id?: string;
  voto?: string;
  motivo?: string;
  comentario?: string;
  pergunta?: string;
  resposta?: string;
  carro?: string;
  comManual?: boolean;
  modo?: string;
  locale?: string;
  plataforma?: string;
  versao?: string;
  aparelho?: string;
};

const MOTIVOS = new Set(["errada", "incompleta", "confusa"]);

// Teto por campo. Não é economia de disco: é o limite entre "uma pergunta" e
// alguém colando um arquivo inteiro no campo de texto.
const corta = (v: unknown, max: number): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
};

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  const voto = body.voto === "up" || body.voto === "down" ? body.voto : null;

  const admin = getSupabaseAdmin();
  if (!admin) {
    // Sem banco o app não pode quebrar por causa de um voto: quem tocou no
    // polegar já seguiu a vida, e uma tela de erro aqui só atrapalharia.
    console.warn("[biela-voto] Supabase não configurado — voto descartado");
    return NextResponse.json({ ok: true, guardado: false });
  }

  // COMPLETAR uma linha existente. Só os três campos que a pessoa pode mudar
  // depois do toque; pergunta, resposta e aparelho ficam como foram gravados.
  const id = typeof body.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null;
  if (id) {
    const campos: Record<string, unknown> = {};
    if (voto) campos.voto = voto;
    if (body.motivo !== undefined) campos.motivo = voto !== "up" && MOTIVOS.has(body.motivo ?? "") ? body.motivo : null;
    if (body.comentario !== undefined) campos.comentario = corta(body.comentario, 1000);
    if (Object.keys(campos).length === 0) {
      return NextResponse.json({ ok: false, error: "nada_a_completar" }, { status: 422 });
    }
    const { error } = await admin.from("biela_votos").update(campos).eq("id", id);
    if (error) {
      console.error("[biela-voto] update falhou:", error.message);
      return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
    }
    console.log(`[biela-voto] completado ${id}: ${Object.keys(campos).join(",")}`);
    return NextResponse.json({ ok: true, guardado: true, id });
  }

  const pergunta = corta(body.pergunta, 2000);
  const resposta = corta(body.resposta, 8000);
  if (!voto || !pergunta || !resposta) {
    return NextResponse.json({ ok: false, error: "campos_obrigatorios" }, { status: 422 });
  }

  const { data, error } = await admin.from("biela_votos").insert({
    voto,
    motivo: voto === "down" && MOTIVOS.has(body.motivo ?? "") ? body.motivo : null,
    comentario: corta(body.comentario, 1000),
    pergunta,
    resposta,
    carro: corta(body.carro, 120),
    com_manual: typeof body.comManual === "boolean" ? body.comManual : null,
    modo: corta(body.modo, 20),
    locale: corta(body.locale, 5),
    plataforma: corta(body.plataforma, 20),
    versao: corta(body.versao, 20),
    aparelho: corta(body.aparelho, 80),
  }).select("id").single();

  if (error) {
    console.error("[biela-voto] insert falhou:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 502 });
  }
  // Mesmo motivo do /api/feedback: sem registro no caminho feliz, não há como
  // separar "gravou" de "a requisição nunca chegou".
  console.log(`[biela-voto] gravado: ${voto}${body.motivo ? ` (${body.motivo})` : ""}`);
  // O id volta para a tela completar a linha com o motivo, se ele vier.
  return NextResponse.json({ ok: true, guardado: true, id: data?.id ?? null });
}
