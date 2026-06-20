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

// ---- Consultoria -----------------------------------------------------------
export function ConsultingScreen({ onPaywall }: { onPaywall: () => void }) {
  const c = useContent();
  const { s } = usePrototype();

  return (
    <div className="pt-2">
      <SectionTitle>{c.consulting.title}</SectionTitle>
      <p className="mb-4 text-sm text-cream/60">{c.consulting.intro}</p>
      <div className="space-y-2.5">
        {c.consultingTiers.map((tier) => {
          const locked = tier.access !== "free" && !(s.premium && tier.access === "premium");
          return (
            <Card key={tier.name} className={tier.access === "consulting" ? "ring-coral/20" : undefined}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-base text-cream">{tier.name}</span>
                <AccessBadge access={tier.access} />
              </div>
              <p className="mt-1.5 text-sm text-cream/60">{tier.body}</p>
              <Button
                variant={tier.access === "free" ? "secondary" : "primary"}
                className="mt-3"
                onClick={locked ? onPaywall : undefined}
              >
                {tier.cta}
              </Button>
            </Card>
          );
        })}
      </div>
      <p className="mt-4 rounded-lg bg-graphite-800 px-3.5 py-3 text-xs text-cream/50 ring-1 ring-white/5">{c.consulting.inlineNote}</p>
    </div>
  );
}

// ---- Conta -----------------------------------------------------------------
export function AccountScreen({ onPaywall }: { onPaywall: () => void }) {
  const c = useContent();
  const { s, setPremium, reset } = usePrototype();

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
      <SectionTitle>{c.account.title}</SectionTitle>

      <Card className="ring-amber/20">
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
