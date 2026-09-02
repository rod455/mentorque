"use client";

import { useEffect, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { adUnit, ensureConsent, initAdMob, nativeAdMob } from "@/lib/app/admob";
import { detectPlatform } from "@/lib/app/platform";
import { isNativeApp } from "@/lib/app/wrapper";
import { useNav } from "@/lib/app/nav";
import { passo } from "@/lib/app/ultimoPasso";
import { useContent } from "./ui";

// Anúncio em tela cheia para usuários free. Só chega aqui quem está no app
// nativo do Android — ver `adsEnabled()` no fim do arquivo.
// 1) Caminho normal: AdMob real — interstitial (ca-app-pub-…/6890695608) e
//    rewarded (ca-app-pub-…/3313432733).
// 2) Se o AdMob falhar (sem rede, sem consentimento, bloco ausente): house ad
//    do Premium com a mesma mecânica — interstitial: 5s → X fecha; rewarded:
//    8s → Continuar libera, fechar antes cancela (onCancel).
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
        // O anúncio é a maior porção de código nativo que o app abre sozinho.
        // Migalha antes de entrar, para um fechamento aqui ter testemunha.
        passo(`abriu anúncio (${kind})`);
        // Consentimento (UMP) antes de qualquer requisição de anúncio.
        // `canRequestAds: false` = usuário recusou ou o formulário falhou.
        const info = await ensureConsent(plugin);
        if (info && !info.canRequestAds) throw new Error("no consent");
        if (cancelled) return;
        await initAdMob(plugin);
        const adId = adUnit(kind);
        if (!adId) throw new Error("no ad unit");
        if (kind === "interstitial") {
          await plugin.prepareInterstitial({ adId });
          await plugin.showInterstitial();
          if (!cancelled) onDone();
        } else {
          // O nosso bloco premiado é REWARDED_INTERSTITIAL (conferido na API do
          // AdMob), e no SDK isso é um objeto diferente do vídeo premiado.
          // Pedir o formato errado devolve erro e cai no house ad calado.
          if (!plugin.prepareRewardInterstitialAd || !plugin.showRewardInterstitialAd) {
            throw new Error("sem intersticial premiado no plugin");
          }
          await plugin.prepareRewardInterstitialAd({ adId });
          await plugin.showRewardInterstitialAd();
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
    return <div className="fixed inset-0 z-[70] app-col bg-graphite-900" />;
  }

  return (
    <div className="fixed inset-0 z-[70] app-col flex flex-col bg-graphite-900">
      {/* Barra do anúncio */}
      <div className="flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),16px)]">
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
        <div className="px-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
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

// Onde o anúncio pode aparecer: SOMENTE dentro do app nativo do Android.
//
// Antes a regra era ao contrário — anúncio em todo lugar, menos no app da
// Apple. Isso deixava o navegador com o house ad e uma espera de 5 segundos
// antes de abrir uma aula, o que na web é caro do jeito errado: quem chega
// pela busca ou por um link não tem app instalado, não tem vínculo nenhum
// com o produto, e o que o anúncio faz na prática é adiar a única coisa que
// poderia convencer essa pessoa a ficar. Ali o conteúdo é a isca; segurá-lo
// atrás de um cronômetro derruba a primeira visita.
//
// Na Apple continua valendo o de sempre: nada de anúncio, nem house ad — o
// modelo lá é conteúdo bloqueado + assinatura via IAP.
//
// No Android o AdMob permanece, com a política de adPolicy.ts (carência,
// intervalo e teto diário) — lá a pessoa já instalou o app.
// Chave geral dos anúncios. DESLIGADA por decisão do dono (23/08/2026).
//
// Tudo do lado do AdMob está pronto e conferido contra a API: app APPROVED e
// vinculado à ficha da Play, os dois blocos existem com o formato certo e o id
// do AndroidManifest bate com o do painel. O que falta é vontade de mostrar
// anúncio, não configuração — e enquanto o app é novo e o foco é conversão
// para Premium, anúncio só atrapalha a primeira impressão.
//
// Com ela desligada NADA de anúncio acontece: sem SDK, sem pedido de
// consentimento na abertura, e nem o house ad do Premium interrompe alguém.
//
// PARA LIGAR: NEXT_PUBLIC_ADS=1 no ambiente do build e gerar um build novo.
// O valor entra embutido no binário, então trocar a variável sem gerar build
// não muda nada no aparelho de ninguém. No Codemagic, a variável vai no grupo
// usado pelo workflow `lojas`.
const ADS_LIGADOS = (process.env.NEXT_PUBLIC_ADS ?? "").trim() === "1";

export function adsEnabled(): boolean {
  return ADS_LIGADOS && isNativeApp() && detectPlatform() === "android";
}

// Gate por tela: devolve se o anúncio ainda precisa aparecer (só free).
export function useAdFree(): boolean {
  const { s } = usePrototype();
  return s.premium; // efetivo: assinatura Stripe também liga premium
}
