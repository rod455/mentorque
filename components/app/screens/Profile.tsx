"use client";

import { useEffect, useRef, useState } from "react";
import { apiPost } from "@/lib/app/apiBase";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/app/auth";
import { usePrototype } from "@/lib/app/store";
import { AVISO, cancelar, notificacoesDisponiveis, pedirPermissao } from "@/lib/app/notificacoes";
import { resizeImage } from "@/lib/app/image";
import { uploadUserPhoto } from "@/lib/app/uploadPhoto";
import { cancelSubscription, deleteAccount, openBillingPortal, reactivateSubscription } from "@/lib/app/billing";
import { isLocalDev, isNativeApp, nativePlatform, openExternal, sellsInApp, storeListingUrl } from "@/lib/app/wrapper";
import { googleOffer, hasActiveEntitlement, initPurchases, offerPrice, type GoogleOption } from "@/lib/app/purchases";
import { openPrivacyOptions, privacyOptionsRequired } from "@/lib/app/admob";
import { privacyUrl, termsUrl } from "@/lib/app/legal";
import { APP_VERSION } from "@/lib/app/content";
import { computeStatus } from "@/lib/app/gamification";
import { PhaseEmblem } from "../Emblem";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { AppHeader, Card, Icon, inputCls, SectionTitle, Sheet, useContent } from "../ui";

const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// "Avaliar o app" vai para a ficha da loja da plataforma (ver
// `storeListingUrl`); no navegador cai no site.

