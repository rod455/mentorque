import { NextResponse } from "next/server";
import { createSign } from "node:crypto";
import { chaveDadosOk, negada } from "@/lib/chaveDados";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Envia um push de verdade, para uso INTERNO (curl do dono ou nó do n8n).
//
// Trancada pela DADOS_CHAVE como todo agregado da operação: mandar mensagem
// para o celular dos clientes é exatamente o tipo de porta que não fica
// aberta por esquecimento. E mensagem a cliente é alçada do dono, então esta
// rota não tem nenhum chamador automático: ela só faz o que alguém com a
// chave pedir, um pedido por vez.
//
// O transporte é o FCM HTTP v1 (o Firebase entrega no Android direto e no
// iPhone via APNs). A credencial é a conta de serviço do Firebase, no env
// FCM_CONTA_SERVICO (o JSON inteiro, colado na Vercel). Sem o env a rota
// responde 503 e nada acontece: dá para embarcar o código antes das chaves.
//
// Corpo do POST:
//   { "titulo": "...", "corpo": "...", "userId": "uuid" }   um usuário
//   { "titulo": "...", "corpo": "...", "todos": true }      todo mundo
//
// Token que o FCM devolver como morto (UNREGISTERED / 404) é apagado na hora:
// aparelho que desinstalou não volta, e insistir só suja a lista.

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
async function tokenDeAcesso(conta: ContaServico): Promise<string | null> {
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

export async function POST(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const admin = getSupabaseAdmin();
  const conta = contaServico();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  if (!conta) return NextResponse.json({ error: "fcm_nao_configurado" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const corpo = typeof body?.corpo === "string" ? body.corpo.trim() : "";
  if (!titulo || !corpo) return NextResponse.json({ error: "titulo_e_corpo_obrigatorios" }, { status: 400 });

  let consulta = admin.from("push_tokens").select("token");
  if (typeof body?.userId === "string" && body.userId) consulta = consulta.eq("user_id", body.userId);
  else if (body?.todos !== true) return NextResponse.json({ error: "diga_userId_ou_todos" }, { status: 400 });
  const { data: linhas, error } = await consulta;
  if (error) return NextResponse.json({ error: "erro_ao_ler_tokens" }, { status: 500 });
  if (!linhas?.length) return NextResponse.json({ ok: true, enviados: 0, mortos: 0 });

  const acesso = await tokenDeAcesso(conta);
  if (!acesso) return NextResponse.json({ error: "fcm_token_falhou" }, { status: 502 });

  let enviados = 0;
  const mortos: string[] = [];
  for (const { token } of linhas) {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${conta.project_id}/messages:send`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${acesso}` },
      body: JSON.stringify({ message: { token, notification: { title: titulo, body: corpo } } }),
    });
    if (res.ok) enviados++;
    else if (res.status === 404 || res.status === 400) mortos.push(token);
    // 429/5xx: fica para uma próxima tentativa, sem apagar ninguém.
  }
  if (mortos.length) await admin.from("push_tokens").delete().in("token", mortos);

  return NextResponse.json({ ok: true, enviados, mortos: mortos.length });
}
