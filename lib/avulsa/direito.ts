// A compra avulsa: o que cada produto libera e quem pode perguntar. A parte pura.
//
// DECISÕES DO DONO (05/11/2026, `compra-avulsa-por-momento` no caderno):
//   - pacote de 2 perguntas ao Biela por R$ 1,90 e de 10 por R$ 4,90, sem
//     prazo curto;
//   - passe de 7 dias por R$ 9,90, que libera o Biela e a análise de
//     orçamento sem limite, para a conta inteira, com teto de uso justo de
//     30 perguntas por dia;
//   - não exige conta: o direito fica com o aparelho e passa para a conta.
// E em 08/11: no Android a compra passa pelo Stripe, fora do app, e volta.
//
// A ORDEM DE QUEM PAGA A PERGUNTA, e por quê:
//   1. Premium: não tem teto, nada é gasto.
//   2. Passe valendo: é ele, e o grátis e os créditos ficam guardados.
//   3. A grátis do mês, se ainda não foi usada: crédito comprado não é gasto
//      quando a pergunta sairia de graça.
//   4. Crédito de pacote.
//   5. Nada: recusa, e a recusa traz a oferta.
//
// `npm run conferir:avulsa` abre isto no node e planta defeito.

export type ProdutoAvulso = "pacote_2" | "pacote_10" | "passe_7d";

export const PRODUTOS: Record<ProdutoAvulso, { centavos: number; perguntas: number | null; dias: number | null; nome: string }> = {
  pacote_2: { centavos: 190, perguntas: 2, dias: null, nome: "2 perguntas ao Biela" },
  pacote_10: { centavos: 490, perguntas: 10, dias: null, nome: "10 perguntas ao Biela" },
  passe_7d: { centavos: 990, perguntas: null, dias: 7, nome: "Passe de 7 dias do Mentorque" },
};

export const TETO_DO_PASSE_POR_DIA = 30;

export function ehProdutoAvulso(x: unknown): x is ProdutoAvulso {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(PRODUTOS, x);
}

/** O que uma compra grava: quantas perguntas e até quando vale o passe. */
export function oQueACompraLibera(produto: ProdutoAvulso, pagoEm: Date): { perguntas: number | null; passeAte: Date | null } {
  const p = PRODUTOS[produto];
  return {
    perguntas: p.perguntas,
    passeAte: p.dias ? new Date(pagoEm.getTime() + p.dias * 24 * 60 * 60 * 1000) : null,
  };
}

export type Saldo = {
  /** Perguntas compradas em pacotes, somadas. */
  creditosComprados: number;
  /** Perguntas já pagas com crédito. */
  creditosUsados: number;
  /** A maior validade de passe entre as compras, ou nula. */
  passeAte: Date | null;
  /** Perguntas pagas com passe nas últimas 24 horas (o teto de uso justo). */
  perguntasDoPasseHoje: number;
};

export const SALDO_VAZIO: Saldo = { creditosComprados: 0, creditosUsados: 0, passeAte: null, perguntasDoPasseHoje: 0 };

export function creditosRestantes(s: Saldo): number {
  return Math.max(0, s.creditosComprados - s.creditosUsados);
}

export function passeValendo(s: Saldo, agora: Date): boolean {
  return !!s.passeAte && s.passeAte.getTime() > agora.getTime();
}

export type Decisao =
  | { pode: true; pagoCom: null | "credito" | "passe" }
  | { pode: false; motivo: "limite" | "teto_do_passe" };

export function quemPagaAPergunta(o: {
  premium: boolean;
  gratisFeitasNoMes: number;
  limiteGratis: number;
  saldo: Saldo;
  agora: Date;
}): Decisao {
  if (o.premium) return { pode: true, pagoCom: null };
  if (passeValendo(o.saldo, o.agora)) {
    if (o.saldo.perguntasDoPasseHoje >= TETO_DO_PASSE_POR_DIA) return { pode: false, motivo: "teto_do_passe" };
    return { pode: true, pagoCom: "passe" };
  }
  if (o.gratisFeitasNoMes < o.limiteGratis) return { pode: true, pagoCom: null };
  if (creditosRestantes(o.saldo) > 0) return { pode: true, pagoCom: "credito" };
  return { pode: false, motivo: "limite" };
}

/**
 * Quantas perguntas ainda cabem AGORA, para a tela. Nulo quando não há teto
 * que a pessoa precise ver (Premium ou passe valendo).
 */
export function cabemAinda(o: { premium: boolean; gratisFeitasNoMes: number; limiteGratis: number; saldo: Saldo; agora: Date }): number | null {
  if (o.premium || passeValendo(o.saldo, o.agora)) return null;
  return Math.max(0, o.limiteGratis - o.gratisFeitasNoMes) + creditosRestantes(o.saldo);
}
