import { detectPlatform } from "./platform";

// IDs do AdMob por plataforma. O SDK é nativo: só serve anúncios dentro do
// wrapper (Capacitor). No navegador — ou se faltar o ID da plataforma — o
// AdGate cai no house ad do Premium.
//
// iOS: crie o app iOS no AdMob (Apps → Adicionar app) + 2 blocos e preencha
// abaixo (e o GADApplicationIdentifier no ios/App/App/Info.plist).
export const ADMOB = {
  appId: {
    android: "ca-app-pub-9316035916536420~8094986125",
    ios: "", // TODO: app iOS no AdMob
  },
  // Interstitial normal — abrir problema específico / abrir aula
  interstitial: {
    android: "ca-app-pub-9316035916536420/6890695608",
    ios: "", // TODO: bloco interstitial iOS
  },
  // Interstitial premiado (rewarded) — cadastrar carro / adicionar serviço
  rewarded: {
    android: "ca-app-pub-9316035916536420/3313432733",
    ios: "", // TODO: bloco rewarded iOS
  },
} as const;

// Bloco da plataforma atual (null = sem anúncio nativo → house ad).
export function adUnit(kind: "interstitial" | "rewarded"): string | null {
  const p = detectPlatform() === "ios" ? "ios" : "android";
  const id = kind === "interstitial" ? ADMOB.interstitial[p] : ADMOB.rewarded[p];
  return id || null;
}

type AdMobPlugin = {
  initialize?: (o?: object) => Promise<unknown>;
  prepareInterstitial: (o: { adId: string }) => Promise<unknown>;
  showInterstitial: () => Promise<unknown>;
  prepareRewardVideoAd: (o: { adId: string }) => Promise<unknown>;
  showRewardVideoAd: () => Promise<unknown>;
};

// Plugin nativo injetado pelo wrapper (Capacitor). undefined no navegador.
export function nativeAdMob(): AdMobPlugin | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { Capacitor?: { Plugins?: { AdMob?: AdMobPlugin } } };
  return w.Capacitor?.Plugins?.AdMob;
}

let admobReady = false;
// Inicializa o SDK uma única vez (obrigatório antes do primeiro anúncio).
export async function initAdMob(plugin: AdMobPlugin): Promise<void> {
  if (admobReady) return;
  try { await plugin.initialize?.({}); } catch { /* segue mesmo assim */ }
  admobReady = true;
}
