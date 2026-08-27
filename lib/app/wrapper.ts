// Detecta se o app está rodando dentro do wrapper nativo (Capacitor).
// Usado pelo "modo leitor": na versão da loja não oferecemos compra de
// assinatura (política do Google Play Billing) — o Premium é assinado pelo
// site e funciona normalmente no app após o login.
import { APP_STORE_REVIEW_URL, PLAY_STORE_REVIEW_URL } from "@/lib/stores";
import { detectPlatform } from "@/lib/app/platform";

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

// Chave pública do RevenueCat da loja onde o app está rodando.
//
// São variáveis de BUILD: entram no pacote na hora do `build:native` e não são
// lidas em tempo de execução. Compilar sem elas gera um app que abre normal e
// simplesmente não vende — o que já custou três diagnósticos no iOS.
//
// A ausência da chave é o interruptor do modo leitor. É assim que o Android
// atravessou o lançamento inteiro sem vender, e é assim que ele passa a vender
// no dia em que a chave existir: sem tocar em nenhuma tela.
const CHAVES_IAP: Record<string, string> = {
  ios: process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ?? "",
  android: process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY ?? "",
};

export function iapKey(): string {
  const p = nativePlatform();
  return p ? CHAVES_IAP[p] ?? "" : "";
}

// Onde o app pode VENDER assinatura.
//
// Web: checkout do Stripe. App de loja: só onde houver chave de compra interna
// — Apple IAP no iPhone, Play Billing no Android. Sem chave, aquela loja fica
// em "modo leitor": não vende e não convida para assinar, que é o que a
// política do Play exige de quem não usa o Play Billing.
//
// Era `nativePlatform() === "ios"` fixo. Virou uma pergunta sobre a chave para
// o Android poder entrar sem mexer em tela nenhuma: com a chave no build, o
// paywall, o banner de upgrade e o botão do house ad voltam sozinhos.
//
// Antes disso a checagem era `isNativeApp()`, herdada de quando os dois apps
// eram modo leitor. Com a venda ligada no iOS, aquela checagem escondia TODO o
// Premium no iPhone.
export function sellsInApp(): boolean {
  return !isNativeApp() || !!iapKey();
}

// Link da loja para "avaliar o app". Na web cai no site.
//
// Os endereços moram em lib/stores.ts: o id da Apple já aparecia escrito à mão
// aqui e na landing, e id errado só se descobre quando alguém toca no botão e
// cai numa App Store dizendo que o app não existe — foi o que aconteceu
// enquanto ele era `id0000000000`.
//
// As duas fichas estão publicadas. A da Apple abre direto na caixa de nota
// (`?action=write-review`); a da Play não tem equivalente e abre a ficha, com o
// formulário de avaliação logo abaixo da descrição — ver lib/stores.ts.
export function storeListingUrl(): string {
  const platform = effectiveStorePlatform();
  if (platform === "android") return PLAY_STORE_REVIEW_URL;
  if (platform === "ios") return APP_STORE_REVIEW_URL;
  return "https://www.mentorque.com.br";
}

// Loja que faz sentido para ESTE aparelho, dentro ou fora do wrapper.
//
// `nativePlatform()` só responde no app empacotado; na web mobile ela devolve
// null e o convite de avaliação mandava a pessoa para o site — um beco. O
// user-agent diz a plataforma do aparelho mesmo no navegador, então um iPhone
// na web vai para a App Store e um Android para a Play. Desktop continua null:
// lá não existe loja para apontar.
export function effectiveStorePlatform(): "ios" | "android" | null {
  const nativa = nativePlatform();
  if (nativa) return nativa;
  const ua = detectPlatform();
  return ua === "other" ? null : ua;
}

/**
 * Está rodando na máquina de quem desenvolve?
 *
 * Serve para uma coisa só: liberar o Premium sem Stripe configurado, para dar
 * para andar pelas telas pagas em desenvolvimento. É por isso que a checagem é
 * de HOST e não de variável de ambiente — variável a gente esquece ligada, e
 * "esqueci ligado" aqui significa dar Premium de graça em produção.
 */
export function isLocalDev(): boolean {
  return typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])/.test(window.location.hostname);
}
