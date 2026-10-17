// O limite da Biela no gratuito: a parte pura.
//
// DECISÃO DO DONO EM 15/09/2026: "vamos colocar o biela no free para as
// pessoas utilizarem", com CINCO perguntas por mês.
//
// O QUE HAVIA ANTES, E POR QUE ISTO NÃO É TROCAR UM NÚMERO. Até hoje a Biela
// era Premium fechada: `FREE_BIELA_QUESTIONS = 0` na tela. E o portão era só
// do lado do cliente, de duas maneiras que só doem quando o número passa de
// zero:
//
//   1. O contador do gratuito vivia num `useState(0)`, ou seja, zerava a cada
//      abertura do app. "Cinco por mês" viraria "cinco por abertura".
//   2. A rota `/api/biela` não conferia nada: sem sessão, sem Premium, sem
//      contagem, sem teto. O único motivo de isso não custar dinheiro era o
//      zero na tela, que ninguém do lado de cá garante.
//
// Cada pergunta é uma chamada paga à API. Por isso quem conta é o SERVIDOR, e
// o molde é o do orçamento por foto (lib/orcamento/analise.ts), que resolveu
// exatamente este problema em 13/09: conta no banco por conta ou por aparelho,
// confere o Premium pela tabela `subscriptions` com o Bearer, e não acredita
// no que o app diz.
//
// `npm run conferir:biela` abre isto no node e planta defeito.

// O mês vem do orçamento de propósito, e não de uma cópia: os dois limites
// gratuitos viram no MESMO instante para a mesma pessoa. Duas funções iguais
// escritas em dois lugares é onde nasce o mês que vira num e não no outro.
import { mesDe } from "../orcamento/analise.ts";

export { mesDe };

// DE 5 PARA 3 EM 17/10/2026, decisão do dono ("vamos implementar isso tudo").
// Pela tabela `biela_perguntas`, de 15/09 a 17/10, 12 pessoas-mês sem Premium
// bateram no limite de 5; com 3, seriam 25. É o limite com mais gente batendo
// e o único que muda sem versão nova, porque quem conta é o servidor. Proposta
// em docs/agentes/propostas/o-que-sai-do-gratis.md.
export const LIMITE_GRATIS_POR_MES = 3;

export function podePerguntar(feitasNoMes: number, premium: boolean): boolean {
  if (premium) return true;
  return feitasNoMes < LIMITE_GRATIS_POR_MES;
}

/** Quantas ainda cabem neste mês. `null` no Premium, que não tem teto. */
export function restantes(feitasNoMes: number, premium: boolean): number | null {
  if (premium) return null;
  return Math.max(0, LIMITE_GRATIS_POR_MES - feitasNoMes);
}
