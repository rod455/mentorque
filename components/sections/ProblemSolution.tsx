"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { IconArrow } from "@/lib/icons";

export function ProblemSolution() {
  const { t } = useI18n();
  return (
    <Section id="problem" theme="light">
      <SectionHeading theme="light" title={t.problem.title} intro={t.problem.intro} />
      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {t.problem.items.map((item, i) => (
          <Reveal as="li" key={item.pain} delay={i * 0.05}>
            <div className="h-full rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink/5">
              <p className="font-display text-base font-semibold text-coral">{item.pain}</p>
              <div className="mt-3 flex items-start gap-2.5 text-ink/80">
                <IconArrow className="mt-1 h-4 w-4 shrink-0 text-teal" />
                <p className="leading-relaxed">{item.turn}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
