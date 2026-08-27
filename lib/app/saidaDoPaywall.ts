import type { View } from "./nav";

// A saída do paywall.
//
// Existem TRÊS jeitos de sair da tela que vende a assinatura: o botão de
// voltar do Android, o gesto de arrastar da esquerda, e tocar numa aba de
// baixo. Os três precisam passar pela mesma porteira, senão a oferta de
// retenção aparece por um caminho e é atropelada pelos outros dois.
//
// A porteira é um evento cancelável em vez de uma chamada direta porque quem
// decide é a própria tela do paywall (é ela que sabe se tem oferta para
// mostrar), e ela está montada abaixo de quem pergunta. Evento cancelável é o
// jeito de perguntar para baixo sem inverter a dependência.
//
// Morava dentro de Shell.tsx, entre o roteador e a barra de abas.

/** @returns false quando a saída foi segurada (tem oferta na tela). */
export function saidaDoPaywallPermitida(destino: View | null): boolean {
  if (typeof window === "undefined") return true;
  const ev = new CustomEvent<View | null>("mq-paywall-exit", { detail: destino, cancelable: true });
  return window.dispatchEvent(ev); // false = preventDefault (oferta na tela)
}
