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

      {/* Contato direto com o especialista.
          O número é dos EUA, então o link vai para o WhatsApp em vez de `tel:`
          — quem está no Brasil não vai discar uma chamada internacional, mas
          manda mensagem sem pensar duas vezes. */}
      <Reveal delay={0.2}>
        <div className="mt-10 flex flex-col items-center gap-5 rounded-2xl bg-graphite-800 p-7 ring-1 ring-amber/25 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="font-display text-sm font-medium uppercase tracking-[0.14em] text-amber">
              {t.consulting.contactTitle}
            </p>
            <p className="mt-2 font-serif text-xl font-semibold text-cream">{t.consulting.contactName}</p>
            <p className="mt-1 text-sm text-cream/65">{t.consulting.contactRole}</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_CONSULTORIA}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-xl bg-amber px-6 font-display text-base font-medium text-graphite transition-all hover:bg-amber-300 hover:shadow-glow active:translate-y-px"
          >
            <WhatsAppGlyph />
            {t.consulting.contactCta}
          </a>
        </div>
      </Reveal>
    </Section>
  );
}

// Só dígitos, com o código do país — é o formato que o wa.me aceita.
const WHATSAPP_CONSULTORIA = "12487680340";

function WhatsAppGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.3.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.6-.3Z" />
    </svg>
  );
}
