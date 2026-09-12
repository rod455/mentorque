// O transporte do push: FCM para Android, APNs direto para iPhone.
//
// Extraído da rota /api/push/enviar em 12/09/2026 para a jornada de
// recorrência (lib/jornada, app/api/cron/jornada) mandar push pelo mesmo
// caminho, sem copiar o código. A rota continua sendo a porta manual (curl do
// dono, nó do n8n); a jornada é o único chamador automático, e ela só existe
// porque o dono aprovou a jornada em 12/09.
//
// DOIS TRANSPORTES, um por plataforma, e o motivo é de risco e não de gosto:
//
//   Android → FCM HTTP v1 (Firebase). Já estava pronto do lado do app: o
//             google-services.json basta.
//   iPhone  → APNs DIRETO, com a chave .p8 da Apple. A alternativa (FCM
//             também no iPhone) exigiria embutir o SDK do Firebase no app e
//             costurar o projeto Xcode à mão, cirurgia que não dá para
//             compilar e conferir fora de um Mac. Falando direto com a Apple,
//             o app não muda NADA no iPhone: o token que o plugin entrega
//             (o da própria Apple) é o que o APNs espera.
//
// Credenciais, todas em env na Vercel, nenhuma no repositório:
//   FCM_CONTA_SERVICO  o JSON da conta de serviço do Firebase (Android)
//   APNS_CHAVE_P8      o conteúdo do arquivo .p8 da Apple (iPhone)
//   APNS_KEY_ID        o Key ID da chave (tela Keys do portal da Apple)
//   APNS_TEAM_ID       o Team ID da conta (Membership)
// Sem a credencial de uma plataforma, os aparelhos dela são pulados e a
// resposta diz quantos ficaram sem transporte: dá para ligar uma perna de
// cada vez.
//
// Token que a plataforma devolver como morto (aparelho que desinstalou) é
// apagado na hora: insistir só suja a lista.

import { createSign, sign as assinar } from "node:crypto";
import { connect as http2Connect } from "node:http2";
import type { SupabaseClient } from "@supabase/supabase-js";

/** As rotas que o toque no aviso pode abrir. A lista é do APP (lib/app/rotaPendente.ts). */
export const ROTAS_DO_TOQUE = ["quiz", "trilha"] as const;
export type RotaDoToque = (typeof ROTAS_DO_TOQUE)[number];

// ---- FCM (Android) ---------------------------------------------------------

type ContaServico = { client_email: string; private_key: string; project_id: string };

function contaServico(): ContaServico | null {
  const cru = process.env.FCM_CONTA_SERVICO;
  if (!cru) return null;
  try {
    const j = JSON.parse(cru) as ContaServico;
    return j.client_email && j.private_key && j.project_id ? j : null;
  } catch {
    return null;
  }
}

// OAuth2 de conta de serviço sem SDK: assina um JWT RS256 e troca no endpoint
// de token do Google. É o fluxo documentado, e uma dependência a menos.
async function tokenDeAcessoFcm(conta: ContaServico): Promise<string | null> {
  const agora = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const semAssinar = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: conta.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: agora,
    exp: agora + 3600,
  })}`;
  const assinatura = createSign("RSA-SHA256").update(semAssinar).sign(conta.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${semAssinar}.${assinatura}`,
    }),
  });
  if (!res.ok) return null;
  const dado = (await res.json().catch(() => ({}))) as { access_token?: string };
  return dado.access_token ?? null;
}

async function enviarFcm(acesso: string, projeto: string, token: string, titulo: string, corpo: string, rota: string): Promise<"ok" | "morto" | "erro"> {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projeto}/messages:send`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${acesso}` },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: titulo, body: corpo },
        // O `data` é o que o app lê no TOQUE, para abrir na tela certa em vez
        // da inicial. Só entra quando há destino: mensagem sem rota é uma
        // abertura normal do app, e mandar `data` vazio só confunde. Valores
        // do FCM são sempre texto.
        ...(rota ? { data: { rota } } : null),
      },
    }),
  });
  if (res.ok) return "ok";
  return res.status === 404 || res.status === 400 ? "morto" : "erro";
}

// ---- APNs (iPhone) ---------------------------------------------------------

const APNS_TOPICO = "mentorque.app"; // o bundle id do app
const APNS_HOST = "https://api.push.apple.com"; // builds de loja e TestFlight

function chaveApns(): { p8: string; keyId: string; teamId: string } | null {
  const p8 = process.env.APNS_CHAVE_P8;
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  return p8 && keyId && teamId ? { p8, keyId, teamId } : null;
}

