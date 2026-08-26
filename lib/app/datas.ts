// Aritmética de dia, num lugar só.
//
// Existe porque três coisas independentes precisam da mesma conta (a sequência
// do quiz, a janela do pedido de notificação, os avisos do sino) e uma cópia
// errada em qualquer uma delas não daria erro: daria o número errado, calado.
//
// Conferido por scripts/verifica-quiz.ts (`npm run verifica:quiz`).

/** Dia local do aparelho em yyyy-mm-dd. */
export function diaLocal(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Dias inteiros de `a` até `b`, ambos yyyy-mm-dd. Negativo = `b` veio antes.
 *
 * Usa meio-dia UTC em vez de meia-noite: meia-noite mais horário de verão
 * (que o Brasil pode voltar a ter, e outros países têm) dá 23 ou 25 horas de
 * diferença, e o arredondamento passa a errar por um dia inteiro. Ao meio-dia
 * sobram 12 horas de folga para os dois lados.
 */
export function diasEntre(a: string, b: string): number {
  const t = (s: string) => Date.parse(`${s}T12:00:00Z`);
  const ta = t(a);
  const tb = t(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
  return Math.round((tb - ta) / 86400000);
}
