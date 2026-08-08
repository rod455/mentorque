// Detecta se o app está rodando dentro do wrapper nativo (Capacitor).
// Usado pelo "modo leitor": na versão da loja não oferecemos compra de
// assinatura (política do Google Play Billing) — o Premium é assinado pelo
// site e funciona normalmente no app após o login.
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
}

// Origem de produção do app. Precisa bater com `server.url` do
// capacitor.config.ts — é para cá que voltam os links de e-mail (confirmação
// de conta, redefinição de senha), que podem ser abertos em outro aparelho.
export const APP_ORIGIN = "https://mentorque.com.br";

// Retorno do OAuth no app nativo. O esquema vem do `custom_url_scheme` em
// android/app/src/main/res/values/strings.xml (e do CFBundleURLTypes no
// Info.plist do iOS). Precisa estar cadastrado em Supabase → Authentication →
// URL Configuration → Redirect URLs.
export const NATIVE_AUTH_CALLBACK = "mentorque://auth-callback";

// Endereço que o app pede como retorno do login social.
//
// Não pedimos o esquema próprio direto: o GoTrue recusa `mentorque://` na
// validação de Redirect URLs (verificado nos logs — ele descartava e caía no
// Site URL, deixando a sessão no site). Pedimos esta página https, que passa
// na validação, e ela repassa para o app pelo esquema próprio.
export const NATIVE_AUTH_REDIRECT = `${APP_ORIGIN}/auth-bridge`;

type CapacitorGlobal = {
  getPlatform?: () => string;
  Plugins?: {
    Browser?: { open: (o: { url: string }) => Promise<unknown>; close?: () => Promise<unknown> };
    App?: {
      addListener?: (ev: string, cb: (data: { url: string }) => void) => AppListener | Promise<AppListener>;
    };
  };
};

export type AppListener = { remove: () => void };

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

// iPad. O Google Sign-In nativo é apresentado em popover no iPad e derruba o
// app; lá o login social cai no caminho por navegador. O iPadOS 13+ se anuncia
// como "Macintosh" no user-agent, daí a segunda checagem.
export function isIPad(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
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

// Fecha a aba do sistema aberta por `openExternal` (fim do fluxo de OAuth).
export function closeExternal(): void {
  const browser = capacitor()?.Plugins?.Browser;
  void browser?.close?.().catch(() => undefined);
}

// Assina os deep links recebidos pelo app (`mentorque://…`). Devolve uma
// função de limpeza; no navegador não faz nada.
export function onDeepLink(handler: (url: string) => void): () => void {
  const app = capacitor()?.Plugins?.App;
  if (!app?.addListener) return () => undefined;
  const sub = app.addListener("appUrlOpen", (data) => handler(data.url));
  return () => {
    if (sub && "remove" in sub) (sub as AppListener).remove();
    else void (sub as Promise<AppListener>)?.then?.((h) => h.remove());
  };
}

// URL de retorno para os links enviados por e-mail (confirmação de conta,
// redefinição de senha). Sempre https e absoluta: esses links podem ser
// abertos em outro aparelho, onde o deep link não resolveria.
export function emailRedirectUrl(): string {
  if (isNativeApp()) return `${APP_ORIGIN}/app`;
  return typeof window !== "undefined" ? `${window.location.origin}/app` : `${APP_ORIGIN}/app`;
}

// Onde o app pode VENDER assinatura.
//
// Web: checkout do Stripe. iOS: compra da Apple via RevenueCat. Android: não —
// a política do Play Billing proíbe cobrar por fora, então lá o app é "modo
// leitor" e nem convida para assinar.
//
// Isto existe porque a checagem era `isNativeApp()`, herdada de quando os dois
// apps eram modo leitor. Com a venda ligada no iOS, aquela checagem escondia
// TODO o Premium no iPhone.
export function sellsInApp(): boolean {
  return !isNativeApp() || nativePlatform() === "ios";
}

// Link da loja para "avaliar o app". Na web cai no site.
export function storeListingUrl(): string {
  const platform = nativePlatform();
  if (platform === "android") return "https://play.google.com/store/apps/details?id=mentorque.app";
  if (platform === "ios") return "https://apps.apple.com/app/mentorque/id0000000000"; // TODO: id real após o 1º release
  return "https://mentorque.com.br";
}
