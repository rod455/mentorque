"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { IconCommunity, IconDiagnose, IconConsult } from "@/lib/icons";

const TIER_ICON = [IconCommunity, IconDiagnose, IconConsult];
const TIER_ACCENT = ["text-cream", "text-teal", "text-amber"];

export function Consulting() {
  const { t } = useI18n();
  return (
    <Section id="consulting" theme="dark" className="bg-graphite">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2"
        style={{ background: "radial-gradient(60% 60% at 90% 10%, rgba(242,166,35,0.10), transparent)" }}
      />
      <SectionHeading eyebrow={t.consulting.eyebrow} title={t.consulting.title} intro={t.consulting.intro} />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {t.consulting.tiers.map((tier, i) => {
          const Icon = TIER_ICON[i];
          const highlight = i === 2;
          return (
            <Reveal key={tier.name} delay={i * 0.06}>
              <article
                className={`relative flex h-full flex-col rounded-2xl p-7 ring-1 transition-shadow ${
                  highlight
                    ? "bg-graphite-700 ring-amber/40 shadow-glow"
                    : "bg-graphite-800 ring-white/10"
                }`}
              >
                <span className={`inline-grid h-12 w-12 place-items-center rounded-xl bg-white/5 ${TIER_ACCENT[i]}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-xl font-semibold text-cream">{tier.name}</h3>
                <p className="mt-2 flex-1 leading-relaxed text-cream/70">{tier.body}</p>
                <p className={`mt-5 text-sm font-medium ${highlight ? "text-amber" : "text-cream/55"}`}>
                  {tier.note}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
