import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Registra (ou esquece) o token de push do aparelho de quem está logado.
//
// Autenticada pelo Bearer do Supabase, como o checkout: o token de push é do
// APARELHO, mas a linha gravada amarra ele à CONTA, e é a conta que autoriza.
// Sem sessão não há o que registrar, porque não haveria para quem mandar.
//
// `remover: true` apaga a linha (a pessoa desligou os avisos no Perfil). O
// filtro por user_id na remoção não é enfeite: impede uma conta de apagar o
// token registrado por outra.
export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!bearer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: userData, error: uErr } = await admin.auth.getUser(bearer);
  const user = userData?.user;
  if (uErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const platform = body?.platform === "ios" || body?.platform === "android" ? body.platform : null;
  if (!token || token.length > 4096) return NextResponse.json({ error: "token_invalido" }, { status: 400 });

  if (body?.remover === true) {
    await admin.from("push_tokens").delete().eq("token", token).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  }

  if (!platform) return NextResponse.json({ error: "plataforma_invalida" }, { status: 400 });
  const { error } = await admin
    .from("push_tokens")
    .upsert({ token, user_id: user.id, platform, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "erro_ao_gravar" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
