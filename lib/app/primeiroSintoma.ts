// A primeira consulta de sintoma é inteira; da segunda em diante, o grátis vê a
// causa mais provável (17/10/2026).
//
// POR QUE ASSIM. Decisão do dono em 17/10, a partir de
// docs/agentes/propostas/o-que-sai-do-gratis.md. O sintoma é a segunda coisa
// mais usada do app (172 aparelhos de 15/09 a 17/10) e é a porta de quem tem um
// problema agora. Trancar a primeira consulta tiraria o valor antes de a pessoa
// vê-lo; deixar todas iguais (2 causas sempre, como era) nunca leva ninguém ao
// Premium por aqui. Então: a primeira mostra tudo, causas e checklist, e é ali
// que a pessoa entende o que o app faz. Da segunda em diante, a causa mais
// provável continua aberta e o resto pede Premium. 57 aparelhos consultaram
// dois sintomas ou mais no período.
//
// "A PRIMEIRA" É O PRIMEIRO SINTOMA, NÃO A PRIMEIRA ABERTURA. Voltar ao mesmo
// sintoma continua mostrando tudo: ninguém perde o que já viu. A marca mora no
// aparelho, como o resto do que o convidado tem.

const CHAVE = "mq-primeiro-sintoma";

/** Quantas causas o grátis vê. A lista vem em ordem de probabilidade. */
export function causasLivres(o: { premium: boolean; ehOPrimeiro: boolean; total: number }): number {
  if (o.premium || o.ehOPrimeiro) return o.total;
  return Math.min(1, o.total);
}

/** Quantos itens do checklist o grátis vê (os primeiros são os mais relevantes). */
export function itensLivres(o: { premium: boolean; ehOPrimeiro: boolean; total: number }): number {
  if (o.premium || o.ehOPrimeiro) return o.total;
  return Math.min(3, o.total);
}

/**
 * Lê o primeiro sintoma consultado neste aparelho e, se ainda não houver, marca
 * este. Devolve se `id` é o primeiro. Sem armazenamento (navegador privado), a
 * pessoa vê tudo: errar para o lado generoso não quebra promessa nenhuma.
 */
export function ehOPrimeiroSintoma(id: string): boolean {
  try {
    if (typeof window === "undefined") return true;
    const atual = window.localStorage.getItem(CHAVE);
    if (!atual) {
      window.localStorage.setItem(CHAVE, id);
      return true;
    }
    return atual === id;
  } catch {
    return true;
  }
}
