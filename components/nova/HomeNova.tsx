"use client";

// HOME ALTERNATIVA, para o dono comparar (19/09/2026).
//
// POR QUE ELA EXISTE. Em 19/09 rodamos a skill de direção visual na primeira
// dobra da home em modo PRESERVAR, e o dono olhou e disse, com razão, que não
// via diferença nenhuma. Ele mostrou um post de Instagram onde o mesmo tipo de
// skill produz um resultado espetacular, e a comparação não era justa: no post,
// a pessoa cria uma página DO ZERO e entrega a direção de arte pronta no prompt
// (fundo #f5f5f7, título de 72 a 92px, peso 800). Do nada para alguma coisa,
// qualquer resultado parece um salto. Preservar uma marca já decidida, não.
//
// Então esta é a versão em modo REFORMA, e ela mora numa rota separada de
// propósito: a home de verdade não muda uma vírgula enquanto o dono não
// escolher. Se ele escolher esta, o conteúdo daqui vira as seções de lá; se não
// escolher, a pasta inteira sai e nada foi perdido.
//
// O QUE MUDA, e o que NÃO muda:
//
//   muda   → escala de tipo (a manchete vai de 3,1rem para até 6rem), a
//            composição (editorial de uma coluna, não a divisão 50/50), o ritmo
//            de claro e escuro, e cartão virou trilho dividido onde a elevação
//            não dizia nada
//   NÃO    → o texto, palavra por palavra, que é do dono e tem histórico de
//            teste; a marca (grafite, creme, âmbar); e o destino dos botões,
//            que continua sendo só a loja
//
// A DOBRA NÃO TEM CELULAR. O da home é uma tela falsa montada com `div`, e
// aumentar uma tela falsa é piorar. Aqui o peso visual é tipografia e ar, que é
// exatamente o que a referência do post faz. Quando houver captura real do app,
// ela entra aqui sem mexer em mais nada.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { StoreBadges } from "@/components/ui/StoreBadges";
import { Footer } from "@/components/sections/Footer";
import { HexMotif } from "@/components/ui/HexMotif";

const ROTACAO_MS = 5200;

/** Entrada por rolagem, com o mesmo tempo em toda a página. */
function useEntrada() {
  const reduce = useReducedMotion();
  return (atraso = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.55, delay: atraso, ease: [0.16, 1, 0.3, 1] as const },
  });
}

/** Sobrescrita miúda que abre cada seção. Um só estilo na página inteira. */
function Sobrescrita({ children, escuro = true }: { children: string; escuro?: boolean }) {
  return (
    <p
      className={`mb-5 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] ${
        escuro ? "text-amber" : "text-coral"
      }`}
    >
      <span aria-hidden className="inline-block h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}

function Barra() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-graphite/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-5 sm:px-8">
        <span className="font-display text-lg font-bold tracking-[-0.02em] text-cream">
          Mentorque
        </span>
        <a
          href="#baixar"
          className="rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-graphite transition-[background-color,transform] duration-200 hover:bg-amber-300 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          {t.nav.cta}
        </a>
      </div>
    </header>
  );
}

