import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { waitlistWelcome } from "@/lib/email/waitlist";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM = process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";

// Boas-vindas pelo Resend. Nunca bloqueia o cadastro: se a chave faltar ou o
// envio falhar, registra e segue — o lead já está salvo, e recusar o cadastro
// por causa do e-mail seria trocar um problema pequeno por um grande.
async function sendWelcome(email: string, locale: "pt" | "en") {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[waitlist] RESEND_API_KEY ausente — boas-vindas NÃO enviadas");
    return;
  }
  const { subject, html, text } = waitlistWelcome(locale);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      // `text` junto do `html` não é capricho: mensagem só-HTML pontua pior nos
      // filtros de spam, e é o que o cliente em modo texto mostra.
      body: JSON.stringify({ from: FROM, to: [email], subject, html, text }),
    });
    if (!res.ok) {
      // O corpo do erro diz qual é: 403 costuma ser domínio não verificado no
      // Resend, 401 é chave inválida. Sem ele, sobra só o número.
      console.warn("[waitlist] envio falhou:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.warn("[waitlist] erro de envio:", err);
  }
}

export async function POST(request: Request) {
  let body: { email?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const locale = body.locale === "en" ? "en" : "pt";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.warn(`[waitlist] Supabase not configured — lead NOT persisted: ${email}`);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("waitlist").insert({ email, locale, source: "landing" });

  if (error) {
    // 23505 = unique_violation → already signed up, treat as success (no re-email).
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, persisted: true, duplicate: true });
    }
    console.error("[waitlist] insert error:", error.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  // New lead saved → send the welcome email (best-effort, non-blocking failure).
  await sendWelcome(email, locale);

  return NextResponse.json({ ok: true, persisted: true });
}
