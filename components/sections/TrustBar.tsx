"use client";

import { useI18n } from "@/lib/i18n";
import { Section } from "@/components/ui/Section";
import { IconCheck } from "@/lib/icons";

export function TrustBar() {
  const { t } = useI18n();
  return (
    <Section theme="graphite-800" className="!py-14">
      <p className="font-display text-sm font-medium uppercase tracking-[0.14em] text-amber">
        {t.trust.eyebrow}
      </p>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* Authority + founder perks */}
        <div>
          <p className="text-lg leading-relaxed text-cream/90">{t.trust.ledBy}</p>

          <p className="mt-6 font-display text-base font-semibold text-cream">{t.trust.foundingTitle}</p>
          <p className="mt-1 text-sm text-cream/60">{t.trust.foundingBody}</p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {t.trust.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <span className="text-sm text-cream/85">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Scarcity — founder spots filling up (goal gradient, no fixed count) */}
        <div className="rounded-2xl bg-graphite p-5 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-cream/85">{t.trust.spotsLabel}</span>
            <span className="text-xs font-medium uppercase tracking-wide text-amber">{t.trust.spotsNote}</span>
          </div>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={82}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t.trust.spotsLabel}
          >
            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-amber-300 to-amber" />
          </div>
          <a
            href="#waitlist"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-amber px-4 font-display text-sm font-medium text-graphite transition-all hover:bg-amber-300 hover:shadow-glow"
          >
            {t.nav.cta}
          </a>

          {/* Press row (placeholders) */}
          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.14em] text-cream/40">{t.trust.pressLabel}</p>
          <ul className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
            {t.trust.pressPlaceholders.map((name) => (
              <li key={name} className="font-display text-sm font-semibold text-cream/30" title="Placeholder">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
