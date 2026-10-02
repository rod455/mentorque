// O e-mail de quem cancelou a assinatura, e a pergunta que vem junto.
//
// POR QUE ISTO EXISTE (02/10/2026), e o pedido é do dono: "vamos criar um
// e-mail para comunicar quem cancelar a assinatura, com uma pesquisa de
// satisfação e perguntando os principais motivos, para a gente continuar
// evoluindo".
//
// O CONTEXTO QUE DEU URGÊNCIA: em 02/10 os três assinantes do Stripe saíram no
// mesmo dia. Hoje a casa sabe QUE saíram, e não sabe POR QUÊ. Enquanto isso não
// existir, toda conversa sobre churn é palpite, e esta casa passou setembro
// aprendendo o que acontece quando se decide em cima de número que não mede o
// que parece medir.
//
// AS DECISÕES DE FORMA, e cada uma tem motivo:
//
// 1. TEXTO SIMPLES, não peça gráfica. A skill `mensagem-a-cliente` registra a
//    troca: banner com marca, botão grande e cupom são sinal de promoção, e o
//    Gmail acerta ao mandar isso para a aba Promoções. Um e-mail de
//    cancelamento que cai em Promoções não é lido, e este precisa ser lido. É
//    curto, pessoal, com link no meio da frase em vez de botão.
//
// 2. NÃO TENTA SEGURAR NINGUÉM. Nada de desconto, nada de "tem certeza?". Além
//    de preço ser alçada do dono, oferta na saída transforma um pedido de
//    opinião em negociação, e aí a resposta deixa de ser verdade.
//
// 3. A RESPOSTA É UM TOQUE. Formulário com cinco campos recebe resposta de
//    quem já ia escrever de qualquer jeito, que é justamente quem menos
//    representa a saída silenciosa. Cada motivo é um link assinado.
//
// 4. NÃO PROMETE O QUE NÃO SE SABE. O texto diz até quando o Premium vale
//    quando existe data, e não inventa quando não existe.
//
// 5. NÃO DIZ "SEUS DADOS ESTÃO SALVOS". Parece acolhedor e seria uma promessa
//    sobre apagar dados, que é alçada do dono. O que dá para dizer com
//    segurança é que a conta continua.

import { assinaturaDeMotivo } from "./motivoDaSaida.ts";
import { SITE } from "../jornada/saida.ts";

export type Idioma = "pt" | "en";

/**
 * A chave do envio, em `jornada_envios`.
 *
 * Mora aqui, e não na rota, porque tem DOIS leitores: a rota de disparo, que
 * grava a marca por destinatário, e o retrato, que usa a contagem desta chave
 * como DENOMINADOR das respostas. Duas cópias da mesma palavra em dois arquivos
 * é o jeito de um dia o retrato medir uma chave que ninguém envia e dizer "0 de
 * 0" com toda a convicção.
 */
export const CHAVE_DO_ENVIO_DE_SAIDA = "saida-pesquisa";

/** Os motivos oferecidos, na ordem em que aparecem. */
export const MOTIVOS: { id: string; pt: string; en: string }[] = [
  { id: "preco", pt: "Ficou caro para mim", en: "Too expensive for me" },
  { id: "pouco-uso", pt: "Não usei o quanto imaginava", en: "I didn't use it as much as I expected" },
  { id: "faltou", pt: "Faltou algo que eu precisava", en: "It was missing something I needed" },
  { id: "problema", pt: "Tive um problema no app", en: "I ran into a problem with the app" },
  { id: "resolvi", pt: "Já resolvi o que eu precisava", en: "I already solved what I needed" },
  { id: "outro", pt: "Outro motivo", en: "Another reason" },
];

/** O link de um motivo, assinado por pessoa. `null` sem segredo no servidor. */
export function linkDoMotivo(userId: string, motivo: string): string | null {
  const a = assinaturaDeMotivo(userId, motivo);
  if (!a) return null;
  return `${SITE}/api/jornada/motivo?u=${encodeURIComponent(userId)}&m=${encodeURIComponent(motivo)}&a=${a}&utm_source=email&utm_campaign=saida`;
}

