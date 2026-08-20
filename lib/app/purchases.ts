// Compras internas pela loja (Apple IAP e Google Play Billing), via RevenueCat.
// As duas lojas exigem o pagamento delas para assinatura digital consumida
// dentro do app; o Stripe fica para a web.
//
// As chaves públicas ficam no RevenueCat (Project → API keys) e entram por env:
// NEXT_PUBLIC_REVENUECAT_IOS_KEY (`appl_…`) e NEXT_PUBLIC_REVENUECAT_ANDROID_KEY
// (`goog_…`). A resolução mora em wrapper.ts, junto do `sellsInApp()` que decide
// as telas — os dois precisam concordar, e concordam por lerem a mesma fonte.
import { iapKey } from "./wrapper";

export type RcPackage = {
  identifier: string;
  packageType?: string;
  product?: { priceString?: string; title?: string; identifier?: string };
};
type CustomerInfo = { entitlements?: { active?: Record<string, unknown> } };
type PurchasesPlugin = {
  configure: (o: { apiKey: string; appUserID?: string }) => Promise<unknown>;
  getOfferings: () => Promise<{ current?: { availablePackages?: RcPackage[] } | null }>;
  purchasePackage: (o: { aPackage: RcPackage }) => Promise<{ customerInfo?: CustomerInfo }>;
  restorePurchases: () => Promise<{ customerInfo?: CustomerInfo }>;
  logIn: (o: { appUserID: string }) => Promise<unknown>;
};

// Plugin nativo injetado pelo wrapper (Capacitor). undefined no navegador.
export function nativePurchases(): PurchasesPlugin | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { Capacitor?: { Plugins?: { Purchases?: PurchasesPlugin } } };
  return w.Capacitor?.Plugins?.Purchases;
}

let configured = false;
let identificado: string | null = null;
// Configura o SDK uma vez, amarrando a compra ao usuário Supabase (o webhook
// usa esse id para liberar o Premium no banco).
//
// Quem manda aqui é a CHAVE, não a plataforma.
//
// Era `nativePlatform() !== "ios"` fixo, de quando o Android não podia vender.
// Agora as duas lojas passam pelo mesmo caminho — Apple IAP e Play Billing,
// ambos pelo RevenueCat — e cada uma entra quando a sua chave existir no build.
// Sem chave devolve null e o app cai no modo leitor, que é exatamente o
// comportamento de antes: por isso ligar o Android não exigiu mexer em telas.
//
// O `logIn` no fim conserta um furo silencioso: o `configured` é de módulo, e a
// primeira chamada costuma vir sem usuário (o onboarding carrega as ofertas
// antes de qualquer login). Sem ele, toda chamada seguinte — inclusive a que
// passa o id do Supabase — saía pelo atalho e a assinatura ficava presa num
// usuário anônimo do RevenueCat: o motorista pagava e o Premium não chegava na
// conta dele, nem em outro aparelho, nem no site.
export async function initPurchases(userId: string | null): Promise<PurchasesPlugin | null> {
  const chave = iapKey();
  const p = nativePurchases();
  if (!p || !chave) return null;
  if (!configured) {
    try {
      await p.configure({ apiKey: chave, ...(userId ? { appUserID: userId } : {}) });
      configured = true;
      identificado = userId ?? null;
    } catch {
      return null;
    }
  }
  if (userId && userId !== identificado) {
    try {
      await p.logIn({ appUserID: userId });
      identificado = userId;
    } catch { /* segue com a identidade atual; melhor vender do que travar */ }
  }
  return p;
}

export function hasActiveEntitlement(info?: CustomerInfo): boolean {
  const active = info?.entitlements?.active;
  return !!active && Object.keys(active).length > 0;
}
