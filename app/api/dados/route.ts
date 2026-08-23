import { NextResponse } from "next/server";
import { coletarDadosOperacao } from "@/lib/operacao";
import { chaveDadosOk, negada } from "@/lib/chaveDados";

export const runtime = "nodejs";

// O retrato diário da operação, consolidado numa rota só. É a matéria-prima
// do Analista de Dados (n8n). TRANCADA pela chave dos dados: agregados de
// negócio não ficam abertos para qualquer pessoa.
export async function GET(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const dados = await coletarDadosOperacao();
  if (!dados) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  return NextResponse.json(dados);
}
