// E-mail de lançamento para a lista de espera.
//
// Mesmo formato do `waitlist.ts` (tabelas e estilo em cada tag), pelo mesmo
// motivo: o Outlook descarta `<style>` no cabeçalho e ignora flex.
//
// DUAS DECISÕES DE CONTEÚDO QUE NÃO SÃO ESTÉTICAS, e que mudam se a mensagem
// funciona ou vira reclamação:
//
// 1. O CUPOM SÓ VALE NA WEB. Ele é um código do Stripe, e a compra dentro do
//    app das lojas passa pela Apple ou pela Play, onde não existe onde aplicar
//    cupom nenhum. Mandar "baixe o app e use o cupom" seria mandar a pessoa
//    para um lugar onde a promessa não se cumpre. Por isso o botão principal
//    leva ao site com o desconto já aplicado, e as lojas vêm DEPOIS, com a
//    frase que explica por que a ordem é essa: o Premium é da conta, não do
//    aparelho, então quem assina no site já abre o app assinante.
//
// 2. O QUE ACONTECE DEPOIS DO MÊS GRÁTIS ESTÁ ESCRITO. "Primeiro mês por nossa
//    conta" sem dizer o preço do segundo é a receita de estorno e de avaliação
//    de uma estrela. O valor e o "cancela quando quiser" ficam no corpo, não em
//    letra miúda.
//
// O endereço do botão carrega o cupom e a campanha: o `/app?assinar=...` é o
// mesmo caminho dos atalhos de venda, e o `utm_campaign` separa esta lista de
// qualquer outra origem no funil.

const SITE = "https://www.mentorque.com.br";

const CREME = "#f4f2ec";
const GRAFITE = "#16181D";
const AMBAR = "#F2A623";
const TEXTO = "#2b2f36";
const SUAVE = "#6b7078";

/** Ficha do app nas lojas. Espelha lib/stores.ts, que é a fonte. */
const APP_STORE = "https://apps.apple.com/br/app/mentorque/id6797291865";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=mentorque.app";

/**
 * O código do cupom vem de fora, e isso é de propósito.
 *
 * Cupom tem teto de resgates no Stripe, e um e-mail para mais gente do que o
 * teto entrega um link que funciona para os primeiros e falha calado para os
 * últimos: o checkout abre SEM o desconto, com o preço cheio na tela de quem
 * acabou de ler "por nossa conta". Quem dispara confere o teto antes, e o
 * código fica visível aqui para essa conferência ser possível.
 */
export type ConviteLancamento = { cupom: string; precoMensal: string };

export type Idioma = "pt" | "en";

type Copy = {
  subject: string;
  preheader: string;
  titulo: string;
  saudacao: string;
  intro: string;
  destaqueTitulo: string;
  destaque: string[];
  ofertaTitulo: string;
  oferta: string;
  cta: string;
  depois: string;
  lojasTitulo: string;
  nota: string;
  gratisTitulo: string;
  gratis: string;
  assinatura: string;
  rodape: string;
};

