import { NextResponse, type NextRequest } from "next/server";

// CORS para o app das lojas.
//
// Desde que o app deixou de apontar para o site e passou a ser empacotado, a
// página não vem mais de https://mentorque.com.br: vem de dentro do binário,
// numa origem própria — `capacitor://localhost` no iPhone, `https://localhost`
// no Android. Toda chamada a /api virou, portanto, uma requisição entre
// origens diferentes.
//
// Sem os cabeçalhos abaixo o navegador embutido bloqueia tudo: o POST com
// `content-type: application/json` dispara uma verificação prévia (OPTIONS)
// que o Next responde com 405, o `fetch` estoura e o app cai no texto de
// emergência. Era o que acontecia com a Biela — a mesma resposta enlatada
// para qualquer pergunta, porque a pergunta nunca saía do aparelho. Vale para
// todas as rotas: FIPE, revisões, feedback, exclusão de conta.
//
// Libera qualquer origem, de propósito.
//
// A primeira versão tinha uma lista fechada com as origens que a documentação
// do Capacitor promete (`capacitor://localhost` e afins). Não funcionou: os
// registros da Vercel mostraram ZERO requisições em /api/biela enquanto o
// /embed, que é iframe e não passa por CORS, chegava normalmente do mesmo app
// no mesmo minuto. Ou seja, o WebView manda uma origem diferente da
// documentada — provavelmente `null`, que é o que o WebKit usa quando o
// esquema não é padrão.
//
// Adivinhar de novo custaria mais um deploy às cegas. E `*` aqui não abre nada
// que já não estivesse aberto: CORS protege as CREDENCIAIS DO NAVEGADOR do
// usuário, não o servidor. Nenhuma rota usa cookie — quem precisa de permissão
// exige `Authorization`, um token que mora no armazenamento do app e nenhum
// site de terceiro consegue ler. Qualquer pessoa já podia chamar estas rotas
// por curl; o cabeçalho nunca impediu isso.
const CABECALHOS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Max-Age": "86400",
};

// Origens conhecidas. Não servem mais para permitir — só para o registro
// abaixo não poluir o log com o tráfego normal do site.
const CONHECIDAS = new Set([
  "capacitor://localhost",
  "ionic://localhost",
  "https://localhost",
  "http://localhost",
  "http://localhost:3000",
  "https://mentorque.com.br",
  "https://www.mentorque.com.br",
]);

function cabecalhos(origem: string | null): Headers {
  // Registra a origem desconhecida uma vez por requisição: é assim que a gente
  // finalmente descobre o que o iPhone manda, sem precisar de um Mac.
  if (origem && !CONHECIDAS.has(origem)) console.log(`[cors] origem inesperada: ${origem}`);
  return new Headers(CABECALHOS);
}

export function middleware(request: NextRequest) {
  const h = cabecalhos(request.headers.get("origin"));

  // Verificação prévia: responde e encerra, sem tocar na rota.
  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: h });

  const resposta = NextResponse.next();
  h.forEach((valor, chave) => resposta.headers.set(chave, valor));
  return resposta;
}

// Só /api. As páginas são servidas normalmente — e o webhook do Stripe, que é
// servidor-para-servidor, não manda `Origin` e sai daqui intocado.
export const config = { matcher: "/api/:path*" };
