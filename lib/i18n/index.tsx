"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { pt, type Strings } from "./strings.pt";
import { en } from "./strings.en";

export type Locale = "pt" | "en";
const DICTS: Record<Locale, Strings> = { pt, en };
const STORAGE_KEY = "mentorque-locale";

type I18nContextValue = {
  locale: Locale;
  t: Strings;
  setLocale: (l: Locale) => void;
  toggle: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  // Hydrate from storage / browser language after mount (PT-BR is the default).
  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as Locale | null;
    if (stored === "pt" || stored === "en") {
      setLocaleState(stored);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("en")) {
      setLocaleState("en");
    }
  }, []);

  // Keep <html lang> in sync for accessibility / SEO.
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const toggle = useCallback(() => setLocale(locale === "pt" ? "en" : "pt"), [locale, setLocale]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: DICTS[locale], setLocale, toggle }),
    [locale, setLocale, toggle]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
