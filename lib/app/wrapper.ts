// Detecta se o app está rodando dentro do wrapper nativo (Capacitor).
// Usado pelo "modo leitor": na versão da loja não oferecemos compra de
// assinatura (política do Google Play Billing) — o Premium é assinado pelo
// site e funciona normalmente no app após o login.
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
}

type CapacitorGlobal = {
  getPlatform?: () => string;
  Plugins?: { Browser?: { open: (o: { url: string }) => Promise<unknown> } };
};

function capacitor(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

// Plataforma do wrapper nativo, ou null no navegador. Diferente de
// `detectPlatform()` (que lê o user-agent e responde também na web).
export function nativePlatform(): "ios" | "android" | null {
  const p = capacitor()?.getPlatform?.();
  return p === "ios" || p === "android" ? p : null;
}

// A WebView do wrapper só empurra para o navegador do sistema quando o host
// muda (Capacitor: `Bridge.launchIntent`). Ou seja, um link para
// `mentorque.com.br/privacidade` abriria a landing — com os planos e o
// checkout do Stripe — DENTRO do app da loja, o que viola a política de
// pagamentos do Google Play. Por isso qualquer saída do app passa por aqui,
// que usa o plugin Browser (aba do sistema) quando disponível.
export function openExternal(url: string): void {
  if (typeof window === "undefined") return;
  const browser = capacitor()?.Plugins?.Browser;
  if (browser) {
    void browser.open({ url }).catch(() => window.open(url, "_blank", "noopener,noreferrer"));
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

// Link da loja para "avaliar o app". Na web cai no site.
export function storeListingUrl(): string {
  const platform = nativePlatform();
  if (platform === "android") return "https://play.google.com/store/apps/details?id=mentorque.app";
  if (platform === "ios") return "https://apps.apple.com/app/mentorque/id0000000000"; // TODO: id real após o 1º release
  return "https://mentorque.com.br";
}
