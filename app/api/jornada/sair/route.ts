import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { assinaturaConfere } from "@/lib/jornada/saida";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sair da jornada em um clique.
//
// Chega por GET (o link no rodapé do e-mail) e por POST (o "cancelar
// inscrição" que o Gmail e o Mail mostram ao lado do remetente, via
// List-Unsubscribe-Post). Os dois fazem a mesma coisa: gravam a pessoa em
// jornada_saidas, e a decisão (lib/jornada/decisao.ts) nunca mais escolhe
// nada para ela. Sem pergunta, sem "tem certeza?", sem formulário: quem
// clicou em sair quer sair.
//
// A assinatura (lib/jornada/saida.ts) é o que impede tirar outra pessoa da
// lista sabendo só o id dela.

function pagina(titulo: string, texto: string, status = 200) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title></head>
<body style="margin:0;background:#f4f2ec;font:16px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#2b2f36">
<div style="max-width:480px;margin:64px auto;padding:0 24px;text-align:center">
<p style="font:700 22px/1.3 Georgia,'Times New Roman',serif;margin:0 0 12px">${titulo}</p>
<p style="margin:0 0 24px">${texto}</p>
<a href="https://www.mentorque.com.br" style="color:#6b7078">mentorque.com.br</a>
</div></body></html>`;
  return new NextResponse(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

async function sair(req: Request) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u") ?? "";
  const a = url.searchParams.get("a") ?? "";
  if (!u || !a || !assinaturaConfere(u, a)) {
    return pagina("Este link não vale mais", "Abra o e-mail mais recente do Mentorque e use o link de sair que está nele.", 400);
  }
  const admin = getSupabaseAdmin();
  if (!admin) return pagina("Não deu agora", "Tente de novo daqui a pouco.", 503);
  const { error } = await admin.from("jornada_saidas").upsert({ user_id: u, motivo: "link" }, { onConflict: "user_id" });
  if (error) return pagina("Não deu agora", "Tente de novo daqui a pouco.", 502);
  return pagina("Pronto. Você não recebe mais e-mails do Mentorque.", "Os avisos dentro do app continuam do jeito que você deixou no Perfil.");
}

export async function GET(req: Request) {
  return sair(req);
}

export async function POST(req: Request) {
  return sair(req);
}
