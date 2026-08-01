import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM = process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";

// Best-effort welcome email via Resend. Never blocks the signup: if the key is
// missing or the send fails, we just log and move on.
async function sendWelcome(email: string, locale: "pt" | "en") {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const pt = locale === "pt";
  const subject = pt ? "Você entrou na lista do Mentorque 🚗" : "You're on the Mentorque waitlist 🚗";
  const html = pt
    ? `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#141414;color:#f4efe6;padding:32px;border-radius:16px;max-width:520px;margin:auto">
        <h1 style="margin:0 0 12px;font-size:22px">Bem-vindo à garagem! 🐻</h1>
        <p style="margin:0 0 12px;line-height:1.6;color:#cfc9bd">Você foi adicionado à nossa <b>lista de espera</b>. Ficamos muito felizes em ter você por aqui!</p>
        <p style="margin:0 0 12px;line-height:1.6;color:#cfc9bd">O Mentorque te ajuda a entender seu carro, descobrir o preço justo antes da oficina e falar com um especialista de verdade. Assim que abrirmos o acesso, você será avisado em primeira mão — com as vantagens de quem chegou cedo.</p>
        <p style="margin:16px 0 0;line-height:1.6;color:#8f8a80">Até já,<br/>Equipe Mentorque</p>
      </div>`
    : `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#141414;color:#f4efe6;padding:32px;border-radius:16px;max-width:520px;margin:auto">
        <h1 style="margin:0 0 12px;font-size:22px">Welcome to the garage! 🐻</h1>
        <p style="margin:0 0 12px;line-height:1.6;color:#cfc9bd">You've been added to our <b>waitlist</b>. We're thrilled to have you!</p>
        <p style="margin:0 0 12px;line-height:1.6;color:#cfc9bd">Mentorque helps you understand your car, find the fair price before the shop and talk to a real expert. The moment we open access, you'll be the first to know — with early-bird perks.</p>
        <p style="margin:16px 0 0;line-height:1.6;color:#8f8a80">See you soon,<br/>The Mentorque team</p>
      </div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: FROM, to: [email], subject, html }),
    });
    if (!res.ok) console.warn("[waitlist] email send failed:", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.warn("[waitlist] email error:", err);
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
