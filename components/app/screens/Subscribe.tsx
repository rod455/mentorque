"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/app/auth";
import { usePrototype } from "@/lib/app/store";
import { stripeConfigured } from "@/lib/app/stripeClient";
import { trialDaysFor, trialPlatform, type Platform } from "@/lib/app/platform";
import { iapKey, isLocalDev, isNativeApp, nativePlatform } from "@/lib/app/wrapper";
import { googleOffer, hasActiveEntitlement, initPurchases, offerPrice, type GoogleOption, type RcPackage } from "@/lib/app/purchases";
import { useNav, type View } from "@/lib/app/nav";
import { funil } from "@/lib/app/funil";
import { Button } from "@/components/ui/Button";
import { Card, Icon, LegalLinks, useContent } from "../ui";

// O paywall.
//
// MOROU DENTRO DE Profile.tsx até aqui, e isso custava caro: quem procurava a
// tela que vende a assinatura não tinha motivo nenhum para abrir um arquivo
// chamado "Perfil". Seiscentas linhas de argumento de venda escondidas atrás
// do nome errado.
//
// Duas coisas convivem aqui de propósito: o caminho da WEB (Stripe) e o
// caminho NATIVO (loja). São dois jeitos de cobrar pela mesma assinatura, e
// separá-los em arquivos faria os dois divergirem sem ninguém perceber — foi
// exatamente o que aconteceu com o comparativo de planos antes de ele virar
// componente.

function TealCheck() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-teal text-graphite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

/**
 * Comparação grátis × Premium.
 *
 * Vivia solta dentro do trecho da WEB do paywall — e o caminho nativo retorna
 * antes dele. Ou seja: no app da loja, que é onde a assinatura é de fato
 * vendida, o comprador via o Biela e um botão de assinar, sem nenhuma tabela
 * dizendo o que muda. Como componente, os dois caminhos mostram a mesma coisa e
 * não há como um evoluir sem o outro.
 */
