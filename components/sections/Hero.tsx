"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { StoreBadges } from "@/components/ui/StoreBadges";
import { BielaDemo } from "@/components/ui/BielaDemo";
import BielaNoCarro from "@/components/BielaNoCarro";
import { HexMotif } from "@/components/ui/HexMotif";

// UMA MANCHETE, NÃO TRÊS (04/10/2026, aposta `landing-em-seis-blocos`).
//
// Até aqui morava um carrossel de três promessas girando a cada cinco
// segundos, com bolinhas, trilho de altura mínima medido em três larguras e
// uma conferência de navegador só para ele não fazer a página pular. A lição
// do CRO é uma promessa só: quem chega lê uma frase, não três em sequência.
// Com o carrossel foi embora também o CLS que ele custava e a conferência que
// o vigiava (scripts/navegador/site.mjs sabe que não há mais bolinhas).
//
// O que FICA: a entrada encadeada dos três blocos (onde estamos, o que
// prometemos, o que fazer), a cena animada da Biela no carro e o aparecer das
// seções. Decisão do dono em 04/10: as animações não saem, elas são a marca.
// O que entra no lugar do celular com "Trilha · Freios" é o Biela respondendo
// (BielaDemo), que é o uso real do produto.
export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const h = t.hero;

  return (
    <section id="top" className="relative overflow-hidden bg-graphite px-5 pb-20 pt-24 sm:px-8 sm:pt-24">
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

      {/* `min-w-0` nas duas colunas: uma coluna de grid nunca fica menor que
          o conteúdo dela, então um filho de largura fixa estica a grade além
          da tela, e com `overflow-hidden` isso vira corte, não rolagem. */}
      <div className="relative mx-auto grid w-full max-w-content items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-amber ring-1 ring-white/10"
          >
            {h.eyebrow}
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-[2.15rem] font-bold leading-[1.03] tracking-[-0.022em] sm:text-5xl lg:text-[3.1rem]"
          >
            <span className="text-cream">{h.headline.a}</span>
            <span className="text-amber">{h.headline.b}</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[54ch] text-[1.0625rem] leading-[1.65] text-cream/70"
          >
            {h.subheadline}
          </motion.p>

          {/* O download é o primeiro gesto da página desde 03/09/2026, e o
              único destino do site é a loja (decisão do dono, 12/09). */}
          <motion.div
            id="baixar"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 scroll-mt-28"
          >
            <StoreBadges origem="home-topo" />
            {/* A nota responde "vai me custar alguma coisa?" no ponto em que
                a pessoa decide tocar. Tirar é decisão de CRO com medição. */}
            <p className="mt-4 text-sm text-cream/55">{h.ctaNote}</p>
            {/* Prova medida, com a fonte no comentário de strings.pt.ts. */}
            <p className="mt-3 text-sm text-cream/70">{h.proof}</p>
          </motion.div>
        </div>

        <div className="relative flex min-w-0 flex-col items-center gap-8">
          {/* Cena da Biela dirigindo: fica (dono, 04/10). */}
          <BielaNoCarro size={400} />
          <BielaDemo />
        </div>
      </div>
    </section>
  );
}
