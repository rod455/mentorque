"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { cursosParaIdioma, paraIdioma, serverSnapshot, snapshot, subscribe } from "@/lib/app/remoteLessons";
import { getContent } from "@/lib/app/content";
import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { sellsInApp } from "@/lib/app/wrapper";
import { privacyUrl, termsUrl } from "@/lib/app/legal";
import type { Access, Severity } from "@/lib/app/types";
import {
  IconAlert,
  IconArrow,
  IconBolt,
  IconBook,
  IconBrake,
  IconCalendar,
  IconCar,
  IconCheck,
  IconClock,
  IconClose,
  IconCommunity,
  IconCompass,
  IconConsult,
  IconDiagnose,
  IconEngine,
  IconGauge,
  IconHome,
  IconLock,
  IconMoto,
  IconPlus,
  IconSettings,
  IconShield,
  IconSpark,
  IconSuspension,
  IconTire,
  IconTools,
  IconTrack,
  IconUser,
} from "@/lib/icons";

// Resolve all copy/data for the active locale.
//
// O catálogo de aulas pode vir da rede: publicar aula nova passa a ser um
// deploy do site, sem build nem revisão de loja. A lista embutida continua
// sendo a base — a remota só entra quando existe e é válida, então rede ruim,
// primeira abertura e modo avião seguem mostrando o app cheio.
export function useContent() {
  const { locale } = useI18n();
  const base = getContent(locale);
  const remoto = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => {
    if (!remoto) return base;
    const cursos = cursosParaIdioma(remoto, locale);
    return { ...base, lessons: paraIdioma(remoto, locale), ...(cursos ? { courses: cursos } : {}) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, remoto, locale]);
}

const ICON_REGISTRY: Record<string, (p: { className?: string }) => JSX.Element> = {
  tools: IconTools,
  car: IconCar,
  moto: IconMoto,
  track: IconTrack,
  community: IconCommunity,
  diagnose: IconDiagnose,
  consult: IconConsult,
  home: IconHome,
  user: IconUser,
  check: IconCheck,
  alert: IconAlert,
  calendar: IconCalendar,
  plus: IconPlus,
  explore: IconCompass,
  spark: IconSpark,
  gauge: IconGauge,
  clock: IconClock,
  book: IconBook,
  settings: IconSettings,
  engine: IconEngine,
  brakes: IconBrake,
  suspension: IconSuspension,
  tires: IconTire,
  electrical: IconBolt,
  shield: IconShield,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICON_REGISTRY[name] ?? IconCheck;
  return <Cmp className={className} />;
}

/**
 * Links para os Termos de Uso e a Política de Privacidade.
 *
 * Existe como componente para não haver "a versão do paywall" e "a versão do
 * onboarding": a Apple exige esses dois links em TODA tela onde a assinatura é
 * vendida, e a versão anterior tinha três cópias soltas — todas apontando para
 * `/privacidade`, inclusive a dos termos, e todas relativas, o que dentro do
 * app da loja não levava a lugar nenhum. Foi o que reprovou a versão pela
 * diretriz 3.1.2(c).
 */
