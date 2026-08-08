"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import {
  closeExternal,
  emailRedirectUrl,
  isIPad,
  isNativeApp,
  NATIVE_AUTH_CALLBACK,
  NATIVE_AUTH_REDIRECT,
  nativePlatform,
  onDeepLink,
  openExternal,
} from "./wrapper";
import { googleNativeConfigured, nativeSocialLogin } from "./socialLogin";

// `canceled`: o usuário fechou a folha do provedor — não é erro, a tela não
// deve piscar vermelho nem seguir adiante.
// `deferred`: o login continua FORA do app (aba do sistema) e termina no deep
// link. A tela de login precisa continuar de pé até o retorno.
type Result = { error?: string; needsConfirm?: boolean; canceled?: boolean; deferred?: boolean };

type AuthValue = {
  user: User | null;
  ready: boolean;   // initial session resolved
  enabled: boolean; // supabase auth configured
  signUpEmail: (email: string, password: string, name?: string) => Promise<Result>;
  signInEmail: (email: string, password: string) => Promise<Result>;
  signInGoogle: () => Promise<Result>;
  signInApple: () => Promise<Result>;
  resetPassword: (email: string) => Promise<Result>;
  signOut: () => Promise<void>;
  // Falha do retorno OAuth no app nativo. Sem isto o usuário voltava para a
  // tela de login sem nenhuma explicação — parecia que tinha dado certo.
  oauthError: string;
  clearOauthError: () => void;
};

const Ctx = createContext<AuthValue | null>(null);

// Conclui o login a partir do deep link de retorno do provedor.
//
// O Supabase usa PKCE: o `code_verifier` fica no armazenamento DESTE cliente
// (a WebView do app), então a troca do código pela sessão tem que acontecer
// aqui — não na aba do sistema onde o usuário digitou a senha.
async function completeOAuth(supabase: SupabaseClient, rawUrl: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "callback_url_invalida";
  }

  // O provedor pode devolver o erro tanto na query quanto no fragmento.
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const err = url.searchParams.get("error_description") ?? hash.get("error_description");
  if (err) {
    console.warn("[auth] oauth callback error:", err);
    closeExternal();
    return err;
  }

  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    closeExternal();
    return error?.message ?? "";
  }

  // Fallback para projetos configurados no fluxo implícito (tokens no #).
  const access_token = hash.get("access_token");
  const refresh_token = hash.get("refresh_token");
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    closeExternal();
    return error?.message ?? "";
  }
  // Chegou o deep link mas sem código nem token: quase sempre significa que
  // "mentorque://auth-callback" não está na lista de Redirect URLs do
  // Supabase, e o provedor devolveu para outro lugar.
  return "sem_codigo_no_retorno";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getBrowserSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase); // if disabled, we're "ready" (guest)
  const [oauthError, setOauthError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Retorno do OAuth no app nativo: o provedor redireciona para
  // `mentorque://auth-callback`, o Android/iOS reabre o app com essa URL e
  // é aqui que a sessão é criada.
  useEffect(() => {
    if (!supabase) return;
    return onDeepLink((url) => {
      if (!url.startsWith(NATIVE_AUTH_CALLBACK)) return;
      void completeOAuth(supabase, url).then(setOauthError);
    });
  }, [supabase]);

  const signUpEmail = useCallback(async (email: string, password: string, name?: string): Promise<Result> => {
    if (!supabase) return { error: "auth_disabled" };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: name ? { name } : undefined, emailRedirectTo: emailRedirectUrl() },
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

  // Login social.
  //
  // No iPhone o login é NATIVO: a folha da Apple / do Google devolve um idToken
  // direto para o app e o Supabase troca por sessão. Nada de navegador, nada de
  // redirecionamento — era justamente o ida-e-volta que nunca fechava, deixando
  // a sessão no site e o app deslogado (ver lib/app/socialLogin.ts).
  //
  // Fora daí (Android, iPad, ou Google sem client id configurado) sobra o
  // caminho antigo: abrir o provedor numa aba do sistema e receber o retorno
  // pelo deep link. Dentro da WebView não dá — o Google recusa WebView embutida
  // com `disallowed_useragent`.
  const signInOAuth = useCallback(async (provider: "google" | "apple"): Promise<Result> => {
    if (!supabase) return { error: "auth_disabled" };

    if (isNativeApp()) {
      const canNative =
        nativePlatform() === "ios" &&
        (provider === "apple" || (googleNativeConfigured() && !isIPad()));

      if (canNative) return await nativeSocialLogin(supabase, provider);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: NATIVE_AUTH_REDIRECT, skipBrowserRedirect: true },
      });
      if (error) return { error: error.message };
      if (!data?.url) return { error: "oauth_no_url" };
      openExternal(data.url);
      return { deferred: true };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: emailRedirectUrl() },
    });
    return error ? { error: error.message } : {};
  }, [supabase]);

  const signInGoogle = useCallback(() => signInOAuth("google"), [signInOAuth]);
  const signInApple = useCallback(() => signInOAuth("apple"), [signInOAuth]);

  const resetPassword = useCallback(async (email: string): Promise<Result> => {
    if (!supabase) return { error: "auth_disabled" };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: emailRedirectUrl() });
    return error ? { error: error.message } : {};
  }, [supabase]);

  const signOut = useCallback(async () => { await supabase?.auth.signOut(); }, [supabase]);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, enabled: !!supabase, signUpEmail, signInEmail, signInGoogle, signInApple, resetPassword, signOut, oauthError, clearOauthError: () => setOauthError("") }),
    [user, ready, supabase, signUpEmail, signInEmail, signInGoogle, signInApple, resetPassword, signOut, oauthError]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