function copy(locale: Idioma, o: ConviteLancamento): Copy {
  if (locale === "en") {
    return {
      subject: "Mentorque is out, and your first month is on us",
      preheader: "Now on the App Store and Google Play. Your coupon is inside.",
      titulo: "The garage is open",
      saudacao: "Hey!",
      intro:
        "You joined the Mentorque waitlist when it was still a promise. It is out: the app is live on the <b>App Store</b> and on <b>Google Play</b>, and you are among the first to hear it.",
      destaqueTitulo: "What you can do in there",
      destaque: [
        "Add your car and see its service plan, by date and by mileage",
        "Describe a noise or a dashboard light and get the likely cause, with a fair price before you reach the shop",
        "Ask Biela anything, any time. He is the mechanic on call",
        "101 hands-on lessons: when to do it, how to tell it is overdue, and what waiting costs later",
        "The question of the day: one minute, one question, and the reason behind the answer",
      ],
      ofertaTitulo: "Your first month is on us",
      oferta: `The <b>${o.cupom}</b> coupon is already applied in the button below. It covers the first month of the monthly plan.`,
      cta: "Start my free month",
      depois:
        "Then download the app and sign in with the same account. Premium belongs to the account, not to the device, so it follows you to the phone.",
      lojasTitulo: "Get the app",
      nota: `After the first month it is ${o.precoMensal} per month, and you can cancel any time from the app.`,
      gratisTitulo: "Want to try the free plan first? No problem",
      gratis:
        "Really, no problem. Logging your services, symptom diagnosis and service reminders are all there on the free plan, with no card and no deadline. Download it, use it as long as you like, and the button above stays here for the day you want the rest.",
      assinatura: "Rodrigo, Mentorque",
      rodape: "You received this email because you joined the Mentorque waitlist.",
    };
  }
  return {
    subject: "O Mentorque saiu, e o seu primeiro mês é por nossa conta",
    preheader: "Já está na App Store e na Google Play. Seu cupom está aqui dentro.",
    titulo: "A garagem abriu",
    saudacao: "Oi!",
    intro:
      "Você entrou na lista de espera do Mentorque quando ele ainda era promessa. Ele saiu: está publicado na <b>App Store</b> e na <b>Google Play</b>, e você é uma das primeiras pessoas a saber.",
    destaqueTitulo: "O que dá para fazer lá dentro",
    destaque: [
      "Cadastrar seu carro e ver o plano de revisão dele, por data e por quilometragem",
      "Descrever um barulho ou uma luz no painel e receber a causa provável, com o preço justo antes de você chegar na oficina",
      "Perguntar qualquer coisa ao Biela, que é o mecânico de plantão, a qualquer hora",
      "101 aulas de mão: quando fazer, como saber que já passou da hora e o que o atraso cobra depois",
      "A pergunta do dia: um minuto, uma pergunta, e a explicação do porquê da resposta",
    ],
    ofertaTitulo: "Seu primeiro mês é por nossa conta",
    oferta: `O cupom <b>${o.cupom}</b> já vem aplicado no botão abaixo. Ele cobre o primeiro mês do plano mensal.`,
    cta: "Ativar meu mês grátis",
    depois:
      "Depois é só baixar o app e entrar com a mesma conta. O Premium é da conta, não do aparelho, então ele vai junto para o celular.",
    lojasTitulo: "Baixar o app",
    nota: `Passado o primeiro mês, são ${o.precoMensal} por mês, e dá para cancelar quando quiser, pelo próprio app.`,
    gratisTitulo: "Quer testar o grátis antes do Premium? Não tem problema",
    gratis:
      "Sério, não tem. Registrar seus serviços, diagnóstico por sintoma e lembretes de revisão estão no plano gratuito, sem cartão e sem prazo. Baixe, use o tempo que quiser, e o botão lá de cima continua aqui para o dia em que você quiser o resto.",
    assinatura: "Rodrigo, Mentorque",
    rodape: "Você recebeu este e-mail porque entrou na lista de espera do Mentorque.",
  };
}

function item(texto: string): string {
  return `<tr><td style="padding:0 0 10px 0;font:400 15px/1.55 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">
    <span style="color:${AMBAR};font-weight:700">•</span>&nbsp;&nbsp;${texto}
  </td></tr>`;
}

/** O endereço do botão: plano mensal, cupom aplicado e a campanha marcada. */
export function linkDaOferta(cupom: string): string {
  return `${SITE}/app?assinar=mensal&cupom=${encodeURIComponent(cupom)}&utm_source=email&utm_campaign=lista-espera`;
}

