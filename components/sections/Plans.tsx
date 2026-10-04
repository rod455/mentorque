"use client";

import { useI18n } from "@/lib/i18n";
import { funil } from "@/lib/app/funil";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { IconCheck } from "@/lib/icons";

// O PREÇO UMA VEZ, em duas colunas (04/10/2026).
//
// Antes eram três: Grátis, Premium "Assinatura, mensal ou anual" sem valor, e
// "Consultoria, sob consulta", com uma frase de ancoragem sobre peça trocada à
// toa. O valor que aparece agora é o que já está em vigor nas lojas e no dado
// estruturado (lib/jsonLd.ts). Mudar preço, plano ou o que cada um destrava é
// decisão do dono; esta tela só escreve o que existe. Os botões levam à loja,
// porque a assinatura acontece dentro do app.
export function Plans() {
  const { t } = useI18n();
  const p = t.plans;
  return (
    <Section id="plans" theme="light" className="bg-white">
      <SectionHeading theme="light" title={p.title} intro={p.intro} />

      <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2">
        {p.items.map((plan, i) => {
          const highlight = plan.highlight;
          return (
            <Reveal key={plan.name} delay={i * 0.06}>
              <article
                className={`relative flex h-full flex-col rounded-2xl p-7 ${
                  highlight
                    ? "bg-graphite text-cream shadow-card ring-1 ring-amber/30"
                    : "bg-cream text-ink ring-1 ring-ink/10"
                }`}
              >
                {"badge" in plan && plan.badge ? (
                  <span className="absolute right-6 top-6 rounded-full bg-amber px-3 py-1 text-xs font-medium text-graphite">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className={`font-display text-xl font-semibold ${highlight ? "text-cream" : "text-ink"}`}>
                  {plan.name}
                </h3>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className={highlight ? "text-cream/60" : "text-ink/55"}>{plan.priceNote}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <IconCheck className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-amber" : "text-teal"}`} />
                      <span className={highlight ? "text-cream/85" : "text-ink/75"}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#baixar"
                  className={`mt-7 inline-flex h-11 items-center justify-center rounded-xl px-5 font-display text-sm font-medium transition-all ${
                    highlight
                      ? "bg-amber text-graphite hover:bg-amber-300 hover:shadow-glow"
                      : "bg-graphite text-cream hover:bg-graphite-700"
                  }`}
                >
                  {plan.cta}
                </a>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* A ÚNICA PORTA DE "FALAR COM GENTE" DO SITE. O número é dos EUA, por
          isso WhatsApp e não `tel:`. O clique deixa rastro ANTES de a pessoa
          sumir (19/09/2026): sem o evento, "ninguém quer consultoria" e
          "ninguém acha o botão" têm a mesma cara no painel. `umaVez` com chave
          própria porque é evento de SESSÃO. O try/catch existe porque medição
          nunca segura a navegação. */}
      <Reveal delay={0.12}>
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-cream p-6 ring-1 ring-ink/10 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="font-display text-base font-semibold text-ink">{p.consulting.title}</p>
            <p className="mt-1 text-sm text-ink/65">{p.consulting.body}</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_CONSULTORIA}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              try {
                funil("clicou_consultoria", { umaVez: true, chave: "consultoria:whatsapp" });
              } catch {
                /* medição não segura a navegação */
              }
            }}
            className="inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl bg-graphite px-5 font-display text-sm font-medium text-cream transition-all hover:bg-graphite-700 active:translate-y-px"
          >
            <WhatsAppGlyph />
            {p.consulting.cta}
          </a>
        </div>
      </Reveal>
    </Section>
  );
}

// Só dígitos, com o código do país, que é o formato que o wa.me aceita.
const WHATSAPP_CONSULTORIA = "12487680340";

function WhatsAppGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.3.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.6-.3Z" />
    </svg>
  );
}
