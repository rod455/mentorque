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
  // Intersticial premiado (REWARDED_INTERSTITIAL no painel do AdMob).
  // Hoje NÃO está em uso em tela nenhuma: saiu do cadastro de carro quando os
  // anúncios foram tirados do caminho crítico do primeiro uso. Fica pronto e
  // conferido para quando voltar a fazer sentido.
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

// Modo de teste. Servir anúncios REAIS para si mesmo durante o
// desenvolvimento é tráfego inválido e pode suspender a conta do AdMob, então
// os aparelhos de teste entram por env (Vercel) e o SDK os registra no
// initialize. O ID do aparelho aparece no logcat na primeira requisição:
//   "Use new ConsentDebugSettings.Builder().addTestDeviceHashedId("ABC123")"
const TEST_DEVICES = (process.env.NEXT_PUBLIC_ADMOB_TEST_DEVICES ?? "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);
const TESTING = TEST_DEVICES.length > 0;

type ConsentStatus = "NOT_REQUIRED" | "OBTAINED" | "REQUIRED" | "UNKNOWN";
type ConsentInfo = {
  status: ConsentStatus;
  isConsentFormAvailable?: boolean;
  canRequestAds: boolean;
  privacyOptionsRequirementStatus?: "NOT_REQUIRED" | "REQUIRED" | "UNKNOWN";
};

type AdMobPlugin = {
  initialize?: (o?: { testingDevices?: string[]; initializeForTesting?: boolean }) => Promise<unknown>;
  requestConsentInfo?: (o?: { testDeviceIdentifiers?: string[] }) => Promise<ConsentInfo>;
  showConsentForm?: () => Promise<ConsentInfo>;
  showPrivacyOptionsForm?: () => Promise<void>;
  prepareInterstitial: (o: { adId: string }) => Promise<unknown>;
  showInterstitial: () => Promise<unknown>;
  // Vídeo premiado (formato REWARDED). NÃO é o que o nosso bloco é — ver abaixo.
  prepareRewardVideoAd: (o: { adId: string }) => Promise<unknown>;
  showRewardVideoAd: () => Promise<unknown>;
  // Intersticial premiado (formato REWARDED_INTERSTITIAL). É ESTE que casa com
  // o bloco 3313432733 do Mentorque, conferido na API do AdMob em 23/08.
  //
  // Os dois formatos são objetos diferentes no SDK do Google: pedir um vídeo
  // premiado usando o id de um intersticial premiado devolve erro de formato e
  // o anúncio nunca carrega. O código pedia o formato errado, então esse
  // caminho cairia SEMPRE no house ad, em silêncio, sem ninguém perceber.
  prepareRewardInterstitialAd?: (o: { adId: string }) => Promise<unknown>;
  showRewardInterstitialAd?: () => Promise<unknown>;
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
  try {
    await plugin.initialize?.(TESTING ? { initializeForTesting: true, testingDevices: TEST_DEVICES } : {});
  } catch {
    /* segue mesmo assim */
  }
  admobReady = true;
}

let consent: ConsentInfo | null = null;
let consentInFlight: Promise<ConsentInfo | null> | null = null;

// Consentimento (UMP do Google — atende LGPD/GDPR). Precisa rodar ANTES do
// primeiro anúncio: sem ele o SDK não pode personalizar e, no EEE, não pode
// nem servir. `canRequestAds: false` significa "sem anúncio" → house ad.
//
// A mensagem em si é configurada no painel do AdMob
// (Privacidade e mensagens → Consentimento do UE / Regulamentações).
export async function ensureConsent(plugin: AdMobPlugin): Promise<ConsentInfo | null> {
  if (consent) return consent;
  if (consentInFlight) return consentInFlight;
  const requestConsentInfo = plugin.requestConsentInfo;
  if (!requestConsentInfo) return null; // plugin antigo: não bloqueia

  consentInFlight = (async () => {
    try {
      let info = await requestConsentInfo(TESTING ? { testDeviceIdentifiers: TEST_DEVICES } : undefined);
      if (info.status === "REQUIRED" && info.isConsentFormAvailable && plugin.showConsentForm) {
        info = await plugin.showConsentForm();
      }
      consent = info;
      return info;
    } catch {
      return null; // erro de rede/SDK → o AdGate cai no house ad
    } finally {
      consentInFlight = null;
    }
  })();

  return consentInFlight;
}

// O usuário pode rever a escolha depois? (exigência do Google quando a
// mensagem de consentimento é exibida). Usado pela tela de Privacidade.
export function privacyOptionsRequired(): boolean {
  return consent?.privacyOptionsRequirementStatus === "REQUIRED";
}

export async function openPrivacyOptions(): Promise<void> {
  const plugin = nativeAdMob();
  if (!plugin?.showPrivacyOptionsForm) return;
  try {
    await plugin.showPrivacyOptionsForm();
  } catch {
    /* ignore */
  }
}
