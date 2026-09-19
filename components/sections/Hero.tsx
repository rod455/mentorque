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
    <section id="top" className="relative overflow-hidden bg-graphite px-5 pb-20 pt-24 sm:px-8 sm:pt-24">
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
          {/* A ENTRADA É ENCADEADA, E O MOTIVO É HIERARQUIA (19/09/2026).
              Os três blocos aparecem na ordem em que precisam ser lidos:
              onde estamos, o que prometemos, o que fazer. Não é enfeite: sem a
              ordem, os três chegam juntos e o olho escolhe sozinho por onde
              começar, que costuma ser o botão. Quem pede menos movimento não vê
              nada disso (`useReducedMotion`), e a página continua inteira. */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-amber ring-1 ring-white/10"
          >
            {t.hero.eyebrow}
          </motion.p>

          {/* headline carousel */}
          {/* A ALTURA MÍNIMA PRECISA CABER A FRASE MAIS ALTA, E ISSO FOI MEDIDO
              (19/09/2026). As três frases giram aqui dentro e não têm a mesma
              altura: no celular a terceira ocupa 142px contra 106px das outras.
              Se o trilho for menor que ela, a caixa cresce quando ela entra e
              empurra tudo que vem abaixo, botões de loja inclusive. Isso é o
              CLS, o pulo da página, e foi medido em 0,19 com o rastro do
              Chrome DevTools, quando acima de 0,10 já é ruim.

              Os valores não são gosto, são medida, e são DOIS porque a frase
              quebra diferente conforme a largura:

                até 359px  -> a frase mais alta ocupa 177px  (trilho 11.25rem)
                360 a 639  -> ocupa 142px                    (trilho 9rem)
                640 para cima -> ocupa 149px                 (trilho 9.5rem)

              Um número só para tudo obrigaria 180px em todo celular, jogando
              fora quase 40px de tela nos aparelhos comuns, que é o espaço que
              faz o botão de loja aparecer sem rolar.

              Quem mexer no TEXTO da manchete precisa medir de novo, porque
              frase mais longa volta a estourar. A conferência que pega isso
              roda em quatro larguras dentro de scripts/navegador/site.mjs, e
              foi ela que achou o caso de 320px que este comentário quase não
              teve. */}
          <div
            className="min-h-[11.25rem] min-[360px]:min-h-[9rem] sm:min-h-[9.5rem]"
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
                className="text-balance text-[2.15rem] font-bold leading-[1.03] tracking-[-0.022em] sm:text-5xl lg:text-[3.1rem]"
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

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[54ch] text-[1.0625rem] leading-[1.65] text-cream/70"
          >
            {t.hero.subheadline}
          </motion.p>

          {/* O DOWNLOAD VIROU O PRIMEIRO GESTO DA PÁGINA, em 03/09/2026.
              Aqui morava o formulário da lista de espera, e ele fazia sentido
              enquanto o app não existia. Com ele publicado nas duas lojas, pedir
              e-mail para avisar de um lançamento que já aconteceu é gastar o
              melhor lugar da página com um pedido que não leva a nada. */}
          <motion.div
            id="baixar"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 scroll-mt-28"
          >
            <StoreBadges />
            {/* A NOTA FICA, contra a regra da skill de direção visual, que manda
                tirar qualquer linha miúda embaixo do botão. Aqui ela não é
                enfeite: é o que responde "vai me custar alguma coisa?" no exato
                ponto em que a pessoa decide tocar. Tirar isso é decisão de CRO
                com medição, não de gosto. */}
            <p className="mt-4 text-sm text-cream/55">{t.hero.ctaNote}</p>
          </motion.div>

          {/* Aqui morou, de 03/09 a 12/09/2026, o link "use pelo navegador".
              Saiu por decisão do dono: o caminho da web não tem recorrência
              nenhuma (sem aviso, sem push), e virou a maior porta em número
              sem ninguém voltar. A loja é o único destino. O /app continua
              existindo e abrindo para quem digita o endereço; o que não pode
              é o site levar até lá (scripts/verifica-caminho.ts confere). */}
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
