"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/app/auth";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { resizeImage } from "@/lib/app/image";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { APP_VERSION, carName } from "@/lib/app/content";

// Storage bucket for profile photos (confira o nome exato no Supabase).
const AVATAR_BUCKET = "Avatars";
import { computeStatus } from "@/lib/app/gamification";
import { PhaseEmblem } from "../Emblem";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { AppHeader, Card, Icon, inputCls, SectionTitle, Sheet, useContent } from "../ui";

const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// Store links — trocar pelos links reais da Play/App Store quando publicar.
const RATE_URL = "https://mentorque.com.br";

// iOS-style on/off switch.
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-amber" : "bg-graphite-600"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

// Small segmented control (e.g. Métrico / Imperial).
function Segmented({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="flex shrink-0 rounded-lg bg-graphite-700 p-0.5 text-xs font-medium ring-1 ring-white/10">
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`rounded-md px-2.5 py-1 transition-colors ${value === val ? "bg-amber text-graphite" : "text-cream/60"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// A stable per-device id so support messages can be traced (like the example).
function deviceId(): string {
  if (typeof window === "undefined") return "—";
  try {
    let id = window.localStorage.getItem("mentorque-uid");
    if (!id) { id = (crypto?.randomUUID?.() ?? String(Math.random()).slice(2)); window.localStorage.setItem("mentorque-uid", id); }
    return id;
  } catch { return "—"; }
}

// Grouped settings card — rows share one rounded container with soft dividers.
function Group({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/[0.06] [&>*+*]:border-t [&>*+*]:border-white/[0.06]">{children}</div>;
}

// A settings row: colored icon square + label (+ optional value) + right slot.
function IconRow({ icon, tint, label, value, action, right, onClick, danger }: {
  icon: string; tint: string; label: string; value?: string; action?: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  const inner = (
    <>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tint}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-display text-[15px] ${danger ? "text-coral" : "text-cream"}`}>{label}</span>
        {value ? <span className="mt-0.5 block truncate text-xs text-cream/50">{value}</span> : null}
      </span>
      {right ?? (action ? <span className="shrink-0 text-xs font-medium text-amber">{action}</span> : onClick ? <span className="shrink-0 text-lg text-cream/30">›</span> : null)}
    </>
  );
  const cls = "flex w-full items-center gap-3 px-4 py-3.5 text-left";
  return onClick ? <button onClick={onClick} className={cls}>{inner}</button> : <div className={cls}>{inner}</div>;
}

