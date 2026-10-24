// O convite para quem usa o app com frequência e ainda não assina (24/10/2026).
//
// O PEDIDO, do dono: "vamos enviar um email para quem tem usado o app
// regularmente e não assinou o premium. Coloque os benefícios e diferenciais e
// mande o cupom de 100%OFF". E, na mesma conversa: usar o LANCAMENTO1MES e
// escrever que vale para as 5 primeiras pessoas.
//
// O QUE O TEXTO PROMETE E O QUE O STRIPE FAZ, escrito para ninguém confundir:
// o e-mail diz "5 primeiras pessoas", e o teto do cupom no Stripe é 25,
// dividido com a rotina que convida quem criou conta e não cadastrou o carro
// (lib/email/cupomDisponivel.ts). O Stripe não para no quinto. É decisão do
// dono, e o erro, se houver, é para o lado de dar mais do que o prometido.
//
// AS MESMAS DUAS DECISÕES DO E-MAIL DE LANÇAMENTO (lib/email/lancamento.ts):
//
// 1. O CUPOM SÓ VALE NA WEB. A compra dentro do app passa pela Play ou pela
//    Apple, onde não existe onde aplicar cupom. O botão leva ao site com o
//    desconto já aplicado, e o texto diz o que a pessoa precisa saber: o
//    Premium é da CONTA, então quem assina no site já abre o app assinante
//    (o app lê `subscriptions` da conta, de qualquer origem).
// 2. O PREÇO DEPOIS DO MÊS GRÁTIS ESTÁ NO CORPO, com o "cancela quando
//    quiser". Mês grátis sem o preço do segundo vira estorno e uma estrela.
//
// POR QUE ESTE DESENHO É SIMPLES, e é escolha: a skill de mensagem a cliente
// registra que banner, botão grande e "grátis" mandam o e-mail para a aba
// Promoções, e que com lista pequena o texto pessoal costuma ganhar. São 23
// pessoas que já usam o app; uma carta do Rodrigo com a lista do que muda serve
// melhor que um cartaz.
//
// OS NÚMEROS VÊM DE FORA, contados na hora do disparo: aulas publicadas e aulas
// Premium do catálogo, e o limite do Biela do código. Número escrito à mão
// envelhece contra nós.

const SITE = "https://www.mentorque.com.br";

const CREME = "#f4f2ec";
const GRAFITE = "#16181D";
const AMBAR = "#F2A623";
const TEXTO = "#2b2f36";
const SUAVE = "#6b7078";

/**
 * A marca do envio em `jornada_envios`. Datada, porque é uma campanha e não
 * uma rotina: a próxima, se houver, é outra chave e outra decisão do dono.
 */
export const CHAVE_DO_CONVITE_PREMIUM = "convite-premium-2026-10";

/** O que o texto promete. O Stripe aceita mais (teto 25), por decisão do dono. */
export const PRIMEIRAS_PESSOAS = 5;

export type ConvitePremium = {
  /** Primeiro nome, quando a conta tem; sem nome, a saudação fica genérica. */
  nome: string | null;
  cupom: string;
  precoMensal: string;
  /** Aulas publicadas hoje, já sem as agendadas. */
  aulas: number;
  /** Quantas dessas são Premium. */
  aulasPremium: number;
  /** Perguntas ao Biela por mês no grátis (lib/biela/limite.ts). */
  limiteBiela: number;
  /** Link para sair da lista, assinado; null quando o servidor não assina. */
  sair: string | null;
};

/** O endereço do botão: plano mensal, cupom aplicado e a campanha marcada. */
export function linkDoConvite(cupom: string): string {
  return `${SITE}/app?assinar=mensal&cupom=${encodeURIComponent(cupom)}&utm_source=email&utm_campaign=convite-premium-2026-10`;
}

/** O mesmo endereço dentro de atributo HTML: `&` vira `&amp;` (ver lancamento.ts). */
function emAtributo(url: string): string {
  return url.replace(/&/g, "&amp;");
}

