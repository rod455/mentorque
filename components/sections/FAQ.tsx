"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";

export function FAQ() {
  const { t } = useI18n();
  return (
    <Section id="faq" theme="light" className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading theme="light" title={t.faq.title} intro={t.faq.intro} />
        <div className="divide-y divide-ink/10">
          {t.faq.items.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className="font-display text-lg font-medium text-ink">{item.q}</span>
                <span
                  aria-hidden
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/5 text-ink transition-transform group-open:rotate-45"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink/70">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
