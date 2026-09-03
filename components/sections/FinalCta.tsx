"use client";

import { useI18n } from "@/lib/i18n";
import { Section } from "@/components/ui/Section";
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
        {/* Um caminho só no fecho da página. Formulário de lista aqui embaixo
            competia com o download e prometia um aviso de lançamento que já
            aconteceu. */}
        <div className="mt-8 flex justify-center">
          <StoreBadges />
        </div>
      </div>
    </Section>
  );
}
