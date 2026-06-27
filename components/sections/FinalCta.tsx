"use client";

import { useI18n } from "@/lib/i18n";
import { Section } from "@/components/ui/Section";
import { WaitlistForm } from "@/components/ui/WaitlistForm";
import { StoreBadges } from "@/components/ui/StoreBadges";
import { HexMotif } from "@/components/ui/HexMotif";

export function FinalCta() {
  const { t } = useI18n();
  return (
    <Section id="join" theme="dark" className="overflow-hidden bg-graphite">
      <HexMotif
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-16 h-80 w-80 text-amber/10"
      />
      <div className="relative mx-auto max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-amber ring-1 ring-amber/25">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
          {t.finalCta.urgency}
        </span>
        <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight sm:text-4xl">{t.finalCta.title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-cream/75">{t.finalCta.body}</p>
        <div className="mt-8">
          <WaitlistForm theme="dark" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href="/app" className="font-display text-sm font-medium text-amber underline-offset-4 hover:underline">
            {t.finalCta.tryCta} →
          </a>
        </div>
        <div className="mt-8">
          <StoreBadges />
        </div>
      </div>
    </Section>
  );
}
