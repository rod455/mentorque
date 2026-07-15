"use client";

import { useState } from "react";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { AccessBadge, AppHeader, Card, Icon, inputCls, SectionTitle, Sheet, useContent } from "../ui";

// 3.1.A — Perfil
export function ProfileScreen() {
  const c = useContent();
  const p = c.profile;
  const { s, setName, setPremium, reset } = usePrototype();
  const { go } = useNav();
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(s.name ?? "");
  const [consult, setConsult] = useState(false);

  const row = (label: string, right?: React.ReactNode, onClick?: () => void) => (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 rounded-xl bg-graphite-800 px-3.5 py-3.5 text-left ring-1 ring-white/5">
      <span className="font-display text-[15px] text-cream">{label}</span>
      {right ?? <span className="text-cream/40">›</span>}
    </button>
  );

  return (
    <div>
      <AppHeader title={p.title} />

      {/* Identity */}
      <Card className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber/15 text-amber">
          <Icon name="user" className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-cream">{s.name || p.guest}</p>
          <p className="truncate text-xs text-cream/55">{p.carsCount.replace("{n}", String(s.vehicles.length))}</p>
        </div>
        <button onClick={() => { setNameInput(s.name ?? ""); setEditName(true); }} className="shrink-0 text-xs font-medium text-amber">
          {c.common.edit}
        </button>
      </Card>

      {/* Plan */}
      <Card className="mt-3 ring-amber/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-cream/50">{p.plan}</p>
            <p className="font-display text-lg font-semibold text-cream">{s.premium ? p.premium : p.free}</p>
          </div>
          {s.premium ? (
            <span className="rounded-md bg-amber/15 px-2.5 py-1 text-xs font-medium text-amber">★ Premium</span>
          ) : (
            <Button onClick={() => go({ name: "subscribe" })}>{p.subscribe}</Button>
          )}
        </div>
      </Card>

      <div className="mt-3 space-y-2">
        {s.premium && row(p.manage, undefined, () => go({ name: "subscribe" }))}
        {row(p.consulting, <AccessBadge access="premium" />, () => setConsult(true))}
        {row(p.language, <span onClick={(e) => e.stopPropagation()}><LangSwitcher /></span>)}
      </div>

      <SectionTitle>{p.demo}</SectionTitle>
      <div className="space-y-2">
        {s.premium && row(p.downgrade, <span className="text-cream/40">↺</span>, () => setPremium(false))}
        {row(p.reset, <Icon name="alert" className="h-4 w-4 text-coral" />, reset)}
      </div>

      {/* Edit name sheet */}
      <Sheet open={editName} onClose={() => setEditName(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{p.name}</h2>
        <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder={p.namePh} className={`mt-4 ${inputCls}`} />
        <Button size="lg" className="mt-4 w-full" onClick={() => { setName(nameInput); setEditName(false); }}>
          {c.common.save}
        </Button>
      </Sheet>

      {/* Consulting sheet (moved under Premium) */}
      <Sheet open={consult} onClose={() => setConsult(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{p.consulting}</h2>
        <div className="mt-4 space-y-2.5">
          {c.consultingTiers.map((tier) => {
            const locked = tier.access !== "free" && !(s.premium && tier.access === "premium");
            return (
              <Card key={tier.name} className={tier.access === "consulting" ? "ring-coral/20" : undefined}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base text-cream">{tier.name}</span>
                  <AccessBadge access={tier.access} />
                </div>
                <p className="mt-1.5 text-sm text-cream/60">{tier.body}</p>
                {locked && (
                  <Button variant="secondary" className="mt-3" onClick={() => { setConsult(false); go({ name: "subscribe" }); }}>
                    {c.common.unlock}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}

// 3.1.B — Assinatura (contextual paywall + detailed Free vs Premium)
export function SubscribeScreen({ ctx }: { ctx?: string }) {
  const c = useContent();
  const sub = c.subscribe;
  const { s, setPremium } = usePrototype();
  const { back } = useNav();
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  const car = activeVehicle(s)?.model ?? c.profile.myCars;
  const paywall = ctx ? c.paywalls[ctx] : undefined;
  const fill = (t: string) => t.replace("{car}", car);

  const subscribe = () => {
    setPremium(true);
    back();
  };

  return (
    <div>
      <AppHeader title={sub.title} />

      {/* Contextual header for the action that triggered the paywall */}
      {paywall ? (
        <Card className="ring-amber/30">
          <div className="mb-2 flex items-center gap-2 text-amber">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber/15 text-base">★</span>
            <span className="font-display text-base font-semibold text-cream">{fill(paywall.title)}</span>
          </div>
          <ul className="space-y-1.5">
            {paywall.benefits.map((b) => (
              <li key={b} className="flex gap-2 text-sm text-cream/85">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                {fill(b)}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <p className="text-sm text-cream/65">{sub.intro}</p>
      )}

      {/* Plans */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {([["annual", sub.annual], ["monthly", sub.monthly]] as const).map(([key, pl]) => {
          const active = plan === key;
          const save = "save" in pl ? pl.save : undefined;
          return (
            <button
              key={key}
              onClick={() => setPlan(key)}
              className={`rounded-2xl p-4 text-left ring-1 transition-all ${active ? "bg-amber/10 ring-amber" : "bg-graphite-800 ring-white/10"}`}
            >
              <p className="font-display text-sm text-cream/70">{pl.name}</p>
              <p className="mt-1 font-display text-xl font-bold text-cream">{pl.price}</p>
              <p className="text-xs text-cream/50">{pl.note}</p>
              {save && <p className="mt-1 text-xs font-medium text-teal">{save}</p>}
            </button>
          );
        })}
      </div>

      <Button size="lg" className="mt-4 w-full" onClick={subscribe}>
        {sub.cta}
      </Button>
      <button onClick={back} className="mt-2 w-full py-2 text-center text-sm text-cream/55 hover:text-cream">
        {sub.later}
      </button>

      {/* Detailed Free vs Premium comparison */}
      <SectionTitle>{sub.compareTitle}</SectionTitle>
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/5">
        <div className="grid grid-cols-[1.3fr_0.85fr_1fr] bg-graphite-800 text-[11px] font-medium uppercase tracking-wide text-cream/45">
          <span className="px-3 py-2" />
          <span className="px-2 py-2 text-center">{sub.colFree}</span>
          <span className="px-2 py-2 text-center text-amber">{sub.colPremium}</span>
        </div>
        {sub.compare.map((row, i) => (
          <div key={row.label} className={`grid grid-cols-[1.3fr_0.85fr_1fr] items-center text-sm ${i % 2 ? "bg-graphite-800/40" : "bg-graphite-800/10"}`}>
            <span className="px-3 py-2.5 text-cream/80">{row.label}</span>
            <span className="px-2 py-2.5 text-center text-xs text-cream/55">{row.free}</span>
            <span className="px-2 py-2.5 text-center text-xs font-medium text-cream">{row.premium}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-cream/45">{sub.terms}</p>
    </div>
  );
}
