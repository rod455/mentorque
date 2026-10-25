// O painel sem a chave na URL (25/10/2026).
//
// POR QUE EXISTE. A rodada 6 da Segurança achou a `DADOS_CHAVE` viajando no
// endereço do painel (`/painel?chave=...`). Essa chave abre 12 rotas da
// operação, e cinco delas mandam e-mail para a base. O que sobrava dela era o
// histórico do navegador do dono, permanente até ele limpar.
//
// O DESENHO. A chave ainda entra pelo endereço UMA vez, porque é o único jeito
// de abrir o painel sem tela de login. O middleware confere, grava um cookie e
// redireciona para `/painel` limpo, e o histórico guarda o endereço final, sem
// a chave. Nas visitas seguintes o cookie basta.
//
// O COOKIE NÃO É A CHAVE. Ele guarda um SELO: HMAC-SHA256 da chave com um rótulo
// fixo. O selo prova que quem o tem já teve a chave, e só abre o painel: não
// passa no `chaveDadosOk` das rotas, que compara a chave em si. Cookie roubado
// abre o painel; não manda e-mail para ninguém. E girar a `DADOS_CHAVE` invalida
// todos os selos de uma vez, sem lista de sessões.
//
// Web Crypto, e não `node:crypto`, porque o middleware roda no Edge.

export const COOKIE_DO_PAINEL = "mq_painel";
const ROTULO = "mentorque-painel-v1";

/** Trinta dias: o dono abre o painel de vez em quando, não todo dia. */
export const VALIDADE_DO_SELO_S = 30 * 24 * 60 * 60;

export async function seloDoPainel(chave: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(chave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const assinatura = await crypto.subtle.sign("HMAC", k, enc.encode(ROTULO));
  return [...new Uint8Array(assinatura)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação de tempo constante para cadeias do mesmo tamanho. */
export function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/**
 * O que o middleware faz com um pedido ao `/painel`.
 *
 * Com `?chave=` CERTA: redireciona para `/painel` sem a query e grava o selo.
 * Com `?chave=` ERRADA: tira a chave do endereço do mesmo jeito (chave errada
 * também não deveria ficar no histórico) e não grava nada.
 * Sem `?chave=`: segue, e a página decide pelo cookie.
 */
export async function destinoDoPainel(
  url: URL,
  esperada: string | undefined,
): Promise<{ redirecionar: string | null; selo: string | null }> {
  const enviada = url.searchParams.get("chave");
  if (enviada === null) return { redirecionar: null, selo: null };
  const limpo = new URL(url.toString());
  limpo.searchParams.delete("chave");
  const destino = limpo.pathname + (limpo.search || "");
  if (!esperada || !iguais(enviada, esperada)) return { redirecionar: destino, selo: null };
  return { redirecionar: destino, selo: await seloDoPainel(esperada) };
}
