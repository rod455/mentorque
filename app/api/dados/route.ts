import { NextResponse } from "next/server";
import { coletarDadosOperacao } from "@/lib/operacao";
import { chaveDadosOk, negada } from "@/lib/chaveDados";

export const runtime = "nodejs";
// Teto de duracao: funcao pendurada segura memoria provisionada (e cota).
// Era 15 e a rota estourou nas manhãs de 12, 13 e 14/09/2026 (num dia normal
// ela leva uns 8 segundos): o Analista gravou três retratos com zeros e o
// Vigia ficou cego. 60 dá folga para a manhã lenta; os tempos por consulta
// vão no JSON (`tempos`) e no log quando passam de 5 segundos.
export const maxDuration = 60;

// O retrato diário da operação, consolidado numa rota só. É a matéria-prima
// do Analista de Dados (n8n). TRANCADA pela chave dos dados: agregados de
// negócio não ficam abertos para qualquer pessoa.
export async function GET(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const dados = await coletarDadosOperacao();
  if (!dados) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  return NextResponse.json(dados);
}
