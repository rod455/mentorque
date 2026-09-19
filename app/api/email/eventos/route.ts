import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const maxDuration = 10;

// O que acontece com o e-mail DEPOIS de sair (webhook do Resend).
//
// POR QUE ISTO EXISTE (19/09/2026). A jornada manda até 6 e-mails por pessoa em
// 30 dias, e a gente sabia uma coisa só sobre eles: que saíram. Entregue,
// aberto, clicado, devolvido, marcado como spam, nada disso chegava aqui. Uma
// máquina de retenção que ninguém mede pode estar batendo em caixa de spam há
// uma semana sem ninguém perceber, e o sintoma (silêncio) é idêntico ao de
// "mandamos e ninguém quis".
//
// COMO CHEGA. O Resend faz POST aqui a cada evento e assina com o padrão Svix:
// três cabeçalhos (`svix-id`, `svix-timestamp`, `svix-signature`) e um HMAC
// SHA256 sobre `id.timestamp.corpo`, com o segredo do próprio webhook.
//
// FALHA FECHADA, de propósito: sem `RESEND_WEBHOOK_SECRET` configurado, a rota
// recusa tudo. Endpoint público que grava no banco sem conferir assinatura é
// convite para qualquer um encher a tabela de "aberto", e métrica envenenada é
// pior do que métrica ausente: a ausente faz perguntar.
const TIPOS = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.opened",
  "email.clicked",
  "email.bounced",
  "email.complained",
  "email.failed",
]);

/** A janela de tolerância do relógio. Evento velho demais é repetição. */
const MINUTOS_DE_TOLERANCIA = 5;

function assinaturaConfere(segredo: string, id: string, ts: string, corpo: string, assinaturas: string): boolean {
  // O segredo vem como `whsec_<base64>`; o que entra no HMAC são os bytes.
  const bruto = segredo.startsWith("whsec_") ? segredo.slice(6) : segredo;
  const chave = Buffer.from(bruto, "base64");
  const esperada = createHmac("sha256", chave).update(`${id}.${ts}.${corpo}`).digest("base64");
  // O cabeçalho traz uma ou mais assinaturas, cada uma como `v1,<base64>`,
  // porque o segredo pode estar em rotação.
  for (const parte of assinaturas.split(" ")) {
    const valor = parte.split(",")[1];
    if (!valor) continue;
    const a = Buffer.from(valor);
    const b = Buffer.from(esperada);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export async function POST(req: Request) {
  const segredo = process.env.RESEND_WEBHOOK_SECRET;
  if (!segredo) return NextResponse.json({ error: "webhook_sem_segredo" }, { status: 501 });

  const id = req.headers.get("svix-id") ?? "";
  const ts = req.headers.get("svix-timestamp") ?? "";
  const assinaturas = req.headers.get("svix-signature") ?? "";
  if (!id || !ts || !assinaturas) return NextResponse.json({ error: "sem_assinatura" }, { status: 401 });

  const segundos = Number(ts);
  if (!Number.isFinite(segundos) || Math.abs(Date.now() / 1000 - segundos) > MINUTOS_DE_TOLERANCIA * 60) {
    return NextResponse.json({ error: "assinatura_velha" }, { status: 401 });
  }

  // O corpo é lido como TEXTO porque é sobre ele, byte a byte, que a assinatura
  // foi calculada. Reserializar o JSON mudaria espaços e a conta não fecharia.
  const corpo = await req.text();
  if (!assinaturaConfere(segredo, id, ts, corpo, assinaturas)) {
    return NextResponse.json({ error: "assinatura_invalida" }, { status: 401 });
  }

  let evento: Record<string, unknown> | undefined;
  try { evento = JSON.parse(corpo) as Record<string, unknown>; } catch { /* abaixo */ }
  const tipo = typeof evento?.type === "string" ? evento.type : "";
  if (!TIPOS.has(tipo)) return NextResponse.json({ ok: true, ignorado: tipo }, { status: 200 });

  const dados = (evento?.data ?? {}) as Record<string, unknown>;
  const idExterno = typeof dados.email_id === "string" ? dados.email_id : typeof dados.id === "string" ? dados.id : "";
  if (!idExterno) return NextResponse.json({ error: "sem_id" }, { status: 400 });

  // A etiqueta que o envio pendurou (a chave do e-mail da jornada: d2,
  // vencida-oil, mes). É ela que permite dizer QUAL e-mail ninguém abre, em vez
  // de só "os e-mails vão mal".
  const etiquetas = Array.isArray(dados.tags) ? (dados.tags as Record<string, unknown>[]) : [];
  const chave = etiquetas.find((t) => t?.name === "chave")?.value;

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  // NADA de endereço de e-mail nem de conteúdo: para medir engajamento basta o
  // id do envio, o tipo e a etiqueta. O que não se guarda não vaza.
  await admin.from("email_eventos").upsert(
    {
      id_externo: idExterno,
      tipo: tipo.replace("email.", ""),
      chave: typeof chave === "string" ? chave.slice(0, 80) : null,
      criado_em: typeof evento?.created_at === "string" ? evento.created_at : new Date().toISOString(),
    },
    { onConflict: "id_externo,tipo", ignoreDuplicates: true },
  );

  return NextResponse.json({ ok: true });
}
