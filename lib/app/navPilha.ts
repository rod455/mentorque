import type { View } from "./nav";

// As duas regras de pilha do roteador, fora do componente para poderem ser
// conferidas sem navegador (scripts/verifica-navegacao.ts).
//
// Elas ficaram aqui por um motivo prático: o botão físico de voltar do Android
// é um evento do Capacitor, que não existe no Chromium. Nenhuma suíte de
// navegador consegue apertá-lo. Se a regra morasse dentro do componente, ela
// seria a única parte do app impossível de conferir — justamente a parte cujo
// defeito joga a pessoa para fora do app.

/** Quantas raízes visitadas o app guarda. */
export const LIMITE_DE_RAIZES = 20;

export type Pilha = {
  /** As telas empilhadas dentro da raiz atual. A última é a que aparece. */
  views: View[];
  /** O rastro das raízes por onde a pessoa passou antes desta. */
  raizes: View[];
};

/**
 * Trocar de raiz (tocar numa aba de baixo, ou um `root` de dentro do app).
 *
 * A pilha zera, como sempre foi, MAS a raiz que estava em cena entra no
 * rastro. É esse rastro que o voltar do Android consome.
 */
export function comNovaRaiz(p: Pilha, v: View): Pilha {
  const atual = p.views[p.views.length - 1];
  // Tocar duas vezes na mesma aba não empilha rastro: seria voltar para onde
  // já se está, e o botão voltar pareceria travado.
  if (atual && atual.name === v.name) return { ...p, views: [v] };
  return { views: [v], raizes: [...p.raizes, atual].slice(-LIMITE_DE_RAIZES) };
}

/**
 * Um passo de volta do botão do Android. `null` significa "não há mais para
 * onde voltar", e é só aí que o app minimiza.
 *
 * A ORDEM IMPORTA: primeiro desempilha dentro da raiz atual (é o passo mais
 * recente da pessoa), e só quando a raiz está no fundo é que volta para a raiz
 * anterior. Inverter isso faria o voltar pular telas abertas.
 */
export function passoDeVolta(p: Pilha): Pilha | null {
  if (p.views.length > 1) return { ...p, views: p.views.slice(0, -1) };
  if (p.raizes.length > 0) {
    return { views: [p.raizes[p.raizes.length - 1]], raizes: p.raizes.slice(0, -1) };
  }
  return null;
}
