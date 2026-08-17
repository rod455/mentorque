import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FROM = process.env.FEEDBACK_FROM ?? process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";
const TO = process.env.FEEDBACK_TO ?? "contato@mentorque.com.br";

type Body = {
  type?: string; message?: string; name?: string; email?: string; userId?: string; locale?: string;
  // Só no tipo `rating`: a nota e o contexto de onde ela veio.
  rating?: number; motivo?: string; versao?: string; plataforma?: string; premium?: boolean;
};

const TYPE_LABEL: Record<string, { pt: string; en: string; emoji: string }> = {
  doubt: { pt: "Dúvida", en: "Question", emoji: "❓" },
  suggestion: { pt: "Sugestão", en: "Suggestion", emoji: "💡" },
  bug: { pt: "Bug", en: "Bug", emoji: "🐛" },
  deletion: { pt: "EXCLUSÃO DE CONTA", en: "ACCOUNT DELETION", emoji: "🗑️" },
  rating: { pt: "Avaliação no app", en: "In-app rating", emoji: "⭐" },
};

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  const message = (body.message ?? "").trim();
  const nota = Number.isFinite(body.rating) ? Math.round(Number(body.rating)) : null;
  const ehNota = body.type === "rating" && nota != null && nota >= 1 && nota <= 5;
  // Sem texto ainda vale quando veio nota: as estrelas já são o recado, e
  // exigir um parágrafo é a forma mais rápida de perder o feedback de quem
  // tocou em duas estrelas e desistiu de escrever.
  if (!message && !ehNota) return NextResponse.json({ ok: false, error: "empty_message" }, { status: 422 });

  const locale = body.locale === "en" ? "en" : "pt";
  const t = TYPE_LABEL[body.type ?? "doubt"] ?? TYPE_LABEL.doubt;
  const typeLabel = `${t.emoji} ${locale === "pt" ? t.pt : t.en}`;
  const name = (body.name ?? "").trim() || (locale === "pt" ? "Convidado" : "Guest");
  const email = (body.email ?? "").trim();
  const userId = (body.userId ?? "").trim() || "—";

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[feedback] RESEND_API_KEY missing — not sent:", { typeLabel, name, email });
    return NextResponse.json({ ok: false, error: "email_not_configured" }, { status: 503 });
  }

  // A nota entra no assunto para a caixa de entrada virar triagem: um "★1"
  // precisa ser respondido hoje, um "★4" pode esperar a segunda-feira.
  const subject = ehNota
    ? `[Mentorque] ${"★".repeat(nota!)}${"☆".repeat(5 - nota!)} ${nota}/5 — ${name}`
    : `[Mentorque] ${typeLabel} — ${name}`;

  const contexto: [string, string][] = ehNota
    ? [
        ["Nota", `${nota}/5`],
        ["Momento", body.motivo ?? "—"],
        ["Plano", body.premium ? "Premium" : "Grátis"],
        ["Plataforma", body.plataforma ?? "—"],
        ["Versão", body.versao ?? "—"],
      ]
    : [];
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
    <div style="background:#f2a623;color:#141414;padding:16px 20px;border-radius:12px 12px 0 0;font-size:18px;font-weight:700">${ehNota ? "⭐ Nova avaliação no app" : "📬 Nova mensagem do app"}</div>
    <div style="background:#faf7f0;padding:20px;border:1px solid #eee;border-top:none">
      <p style="margin:0 0 10px"><b>Tipo:</b> ${esc(typeLabel)}</p>
      <p style="margin:0 0 10px"><b>Nome:</b> ${esc(name)}</p>
      <p style="margin:0 0 10px"><b>E-mail:</b> ${email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : "—"}</p>
      <p style="margin:0 0 14px"><b>User ID:</b> <code>${esc(userId)}</code></p>
      ${contexto.map(([k, v]) => `<p style="margin:0 0 10px"><b>${esc(k)}:</b> ${esc(v)}</p>`).join("")}
      <p style="margin:0 0 6px"><b>Mensagem:</b></p>
      <div style="background:#fff;border:1px solid #e6e2d8;border-radius:8px;padding:12px;white-space:pre-wrap;color:#333">${message ? esc(message) : "<i style=\"color:#8f8a80\">sem texto — só a nota</i>"}</div>
    </div>
    <div style="padding:12px 20px;color:#8f8a80;font-size:12px;background:#f2efe8;border-radius:0 0 12px 12px">
      Enviado pelo app Mentorque${email ? ` • Responda diretamente para <a href="mailto:${esc(email)}">${esc(email)}</a>` : ""}
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: FROM, to: [TO], subject, html, ...(email ? { reply_to: email } : {}) }),
    });
    if (!res.ok) {
      console.error("[feedback] resend error:", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
    // Sucesso também vira registro.
    //
    // Sem esta linha, "a mensagem chegou e o e-mail saiu" e "a requisição morreu
    // no aparelho e nunca chegou aqui" ficam IDÊNTICOS na Vercel: os dois
    // aparecem como silêncio. Foi exatamente essa dúvida que travou o
    // diagnóstico do primeiro teste no TestFlight.
    console.log(`[feedback] enviado: tipo=${body.type ?? "?"} nota=${nota ?? "-"} para=${TO}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[feedback] error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
