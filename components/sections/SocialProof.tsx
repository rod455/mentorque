"use client";

import { useI18n } from "@/lib/i18n";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// Prova social.
//
// Sem depoimento nenhum, a seção não aparece. Ela existia com três exemplos
// inventados sob uma etiqueta "exemplo · substituir", e isso custa mais do que
// rende: quem chega pela primeira vez não lê a etiqueta, lê "Nome do usuário ·
// Gol 2014" e conclui que o app inventa gente. Uma página sem depoimentos é
// honesta; uma com depoimentos falsos, não.
//
// Para trazer de volta, preencha `social.items` nos dois arquivos de idioma.
export function SocialProof() {
  const { t } = useI18n();
  const s = t.social;
  if (s.items.length === 0) return null;
  return (
    <Section id="social" theme="light" className="bg-cream">
      <SectionHeading theme="light" eyebrow={s.eyebrow} title={s.title} intro={s.intro} />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {s.items.map((it, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink/5">
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
