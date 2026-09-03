import { NextResponse } from "next/server";
import { chaveDadosOk, negada } from "@/lib/chaveDados";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { emailDeLancamento, type Idioma } from "@/lib/email/lancamento";
import { aulas } from "@/lib/app/conteudo/aulas";
import { lessonPublicada } from "@/lib/app/regrasDeConteudo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * O teto de tempo da função, e ele PRECISA ser dito.
 *
 * O padrão da Vercel neste plano é 10 segundos, e a lista não cabe: são 17
 * envios, cada um com a pausa que respeita o limite do Resend, e a conta passa
 * de 13 segundos. Sem esta linha o disparo morreria no meio da lista.
 *
 * Morrer no meio não seria catástrofe, porque cada envio é marcado na hora e
 * uma segunda chamada continuaria de onde parou. Mas contar com isso seria
 * escolher o remendo em vez do conserto.
 */
export const maxDuration = 60;

// O disparo do e-mail de lançamento para a lista de espera.
//
// UMA ROTA PARA UMA MENSAGEM SÓ, e é para ser assim. Isto não é uma ferramenta
// de campanha: é o envio único combinado com o dono para as 18 pessoas que
// entraram na lista antes de o app existir. Uma rota genérica de "mandar
// e-mail para uma lista" seria uma porta muito maior do que a necessidade, num
// domínio (mensagem a cliente) onde a regra da casa é não agir sem o dono.
//
// AS TRÊS TRAVAS, e cada uma responde a uma forma diferente de errar:
//
//   1. DADOS_CHAVE, como todo agregado da operação. Mandar mensagem para o
//      cliente é a porta que menos pode ficar aberta por esquecimento.
//   2. `disparar: true` no corpo. Nenhum GET, nenhum toque acidental de
//      navegador ou de rastreador manda e-mail para ninguém.
//   3. A marca no banco (`waitlist.lancamento_enviado_em`). É a trava contra o
//      envio DOBRADO, e é a única que sobrevive ao caso real: o agendamento
//      rodar de novo, a rede repetir a chamada, alguém disparar duas vezes na
//      dúvida. Quem já tem data não recebe de novo, nunca.
//
// QUEM FICA DE FORA, e por quê: quem já assina (ativo ou em teste). Oferecer
// "seu primeiro mês é por nossa conta" para quem já pegou o mês grátis é
// oferecer o que a pessoa já tem, e o link levaria a um segundo checkout da
// mesma assinatura. Sai da consulta, não de uma lista escrita à mão.
//
// O `teste` manda UMA cópia para um endereço e não encosta na lista nem na
// marca. É o primeiro passo do roteiro: as imagens do e-mail vêm do site, e
// imagem quebrada não tem conserto depois de enviada.

const FROM = process.env.WAITLIST_FROM ?? "Mentorque <contato@mentorque.com.br>";

/** Onde a pessoa responde para sair. Caixa de verdade, lida pelo dono. */
const SAIR = "contato@mentorque.com.br";

const CUPOM = "LANCAMENTO1MES";
const PRECO_MENSAL = "R$ 29,90";

/**
 * O Resend aceita 2 chamadas por segundo. Com 17 destinatários, meio segundo
 * entre uma e outra atravessa a lista inteira em menos de dez segundos e passa
 * longe do teto. Ir mais rápido só traria 429 e uma lista entregue pela
 * metade, que é o pior resultado possível aqui.
 */
const ESPERA_MS = 350;

const dorme = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Quantas aulas o app tem HOJE, já sem as agendadas.
 *
 * Contada na hora do disparo em vez de escrita no texto: o número mudou de 101
 * para 103 em três dias, e um número escrito à mão envelhece calado. As
 * agendadas ficam de fora porque prometer no e-mail uma aula que ainda não
 * estreou é a mesma quebra de promessa que a trava de agendamento evita.
 */
function aulasPublicadas(): number {
  const { lessons } = aulas((pt: string) => pt);
  const agora = new Date();
  return lessons.filter((l) => lessonPublicada(l, agora)).length;
}

type Envio = { email: string; locale: Idioma };

