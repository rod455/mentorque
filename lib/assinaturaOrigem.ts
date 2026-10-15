// De onde veio cada assinatura, gravado por quem escreve a linha (15/10/2026).
//
// Até aqui a casa deduzia: "tem id do Stripe" era venda, "não tem" era
// cortesia. A primeira venda de loja (Play, 25/09) não tem id do Stripe e virou
// cortesia no painel, na conferência das assinaturas e na conferência da loja.
// A coluna `subscriptions.origem` (supabase/subscriptions_origem.sql) passou a
// dizer isso direto, e as regras de leitura moram aqui para os dois escritores
// e o painel concordarem.

export type OrigemDaAssinatura = "stripe" | "app_store" | "play_store" | "loja" | "cortesia";

/** As origens que são venda feita numa loja de app (Apple, Google ou outra que o RevenueCat mande). */
export const ORIGENS_DE_LOJA: readonly OrigemDaAssinatura[] = ["app_store", "play_store", "loja"];

/**
 * A origem a gravar a partir do campo `store` do evento do RevenueCat.
 *
 * PROMOTIONAL é acesso dado pelo painel do RevenueCat, sem cobrança: é
 * cortesia, e contar como venda faria a conferência da loja "bater" com uma
 * venda perdida, que é o defeito que esta coluna existe para fechar.
 */
export function origemDaLoja(store: string | null | undefined): OrigemDaAssinatura {
  switch (String(store ?? "").toUpperCase()) {
    case "APP_STORE":
    case "MAC_APP_STORE":
      return "app_store";
    case "PLAY_STORE":
      return "play_store";
    case "PROMOTIONAL":
      return "cortesia";
    case "STRIPE":
      return "stripe";
    default:
      return "loja";
  }
}

/**
 * A linha é cortesia (nunca foi receita)?
 *
 * Com origem gravada, ela decide. Sem origem (linha que nenhum escritor
 * conhecido gravou), vale a dedução antiga: sem id do Stripe é cortesia.
 */
export function ehCortesia(s: { origem?: string | null; stripe_subscription_id?: string | null }): boolean {
  if (s.origem) return s.origem === "cortesia";
  return !s.stripe_subscription_id;
}

/** A linha é venda feita numa loja de app? Só a origem gravada responde. */
export function ehVendaDeLoja(s: { origem?: string | null }): boolean {
  return !!s.origem && (ORIGENS_DE_LOJA as readonly string[]).includes(s.origem);
}
