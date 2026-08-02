"use client";

import { useEffect, useRef, useState } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/app/auth";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { resizeImage } from "@/lib/app/image";
import { uploadUserPhoto } from "@/lib/app/uploadPhoto";
import { cancelSubscription, deleteAccount, openBillingPortal, reactivateSubscription, startCheckout } from "@/lib/app/billing";
import { getStripeJs, stripeConfigured } from "@/lib/app/stripeClient";
import { trialDaysFor, trialPlatform, type Platform } from "@/lib/app/platform";
import { isNativeApp } from "@/lib/app/wrapper";
import { hasActiveEntitlement, initPurchases, type RcPackage } from "@/lib/app/purchases";
import { APP_VERSION, carName } from "@/lib/app/content";
import { computeStatus } from "@/lib/app/gamification";
import { PhaseEmblem } from "../Emblem";
import { useNav, type View } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { AppHeader, Card, Icon, inputCls, SectionTitle, Sheet, useContent } from "../ui";

const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// Store links — trocar pelos links reais da Play/App Store quando publicar.
const RATE_URL = "https://mentorque.com.br";

// O toggle "demo" de Premium (sem Stripe) só vale em dev local — nunca em
// produção, para não liberar Premium de graça se algo estiver desconfigurado.
const isLocalDev = () => typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])/.test(window.location.hostname);

// "1 de setembro de 2026" a partir de um ISO.
function fmtDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", { day: "numeric", month: "long", year: "numeric" });
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.7 9.14 4.75 12 4.75Z" />
    </svg>
  );
}
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.365 1.43c0 1.14-.417 2.2-1.11 2.98-.84.95-2.2 1.68-3.32 1.6-.14-1.12.42-2.3 1.09-3.05.75-.84 2.08-1.5 3.16-1.53.03.13.04.27.04.4l.14-.4Zm3.6 15.9c-.2.47-.44.9-.72 1.3-.5.72-.9 1.22-1.22 1.5-.5.46-1.03.7-1.6.72-.4 0-.9-.12-1.47-.35-.57-.23-1.1-.35-1.58-.35-.5 0-1.04.12-1.63.35-.6.23-1.07.35-1.44.36-.55.02-1.1-.22-1.63-.73-.34-.3-.77-.82-1.28-1.56-.55-.8-1-1.72-1.35-2.78-.38-1.13-.57-2.23-.57-3.3 0-1.22.26-2.28.79-3.16a4.65 4.65 0 0 1 1.66-1.68 4.47 4.47 0 0 1 2.24-.63c.42 0 .98.13 1.68.4.7.26 1.15.4 1.35.4.15 0 .65-.16 1.5-.47.8-.29 1.48-.41 2.03-.36 1.5.12 2.63.71 3.38 1.78-1.34.81-2 1.95-1.99 3.4.01 1.14.42 2.08 1.24 2.83.37.35.79.62 1.25.81-.1.29-.2.57-.32.84Z" />
    </svg>
  );
}

