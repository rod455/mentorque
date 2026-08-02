"use client";

import { useEffect, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { adUnit, initAdMob, nativeAdMob } from "@/lib/app/admob";
import { detectPlatform } from "@/lib/app/platform";
import { isNativeApp } from "@/lib/app/wrapper";
import { useNav } from "@/lib/app/nav";
import { useContent } from "./ui";

// Anúncio em tela cheia para usuários free.
// 1) Dentro do wrapper nativo (Capacitor): usa o AdMob real — interstitial
//    (ca-app-pub-…/5960757314) e rewarded (ca-app-pub-…/3313432733).
// 2) No navegador (ou se o AdMob falhar): house ad do Premium com a mesma
//    mecânica — interstitial: 5s → X fecha; rewarded: 8s → Continuar libera,
//    fechar antes cancela (onCancel).
export function AdOverlay({ kind, onDone, onCancel }: { kind: "interstitial" | "rewarded"; onDone: () => void; onCancel?: () => void }) {
  const c = useContent();
  const t = c.ads;
  const { go } = useNav();
  const total = kind === "rewarded" ? 8 : 5;
  const [left, setLeft] = useState(total);
  // "native": tentando o AdMob do wrapper; "house": anúncio interno.
  const [mode, setMode] = useState<"native" | "house">(() => (nativeAdMob() && adUnit(kind) ? "native" : "house"));

  useEffect(() => {
    if (mode !== "native") return;
    let cancelled = false;
    const plugin = nativeAdMob();
    if (!plugin) { setMode("house"); return; }
    (async () => {
      try {
        await initAdMob(plugin);
        const adId = adUnit(kind);
        if (!adId) throw new Error("no ad unit");
        if (kind === "interstitial") {
          await plugin.prepareInterstitial({ adId });
          await plugin.showInterstitial();
          if (!cancelled) onDone();
        } else {
          await plugin.prepareRewardVideoAd({ adId });
          await plugin.showRewardVideoAd();
          if (!cancelled) onDone();
        }
      } catch {
        if (!cancelled) setMode("house"); // sem rede/erro → house ad
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== "house") return;
    setLeft(total);
    const timer = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(timer);
  }, [mode, total]);
  const done = left <= 0;

  // Aguardando o anúncio nativo abrir — fundo escuro discreto.
  if (mode === "native") {
    return <div className="fixed inset-0 z-[70] mx-auto w-full max-w-[440px] bg-graphite-900" />;
  }

  return (
    <div className="fixed inset-0 z-[70] mx-auto flex w-full max-w-[440px] flex-col bg-graphite-900">
      {/* Barra do anúncio */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cream/60">{t.badge}</span>
        {kind === "interstitial" ? (
          done ? (
            <button onClick={onDone} aria-label="fechar" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-cream/80 hover:text-cream">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          ) : (
            <span className="text-xs tabular-nums text-cream/50">{t.closeIn.replace("{s}", String(left))}</span>
          )
        ) : (
          <button onClick={onCancel} aria-label="fechar" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-cream/80 hover:text-cream">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        )}
      </div>

      {/* Conteúdo do house ad (Premium) */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/biela/biela-cafe-anim.webp" alt="Biela" className="h-44 w-44 object-contain" draggable={false} />
        <h2 className="mt-4 font-serif text-2xl font-bold text-cream">{t.houseTitle}</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-cream/60">{t.houseBody}</p>
        <button
          onClick={() => go({ name: "subscribe", ctx: "ad" })}
          className="mt-5 rounded-full bg-amber px-7 py-3 font-display text-sm font-semibold text-graphite active:scale-[0.99]"
        >
          {t.houseCta}
        </button>
      </div>

      {/* Rodapé do rewarded */}
      {kind === "rewarded" && (
        <div className="px-6 pb-8">
          {done ? (
            <>
              <p className="mb-2 text-center text-sm text-teal">{t.unlocked}</p>
              <button
                onClick={onDone}
                className="w-full rounded-full bg-cream py-3.5 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
              >
                {t.cont}
              </button>
            </>
          ) : (
            <>
              <p className="mb-2 text-center text-xs text-cream/50">{t.rewardedHint}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-amber transition-all duration-1000" style={{ width: `${((total - left) / total) * 100}%` }} />
              </div>
              <p className="mt-2 text-center text-xs tabular-nums text-cream/50">{t.rewardIn.replace("{s}", String(left))}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Anúncios habilitados? No app nativo da Apple, NUNCA (nem house ad) —
// lá o modelo é só conteúdo bloqueado + assinatura via IAP.
export function adsEnabled(): boolean {
  return !(isNativeApp() && detectPlatform() === "ios");
}

// Gate por tela: devolve se o anúncio ainda precisa aparecer (só free).
export function useAdFree(): boolean {
  const { s } = usePrototype();
  return s.premium; // efetivo: assinatura Stripe também liga premium
}
