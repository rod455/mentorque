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
import { anonId, ehIdentidade } from "./anon";
import { relatarPush } from "./erros";
import { anotaRota } from "./rotaPendente";
import { isNativeApp, nativePlatform } from "./wrapper";

type Permissao = "prompt" | "prompt-with-rationale" | "granted" | "denied";
type PluginPush = {
  checkPermissions: () => Promise<{ receive: Permissao }>;
  register: () => Promise<void>;
  addListener: {
    (ev: "registration", cb: (dado: { value?: string; error?: string }) => void): Promise<{ remove: () => Promise<void> }>;
    (ev: "registrationError", cb: (dado: { error?: string }) => void): Promise<{ remove: () => Promise<void> }>;
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

// O último registro entregue ao servidor, para não repetir o POST a cada
// abertura. Guarda "dono|token", e o DONO faz parte da marca de propósito.
//
// Antes aqui morava só o token, e isso escondia um defeito que só aparecia
// depois (15/09/2026): quem usava o app sem conta registrava o aparelho,
// criava conta mais tarde, e o token continuava o MESMO. A comparação por
// token dizia "já entreguei" e a linha do banco ficava anônima para sempre,
// com a pessoa logada recebendo a jornada de quem não tem conta. Com o dono
// na marca, o login muda a marca e força uma reentrega.
//
// Marca em formato antigo (só o token, sem "|") também força uma reentrega,
// que é o que faz quem já tinha o app registrar o anon_id sem fazer nada.
const MARCA = "mq-push-token";

function leMarca(): { dono: string; token: string } | null {
  try {
    const v = window.localStorage.getItem(MARCA);
    if (!v) return null;
    const i = v.indexOf("|");
    return i > 0 ? { dono: v.slice(0, i), token: v.slice(i + 1) } : null;
  } catch {
    return null;
  }
}

/** O token guardado, em qualquer um dos dois formatos. Só para o "esqueça". */
function tokenGuardado(): string | null {
  try {
    const v = window.localStorage.getItem(MARCA);
    if (!v) return null;
    const i = v.indexOf("|");
    return i > 0 ? v.slice(i + 1) : v;
  } catch {
    return null;
  }
}

// O silêncio deste caminho tem que ser contado (12/09/2026, iPhone do dono:
// avisos ligados, token nenhum no banco, e de fora não dava para saber por
// quê). Cada saída sem registro relata o motivo em app_erros, sem dado da
// pessoa. Ver relatarPush em lib/app/erros.ts.
//
// O DONO do registro (15/09/2026, decisão do dono): a conta quando há sessão,
// senão o próprio aparelho. Até esta data, sem sessão não se registrava nada,
// e como no Android ninguém tem conta o push não alcançava uma única pessoa.
async function entregar(token: string, remover: boolean): Promise<void> {
  const supabase = getBrowserSupabase();
  const sessao = supabase ? (await supabase.auth.getSession()).data.session : null;
  const bearer = sessao?.access_token;
  const anon = anonId();
  const temIdentidade = ehIdentidade(anon);
  const dono = sessao?.user?.id ?? (temIdentidade ? anon : null);

  if (!dono) {
    // Aparelho sem armazenamento e sem conta: o id dele morre quando o app
    // fecha, então a linha no banco nasceria órfã. Ver lib/app/anon.ts.
    if (!remover) relatarPush("aparelho sem identidade e sem conta: não há para quem mandar");
    return;
  }

  const marca = leMarca();
  if (!remover && marca && marca.token === token && marca.dono === dono) return;

  try {
    const res = await fetch(apiUrl("/api/push/registrar"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
      },
      body: JSON.stringify({ token, platform: nativePlatform(), remover, anonId: temIdentidade ? anon : undefined }),
    });
    if (res.ok) {
      try {
        if (remover) window.localStorage.removeItem(MARCA);
        else window.localStorage.setItem(MARCA, `${dono}|${token}`);
      } catch { /* modo privado */ }
    } else {
      relatarPush(`/api/push/registrar devolveu ${res.status}`);
    }
  } catch {
    // offline: a próxima abertura tenta de novo
    relatarPush("sem rede ao registrar o token");
  }
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

  if (!querAvisos) {
    const guardado = tokenGuardado();
    if (guardado) await entregar(guardado, true);
    return;
  }

  try {
    const permissao = (await c.plugin.checkPermissions()).receive;
    if (permissao !== "granted") {
      relatarPush(`interruptor ligado, mas a permissão do sistema está "${permissao}"`);
      return;
    }
    // Quem decide se já entregou é o `entregar`, porque a comparação depende
    // do DONO e descobrir o dono é assíncrono (a sessão). Aqui só chega o
    // token cru; lá ele para cedo quando a marca bate.
    const ouvinte = await c.plugin.addListener("registration", (dado) => {
      const token = dado.value ?? "";
      if (token) void entregar(token, false);
      void ouvinte.remove();
    });
    // A Apple (ou o Google) recusou o registro: sem isto o único lugar onde o
    // motivo existia era o console do Xcode. Lido no fonte do plugin
    // (PushNotificationsPlugin.swift, didFailToRegisterForRemoteNotificationsWithError).
    const falha = await c.plugin.addListener("registrationError", (dado) => {
      relatarPush(`o sistema recusou o registro: ${dado.error ?? "sem motivo"}`);
      void falha.remove();
    });
    await c.plugin.register();
  } catch (e) {
    // console ainda não configurado: fica para quando estiver
    relatarPush(`register() lançou: ${e instanceof Error ? e.message : String(e)}`);
  }
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
