"use client";

// A identidade anônima do aparelho (localStorage), compartilhada pelo funil
// e pelos experimentos A/B. Não identifica ninguém fora do app.
const CHAVE_ANON = "mq-anon-id";

/**
 * Prefixo do id de quem NÃO tem armazenamento.
 *
 * O banco conhece este prefixo: a função `public.identidade(anon_id, user_id)`
 * devolve NULL para qualquer id que comece com ele, e as views de gente param
 * de contá-lo. Se este texto mudar aqui, tem que mudar lá junto, senão volta a
 * contar aparelho sem identidade como pessoa. Ver supabase/uso_views.sql.
 */
export const SEM_ARMAZENAMENTO = "sem-armazenamento";

// O id de sessão de quem não tem armazenamento. Vive só na memória: some
// quando o app fecha, que é exatamente o que ele é.
let efemero: string | null = null;

function sorteia(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Ambiente sem crypto (WebView antiga): serve, porque este id não precisa
    // ser imprevisível, precisa ser diferente do id do aparelho do lado.
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function anonId(): string {
  try {
    let v = window.localStorage.getItem(CHAVE_ANON);
    if (!v) {
      v = sorteia();
      window.localStorage.setItem(CHAVE_ANON, v);
    }
    return v;
  } catch {
    // SEM ARMAZENAMENTO NÃO É UMA PESSOA, E TAMBÉM NÃO É "TODO MUNDO".
    //
    // Até 01/09/2026 este caminho devolvia o texto fixo "sem-armazenamento",
    // igual para todo aparelho do mundo. O estrago era duplo. No funil, todos
    // esses aparelhos viravam UM usuário só, com os eventos colados: no banco
    // havia uma linha com 20 eventos, de 23/08 a 01/09, em quatro versões
    // diferentes do app, que obviamente não era uma pessoa. E no quiz, que tem
    // índice único por (dia, anon_id), o PRIMEIRO aparelho sem armazenamento a
    // responder no dia impedia todos os outros de responder.
    //
    // Agora cada sessão sorteia o seu, mantendo o prefixo para o banco saber
    // que ali não há identidade. O evento continua sendo gravado e continua
    // contando em ABERTURAS; ele só não entra em contagem de gente. E as views
    // expõem `aberturas_sem_identidade`, para o tamanho desse ponto cego ser
    // visível em vez de sumir.
    if (!efemero) efemero = `${SEM_ARMAZENAMENTO}-${sorteia()}`;
    return efemero;
  }
}

/**
 * Este id serve para contar gente? Espelha a regra da função `identidade` do
 * banco, e existe para o app não precisar perguntar ao banco o óbvio.
 */
export function ehIdentidade(anon: string | null | undefined): boolean {
  if (!anon) return false;
  const v = anon.trim();
  if (!v) return false;
  return !v.startsWith(SEM_ARMAZENAMENTO);
}

/** Só para as conferências: esquece o id de sessão. */
export function _esqueceEfemero(): void {
  efemero = null;
}
