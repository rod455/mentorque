import { APP_ORIGIN } from "./wrapper";

// Base das rotas de API.
//
// Na web o app e as rotas moram na mesma origem, então caminho relativo basta.
// Já no app da loja o HTML vem de dentro do binário (capacitor://localhost), e
// um fetch("/api/...") bateria nos arquivos empacotados em vez do servidor.
// Por isso, no nativo, toda chamada de API vira absoluta para produção.
//
// NEXT_PUBLIC_SITE_URL permite apontar um build para outro ambiente (staging)
// sem tocar no código.
// Endereço do site SEM redirecionamento.
//
// `mentorque.com.br` responde 308 apontando para `www.mentorque.com.br`. Numa
// navegação isso é invisível — o iframe do vídeo sempre funcionou. Já num
// `fetch` entre origens, o navegador se recusa a seguir um redirecionamento
// que troca de origem e devolve "Load failed", sem nunca chamar a rota. Era o
// que matava a Biela: o erro não estava no servidor nem no CORS, estava no
// salto de domínio antes de chegar lá.
//
// Normalizado aqui para o app funcionar mesmo com a variável de ambiente
// apontando para o domínio sem www.
function semRedirecionamento(base: string): string {
  return base.replace(/\/+$/, "").replace(/^(https?:\/\/)mentorque\.com\.br/i, "$1www.mentorque.com.br");
}

const REMOTE = semRedirecionamento(process.env.NEXT_PUBLIC_SITE_URL || APP_ORIGIN);

/** Origem do site já normalizada — use para iframes e links absolutos. */
export function siteOrigin(): string {
  return REMOTE;
}

function isNative(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { Capacitor?: unknown };
  // Também cobre o caso de o HTML ter sido aberto de dentro do pacote sem o
  // Capacitor ter injetado o global ainda.
  return !!w.Capacitor || window.location.protocol === "capacitor:" || window.location.protocol === "file:";
}

/** Caminho de API pronto para uso — relativo na web, absoluto no app nativo. */
export function apiUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return isNative() ? `${REMOTE}${path}` : path;
}

/**
 * POST de JSON que não dispara verificação prévia (preflight) no app.
 *
 * `content-type: application/json` numa requisição para outra origem obriga o
 * navegador a mandar antes um OPTIONS e só seguir se a resposta agradar. Nos
 * registros do servidor, as chamadas do iPhone não chegavam NEM como OPTIONS —
 * morriam dentro da WebView, mesmo com o servidor liberando qualquer origem.
 *
 * `text/plain` está na lista curta de tipos que dispensam a verificação: a
 * requisição vira "simples" e sai direto. O corpo continua sendo JSON e o
 * servidor continua lendo com `request.json()`, que não olha o cabeçalho.
 *
 * Na web nada muda — lá é mesma origem e o tipo correto é melhor.
 */
export function apiPost(path: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return fetch(apiUrl(path), {
    method: "POST",
    headers: {
      "content-type": isNative() ? "text/plain;charset=UTF-8" : "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
