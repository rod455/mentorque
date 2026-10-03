// O e-mail de quem criou conta e parou antes de cadastrar o carro.
//
// POR QUE EXISTE (03/10/2026), e o pedido é do dono: "criar um e-mail
// oferecendo 1 mês de Premium grátis, com o cupom que a gente fez do Stripe,
// para os clientes que criaram conta e não cadastraram o carro: termine o
// cadastro e ganhe 1 mês para testar nossas funcionalidades".
//
// O TAMANHO DA LISTA, medido antes de escrever: 32 contas sem carro, com
// e-mail, sem assinatura ativa e sem pedido de saída da lista.
//
// ELE USA O RENDERIZADOR DA JORNADA, e isso é uma correção de 03/10, no mesmo
// dia. Nasceu com HTML próprio e a Biela no rodapé; o dono comparou com os
// outros e-mails da casa e pediu a Biela no começo, "nesse estilo que são os
// outros". A resposta certa não era copiar o visual, que viraria uma segunda
// cópia divergindo da primeira na próxima mudança: é montar uma `Mensagem` e
// deixar o `renderEmail` desenhar, que é quem já sabe o cabeçalho escuro com a
// marca e a Biela, o botão âmbar e o rodapé com o sair em um clique.
//
// AS DECISÕES DE CONTEÚDO, herdadas do e-mail de lançamento porque lá elas já
// custaram caro para serem aprendidas:
//
// 1. O CUPOM SÓ VALE NA WEB. Ele é um código do Stripe, e a compra dentro do
//    app passa pela Apple ou pela Play, onde não existe onde digitar cupom.
//    Por isso o botão leva ao site com o desconto já aplicado, e o app aparece
//    no rodapé, com a frase que explica a ordem: o Premium é da CONTA, não do
//    aparelho, então quem assina no site abre o app já assinante.
//
// 2. O PREÇO DO SEGUNDO MÊS ESTÁ NO CORPO, não em letra miúda. "Primeiro mês
//    por nossa conta" sem dizer o que vem depois é a receita do estorno e da
//    avaliação de uma estrela.
//
// 3. SÓ EM PORTUGUÊS, e não por descuido: NENHUMA das contas da lista tem
//    idioma guardado em lugar nenhum (conferido no banco), e a base é
//    brasileira. Inventar uma versão em inglês seria manter texto que ninguém lê.
//
// O QUE ESTE E-MAIL NÃO FAZ, e quem dispara precisa saber: o cupom NÃO confere
// se a pessoa cadastrou o carro. Quem clicar ganha o mês de qualquer jeito. O
// texto convida a cadastrar; a máquina não cobra isso. Condicionar de verdade
// exigiria entregar o mês pela nossa mão, no nosso banco, e essa escolha foi do
// dono em 03/10: ele preferiu o cupom do Stripe, que converte sozinho no fim do
// mês porque o cartão já está lá.

import { renderEmail, SITE, type Mensagem } from "../jornada/emails.ts";
import { linkDeSaida } from "../jornada/saida.ts";

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

/** A mensagem, no molde da casa. Pura: o desenho é do `renderEmail`. */
export function mensagemTermineOCadastro(d: ConviteDeCadastro): Mensagem {
  return {
    assunto: "Falta o seu carro, e o primeiro mês é por nossa conta",
    preheader: "Um minuto de cadastro, e o primeiro mês do Premium fica por nossa conta.",
    titulo: "Falta o seu carro",
    saudacao: d.nome ? `Oi, ${d.nome}!` : "Oi!",
    paragrafos: [
      "Você criou sua conta no Mentorque e parou antes de cadastrar o carro.",
      "É o cadastro do carro que faz o app virar seu: sem ele, não dá para calcular as revisões pela quilometragem, avisar do IPVA pelo final da placa nem acompanhar o consumo. É um minuto, e dá para mudar depois.",
      "Para te dar um empurrão, o primeiro mês do Premium é por nossa conta. Dá para testar a Biela sem limite, a análise de orçamento por foto e o histórico completo do carro.",
      "O desconto é aplicado no site, porque o cupom é de lá. Depois é só abrir o app com a mesma conta: o Premium é da conta, não do aparelho.",
      `Depois do primeiro mês são ${d.precoMensal} por mês, e você cancela quando quiser, sozinho, direto no app ou no site.`,
      "Se preferir ficar no plano gratuito, tudo bem: ele continua funcionando, com o carro cadastrado e os lembretes básicos.",
    ],
    cta: { texto: "Pegar o primeiro mês por nossa conta", url: linkDoCupom(d.cupom) },
    nota: "Depois de assinar, é só abrir o app:",
    // O push não é usado por esta campanha (ela é só e-mail), mas o molde da
    // casa pede um, e deixá-lo coerente custa nada e evita um texto errado no
    // dia em que alguém ligar o push nesta chave.
    push: {
      titulo: "Falta o seu carro",
      corpo: "Cadastre o carro e o primeiro mês do Premium é por nossa conta.",
    },
  };
}

export function emailTermineOCadastro(d: ConviteDeCadastro): EmailPronto {
  const pronto = renderEmail(mensagemTermineOCadastro(d), linkDeSaida(d.userId) ?? "");
  return { assunto: pronto.assunto, html: pronto.html, texto: pronto.text };
}
