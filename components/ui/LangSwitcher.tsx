"use client";

import { useI18n } from "@/lib/i18n";

export function LangSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={`inline-flex items-center rounded-lg bg-white/5 p-0.5 ring-1 ring-white/10 ${className ?? ""}`}
      role="group"
      aria-label="Language / Idioma"
    >
      {(["pt", "en"] as const).map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            className={`rounded-md px-2.5 py-1 text-xs font-display font-medium transition-colors ${
              active ? "bg-amber text-graphite" : "text-cream/70 hover:text-cream"
            }`}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
