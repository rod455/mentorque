"use client";

// Push de VERDADE (servidor manda para o celular), construído desligado.
//
// Decisão do dono em 28/08: ter a infraestrutura pronta mesmo sem uso voltado
// ao usuário ainda, para campanhas internas e reengajamento quando fizer
// sentido. Os lembretes do dia a dia (quiz às 9h, fim do teste) continuam
// LOCAIS, em lib/app/notificacoes.ts: não dependem de servidor e funcionam
// offline. O push existe para o que o local não faz: mensagem decidida do
// lado de cá depois do app fechado.
//
// O que este arquivo faz: quando a pessoa está logada E ligou os avisos no
// Perfil (a MESMA permissão do sistema cobre local e push), registra o
// aparelho e manda o token para /api/push/registrar. Quando desliga, avisa a
// rota para esquecer o token. Nada aqui pede permissão: quem pede é o
// interruptor do Perfil, como sempre.
//
// TUDO degrada em silêncio enquanto o console não está configurado, e isso é
// de propósito para poder embarcar antes das chaves:
//   Android sem google-services.json  → o registro falha, cai no catch;
//   iPhone sem a permissão de push no App ID e no App.entitlements → idem;
//   servidor sem FCM_CONTA_SERVICO    → só afeta o ENVIO, não o registro.
// Os passos de console do dono estão em docs/push.md.
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { apiUrl } from "@/lib/app/apiBase";
import { anotaRota } from "./rotaPendente";
import { isNativeApp, nativePlatform } from "./wrapper";

type Permissao = "prompt" | "prompt-with-rationale" | "granted" | "denied";
type PluginPush = {
  checkPermissions: () => Promise<{ receive: Permissao }>;
  register: () => Promise<void>;
  addListener: {
    (ev: "registration", cb: (dado: { value?: string; error?: string }) => void): Promise<{ remove: () => Promise<void> }>;
    (
      ev: "pushNotificationActionPerformed",
      cb: (dado: { notification?: { data?: Record<string, unknown> | null } }) => void
    ): Promise<{ remove: () => Promise<void> }>;
  };
};

// A caixa é obrigatória, não estilo: o plugin cru do Capacitor responde a
// qualquer propriedade, inclusive `then`, e devolvê-lo de função async trava a
// espera para sempre. Foi o defeito que deixou os lembretes mudos até a 1.2
// (ver lib/app/notificacoes.ts e o diário de 28/08).
type Caixa = { plugin: PluginPush };

let caixa: Caixa | null = null;
let carregando: Promise<Caixa | null> | null = null;

async function carregar(): Promise<Caixa | null> {
  if (caixa) return caixa;
  if (!isNativeApp() || !nativePlatform()) return null;
  if (!carregando) {
    carregando = (async () => {
      try {
        const mod = await import("@capacitor/push-notifications");
        caixa = { plugin: mod.PushNotifications as unknown as PluginPush };
        return caixa;
      } catch {
        return null;
      } finally {
        carregando = null;
      }
    })();
  }
  return carregando;
}

// O último token entregue ao servidor, para não repetir o POST a cada
// abertura. Token novo (o FCM troca quando quer) passa porque difere.
const MARCA = "mq-push-token";

async function entregar(token: string, remover: boolean): Promise<void> {
  const supabase = getBrowserSupabase();
  const sessao = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  if (!sessao) return;
  try {
    const res = await fetch(apiUrl("/api/push/registrar"), {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${sessao}` },
      body: JSON.stringify({ token, platform: nativePlatform(), remover }),
    });
    if (res.ok) {
      try {
        if (remover) window.localStorage.removeItem(MARCA);
        else window.localStorage.setItem(MARCA, token);
      } catch { /* modo privado */ }
    }
  } catch { /* offline: a próxima abertura tenta de novo */ }
}

/**
 * Mantém o registro de push em dia com o interruptor de avisos.
 *
 * Chamada a cada abertura e a cada mudança do interruptor (useLembretes).
 * Só registra quando a permissão JÁ está concedida: pedir permissão é papel
 * do toque no Perfil, nunca de um efeito de fundo.
 */
export async function sincronizarPush(querAvisos: boolean): Promise<void> {
  const c = await carregar();
  if (!c) return;

  let anterior: string | null = null;
  try { anterior = window.localStorage.getItem(MARCA); } catch { /* segue */ }

  if (!querAvisos) {
    if (anterior) await entregar(anterior, true);
    return;
  }

  try {
    if ((await c.plugin.checkPermissions()).receive !== "granted") return;
    const ouvinte = await c.plugin.addListener("registration", (dado) => {
      const token = dado.value ?? "";
      if (token && token !== anterior) void entregar(token, false);
      void ouvinte.remove();
    });
    await c.plugin.register();
  } catch { /* console ainda não configurado: fica para quando estiver */ }
}

/** O ouvinte de toque já está de pé nesta sessão? */
let jaOuvindo = false;

/**
 * Ouve o TOQUE num push e anota para onde ele quer levar.
 *
 * Gêmeo do `ouvirToqueEmAviso` do aviso local, e existe separado porque são
 * dois plugins diferentes com dois eventos diferentes. O destino chega no
 * `data` da mensagem, que o servidor preenche a partir do campo `rota` do POST
 * (app/api/push/enviar/route.ts).
 *
 * Registrado SEMPRE, independente do interruptor de avisos: quem tem um push
 * na bandeja já recebeu a mensagem, e desligar o interruptor depois não deve
 * transformar o toque nela numa abertura sem destino.
 */
export async function ouvirToqueEmPush(): Promise<void> {
  if (jaOuvindo) return;
  const c = await carregar();
  if (!c) return;
  if (jaOuvindo) return;
  jaOuvindo = true;
  try {
    await c.plugin.addListener("pushNotificationActionPerformed", (dado) => {
      anotaRota(dado?.notification?.data?.rota);
    });
  } catch {
    jaOuvindo = false;
  }
}
