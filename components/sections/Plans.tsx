"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { IconCheck } from "@/lib/icons";

export function Plans() {
  const { t } = useI18n();
  return (
    <Section id="plans" theme="light" className="bg-white">
      <SectionHeading theme="light" title={t.plans.title} intro={t.plans.intro} />
      <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
        {t.plans.items.map((plan, i) => {
          const highlight = plan.highlight;
          return (
            <Reveal key={plan.name} delay={i * 0.06}>
              <article
                className={`relative flex h-full flex-col rounded-2xl p-7 ${
                  highlight
                    ? "bg-graphite text-cream shadow-card ring-1 ring-amber/30"
                    : "bg-cream text-ink ring-1 ring-ink/10"
                }`}
              >
                {"badge" in plan && plan.badge ? (
                  <span className="absolute right-6 top-6 rounded-full bg-amber px-3 py-1 text-xs font-medium text-graphite">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className={`font-display text-xl font-semibold ${highlight ? "text-cream" : "text-ink"}`}>
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className={highlight ? "text-cream/60" : "text-ink/55"}>{plan.priceNote}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <IconCheck className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-amber" : "text-teal"}`} />
                      <span className={highlight ? "text-cream/85" : "text-ink/75"}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#waitlist"
                  className={`mt-7 inline-flex h-11 items-center justify-center rounded-xl px-5 font-display text-sm font-medium transition-all ${
                    highlight
                      ? "bg-amber text-graphite hover:bg-amber-300 hover:shadow-glow"
                      : "bg-graphite text-cream hover:bg-graphite-700"
                  }`}
                >
                  {plan.cta}
                </a>
              </article>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-ink/55">{t.plans.note}</p>
    </Section>
  );
}
