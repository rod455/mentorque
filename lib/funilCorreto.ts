// O que pode ser dividido por o quê, no funil.
//
// POR QUE ISTO EXISTE (01/09/2026): o relatório do Diretor publicou a tabela
// 17 → 8 → 2 → 2 → 2 como se fosse um funil, e as taxas entre esses degraus
// não significavam nada. Não por erro de conta: por erro de UNIDADE. Os
// eventos do funil não são todos da mesma natureza, e dividir um pelo outro
// mistura coisas que não se dividem.
//
// AS TRÊS NATUREZAS, e a regra que sai de cada uma:
//
//   sessao  → dispara uma vez por sessão, para QUEM ESTIVER LÁ.
//             `abriu_app`, `viu_paywall`, `abriu_trilha`.
//             Contar pessoas distintas numa janela responde "quantos fizeram
//             isso na janela". Dois eventos de sessão se comparam entre si.
//
//   ato     → dispara no INSTANTE em que a coisa acontece, e nunca mais.
//             `cadastro`, `cadastrou_carro`, `iniciou_checkout`, `assinou`.
//             Contar numa janela responde "quantos fizeram isso PELA PRIMEIRA
//             VEZ na janela". Quem já tinha carro cadastrado antes é invisível
//             aqui, para sempre, e isso não é defeito: é o que um ato é.
//
//   tecnico → mede a nossa própria medição, não o comportamento de ninguém.
//             `atribuicao`. Nunca é degrau de funil.
//
// O ERRO CONCRETO QUE ISSO PEGA: dividir `cadastrou_carro` (ato) por
// `abriu_app` (sessão) dá "taxa de ativação". Mas o de cima conta só quem
// cadastrou carro DENTRO da janela, e o de baixo conta TODO MUNDO que abriu,
// inclusive quem cadastrou o carro em julho. É um fluxo de novatos dividido
// por um estoque de todos. O número existe, é calculável, e não quer dizer
// nada.
//
// PARA "QUANTOS TÊM CARRO" existe resposta certa e ela não está aqui: está na
// view `estado_da_base`, que conta ESTADO (quantas contas têm carro hoje),
// não ato. Estado se confere uma a uma; ato, não.
//
// Puro de propósito: sem Supabase, sem rede, conferível por
// scripts/verifica-funil.ts sem subir nada.

export type EventoFunil =
  | "abriu_app"
  | "cadastro"
  | "viu_paywall"
  | "iniciou_checkout"
  | "abriu_trilha"
  | "cadastrou_carro"
  | "assinou"
  | "renovou"
  | "cancelou"
  | "expirou"
  | "atribuicao";

export type Natureza = "sessao" | "ato" | "tecnico";

export const NATUREZA: Record<EventoFunil, Natureza> = {
  abriu_app: "sessao",
  viu_paywall: "sessao",
  abriu_trilha: "sessao",
  cadastro: "ato",
  cadastrou_carro: "ato",
  iniciou_checkout: "ato",
  assinou: "ato",
  renovou: "ato",
  cancelou: "ato",
  expirou: "ato",
  atribuicao: "tecnico",
};

/**
 * Desde quando cada evento é MENSURÁVEL, ou seja, desde quando o código que o
 * dispara está no ar. Declarado à mão de propósito: é uma afirmação sobre o
 * mundo, e alguém tem que assinar embaixo.
 *
 * A conferência `conferir:funil` audita esta tabela contra o banco: se
 * existir evento gravado ANTES da data declarada, a declaração está errada e
 * a conferência reprova. O banco não pode declarar sozinho, porque "primeiro
 * evento visto" não é "passou a ser mensurável": um evento pode ficar semanas
 * no ar sem ninguém disparar.
 */
export const MEDIDO_DESDE: Record<EventoFunil, string> = {
  abriu_app: "2026-08-22",
  cadastro: "2026-08-22",
  viu_paywall: "2026-08-22",
  iniciou_checkout: "2026-08-22",
  abriu_trilha: "2026-08-23",
  cadastrou_carro: "2026-08-23",
  assinou: "2026-08-22",
  renovou: "2026-08-22",
  cancelou: "2026-08-22",
  expirou: "2026-08-22",
  atribuicao: "2026-08-30",
};

/**
 * Eventos com uma trava a mais, além da natureza. Aqui a contagem é
 * estruturalmente incompleta e nenhuma janela conserta.
 */
export const RESSALVAS: Partial<Record<EventoFunil, string>> = {
  cadastro:
    "só dispara para conta criada há menos de 7 dias, então toda conta anterior ao instrumento é invisível (9 contas de agosto ficaram de fora)",
};

export type Comparacao =
  | { ok: true }
  | { ok: false; motivo: string };

/**
 * Estes dois degraus podem virar uma taxa?
 *
 * A regra é uma só: só se comparam eventos da MESMA natureza. Não é preciosismo,
 * é o que impede o relatório de publicar fluxo dividido por estoque.
 */
