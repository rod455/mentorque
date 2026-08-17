import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Voto numa resposta da Biela.
//
// O 👍 já servia para armar o pedido de nota; aqui os dois viram registro, e o
// 👎 vira o material para a Biela melhorar. Guardamos o PAR pergunta+resposta
// porque a rota da Biela responde cada pergunta isolada (manda uma mensagem só,
// sem histórico) — então o par é o contexto completo, e não um recorte dele.
//
// Escreve com a chave de serviço de propósito: assim o aplicativo nunca toca na
// tabela, e ela pode ficar sem política nenhuma de RLS. Ver supabase/biela_votos.sql.

type Body = {
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
  const pergunta = corta(body.pergunta, 2000);
  const resposta = corta(body.resposta, 8000);
  if (!voto || !pergunta || !resposta) {
    return NextResponse.json({ ok: false, error: "campos_obrigatorios" }, { status: 422 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    // Sem banco o app não pode quebrar por causa de um voto: quem tocou no
    // polegar já seguiu a vida, e uma tela de erro aqui só atrapalharia.
    console.warn("[biela-voto] Supabase não configurado — voto descartado");
    return NextResponse.json({ ok: true, guardado: false });
  }

  const { error } = await admin.from("biela_votos").insert({
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
  });

  if (error) {
    console.error("[biela-voto] insert falhou:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, guardado: true });
}
