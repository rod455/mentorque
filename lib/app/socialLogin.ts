"use client";

// Login social NATIVO (Apple e Google) no app das lojas.
//
// Por que existe: o caminho antigo mandava o usuário para uma aba do navegador,
// esperava o provedor redirecionar de volta e só então criava a sessão. Esse
// ida-e-volta nunca fechou no iPhone — o GoTrue recusava o esquema próprio na
// validação de Redirect URLs, caía no Site URL e a sessão nascia NO SITE, com o
// app seguindo deslogado. Era o que o usuário via: "faz login e volta para a
// mesma tela".
//
// Aqui não há redirecionamento nenhum. A folha nativa da Apple / do Google
// devolve um `idToken` direto para dentro do app, e o Supabase troca esse token
// por sessão (`signInWithIdToken`). Nada sai do aplicativo.
//
//   folha nativa ──idToken──► supabase.auth.signInWithIdToken ──► sessão
//
// O nonce é obrigatório nos dois provedores: geramos um valor cru, mandamos o
// SHA-256 dele para o provedor (que carimba o hash DENTRO do JWT) e o valor cru
// para o Supabase, que refaz o hash e compara. Sem isso o provedor inventa um
// nonce próprio e o Supabase responde "invalid nonce".

import type { SupabaseClient } from "@supabase/supabase-js";
import { nativePlatform } from "./wrapper";

type Profile = { givenName?: string | null; familyName?: string | null; name?: string | null };
type LoginResult = { result?: { idToken?: string | null; profile?: Profile } };

type Plugin = {
  initialize: (o: Record<string, unknown>) => Promise<void>;
  login: (o: { provider: string; options: Record<string, unknown> }) => Promise<LoginResult>;
  logout: (o: { provider: string }) => Promise<void>;
};

// Client IDs do Google Cloud.
//
// O do iPhone fica escrito aqui de propósito, e não só em variável de ambiente:
// client id do Google não é segredo — ele viaja dentro do binário, no esquema
// reverso do Info.plist, onde qualquer um lê. Deixar fixo elimina o modo de
// falha mais provável: subir um build sem a variável e descobrir no aparelho
// que o botão do Google não faz nada. A variável ainda tem precedência, para
// trocar de projeto no Google Cloud sem mexer no código.
const GOOGLE_IOS_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ||
  "43445984392-mvc7mg1dlljbdq942aort4hhvet5l78h.apps.googleusercontent.com";

// Só serve fora do iPhone (Android). No iOS o plugin ignora — ver abaixo.
const GOOGLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";

// No iPhone quem manda é o iOS Client ID: é ele que o plugin entrega ao SDK do
// Google (GoogleProvider.swift só inicializa se `iOSClientId` existir) e é ele
// que vira a audiência do idToken — ou seja, é esse valor que precisa estar em
// "Authorized Client IDs" no provider Google do Supabase.
export function googleNativeConfigured(): boolean {
  return nativePlatform() === "ios" ? !!GOOGLE_IOS_CLIENT_ID : !!GOOGLE_WEB_CLIENT_ID;
}

// "Entrar com a Apple" FORA do iPhone.
//
// No iPhone o login é nativo (ASAuthorization) e a audiência do idToken é o
// bundle do app — funciona sem mais nada. Em qualquer outro lugar (Safari,
// Chrome, Android) o pedido vai pelo fluxo web da Apple, que exige um
// identificador SEPARADO na conta de desenvolvedor: um Services ID, com o
// domínio verificado e a URL de retorno do Supabase cadastrada. O bundle do
// app não serve.
//
// Sem esse Services ID a Apple recusa na tela DELA, depois que o navegador já
// saiu do nosso domínio. Do nosso lado não sobra nada: o Supabase registra
// "Redirecting to external provider" e nunca recebe retorno, então o app nem
// tem como mostrar um erro útil. O usuário só vê a tela de erro da Apple e
// conclui que o Mentorque está quebrado.
//
// Enquanto o Services ID não existir, o botão não aparece fora do iPhone.
// Botão que some é ruim; botão que leva a um beco sem saída é pior.
// Para religar depois de configurar: NEXT_PUBLIC_APPLE_WEB=1.
const APPLE_WEB_CONFIGURADO = (process.env.NEXT_PUBLIC_APPLE_WEB ?? "").trim() === "1";

export function appleLoginDisponivel(): boolean {
  return nativePlatform() === "ios" || APPLE_WEB_CONFIGURADO;
}

// O plugin só faz sentido dentro do wrapper. Carregado sob demanda para não
// entrar no pacote do site.
let cached: Promise<Plugin> | null = null;
function loadPlugin(): Promise<Plugin> {
  if (!cached) {
    cached = import("@capgo/capacitor-social-login").then(async (mod) => {
      const plugin = mod.SocialLogin as unknown as Plugin;
      const ios = nativePlatform() === "ios";
      const google: Record<string, string> = {};
      if (GOOGLE_WEB_CLIENT_ID) google.webClientId = GOOGLE_WEB_CLIENT_ID;
      if (ios && GOOGLE_IOS_CLIENT_ID) google.iOSClientId = GOOGLE_IOS_CLIENT_ID;
      await plugin.initialize({
        ...(Object.keys(google).length ? { google } : {}),
        // No iOS a Apple é nativa (ASAuthorization) e não precisa de nada aqui.
        ...(ios ? { apple: {} } : {}),
      });
      return plugin;
    });
    // Um erro na inicialização não pode envenenar as tentativas seguintes.
    cached.catch(() => { cached = null; });
  }
  return cached;
}

