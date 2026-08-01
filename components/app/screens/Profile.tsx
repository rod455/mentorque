"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/app/auth";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { carName } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { AccessBadge, AppHeader, Card, Icon, inputCls, SectionTitle, Sheet, useContent } from "../ui";

const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// A stable per-device id so support messages can be traced (like the example).
function deviceId(): string {
  if (typeof window === "undefined") return "—";
  try {
    let id = window.localStorage.getItem("mentorque-uid");
    if (!id) { id = (crypto?.randomUUID?.() ?? String(Math.random()).slice(2)); window.localStorage.setItem("mentorque-uid", id); }
    return id;
  } catch { return "—"; }
}

// 3.1.A — Perfil
export function ProfileScreen() {
  const c = useContent();
  const p = c.profile;
  const { locale } = useI18n();
  const { user, enabled, signOut } = useAuth();
  const { s, setName, setEmail, setState, setPremium, reset } = usePrototype();
  const { go } = useNav();
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(s.name ?? "");
  const [editEmail, setEditEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(s.email ?? "");
  const [consult, setConsult] = useState(false);
  const [supType, setSupType] = useState<"doubt" | "suggestion" | "bug">("doubt");
  const [supMsg, setSupMsg] = useState("");
  const [supEmail, setSupEmail] = useState(s.email ?? "");
  const [supErr, setSupErr] = useState(false);
  const [supStatus, setSupStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const sendSupport = async () => {
    if (!supMsg.trim()) return setSupErr(true);
    setSupStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: supType,
          message: supMsg.trim(),
          name: s.name || undefined,
          email: (supEmail || s.email || "").trim() || undefined,
          userId: deviceId(),
          locale,
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      setSupStatus("sent");
      setSupMsg("");
    } catch {
      setSupStatus("error");
    }
  };

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
          <p className="truncate text-xs text-cream/55">{s.email || p.carsCount.replace("{n}", String(s.vehicles.length))}</p>
        </div>
        <button onClick={() => { setNameInput(s.name ?? ""); setEditName(true); }} className="shrink-0 text-xs font-medium text-amber">
          {c.common.edit}
        </button>
      </Card>

      {/* Conta (login/sincronização) — só quando o auth está configurado */}
      {enabled && (
        user ? (
          <Card className="mt-3 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal/15 text-teal">
              <Icon name="check" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-cream/50">{c.auth.signedInAs}</p>
              <p className="truncate font-display text-sm text-cream">{user.email}</p>
            </div>
            <button onClick={() => signOut()} className="shrink-0 text-xs font-medium text-coral/80 hover:text-coral">
              {c.auth.signOut}
            </button>
          </Card>
        ) : (
          <button
            onClick={() => go({ name: "auth" })}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-amber/15 to-amber/5 p-4 text-left ring-1 ring-amber/25 hover:ring-amber/45"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber/15 text-amber">
              <Icon name="user" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] font-semibold text-cream">{c.auth.createOrSignIn}</span>
              <span className="mt-0.5 block text-xs text-cream/55">{c.auth.syncNote}</span>
            </span>
            <span className="shrink-0 text-amber">›</span>
          </button>
        )
      )}

      {/* Plano atual */}
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

        <p className="mb-2 mt-4 text-[11px] font-medium uppercase tracking-wide text-cream/40">
          {s.premium ? p.perksTitle : p.perksFreeTitle}
        </p>
        <ul className="space-y-2">
          {p.perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5 text-sm">
              <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${s.premium ? "bg-teal/20 text-teal" : "bg-white/5 text-cream/40"}`}>
                <Icon name="check" className="h-3 w-3" />
              </span>
              <span className={s.premium ? "text-cream/85" : "text-cream/55"}>{perk}</span>
            </li>
          ))}
        </ul>

        <Button variant="secondary" className="mt-4 w-full" onClick={() => go({ name: "subscribe" })}>
          <Icon name="spark" className="h-4 w-4" /> {p.seePlans}
        </Button>
        {s.premium && (
          <button onClick={() => setPremium(false)} className="mt-2 w-full py-1.5 text-center text-sm text-cream/45 hover:text-coral">
            {p.cancelPlan}
          </button>
        )}
      </Card>

      {/* Detalhes da conta */}
      <SectionTitle>{p.account}</SectionTitle>
      <div className="overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/5 divide-y divide-white/5">
        <button onClick={() => { setNameInput(s.name ?? ""); setEditName(true); }} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
          <Icon name="user" className="h-4 w-4 shrink-0 text-cream/40" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-cream/45">{p.name}</p>
            <p className="truncate text-sm text-cream">{s.name || p.guest}</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-amber">{c.common.edit}</span>
        </button>
        <button onClick={() => { setEmailInput(s.email ?? ""); setEditEmail(true); }} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
          <Icon name="consult" className="h-4 w-4 shrink-0 text-cream/40" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-cream/45">{p.email}</p>
            <p className="truncate text-sm text-cream">{s.email || p.notSet}</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-amber">{c.common.edit}</span>
        </button>
        <div className="flex items-center gap-3 px-4 py-3">
          <Icon name="explore" className="h-4 w-4 shrink-0 text-cream/40" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-cream/45">{p.stateLabel}</p>
            <p className="truncate text-sm text-cream">{s.state || p.notSet}</p>
          </div>
          <select
            value={s.state ?? ""}
            onChange={(e) => setState(e.target.value)}
            className="shrink-0 rounded-lg bg-graphite-700 px-2 py-1.5 text-sm text-cream ring-1 ring-white/10 outline-none focus:ring-amber"
          >
            <option value="">{p.stateSelect}</option>
            {BR_STATES.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Icon name="book" className="h-4 w-4 shrink-0 text-cream/40" />
          <p className="min-w-0 flex-1 text-sm text-cream">{p.language}</p>
          <LangSwitcher />
        </div>
      </div>

      <div className="mt-2">
        {row(p.consulting, <AccessBadge access="premium" />, () => setConsult(true))}
      </div>

      {/* Dúvidas ou sugestões → e-mail */}
      <SectionTitle>{p.support.title}</SectionTitle>
      <Card>
        <p className="text-sm text-cream/60">{p.support.subtitle}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {([["doubt", p.support.doubt], ["suggestion", p.support.suggestion], ["bug", p.support.bug]] as const).map(([key, label]) => {
            const active = supType === key;
            return (
              <button
                key={key}
                onClick={() => setSupType(key)}
                className={`rounded-xl px-2 py-2 text-sm font-medium ring-1 transition-colors ${active ? "bg-amber text-graphite ring-amber" : "bg-graphite-700 text-cream/70 ring-white/10"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {supStatus === "sent" ? (
          <div className="mt-3 rounded-xl bg-teal/10 px-3.5 py-3 text-sm text-teal ring-1 ring-teal/20">{p.support.sent}</div>
        ) : (
          <>
            <textarea
              value={supMsg}
              onChange={(e) => { setSupMsg(e.target.value); setSupErr(false); }}
              rows={4}
              placeholder={p.support.messagePh}
              className={`mt-3 resize-none ${inputCls}`}
            />
            <input
              value={supEmail}
              onChange={(e) => setSupEmail(e.target.value)}
              type="email"
              placeholder={p.support.emailPh}
              className={`mt-2 ${inputCls}`}
            />
            {supErr && <p className="mt-1 text-xs text-coral">{p.support.empty}</p>}
            {supStatus === "error" && <p className="mt-1 text-xs text-coral">{p.support.error}</p>}
            <Button size="lg" className="mt-3 w-full" disabled={supStatus === "sending"} onClick={sendSupport}>
              {supStatus === "sending" ? p.support.sending : p.support.send}
            </Button>
          </>
        )}
      </Card>

      <SectionTitle>{p.demo}</SectionTitle>
      <div className="space-y-2">
        {row(p.reset, <Icon name="alert" className="h-4 w-4 text-coral" />, reset)}
      </div>

      <p className="mt-6 px-2 text-center text-[11px] leading-relaxed text-cream/35">{p.disclaimer}</p>

      {/* Edit name sheet */}
      <Sheet open={editName} onClose={() => setEditName(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{p.name}</h2>
        <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder={p.namePh} className={`mt-4 ${inputCls}`} />
        <Button size="lg" className="mt-4 w-full" onClick={() => { setName(nameInput); setEditName(false); }}>
          {c.common.save}
        </Button>
      </Sheet>

      {/* Edit email sheet */}
      <Sheet open={editEmail} onClose={() => setEditEmail(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{p.email}</h2>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder={p.emailPh}
          className={`mt-4 ${inputCls}`}
        />
        <Button size="lg" className="mt-4 w-full" onClick={() => { setEmail(emailInput); setEditEmail(false); }}>
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

  const car = carName(activeVehicle(s), c.profile.myCars);
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
