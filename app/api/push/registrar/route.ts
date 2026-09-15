import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Registra (ou esquece) o token de push do aparelho.
//
// ATÉ 15/09/2026 ESTA ROTA EXIGIA SESSÃO, e por isso o push não alcançava
// ninguém. O token é do APARELHO, a linha amarrava ele à CONTA, e no Android
// não há contas: 26 aparelhos em 5 dias, zero eventos com `user_id`. A tabela
// inteira tinha 1 token, de 11/09. Decisão do dono em 15/09: mandar push para
// quem baixou o app, não só para quem criou conta.
//
// Agora há dois donos possíveis, nesta ordem de preferência:
//
//   1. A CONTA, quando vem o Bearer do Supabase. É o caso forte: a conta
//      atravessa a troca de aparelho, e a jornada por e-mail já a conhece.
//   2. O APARELHO, pelo `anonId` do corpo, o mesmo id que o funil usa.
//
// Bearer presente e inválido é RECUSADO, nunca rebaixado para o aparelho.
// Rebaixar em silêncio poria alguém que TEM conta na jornada de quem não tem,
// e ela pede exatamente para criar a conta que a pessoa já tem.
//
// Quando a pessoa cria conta depois, o app reentrega o mesmo token com a
// sessão e a linha ganha `user_id` sem perder o `anon_id`. É isso que faz a
// jornada do aparelho parar sozinha: ela lê só `user_id is null`.
//
// SOBRE A ROTA SER ABERTA. Ela grava sem autenticação, como a `/api/funil`,
// porque o aparelho sem conta é justamente quem ela existe para atender. O que
// limita o estrago: `token` é a chave primária (uma linha por aparelho, não dá
// para inflar a tabela repetindo o mesmo), o conteúdo gravado não é dado de
// ninguém, e o `anon_id` é um uuid sorteado no aparelho, não um número
// adivinhável. Na pior das hipóteses alguém registra o próprio aparelho sob um
// anon_id alheio e recebe "termine o cadastro do carro", que não revela nada.
const SEM_ARMAZENAMENTO = "sem-armazenamento";

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  let userId: string | null = null;
  if (bearer) {
    const { data: userData, error: uErr } = await admin.auth.getUser(bearer);
    if (uErr || !userData?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    userId = userData.user.id;
  }

  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const platform = body?.platform === "ios" || body?.platform === "android" ? body.platform : null;

  // Id de aparelho sem armazenamento vive só na memória e morre quando o app
  // fecha (ver lib/app/anon.ts). Gravar um token sob ele é criar uma linha que
  // nunca mais terá dono, e a jornada mandaria push para um id que não volta.
  const anonBruto = typeof body?.anonId === "string" ? body.anonId.trim().slice(0, 200) : "";
  const anonId = anonBruto && !anonBruto.startsWith(SEM_ARMAZENAMENTO) ? anonBruto : null;

  if (!token || token.length > 4096) return NextResponse.json({ error: "token_invalido" }, { status: 400 });
  if (!userId && !anonId) return NextResponse.json({ error: "sem_dono" }, { status: 400 });

  if (body?.remover === true) {
    // O filtro pelo dono não é enfeite: impede uma conta (ou um aparelho) de
    // apagar o token registrado por outro.
    const q = admin.from("push_tokens").delete().eq("token", token);
    await (userId ? q.eq("user_id", userId) : q.eq("anon_id", anonId as string));
    return NextResponse.json({ ok: true });
  }

  if (!platform) return NextResponse.json({ error: "plataforma_invalida" }, { status: 400 });
  const { error } = await admin
    .from("push_tokens")
    .upsert({ token, user_id: userId, anon_id: anonId, platform, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "erro_ao_gravar" }, { status: 500 });
  return NextResponse.json({ ok: true, dono: userId ? "conta" : "aparelho" });
}