// JWT ES256 da Apple. O `dsaEncoding: ieee-p1363` não é detalhe: a assinatura
// EC do Node sai em DER por padrão, e JWT exige o formato cru (r||s); sem
// isso o APNs responde InvalidProviderToken e a mensagem não sai nunca.
function tokenApns(c: { p8: string; keyId: string; teamId: string }): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const semAssinar = `${b64({ alg: "ES256", kid: c.keyId })}.${b64({ iss: c.teamId, iat: Math.floor(Date.now() / 1000) })}`;
  const assinatura = assinar("sha256", Buffer.from(semAssinar), { key: c.p8, dsaEncoding: "ieee-p1363" }).toString("base64url");
  return `${semAssinar}.${assinatura}`;
}

// O APNs só fala HTTP/2, que o fetch do Node não fala. Uma conexão por
// chamada da rota, reaproveitada entre os aparelhos do mesmo envio.
function enviarApns(sessao: import("node:http2").ClientHttp2Session, jwt: string, token: string, titulo: string, corpo: string, rota: string): Promise<"ok" | "morto" | "erro"> {
  return new Promise((resolve) => {
    const req = sessao.request({
      ":method": "POST",
      ":path": `/3/device/${token}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": APNS_TOPICO,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    });
    let status = 0;
    req.on("response", (h) => { status = Number(h[":status"] ?? 0); });
    req.on("close", () => {
      if (status === 200) resolve("ok");
      // 410 = desinstalou; 400 com BadDeviceToken também é aparelho perdido.
      else if (status === 410 || status === 400) resolve("morto");
      else resolve("erro");
    });
    req.on("error", () => resolve("erro"));
    req.setTimeout(10000, () => { req.close(); resolve("erro"); });
    // No APNs a carga do app fica ao LADO do `aps`, no primeiro nível, e não
    // dentro dele: o plugin entrega o payload inteiro como `data`.
    req.end(JSON.stringify({ aps: { alert: { title: titulo, body: corpo } }, ...(rota ? { rota } : null) }));
  });
}

// ---- o envio ----------------------------------------------------------------

export type Alvo = { userId: string } | { todos: true };
export type ResultadoDoPush = { enviados: number; mortos: number; semTransporte: number; aparelhos: number };

/** Há credencial de alguma plataforma? Serve para o ensaio dizer "push desligado". */
export function pushConfigurado(): { android: boolean; ios: boolean } {
  return { android: contaServico() !== null, ios: chaveApns() !== null };
}

/**
 * Manda a mesma mensagem para todos os aparelhos do alvo. Devolve quantos
 * receberam, quantos tokens mortos foram limpos e quantos ficaram sem
 * transporte (credencial da plataforma ausente).
 */
export async function enviarPush(
  admin: SupabaseClient,
  alvo: Alvo,
  msg: { titulo: string; corpo: string; rota?: RotaDoToque | "" },
): Promise<ResultadoDoPush> {
  const rota = msg.rota && (ROTAS_DO_TOQUE as readonly string[]).includes(msg.rota) ? msg.rota : "";
  let consulta = admin.from("push_tokens").select("token, platform");
  if ("userId" in alvo) consulta = consulta.eq("user_id", alvo.userId);
  const { data: linhas, error } = await consulta;
  if (error) throw new Error("erro_ao_ler_tokens");
  if (!linhas?.length) return { enviados: 0, mortos: 0, semTransporte: 0, aparelhos: 0 };

  const conta = contaServico();
  const apns = chaveApns();
  const acessoFcm = conta && linhas.some((l) => l.platform === "android") ? await tokenDeAcessoFcm(conta) : null;
  const jwtApns = apns && linhas.some((l) => l.platform === "ios") ? tokenApns(apns) : null;
  const sessaoApns = jwtApns ? http2Connect(APNS_HOST) : null;

  let enviados = 0;
  let semTransporte = 0;
  const mortos: string[] = [];
  try {
    for (const { token, platform } of linhas) {
      let resultado: "ok" | "morto" | "erro" | "sem" = "sem";
      if (platform === "android" && conta && acessoFcm) resultado = await enviarFcm(acessoFcm, conta.project_id, token, msg.titulo, msg.corpo, rota);
      else if (platform === "ios" && sessaoApns && jwtApns) resultado = await enviarApns(sessaoApns, jwtApns, token, msg.titulo, msg.corpo, rota);
      if (resultado === "ok") enviados++;
      else if (resultado === "morto") mortos.push(token);
      else if (resultado === "sem") semTransporte++;
      // "erro" (429/5xx): fica para uma próxima tentativa, sem apagar ninguém.
    }
  } finally {
    sessaoApns?.close();
  }
  if (mortos.length) await admin.from("push_tokens").delete().in("token", mortos);

  return { enviados, mortos: mortos.length, semTransporte, aparelhos: linhas.length };
}
