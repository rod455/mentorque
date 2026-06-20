"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { HexMotif } from "@/components/ui/HexMotif";

export function HowItWorks() {
  const { t } = useI18n();
  return (
    <Section id="how" theme="light" className="bg-cream">
      <SectionHeading theme="light" title={t.how.title} intro={t.how.intro} />
      <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.how.steps.map((step, i) => (
          <Reveal as="li" key={step.n} delay={i * 0.06}>
            <div className="relative h-full rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink/5">
              <div className="relative mb-4 inline-grid h-14 w-14 place-items-center">
                <HexMotif className="absolute inset-0 text-amber" strokeOpacity={1} strokeWidth={7} />
                <span className="relative font-display text-base font-bold text-graphite">{step.n}</span>
              </div>
              <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/70">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
