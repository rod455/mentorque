// O e-mail de quem criou conta e parou antes de cadastrar o carro.
//
// POR QUE EXISTE (03/10/2026), e o pedido é do dono: "criar um e-mail
// oferecendo 1 mês de Premium grátis, com o cupom que a gente fez do Stripe,
// para os clientes que criaram conta e não cadastraram o carro: termine o
// cadastro e ganhe 1 mês para testar nossas funcionalidades".
//
// O TAMANHO DA LISTA, medido antes de escrever: 32 contas sem carro, com
// e-mail, sem assinatura ativa e sem pedido de saída da lista. Vinte e nove
// nasceram nos últimos 30 dias, então é gente nova, não lista velha.
//
// AS DECISÕES DE FORMA, herdadas do e-mail de lançamento porque lá elas já
// custaram caro para serem aprendidas:
//
// 1. O CUPOM SÓ VALE NA WEB. Ele é um código do Stripe, e a compra dentro do
//    app passa pela Apple ou pela Play, onde não existe onde digitar cupom.
//    Por isso o único botão leva ao site com o desconto já aplicado, e o app
//    aparece depois, com a frase que explica a ordem: o Premium é da CONTA, não
//    do aparelho, então quem assina no site abre o app já assinante.
//
// 2. O PREÇO DO SEGUNDO MÊS ESTÁ NO CORPO, não em letra miúda. "Primeiro mês
//    por nossa conta" sem dizer o que vem depois é a receita do estorno e da
//    avaliação de uma estrela.
//
// 3. UM BOTÃO SÓ. O pedido tem duas ações (assinar com o cupom e cadastrar o
//    carro), e dois botões grandes dividiriam o clique. O botão é o do cupom,
//    porque é o que não dá para fazer dentro do app; cadastrar o carro é o que
//    a pessoa faz em seguida, e isso está escrito em uma linha.
//
// 4. SÓ EM PORTUGUÊS, e não por descuido: NENHUMA das 32 contas tem idioma
//    guardado em lugar nenhum (conferido no banco), e a base é brasileira.
//    Inventar uma versão em inglês seria manter texto que ninguém lê.
//
// O QUE ESTE E-MAIL NÃO FAZ, e quem dispara precisa saber: o cupom NÃO confere
// se a pessoa cadastrou o carro. Quem clicar ganha o mês de qualquer jeito. O
// texto convida a cadastrar; a máquina não cobra isso. Condicionar de verdade
// exigiria entregar o mês pela nossa mão, no nosso banco, e essa escolha foi do
// dono em 03/10: ele preferiu o cupom do Stripe, que converte sozinho no fim do
// mês porque o cartão já está lá.

import { linkDeSaida, SITE } from "../jornada/saida.ts";

const CREME = "#f4f2ec";
const GRAFITE = "#16181D";
const AMBAR = "#F2A623";
const TEXTO = "#2b2f36";
const SUAVE = "#6b7078";

/** Ficha do app nas lojas. Espelha lib/stores.ts, que é a fonte. */
const APP_STORE = "https://apps.apple.com/br/app/mentorque/id6797291865";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=mentorque.app";

export type ConviteDeCadastro = {
  userId: string;
  /** Primeiro nome, quando existir. Sem ele o e-mail abre sem nome, e tudo bem. */
  nome?: string | null;
  /**
   * O código do cupom, de fora.
   *
   * Cupom tem teto de resgates no Stripe, e um e-mail para mais gente do que o
   * teto entrega um link que funciona para os primeiros e falha calado para os
   * últimos: o checkout abre SEM o desconto, com o preço cheio na tela de quem
   * acabou de ler "por nossa conta". Quem dispara confere o teto antes, e é por
   * isso que o código entra por parâmetro em vez de ficar escrito aqui.
   */
  cupom: string;
  /** Preço do mês seguinte, escrito como a pessoa lê. */
  precoMensal: string;
};

export type EmailPronto = { assunto: string; html: string; texto: string };

/** O endereço do botão: cupom aplicado, campanha etiquetada. */
export function linkDoCupom(cupom: string): string {
  return `${SITE}/app?assinar=mensal&cupom=${encodeURIComponent(cupom)}&utm_source=email&utm_campaign=termine-o-cadastro`;
}

const ESCAPA: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ESCAPA[c] ?? c);
}