export function LegalLinks({ className = "", underline = false }: { className?: string; underline?: boolean }) {
  const { locale } = useI18n();
  const c = useContent();
  const cls = `hover:text-cream ${underline ? "underline underline-offset-2" : ""}`;
  return (
    <span className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${className}`}>
      <a href={termsUrl(locale)} target="_blank" rel="noreferrer" className={cls}>{c.subscribe.termsLink}</a>
      <span aria-hidden>·</span>
      <a href={privacyUrl(locale)} target="_blank" rel="noreferrer" className={cls}>{c.subscribe.privacyLink}</a>
    </span>
  );
}

// The phone frame: centers a fixed-width column on a graphite backdrop so the
// web prototype reads as a device. Children scroll inside.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-backdrop min-h-screen w-full overflow-x-hidden text-cream antialiased">
      <div className="app-col flex min-h-screen flex-col bg-graphite pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-card sm:my-0 sm:min-h-screen">
        {children}
      </div>
    </div>
  );
}

// Small "Premium" pill.
export function PremiumBadge({ className }: { className?: string }) {
  return <span className={`inline-flex items-center gap-0.5 rounded-md bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber ${className ?? ""}`}>★ Premium</span>;
}

// "Recomendado para o seu carro" pill.
export function RecoBadge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-md bg-teal/15 px-1.5 py-0.5 text-[10px] font-medium text-teal">✦ {children}</span>;
}

// Contextual upgrade nudge (doesn't block) → opens the paywall for `ctx`.
export function UpgradeBanner({ ctx, text }: { ctx: string; text: string }) {
  const { go } = useNav();
  // Modo leitor (só Android): sem convites de assinatura.
  if (!sellsInApp()) return null;
  return (
    <button
      onClick={() => go({ name: "subscribe", ctx })}
      className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-amber/10 px-4 py-3 text-left ring-1 ring-amber/25 transition-colors hover:ring-amber/40"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber/20 text-amber">★</span>
      <span className="min-w-0 flex-1 text-sm text-cream/85">{text}</span>
      <span className="shrink-0 text-xs font-medium text-amber">›</span>
    </button>
  );
}

// Locked content card (gates a Premium-only block) → opens the paywall.
export function LockedCard({ ctx, title, body }: { ctx: string; title: string; body?: string }) {
  const { go } = useNav();
  const c = useContent();
  return (
    <button
      onClick={() => go({ name: "subscribe", ctx })}
      className="flex w-full items-start gap-3 rounded-2xl bg-graphite-800 px-4 py-3.5 text-left ring-1 ring-amber/20 hover:ring-amber/40"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
        <IconLock className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] text-cream">{title}</span>
        {body ? <span className="mt-0.5 block text-xs text-cream/55">{body}</span> : null}
        <span className="mt-1.5 inline-block text-xs font-medium text-amber">{c.common.unlock} ›</span>
      </span>
    </button>
  );
}

// Standard screen header: back arrow (when the nav stack can pop) + title.
// Bloom-style header: back arrow on the left, title centered, right slot
// (optional action) balanced by a spacer so the title stays truly centered.
export function AppHeader({ title, subtitle, action, onBack }: { title: string; subtitle?: string; action?: ReactNode; onBack?: () => void }) {
  const { canBack, back } = useNav();
  const showBack = onBack ? true : canBack;
  const doBack = onBack ?? back;

  return (
    <header className="flex items-center gap-3 pb-3 pt-5">
      {showBack ? (
        <button onClick={doBack} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream" aria-label="back">
          <IconArrow className="h-4 w-4 rotate-180" />
        </button>
      ) : (
        <span className="h-9 w-9 shrink-0" />
      )}
      <div className="min-w-0 flex-1 text-center">
        <h1 className="text-balance font-serif text-xl font-semibold leading-tight tracking-normal text-cream">{title}</h1>
        {subtitle ? <p className="truncate text-xs text-cream/55">{subtitle}</p> : null}
      </div>
      <span className="grid h-9 w-9 shrink-0 place-items-center">{action}</span>
    </header>
  );
}

// Shared input styling for forms.
export const inputCls =
  "w-full rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber";

// Free-text input with a suggestion dropdown (same pattern as the car brand
// field): the list opens on focus and filters as you type. `options` are the
// candidate suggestions; the user can still type anything not in the list.
export function Autocomplete({
  value,
  onChange,
  options,
  placeholder,
  className,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  inputMode?: "text" | "numeric";
}) {
  const [open, setOpen] = useState(false);
  const q = value.trim().toLowerCase();
  const matches = options.filter(
    (o) => !q || (o.toLowerCase().includes(q) && o.toLowerCase() !== q)
  );
  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        value={value}
        inputMode={inputMode}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        autoComplete="off"
        className={inputCls}
      />
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl bg-graphite-700 p-1 shadow-card ring-1 ring-white/10">
          {matches.map((m) => (
            <button
              key={m}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(m); setOpen(false); }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-cream hover:bg-white/5"
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3.5 py-1.5 text-sm font-display transition-colors ring-1",
        active ? "bg-amber text-graphite ring-amber" : "bg-graphite-700 text-cream/80 ring-white/10 hover:bg-graphite-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}

const SEVERITY_COLOR: Record<Severity, string> = {
  high: "bg-coral",
  medium: "bg-amber",
  low: "bg-teal",
};

export function SeverityDot({ level }: { level: Severity }) {
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${SEVERITY_COLOR[level]}`} />;
}

// Small badge marking a row's access tier.
export function AccessBadge({ access }: { access: Access }) {
  const content = useContent();
  if (access === "free") {
    return <span className="rounded-md bg-teal/15 px-2 py-0.5 text-[11px] font-medium text-teal">{content.common.free}</span>;
  }
  const label = access === "consulting" ? content.common.consulting : content.common.premium;
  const tone = access === "consulting" ? "bg-coral/15 text-coral" : "bg-amber/15 text-amber";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      <IconLock className="h-3 w-3" />
      {label}
    </span>
  );
}

// A list row whose detail is gated. Free rows render fully; gated rows show the
// title but route the tap to the paywall (the lock pattern, spec §5).
export function GateRow({
  title,
  subtitle,
  access,
  left,
  right,
  onLockedTap,
}: {
  title: string;
  subtitle?: string;
  access: Access;
  left?: ReactNode;
  right?: ReactNode;
  onLockedTap?: () => void;
}) {
  const gated = access !== "free";
  return (
    <button
      type="button"
      onClick={gated ? onLockedTap : undefined}
      className={[
        "flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/5",
        gated ? "hover:ring-amber/30" : "cursor-default",
      ].join(" ")}
    >
      {left}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] text-cream">{title}</span>
        {subtitle ? <span className="block truncate text-xs text-cream/55">{subtitle}</span> : null}
      </span>
      {right ?? <AccessBadge access={access} />}
    </button>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/5", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 flex items-center justify-between">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-cream/50">{children}</h3>
      {action}
    </div>
  );
}

// Bottom sheet overlay (paywall, diagnose, swap).
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label="close" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative app-col animate-fade-up rounded-t-3xl bg-graphite-800 p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] ring-1 ring-white/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream"
          aria-label="close"
        >
          <IconClose className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-amber" : i < index ? "w-1.5 bg-amber/50" : "w-1.5 bg-white/15"}`}
        />
      ))}
    </div>
  );
}

// Botão 📌 de fixar conteúdo na Home (seção "Fixados", abaixo do carro).
// Quadrado, entra ao lado de Concluir/Salvar no rodapé das aulas.
export function PinButton({ id }: { id: string }) {
  const c = useContent();
  const { s, toggleLessonPinned } = usePrototype();
  const pinned = (s.pinnedLessons ?? []).includes(id);
  return (
    <button
      onClick={() => toggleLessonPinned(id)}
      aria-label={pinned ? c.learn.pinned : c.learn.pin}
      title={pinned ? c.learn.pinned : c.learn.pin}
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg ring-1 transition-colors ${
        pinned ? "bg-amber/15 ring-amber" : "bg-transparent ring-white/15 opacity-60 hover:opacity-100"
      }`}
    >
      📌
    </button>
  );
}
