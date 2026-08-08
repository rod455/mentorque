// Compras internas (Apple In-App Purchase via RevenueCat) — usadas apenas no
// wrapper nativo iOS, onde a Apple exige IAP para assinaturas digitais.
// A chave pública do app iOS fica no RevenueCat (Project → API keys) e entra
// via env NEXT_PUBLIC_REVENUECAT_IOS_KEY (Vercel).
import { nativePlatform } from "./wrapper";

export const REVENUECAT_IOS_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ?? "";

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
// Só iOS, por política: no Android o app da loja é "modo leitor" e não vende
// assinatura. Sem esta trava, uma chave do RevenueCat configurada por engano
// ligaria o paywall nativo no Android — que exigiria Google Play Billing.
//
// O `logIn` no fim conserta um furo silencioso: o `configured` é de módulo, e a
// primeira chamada costuma vir sem usuário (o onboarding carrega as ofertas
// antes de qualquer login). Sem ele, toda chamada seguinte — inclusive a que
// passa o id do Supabase — saía pelo atalho e a assinatura ficava presa num
// usuário anônimo do RevenueCat: o motorista pagava e o Premium não chegava na
// conta dele, nem em outro aparelho, nem no site.
export async function initPurchases(userId: string | null): Promise<PurchasesPlugin | null> {
  if (nativePlatform() !== "ios") return null;
  const p = nativePurchases();
  if (!p || !REVENUECAT_IOS_KEY) return null;
  if (!configured) {
    try {
      await p.configure({ apiKey: REVENUECAT_IOS_KEY, ...(userId ? { appUserID: userId } : {}) });
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
