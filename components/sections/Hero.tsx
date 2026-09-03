"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { StoreBadges } from "@/components/ui/StoreBadges";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import BielaNoCarro from "@/components/BielaNoCarro";
import { HexMotif } from "@/components/ui/HexMotif";

const ROTATE_MS = 5000;

export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const headlines = t.hero.headlines;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex((next + headlines.length) % headlines.length),
    [headlines.length]
  );

  useEffect(() => {
    if (reduce || paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % headlines.length), ROTATE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduce, paused, headlines.length]);

  const current = headlines[index];

  return (
    <section id="top" className="relative overflow-hidden bg-graphite px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
      {/* quiet brand motif + warm glow, no decorative stripes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hex-field opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(242,166,35,0.16), transparent)" }}
      />
      <HexMotif
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 text-amber/10"
      />

      {/* `min-w-0` nas duas colunas: por padrão uma coluna de grid nunca fica
          menor que o conteúdo dela, então basta um filho de largura fixa para
          esticar a grade inteira além da tela. Com a seção em `overflow-hidden`
          isso não vira rolagem, vira corte. */}
      <div className="relative mx-auto grid w-full max-w-content items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-amber ring-1 ring-white/10">
            {t.hero.eyebrow}
          </p>

          {/* headline carousel */}
          <div
            className="min-h-[8.5rem] sm:min-h-[10.5rem]"
            role="group"
            aria-roledescription="carousel"
            aria-label={t.hero.carouselLabel}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={index}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]"
              >
                <span className="text-cream">{current.a}</span>
                <span className="text-amber">{current.b}</span>
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* carousel dots */}
          <div className="mt-4 flex items-center gap-2" aria-hidden={false}>
            {headlines.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${t.hero.goTo} ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-amber" : "w-2 bg-white/25 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">{t.hero.subheadline}</p>

          {/* O DOWNLOAD VIROU O PRIMEIRO GESTO DA PÁGINA, em 03/09/2026.
              Aqui morava o formulário da lista de espera, e ele fazia sentido
              enquanto o app não existia. Com ele publicado nas duas lojas, pedir
              e-mail para avisar de um lançamento que já aconteceu é gastar o
              melhor lugar da página com um pedido que não leva a nada. */}
          <div id="baixar" className="mt-8 scroll-mt-28">
            <StoreBadges />
          </div>

          <p className="mt-4 text-sm text-cream/55">{t.hero.ctaNote}</p>

          {/* O caminho de quem está no computador, ou de quem não quer instalar
              nada agora. Discreto de propósito: a loja continua sendo o destino
              principal, e este link existe para não perder quem não pode ir
              até ela neste momento. */}
          <a
            href="/app?utm_source=site&utm_campaign=hero-web"
            className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-amber hover:text-amber-300"
          >
            {t.hero.usarNoNavegador}
            <span aria-hidden>›</span>
          </a>
        </div>

        <div className="relative flex min-w-0 flex-col items-center gap-8">
          {/* Cena da Biela dirigindo (handoff "Onde aplicar" → Hero da landing) */}
          <BielaNoCarro size={400} />
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
