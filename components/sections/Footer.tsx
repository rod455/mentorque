"use client";

import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/ui/Logo";
import { LangSwitcher } from "@/components/ui/LangSwitcher";

const SOCIALS = ["Instagram", "YouTube", "TikTok"];

export function Footer() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();
  const privacyHref = locale === "en" ? "/privacy" : "/privacidade";
  const termsHref = locale === "en" ? "/terms" : "/termos";
  const nav = [
    { href: "#features", label: t.nav.features },
    { href: "#how", label: t.nav.how },
    { href: "#consulting", label: t.nav.consulting },
    { href: "#plans", label: t.nav.plans },
    { href: "#faq", label: t.nav.faq },
    // Guias de busca: páginas próprias, indexáveis, fora da home. O link daqui
    // não é enfeite — é por ele que o robô chega até elas a partir da página
    // com mais autoridade do site. Só aparece em português porque os guias são
    // escritos em português.
    ...(locale === "en" ? [] : [{ href: "/barulho-no-carro", label: "Barulho no carro" }]),
    // A /sobre vale nos DOIS idiomas: ela não é guia de busca, é a descrição de
    // referência do produto, e é dela que sai o resumo quando alguém pergunta a
    // uma IA se existe app para entender o carro. Sem link a partir da home,
    // ela seria uma página órfã que ninguém e nenhum robô alcança.
    { href: "/sobre", label: locale === "en" ? "About Mentorque" : "Sobre o Mentorque" },
  ];

  return (
    <footer className="bg-graphite-900 px-5 py-16 text-cream sm:px-8">
      <div className="mx-auto w-full max-w-content">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo variant="lockup-dark" className="h-7 w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-cream/60">{t.footer.tagline}</p>
            <p className="mt-4 text-xs text-cream/40">{t.footer.builtFor}</p>
          </div>

          <nav aria-label={t.footer.navTitle}>
            <h2 className="font-display text-sm font-semibold text-cream/80">{t.footer.navTitle}</h2>
            <ul className="mt-4 space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-cream/60 transition-colors hover:text-cream">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-sm font-semibold text-cream/80">{t.footer.socialTitle}</h2>
            <ul className="mt-4 space-y-2.5">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <a href="#" className="text-sm text-cream/60 transition-colors hover:text-cream" title="Placeholder">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold text-cream/80">{t.footer.legalTitle}</h2>
            <ul className="mt-4 space-y-2.5">
              <li><a href={privacyHref} className="text-sm text-cream/60 hover:text-cream">{t.footer.privacy}</a></li>
              <li><a href={termsHref} className="text-sm text-cream/60 hover:text-cream">{t.footer.terms}</a></li>
              <li><a href="mailto:contato@mentorque.com.br" className="text-sm text-cream/60 hover:text-cream">{t.footer.contact}</a></li>
            </ul>
            <div className="mt-5">
              <LangSwitcher />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-cream/45 sm:flex-row sm:items-center">
          <p>© {year} Mentorque. {t.footer.rights}</p>
          <p>Brasil · EUA</p>
        </div>
      </div>
    </footer>
  );
}
