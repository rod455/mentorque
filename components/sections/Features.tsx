"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ICONS, type IconName } from "@/lib/icons";

export function Features() {
  const { t } = useI18n();
  return (
    <Section id="features" theme="light" className="bg-white">
      <SectionHeading theme="light" title={t.features.title} intro={t.features.intro} />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.features.items.map((f, i) => {
          const Icon = ICONS[f.icon as IconName];
          return (
            <Reveal key={f.title} delay={(i % 3) * 0.06}>
              <article className="group h-full rounded-2xl bg-cream p-6 ring-1 ring-ink/5 transition-shadow hover:shadow-card">
                <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-graphite text-amber">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/70">{f.body}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
