"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { vehicleLabel } from "@/lib/app/content";
import { Button } from "@/components/ui/Button";
import { AccessBadge, Card, Icon, SeverityDot, Sheet, useContent } from "./ui";
import { HomeScreen } from "./screens/Home";
import { GarageScreen } from "./screens/Garage";
import { LearnScreen, AccountScreen } from "./screens/Misc";
import { SwapFlow } from "./SwapFlow";

// Bottom navigation matches the founder's spec: Home · Aprender · Meu carro · Perfil.
export type Tab = "home" | "learn" | "garage" | "account";

// Time-of-day greeting key.
function greetingKey(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export function Shell() {
  const c = useContent();
  const { s } = usePrototype();
  const [tab, setTab] = useState<Tab>("home");
  const [paywall, setPaywall] = useState(false);
  const [diagnose, setDiagnose] = useState(false);
  const [explore, setExplore] = useState(false);
  const [ask, setAsk] = useState(false);
  const [critical, setCritical] = useState(false);
  const [swap, setSwap] = useState(false);

  const openPaywall = () => setPaywall(true);

  const greeting = c.home[greetingKey()];

  return (
    <PhoneShell>
      {/* Top bar — greeting + vehicle (founder's "Bom dia, Rodrigo / Mercedes A250 2018") */}
      <header className="px-5 pb-3 pt-5">
        <p className="text-sm text-cream/55">
          {greeting}
          {s.name ? `, ${s.name}` : ""}
        </p>
        <p className="truncate font-display text-xl font-semibold text-cream">
          {vehicleLabel(s.vehicle, c.learn.title)}
        </p>
      </header>

      {/* Active screen */}
      <main className="flex-1 overflow-y-auto px-5 pb-28">
        {tab === "home" && (
          <HomeScreen
            onNavigate={setTab}
            onDiagnose={() => setDiagnose(true)}
            onExplore={() => setExplore(true)}
            onAsk={() => setAsk(true)}
            onCritical={() => setCritical(true)}
            onSwap={() => setSwap(true)}
          />
        )}
        {tab === "garage" && <GarageScreen onPaywall={openPaywall} onLearn={() => setTab("learn")} onSwap={() => setSwap(true)} />}
        {tab === "learn" && <LearnScreen onPaywall={openPaywall} />}
        {tab === "account" && <AccountScreen onPaywall={openPaywall} />}
      </main>

      {/* Bottom navigation — 4 tabs, no center FAB */}
      <BottomNav tab={tab} setTab={setTab} />

      <PaywallSheet open={paywall} onClose={() => setPaywall(false)} />
      <DiagnoseSheet open={diagnose} onClose={() => setDiagnose(false)} onPaywall={() => { setDiagnose(false); openPaywall(); }} />
      <ExploreSheet open={explore} onClose={() => setExplore(false)} onPaywall={() => { setExplore(false); openPaywall(); }} />
      <AskSheet open={ask} onClose={() => setAsk(false)} onPaywall={() => { setAsk(false); openPaywall(); }} />
      <CriticalSheet open={critical} onClose={() => setCritical(false)} onPaywall={() => { setCritical(false); openPaywall(); }} />
      {swap && <SwapFlow onClose={() => setSwap(false)} />}
    </PhoneShell>
  );
}

// The app shell shares the PhoneFrame look but owns its own scroll layout.
function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-graphite-900 text-cream antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-graphite shadow-card">{children}</div>
    </div>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const c = useContent();
  const item = (key: Tab, icon: string, label: string) => {
    const active = tab === key;
    return (
      <button key={key} onClick={() => setTab(key)} className="flex flex-1 flex-col items-center gap-1 py-2">
        <Icon name={icon} className={`h-6 w-6 ${active ? "text-amber" : "text-cream/55"}`} />
        <span className={`text-[10px] ${active ? "font-medium text-amber" : "text-cream/55"}`}>{label}</span>
      </button>
    );
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[440px] border-t border-white/10 bg-graphite-900/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur">
      <div className="flex items-end">
        {item("home", "home", c.nav.home)}
        {item("learn", "track", c.nav.learn)}
        {item("garage", "car", c.nav.garage)}
        {item("account", "user", c.nav.profile)}
      </div>
    </nav>
  );
}

function PaywallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const c = useContent();
  const { setPremium } = usePrototype();
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber/15 text-amber">
        <span className="font-display text-xl">★</span>
      </div>
      <h2 className="font-display text-xl font-bold text-cream">{c.paywall.title}</h2>
      <p className="mt-1.5 text-sm text-cream/65">{c.paywall.body}</p>
      <ul className="mt-4 space-y-2">
        {c.paywall.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-sm text-cream/80">
            <span className="text-amber">★</span>
            {b}
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-xs text-coral">{c.paywall.anchor}</p>
      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={() => {
          setPremium(true);
          onClose();
        }}
      >
        {c.paywall.cta}
      </Button>
      <button onClick={onClose} className="mt-2 w-full py-2 text-center text-sm text-cream/55 hover:text-cream">
        {c.paywall.later}
      </button>
    </Sheet>
  );
}

