"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/ui/Logo";
import { LangSwitcher } from "@/components/ui/LangSwitcher";

export function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: t.nav.features },
    { href: "#how", label: t.nav.how },
    { href: "#consulting", label: t.nav.consulting },
    { href: "#plans", label: t.nav.plans },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-graphite/85 backdrop-blur-md ring-1 ring-white/5" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="flex items-center" aria-label="Mentorque">
          <Logo variant="lockup-dark" className="h-7 w-auto" priority />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-cream/75 transition-colors hover:text-cream"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitcher />
          <a
            href="#waitlist"
            className="hidden h-10 items-center rounded-xl bg-amber px-4 font-display text-sm font-medium text-graphite transition-all hover:bg-amber-300 hover:shadow-glow sm:inline-flex"
          >
            {t.nav.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
