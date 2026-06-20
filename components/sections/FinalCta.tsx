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
        <h2 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">{t.finalCta.title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-cream/75">{t.finalCta.body}</p>
        <div className="mt-8">
          <WaitlistForm theme="dark" />
        </div>
        <div className="mt-8">
          <StoreBadges />
        </div>
      </div>
    </Section>
  );
}