function DiagnoseSheet({ open, onClose, onPaywall }: { open: boolean; onClose: () => void; onPaywall: () => void }) {
  const c = useContent();
  const [mode, setMode] = useState<"symptom" | "obd">("symptom");
  const [picked, setPicked] = useState<string | null>(null);
  const symptom = c.symptoms.find((x) => x.id === picked);

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-xl font-bold text-cream">{c.diagnose.title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["symptom", "obd"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-xl py-2.5 font-display text-sm ring-1 transition-colors ${
              mode === m ? "bg-amber/15 text-amber ring-amber" : "bg-graphite-700 text-cream/70 ring-white/10"
            }`}
          >
            {m === "symptom" ? c.diagnose.bySymptom : c.diagnose.byObd}
          </button>
        ))}
      </div>

      {mode === "symptom" ? (
        <div className="mt-4">
          {!symptom ? (
            <div className="space-y-2">
              <p className="text-sm text-cream/60">{c.garage.symptomHint}</p>
              {c.symptoms.map((sx) => (
                <button
                  key={sx.id}
                  onClick={() => setPicked(sx.id)}
                  className="flex w-full items-center justify-between rounded-xl bg-graphite-700 px-3.5 py-3 text-left font-display text-[15px] text-cream ring-1 ring-white/5 hover:ring-amber/30"
                >
                  {sx.label}
                  <span className="text-cream/40">›</span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <p className="font-display text-base text-cream">{symptom.label}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-cream/45">{c.garage.probableCauses}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-cream/80">
                {symptom.causes.map((cause) => (
                  <li key={cause} className="flex gap-2">
                    <span className="text-amber">•</span>
                    {cause}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-cream/50">{c.diagnose.oneFree}</p>
              <Button size="lg" className="mt-3 w-full" onClick={onPaywall}>
                {c.garage.deepDiag}
              </Button>
              <button onClick={() => setPicked(null)} className="mt-2 w-full py-1.5 text-center text-sm text-cream/55 hover:text-cream">
                {c.common.back}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <Card>
            <p className="text-sm text-cream/70">{c.diagnose.obdConnecting}</p>
            <p className="mt-2 font-display text-base text-amber">{c.diagnose.obdResult}</p>
          </Card>
          <Button size="lg" className="mt-3 w-full" onClick={onPaywall}>
            {c.garage.obdFull}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

// Explorar — industry behind-the-scenes, lives, community, career.
function ExploreSheet({ open, onClose, onPaywall }: { open: boolean; onClose: () => void; onPaywall: () => void }) {
  const c = useContent();
  const { s } = usePrototype();
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-xl font-bold text-cream">{c.explore.title}</h2>
      <p className="mt-1.5 text-sm text-cream/65">{c.explore.intro}</p>
      <div className="mt-4 space-y-2.5">
        {c.explore.items.map((it) => {
          const locked = it.access !== "free" && !s.premium;
          return (
            <button
              key={it.title}
              onClick={locked ? onPaywall : onClose}
              className="flex w-full items-start gap-3 rounded-2xl bg-graphite-700 p-3.5 text-left ring-1 ring-white/5 hover:ring-amber/30"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/12 text-teal">
                <Icon name="spark" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] text-cream">{it.title}</span>
                <span className="block text-xs text-cream/55">{it.body}</span>
              </span>
              {locked ? <AccessBadge access={it.access} /> : <span className="text-cream/40">›</span>}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

// Perguntar ao MentorQ — three tiers of human help.
function AskSheet({ open, onClose, onPaywall }: { open: boolean; onClose: () => void; onPaywall: () => void }) {
  const c = useContent();
  const { s } = usePrototype();
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-xl font-bold text-cream">{c.ask.title}</h2>
      <p className="mt-1.5 text-sm text-cream/65">{c.ask.intro}</p>
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
              <Button variant={tier.access === "free" ? "secondary" : "primary"} className="mt-3" onClick={locked ? onPaywall : onClose}>
                {tier.cta}
              </Button>
            </Card>
          );
        })}
      </div>
    </Sheet>
  );
}

// Problemas críticos — the model's recurring issues with cause + (paid) fix.
function CriticalSheet({ open, onClose, onPaywall }: { open: boolean; onClose: () => void; onPaywall: () => void }) {
  const c = useContent();
  const { s } = usePrototype();
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-xl font-bold text-cream">{c.critical.title}</h2>
      <p className="mt-1.5 text-sm text-cream/65">{c.critical.intro}</p>
      <div className="mt-4 max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
        {c.problems.map((p) => (
          <Card key={p.title}>
            <div className="flex items-center gap-2.5">
              <SeverityDot level={p.severity} />
              <span className="flex-1 font-display text-[15px] text-cream">{p.title}</span>
              <span className="text-sm text-cream/60">{p.cost}</span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-wide text-cream/45">{c.critical.cause}</p>
            <p className="text-sm text-cream/80">{p.cause}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-cream/45">{c.critical.solution}</p>
            {s.premium ? (
              <p className="text-sm text-cream/80">{p.solution}</p>
            ) : (
              <button onClick={onPaywall} className="mt-0.5 flex w-full items-center gap-2 rounded-lg bg-amber/10 px-3 py-2 text-left text-sm text-amber ring-1 ring-amber/20 hover:ring-amber/40">
                <Icon name="diagnose" className="hidden" />
                🔒 {c.critical.solutionLocked}
              </button>
            )}
          </Card>
        ))}
      </div>
    </Sheet>
  );
}
