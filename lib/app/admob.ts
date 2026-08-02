// IDs do AdMob (conta Mentorque). O SDK do AdMob é nativo: só serve anúncios
// quando o app roda dentro do wrapper (Capacitor + plugin AdMob). No navegador
// o AdGate cai no house ad do Premium.
export const ADMOB = {
  appId: "ca-app-pub-9316035916536420~8094986125",
  // Interstitial premiado (rewarded) — cadastrar carro / adicionar serviço
  rewardedInterstitial: "ca-app-pub-9316035916536420/3313432733",
  // Interstitial normal — abrir problema específico / abrir aula
  interstitial: "ca-app-pub-9316035916536420/5960757314",
} as const;

type AdMobPlugin = {
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
