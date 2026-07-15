"use client";

import { usePrototype } from "@/lib/app/store";
import { vehicleLabel } from "@/lib/app/content";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { AccessBadge, Card, Icon, SectionTitle, useContent } from "../ui";

// ---- Aprender --------------------------------------------------------------
export function LearnScreen({ onPaywall }: { onPaywall: () => void }) {
  const c = useContent();
  const { s } = usePrototype();

  return (
    <div className="pt-2">
      <SectionTitle>{c.learn.title}</SectionTitle>
      <p className="mb-4 text-sm text-cream/60">{c.learn.intro}</p>
      <div className="space-y-2.5">
        {c.tracks.map((tr, i) => {
          const locked = tr.access !== "free" && !s.premium;
          return (
            <button
              key={tr.title}
              onClick={locked ? onPaywall : undefined}
              className={`flex w-full items-center gap-3 rounded-2xl bg-graphite-800 p-3.5 text-left ring-1 ring-white/5 ${locked ? "hover:ring-amber/30" : ""}`}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber/12 text-amber">
                <Icon name="track" className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[15px] text-cream">{tr.title}</span>
                <span className="block text-xs text-cream/50">
                  {tr.level} · {tr.lessons} {c.learn.lessons} · {c.learn.certificate}
                </span>
                {i === 0 && (
                  <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-graphite-700">
                    <span className="block h-full w-1/3 rounded-full bg-amber" />
                  </span>
                )}
              </span>
              {locked ? <AccessBadge access={tr.access} /> : <span className="text-xs font-medium text-teal">{i === 0 ? c.learn.continue : c.learn.start}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Perfil ----------------------------------------------------------------
export function AccountScreen({ onPaywall }: { onPaywall: () => void }) {
  const c = useContent();
  const { s, setPremium, reset } = usePrototype();

  const levelLabel = s.level ? c.levels.find((l) => l.key === s.level)?.label : null;
  const intentionLabels = s.intentions
    .map((t) => c.intentions.find((it) => it.tag === t)?.label)
    .filter(Boolean) as string[];

  const row = (label: string, right?: React.ReactNode, onClick?: () => void) => (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-graphite-800 px-3.5 py-3.5 text-left ring-1 ring-white/5"
    >
      <span className="font-display text-[15px] text-cream">{label}</span>
      {right ?? <span className="text-cream/40">›</span>}
    </button>
  );

  return (
    <div className="pt-2">
      <SectionTitle>{c.nav.profile}</SectionTitle>

      {/* Identity card */}
      <Card className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber/15 text-amber">
          <Icon name="user" className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-semibold text-cream">{s.name ?? c.account.title}</span>
          <span className="block truncate text-xs text-cream/55">
            {[levelLabel, vehicleLabel(s.vehicle, "")].filter(Boolean).join(" · ") || "—"}
          </span>
        </span>
      </Card>

      {intentionLabels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {intentionLabels.map((l) => (
            <span key={l} className="rounded-full bg-graphite-700 px-2.5 py-1 text-xs text-cream/75">
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Plan */}
      <Card className="mt-3 ring-amber/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-cream/50">{c.account.plan}</p>
            <p className="font-display text-lg font-semibold text-cream">{s.premium ? c.account.premium : c.account.free}</p>
          </div>
          {!s.premium ? (
            <Button onClick={onPaywall}>{c.account.upgrade}</Button>
          ) : (
            <span className="rounded-md bg-amber/15 px-2.5 py-1 text-xs font-medium text-amber">★ Premium</span>
          )}
        </div>
      </Card>

      <div className="mt-3 space-y-2">
        {row(c.account.manage)}
        {row(c.account.restore)}
        {row(
          c.account.language,
          <span onClick={(e) => e.stopPropagation()}>
            <LangSwitcher />
          </span>
        )}
        {row(c.account.notifications, <span className="text-xs text-teal">{c.common.free}</span>)}
        {row(`${c.account.vehicles} · ${s.vehicle ? vehicleLabel(s.vehicle, "") : "—"}`)}
        {row(c.account.terms)}
      </div>

      <SectionTitle>Demo</SectionTitle>
      <div className="space-y-2">
        {s.premium && row(c.account.downgrade, <span className="text-cream/40">↺</span>, () => setPremium(false))}
        {row(c.account.reset, <Icon name="alert" className="h-4 w-4 text-coral" />, reset)}
      </div>
    </div>
  );
}