function Dobra() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const frases = t.hero.headlines;
  const [i, setI] = useState(0);
  const [parado, setParado] = useState(false);
  const relogio = useRef<ReturnType<typeof setInterval> | null>(null);

  const ir = useCallback(
    (n: number) => setI((n + frases.length) % frases.length),
    [frases.length]
  );

  useEffect(() => {
    if (reduce || parado) return;
    relogio.current = setInterval(() => setI((x) => (x + 1) % frases.length), ROTACAO_MS);
    return () => {
      if (relogio.current) clearInterval(relogio.current);
    };
  }, [reduce, parado, frases.length]);

  const atual = frases[i];
  const entrada = (atraso: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: atraso, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section className="relative overflow-hidden bg-graphite">
      <div aria-hidden className="pointer-events-none absolute inset-0 hex-field opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-52 -top-52 h-[42rem] w-[42rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(242,166,35,0.18), transparent)" }}
      />
      <HexMotif
        aria-hidden
        className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 text-amber/[0.07]"
      />

      {/* UMA COLUNA, NÃO DUAS. A home divide a dobra ao meio e paga por isso: a
          manchete nunca pode crescer, porque metade da largura já está vendida
          para o celular falso. Sem a divisão, a manchete ocupa a tela e é ela
          que faz o trabalho. */}
      <div className="relative mx-auto max-w-content px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <motion.p
          {...entrada(0)}
          className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-cream/80 ring-1 ring-white/10"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
          {t.hero.eyebrow}
        </motion.p>

        <div
          className="mt-8 min-h-[11rem] sm:min-h-[15rem] lg:min-h-[19rem]"
          role="group"
          aria-roledescription="carousel"
          aria-label={t.hero.carouselLabel}
          onMouseEnter={() => setParado(true)}
          onMouseLeave={() => setParado(false)}
          onFocusCapture={() => setParado(true)}
          onBlurCapture={() => setParado(false)}
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={i}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[15ch] font-display text-[clamp(2.6rem,8.5vw,6rem)] font-extrabold leading-[0.94] tracking-[-0.042em] text-cream"
            >
              {atual.a}
              <span className="text-amber">{atual.b}</span>
            </motion.h1>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center gap-2">
          {frases.map((_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => ir(n)}
              aria-label={`${t.hero.goTo} ${n + 1}`}
              aria-current={n === i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                n === i ? "w-10 bg-amber" : "w-4 bg-white/20 hover:bg-white/35"
              }`}
            />
          ))}
        </div>

        <motion.p
          {...entrada(0.1)}
          className="mt-10 max-w-[58ch] text-[1.125rem] leading-[1.6] text-cream/65"
        >
          {t.hero.subheadline}
        </motion.p>

        <motion.div {...entrada(0.2)} id="baixar" className="mt-10 scroll-mt-24">
          <StoreBadges />
          {/* A nota fica, como na home. Ela responde "vai me custar alguma
              coisa?" no instante do toque, e tirar isso é decisão de CRO com
              medição, não de gosto. */}
          <p className="mt-5 text-sm text-cream/50">{t.hero.ctaNote}</p>
        </motion.div>
      </div>
    </section>
  );
}

/** Trilho de três provas. Cartão não diria nada aqui, então é divisória. */
function Provas() {
  const { t } = useI18n();
  const entrada = useEntrada();
  return (
    <section className="border-y border-graphite-700 bg-graphite-900">
      <div className="mx-auto grid max-w-content gap-px bg-graphite-700 sm:grid-cols-3">
        {t.trust.perks.map((p, i) => (
          <motion.p
            key={p}
            {...entrada(i * 0.08)}
            className="bg-graphite-900 px-5 py-8 text-[0.95rem] leading-relaxed text-cream/70 sm:px-8"
          >
            <span aria-hidden className="mb-3 block h-px w-6 bg-amber" />
            {p}
          </motion.p>
        ))}
      </div>
    </section>
  );
}

/** A conta que o leitor faz. Dor de um lado, virada do outro, em trilho. */
function Conta() {
  const { t } = useI18n();
  const entrada = useEntrada();
  return (
    <section className="bg-cream text-ink">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <motion.div {...entrada(0)} className="max-w-[24ch]">
          <Sobrescrita escuro={false}>{t.trust.eyebrow}</Sobrescrita>
          <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            {t.problem.title}
          </h2>
        </motion.div>
        <motion.p {...entrada(0.08)} className="mt-8 max-w-[62ch] text-[1.0625rem] leading-[1.7] text-ink/70">
          {t.problem.intro}
        </motion.p>

        <div className="mt-16 divide-y divide-ink/10 border-t border-ink/10">
          {t.problem.items.map((item, i) => (
            <motion.div
              key={item.pain}
              {...entrada(i * 0.06)}
              className="grid gap-4 py-8 sm:grid-cols-[3.5rem_1fr_1.1fr] sm:gap-10 sm:py-10"
            >
              <span className="font-display text-2xl font-bold tabular-nums text-coral/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.02em] sm:text-[1.4rem]">
                {item.pain}
              </h3>
              <p className="text-[1rem] leading-[1.7] text-ink/70">{item.turn}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Bento: células de tamanhos diferentes, para o olho ter onde pousar. */
function Ferramentas() {
  const { t } = useI18n();
  const entrada = useEntrada();
  const itens = t.features.items;
  return (
    <section className="bg-graphite">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <motion.div {...entrada(0)} className="max-w-[26ch]">
          <Sobrescrita>{t.nav.features}</Sobrescrita>
          <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            {t.features.title}
          </h2>
        </motion.div>
        <motion.p {...entrada(0.08)} className="mt-8 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-cream/65">
          {t.features.intro}
        </motion.p>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((item, i) => (
            <motion.article
              key={item.title}
              {...entrada((i % 3) * 0.07)}
              className={`rounded-xl border border-white/10 bg-graphite-800 p-7 transition-colors duration-300 hover:border-amber/30 ${
                i === 0 ? "lg:col-span-2 lg:row-span-1" : ""
              }`}
            >
              <span
                aria-hidden
                className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-amber/10 text-amber ring-1 ring-amber/20"
              >
                <span className="h-2 w-2 rounded-sm bg-current" />
              </span>
              <h3
                className={`font-display font-bold leading-snug tracking-[-0.02em] text-cream ${
                  i === 0 ? "text-2xl sm:text-[1.75rem]" : "text-lg"
                }`}
              >
                {item.title}
              </h3>
              <p className="mt-3 text-[0.975rem] leading-[1.65] text-cream/60">{item.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Quatro passos num trilho numerado, com a régua atravessando. */
function Passos() {
  const { t } = useI18n();
  const entrada = useEntrada();
  return (
    <section className="border-y border-graphite-700 bg-graphite-900">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <motion.div {...entrada(0)} className="max-w-[24ch]">
          <Sobrescrita>{t.nav.how}</Sobrescrita>
          <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            {t.how.title}
          </h2>
        </motion.div>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden className="absolute left-0 right-0 top-4 hidden h-px bg-white/10 lg:block" />
          {t.how.steps.map((s, i) => (
            <motion.div key={s.n} {...entrada(i * 0.08)} className="relative">
              <span className="relative z-10 inline-flex h-8 items-center rounded-full bg-graphite-900 pr-4 font-display text-sm font-bold tabular-nums tracking-[0.1em] text-amber">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold leading-snug tracking-[-0.02em] text-cream">
                {s.title}
              </h3>
              <p className="mt-2.5 text-[0.95rem] leading-[1.65] text-cream/60">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Planos() {
  const { t } = useI18n();
  const entrada = useEntrada();
  return (
    <section className="bg-cream text-ink">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <motion.div {...entrada(0)} className="max-w-[22ch]">
          <Sobrescrita escuro={false}>{t.nav.plans}</Sobrescrita>
          <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            {t.plans.title}
          </h2>
        </motion.div>
        <motion.p {...entrada(0.08)} className="mt-8 max-w-[58ch] text-[1.0625rem] leading-[1.7] text-ink/70">
          {t.plans.intro}
        </motion.p>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {t.plans.items.map((plano, i) => (
            <motion.article
              key={plano.name}
              {...entrada(i * 0.07)}
              className={`flex flex-col rounded-xl p-8 ${
                plano.highlight
                  ? "bg-graphite text-cream ring-1 ring-amber/40"
                  : "border border-ink/10 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold tracking-[-0.02em]">{plano.name}</h3>
                {"badge" in plano && plano.badge ? (
                  <span className="rounded-full bg-amber px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-graphite">
                    {plano.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-6 font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.04em]">
                {plano.price}
              </p>
              <p className={`mt-2 text-sm ${plano.highlight ? "text-cream/55" : "text-ink/55"}`}>
                {plano.priceNote}
              </p>
              <ul
                className={`mt-8 space-y-3 border-t pt-8 text-[0.95rem] leading-relaxed ${
                  plano.highlight ? "border-white/10 text-cream/75" : "border-ink/10 text-ink/70"
                }`}
              >
                {plano.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-amber" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <motion.p {...entrada(0.1)} className="mt-10 max-w-[62ch] text-sm leading-relaxed text-ink/60">
          {t.plans.guarantee}
        </motion.p>
      </div>
    </section>
  );
}

function Duvidas() {
  const { t } = useI18n();
  const entrada = useEntrada();
  return (
    <section className="bg-graphite">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-32">
        <motion.div {...entrada(0)} className="max-w-[20ch]">
          <Sobrescrita>{t.nav.faq}</Sobrescrita>
          <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-cream">
            {t.faq.title}
          </h2>
        </motion.div>

        <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
          {t.faq.items.map((item, i) => (
            <motion.details key={item.q} {...entrada(Math.min(i, 4) * 0.05)} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-[1.0625rem] font-semibold leading-snug text-cream marker:hidden sm:text-lg">
                {item.q}
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-xl leading-none text-amber transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-[68ch] text-[0.975rem] leading-[1.7] text-cream/60">{item.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fechamento() {
  const { t } = useI18n();
  const entrada = useEntrada();
  return (
    <section className="relative overflow-hidden bg-graphite-900">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(242,166,35,0.16), transparent)" }}
      />
      <div className="relative mx-auto max-w-content px-5 py-28 sm:px-8 sm:py-36">
        <motion.h2
          {...entrada(0)}
          className="max-w-[16ch] font-display text-[clamp(2.3rem,6.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-cream"
        >
          {t.finalCta.title}
        </motion.h2>
        <motion.p {...entrada(0.08)} className="mt-8 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-cream/65">
          {t.finalCta.body}
        </motion.p>
        <motion.div {...entrada(0.16)} className="mt-10">
          <StoreBadges />
          <p className="mt-5 text-sm text-cream/50">{t.finalCta.urgency}</p>
        </motion.div>
      </div>
    </section>
  );
}

export function HomeNova() {
  return (
    <>
      <Barra />
      <main>
        <Dobra />
        <Provas />
        <Conta />
        <Ferramentas />
        <Passos />
        <Planos />
        <Duvidas />
        <Fechamento />
      </main>
      <Footer />
    </>
  );
}