// iOS-style on/off switch. Knob lives inside via flex + padding, so it can
// never bleed past the track (no absolute/translate overflow).
function Toggle({ on, onChange, size = "md" }: { on: boolean; onChange: (v: boolean) => void; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors ${sm ? "h-5 w-9" : "h-6 w-11"} ${on ? "bg-amber" : "bg-graphite-600"}`}
    >
      <span className={`rounded-full bg-cream shadow transition-transform ${sm ? "h-4 w-4" : "h-5 w-5"} ${on ? (sm ? "translate-x-4" : "translate-x-5") : "translate-x-0"}`} />
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
  const { locale } = useI18n();
  const { user, enabled, signOut, resetPassword } = useAuth();
  const { s, setName, setState, setPremium, setNotifications, setUnits, setAvatar, subscribed, subscriptionEndsAt, subscriptionCanceling, refreshSubscription, reset } = usePrototype();
  const { go, root } = useNav();

  const [busyPlan, setBusyPlan] = useState(false);
  // "Gerenciar" abre o portal do Stripe; cancelar encerra no fim do período.
  const managePlan = async () => { const r = await openBillingPortal(); if (r.url) window.location.href = r.url; };
  const softRefresh = () => { setTimeout(refreshSubscription, 1500); setTimeout(refreshSubscription, 4000); };
  const cancelPlan = async () => {
    if (!subscribed) { setPremium(false); return; } // demo
    if (typeof window !== "undefined" && !window.confirm(p.cancelConfirm)) return;
    setBusyPlan(true);
    const r = await cancelSubscription();
    setBusyPlan(false);
    if (!r.error) { refreshSubscription(); softRefresh(); }
  };
  const reactivatePlan = async () => {
    setBusyPlan(true);
    const r = await reactivateSubscription();
    setBusyPlan(false);
    if (!r.error) { refreshSubscription(); softRefresh(); }
  };
  const gam = computeStatus(s);
  const phaseName = g.phases[gam.phase.id].name;
  const [about, setAbout] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [talk, setTalk] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(s.name ?? "");
  const [pwSent, setPwSent] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Name shown at the top: user's name → Google name → email prefix.
  const googleName = (user?.user_metadata?.full_name ?? user?.user_metadata?.name) as string | undefined;
  const displayName = s.name?.trim() || googleName?.trim() || user?.email?.split("@")[0] || p.driverDefault;
  const provider = (user?.app_metadata?.provider as string | undefined) ?? "email";
  const providerLabel = provider === "google" ? "Google" : provider === "apple" ? "Apple" : "e-mail";

  const changePassword = async () => {
    if (!user?.email) return;
    const r = await resetPassword(user.email);
    if (!r.error) setPwSent(true);
  };
  const removeAccount = async () => {
    if (typeof window !== "undefined" && !window.confirm(p.deleteConfirm)) return;
    await deleteAccount();
    await signOut();
    reset();
    root({ name: "cars" });
  };

  // Ativar notificações pede a permissão de push do sistema (iOS/Android/desktop).
  const toggleNotifications = async (on: boolean) => {
    if (!on) { setNotifications(false); return; }
    if (typeof window !== "undefined" && "Notification" in window && typeof Notification.requestPermission === "function") {
      try {
        const perm = await Notification.requestPermission();
        setNotifications(perm === "granted");
      } catch {
        setNotifications(false);
      }
    } else {
      // Sem API de notificação (ex.: iOS fora do app instalado) — salva a preferência.
      setNotifications(true);
    }
  };

  // Profile photo: user's uploaded avatar wins; otherwise the Google picture.
  const googlePic = (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture) as string | undefined;
  const avatarSrc = s.avatar ?? googlePic ?? null;
  const pickAvatar = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file, 400, 0.85);
      // Logado → sobe pro Storage e guarda só a URL. Convidado/falha → local.
      const url = user ? await uploadUserPhoto(user.id, "avatar", dataUrl) : null;
      setAvatar(url ?? dataUrl);
    } catch { /* ignore */ }
  };

  return (
    <div>
      <AppHeader title={p.title} onBack={() => root({ name: "home" })} />

      {/* Topo: foto + nome + e-mail (logado) — ou card de login (deslogado) */}
      {enabled && user ? (
        <div className="flex flex-col items-center pb-1 pt-2 text-center">
          <button onClick={() => avatarRef.current?.click()} className="relative" aria-label={p.changePhoto}>
            <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-teal/15 text-teal ring-1 ring-white/10">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-semibold text-cream">{displayName[0]?.toUpperCase() ?? "?"}</span>
              )}
            </span>
            <span className="absolute bottom-0.5 right-0.5 grid h-7 w-7 place-items-center rounded-full bg-amber text-graphite ring-4 ring-graphite">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.2" /></svg>
            </span>
          </button>
          <button onClick={() => { setNameInput(s.name ?? ""); setEditName(true); }} className="mt-3 font-serif text-xl font-bold text-cream">
            {displayName}
          </button>
          <p className="mt-0.5 text-sm text-cream/55">{user.email}</p>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickAvatar(e.target.files?.[0])} />
        </div>
      ) : enabled ? (
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
      ) : null}

      {/* 2) Premium — linha em destaque que expande os benefícios (ou upsell) */}
      {s.premium ? (
        <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-amber/25 via-amber/10 to-amber/[0.05] ring-1 ring-amber/45">
          <button onClick={() => setPremiumOpen((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/25 text-lg text-amber">★</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-cream/60">{p.plan}</span>
              <span className="block font-serif text-base font-bold text-cream">{p.premium}</span>
            </span>
            <span className="shrink-0 rounded-md bg-amber/25 px-2 py-0.5 text-[11px] font-semibold text-amber">★ Premium</span>
            <span className={`shrink-0 text-lg text-amber transition-transform ${premiumOpen ? "rotate-90" : ""}`}>›</span>
          </button>
          {premiumOpen && (
            <div className="border-t border-amber/15 bg-graphite-800/60 px-4 pb-4 pt-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-cream/40">{p.perksTitle}</p>
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
              {/* Validade da assinatura */}
              {subscribed && subscriptionEndsAt && (
                <p className={`mt-4 text-center text-[13px] ${subscriptionCanceling ? "text-coral/80" : "text-cream/55"}`}>
                  {(subscriptionCanceling ? p.expiresOn : p.activeUntil).replace("{d}", fmtDate(subscriptionEndsAt, locale))}
                </p>
              )}
              {subscriptionCanceling ? (
                // Cancelamento agendado → oferecer reativar
                <Button className={`w-full ${subscribed && subscriptionEndsAt ? "mt-3" : "mt-4"}`} disabled={busyPlan} onClick={reactivatePlan}>
                  {p.reactivate}
                </Button>
              ) : subscribed ? (
                <>
                  <Button variant="secondary" className="mt-3 w-full" onClick={managePlan}>{p.manage}</Button>
                  <button onClick={cancelPlan} disabled={busyPlan} className="mt-2 w-full py-1.5 text-center text-sm text-cream/45 hover:text-coral disabled:opacity-50">
                    {p.cancelPlan}
                  </button>
                </>
              ) : (
                <button onClick={cancelPlan} className="mt-4 w-full py-1.5 text-center text-sm text-cream/45 hover:text-coral">
                  {p.cancelPlan}
                </button>
              )}
            </div>
          )}
        </div>
      ) : isNativeApp() ? null : (
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
        <IconRow icon="alert" tint="bg-teal/15 text-teal" label={p.notifications} right={<Toggle on={s.notifications} onChange={toggleNotifications} />} />
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

      {/* Conta — no final: forma de login (ou trocar senha) + sair + excluir */}
      {enabled && user && (
        <>
          <SectionTitle>{p.accountTitle}</SectionTitle>
          <Group>
            {provider === "google" || provider === "apple" ? (
              <div className="flex w-full items-center gap-3 px-4 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06]">
                  {provider === "apple" ? <AppleIcon className="h-5 w-5 text-cream" /> : <GoogleIcon className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1 font-display text-[15px] text-cream">{p.connectedWith.replace("{p}", providerLabel)}</span>
              </div>
            ) : (
              <IconRow icon="shield" tint="bg-teal/15 text-teal" label={p.changePassword} action={pwSent ? p.passwordSent : undefined} onClick={pwSent ? undefined : changePassword} />
            )}
            <IconRow icon="user" tint="bg-graphite-700 text-cream/60" label={c.auth.signOut} onClick={() => signOut()} />
            <IconRow icon="alert" tint="bg-coral/15 text-coral" label={p.deleteAccount} danger onClick={removeAccount} />
          </Group>
        </>
      )}

      {/* Ferramentas de demo — na web (para testes); nunca nos apps da loja */}
      {!isNativeApp() && (
        <>
          <SectionTitle>{p.demo}</SectionTitle>
          <Group>
            <IconRow icon="alert" tint="bg-coral/15 text-coral" label={p.reset} danger onClick={reset} />
          </Group>
        </>
      )}

      {/* Rodapé */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber/15 font-display text-sm font-bold text-amber">M</span>
        <p className="text-[11px] text-cream/35">{p.version.replace("{v}", APP_VERSION)}</p>
      </div>

      {/* Editar nome */}
      <Sheet open={editName} onClose={() => setEditName(false)}>
        <h2 className="font-serif text-xl font-semibold text-cream">{p.name}</h2>
        <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder={p.namePh} className={`mt-4 ${inputCls}`} />
        <Button size="lg" className="mt-4 w-full" onClick={() => { setName(nameInput); setEditName(false); }}>
          {c.common.save}
        </Button>
      </Sheet>

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
// Verde de "incluído" (círculo com check).
function TealCheck() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-teal text-graphite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

export function SubscribeScreen({ ctx: _ctx }: { ctx?: string }) {
  const c = useContent();
  const sub = c.subscribe;
  const { setPremium, subscribed, refreshSubscription } = usePrototype();
  const { user } = useAuth();
  const { back, go, root } = useNav();
  const [remind, setRemind] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  useEffect(() => setPlatform(trialPlatform()), []);
  const trialDays = trialDaysFor(platform);

  // Plano selecionável no paywall (o checkout embutido nasce com um preço fixo,
  // então a escolha acontece aqui). O onboarding pré-seleciona via ctx.
  const [plan, setPlan] = useState<"monthly" | "annual">(_ctx === "onb-monthly" ? "monthly" : "annual");
  const subscribe = () => {
    if (!user) { go({ name: "auth" }); return; }
    if (!stripeConfigured() && isLocalDev()) { setPremium(true); back(); return; } // demo só em dev
    go({ name: "checkout", plan }); // checkout embutido (com teste grátis)
  };

  // Funil de saída do paywall: QUALQUER saída (X, abas de baixo, gesto de
  // voltar) dispara as ofertas — 10% OFF (suprimido por 30 min) e, na
  // rejeição ou se o 10% estiver suprimido, 25% OFF em tela cheia (1x a cada
  // 3 dias). Assinantes e o app da loja saem direto.
  const OFFER_KEY = "mentorque-exit-offer-ts";
  const OFFER2_KEY = "mentorque-exit2-ts";
  const [showOffer, setShowOffer] = useState(false);
  const [showOffer2, setShowOffer2] = useState(false);
  const [offerLeft, setOfferLeft] = useState(120);
  const pendingExit = useRef<View | null>(null);
  useEffect(() => {
    if (!showOffer) return;
    const t = setInterval(() => setOfferLeft((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [showOffer]);

  // Conclui a saída: vai pro destino pedido (ex.: aba Início) ou volta.
  const exitNow = () => {
    const target = pendingExit.current;
    pendingExit.current = null;
    if (target) root(target);
    else back();
  };

  const fresh = (key: string, windowMs: number) => {
    let last = 0;
    try { last = Number(window.localStorage.getItem(key) ?? 0); } catch { /* ignore */ }
    return Date.now() - last > windowMs;
  };
  const mark = (key: string) => { try { window.localStorage.setItem(key, String(Date.now())); } catch { /* ignore */ } };

  // Tenta mostrar uma oferta na saída. true = mostrou (segura a navegação).
  const requestExit = (target: View | null): boolean => {
    if (subscribed || isNativeApp()) return false;
    pendingExit.current = target;
    if (fresh(OFFER_KEY, 30 * 60 * 1000)) { mark(OFFER_KEY); setOfferLeft(120); setShowOffer(true); return true; }
    if (fresh(OFFER2_KEY, 3 * 24 * 60 * 60 * 1000)) { mark(OFFER2_KEY); setShowOffer2(true); return true; }
    return false;
  };

  // Saídas vindas de fora da tela (abas de baixo, gesto de voltar) chegam
  // como evento disparado pelo Shell; preventDefault segura a navegação.
  useEffect(() => {
    const h = (e: Event) => {
      const target = (e as CustomEvent<View | null>).detail ?? null;
      if (requestExit(target)) e.preventDefault();
    };
    window.addEventListener("mq-paywall-exit", h);
    return () => window.removeEventListener("mq-paywall-exit", h);
  });

  const tryClose = () => { if (!requestExit(null)) back(); };

  useEffect(() => {
    if (showOffer && offerLeft <= 0) { setShowOffer(false); exitNow(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerLeft, showOffer]);

  const subscribeOffer = () => {
    if (!user) { go({ name: "auth" }); return; }
    if (!stripeConfigured() && isLocalDev()) { setPremium(true); back(); return; }
    go({ name: "checkout", plan: "annual", offer: "exit10" });
  };

  // Rejeitou o 10%: entra a oferta final (25%) se disponível; senão sai.
  const dismissOffer1 = () => {
    setShowOffer(false);
    if (!subscribed && fresh(OFFER2_KEY, 3 * 24 * 60 * 60 * 1000)) {
      mark(OFFER2_KEY);
      setShowOffer2(true);
      return;
    }
    exitNow();
  };

  const subscribeOffer2 = () => {
    if (!user) { go({ name: "auth" }); return; }
    if (!stripeConfigured() && isLocalDev()) { setPremium(true); back(); return; }
    go({ name: "checkout", plan: "annual", offer: "exit25" });
  };

  const mmss = `${String(Math.floor(Math.max(0, offerLeft) / 60)).padStart(2, "0")}:${String(Math.max(0, offerLeft) % 60).padStart(2, "0")}`;

  // App nativo iOS: compra interna via RevenueCat (Apple IAP). Carrega os
  // pacotes da oferta; sem RevenueCat (ex.: Android), fica o modo leitor.
  const [iap, setIap] = useState<{ monthly?: RcPackage; annual?: RcPackage } | null>(null);
  const [iapBusy, setIapBusy] = useState(false);
  useEffect(() => {
    if (!isNativeApp()) return;
    (async () => {
      const p = await initPurchases(user?.id ?? null);
      if (!p) return;
      try {
        const offs = await p.getOfferings();
        const pkgs = offs.current?.availablePackages ?? [];
        const monthly = pkgs.find((x) => x.packageType === "MONTHLY") ?? pkgs.find((x) => x.identifier === "$rc_monthly");
        const annual = pkgs.find((x) => x.packageType === "ANNUAL") ?? pkgs.find((x) => x.identifier === "$rc_annual");
        if (monthly || annual) setIap({ monthly, annual });
      } catch { /* sem ofertas → modo leitor */ }
    })();
  }, [user]);

  const buyNative = async () => {
    const pkg = plan === "monthly" ? iap?.monthly ?? iap?.annual : iap?.annual ?? iap?.monthly;
    if (!pkg || iapBusy) return;
    if (!user) { go({ name: "auth" }); return; }
    setIapBusy(true);
    try {
      const p = await initPurchases(user.id);
      const res = await p?.purchasePackage({ aPackage: pkg });
      if (res && hasActiveEntitlement(res.customerInfo)) {
        setPremium(true);
        refreshSubscription();
        back();
      }
    } catch { /* cancelado/erro — permanece na tela */ } finally {
      setIapBusy(false);
    }
  };

  const restoreNative = async () => {
    try {
      const p = await initPurchases(user?.id ?? null);
      const res = await p?.restorePurchases();
      if (res && hasActiveEntitlement(res.customerInfo)) { setPremium(true); refreshSubscription(); back(); }
    } catch { /* ignore */ }
  };

  if (isNativeApp()) {
    // Paywall com compra interna (IAP) quando o RevenueCat está configurado.
    if (iap) {
      return (
        <div className="flex min-h-[80vh] flex-col px-2 pb-6">
          <div className="flex items-center justify-between pb-2 pt-4 text-xs text-cream/50">
            <button onClick={back} aria-label="fechar" className="grid h-8 w-8 place-items-center rounded-full bg-graphite-700 text-cream/70">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <button onClick={restoreNative} className="hover:text-cream">{sub.restore}</button>
          </div>
          <div className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/biela/biela-idle.png" alt="Biela" className="h-28 w-28 object-contain" draggable={false} />
            <h1 className="mt-1 font-serif text-2xl font-bold text-cream">{sub.trialTitle}</h1>
          </div>
          <ul className="mx-auto mt-3 max-w-sm space-y-2">
            {sub.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-cream/85"><TealCheck /> {b}</li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["annual", "monthly"] as const).map((k) => {
              const pkg = k === "annual" ? iap.annual : iap.monthly;
              if (!pkg) return <span key={k} />;
              const sel = plan === k;
              return (
                <button key={k} onClick={() => setPlan(k)} className={`rounded-2xl p-4 text-left ring-2 transition-colors ${sel ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}>
                  <span className="block font-display text-base font-bold">{k === "annual" ? sub.planAnnual : sub.planMonthly}</span>
                  <span className={`mt-0.5 block text-sm ${sel ? "text-graphite/75" : "text-cream/60"}`}>
                    {pkg.product?.priceString ?? (k === "annual" ? sub.planAnnualPrice : sub.planMonthlyPrice)}
                  </span>
                </button>
              );
            })}
          </div>
          <Button size="lg" className="mt-4 w-full" onClick={buyNative} disabled={iapBusy}>
            {iapBusy ? "…" : sub.trialCta.replace("{n}", String(trialDays))}
          </Button>
          <p className="mx-auto mt-3 max-w-xs text-center text-xs leading-relaxed text-cream/45">
            {plan === "annual" ? sub.trialFine : sub.trialFineMonthly}
          </p>
        </div>
      );
    }
    // Sem IAP configurado (ex.: Android): modo leitor.
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/biela/biela-idle.png" alt="Biela" className="h-32 w-32 object-contain" draggable={false} />
        <h1 className="mt-3 font-serif text-2xl font-bold text-cream">{sub.readerTitle}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-cream/60">{sub.readerBody}</p>
        <Button className="mt-6" onClick={back}>{sub.readerOk}</Button>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Barra superior: fechar + links */}
      <div className="flex items-center justify-between pb-3 pt-4 text-xs text-cream/50">
        <button onClick={tryClose} aria-label="fechar" className="grid h-8 w-8 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => { refreshSubscription(); if (subscribed) back(); }} className="hover:text-cream">{sub.restore}</button>
          <span>·</span>
          <a href="/privacidade" className="hover:text-cream">{sub.termsLink}</a>
          <span>·</span>
          <a href="/privacidade" className="hover:text-cream">{sub.privacyLink}</a>
        </div>
      </div>

      {/* Herói */}
      <div className="flex flex-col items-center px-4 text-center">
        <img src="/biela/biela-idle.png" alt="Biela" className="h-32 w-32 object-contain" draggable={false} />
        <h1 className="mt-2 font-serif text-2xl font-bold text-cream">{sub.trialTitle}</h1>
      </div>

      {/* Benefícios */}
      <ul className="mx-auto mt-4 max-w-sm space-y-2.5">
        {sub.bullets.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-sm text-cream/85">
            <TealCheck /> {b}
          </li>
        ))}
      </ul>

      {/* Depoimentos */}
      <div className="mt-4 space-y-3">
        {sub.testimonials.map((t) => (
          <Card key={t.name}>
            <p className="text-amber">★★★★★</p>
            <p className="mt-1.5 text-sm italic text-cream/85">&quot;{t.quote}&quot;</p>
            <p className="mt-1 text-xs text-cream/50">— {t.name}</p>
          </Card>
        ))}
      </div>

      {/* Conheça o Premium — comparação */}
      <div className="mt-4 overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/[0.06]">
        <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr] items-center border-b border-white/[0.06] px-3.5 py-3">
          <span className="font-display text-sm font-semibold text-cream">{sub.knowTitle}</span>
          <span className="text-center text-xs font-medium text-cream/45">{sub.colFree}</span>
          <span className="text-center text-xs font-semibold text-amber">{sub.colPremium}</span>
        </div>
        <div className="[&>*+*]:border-t [&>*+*]:border-white/[0.05]">
          {sub.features.map((f) => (
            <div key={f.label} className="grid grid-cols-[1.6fr_0.6fr_0.7fr] items-center px-3.5 py-2.5">
              <span className="flex items-center gap-2.5 text-sm text-cream/85">
                <Icon name={f.icon} className="h-4 w-4 text-cream/45" /> {f.label}
              </span>
              <span className="flex justify-center">
                {f.free === "check" ? <TealCheck /> : f.free === "ltd" ? (
                  <span className="rounded bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber">{sub.ltd}</span>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-cream/25"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                )}
              </span>
              <span className="flex justify-center"><TealCheck /></span>
            </div>
          ))}
        </div>
      </div>

      {/* Lembrar antes do teste terminar — linha compacta, desativada por padrão */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-graphite-800 px-3.5 py-2.5 ring-1 ring-white/[0.06]">
        <Icon name="alert" className="h-4 w-4 text-cream/50" />
        <span className="flex-1 text-xs text-cream/70">{sub.reminder}</span>
        <Toggle on={remind} onChange={setRemind} size="sm" />
      </div>

      {/* Escolha do plano */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setPlan("annual")}
          className={`relative rounded-2xl p-4 text-left ring-2 transition-colors ${plan === "annual" ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}
        >
          <span className={`absolute -top-2.5 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${plan === "annual" ? "bg-graphite text-amber" : "bg-amber/20 text-amber"}`}>{sub.planBadge}</span>
          <span className="block font-display text-base font-bold">{sub.planAnnual}</span>
          <span className={`mt-0.5 block text-sm ${plan === "annual" ? "text-graphite/75" : "text-cream/60"}`}>{sub.planAnnualPrice}</span>
          <span className={`block text-xs ${plan === "annual" ? "text-graphite/60" : "text-cream/45"}`}>{sub.planAnnualNote}</span>
        </button>
        <button
          onClick={() => setPlan("monthly")}
          className={`rounded-2xl p-4 text-left ring-2 transition-colors ${plan === "monthly" ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}
        >
          <span className="block font-display text-base font-bold">{sub.planMonthly}</span>
          <span className={`mt-0.5 block text-sm ${plan === "monthly" ? "text-graphite/75" : "text-cream/60"}`}>{sub.planMonthlyPrice}</span>
        </button>
      </div>

      {/* CTA */}
      <Button size="lg" className="mt-4 w-full" onClick={subscribe}>
        {sub.trialCta.replace("{n}", String(trialDays))}
      </Button>
      <p className="mx-auto mt-3 max-w-xs text-center text-xs leading-relaxed text-cream/45">
        {plan === "annual" ? sub.trialFine : sub.trialFineMonthly}
      </p>

      {/* Pop-up de saída — 10% OFF (formato Bloom) */}
      {showOffer && (
        <div className="fixed inset-0 z-50 bg-black/60">
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[440px] rounded-t-3xl bg-cream px-6 pb-8 pt-5 text-center text-graphite">
            <button
              onClick={dismissOffer1}
              aria-label="fechar oferta"
              className="absolute right-4 top-4 text-graphite/45 hover:text-graphite"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <h2 className="mx-auto mt-4 max-w-xs font-serif text-2xl font-bold leading-snug">{sub.exitTitle}</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-graphite/55">{sub.exitSub}</p>
            <p className="mt-4 text-xs text-graphite/50">{sub.exitExpires}</p>
            <p className="font-display text-3xl font-bold tabular-nums">{mmss}</p>
            <div className="mt-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-bold text-graphite">{sub.exitBadge}</span>
              <p className="mt-2 font-serif text-3xl font-bold">{sub.exitPrice}</p>
            </div>
            <button
              onClick={subscribeOffer}
              className="mt-4 w-full rounded-full bg-graphite py-3.5 font-display text-[15px] font-semibold text-cream active:scale-[0.99]"
            >
              {sub.exitCta}
            </button>
            <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-graphite/55">{sub.exitFine}</p>
          </div>
        </div>
      )}

      {/* Oferta final — 25% OFF em tela cheia (formato Bloom) */}
      {showOffer2 && (
        <div className="fixed inset-0 z-[60] mx-auto w-full max-w-[440px] overflow-y-auto bg-graphite-900 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-h-full flex-col px-6 pb-8 pt-5">
            {/* Biela + faixas "OFERTA ÚNICA" (sem X — a recusa fica embaixo) */}
            <div className="relative mt-2 flex h-52 items-center justify-center overflow-hidden">
              {[
                { top: "top-3", rot: "-rotate-[18deg]" },
                { top: "top-16", rot: "rotate-[14deg]" },
                { top: "top-32", rot: "-rotate-[10deg]" },
              ].map((r, idx) => (
                <div key={idx} className={`absolute ${r.top} left-[-30%] w-[160%] ${r.rot} whitespace-nowrap bg-amber/10 py-1 text-center text-[10px] font-semibold tracking-[0.2em] text-amber/60`}>
                  {Array.from({ length: 4 }, () => sub.exit2Ribbon).join("   ·   ")}
                </div>
              ))}
              <div className="relative z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/biela/biela-acenando.png" alt="Biela" className="h-44 w-44 object-contain" draggable={false} />
              </div>
            </div>

            <h2 className="mt-3 text-center font-serif text-4xl font-bold text-cream">{sub.exit2Title}</h2>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-amber">
              <span aria-hidden>⚠️</span> {sub.exit2Warn}
            </p>

            <div className="mt-5 rounded-3xl bg-graphite-800 p-5 text-center ring-1 ring-white/[0.06]">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cream/60">{sub.exit2Best}</p>
              <div className="mt-3 rounded-2xl bg-graphite-900 p-4 ring-1 ring-white/[0.06]">
                <p className="text-sm text-cream/40 line-through">{sub.exit2Old}</p>
                <p className="mt-0.5 font-serif text-3xl font-bold text-cream">{sub.exit2Price}</p>
              </div>
            </div>
            <p className="mx-auto mt-3 max-w-xs text-center text-xs leading-relaxed text-cream/50">{sub.exit2Fine}</p>

            <div className="mt-auto pt-5">
              <button
                onClick={subscribeOffer2}
                className="w-full rounded-full bg-amber py-3.5 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
              >
                {sub.exit2Cta}
              </button>
              {/* Recusa discreta — sai da oferta */}
              <button
                onClick={() => { setShowOffer2(false); exitNow(); }}
                className="mx-auto mt-3 block text-xs text-cream/35 underline-offset-2 hover:text-cream/60 hover:underline"
              >
                {sub.exit2Skip}
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/45">
                {sub.exit2Agree}{" "}
                <a href="/privacidade" className="underline hover:text-cream">{sub.termsLink}</a>{" "}e{" "}
                <a href="/privacidade" className="underline hover:text-cream">{sub.privacyLink}</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 3.1.F — Checkout embutido (Stripe Embedded Checkout)
export function CheckoutScreen({ plan, offer }: { plan: "monthly" | "annual"; offer?: string }) {
  const c = useContent();
  const sub = c.subscribe;
  const { setPremium } = usePrototype();
  const { back } = useNav();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await startCheckout(plan, trialPlatform(), offer);
      if (cancelled) return;
      if (res.clientSecret) { setClientSecret(res.clientSecret); return; }
      // Stripe não configurado: em dev local cai no demo; em produção mostra erro.
      if ((res.error === "not_configured" || res.error === "no_price") && isLocalDev()) { setPremium(true); back(); return; }
      setErr(res.error === "unauthorized" ? sub.needLogin : sub.checkoutError);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  return (
    <div>
      <AppHeader title={sub.title} />
      {err ? (
        <Card className="text-center">
          <p className="text-sm text-coral">{err}</p>
          <Button variant="secondary" className="mt-3" onClick={back}>{c.common.cancel}</Button>
        </Card>
      ) : clientSecret ? (
        <div className="overflow-hidden rounded-2xl bg-white">
          <EmbeddedCheckoutProvider stripe={getStripeJs()} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-cream/55">{sub.working}</p>
      )}
    </div>
  );
}