function primeiroNome(nome: string | null): string | null {
  const n = (nome ?? "").trim().split(/\s+/)[0] ?? "";
  if (!n || n.includes("@") || n.length > 30) return null;
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function beneficios(o: ConvitePremium): string[] {
  const abertas = Math.max(0, o.aulas - o.aulasPremium);
  return [
    `<b>Biela sem limite.</b> No grátis são ${o.limiteBiela} perguntas por mês; no Premium você pergunta o quanto quiser sobre o seu carro.`,
    `<b>Todas as causas de cada sintoma</b>, com o checklist inteiro, e não só a mais provável.`,
    `<b>Custo por km e consumo</b> do seu carro, calculados a partir dos abastecimentos que você registra.`,
    `<b>Plano de revisão feito para o seu carro</b>, montado para o modelo e a quilometragem dele.`,
    `<b>Saúde por sistema</b>: motor, freios, suspensão, pneus e elétrica, cada um com a sua nota.`,
    `<b>As ${o.aulasPremium} aulas Premium</b>, somadas às ${abertas} que você já tem.`,
  ];
}

export function emailDoConvitePremium(o: ConvitePremium): { assunto: string; html: string; texto: string } {
  const nome = primeiroNome(o.nome);
  const saudacao = nome ? `Oi, ${nome}!` : "Oi!";
  const assunto = "Um mês de Premium por nossa conta";
  const preheader = `Para quem tem usado o Mentorque nas últimas semanas. Vale para as ${PRIMEIRAS_PESSOAS} primeiras pessoas.`;
  const intro =
    "Aqui é o Rodrigo, do Mentorque. Vi que você tem aberto o app com frequência nas últimas semanas, e queria agradecer com um convite: o primeiro mês do Premium sai por nossa conta.";
  const listaTitulo = "O que muda com o Premium";
  const oferta = `O cupom <b>${o.cupom}</b> já vem aplicado no botão abaixo e cobre o primeiro mês do plano mensal. Vale para as ${PRIMEIRAS_PESSOAS} primeiras pessoas que usarem.`;
  const cta = "Quero meu mês de Premium";
  const comoUsar =
    "Entre com a mesma conta que você usa no app. O Premium fica na sua conta, então assinando pelo site ele já aparece no app.";
  const depois = `Depois do primeiro mês, o plano é ${o.precoMensal} por mês, e você cancela quando quiser.`;
  const fecho = "Se tiver qualquer dúvida, é só responder este e-mail. Eu leio.";
  const assinatura = "Rodrigo, Mentorque";
  const rodape = "Você recebeu este e-mail porque tem uma conta no Mentorque.";
  const link = linkDoConvite(o.cupom);
  const lista = beneficios(o);

  const p = (t: string, extra = "") =>
    `<p style="margin:0 0 16px 0;font:400 15px/1.65 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}${extra}">${t}</p>`;
  const item = (t: string) =>
    `<tr><td style="padding:0 0 10px 0;font:400 15px/1.55 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}"><span style="color:${AMBAR};font-weight:700">•</span>&nbsp;&nbsp;${t}</td></tr>`;

  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${assunto}</title></head>
<body style="margin:0;padding:0;background:${CREME}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREME};padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:14px">
        <tr><td style="padding:28px 28px 8px 28px">
          ${p(`<b>${saudacao}</b>`)}
          ${p(intro)}
          <p style="margin:0 0 12px 0;font:700 12px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE};letter-spacing:.6px;text-transform:uppercase">${listaTitulo}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lista.map(item).join("")}</table>
        </td></tr>
        <tr><td style="padding:12px 28px 0 28px">
          ${p(oferta)}
        </td></tr>
        <tr><td align="center" style="padding:4px 28px 0 28px">
          <a href="${emAtributo(link)}" style="display:inline-block;background:${AMBAR};color:${GRAFITE};font:700 15px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;text-decoration:none;padding:14px 30px;border-radius:999px">${cta}</a>
        </td></tr>
        <tr><td style="padding:18px 28px 6px 28px">
          ${p(comoUsar, ";font-size:14px")}
          ${p(depois, ";font-size:14px")}
          ${p(fecho)}
          ${p(assinatura, ";margin-bottom:24px")}
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
        <tr><td align="center" style="padding:16px 24px 6px 24px">
          <p style="margin:0;font:400 12px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE}">
            Mentorque © 2026 · ${rodape}${o.sair ? ` <a href="${emAtributo(o.sair)}" style="color:${SUAVE}">Não quero mais receber e-mails</a>` : ""}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const semTags = (t: string) => t.replace(/<[^>]+>/g, "");
  const texto = [
    saudacao,
    "",
    intro,
    "",
    `${listaTitulo}:`,
    ...lista.map((t) => `- ${semTags(t)}`),
    "",
    semTags(oferta),
    link,
    "",
    comoUsar,
    depois,
    "",
    fecho,
    "",
    assinatura,
    "",
    rodape + (o.sair ? ` Para sair da lista: ${o.sair}` : ""),
  ].join("\n");

  return { assunto, html, texto };
}
