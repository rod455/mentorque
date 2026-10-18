// As opções de assinatura do Google, a parte pura (18/10/2026).
//
// Separada de purchases.ts para a conferir:venda abrir no node: aquele arquivo
// depende do wrapper nativo, e este não depende de nada.

// Opção de assinatura do Google (plano base ou oferta). O `id` de uma oferta
// vem como "planoBase:oferta" (ex.: "annual:exit10"); o `productId` é o id da
// assinatura na Play (ex.: "annual100"), que também é o "produto antigo" numa
// troca de plano — tudo mora na mesma assinatura.
export type GoogleOption = {
  id: string;
  storeProductId?: string;
  productId: string;
  isBasePlan?: boolean;
  pricingPhases?: { price?: { formatted?: string }; billingPeriod?: unknown }[];
};

export type RcPackage = {
  identifier: string;
  packageType?: string;
  product?: { priceString?: string; title?: string; identifier?: string; subscriptionOptions?: GoogleOption[] | null };
};
// Acha uma oferta do Google pelo id ("exit10", "save30") dentro de um pacote.
export function googleOffer(pkg: RcPackage | undefined, offerId: string): GoogleOption | null {
  const options = pkg?.product?.subscriptionOptions ?? [];
  return options.find((o) => o.id === offerId || o.id.endsWith(`:${offerId}`)) ?? null;
}

/**
 * A opção que o BOTÃO PRINCIPAL compra no Android (18/10/2026).
 *
 * O `purchasePackage` escolhe sozinho a opção de primeira fase mais barata, e
 * oferta "determinada pelo desenvolvedor" entra na escolha: a única venda do
 * Play (25/09) saiu pelo botão do mensal com a `save30`, a oferta de
 * retenção. Em 17/10 o console ganhou o teste `teste7` e a etiqueta
 * `rc-ignore-offer` nas ofertas de desconto, o que conserta a escolha, mas
 * deixa o preço cobrado dependendo de uma etiqueta que alguém pode esquecer na
 * próxima oferta criada. Aqui a escolha passa a ser explícita:
 *
 *   1. o teste grátis `teste7`, quando o Google o oferece a esta pessoa (ele
 *      só aparece para quem nunca teve a assinatura);
 *   2. senão, o plano cheio;
 *   3. NUNCA uma oferta de desconto (exit10, exit25, save30), que só se compra
 *      pelo caminho dela.
 *
 * Devolve null quando não há opções do Google (iPhone, ou loja que não as
 * mandou); aí quem chama usa o `purchasePackage`, como sempre.
 */
export function opcaoPrincipalDoGoogle(pkg: RcPackage | undefined): GoogleOption | null {
  const options = pkg?.product?.subscriptionOptions ?? [];
  if (options.length === 0) return null;
  const teste = googleOffer(pkg, OFERTA_DE_TESTE);
  if (teste) return teste;
  return options.find((o) => o.isBasePlan === true) ?? options.find((o) => !o.id.includes(":")) ?? null;
}

/**
 * A loja vai dar o teste grátis a esta pessoa? `true` ou `false` quando o
 * Google mandou as opções; `null` quando não dá para saber (iPhone, ou opções
 * ausentes), e aí a tela segue com o texto de sempre.
 */
export function googleDaOTeste(pkg: RcPackage | undefined): boolean | null {
  const options = pkg?.product?.subscriptionOptions ?? [];
  if (options.length === 0) return null;
  return googleOffer(pkg, OFERTA_DE_TESTE) !== null;
}

/** O id da oferta de teste grátis no Play (criada em 17/10/2026 nos dois planos). */
export const OFERTA_DE_TESTE = "teste7";
