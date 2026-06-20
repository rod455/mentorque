"use client";

import { useState } from "react";
import { dominantTag, usePrototype } from "@/lib/app/store";
import { vehicleLabel } from "@/lib/app/content";
import { Button } from "@/components/ui/Button";
import { Card, Icon, PhoneFrame, Sheet, useContent } from "./ui";
import { HomeScreen } from "./screens/Home";
import { GarageScreen } from "./screens/Garage";
import { LearnScreen, ConsultingScreen, AccountScreen } from "./screens/Misc";

export type Tab = "home" | "garage" | "learn" | "consulting" | "account";

export function Shell() {
  const c = useContent();
  const { s } = usePrototype();
  const [tab, setTab] = useState<Tab>("home");
  const [paywall, setPaywall] = useState(false);
  const [diagnose, setDiagnose] = useState(false);

  const openPaywall = () => setPaywall(true);

  return (
    <PhoneFrame>
      {/* Top bar — greeting + avatar (account lives behind the avatar, not a tab) */}
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <div className="min-w-0">
          <p className="text-xs text-cream/50">{c.home.greeting}</p>
          <p className="truncate font-display text-lg font-semibold text-cream">
            {vehicleLabel(s.vehicle, c.learn.title)}
          </p>
        </div>
        <button
          onClick={() => setTab("account")}
          aria-label={c.nav.account}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 transition-colors ${
            tab === "account" ? "bg-amber text-graphite ring-amber" : "bg-graphite-700 text-cream/80 ring-white/10"
          }`}
        >
          <Icon name="user" className="h-5 w-5" />
        </button>
      </header>

      {/* Active screen */}
      <main className="flex-1 overflow-y-auto px-5 pb-28">
        {tab === "home" && <HomeScreen onNavigate={setTab} onDiagnose={() => setDiagnose(true)} onPaywall={openPaywall} />}
        {tab === "garage" && <GarageScreen onPaywall={openPaywall} onLearn={() => setTab("learn")} />}
        {tab === "learn" && <LearnScreen onPaywall={openPaywall} />}
        {tab === "consulting" && <ConsultingScreen onPaywall={openPaywall} />}
        {tab === "account" && <AccountScreen onPaywall={openPaywall} />}
      </main>

      {/* Bottom navigation + central Diagnose action */}
      <BottomNav tab={tab} setTab={setTab} onDiagnose={() => setDiagnose(true)} />

      <PaywallSheet open={paywall} onClose={() => setPaywall(false)} />
      <DiagnoseSheet open={diagnose} onClose={() => setDiagnose(false)} onPaywall={() => { setDiagnose(false); openPaywall(); }} />
    </PhoneFrame>
  );
}

function BottomNav({ tab, setTab, onDiagnose }: { tab: Tab; setTab: (t: Tab) => void; onDiagnose: () => void }) {
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
      <div className="relative flex items-end">
        {item("home", "home", c.nav.home)}
        {item("garage", "car", c.nav.garage)}
        {/* center FAB */}
        <div className="flex flex-1 justify-center">
          <button
            onClick={onDiagnose}
            className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-amber text-graphite shadow-glow ring-4 ring-graphite-900 active:translate-y-px"
            aria-label={c.nav.diagnose}
          >
            <Icon name="diagnose" className="h-7 w-7" />
          </button>
        </div>
        {item("learn", "track", c.nav.learn)}
        {item("consulting", "consult", c.nav.consulting)}
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
        <Icon name="alert" className="hidden" />
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