function hex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateRawNonce(): string {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return hex(a);
}

// SHA-256 em JavaScript puro.
//
// `crypto.subtle` só existe em contexto seguro. A WebView do app serve de
// `capacitor://localhost` e o WebKit trata localhost como seguro — mas se por
// qualquer motivo não tratar, o login inteiro morreria num `undefined` sem
// explicação. Como o nonce é o coração do fluxo, tem plano B.
// Constantes do FIPS 180-4 (parte fracionária da raiz cúbica dos 64 primeiros
// primos). Escritas à mão de propósito: calcular com Math.cbrt perde precisão
// em alguns termos e o hash sai errado.
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256Fallback(msg: string): string {
  const bytes = Array.from(new TextEncoder().encode(msg));
  const bits = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Comprimento em 64 bits big-endian (os 32 altos são sempre 0 aqui).
  bytes.push(0, 0, 0, 0, (bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);

  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const rot = (x: number, n: number) => ((x >>> n) | (x << (32 - n))) >>> 0;
  const w = new Array<number>(64);

  for (let i = 0; i < bytes.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = ((bytes[i + t * 4] << 24) | (bytes[i + t * 4 + 1] << 16) | (bytes[i + t * 4 + 2] << 8) | bytes[i + t * 4 + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rot(w[t - 15], 7) ^ rot(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rot(w[t - 2], 17) ^ rot(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let t = 0; t < 64; t++) {
      const S1 = rot(e, 6) ^ rot(e, 11) ^ rot(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = rot(a, 2) ^ rot(a, 13) ^ rot(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    const next = [a, b, c, d, e, f, g, hh];
    for (let t = 0; t < 8; t++) h[t] = (h[t] + next[t]) >>> 0;
  }
  return h.map((x) => x.toString(16).padStart(8, "0")).join("");
}

async function sha256Hex(msg: string): Promise<string> {
  try {
    if (crypto?.subtle?.digest) return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg)));
  } catch { /* cai no plano B */ }
  return sha256Fallback(msg);
}

// A Apple só manda nome e sobrenome na PRIMEIRA autorização — depois disso o
// token vem só com o e-mail. Se deixarmos passar, a conta fica para sempre sem
// nome. Então gravamos assim que aparece.
async function saveName(supabase: SupabaseClient, profile: Profile | undefined) {
  const full = profile?.name || [profile?.givenName, profile?.familyName].filter(Boolean).join(" ").trim();
  if (!full) return;
  const { data } = await supabase.auth.getUser();
  if (data.user?.user_metadata?.name) return;
  await supabase.auth.updateUser({ data: { name: full } });
}

export type NativeLoginResult = { error?: string; canceled?: boolean };

// Faz o login nativo. Sem `error` e sem `canceled` = sessão criada.
export async function nativeSocialLogin(
  supabase: SupabaseClient,
  provider: "google" | "apple"
): Promise<NativeLoginResult> {
  if (provider === "google" && !googleNativeConfigured()) return { error: "google_sem_client_id" };

  let plugin: Plugin;
  try {
    plugin = await loadPlugin();
  } catch (e) {
    console.warn("[auth] social-login initialize falhou:", e);
    return { error: "login_nativo_indisponivel" };
  }

  // O plugin do Google reaproveita a sessão anterior do aparelho e devolveria um
  // token antigo, emitido SEM o nosso nonce — que o Supabase rejeita. Sair antes
  // força um token novo. É silencioso: não desloga o usuário do app.
  if (provider === "google") {
    try { await plugin.logout({ provider: "google" }); } catch { /* nunca logou */ }
  }

  const rawNonce = generateRawNonce();
  const hashedNonce = await sha256Hex(rawNonce);

  let res: LoginResult;
  try {
    res = await plugin.login({
      provider,
      options:
        provider === "apple"
          ? { scopes: ["email", "name"], nonce: hashedNonce }
          : { scopes: ["profile", "email"], nonce: hashedNonce },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Fechar a folha é uma escolha do usuário, não um defeito: nada de erro
    // vermelho na tela por causa disso.
    if (/cancel|1001|user.?closed|dismiss/i.test(msg)) return { canceled: true };
    console.warn("[auth] social-login login falhou:", msg);
    return { error: msg || "login_falhou" };
  }

  const idToken = res?.result?.idToken;
  if (!idToken) return { error: "provedor_sem_id_token" };

  const { error } = await supabase.auth.signInWithIdToken({ provider, token: idToken, nonce: rawNonce });
  if (error) {
    console.warn("[auth] signInWithIdToken:", error.message);
    return { error: error.message };
  }

  try { await saveName(supabase, res.result?.profile); } catch { /* nome é um extra */ }
  return {};
}