/** dd/mm/aaaa a partir de um ISO, ou null. Sem fuso no meio. */
export function dataCurta(iso: string | null | undefined): string | null {
  const s = String(iso ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [a, m, d] = s.split("-");
  return `${d}/${m}/${a}`;
}

export type DadosDaSaida = {
  userId: string;
  /** Primeiro nome, quando existir. Sem ele o e-mail abre sem nome, e tudo bem. */
  nome?: string | null;
  /** Fim do ciclo pago, ISO. Quando no futuro, o Premium ainda vale até lá. */
  fimDoCiclo?: string | null;
  /** O dia de hoje, yyyy-mm-dd. Entra para a função ser pura. */
  hoje: string;
  idioma?: Idioma;
};

/**
 * A primeira frase, que é a única informativa.
 *
 * Com data no futuro, diz até quando. Com data no passado ou sem data, NÃO
 * inventa: "sua assinatura foi encerrada" é verdade nos dois casos, e um "até
 * 04/10" escrito para quem já perdeu o acesso ontem é a pior forma de abrir um
 * e-mail pedindo sinceridade.
 */
export function fraseDoAcesso(d: DadosDaSaida): string {
  const data = dataCurta(d.fimDoCiclo);
  const futura = !!data && String(d.fimDoCiclo).slice(0, 10) > d.hoje;
  if (d.idioma === "en") {
    return futura
      ? `Your subscription is cancelled and Premium stays on until ${data}.`
      : "Your subscription has ended.";
  }
  return futura
    ? `Sua assinatura foi cancelada e o Premium continua valendo até ${data}.`
    : "Sua assinatura foi encerrada.";
}

const ESCAPA: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ESCAPA[c] ?? c);
}

export type EmailPronto = { assunto: string; html: string; texto: string };

/**
 * O e-mail inteiro.
 *
 * Devolve `null` quando não há como assinar os links: e-mail de pesquisa sem a
 * pesquisa é só um aviso de cancelamento, e mandar metade da coisa gasta a
 * única chance de perguntar. Melhor não mandar e aparecer no relato.
 */
export function emailDeSaida(d: DadosDaSaida): EmailPronto | null {
  const en = d.idioma === "en";
  const links = MOTIVOS.map((m) => ({ ...m, url: linkDoMotivo(d.userId, m.id) }));
  if (links.some((l) => !l.url)) return null;

  const ola = d.nome ? `${en ? "Hi" : "Oi"}, ${d.nome}.` : en ? "Hi." : "Oi.";
  const acesso = fraseDoAcesso(d);
  const conta = en
    ? "Your account keeps working on the free plan, with your cars and your history where you left them."
    : "Sua conta continua funcionando no plano gratuito, com seus carros e seu histórico onde você deixou.";
  const pedido = en
    ? "Can I ask one thing? It takes one tap: what was the main reason?"
    : "Posso te pedir uma coisa? Leva um toque: qual foi o motivo principal?";
  const responda = en
    ? "If you'd rather tell me more, just reply to this email. It comes straight to me."
    : "Se quiser contar mais, é só responder este e-mail. Ele chega direto em mim.";
  const fim = en
    ? "Thanks for giving it a try. If it ever makes sense to come back, everything is here."
    : "Obrigado por ter experimentado. Se um dia fizer sentido voltar, está tudo aqui.";
  const assinatura = en ? "Rodrigo, Mentorque" : "Rodrigo, Mentorque";

  // O HTML escapa o `&` do link como `&amp;`, e o texto puro NÃO.
  //
  // Dentro de atributo, `&` cru é ambíguo, e o que segura hoje é a tolerância
  // do navegador. Ela acaba no dia em que alguma coisa REESCREVE o link, que é
  // exatamente o que o rastreio de clique do provedor faz: lê o HTML, extrai a
  // URL e monta outra. No texto puro é o contrário: `&amp;` apareceria na cara
  // da pessoa.
  const lista = links
    .map((l) => `<li style="margin:0 0 10px"><a href="${esc(l.url!)}" style="color:#8a5a12">${en ? l.en : l.pt}</a></li>`)
    .join("");

  const html = `<!doctype html><html lang="${en ? "en" : "pt-BR"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#ffffff;font:16px/1.65 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#2b2f36">
<div style="max-width:520px;margin:0 auto;padding:28px 24px">
<p style="margin:0 0 16px">${esc(ola)}</p>
<p style="margin:0 0 16px">${esc(acesso)} ${esc(conta)}</p>
<p style="margin:0 0 12px">${esc(pedido)}</p>
<ul style="margin:0 0 18px;padding:0 0 0 20px">${lista}</ul>
<p style="margin:0 0 16px">${esc(responda)}</p>
<p style="margin:0 0 24px">${esc(fim)}</p>
<p style="margin:0 0 4px">${esc(assinatura)}</p>
</div></body></html>`;

  const texto = [
    ola,
    "",
    `${acesso} ${conta}`,
    "",
    pedido,
    "",
    ...links.map((l) => `${en ? l.en : l.pt}: ${l.url}`),
    "",
    responda,
    "",
    fim,
    "",
    assinatura,
  ].join("\n");

  return {
    assunto: en ? "Your Mentorque subscription, and one question" : "Seu cancelamento, e uma pergunta",
    html,
    texto,
  };
}
