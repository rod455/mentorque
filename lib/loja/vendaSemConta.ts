// Venda de loja que chega sem conta: o que fazer com ela em vez de perdê-la.
//
// POR QUE ISTO EXISTE (02/10/2026). O QA achou em 30/09 que o RevenueCat saiu
// de zero para UMA assinatura ativa em 25/09 e o banco não conhece nenhuma: as
// três ativas são todas do Stripe e `funil_eventos` não tem um único evento de
// origem `revenuecat`. Se for compra de gente de verdade, a pessoa pagou e
// está sem Premium desde então, porque quem libera o acesso é a tabela do
// banco.
//
// A CAUSA PROVÁVEL ESTÁ NO NOSSO CÓDIGO, e não no painel. O onboarding do
// iPhone compra direto na última página, e fazia isso chamando
// `initPurchases(null)`: sem `appUserID`, e sem o `logIn` que só acontece
// quando o id vem preenchido. O `configured` é de módulo, então a folha da
// Apple abria com a identidade ANÔNIMA que o RevenueCat gerou no carregamento
// das ofertas, mesmo com a pessoa logada no Mentorque. O comentário que mora
// ali cuidava do caso de comprar DESLOGADO; o furo estava no caso de comprar
// logado.
//
// E O WEBHOOK PERDIA A VENDA COM UM 200. Ao receber um `app_user_id` que não é
// UUID, a rota respondia `{ ok: true, skipped: "anonymous_user" }`: o
// RevenueCat considera entregue, nunca reenvia, e não sobra uma linha em lugar
// nenhum. Era o mesmo defeito que esta casa consertou em 02/09 nos upserts,
// sobrevivendo num caminho que ninguém tinha olhado porque nunca havia
// acontecido uma venda de loja.
//
// O conserto do app precisa de build e só alcança quem atualizar. As versões
// 2.8 e anteriores seguem instaladas na maioria dos aparelhos, então a rede
// daqui continua valendo por semanas: identidade inútil deixa de sair calada e
// vira linha em `app_erros`, que o retrato publica e o dono lê de manhã.
//
// Pura de propósito: `npm run conferir:loja` abre isto no node e planta
// defeito.

/** O `app_user_id` que o RevenueCat manda é o id da conta no Supabase? */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function identidadeUsavel(appUserId: string | null | undefined): boolean {
  return UUID_RE.test(String(appUserId ?? "").trim());
}

// OS EVENTOS QUE SIGNIFICAM DINHEIRO ENTRANDO OU ACESSO VALENDO.
//
// A lista é a mesma do `ACTIVE` da rota, e é de propósito: o que define "esta
// venda se perdeu" é justamente o evento que teria ligado o Premium. Um
// `CANCELLATION` ou um `EXPIRATION` sem conta não é dinheiro na mesa, é ruído
// de uma assinatura que já não existe para nós, e alarmar sobre ele ensinaria
// a ignorar o alarme.
const COM_DINHEIRO = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
]);

export function ehVendaComDinheiro(tipo: string | null | undefined): boolean {
  return COM_DINHEIRO.has(String(tipo ?? "").toUpperCase());
}

export type EventoDaLoja = {
  id?: string;
  type?: string;
  app_user_id?: string;
  product_id?: string;
  store?: string;
};

export type RelatoDeVenda = {
  tipo: string;
  origem: string;
  mensagem: string;
  plataforma: string;
};

/** A origem que marca a linha em `app_erros`. O retrato conta por ela. */
export const ORIGEM_VENDA_SEM_CONTA = "revenuecat-sem-conta";

/**
 * A linha que fica no lugar da venda perdida.
 *
 * Leva o id do EVENTO e o `app_user_id` anônimo porque são eles que permitem
 * achar a compra no painel do RevenueCat e ligar o Premium na mão. Relato sem
 * a chave de busca é relato que só serve para saber que doeu.
 *
 * Não leva nome, e-mail nem nada de pessoa: o RevenueCat não manda isso neste
 * corpo, e o que ele manda é um identificador de compra, que é exatamente o
 * necessário para recuperar o dinheiro de alguém.
 */
export function relatoDeVendaSemConta(e: EventoDaLoja): RelatoDeVenda {
  const loja = String(e.store ?? "").toUpperCase();
  return {
    tipo: "venda",
    origem: ORIGEM_VENDA_SEM_CONTA,
    mensagem:
      `venda de loja sem conta: ${String(e.type ?? "?").toUpperCase()} de ${e.product_id ?? "produto ?"}` +
      ` para app_user_id ${String(e.app_user_id ?? "?").slice(0, 60)}` +
      ` (evento ${e.id ?? "?"}). Alguem pagou e NAO recebeu Premium: ligar na mao pelo painel do RevenueCat.`,
    plataforma: loja === "PLAY_STORE" ? "android" : loja === "APP_STORE" ? "ios" : "loja",
  };
}

/**
 * A frase do retrato sobre vendas de loja perdidas.
 *
 * Qualquer número acima de zero é incidente, e por isso não há limiar aqui:
 * diferente de erro de app, onde a régua é razão (lib/alarmeDeErros.ts), uma
 * venda perdida não tem denominador que a torne aceitável.
 */
export function linhaDeVendaSemConta(total: number): { texto: string; legivel: boolean; motivo: string } {
  if (total <= 0) {
    return {
      texto: "Vendas de loja sem conta (30d): nenhuma. Toda compra da Apple ou da Play chegou com conta e virou Premium",
      legivel: true,
      motivo: "",
    };
  }
  return {
    texto:
      `VENDAS DE LOJA PERDIDAS (30d): ${total}. Alguem pagou na Apple ou na Play e NAO recebeu Premium,` +
      ` porque a compra chegou com identidade anonima. Os relatos estao em app_erros com origem` +
      ` ${ORIGEM_VENDA_SEM_CONTA} e trazem o app_user_id para ligar na mao no painel do RevenueCat`,
    legivel: true,
    motivo: "",
  };
}