export function emailDeLancamento(
  locale: Idioma,
  o: ConviteLancamento,
): { subject: string; html: string; text: string } {
  const c = copy(locale, o);
  const link = linkDaOferta(o.cupom);

  const html = `<!doctype html>
<html lang="${locale === "pt" ? "pt-BR" : "en"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${c.titulo}</title></head>
<body style="margin:0;padding:0;background:${CREME}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${c.preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREME};padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">

        <tr><td align="center" style="background:${GRAFITE};padding:26px 24px 0 24px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:9px"><img src="${SITE}/email/marca.png" width="30" height="30" alt="" style="display:block;border:0"></td>
            <td style="font:700 19px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${CREME};letter-spacing:.2px">Mentorque</td>
          </tr></table>
          <img src="${SITE}/email/biela.png" width="112" alt="Biela" style="display:block;border:0;margin:14px auto 0 auto">
        </td></tr>
        <tr><td align="center" style="background:${GRAFITE};padding:2px 24px 26px 24px">
          <div style="font:700 23px/1.3 Georgia,'Times New Roman',serif;color:${CREME}">${c.titulo}</div>
        </td></tr>

        <tr><td style="padding:28px 28px 4px 28px">
          <p style="margin:0 0 12px 0;font:700 16px/1.5 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.saudacao}</p>
          <p style="margin:0 0 20px 0;font:400 15px/1.65 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.intro}</p>
        </td></tr>

        <tr><td style="padding:0 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf8f3;border-left:3px solid ${AMBAR};border-radius:6px">
            <tr><td style="padding:16px 18px">
              <p style="margin:0 0 12px 0;font:700 12px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE};letter-spacing:.6px;text-transform:uppercase">${c.destaqueTitulo}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${c.destaque.map(item).join("")}</table>
            </td></tr>
          </table>
        </td></tr>

        <!-- A oferta. Botão único e grande: dois botões concorrendo aqui
             dividiriam o clique entre assinar e baixar, e o que precisa
             acontecer primeiro é assinar, porque o cupom só vale na web. -->
        <tr><td align="center" style="padding:26px 28px 0 28px">
          <p style="margin:0 0 6px 0;font:700 17px/1.4 Georgia,'Times New Roman',serif;color:${TEXTO}">${c.ofertaTitulo}</p>
          <p style="margin:0 0 18px 0;font:400 15px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.oferta}</p>
          <a href="${link}" style="display:inline-block;background:${AMBAR};color:${GRAFITE};font:700 15px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;text-decoration:none;padding:15px 34px;border-radius:999px">${c.cta}</a>
          <p style="margin:14px 0 0 0;font:400 13px/1.55 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE}">${c.nota}</p>
        </td></tr>

        <tr><td style="padding:22px 28px 0 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="border-top:1px solid #ece8de;font-size:0;line-height:0">&nbsp;</td>
          </tr></table>
        </td></tr>

        <tr><td align="center" style="padding:18px 28px 0 28px">
          <p style="margin:0 0 14px 0;font:400 15px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.depois}</p>
          <p style="margin:0 0 12px 0;font:700 12px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE};letter-spacing:.6px;text-transform:uppercase">${c.lojasTitulo}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding:0 5px">
              <a href="${APP_STORE}" style="display:inline-block;background:${GRAFITE};color:${CREME};font:600 14px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;text-decoration:none;padding:13px 22px;border-radius:10px">App Store</a>
            </td>
            <td style="padding:0 5px">
              <a href="${PLAY_STORE}" style="display:inline-block;background:${GRAFITE};color:${CREME};font:600 14px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;text-decoration:none;padding:13px 22px;border-radius:10px">Google Play</a>
            </td>
          </tr></table>
        </td></tr>

        <!-- A porta do grátis, e ela fica DEPOIS da oferta de propósito.
             Oferecer o plano gratuito antes do Premium enfraqueceria o convite
             que é o motivo do e-mail; escondê-lo faria quem não quer assinar
             agora simplesmente fechar a mensagem. Aqui embaixo ele funciona
             como rede: quem chegou até o fim sem clicar no botão âmbar ainda
             encontra um caminho para entrar, em vez de sair de mãos vazias. -->
        <tr><td style="padding:24px 28px 0 28px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f5f3;border-radius:10px">
            <tr><td style="padding:18px 20px">
              <p style="margin:0 0 7px 0;font:700 15px/1.4 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.gratisTitulo}</p>
              <p style="margin:0;font:400 14px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.gratis}</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 28px 28px 28px">
          <p style="margin:0;font:400 15px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">${c.assinatura}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
        <tr><td align="center" style="padding:18px 24px 6px 24px">
          <p style="margin:0;font:400 12px/1.6 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${SUAVE}">
            Mentorque © 2026 · ${c.rodape}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const semTags = (t: string) => t.replace(/<[^>]+>/g, "");
  const text = [
    c.titulo,
    "",
    c.saudacao,
    semTags(c.intro),
    "",
    `${c.destaqueTitulo}:`,
    ...c.destaque.map((d) => `- ${d}`),
    "",
    `${c.ofertaTitulo}: ${semTags(c.oferta)}`,
    link,
    "",
    c.nota,
    "",
    semTags(c.depois),
    `App Store: ${APP_STORE}`,
    `Google Play: ${PLAY_STORE}`,
    "",
    `${c.gratisTitulo}`,
    semTags(c.gratis),
    "",
    c.assinatura,
    c.rodape,
  ].join("\n");

  return { subject: c.subject, html, text };
}
