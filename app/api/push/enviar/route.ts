import { NextResponse } from "next/server";
import { chaveDadosOk, negada } from "@/lib/chaveDados";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { enviarPush, ROTAS_DO_TOQUE, type RotaDoToque } from "@/lib/push/transporte";

export const runtime = "nodejs";

// Envia um push de verdade, para uso INTERNO (curl do dono ou nó do n8n).
//
// Trancada pela DADOS_CHAVE como todo agregado da operação: mandar mensagem
// para o celular dos clientes é exatamente o tipo de porta que não fica
// aberta por esquecimento. E mensagem a cliente é alçada do dono, então esta
// rota só faz o que alguém com a chave pedir, um pedido por vez. O único
// chamador automático do transporte é a jornada de recorrência
// (app/api/cron/jornada), aprovada pelo dono em 12/09/2026.
//
// O transporte (FCM para Android, APNs direto para iPhone, credenciais, limpeza
// de token morto) mora em lib/push/transporte.ts.
//
// Corpo do POST:
//   { "titulo": "...", "corpo": "...", "userId": "uuid" }   um usuário
//   { "titulo": "...", "corpo": "...", "todos": true }      todo mundo
//   { ..., "rota": "quiz" }                                 abre direto no quiz
//
// A `rota` é opcional e diz onde o TOQUE abre o app. Sem ela a mensagem abre o
// app onde ele estava, que é o certo para um recado geral; com ela, o toque
// leva à tela que a mensagem prometeu. Ver lib/app/rotaPendente.ts.

export async function POST(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const body = await req.json().catch(() => ({}));
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const corpo = typeof body?.corpo === "string" ? body.corpo.trim() : "";
  if (!titulo || !corpo) return NextResponse.json({ error: "titulo_e_corpo_obrigatorios" }, { status: 400 });

  const rota: RotaDoToque | "" = typeof body?.rota === "string" && (ROTAS_DO_TOQUE as readonly string[]).includes(body.rota) ? body.rota : "";

  let alvo: { userId: string } | { todos: true };
  if (typeof body?.userId === "string" && body.userId) alvo = { userId: body.userId };
  else if (body?.todos === true) alvo = { todos: true };
  else return NextResponse.json({ error: "diga_userId_ou_todos" }, { status: 400 });

  try {
    const r = await enviarPush(admin, alvo, { titulo, corpo, rota });
    return NextResponse.json({ ok: true, enviados: r.enviados, mortos: r.mortos, semTransporte: r.semTransporte });
  } catch {
    return NextResponse.json({ error: "erro_ao_ler_tokens" }, { status: 500 });
  }
}
