import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Permanently deletes the logged-in user's account and data (LGPD / store
// requirement). Cancels the Stripe subscription, removes DB rows and photos,
// then deletes the auth user. Auth via Supabase access token (Bearer).
export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: userData, error: uErr } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (uErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Cancel the Stripe subscription (best-effort).
  try {
    const stripe = getStripe();
    if (stripe) {
      const { data: sub } = await admin.from("subscriptions").select("stripe_subscription_id").eq("user_id", user.id).maybeSingle();
      if (sub?.stripe_subscription_id) await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    }
  } catch { /* ignore */ }

  // Remove the user's photos from Storage (best-effort).
  try {
    const { data: files } = await admin.storage.from("Avatars").list(user.id);
    if (files?.length) await admin.storage.from("Avatars").remove(files.map((f) => `${user.id}/${f.name}`));
  } catch { /* ignore */ }

  // Remove DB rows.
  try { await admin.from("subscriptions").delete().eq("user_id", user.id); } catch { /* ignore */ }
  try { await admin.from("user_state").delete().eq("user_id", user.id); } catch { /* ignore */ }

  // Engajamento e orçamentos informados são anonimizados, não apagados: sem
  // user_id deixam de ser dado pessoal e a base agregada (calibração regional
  // de preço, ranking de conteúdo) continua de pé. É o que a política diz.
  try { await admin.from("content_events").update({ user_id: null }).eq("user_id", user.id); } catch { /* ignore */ }
  try { await admin.from("price_reports").update({ user_id: null }).eq("user_id", user.id); } catch { /* ignore */ }

  // Finally, delete the auth user.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
