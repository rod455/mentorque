import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // No backend configured yet: accept the lead so the UX flow works in dev/preview,
  // but make it explicit that nothing was persisted.
  // TODO: set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (or swap to
  // Formspree / your own API) and run supabase/migrations/0001_waitlist.sql.
  if (!supabase) {
    console.warn(`[waitlist] Supabase not configured — lead NOT persisted: ${email}`);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase
    .from("waitlist")
    .insert({ email, locale, source: "landing" });

  if (error) {
    // 23505 = unique_violation → already signed up, treat as success.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, persisted: true, duplicate: true });
    }
    console.error("[waitlist] insert error:", error.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