// 3.1.A — Perfil
export function ProfileScreen() {
  const c = useContent();
  const p = c.profile;
  const g = c.gamification;
  const { user, enabled, signOut } = useAuth();
  const { s, setState, setPremium, setNotifications, setUnits, setAvatar, reset } = usePrototype();
  const { go, root } = useNav();
  const gam = computeStatus(s);
  const phaseName = g.phases[gam.phase.id].name;
  const [about, setAbout] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [talk, setTalk] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Profile photo: user's uploaded avatar wins; otherwise the Google picture.
  const googlePic = (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture) as string | undefined;
  const avatarSrc = s.avatar ?? googlePic ?? null;
  const pickAvatar = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file, 400, 0.85);
      const supabase = getBrowserSupabase();
      // Logado → sobe pro Storage e guarda só a URL. Convidado/falha → local.
      if (user && supabase) {
        const blob = await (await fetch(dataUrl)).blob();
        const path = `${user.id}/avatar.jpg`;
        const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, blob, { upsert: true, contentType: "image/jpeg" });
        if (!error) {
          const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
          setAvatar(`${data.publicUrl}?t=${Date.now()}`); // cache-buster (upsert reusa o path)
          return;
        }
        console.warn("[avatar] upload failed, keeping local:", error.message);
      }
      setAvatar(dataUrl);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <AppHeader title={p.title} onBack={() => root({ name: "cars" })} />

      {/* 1) Salve sua garagem — login (com a fotinha do Biela) / ou conectado */}
      {enabled && user ? (
        <Card className="flex items-center gap-3">
          <button onClick={() => avatarRef.current?.click()} className="relative shrink-0" aria-label={p.changePhoto}>
            <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-teal/15 text-teal ring-1 ring-white/10">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-lg font-semibold text-cream">{(s.name?.trim()?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}</span>
              )}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-amber text-graphite ring-2 ring-graphite-800">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.2" /></svg>
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-cream/50">{c.auth.signedInAs}</p>
            <p className="truncate font-display text-sm text-cream">{user.email}</p>
          </div>
          <button onClick={() => signOut()} className="shrink-0 text-xs font-medium text-coral/80 hover:text-coral">
            {c.auth.signOut}
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickAvatar(e.target.files?.[0])} />
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-3.5">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-teal/10 ring-1 ring-teal/20">
              <img src="/biela/biela-acenando.png" alt="Biela" className="h-12 w-12 object-contain" draggable={false} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-base font-semibold text-cream">{p.save.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-cream/55">{p.save.body}</p>
            </div>
          </div>
          <button
            onClick={() => go({ name: "auth" })}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-full bg-amber px-5 py-2.5 font-display text-sm font-semibold text-graphite transition-colors hover:bg-amber-300"
          >
            {p.save.cta} <span aria-hidden>→</span>
          </button>
        </Card>
      )}

      {/* 2) Desbloqueie o Premium — destaque compacto (ou plano atual) */}
      {s.premium ? (
        <Card className="mt-3 ring-amber/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cream/50">{p.plan}</p>
              <p className="font-serif text-lg font-semibold text-cream">{p.premium}</p>
            </div>
            <span className="rounded-md bg-amber/15 px-2.5 py-1 text-xs font-medium text-amber">★ Premium</span>
          </div>
          <p className="mb-2 mt-4 text-[11px] font-medium uppercase tracking-wide text-cream/40">{p.perksTitle}</p>
          <ul className="space-y-2">
            {p.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-teal/20 text-teal">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                <span className="text-cream/85">{perk}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => setPremium(false)} className="mt-4 w-full py-1.5 text-center text-sm text-cream/45 hover:text-coral">
            {p.cancelPlan}
          </button>
        </Card>
      ) : (
        <button
          onClick={() => go({ name: "subscribe" })}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-amber/25 via-amber/12 to-amber/[0.06] p-4 text-left ring-1 ring-amber/40 transition-colors hover:ring-amber/60"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/20 text-lg">👑</span>
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-base font-semibold text-cream">{p.unlock.title}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-cream/60">{p.unlock.body}</span>
          </span>
          <span className="shrink-0 text-lg text-amber">→</span>
        </button>
      )}

      {/* 3) Sua fase (gamificação) */}
      <Card className="mt-3">
        <div className="flex items-center gap-3.5">
          <PhaseEmblem id={gam.phase.id} emoji={gam.phase.emoji} size={60} active />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cream/45">{g.phaseLabel}</p>
            <p className="font-serif text-xl font-semibold text-cream">{phaseName}</p>
          </div>
        </div>

        <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-amber transition-all" style={{ width: `${Math.round(gam.progress * 100)}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] italic text-cream/50">
          {gam.nextPhase ? g.next.replace("{phase}", g.phases[gam.nextPhase.id].name) : g.maxLevel}
        </p>

        <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
          <button onClick={() => go({ name: "achievements" })} className="flex items-center gap-1.5 text-sm font-medium text-cream/80 hover:text-cream">
            <Icon name="book" className="h-4 w-4" /> {g.acervoBtn}
          </button>
          <button onClick={() => go({ name: "gamification" })} className="flex items-center gap-1.5 text-sm font-medium text-amber hover:text-amber-300">
            <span className="grid h-4 w-4 place-items-center rounded-full ring-1 ring-current text-[10px]">?</span> {g.howBtn}
          </button>
        </div>
      </Card>

      {/* Preferências */}
      <SectionTitle>{p.preferences}</SectionTitle>
      <Group>
        <IconRow icon="alert" tint="bg-teal/15 text-teal" label={p.notifications} right={<Toggle on={s.notifications} onChange={setNotifications} />} />
        <IconRow icon="book" tint="bg-amber/15 text-amber" label={p.language} right={<LangSwitcher />} />
        <IconRow
          icon="gauge" tint="bg-teal/15 text-teal" label={p.units}
          right={
            <Segmented
              value={s.units}
              options={[["metric", p.metric], ["imperial", p.imperial]]}
              onChange={(v) => setUnits(v as "metric" | "imperial")}
            />
          }
        />
        <IconRow
          icon="explore" tint="bg-coral/15 text-coral" label={p.location} value={s.state || undefined}
          right={
            <select
              value={s.state ?? ""}
              onChange={(e) => setState(e.target.value)}
              className="shrink-0 rounded-lg bg-graphite-700 px-2 py-1.5 text-sm text-cream ring-1 ring-white/10 outline-none focus:ring-amber"
            >
              <option value="">{p.stateSelect}</option>
              {BR_STATES.map((uf) => (<option key={uf} value={uf}>{uf}</option>))}
            </select>
          }
        />
      </Group>

      {/* Informações */}
      <SectionTitle>{p.info}</SectionTitle>
      <Group>
        <IconRow icon="spark" tint="bg-amber/15 text-amber" label={p.about} onClick={() => setAbout(true)} />
        <IconRow
          icon="consult" tint="bg-teal/15 text-teal" label={p.talkToUs}
          right={<span className={`text-lg text-cream/30 transition-transform ${talk ? "rotate-90" : ""}`}>›</span>}
          onClick={() => setTalk((v) => !v)}
        />
        {talk && (
          <div className="px-4 py-4">
            <SupportForm />
          </div>
        )}
        <IconRow icon="shield" tint="bg-coral/15 text-coral" label={p.privacy} onClick={() => setPrivacy(true)} />
        <IconRow icon="check" tint="bg-amber/15 text-amber" label={p.rate} onClick={() => window.open(RATE_URL, "_blank", "noopener,noreferrer")} />
      </Group>

      <SectionTitle>{p.demo}</SectionTitle>
      <Group>
        <IconRow icon="alert" tint="bg-coral/15 text-coral" label={p.reset} danger onClick={reset} />
      </Group>

      {/* Rodapé */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber/15 font-display text-sm font-bold text-amber">M</span>
        <p className="text-[11px] text-cream/35">{p.version.replace("{v}", APP_VERSION)}</p>
      </div>

      {/* Sobre o app */}
      <Sheet open={about} onClose={() => setAbout(false)}>
        <h2 className="font-serif text-xl font-semibold text-cream">{p.aboutTitle}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cream/70">{p.aboutBody}</p>
        <p className="mt-4 text-xs text-cream/40">{p.version.replace("{v}", APP_VERSION)}</p>
      </Sheet>

      {/* Política de privacidade */}
      <Sheet open={privacy} onClose={() => setPrivacy(false)}>
        <h2 className="font-serif text-xl font-semibold text-cream">{p.privacyTitle}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cream/70">{p.privacyBody}</p>
      </Sheet>
    </div>
  );
}

// 3.1.E — Fale com a gente: formulário inline (expande no Perfil).
function SupportForm() {
  const c = useContent();
  const p = c.profile;
  const { locale } = useI18n();
  const { s } = usePrototype();
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

  return (
    <div>
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
            rows={5}
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