function ComparativoPlanos() {
  const c = useContent();
  const sub = c.subscribe;
  const cadeado = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-cream/25">
      <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
  return (
    <div className="overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/[0.06]">
      <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr] items-center border-b border-white/[0.06] px-3.5 py-3">
        <span className="font-display text-sm font-semibold text-cream">{sub.knowTitle}</span>
        <span className="text-center text-xs font-medium text-cream/45">{sub.colFree}</span>
        <span className="text-center text-xs font-semibold text-amber">{sub.colPremium}</span>
      </div>
      <div className="[&>*+*]:border-t [&>*+*]:border-white/[0.05]">
        {sub.features.map((f) => (
          <div key={f.label} className="grid grid-cols-[1.6fr_0.6fr_0.7fr] items-center px-3.5 py-2.5">
            <span className="flex items-center gap-2.5 text-sm text-cream/85">
              <Icon name={f.icon} className="h-4 w-4 text-cream/45" /> {f.label}
            </span>
            <span className="flex justify-center">
              {f.free === "check" ? <TealCheck /> : f.free === "ltd" ? (
                <span className="rounded bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber">{sub.ltd}</span>
              ) : cadeado}
            </span>
            <span className="flex justify-center"><TealCheck /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubscribeScreen({ ctx: _ctx }: { ctx?: string }) {
  const c = useContent();
  const sub = c.subscribe;
  const { setPremium, subscribed, refreshSubscription } = usePrototype();
  const { user } = useAuth();
  const { back, go, root } = useNav();
  const [platform, setPlatform] = useState<Platform>("other");
  useEffect(() => setPlatform(trialPlatform()), []);
  const trialDays = trialDaysFor(platform);

  // Plano selecionável no paywall (o checkout embutido nasce com um preço fixo,
  // então a escolha acontece aqui). O onboarding pré-seleciona via ctx.
  const [plan, setPlan] = useState<"monthly" | "annual">(_ctx === "onb-monthly" ? "monthly" : "annual");

  // Funil: quem chegou ao paywall (uma vez por sessão, com o contexto de
  // entrada — onboarding, home, revisões…). O início de compra é marcado em
  // cada caminho (Stripe, loja, ofertas), não aqui.
  //
  // `chave` fixa porque a dedup padrão é por evento+origem, e aqui a origem é
  // o contexto de ENTRADA da mesma tela. Sem ela, a mesma pessoa na mesma
  // sessão contava de novo a cada entrada por um caminho diferente, e ainda
  // fora de ordem: ao voltar do checkout a tela remonta sem ctx e gravava um
  // `viu_paywall` DEPOIS do `iniciou_checkout`. Aconteceu em 25/08/2026 (o
  // mesmo cliente do quase-pagou-duas-vezes): 4 dos eventos de paywall da
  // semana são 2 pessoas. Agora vale a primeira entrada da sessão.
  useEffect(() => { funil("viu_paywall", { umaVez: true, chave: "viu_paywall", origem: _ctx ?? "direto", userId: user?.id }); }, [_ctx, user?.id]);

  const subscribe = () => {
    if (!user) { go({ name: "auth" }); return; }
    funil("iniciou_checkout", { origem: `web-${plan}`, userId: user.id });
    if (!stripeConfigured() && isLocalDev()) { setPremium(true); back(); return; } // demo só em dev
    go({ name: "checkout", plan }); // checkout embutido (com teste grátis)
  };

  // Funil de saída do paywall: QUALQUER saída (X, abas de baixo, gesto de
  // voltar) dispara as ofertas — 10% OFF (suprimido por 30 min) e, na
  // rejeição ou se o 10% estiver suprimido, 25% OFF em tela cheia (1x a cada
  // 3 dias). Assinantes saem direto.
  // Ofertas de saída do Play (Android): carregadas junto com os pacotes.
  const [exitOpts, setExitOpts] = useState<{ o10: GoogleOption | null; o25: GoogleOption | null }>({ o10: null, o25: null });
  // Ofertas de saída da Apple (iOS). A Apple não deixa aplicar desconto num
  // produto para usuário NOVO (promotional offer é só para quem já assina ou
  // assinou), então o desconto lá é outro produto no mesmo grupo de
  // assinaturas — mentorque_annual_10/25 — servido pelos pacotes custom
  // "exit10"/"exit25" do offering. No Android esses pacotes não têm produto e
  // o RevenueCat nem os devolve; os dois estados coexistem sem conflito.
  const [exitPkgs, setExitPkgs] = useState<{ p10: RcPackage | null; p25: RcPackage | null }>({ p10: null, p25: null });
  const OFFER_KEY = "mentorque-exit-offer-ts";
  const OFFER2_KEY = "mentorque-exit2-ts";
  const [showOffer, setShowOffer] = useState(false);
  const [showOffer2, setShowOffer2] = useState(false);
  const [offerLeft, setOfferLeft] = useState(120);
  const pendingExit = useRef<View | null>(null);
  useEffect(() => {
    if (!showOffer) return;
    const t = setInterval(() => setOfferLeft((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [showOffer]);

  // Conclui a saída: vai pro destino pedido (ex.: aba Início) ou volta.
  const exitNow = () => {
    const target = pendingExit.current;
    pendingExit.current = null;
    if (target) root(target);
    else back();
  };

  const fresh = (key: string, windowMs: number) => {
    let last = 0;
    try { last = Number(window.localStorage.getItem(key) ?? 0); } catch { /* ignore */ }
    return Date.now() - last > windowMs;
  };
  const mark = (key: string) => { try { window.localStorage.setItem(key, String(Date.now())); } catch { /* ignore */ } };

  // Tenta mostrar uma oferta na saída. true = mostrou (segura a navegação).
  //
  // No app da loja o funil só liga com a oferta REAL da loja já carregada:
  // no Android as ofertas do Play (exit10/exit25 dentro da assinatura), no
  // iOS os pacotes com os produtos com desconto (mentorque_annual_10/25).
  // Segurar a navegação sem ter o que vender repetiria o bug antigo: o app
  // cancelava a saída para exibir uma tela sem oferta nenhuma, e quem tocava
  // numa aba de baixo não ia a lugar nenhum até o cronômetro zerar.
  const requestExit = (target: View | null): boolean => {
    if (subscribed) return false;
    const nativeExitReady = nativePlatform() === "android"
      ? !!(exitOpts.o10 || exitOpts.o25)
      : !!(exitPkgs.p10 || exitPkgs.p25);
    if (isNativeApp() && !nativeExitReady) return false;
    pendingExit.current = target;
    if (fresh(OFFER_KEY, 30 * 60 * 1000)) { mark(OFFER_KEY); setOfferLeft(120); setShowOffer(true); return true; }
    if (fresh(OFFER2_KEY, 3 * 24 * 60 * 60 * 1000)) { mark(OFFER2_KEY); setShowOffer2(true); return true; }
    return false;
  };

  // Saídas vindas de fora da tela (abas de baixo, gesto de voltar) chegam
  // como evento disparado pelo Shell; preventDefault segura a navegação.
  useEffect(() => {
    const h = (e: Event) => {
      const target = (e as CustomEvent<View | null>).detail ?? null;
      if (requestExit(target)) e.preventDefault();
    };
    window.addEventListener("mq-paywall-exit", h);
    return () => window.removeEventListener("mq-paywall-exit", h);
  });

  const tryClose = () => { if (!requestExit(null)) back(); };

  useEffect(() => {
    if (showOffer && offerLeft <= 0) { setShowOffer(false); exitNow(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerLeft, showOffer]);

  // Compra uma oferta do Play (exit10/exit25). Fecha os pop-ups e sai do
  // paywall quando o entitlement chega.
  const buyGoogleOffer = async (opt: GoogleOption | null) => {
    if (!opt || iapBusy) return;
    if (!user) { go({ name: "auth" }); return; }
    funil("iniciou_checkout", { origem: `oferta-${opt.id.split(":").pop()}`, userId: user.id });
    setIapBusy(true);
    try {
      const pl = await initPurchases(user.id);
      const res = await pl?.purchaseSubscriptionOption({ subscriptionOption: opt });
      if (res && hasActiveEntitlement(res.customerInfo)) {
        setPremium(true);
        refreshSubscription();
        setShowOffer(false);
        setShowOffer2(false);
        back();
      }
    } catch { /* cancelou/erro: permanece na oferta */ } finally {
      setIapBusy(false);
    }
  };

  // Compra um pacote de saída da Apple (exit10/exit25). Mesmo desfecho do
  // buyGoogleOffer; a diferença é o mecanismo — aqui é um produto comum,
  // comprado como qualquer pacote.
  const buyExitPackage = async (pkg: RcPackage | null) => {
    if (!pkg || iapBusy) return;
    if (!user) { go({ name: "auth" }); return; }
    funil("iniciou_checkout", { origem: `oferta-${pkg.identifier}`, userId: user.id });
    setIapBusy(true);
    try {
      const p = await initPurchases(user.id);
      const res = await p?.purchasePackage({ aPackage: pkg });
      if (res && hasActiveEntitlement(res.customerInfo)) {
        setPremium(true);
        refreshSubscription();
        setShowOffer(false);
        setShowOffer2(false);
        back();
      }
    } catch { /* cancelou/erro: permanece na oferta */ } finally {
      setIapBusy(false);
    }
  };

  const subscribeOffer = () => {
    if (isNativeApp()) {
      if (nativePlatform() === "android") { void buyGoogleOffer(exitOpts.o10 ?? exitOpts.o25); return; }
      void buyExitPackage(exitPkgs.p10 ?? exitPkgs.p25);
      return;
    }
    if (!user) { go({ name: "auth" }); return; }
    funil("iniciou_checkout", { origem: "web-exit10", userId: user.id });
    if (!stripeConfigured() && isLocalDev()) { setPremium(true); back(); return; }
    go({ name: "checkout", plan: "annual", offer: "exit10" });
  };

  // Rejeitou o 10%: entra a oferta final (25%) se disponível; senão sai.
  const dismissOffer1 = () => {
    setShowOffer(false);
    if (!subscribed && fresh(OFFER2_KEY, 3 * 24 * 60 * 60 * 1000)) {
      mark(OFFER2_KEY);
      setShowOffer2(true);
      return;
    }
    exitNow();
  };

  const subscribeOffer2 = () => {
    if (isNativeApp()) {
      if (nativePlatform() === "android") { void buyGoogleOffer(exitOpts.o25 ?? exitOpts.o10); return; }
      void buyExitPackage(exitPkgs.p25 ?? exitPkgs.p10);
      return;
    }
    if (!user) { go({ name: "auth" }); return; }
    funil("iniciou_checkout", { origem: "web-exit25", userId: user.id });
    if (!stripeConfigured() && isLocalDev()) { setPremium(true); back(); return; }
    go({ name: "checkout", plan: "annual", offer: "exit25" });
  };

  const mmss = `${String(Math.floor(Math.max(0, offerLeft) / 60)).padStart(2, "0")}:${String(Math.max(0, offerLeft) % 60).padStart(2, "0")}`;

  // App nativo iOS: compra interna via RevenueCat (Apple IAP). Carrega os
  // pacotes da oferta; sem RevenueCat (ex.: Android), fica o modo leitor.
  const [iap, setIap] = useState<{ monthly?: RcPackage; annual?: RcPackage } | null>(null);
  const [iapBusy, setIapBusy] = useState(false);
  // Carregar as ofertas leva alguns segundos. Sem este estado, quem abria o
  // paywall antes de terminar via "Assinatura indisponível neste app" — que é
  // a mensagem do modo leitor, não de carregamento.
  //
  // A espera só faz sentido onde existe o que esperar. Sem chave de compra
  // interna, `initPurchases` devolve null na primeira linha e o "Carregando os
  // planos…" vira uma promessa que a tela nunca cumpre — um piscar de esperança
  // antes do modo leitor. Espera só quem tem chave; hoje o iPhone, e o Android
  // no dia em que a chave da Play entrar no build.
  const [iapReady, setIapReady] = useState(!iapKey());
  useEffect(() => {
    if (!isNativeApp()) return;
    (async () => {
      const p = await initPurchases(user?.id ?? null);
      if (!p) { setIapReady(true); return; }
      try {
        const offs = await p.getOfferings();
        const pkgs = offs.current?.availablePackages ?? [];
        const monthly = pkgs.find((x) => x.packageType === "MONTHLY") ?? pkgs.find((x) => x.identifier === "$rc_monthly");
        const annual = pkgs.find((x) => x.packageType === "ANNUAL") ?? pkgs.find((x) => x.identifier === "$rc_annual");
        if (monthly || annual) setIap({ monthly, annual });
        // Ofertas de saída. Android: ofertas do Play dentro da assinatura.
        // iOS: pacotes custom com os produtos anuais com desconto.
        setExitOpts({ o10: googleOffer(annual, "exit10"), o25: googleOffer(annual, "exit25") });
        setExitPkgs({
          p10: pkgs.find((x) => x.identifier === "exit10") ?? null,
          p25: pkgs.find((x) => x.identifier === "exit25") ?? null,
        });
      } catch { /* sem ofertas → modo leitor */ }
      finally { setIapReady(true); }
    })();
  }, [user]);

  const buyNative = async () => {
    const pkg = plan === "monthly" ? iap?.monthly ?? iap?.annual : iap?.annual ?? iap?.monthly;
    if (!pkg || iapBusy) return;
    if (!user) { go({ name: "auth" }); return; }
    funil("iniciou_checkout", { origem: `loja-${plan}`, userId: user.id });
    setIapBusy(true);
    try {
      const p = await initPurchases(user.id);
      const res = await p?.purchasePackage({ aPackage: pkg });
      if (res && hasActiveEntitlement(res.customerInfo)) {
        setPremium(true);
        refreshSubscription();
        back();
      }
    } catch { /* cancelado/erro — permanece na tela */ } finally {
      setIapBusy(false);
    }
  };

  // Modo leitor: "já sou assinante". Não é compra nem restauração de loja —
  // é reler a tabela de assinaturas do Supabase, onde cai quem pagou pelo site.
  //
  // O resultado precisa de um pequeno intervalo: `refreshSubscription` devolve
  // void e escreve num estado, então quem toca no botão só descobre o desfecho
  // no render seguinte. Sem a espera o botão piscava e nada visível mudava —
  // que é indistinguível de um botão quebrado.
  const [conferindo, setConferindo] = useState(false);
  const [semAssinatura, setSemAssinatura] = useState(false);
  const reconferir = () => {
    setSemAssinatura(false);
    setConferindo(true);
    refreshSubscription();
  };
  useEffect(() => {
    if (!conferindo) return;
    if (subscribed) { setConferindo(false); back(); return; }
    const t = setTimeout(() => { setConferindo(false); setSemAssinatura(true); }, 1500);
    return () => clearTimeout(t);
  }, [conferindo, subscribed, back]);

  const restoreNative = async () => {
    try {
      const p = await initPurchases(user?.id ?? null);
      const res = await p?.restorePurchases();
      if (res && hasActiveEntitlement(res.customerInfo)) { setPremium(true); refreshSubscription(); back(); }
    } catch { /* ignore */ }
  };

  // Pop-ups do funil de saída. Definidos aqui (e não no JSX de um caminho só)
  // porque precisam renderizar tanto na web quanto no paywall nativo — antes
  // eles moravam depois do return nativo e o app da loja segurava a navegação
  // para mostrar uma tela que não existia.
  // Preços: no Android da oferta real do Play (offerPrice), no iOS do produto
  // com desconto da App Store (priceString), na web das strings do Stripe.
  const exitOverlays = (
    <>
      {/* Pop-up de saída — 10% OFF (formato Bloom) */}
      {showOffer && (
        <div className="fixed inset-0 z-50 bg-black/60">
          <div className="absolute inset-x-0 bottom-0 app-col rounded-t-3xl bg-cream px-6 pb-8 pt-5 text-center text-graphite">
            <button
              onClick={dismissOffer1}
              aria-label="fechar oferta"
              className="absolute right-4 top-4 text-graphite/45 hover:text-graphite"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <h2 className="mx-auto mt-4 max-w-xs font-serif text-2xl font-bold leading-snug">{sub.exitTitle}</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-graphite/55">{sub.exitSub}</p>
            <p className="mt-4 text-xs text-graphite/50">{sub.exitExpires}</p>
            <p className="font-display text-3xl font-bold tabular-nums">{mmss}</p>
            <div className="mt-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-bold text-graphite">{sub.exitBadge}</span>
              <p className="mt-2 font-serif text-3xl font-bold">{(isNativeApp() && (offerPrice(exitOpts.o10) ?? exitPkgs.p10?.product?.priceString)) || sub.exitPrice}</p>
            </div>
            <button
              onClick={subscribeOffer}
              className="mt-4 w-full rounded-full bg-graphite py-3.5 font-display text-[15px] font-semibold text-cream active:scale-[0.99]"
            >
              {sub.exitCta}
            </button>
            <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-graphite/55">{sub.exitFine}</p>
          </div>
        </div>
      )}

      {/* Oferta final — 25% OFF em tela cheia (formato Bloom) */}
      {showOffer2 && (
        <div className="fixed inset-0 z-[60] app-col overflow-y-auto bg-graphite-900 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-h-full flex-col px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[max(env(safe-area-inset-top),20px)]">
            {/* Biela + faixas "OFERTA ÚNICA" (sem X — a recusa fica embaixo) */}
            <div className="relative mt-2 flex h-52 items-center justify-center overflow-hidden">
              {[
                { top: "top-3", rot: "-rotate-[18deg]" },
                { top: "top-16", rot: "rotate-[14deg]" },
                { top: "top-32", rot: "-rotate-[10deg]" },
              ].map((r, idx) => (
                <div key={idx} className={`absolute ${r.top} left-[-30%] w-[160%] ${r.rot} whitespace-nowrap bg-amber/10 py-1 text-center text-[10px] font-semibold tracking-[0.2em] text-amber/60`}>
                  {Array.from({ length: 4 }, () => sub.exit2Ribbon).join("   ·   ")}
                </div>
              ))}
              <div className="relative z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/biela/biela-acenando.png" alt="Biela" className="h-44 w-44 object-contain" draggable={false} />
              </div>
            </div>

            <h2 className="mt-3 text-center font-serif text-4xl font-bold text-cream">{sub.exit2Title}</h2>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-amber">
              <span aria-hidden>⚠️</span> {sub.exit2Warn}
            </p>

            <div className="mt-5 rounded-3xl bg-graphite-800 p-5 text-center ring-1 ring-white/[0.06]">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cream/60">{sub.exit2Best}</p>
              <div className="mt-3 rounded-2xl bg-graphite-900 p-4 ring-1 ring-white/[0.06]">
                <p className="text-sm text-cream/40 line-through">{(isNativeApp() && (iap?.annual?.product?.priceString ?? null)) || sub.exit2Old}</p>
                <p className="mt-0.5 font-serif text-3xl font-bold text-cream">{(isNativeApp() && (offerPrice(exitOpts.o25) ?? exitPkgs.p25?.product?.priceString)) || sub.exit2Price}</p>
              </div>
            </div>
            <p className="mx-auto mt-3 max-w-xs text-center text-xs leading-relaxed text-cream/50">{sub.exit2Fine}</p>

            <div className="mt-auto pt-5">
              <button
                onClick={subscribeOffer2}
                className="w-full rounded-full bg-amber py-3.5 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
              >
                {sub.exit2Cta}
              </button>
              {/* Recusa discreta — sai da oferta */}
              <button
                onClick={() => { setShowOffer2(false); exitNow(); }}
                className="mx-auto mt-3 block text-xs text-cream/35 underline-offset-2 hover:text-cream/60 hover:underline"
              >
                {sub.exit2Skip}
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/45">
                {sub.exit2Agree} <LegalLinks underline />
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isNativeApp()) {
    // Paywall com compra interna (IAP) quando o RevenueCat está configurado.
    if (iap) {
      return (
        <div className="flex min-h-[80vh] flex-col px-2 pb-6">
          <div className="flex items-center justify-between pb-2 pt-4 text-xs text-cream/50">
            <button onClick={back} aria-label="fechar" className="grid h-8 w-8 place-items-center rounded-full bg-graphite-700 text-cream/70">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <button onClick={restoreNative} className="hover:text-cream">{sub.restore}</button>
          </div>
          <div className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/biela/biela-idle.png" alt="Biela" className="h-28 w-28 object-contain" draggable={false} />
            <h1 className="mt-1 font-serif text-2xl font-bold text-cream">{sub.trialTitle}</h1>
          </div>
          <ul className="mx-auto mt-3 max-w-sm space-y-2">
            {sub.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-cream/85"><TealCheck /> {b}</li>
            ))}
          </ul>
          {/* Antes de escolher o plano, o que muda de um para o outro. */}
          <div className="mt-4"><ComparativoPlanos /></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["annual", "monthly"] as const).map((k) => {
              const pkg = k === "annual" ? iap.annual : iap.monthly;
              if (!pkg) return <span key={k} />;
              const sel = plan === k;
              return (
                <button key={k} onClick={() => setPlan(k)} className={`rounded-2xl p-4 text-left ring-2 transition-colors ${sel ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}>
                  <span className="block font-display text-base font-bold">{k === "annual" ? sub.planAnnual : sub.planMonthly}</span>
                  <span className={`mt-0.5 block text-sm ${sel ? "text-graphite/75" : "text-cream/60"}`}>
                    {pkg.product?.priceString ?? (k === "annual" ? sub.planAnnualPrice : sub.planMonthlyPrice)}
                  </span>
                </button>
              );
            })}
          </div>
          <Button size="lg" className="mt-4 w-full" onClick={buyNative} disabled={iapBusy}>
            {iapBusy ? "…" : sub.trialCta.replace("{n}", String(trialDays))}
          </Button>

          {/*
            Ficha da assinatura + links legais.

            A diretriz 3.1.2(c) da Apple exige, DENTRO do app, quatro coisas
            juntas: título da assinatura, duração, preço e links funcionais para
            os termos e a privacidade. Os três primeiros existiam espalhados
            (nome do plano no cartão, preço vindo da Apple, prazo só na letra
            miúda) e os links não existiam de todo neste caminho — o paywall
            nativo retorna antes do trecho da web, que era o único que os tinha.
            Reunidos aqui, num bloco só, para a revisão encontrar de imediato.

            O preço vem de `product.priceString`: é o valor que a Apple vai
            cobrar de fato, na moeda da conta, e não uma cópia nossa que pode
            divergir do que está na App Store Connect.
          */}
          {(() => {
            // Um preço só na tela inteira: o que a loja vai cobrar de fato.
            //
            // A letra miúda trazia "R$ 239,90" escrito à mão. Assim que a loja
            // cobrasse outro valor, o cartão do plano dizia um preço e a linha
            // logo abaixo dizia outro — contradição na mesma tela, e a revisão
            // da Apple lê isso como preço incorreto (3.1.2(c)).
            const pkg = plan === "annual" ? iap.annual : iap.monthly;
            const preco = pkg?.product?.priceString ?? (plan === "annual" ? sub.planAnnualPrice : sub.planMonthlyPrice);
            const fine = (plan === "annual" ? sub.trialFine : sub.trialFineMonthly).replace("{preco}", preco);
            // Cada loja tem a sua conta e o seu lugar de cancelar.
            const renovacao = nativePlatform() === "android" ? sub.iapRenewNotePlay : sub.iapRenewNote;
            return (
              <div className="mx-auto mt-4 max-w-xs text-center text-xs leading-relaxed text-cream/45">
                <p className="text-cream/70">
                  {sub.iapProduct} · {plan === "annual" ? sub.planAnnual : sub.planMonthly} · {preco}
                </p>
                <p className="mt-1">{plan === "annual" ? sub.iapAnnualLength : sub.iapMonthlyLength}</p>
                <p className="mt-2">{fine}</p>
                <p className="mt-2">{renovacao}</p>
                <LegalLinks className="mt-3 text-cream/60" underline />
              </div>
            );
          })()}
          {exitOverlays}
        </div>
      );
    }
    // Ainda buscando as ofertas na Apple: espera, em vez de anunciar que não
    // dá para assinar.
    if (!iapReady) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber/30 border-t-amber" />
          <p className="text-sm text-cream/55">{sub.loadingIap}</p>
        </div>
      );
    }
    // Sem IAP configurado (ex.: Android): modo leitor.
    //
    // Esta tela é o DESTINO de quase trinta caminhos — o card da Biela, cada
    // aula trancada, o limite de carros, o botão do house ad. Ela era um beco:
    // uma frase mandando "entre na sua conta" e um "Entendi" que só voltava.
    // Quem estava deslogado não tinha como entrar dali, e quem já assinava na
    // web não tinha como pedir ao app que conferisse de novo.
    //
    // O que entra é só restauração de acesso (entrar / reconferir) e a
    // comparação de planos, que explica por que aquele cadeado existe. Convite
    // de compra por fora continua fora: é o que a política do Play proíbe.
    return (
      <div className="flex min-h-[70vh] flex-col px-2 pb-6">
        <div className="flex items-center pb-2 pt-4">
          <button onClick={back} aria-label="fechar" className="grid h-8 w-8 place-items-center rounded-full bg-graphite-700 text-cream/70">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/biela/biela-idle.png" alt="Biela" className="h-28 w-28 object-contain" draggable={false} />
          <h1 className="mt-2 font-serif text-2xl font-bold text-cream">{sub.readerTitle}</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-cream/60">{sub.readerBody}</p>
        </div>

        <div className="mt-5">
          {user ? (
            <>
              <Button className="w-full" onClick={reconferir} disabled={conferindo}>
                {conferindo ? sub.readerChecking : sub.readerRefresh}
              </Button>
              {semAssinatura && <p className="mt-2 text-center text-xs text-cream/45">{sub.readerNotFound}</p>}
            </>
          ) : (
            <Button className="w-full" onClick={() => go({ name: "auth" })}>{sub.readerSignIn}</Button>
          )}
        </div>

        {/* Por que aquele cadeado existe. Sem preço e sem botão de compra. */}
        <div className="mt-5"><ComparativoPlanos /></div>

        <button onClick={back} className="mx-auto mt-5 block text-sm text-cream/45 hover:text-cream/70">{sub.readerOk}</button>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Barra superior: fechar + links */}
      <div className="flex items-center justify-between pb-3 pt-4 text-xs text-cream/50">
        <button onClick={tryClose} aria-label="fechar" className="grid h-8 w-8 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => { refreshSubscription(); if (subscribed) back(); }} className="hover:text-cream">{sub.restore}</button>
          <span>·</span>
          <LegalLinks />
        </div>
      </div>

      {/* Herói */}
      <div className="flex flex-col items-center px-4 text-center">
        <img src="/biela/biela-idle.png" alt="Biela" className="h-32 w-32 object-contain" draggable={false} />
        <h1 className="mt-2 font-serif text-2xl font-bold text-cream">{sub.trialTitle}</h1>
      </div>

      {/* Benefícios */}
      <ul className="mx-auto mt-4 max-w-sm space-y-2.5">
        {sub.bullets.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-sm text-cream/85">
            <TealCheck /> {b}
          </li>
        ))}
      </ul>

      {/* Depoimentos */}
      <div className="mt-4 space-y-3">
        {sub.testimonials.map((t) => (
          <Card key={t.name}>
            <p className="text-amber">★★★★★</p>
            <p className="mt-1.5 text-sm italic text-cream/85">&quot;{t.quote}&quot;</p>
            <p className="mt-1 text-xs text-cream/50">— {t.name}</p>
          </Card>
        ))}
      </div>

      {/* Conheça o Premium — comparação */}
      <div className="mt-4"><ComparativoPlanos /></div>

      {/* Cancelamento no controle de quem assina (linha compacta) */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-graphite-800 px-3.5 py-2.5 ring-1 ring-white/[0.06]">
        <Icon name="alert" className="h-4 w-4 text-cream/50" />
        <span className="flex-1 text-xs text-cream/70">{sub.reminder}</span>
      </div>

      {/* Escolha do plano */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setPlan("annual")}
          className={`relative rounded-2xl p-4 text-left ring-2 transition-colors ${plan === "annual" ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}
        >
          <span className={`absolute -top-2.5 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${plan === "annual" ? "bg-graphite text-amber" : "bg-amber/20 text-amber"}`}>{sub.planBadge}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/badges/badge-anual.png" alt="" className="absolute -top-3 right-2 h-11 w-11 object-contain drop-shadow" draggable={false} />
          <span className="block font-display text-base font-bold">{sub.planAnnual}</span>
          <span className={`mt-0.5 block text-sm ${plan === "annual" ? "text-graphite/75" : "text-cream/60"}`}>{sub.planAnnualPrice}</span>
          <span className={`block text-xs ${plan === "annual" ? "text-graphite/60" : "text-cream/45"}`}>{sub.planAnnualNote}</span>
        </button>
        <button
          onClick={() => setPlan("monthly")}
          className={`rounded-2xl p-4 text-left ring-2 transition-colors ${plan === "monthly" ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}
        >
          <span className="block font-display text-base font-bold">{sub.planMonthly}</span>
          <span className={`mt-0.5 block text-sm ${plan === "monthly" ? "text-graphite/75" : "text-cream/60"}`}>{sub.planMonthlyPrice}</span>
        </button>
      </div>

      {/* CTA */}
      <Button size="lg" className="mt-4 w-full" onClick={subscribe}>
        {sub.trialCta.replace("{n}", String(trialDays))}
      </Button>
      <p className="mx-auto mt-3 max-w-xs text-center text-xs leading-relaxed text-cream/45">
        {/* Na web quem cobra é o Stripe, então o preço vem da mesma constante
            que o cartão do plano acima — os dois nunca divergem. */}
        {(plan === "annual" ? sub.trialFine : sub.trialFineMonthly)
          .replace("{preco}", plan === "annual" ? sub.planAnnualPrice : sub.planMonthlyPrice)}
      </p>

      {exitOverlays}
    </div>
  );
}

// 3.1.F — Checkout embutido (Stripe Embedded Checkout)