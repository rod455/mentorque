"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/app/auth";
import { useNav } from "@/lib/app/nav";
import { appleLoginDisponivel } from "@/lib/app/socialLogin";
import { Button } from "@/components/ui/Button";
import { Card, useContent } from "../ui";

// Field base — dark input; icon slots via pl-11 / pr-11.
const field =
  "w-full rounded-xl bg-graphite-800 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" />
    </svg>
  );
}
function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}
function EyeIcon({ off, className }: { off?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
      {off ? <path d="m3 3 18 18" /> : null}
    </svg>
  );
}

export function AuthScreen() {
  const c = useContent();
  const a = c.auth;
  const { back } = useNav();
  const { signInEmail, signUpEmail, signInGoogle, signInApple, resetPassword, oauthError } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);
  // No iPhone o login social acontece dentro do app (folha nativa da Apple /
  // do Google) e pode demorar alguns segundos entre autorizar e a sessão
  // existir. Sem estado aqui os botões pareciam mortos.
  const [social, setSocial] = useState<"" | "google" | "apple">("");
  const [socialErr, setSocialErr] = useState("");
  // Só depois de montar: a plataforma se descobre no aparelho, e decidir no
  // servidor faria o botão piscar diferente do que o cliente conclui.
  const [comApple, setComApple] = useState(false);
  useEffect(() => { setComApple(appleLoginDisponivel()); }, []);

  const doSocial = async (provider: "google" | "apple") => {
    if (social) return;
    setErr(""); setNotice(""); setSocialErr(""); setSocial(provider);
    try {
      const res = provider === "google" ? await signInGoogle() : await signInApple();
      if (res.canceled || res.deferred) return;
      if (res.error) { setSocialErr(res.error); return; }
      back();
    } catch (e) {
      setSocialErr(e instanceof Error ? e.message : a.errGeneric);
    } finally {
      setSocial("");
    }
  };

  const submit = async () => {
    setErr(""); setNotice(""); setBusy(true);
    try {
      const res = mode === "in"
        ? await signInEmail(email, password)
        : await signUpEmail(email, password, name.trim() || undefined);
      if (res.error) { setErr(/invalid|credential/i.test(res.error) ? a.errInvalid : a.errGeneric); return; }
      if (res.needsConfirm) { setConfirmSent(true); return; }
      back();
    } catch { setErr(a.errGeneric); } finally { setBusy(false); }
  };

  const forgot = async () => {
    setErr(""); setNotice("");
    if (!email.trim()) { setErr(a.resetNeedEmail); return; }
    const res = await resetPassword(email);
    if (res.error) setErr(a.errGeneric);
    else setNotice(a.resetSent);
  };

  if (confirmSent) {
    return (
      <div>
        <BackButton onClick={back} />
        <Hero tagline={a.confirmTitle} />
        <Card className="text-sm text-cream/80">{a.confirmBody.replace("{email}", email)}</Card>
        <Button variant="ghost" className="mt-4 w-full" onClick={back}>{a.guestNote}</Button>
      </div>
    );
  }

  return (
    <div>
      <BackButton onClick={back} />
      <Hero tagline={a.tagline} />

      <Card>
        {/* Social */}
        <button onClick={() => doSocial("google")} disabled={!!social} className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-cream px-4 py-3 font-display text-sm font-semibold text-graphite transition-colors hover:bg-white disabled:opacity-60">
          <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/><path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.7 9.14 4.75 12 4.75Z"/></svg>
          {social === "google" ? a.working : a.google}
        </button>
        {comApple && (
          <button onClick={() => doSocial("apple")} disabled={!!social} className="mt-2.5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-black px-4 py-3 font-display text-sm font-semibold text-white ring-1 ring-white/15 transition-opacity hover:opacity-90 disabled:opacity-60">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M16.365 1.43c0 1.14-.417 2.2-1.11 2.98-.84.95-2.2 1.68-3.32 1.6-.14-1.12.42-2.3 1.09-3.05.75-.84 2.08-1.5 3.16-1.53.03.13.04.27.04.4l.14-.4Zm3.6 15.9c-.2.47-.44.9-.72 1.3-.5.72-.9 1.22-1.22 1.5-.5.46-1.03.7-1.6.72-.4 0-.9-.12-1.47-.35-.57-.23-1.1-.35-1.58-.35-.5 0-1.04.12-1.63.35-.6.23-1.07.35-1.44.36-.55.02-1.1-.22-1.63-.73-.34-.3-.77-.82-1.28-1.56-.55-.8-1-1.72-1.35-2.78-.38-1.13-.57-2.23-.57-3.3 0-1.22.26-2.28.79-3.16a4.65 4.65 0 0 1 1.66-1.68 4.47 4.47 0 0 1 2.24-.63c.42 0 .98.13 1.68.4.7.26 1.15.4 1.35.4.15 0 .65-.16 1.5-.47.8-.29 1.48-.41 2.03-.36 1.5.12 2.63.71 3.38 1.78-1.34.81-2 1.95-1.99 3.4.01 1.14.42 2.08 1.24 2.83.37.35.79.62 1.25.81-.1.29-.2.57-.32.84Z"/></svg>
            {social === "apple" ? a.working : a.apple}
          </button>
        )}
        {(socialErr || oauthError) && (
          <p className="mt-2.5 rounded-lg bg-coral/10 px-3 py-2 text-center text-xs leading-snug text-coral ring-1 ring-coral/25">
            Não conseguimos concluir o login pelo provedor. Tente novamente ou entre com e-mail e senha.
            <span className="mt-1 block text-[10px] opacity-70">{socialErr || oauthError}</span>
          </p>
        )}
        <p className="mt-2.5 text-center text-xs text-cream/45">{a.socialNote}</p>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3 text-xs text-cream/35">
          <span className="h-px flex-1 bg-white/10" />{a.orEmail}<span className="h-px flex-1 bg-white/10" />
        </div>

        {/* Email form */}
        <div className="space-y-2.5">
          {mode === "up" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={a.namePh} className={`${field} px-3.5`} />
          )}
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-cream/40" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder={a.emailPh} className={`${field} pl-11 pr-3.5`} />
          </div>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-cream/40" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder={a.passwordPh} className={`${field} pl-11 pr-11`} />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/70" aria-label="toggle password">
              <EyeIcon off={showPw} className="h-5 w-5" />
            </button>
          </div>

          {err && <p className="text-xs text-coral">{err}</p>}
          {notice && <p className="text-xs text-teal">{notice}</p>}

          <Button size="lg" className="w-full" disabled={busy || !email || !password} onClick={submit}>
            {busy ? a.working : mode === "in" ? a.submitSignIn : a.submitSignUp}
          </Button>
        </div>

        {mode === "in" && (
          <button onClick={forgot} className="mt-3 w-full text-center text-sm font-medium text-amber/85 hover:text-amber">
            {a.forgot}
          </button>
        )}
      </Card>

      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); setNotice(""); }} className="mt-4 w-full text-center text-sm font-medium text-cream/70 hover:text-cream">
        {mode === "in" ? a.toSignUp : a.toSignIn}
      </button>
      <button onClick={back} className="mt-2 w-full text-center text-xs text-cream/45 hover:text-cream/70">{a.guestNote}</button>
    </div>
  );
}

// Small floating back arrow (the hero replaces the usual header).
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="pt-4">
      <button onClick={onClick} className="grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream" aria-label="back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
    </div>
  );
}

// Branded hero: Biela taking a coffee break + wordmark + tagline.
function Hero({ tagline }: { tagline: string }) {
  return (
    <div className="relative flex flex-col items-center px-4 pb-5 pt-2 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 mx-auto h-40 w-40 rounded-full bg-amber/15 blur-3xl" />
      <img src="/biela/biela-cafe-anim.webp" alt="Biela" className="relative h-28 w-28 object-contain" draggable={false} />
      <p className="relative mt-1 font-serif text-2xl font-semibold text-cream">Mentorque</p>
      <p className="relative mt-1 max-w-[16rem] text-sm leading-snug text-cream/60">{tagline}</p>
    </div>
  );
}
