"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// Três ganhos, no lugar de sete seções (04/10/2026).
//
// TrustBar, ProblemSolution, Features (seis recursos), HowItWorks (quatro
// passos), Consulting (três níveis), Benefits (seis) e FAQ (oito) diziam, em
// 34 itens, o que as avaliações reais dizem em duas frases: "consegui
// economizar" e "tenho aprendido". A lição 4 do CRO: as pessoas descrevem o
// app pelo desfecho, não pelo recurso. Então aqui são três desfechos, cada um
// com uma frase, e nada de ícone decorativo.
export function Gains() {
  const { t } = useI18n();
  const g = t.gains;
  return (
    <Section id="ganhos" theme="light" className="bg-cream">
      <SectionHeading theme="light" title={g.title} />
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {g.items.map((it, i) => (
          <Reveal key={it.title} delay={i * 0.06}>
            <div className="border-t-2 border-amber pt-5">
              <h3 className="font-display text-xl font-semibold text-ink">{it.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/70">{it.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
