export type Platform = "ios" | "android" | "other";

// Detecta a plataforma a partir do user-agent. No cliente, chamar sem argumento
// (usa navigator); no servidor, passar o header user-agent.
export function detectPlatform(ua?: string): Platform {
  const s = (ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : "")).toLowerCase();
  if (/iphone|ipad|ipod/.test(s)) return "ios";
  // iPadOS 13+ se identifica como "Macintosh" — trata Mac com toque como iOS.
  if (
    s.includes("macintosh") &&
    typeof navigator !== "undefined" &&
    (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints !== undefined &&
    (navigator as unknown as { maxTouchPoints: number }).maxTouchPoints > 1
  ) {
    return "ios";
  }
  if (s.includes("android")) return "android";
  return "other";
}

// Dias de teste grátis por plataforma: 3 no iPhone, 7 no Android/outros.
// Mantido em sincronia com os defaults do servidor (STRIPE_TRIAL_DAYS_IOS=3,
// STRIPE_TRIAL_DAYS=7).
export function trialDaysFor(platform: Platform): number {
  return platform === "ios" ? 3 : 7;
}
