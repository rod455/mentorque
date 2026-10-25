// A chave que tranca os agregados da operação (funil, uso, receita, fontes).
//
// Vale para as rotas de LEITURA e para os POSTs dos coletores do n8n; os
// POSTs que nascem no app do usuário (eventos de funil, erros) ficam fora,
// porque o app precisa deles sem segredo embutido.
//
// A chave vive em dois lugares: DADOS_CHAVE (Vercel) e a credencial
// "Mentorque: chave dos dados" do n8n, que só o fluxo "Mentorque | Chave:
// chamar a operação" usa (25/10/2026). Nó do n8n que precisa de rota daqui
// chama esse fluxo; nunca escreve a chave no cabeçalho. Girar a chave é trocar
// esses dois lugares. Sem a env configurada, as rotas respondem 503: agregado
// nunca fica aberto por esquecimento.
export function chaveDadosOk(req: Request): boolean {
  const esperada = process.env.DADOS_CHAVE;
  if (!esperada) return false;
  const enviada =
    req.headers.get("x-mq-chave") ?? new URL(req.url).searchParams.get("chave");
  return enviada === esperada;
}

export function negada(): Response {
  const status = process.env.DADOS_CHAVE ? 401 : 503;
  return Response.json({ error: process.env.DADOS_CHAVE ? "chave_invalida" : "chave_nao_configurada" }, { status });
}
