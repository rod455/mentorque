"use client";

import { useEffect, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useSwipe } from "@/lib/app/swipe";
import { useAuth } from "@/lib/app/auth";
import { trialDaysFor, trialPlatform } from "@/lib/app/platform";
import { isNativeApp, sellsInApp } from "@/lib/app/wrapper";
import { hasActiveEntitlement, initPurchases, type RcPackage } from "@/lib/app/purchases";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { Icon, LegalLinks, PhoneFrame, ProgressDots, useContent } from "./ui";
import BielaMascote from "@/components/BielaMascote";
import CarroMentorque from "@/components/CarroMentorque";

function CheckDot() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal text-graphite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

// 0.1 — Onboarding (5 páginas): 3 cards de apresentação + prova social +
// monte seu teste. Termina no app (Home) ou no paywall, conforme a escolha.
export function OnboardingFlow() {
  const c = useContent();
  const cards = c.splash.cards;
  const social = c.splash.social;
  const trial = c.splash.trial;
  const { finishOnboarding, setPremium } = usePrototype();
  const { user } = useAuth();
  const [i, setI] = useState(0);
  const [carLeaving, setCarLeaving] = useState(false);
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  // Onde dá para assinar: web (Stripe) e a loja que tiver chave de compra
  // interna. Sem chave o app fica em "modo leitor" e a página de teste some —
  // é o caso do Android enquanto o Play Billing não estiver ligado.
  //
  // A regra é uma só, em `sellsInApp()`. Estava duplicada aqui, e regra
  // duplicada é como uma das cópias deixa de valer sem ninguém notar: ligar o
  // Android teria acendido o paywall e deixado o onboarding mudo.
  const [sells, setSells] = useState(true);
  useEffect(() => {
    setSells(sellsInApp());
  }, []);

  // No iOS a compra é da Apple: carregamos as ofertas já aqui para o botão
  // "Continuar" abrir a folha de pagamento na hora, em vez de levar o
  // motorista a mais uma tela para tocar de novo.
  const [iap, setIap] = useState<{ monthly?: RcPackage; annual?: RcPackage } | null>(null);
  const [buying, setBuying] = useState(false);
  useEffect(() => {
    if (!isNativeApp()) return;
    (async () => {
      const rc = await initPurchases(null);
      if (!rc) return;
      try {
        const offs = await rc.getOfferings();
        const pkgs = offs.current?.availablePackages ?? [];
        const monthly = pkgs.find((x) => x.packageType === "MONTHLY") ?? pkgs.find((x) => x.identifier === "$rc_monthly");
        const annual = pkgs.find((x) => x.packageType === "ANNUAL") ?? pkgs.find((x) => x.identifier === "$rc_annual");
        if (monthly || annual) setIap({ monthly, annual });
      } catch { /* sem ofertas: cai no fluxo antigo */ }
    })();
  }, []);
  const total = cards.length + (sells ? 2 : 1); // 3 cards + social (+ teste onde vende)
  const last = i === total - 1;
  const card = i < cards.length ? cards[i] : null;

  const [trialDays, setTrialDays] = useState(7);
  useEffect(() => setTrialDays(trialDaysFor(trialPlatform())), []);

  // Última página: Continuar leva ao paywall/checkout do plano escolhido.
  const finishToPlan = () => {
    try { window.sessionStorage.setItem("mentorque-onboarding-plan", plan); } catch { /* ignore */ }
    finishOnboarding();
  };

  // Onde vende, a última página é a do teste e leva ao paywall (no iOS, direto
  // na compra da Apple). No Android a última é a prova social e encerra.
  // No iOS com as ofertas em mãos, "Continuar" na última página compra direto:
  // abre a folha de pagamento da Apple sem passar por outra tela. Se a compra
  // não estiver disponível (ofertas ainda carregando, Android, web), segue o
  // caminho antigo pelo paywall.
  const buyNow = async () => {
    const pkg = plan === "monthly" ? iap?.monthly ?? iap?.annual : iap?.annual ?? iap?.monthly;
    const rc = pkg ? await initPurchases(null) : null;
    if (!pkg || !rc) { finishToPlan(); return; }
    setBuying(true);
    try {
      const res = await rc.purchasePackage({ aPackage: pkg });
      if (res && hasActiveEntitlement(res.customerInfo)) setPremium(true);
      finishOnboarding();
    } catch {
      // Cancelou ou falhou: entra no app do mesmo jeito, sem travar ninguém.
      finishOnboarding();
    } finally {
      setBuying(false);
    }
  };

  const advance = () => {
    if (!last) { setI((v) => v + 1); return; }
    if (!sells) { finishOnboarding(); return; }
    // Comprar deslogado deixaria a assinatura numa conta anônima do RevenueCat:
    // o motorista pagaria e o Premium não apareceria na conta dele, nem em
    // outro aparelho, nem no site. Sem login, o plano escolhido fica guardado e
    // o app pede para entrar antes de abrir a folha da Apple (ver Shell.tsx).
    if (isNativeApp() && iap && user) { void buyNow(); return; }
    finishToPlan();
  };

  // Arrastar na tela troca de página: para a direita volta, para a esquerda
  // avança (mesmo efeito do botão Continuar).
  const swipe = useSwipe({
    onRight: () => { if (!carLeaving && i > 0) setI((v) => v - 1); },
    onLeft: () => { if (!carLeaving) onContinue(); },
  });

  const onContinue = () => {
    if (carLeaving) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // First card: the car revs, accelerates and drives off before advancing.
    if (i === 0 && !reduce) {
      setCarLeaving(true);
      setTimeout(() => {
        setI(1);
        setCarLeaving(false);
      }, 1350);
    } else {
      advance();
    }
  };

  return (
    <PhoneFrame>
      <div
        className="flex flex-1 flex-col"
        {...swipe}
      >
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <ProgressDots total={total} index={i} />
        {last ? (
          <button onClick={finishOnboarding} className="text-xs text-cream/50 hover:text-cream">{trial.notNow}</button>
        ) : (
          <LangSwitcher />
        )}
      </div>

      {card ? (
        /* Páginas 1–3 — cards de apresentação */
        <div className="flex flex-1 flex-col px-6 pb-8">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            {/* Ilustração por card: 0 carro, 1 Biela idle, 2 cena da garagem. */}
            <div className="relative mb-8 flex min-h-[19rem] items-center justify-center">
              {i === 0 ? (
                <div className={carLeaving ? "car-exit" : ""}>
                  <CarroMentorque size={300} driving speed={carLeaving ? 0.2 : 0.9} boost={carLeaving} />
                </div>
              ) : i === 1 ? (
                <BielaMascote size={188} />
              ) : (
                <img
                  src="/onboarding/cena-garagem.png"
                  alt="Biela na garagem com o conversível Mentorque"
                  className="w-[300px] max-w-full select-none"
                  draggable={false}
                />
              )}
            </div>
            <div className={`transition-opacity duration-300 ${carLeaving ? "opacity-0" : "opacity-100"}`}>
              <h1 className="text-balance font-display text-[26px] font-bold leading-tight text-cream">{card.title}</h1>
              <p className="mx-auto mt-3 max-w-xs text-pretty text-sm text-cream/70">{card.body}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button size="lg" className="w-full" onClick={onContinue} disabled={carLeaving}>
              {c.splash.next}
            </Button>
          </div>
        </div>
      ) : i === cards.length ? (
        /* Página 4 — prova social (formato Bloom: cards sobrepostos, sem scroll) */
        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h1 className="mt-1 font-serif text-[28px] font-bold leading-tight text-cream">{social.title}</h1>
          <p className="mt-1.5 text-sm text-cream/50">{social.sub}</p>

          {/* Nota central ladeada por ícones (como as folhas do Bloom) */}
          <div className="mt-5 flex items-center justify-center gap-8">
            <Icon name="tools" className="h-8 w-8 text-amber/30" />
            <div className="text-center">
              <p className="font-serif text-4xl font-bold leading-none text-cream">{social.rating}</p>
              <p className="mt-1 text-base tracking-wide text-amber">★★★★★</p>
              <p className="mt-0.5 text-xs text-cream/45">{social.ratingNote}</p>
            </div>
            <Icon name="engine" className="h-8 w-8 text-amber/30" />
          </div>

          {/* Estatísticas */}
          <div className="mt-5 grid grid-cols-2 divide-x divide-white/10">
            <div className="pr-4 text-center">
              <p className="font-serif text-2xl font-bold leading-tight text-cream">{social.stat1}</p>
              <p className="text-xs text-cream/45">{social.stat1Label}</p>
            </div>
            <div className="pl-4 text-center">
              <p className="font-serif text-2xl font-bold leading-tight text-cream">{social.stat2}</p>
              <p className="text-xs text-cream/45">{social.stat2Label}</p>
            </div>
          </div>

          {/* Depoimentos sobrepostos e inclinados, como na referência */}
          <div className="mt-5 min-h-0 flex-1">
            {social.quotes.map((q, idx) => (
              <div
                key={q.name}
                style={{ zIndex: idx + 1 }}
                className={`relative rounded-2xl bg-graphite-800 px-3.5 py-3 shadow-card ring-1 ring-white/[0.1] ${
                  idx === 0 ? "" : "-mt-6"
                } ${idx % 2 === 0 ? "-rotate-2 mr-12" : "rotate-2 ml-12"}`}
              >
                <p className="text-xs tracking-wide text-amber">★★★★★</p>
                <p className="mt-1 text-[13px] leading-snug text-cream/90">{q.quote}</p>
                <p className="mt-1 text-[11px] font-medium text-cream/55">{q.name} <span className="text-teal">✔</span></p>
              </div>
            ))}
          </div>

          <Button size="lg" className="mt-4 w-full shrink-0" onClick={onContinue}>
            {c.splash.next}
          </Button>
        </div>
      ) : (
        /* Página 5 — monte seu teste */
        <div className="flex flex-1 flex-col overflow-hidden px-6 pb-4">
          {/* Biela cercada de recursos */}
          {/* A arte da Biela e 615x1102 (bem alta): o `size` do componente e a
              LARGURA, e a altura sai proporcional (1,79x). Com 118 de largura
              ela ocupava 211px numa caixa de 144 e ficava cortada. Aqui a
              largura e calculada a partir da altura que cabe. */}
          <div className="relative mx-auto flex h-56 w-full max-w-xs items-end justify-center">
            <BielaMascote size={124} />
            {[
              { icon: "diagnose", cls: "left-0 top-4" },
              { icon: "calendar", cls: "left-6 bottom-2" },
              { icon: "spark", cls: "right-0 top-4" },
              { icon: "book", cls: "right-6 bottom-2" },
            ].map((b) => (
              <span key={b.icon} className={`absolute ${b.cls} grid h-10 w-10 place-items-center rounded-full bg-graphite-800 text-amber ring-1 ring-white/10`}>
                <Icon name={b.icon} className="h-5 w-5" />
              </span>
            ))}
          </div>

          <h1 className="mt-2 text-center font-serif text-[28px] font-bold text-cream">{trial.title}</h1>

          <div className="mt-3 space-y-2.5 rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/[0.06]">
            {trial.bullets.map((b) => (
              <div key={b} className="flex items-center gap-2.5 text-sm text-cream/85">
                <CheckDot /> {b.replace("{n}", String(trialDays))}
              </div>
            ))}
          </div>

          {/* Escolha do plano */}
          <div className="mt-3.5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setPlan("annual")}
              className={`rounded-2xl p-4 text-left ring-2 transition-colors ${plan === "annual" ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}
            >
              <span className="flex items-center justify-between">
                <span className="font-display text-base font-bold">{trial.freeLabel}</span>
                <span className={`grid h-5 w-5 place-items-center rounded-full ${plan === "annual" ? "bg-graphite text-amber" : "ring-1 ring-white/25"}`}>
                  {plan === "annual" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>}
                </span>
              </span>
              <span className={`mt-0.5 block text-sm ${plan === "annual" ? "text-graphite/70" : "text-cream/55"}`}>{trial.freeDays.replace("{n}", String(trialDays))}</span>
            </button>
            <button
              onClick={() => setPlan("monthly")}
              className={`rounded-2xl p-4 text-left ring-2 transition-colors ${plan === "monthly" ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}
            >
              <span className="flex items-center justify-between">
                <span className="font-display text-base font-bold">{trial.monthlyLabel}</span>
                <span className={`grid h-5 w-5 place-items-center rounded-full ${plan === "monthly" ? "bg-graphite text-amber" : "ring-1 ring-white/25"}`}>
                  {plan === "monthly" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>}
                </span>
              </span>
              <span className={`mt-0.5 block text-sm ${plan === "monthly" ? "text-graphite/70" : "text-cream/55"}`}>{trial.monthlyPrice}</span>
            </button>
          </div>

          {/* Preço em evidência (formato Bloom) */}
          <p className="mt-3 text-center text-sm leading-snug text-cream/60">
            {plan === "annual" ? (
              <>
                {trial.finePrefix.replace("{n}", String(trialDays))}{" "}
                <strong className="font-display text-base font-bold text-cream">{trial.finePrice}</strong>
                {trial.fineSuffix}
              </>
            ) : (
              <>
                <strong className="font-display text-base font-bold text-cream">{trial.fineMonthlyPrice}</strong>
                {trial.fineMonthlySuffix}
              </>
            )}
          </p>

          <div className="mt-auto pt-3">
            <Button size="lg" className="w-full" onClick={onContinue} disabled={buying}>
              {buying ? "…" : plan === "annual" ? trial.ctaAnnual : trial.ctaMonthly}
            </Button>

            {/* Quem manda no cancelamento é a pessoa, e ela sabe onde */}
            <p className="mt-2.5 rounded-xl bg-graphite-800 px-3.5 py-2 text-xs text-cream/70 ring-1 ring-white/[0.06]">
              {c.subscribe.reminder}
            </p>

            <div className="mt-2.5 flex items-center justify-center text-xs text-cream/45">
              <LegalLinks />
            </div>
          </div>
        </div>
      )}
      </div>

      <style jsx>{`
        .car-exit {
          animation: car-drive-off 1.35s cubic-bezier(0.5, 0, 0.72, 0.3) forwards;
        }
        @keyframes car-drive-off {
          0% { transform: translateX(0); opacity: 1; }
          14% { transform: translateX(20px); }
          40% { opacity: 1; }
          82% { opacity: 0; }
          100% { transform: translateX(-135vw); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .car-exit { animation: none; }
        }
      `}</style>
    </PhoneFrame>
  );
}
