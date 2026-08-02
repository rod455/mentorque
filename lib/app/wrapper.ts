// Detecta se o app está rodando dentro do wrapper nativo (Capacitor).
// Usado pelo "modo leitor": na versão da loja não oferecemos compra de
// assinatura (política do Google Play Billing) — o Premium é assinado pelo
// site e funciona normalmente no app após o login.
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
}
