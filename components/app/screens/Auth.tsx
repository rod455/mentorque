"use client";

import { useState } from "react";
import { useAuth } from "@/lib/app/auth";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, inputCls, useContent } from "../ui";

export function AuthScreen() {
  const c = useContent();
  const a = c.auth;
  const { back } = useNav();
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const res = mode === "in"
        ? await signInEmail(email, password)
        : await signUpEmail(email, password, name.trim() || undefined);
      if (res.error) { setErr(/invalid|credential/i.test(res.error) ? a.errInvalid : a.errGeneric); return; }
      if (res.needsConfirm) { setConfirmSent(true); return; }
      back(); // logged in → the store syncs and the profile updates
    } catch { setErr(a.errGeneric); } finally { setBusy(false); }
  };

  if (confirmSent) {
    return (
      <div>
        <AppHeader title={a.confirmTitle} />
        <Card className="text-sm text-cream/80">{a.confirmBody.replace("{email}", email)}</Card>
        <Button variant="ghost" className="mt-4 w-full" onClick={back}>{a.guestNote}</Button>
      </div>
    );
  }

  return (
    <div>
      <AppHeader title={mode === "in" ? a.signInTitle : a.signUpTitle} subtitle={a.subtitle} />

      <button onClick={() => signInGoogle()} className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-cream px-4 py-3 font-display text-sm font-semibold text-graphite hover:bg-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/><path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.7 9.14 4.75 12 4.75Z"/></svg>
        {a.google}
      </button>

      <div className="my-4 flex items-center gap-3 text-xs text-cream/35">
        <span className="h-px flex-1 bg-white/10" />{a.or}<span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="space-y-3">
        {mode === "up" && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={a.namePh} className={inputCls} />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder={a.emailPh} className={inputCls} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder={a.passwordPh} className={inputCls} />
        {err && <p className="text-xs text-coral">{err}</p>}
        <Button size="lg" className="w-full" disabled={busy || !email || !password} onClick={submit}>
          {busy ? a.working : mode === "in" ? a.submitSignIn : a.submitSignUp}
        </Button>
      </div>

      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); }} className="mt-4 w-full text-center text-sm font-medium text-amber/85 hover:text-amber">
        {mode === "in" ? a.toSignUp : a.toSignIn}
      </button>
      <button onClick={back} className="mt-2 w-full text-center text-xs text-cream/45 hover:text-cream/70">{a.guestNote}</button>
    </div>
  );
}
