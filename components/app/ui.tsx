"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { getContent } from "@/lib/app/content";
import type { Access, Severity } from "@/lib/app/types";
import {
  IconAlert,
  IconCalendar,
  IconCar,
  IconCheck,
  IconClose,
  IconCommunity,
  IconCompass,
  IconConsult,
  IconDiagnose,
  IconHome,
  IconLock,
  IconMoto,
  IconPlus,
  IconSpark,
  IconTools,
  IconTrack,
  IconUser,
} from "@/lib/icons";

// Resolve all copy/data for the active locale.
export function useContent() {
  const { locale } = useI18n();
  return getContent(locale);
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
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICON_REGISTRY[name] ?? IconCheck;
  return <Cmp className={className} />;
}

// The phone frame: centers a fixed-width column on a graphite backdrop so the
// web prototype reads as a device. Children scroll inside.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-graphite-900 text-cream antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-graphite shadow-card sm:my-0 sm:min-h-screen">
        {children}
      </div>
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
      <div className="relative w-full max-w-[440px] animate-fade-up rounded-t-3xl bg-graphite-800 p-5 pb-7 ring-1 ring-white/10">
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
