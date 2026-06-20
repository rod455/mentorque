"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { IconCheck } from "@/lib/icons";

export function Benefits() {
  const { t } = useI18n();
  return (
    <Section id="benefits" theme="graphite-800">
      <SectionHeading title={t.benefits.title} className="mb-10" />
      <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
        {t.benefits.items.map((item, i) => (
          <Reveal as="li" key={item} delay={(i % 2) * 0.05}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber/15 text-amber">
                <IconCheck className="h-4 w-4" />
              </span>
              <span className="text-lg leading-relaxed text-cream/85">{item}</span>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
