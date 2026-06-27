"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// Social proof. Testimonials are clearly marked placeholders until real ones
// are provided — swap `social.items` in the i18n strings.
export function SocialProof() {
  const { t } = useI18n();
  const s = t.social;
  return (
    <Section id="social" theme="light" className="bg-cream">
      <SectionHeading theme="light" eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {s.items.map((it, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink/5">
              <span className="mb-3 inline-flex w-fit items-center rounded-full bg-amber/15 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-600">
                {s.placeholderTag}
              </span>
              <blockquote className="flex-1 text-pretty leading-relaxed text-ink/80">“{it.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-graphite font-display text-sm font-semibold text-cream">
                  {it.name.slice(0, 1)}
                </span>
                <span>
                  <span className="block font-display text-sm font-semibold text-ink">{it.name}</span>
                  <span className="block text-xs text-ink/55">{it.context}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
