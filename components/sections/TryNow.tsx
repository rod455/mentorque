"use client";

import { useI18n } from "@/lib/i18n";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { HexMotif } from "@/components/ui/HexMotif";
import { IconCheck } from "@/lib/icons";

// Reciprocity + foot-in-the-door + endowment (IKEA effect): give value upfront
// by letting people build their garage in the live prototype before signing up.
export function TryNow() {
  const { t } = useI18n();
  const x = t.tryNow;
  return (
    <Section id="try" theme="dark" className="overflow-hidden bg-graphite">
      <HexMotif aria-hidden className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 text-amber/10" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <div>
            <p className="font-display text-sm font-medium uppercase tracking-[0.14em] text-amber">{x.eyebrow}</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight sm:text-4xl">{x.title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-cream/75">{x.body}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="/app"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-amber px-6 font-display text-base font-medium text-graphite transition-all hover:bg-amber-300 hover:shadow-glow active:translate-y-px"
              >
                {x.cta}
              </a>
              <span className="text-sm text-cream/55">{x.note}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="grid gap-3">
            {x.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
                  <IconCheck className="h-5 w-5" />
                </span>
                <span className="text-cream/90">{b}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
