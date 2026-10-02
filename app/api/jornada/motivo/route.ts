import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { MOTIVOS } from "@/lib/email/saida";
import { motivoConfere } from "@/lib/email/motivoDaSaida";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Responder por que cancelou, em um clique.
//
// Gêmea de /api/jornada/sair, e de propósito: mesma forma, mesma assinatura por
// pessoa, mesma página de resposta. Quem clicou já fez o que ia fazer, então
// aqui não há formulário, não há "tem certeza?" e não há login.
//
// A ASSINATURA inclui o MOTIVO, e não só a pessoa. Sem isso, quem recebeu o
// e-mail podia trocar `m=preco` por `m=problema` no endereço e responder por si
// mesmo com outro motivo. Não é ataque, é ruído, e ruído numa pesquisa de seis
// respostas é tudo.
//
// POR QUE GRAVA EM GET, se GET não devia mudar nada: porque o clique num link
// de e-mail é GET, e qualquer alternativa (página com botão, confirmação) troca
// a resposta de quem só ia tocar uma vez por nenhuma resposta. O preço disso é
// que servidor corporativo e antivírus, que abrem TODOS os links da mensagem,
// gravam seis cliques. Em vez de tentar adivinhar quem é robô aqui, a casa
// guarda tudo e reconhece a varredura NA LEITURA
// (`respostasLegiveis`, em lib/email/motivoDaSaida.ts), onde dá para olhar o
// conjunto: seis motivos diferentes da mesma pessoa em menos de 30 segundos não
// é opinião, é antivírus.

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u") ?? "";
  const m = url.searchParams.get("m") ?? "";
  const a = url.searchParams.get("a") ?? "";

  // O motivo tem de estar na lista. Assinatura válida para um motivo inventado
  // não existe (o motivo entra no HMAC), mas conferir a lista também é o que
  // impede uma chave antiga, de uma versão com outros motivos, entrar como
  // resposta de uma pesquisa que já mudou.
  const conhecido = MOTIVOS.some((x) => x.id === m);
  if (!u || !m || !a || !conhecido || !motivoConfere(u, m, a)) {
    return pagina("Este link não vale mais", "Abra o e-mail mais recente do Mentorque e use um dos links que estão nele.", 400);
  }

  const admin = getSupabaseAdmin();
  if (!admin) return pagina("Não deu agora", "Tente de novo daqui a pouco.", 503);

  const { error } = await admin.from("saida_motivos").insert({ user_id: u, motivo: m });
  if (error) {
    // Falhar aqui não pode sair calado: é a resposta de alguém que se deu ao
    // trabalho de responder, e perdê-la em silêncio é perder a única coisa que
    // esta pesquisa existe para conseguir.
    console.error("[saida] motivo NAO gravado", { motivo: m, erro: error.message });
    return pagina("Não deu agora", "Tente de novo daqui a pouco.", 502);
  }

  return pagina(
    "Obrigado. Anotado.",
    "Se quiser contar mais, é só responder o e-mail que você recebeu. Ele chega direto no Rodrigo.",
  );
}
