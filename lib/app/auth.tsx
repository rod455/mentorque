"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";

type Result = { error?: string; needsConfirm?: boolean };

type AuthValue = {
  user: User | null;
  ready: boolean;   // initial session resolved
  enabled: boolean; // supabase auth configured
  signUpEmail: (email: string, password: string, name?: string) => Promise<Result>;
  signInEmail: (email: string, password: string) => Promise<Result>;
  signInGoogle: () => Promise<Result>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getBrowserSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase); // if disabled, we're "ready" (guest)

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const redirectTo = () => (typeof window !== "undefined" ? `${window.location.origin}/app` : undefined);

  const signUpEmail = useCallback(async (email: string, password: string, name?: string): Promise<Result> => {
    if (!supabase) return { error: "auth_disabled" };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: name ? { name } : undefined, emailRedirectTo: redirectTo() },
    });
    if (error) return { error: error.message };
    // No session yet → email confirmation required.
    return { needsConfirm: !data.session };
  }, [supabase]);

  const signInEmail = useCallback(async (email: string, password: string): Promise<Result> => {
    if (!supabase) return { error: "auth_disabled" };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { error: error.message } : {};
  }, [supabase]);

  const signInGoogle = useCallback(async (): Promise<Result> => {
    if (!supabase) return { error: "auth_disabled" };
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    return error ? { error: error.message } : {};
  }, [supabase]);

  const signOut = useCallback(async () => { await supabase?.auth.signOut(); }, [supabase]);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, enabled: !!supabase, signUpEmail, signInEmail, signInGoogle, signOut }),
    [user, ready, supabase, signUpEmail, signInEmail, signInGoogle, signOut]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
