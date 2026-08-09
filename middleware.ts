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
// Lista fechada em vez de `*`: são exatamente as origens que o Capacitor usa,
// mais o próprio site. Nenhuma rota depende de cookie (a autenticação é por
// cabeçalho Authorization), então não há credencial viajando por aqui.
const PERMITIDAS = new Set([
  "capacitor://localhost", // iOS — `iosScheme` do capacitor.config.ts
  "ionic://localhost",     // iOS, esquema antigo
  "https://localhost",     // Android — `androidScheme`
  "http://localhost",
  "http://localhost:3000", // desenvolvimento
  "https://mentorque.com.br",
  "https://www.mentorque.com.br",
]);

function cabecalhos(origem: string | null): Headers {
  const h = new Headers();
  if (!origem || !PERMITIDAS.has(origem)) return h;
  h.set("Access-Control-Allow-Origin", origem);
  // Sem isto, um cache guardaria a resposta de uma origem e serviria para
  // outra.
  h.set("Vary", "Origin");
  h.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  h.set("Access-Control-Allow-Headers", "authorization, content-type");
  h.set("Access-Control-Max-Age", "86400");
  return h;
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
