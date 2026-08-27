"use client";

import { FeedbackSheet } from "./FeedbackSheet";
import { ImportarGaragem } from "./ImportarGaragem";
import { ConfirmandoPagamento } from "./ConfirmandoPagamento";
import { PrimeiroQuiz } from "./PrimeiroQuiz";
import { WelcomeBack } from "./WelcomeBack";
import type { View } from "@/lib/app/nav";

// Tudo o que aparece POR CIMA do app.
//
// Fica num arquivo só porque a ordem entre elas é uma regra de verdade, e
// regra espalhada por cinco comentários no meio de um JSX é regra que ninguém
// vê antes de quebrar. A pergunta "o que cobre o quê?" tem que ter um lugar
// para ser respondida.
//
// A ORDEM, do mais alto para o mais baixo:
//
//   1. ConfirmandoPagamento (z-70) — cobre tudo enquanto a compra confirma.
//      Está no topo de propósito: é o que impede alguém que ACABOU DE PAGAR de
//      tocar num recurso Premium, bater no paywall e começar um segundo
//      checkout. Cobrar duas vezes a mesma pessoa é o pior defeito possível.
//   2. ImportarGaragem — a decisão sobre os carros de convidado vem antes de a
//      pessoa mexer numa garagem que ainda pode mudar de dono.
//   3. PrimeiroQuiz (z-65) — abaixo da confirmação de pagamento pela mesma
//      razão do item 1: quem pagou não pode receber um quiz por cima do recibo.
//   4. FeedbackSheet — montada uma vez, acordada por evento (ver
//      lib/app/feedbackPrompt.ts).
//   5. WelcomeBack — a mais baixa e a mais dispensável; qualquer uma das
//      outras tem prioridade sobre um convite a cadastrar carro.
//
// A ordem no JSX abaixo é a de MONTAGEM (de baixo para cima na lista acima);
// quem manda de fato é o z-index de cada uma. As duas precisam concordar, e é
// para isso que existe este comentário.
export function Sobreposicoes({ view }: { view: View["name"] }) {
  return (
    <>
      <WelcomeBack currentView={view} />
      <FeedbackSheet />
      <ImportarGaragem />
      <ConfirmandoPagamento />
      <PrimeiroQuiz />
    </>
  );
}