export function emailTermineOCadastro(d: ConviteDeCadastro): EmailPronto {
  const ola = d.nome ? `Oi, ${d.nome}.` : "Oi.";
  const url = linkDoCupom(d.cupom);
  const sair = linkDeSaida(d.userId);

  const abertura = "Você criou sua conta no Mentorque e parou antes de cadastrar o carro.";
  const porque =
    "É o cadastro do carro que faz o app virar seu: sem ele, não dá para calcular as revisões pela quilometragem, avisar do IPVA pelo final da placa nem acompanhar o consumo. É um minuto, e dá para mudar depois.";
  const oferta =
    "Para te dar um empurrão, o primeiro mês do Premium é por nossa conta. Dá para testar a Biela sem limite, a análise de orçamento por foto e o histórico completo do carro.";
  const comoE =
    "O desconto é aplicado no site, porque o cupom é de lá. Depois é só abrir o app com a mesma conta: o Premium é da conta, não do aparelho.";
  const preco = `Depois do primeiro mês são ${d.precoMensal} por mês, e você cancela quando quiser, sozinho, direto no app ou no site.`;
  const fim = "Se preferir ficar no plano gratuito, tudo bem: ele continua funcionando, com o carro cadastrado e os lembretes básicos.";

  const texto = [
    ola,
    "",
    abertura,
    "",
    porque,
    "",
    oferta,
    "",
    `Pegar o primeiro mês por nossa conta: ${url}`,
    "",
    comoE,
    "",
    preco,
    "",
    "Baixe o app:",
    `Android: ${PLAY_STORE}`,
    `iPhone: ${APP_STORE}`,
    "",
    fim,
    "",
    "Rodrigo, Mentorque",
    ...(sair ? ["", `Para não receber mais e-mails: ${sair}`] : []),
  ].join("\n");

  // Tabelas e estilo em cada tag: o Outlook descarta `<style>` no cabeçalho e
  // ignora flex. É o mesmo molde do e-mail de lançamento, de propósito.
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:${CREME};font:16px/1.65 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXTO}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREME}">
<tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px">
<tr><td style="padding:28px 28px 0 28px">
  <img src="${SITE}/email/marca.png" width="30" height="30" alt="Mentorque" style="display:block;border:0">
</td></tr>
<tr><td style="padding:18px 28px 0 28px">
  <p style="margin:0 0 16px">${esc(ola)}</p>
  <p style="margin:0 0 16px">${esc(abertura)}</p>
  <p style="margin:0 0 16px">${esc(porque)}</p>
  <p style="margin:0 0 20px">${esc(oferta)}</p>
</td></tr>
<tr><td align="center" style="padding:0 28px 18px 28px">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td align="center" style="background:${AMBAR};border-radius:10px">
      <a href="${esc(url)}" style="display:block;padding:14px 26px;color:${GRAFITE};font-weight:700;text-decoration:none">Pegar o primeiro mês por nossa conta</a>
    </td>
  </tr></table>
</td></tr>
<tr><td style="padding:0 28px">
  <p style="margin:0 0 16px">${esc(comoE)}</p>
  <p style="margin:0 0 20px;color:${SUAVE};font-size:14px">${esc(preco)}</p>
  <p style="margin:0 0 20px;font-size:14px">
    Baixe o app:
    <a href="${PLAY_STORE}" style="color:#8a5a12">Android</a> ·
    <a href="${APP_STORE}" style="color:#8a5a12">iPhone</a>
  </p>
  <p style="margin:0 0 20px">${esc(fim)}</p>
  <p style="margin:0 0 6px">Rodrigo, Mentorque</p>
</td></tr>
<tr><td align="center" style="padding:6px 28px 0 28px">
  <!-- A Biela, igual aos outros e-mails da casa. A imagem vem do site
       (conferida no ar em 03/10: 200 e image/png), e o alt existe porque
       muita gente lê com imagem desligada: sem ele fica um retângulo vazio
       sem explicação. -->
  <img src="${SITE}/email/biela.png" width="112" alt="Biela, a assistente do Mentorque" style="display:block;border:0;margin:4px auto 0 auto">
</td></tr>
<tr><td style="padding:14px 28px 26px 28px">
  <p style="margin:0;color:${SUAVE};font-size:12px">
    ${sair ? `<a href="${esc(sair)}" style="color:${SUAVE}">Não quero mais receber e-mails</a>` : "Para não receber mais e-mails, é só responder este."}
  </p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { assunto: "Falta o seu carro, e o primeiro mês é por nossa conta", html, texto };
}