async function enviar(chave: string, e: Envio, quantasAulas: number): Promise<string | null> {
  const { subject, html, text } = emailDeLancamento(e.locale, {
    cupom: CUPOM,
    precoMensal: PRECO_MENSAL,
    aulas: quantasAulas,
  });
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${chave}` },
      body: JSON.stringify({
        from: FROM,
        to: [e.email],
        subject,
        html,
        // `text` junto do `html` pontua melhor nos filtros, como no boas-vindas.
        text,
        // Saída em um passo, sem precisar responder e esperar. Vale para a
        // caixa de entrada (o Gmail mostra o "Cancelar inscrição" ao lado do
        // remetente) e vale para a pessoa, que é o motivo principal.
        headers: { "List-Unsubscribe": `<mailto:${SAIR}?subject=Sair%20da%20lista>` },
      }),
    });
    if (res.ok) return null;
    return `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300);
  } catch (err) {
    return String(err).slice(0, 300);
  }
}

export async function POST(req: Request) {
  if (!chaveDadosOk(req)) return negada();

  const chave = process.env.RESEND_API_KEY;
  if (!chave) return NextResponse.json({ error: "resend_nao_configurado" }, { status: 501 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "banco_nao_configurado" }, { status: 501 });

  const body = await req.json().catch(() => ({}));
  const quantasAulas = aulasPublicadas();

  // ── uma cópia de prova, sem tocar na lista ────────────────────────────────
  if (typeof body?.teste === "string" && body.teste.includes("@")) {
    const locale: Idioma = body?.locale === "en" ? "en" : "pt";
    const erro = await enviar(chave, { email: body.teste.trim(), locale }, quantasAulas);
    return NextResponse.json(erro ? { ok: false, erro } : { ok: true, teste: body.teste, aulas: quantasAulas, cupom: CUPOM });
  }

  if (body?.disparar !== true) {
    return NextResponse.json({ error: "diga_disparar_true_ou_teste" }, { status: 400 });
  }

  // ── a lista de verdade ────────────────────────────────────────────────────
  const { data: lista, error } = await admin
    .from("waitlist")
    .select("id, email, locale, lancamento_enviado_em")
    .is("lancamento_enviado_em", null)
    .order("created_at");
  if (error) return NextResponse.json({ error: "erro_ao_ler_lista", detalhe: error.message }, { status: 500 });
  if (!lista?.length) return NextResponse.json({ ok: true, enviados: 0, nota: "todo mundo já recebeu" });

  // Quem já assina sai daqui, e a pergunta é feita ao banco a cada disparo em
  // vez de a uma lista escrita antes: entre escrever o e-mail e mandá-lo,
  // alguém pode ter assinado.
  //
  // O caminho é `subscriptions` e depois o e-mail de cada assinante, porque
  // `auth.users` não é legível pelo PostgREST. São poucas assinaturas, então
  // são poucas consultas; e falhar em descobrir um assinante custa caro
  // (oferta repetida a quem já pagou), então esta parte não engole erro.
  const jaAssinam = new Set<string>();
  const { data: subs, error: erroSubs } = await admin
    .from("subscriptions")
    .select("user_id")
    .in("status", ["active", "trialing"]);
  if (erroSubs) {
    return NextResponse.json({ error: "erro_ao_ler_assinaturas", detalhe: erroSubs.message }, { status: 500 });
  }
  for (const s of subs ?? []) {
    const { data: u, error: erroU } = await admin.auth.admin.getUserById(String(s.user_id));
    if (erroU) {
      return NextResponse.json({ error: "erro_ao_ler_assinante", detalhe: erroU.message }, { status: 500 });
    }
    const e = u?.user?.email;
    if (e) jaAssinam.add(e.toLowerCase());
  }

  const alvos = lista.filter((l) => !jaAssinam.has(String(l.email).toLowerCase()));

  const enviados: string[] = [];
  const falhas: { email: string; erro: string }[] = [];
  for (const l of alvos) {
    const locale: Idioma = l.locale === "en" ? "en" : "pt";
    const erro = await enviar(chave, { email: String(l.email), locale }, quantasAulas);
    if (erro) {
      falhas.push({ email: String(l.email), erro });
    } else {
      // A marca vai LOGO DEPOIS de cada envio, e não uma vez no fim: se a rota
      // morrer no meio da lista, quem já recebeu está marcado, e uma segunda
      // chamada continua de onde parou em vez de mandar tudo de novo.
      await admin.from("waitlist").update({ lancamento_enviado_em: new Date().toISOString() }).eq("id", l.id);
      enviados.push(String(l.email));
    }
    await dorme(ESPERA_MS);
  }

  return NextResponse.json({
    ok: true,
    enviados: enviados.length,
    pulados_por_ja_assinarem: lista.length - alvos.length,
    falhas,
    aulas: quantasAulas,
    cupom: CUPOM,
  });
}