// O toggle "demo" de Premium (sem Stripe) só vale em dev local — nunca em
// produção, para não liberar Premium de graça se algo estiver desconfigurado.

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
  // No app da loja o portal sai para o navegador do sistema — assinatura
  // externa não pode ser operada dentro da WebView (política do Play).
  const managePlan = async () => {
    const r = await openBillingPortal();
    if (!r.url) return;
    if (isNativeApp()) openExternal(r.url);
    else window.location.href = r.url;
  };
  const softRefresh = () => { setTimeout(refreshSubscription, 1500); setTimeout(refreshSubscription, 4000); };

  // Assinatura comprada NA PLAY (Android): os botões do Stripe não servem para
  // ela. Detectamos pelo entitlement ativo no RevenueCat e, junto, carregamos
  // a oferta de retenção `save30` (2 meses do mensal com 30% off). O fluxo de
  // cancelar passa a oferecer o desconto antes de abrir a ficha da Play.
  const [lojaSub, setLojaSub] = useState(false);
  const [saveOpt, setSaveOpt] = useState<GoogleOption | null>(null);
  const [saveSheet, setSaveSheet] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  useEffect(() => {
    if (nativePlatform() !== "android" || !s.premium) return;
    (async () => {
      const pl = await initPurchases(user?.id ?? null);
      if (!pl) return;
      try {
        const info = await pl.getCustomerInfo();
        if (!hasActiveEntitlement(info.customerInfo)) return;
        setLojaSub(true);
        const offs = await pl.getOfferings();
        const pkgs = offs.current?.availablePackages ?? [];
        const monthly = pkgs.find((x) => x.packageType === "MONTHLY") ?? pkgs.find((x) => x.identifier === "$rc_monthly");
        setSaveOpt(googleOffer(monthly, "save30"));
      } catch { /* sem RevenueCat acessível: segue com os botões da web */ }
    })();
  }, [s.premium, user]);

  // Ficha de assinaturas da Play, já aberta no produto certo.
  const abrirFichaPlay = () => {
    const sku = saveOpt?.productId ?? "";
    openExternal(`https://play.google.com/store/account/subscriptions${sku ? `?sku=${sku}&package=mentorque.app` : ""}`);
  };

  const aceitarSave30 = async () => {
    if (!saveOpt || saveBusy) return;
    setSaveBusy(true);
    try {
      const pl = await initPurchases(user?.id ?? null);
      // Troca de plano dentro da mesma assinatura da Play: o "produto antigo"
      // é o id da própria assinatura, que é o mesmo para mensal e anual.
      const res = await pl?.purchaseSubscriptionOption({
        subscriptionOption: saveOpt,
        googleProductChangeInfo: { oldProductIdentifier: saveOpt.productId },
      });
      if (res && hasActiveEntitlement(res.customerInfo)) {
        setSaveOk(true);
        refreshSubscription();
        softRefresh();
      }
    } catch { /* cancelou/erro: permanece na folha */ } finally {
      setSaveBusy(false);
    }
  };
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
  // O UMP roda na abertura do app (Shell); aqui só perguntamos se ele exige
  // um ponto de entrada para revisar o consentimento.
  const [adPrivacy, setAdPrivacy] = useState(false);
  useEffect(() => setAdPrivacy(privacyOptionsRequired()), []);
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
  // Sair da conta leva para a Home, em vez de deixar o motorista no Perfil.
  //
  // Todo o bloco da conta (trocar senha, sair, excluir) vive dentro de
  // `{user && ...}`: no instante em que a sessão cai ele some e as linhas de
  // baixo sobem para debaixo do dedo. Foi assim que um toque em "Sair" acabou
  // abrindo "Avaliar o app" — o toque acertou a linha que tomou o lugar.
  const leave = async () => {
    await signOut();
    root({ name: "home" });
  };

  const removeAccount = async () => {
    if (typeof window !== "undefined" && !window.confirm(p.deleteConfirm)) return;
    await deleteAccount();
    await signOut();
    reset();
    root({ name: "cars" });
  };

  // Ligar o lembrete pede a permissão NATIVA do sistema.
  //
  // Antes isto chamava `Notification.requestPermission()`, a API do navegador.
  // Dentro do app das lojas ela não serve: a permissão que ela concede é da
  // WebView, e quem agenda notificação no aparelho é o plugin nativo, que
  // continua sem permissão nenhuma. E o caminho alternativo salvava a
  // preferência como se tivesse dado certo. Nos dois casos o interruptor ficava
  // ligado sem nada agendado atrás.
  //
  // Agora só liga se o sistema tiver dito sim de verdade. Recusa mantém o
  // interruptor desligado, que é a informação honesta: aviso não vai chegar.
  const toggleNotifications = async (on: boolean) => {
    if (!on) {
      setNotifications(false);
      await cancelar(AVISO.fimDoTeste);
      return;
    }
    setNotifications(await pedirPermissao());
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
              ) : lojaSub ? (
                // Assinatura da Play: gerenciar abre a loja; cancelar passa
                // antes pela oferta de retenção (se ela carregou).
                <>
                  <Button variant="secondary" className="mt-3 w-full" onClick={abrirFichaPlay}>{p.manageStore}</Button>
                  <button
                    onClick={() => (saveOpt ? setSaveSheet(true) : abrirFichaPlay())}
                    className="mt-2 w-full py-1.5 text-center text-sm text-cream/45 hover:text-coral"
                  >
                    {p.cancelPlan}
                  </button>
                </>
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
      ) : !sellsInApp() ? null : (
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
        {/* Só onde o aparelho consegue notificar. No navegador não existe
            agendamento local, então o interruptor prometeria um aviso que nunca
            sairia — foi exatamente por isso que a versão anterior dele saiu. */}
        {notificacoesDisponiveis() && (
          <IconRow icon="alert" tint="bg-teal/15 text-teal" label={p.notifications} right={<Toggle on={s.notifications} onChange={toggleNotifications} />} />
        )}
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
        <IconRow icon="book" tint="bg-cream/10 text-cream/70" label={p.terms} onClick={() => openExternal(termsUrl(locale))} />
        {/* Exigência do Google quando a mensagem de consentimento é exibida:
            o usuário precisa poder rever a escolha depois. */}
        {adPrivacy && (
          <IconRow icon="shield" tint="bg-graphite-700 text-cream/60" label={p.adPrivacy} onClick={openPrivacyOptions} />
        )}
        <IconRow icon="check" tint="bg-amber/15 text-amber" label={p.rate} onClick={() => openExternal(storeListingUrl())} />
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
            <IconRow icon="user" tint="bg-graphite-700 text-cream/60" label={c.auth.signOut} onClick={leave} />
            <IconRow icon="alert" tint="bg-coral/15 text-coral" label={p.deleteAccount} danger onClick={removeAccount} />
          </Group>
        </>
      )}

      {/* Ferramentas de desenvolvimento — só em localhost. Antes apareciam em
          produção (web), com o rótulo "Reiniciar protótipo" à vista de quem
          avalia o app nas lojas. */}
      {isLocalDev() && (
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
      {/* Retenção pré-cancelamento (assinatura da Play): oferece o save30
          antes de mandar para a ficha da loja. */}
      <Sheet open={saveSheet} onClose={() => { setSaveSheet(false); setSaveOk(false); }}>
        {saveOk ? (
          <div className="flex flex-col items-center pt-2 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/biela/biela-idle.png" alt="" className="h-24 w-24 object-contain" draggable={false} />
            <p className="mt-3 font-serif text-xl font-bold text-cream">{p.saveDone}</p>
            <Button className="mt-5 w-full" onClick={() => { setSaveSheet(false); setSaveOk(false); }}>OK</Button>
          </div>
        ) : (
          <div className="flex flex-col items-center pt-2 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/biela/biela-acenando.png" alt="" className="h-24 w-24 object-contain" draggable={false} />
            <h2 className="mt-2 font-serif text-xl font-bold text-cream">{p.saveTitle}</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-cream/65">{p.saveBody}</p>
            <Button className="mt-5 w-full" disabled={saveBusy} onClick={aceitarSave30}>
              {saveBusy
                ? "…"
                : offerPrice(saveOpt)
                  ? p.saveCta.replace("{preco}", offerPrice(saveOpt) ?? "")
                  : p.saveCtaNoPrice}
            </Button>
            <button
              onClick={() => { setSaveSheet(false); abrirFichaPlay(); }}
              className="mt-3 text-sm text-cream/45 underline-offset-2 hover:text-coral hover:underline"
            >
              {p.saveNo}
            </button>
          </div>
        )}
      </Sheet>

      <Sheet open={privacy} onClose={() => setPrivacy(false)}>
        <h2 className="font-serif text-xl font-semibold text-cream">{p.privacyTitle}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cream/70">{p.privacyBody}</p>
        {/* O texto acima é um resumo; o documento que vale é o do site. Antes
            ele só aparecia citado no meio do parágrafo, como endereço escrito
            por extenso — dava para ler, não dava para tocar. */}
        <Button variant="secondary" className="mt-4 w-full" onClick={() => openExternal(privacyUrl(locale))}>
          {p.privacyFull}
        </Button>
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
      // `apiPost`, não `fetch` com JSON.
      //
      // `content-type: application/json` numa chamada entre origens obriga o
      // navegador a mandar antes um OPTIONS, e o registro em apiBase.ts conta
      // que essa verificação morria dentro da WebView do iPhone — as chamadas
      // não chegavam NEM como OPTIONS. O middleware hoje responde CORS, mas o
      // canal por onde o usuário reclama do app é o último que pode depender
      // disso: se ele falhar, ninguém avisa, porque avisar é justamente o que
      // ele deixou de fazer.
      const res = await apiPost("/api/feedback", {
        type: supType,
        message: supMsg.trim(),
        name: s.name || undefined,
        email: (supEmail || s.email || "").trim() || undefined,
        userId: deviceId(),
        locale,
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