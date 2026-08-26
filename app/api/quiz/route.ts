import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
// Teto de duracao: funcao pendurada segura memoria provisionada (e cota).
export const maxDuration = 10;

// Quiz diário (tabela public.quiz_respostas — ver supabase/quiz_respostas.sql).
//
// POST: grava a resposta do dia. GET: devolve quantas pessoas responderam e
// quantos por cento acertaram.
//
// POR QUE ESTA ROTA NÃO TEM CHAVE, ao contrário das de funil, métricas e uso:
// aquelas devolvem dados da OPERAÇÃO (receita, conversão, custo) e ficam
// trancadas atrás de DADOS_CHAVE. Esta devolve dois números que o próprio app
// mostra na tela para qualquer pessoa que responder o quiz. Trancá-la seria
// esconder do app o que ele existe para exibir, e embutir a chave no app é o
// mesmo que publicá-la.
//
// O que ela NÃO faz, e é o que a mantém segura: não devolve resposta de
// ninguém, não aceita consulta por pessoa, e não diz quem respondeu. Dois
// inteiros por dia e por pergunta, e nada mais.

/**
 * De quantas respostas em diante a porcentagem aparece.
 *
 * Abaixo disso o app não mostra nada, e isso é proposital em dois sentidos.
 * Estatística de 3 pessoas não é informação, é ruído com cara de número. E
 * com 1 ou 2 respostas a porcentagem VAZA a resposta alheia: "0% acertaram"
 * com duas pessoas conta exatamente o que a outra respondeu.
 *
 * Vinte é onde a frase começa a dizer algo verdadeiro. Enquanto o app for
 * novo, ela simplesmente não aparece — melhor calar do que publicar um número
 * que não significa nada.
 */
const MINIMO_PARA_MOSTRAR = 20;

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const corta = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req: Request) {
  // A validação vem ANTES de olhar o banco de propósito: pedido malformado é
  // 400 doa a quem doer, e não um 501 que culpa a configuração do servidor
  // por um erro do cliente. Também é o que permite conferir a rota inteira
  // numa máquina sem as chaves de produção.
  let b: Record<string, unknown> | undefined;
  try { b = (await req.json()) as Record<string, unknown>; } catch { /* abaixo */ }

  const dia = corta(b?.dia, 10);
  const perguntaId = corta(b?.perguntaId, 64);
  const anonId = corta(b?.anonId, 64);
  if (!dia || !DIA_RE.test(dia) || !perguntaId || !anonId) {
    return NextResponse.json({ error: "dados_invalidos" }, { status: 400 });
  }
  if (typeof b?.acertou !== "boolean") {
    return NextResponse.json({ error: "acertou_invalido" }, { status: 400 });
  }

  // Data do aparelho: aceita ontem, hoje e amanhã pelo relógio do servidor.
  // A janela existe porque o dia é local — quem está em Tóquio já virou o dia
  // enquanto aqui é ontem — e o teto existe porque relógio adiantado (de
  // propósito ou não) não pode encher o dia de amanhã antes de ele chegar.
  const hojeUTC = new Date();
  const limite = (n: number) => new Date(hojeUTC.getTime() + n * 86400000).toISOString().slice(0, 10);
  if (dia < limite(-1) || dia > limite(1)) {
    return NextResponse.json({ error: "dia_fora_da_janela" }, { status: 400 });
  }

  const userId = typeof b?.userId === "string" && UUID_RE.test(b.userId) ? b.userId : null;

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  // Conflito é sucesso, não erro: a pessoa já respondeu hoje. O app pode
  // reenviar por toque duplo, por reinstalação ou por dois aparelhos, e nada
  // disso deve virar duas linhas nem uma tela de erro.
  const { error } = await admin
    .from("quiz_respostas")
    .insert({ dia, pergunta_id: perguntaId, acertou: b.acertou, anon_id: anonId, user_id: userId });
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "falhou" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, repetida: error?.code === "23505" });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dia = corta(url.searchParams.get("dia"), 10);
  const perguntaId = corta(url.searchParams.get("pergunta"), 64);
  if (!dia || !DIA_RE.test(dia) || !perguntaId) {
    return NextResponse.json({ error: "dados_invalidos" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const { data, error } = await admin
    .from("quiz_dia")
    .select("respostas, acertos, pct_acerto")
    .eq("dia", dia)
    .eq("pergunta_id", perguntaId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "falhou" }, { status: 500 });

  const respostas = Number(data?.respostas ?? 0);
  const bastante = respostas >= MINIMO_PARA_MOSTRAR;
  return NextResponse.json({
    respostas,
    // null quando ainda é pouca gente: cabe ao app não inventar frase nenhuma.
    percentual: bastante ? Number(data?.pct_acerto ?? 0) : null,
    minimo: MINIMO_PARA_MOSTRAR,
  });
}
