"use client";

import { useI18n } from "@/lib/i18n";
import { Section } from "@/components/ui/Section";

export function TrustBar() {
  const { t } = useI18n();
  return (
    <Section theme="graphite-800" className="!py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-base leading-relaxed text-cream/85">{t.trust.ledBy}</p>
          <p className="mt-2 text-sm text-cream/60">
            <span className="font-display font-semibold text-amber">
              {t.trust.waitlistCountPre} {t.trust.waitlistCount}
            </span>{" "}
            {t.trust.waitlistCountPost}
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-cream/45">
            {t.trust.pressLabel}
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {t.trust.pressPlaceholders.map((name) => (
              <li
                key={name}
                className="font-display text-lg font-semibold text-cream/35"
                title="Placeholder"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