export function podeComparar(de: EventoFunil, para: EventoFunil): Comparacao {
  const nDe = NATUREZA[de];
  const nPara = NATUREZA[para];
  if (nDe === "tecnico" || nPara === "tecnico") {
    return { ok: false, motivo: `${nDe === "tecnico" ? de : para} mede a nossa medição, não o comportamento de ninguém` };
  }
  if (nDe !== nPara) {
    const ato = nDe === "ato" ? de : para;
    const sessao = nDe === "sessao" ? de : para;
    return {
      ok: false,
      motivo: `${ato} é um ATO (conta quem fez na janela) e ${sessao} é de SESSÃO (conta todo mundo que passou). Dividir um pelo outro é fluxo sobre estoque`,
    };
  }
  return { ok: true };
}

/** A data a partir da qual TODOS estes eventos já eram mensuráveis. */
export function janelaValida(eventos: EventoFunil[]): string {
  return eventos
    .map((e) => MEDIDO_DESDE[e])
    .reduce((a, b) => (a > b ? a : b), "0000-00-00");
}

export type Janela = {
  /** O começo que vai ser realmente usado. */
  desde: string;
  /** Foi preciso encurtar? */
  encurtada: boolean;
  /** O que dizer a quem lê, ou null quando a janela pedida coube inteira. */
  aviso: string | null;
};

/**
 * A janela honesta para uma cadeia, encurtada quando preciso.
 *
 * RECUSAR SERIA HONESTO E INÚTIL. Pedir 28 dias hoje abre em 04/08, e os
 * eventos só existem desde 22/08: a taxa mediria calendário. Mas o dado de
 * 22/08 em diante é bom, e jogar fora o funil inteiro por causa dos dezoito
 * dias que não existem é trocar um número errado por nenhum número. Então a
 * janela encolhe até onde ela é verdadeira, e o encolhimento vem escrito.
 */
export function janelaDaCadeia(cadeia: EventoFunil[], desdePedido: string): Janela {
  const minimo = janelaValida(cadeia);
  if (desdePedido >= minimo) return { desde: desdePedido, encurtada: false, aviso: null };
  return {
    desde: minimo,
    encurtada: true,
    aviso: `janela encurtada de ${desdePedido} para ${minimo}: antes disso estes eventos ainda não eram medidos, e a série seria mais curta do que parece`,
  };
}

export type Degrau = {
  de: EventoFunil;
  para: EventoFunil;
  antes: number;
  depois: number;
  taxa: number | null;
  /** Quando null, diz POR QUE não dá para calcular. Nunca fica em silêncio. */
  motivo: string | null;
  /** A partir de quando esta comparação é honesta. */
  validoDesde: string;
  /** Ressalvas dos eventos envolvidos, mesmo quando a taxa saiu. */
  ressalvas: string[];
};

/**
 * Um degrau do funil, com a taxa OU o motivo de ela não existir.
 *
 * `desde` é o começo da janela que foi consultada. Se ela abre antes de os
 * dois eventos serem mensuráveis, a taxa não sai: o degrau de baixo teria
 * dias a mais de contagem que o de cima, e a divisão inventaria uma perda que
 * é só calendário.
 */
export function degrau(
  de: EventoFunil,
  para: EventoFunil,
  antes: number,
  depois: number,
  desde: string,
): Degrau {
  const validoDesde = janelaValida([de, para]);
  const ressalvas = [de, para].map((e) => RESSALVAS[e]).filter((r): r is string => !!r);
  const base = { de, para, antes, depois, validoDesde, ressalvas };

  const comp = podeComparar(de, para);
  if (!comp.ok) return { ...base, taxa: null, motivo: comp.motivo };

  if (desde < validoDesde) {
    return {
      ...base,
      taxa: null,
      motivo: `a janela começa em ${desde}, mas os dois só são mensuráveis desde ${validoDesde}: a taxa mediria calendário, não comportamento`,
    };
  }
  if (antes <= 0) {
    return { ...base, taxa: null, motivo: "sem ninguém no degrau de cima: não existe taxa, e zero aqui é SEM MEDIÇÃO" };
  }
  return { ...base, taxa: Math.round((depois / antes) * 1000) / 10, motivo: null };
}

/**
 * A cadeia que o relatório publica. Repare no que ela NÃO é: uma fila única
 * de seis degraus. São dois trechos, porque no meio a natureza muda, e o
 * lugar certo de dizer isso é aqui, não numa nota de rodapé.
 */
export const CADEIA_SESSAO: EventoFunil[] = ["abriu_app", "viu_paywall"];
export const CADEIA_ATO: EventoFunil[] = ["cadastro", "iniciou_checkout", "assinou"];

/** Todos os degraus de uma cadeia, em ordem. */
export function degrausDaCadeia(
  cadeia: EventoFunil[],
  pessoasPorEvento: Map<EventoFunil, number>,
  desde: string,
): Degrau[] {
  return cadeia.slice(0, -1).map((de, i) => {
    const para = cadeia[i + 1];
    return degrau(de, para, pessoasPorEvento.get(de) ?? 0, pessoasPorEvento.get(para) ?? 0, desde);
  });
}
