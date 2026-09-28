// O que pode e o que NÃO pode ser lido no retrato diário.
//
// POR QUE ISTO EXISTE (28/09/2026), e a frase é do dono: "estamos a mais de um
// mês medindo semana a semana e até hoje temos partes que não estão mensuradas
// corretamente".
//
// Ele está certo, e a causa não é descuido de quem escreve. É que o retrato
// publica NÚMERO onde deveria publicar "ainda não dá para ler", e número com
// cara de resultado é lido como resultado. A história inteira em cinco dias:
//
//   23/09  o QA provou pelo histórico do git que duas medidas do retrato não
//          podiam ser lidas, e consertou NA FONTE: as views de coorte ganharam
//          `semana_fechada`, `janela_fechada`, `d1_7_fechada` e `d8_30_fechada`;
//   25/09  dois dias depois, o CRO escreveu "coorte de 14/09 FECHADA, zero
//          voltando em 1 a 7 dias". A `d1_7_fechada` daquela coorte era FALSE;
//   28/09  o relatório do Diretor abriu com "a última coorte fechada voltou
//          ZERO", e a régua de retenção virou a métrica da operação em cima
//          disso.
//
// As colunas existiam nos três dias. O que faltou foi elas chegarem a quem lê:
// o retrato imprime as quatro coortes exatamente iguais, sem dizer qual está
// madura. **Conserto na fonte que não muda o consumidor não é conserto**, e
// esta casa aprendeu isso três vezes na mesma semana.
//
// A REGRA QUE FICA: quando uma janela não fechou, o lugar do número é ocupado
// pelo MOTIVO, não por um zero. Zero é uma afirmação sobre o mundo; "a janela
// fecha em 14/10" é uma afirmação sobre a nossa medição, e só a segunda é
// verdade hoje. Quem quiser o número cru continua tendo: ele viaja ao lado,
// marcado como piso.
//
// Puro de propósito, sem nenhuma dependência: `npm run conferir:legivel` abre
// isto no node e planta defeito. A montagem do TEXTO do retrato mora no n8n;
// o que esta casa controla é o que sai por `/api/dados`, e é aqui.

/** Uma linha do retrato: a frase pronta, e se ela é resultado ou piso. */
export type LinhaDoRetrato = {
  /** A frase pronta para o retrato imprimir, já com a ressalva dentro. */
  texto: string;
  /** Falso quando alguma janela da linha ainda não fechou. */
  legivel: boolean;
  /** Por que não dá para ler, quando não dá. Vazio quando dá. */
  motivo: string;
};

/** Soma dias a uma data ISO (yyyy-mm-dd), sem fuso no meio. */
export function maisDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(a, (m ?? 1) - 1, d ?? 1) + dias * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

// AS CONTAS DAS JANELAS, e elas são do QA (23/09/2026), não minhas.
//
// A semana da coorte fecha em coorte+7. A janela de 7 dias de CADA PESSOA
// fecha em coorte+14, porque a última pessoa entra em coorte+6 e o filtro é
// `< cadastrado_em + 8 days`. A de 8 a 30 fecha em coorte+37.
export const FECHA_SEMANA = 7;
export const FECHA_D1_7 = 14;
export const FECHA_D8_30 = 37;

/**
 * A linha de RETENÇÃO de uma coorte.
 *
 * Em 28/09 as quatro coortes do retrato tinham `d8_30_fechada = false`, e as
 * quatro apareciam com "0 em 8 a 30 dias". Quatro zeros que não medem nada,
 * publicados com a mesma cara de quatro zeros que mediriam.
 */
export function linhaDeRetencao(c: {
  coorte: string;
  cadastrados: number;
  voltaram_d1_7: number;
  voltaram_d8_30: number;
  d1_7_fechada?: boolean | null;
  d8_30_fechada?: boolean | null;
}): LinhaDoRetrato {
  const abertas: string[] = [];
  const d1 = c.d1_7_fechada === true
    ? `${c.voltaram_d1_7} voltaram em 1 a 7 dias`
    : `1 a 7 dias AINDA NAO DA PARA LER (fecha em ${maisDias(c.coorte, FECHA_D1_7)}; hoje sao ${c.voltaram_d1_7}, PISO)`;
  if (c.d1_7_fechada !== true) abertas.push("1 a 7 dias");

  const d2 = c.d8_30_fechada === true
    ? `${c.voltaram_d8_30} em 8 a 30 dias`
    : `8 a 30 dias AINDA NAO DA PARA LER (fecha em ${maisDias(c.coorte, FECHA_D8_30)}; hoje sao ${c.voltaram_d8_30}, PISO)`;
  if (c.d8_30_fechada !== true) abertas.push("8 a 30 dias");

  return {
    texto: `Retencao, coorte ${c.coorte}: ${c.cadastrados} cadastrados, ${d1}, ${d2}`,
    legivel: abertas.length === 0,
    motivo: abertas.length ? `janela(s) em aberto: ${abertas.join(" e ")}` : "",
  };
}

/**
 * A linha de ATIVAÇÃO de uma coorte.
 *
 * Mesmo caso: em 28/09 a coorte de 21/09 saía como "2 de 51", com a janela
 * aberta, ao lado de "6 de 11" da coorte de 07/09, que está fechada. Lidas
 * juntas, sugerem uma queda de 55% para 4%. A primeira não é uma taxa.
 */
export function linhaDeAtivacao(c: {
  coorte: string;
  cadastrados: number;
  ativados_7d: number;
  janela_fechada?: boolean | null;
}): LinhaDoRetrato {
  const fechada = c.janela_fechada === true;
  return {
    texto: fechada
      ? `Ativacao, coorte ${c.coorte}: ${c.ativados_7d} de ${c.cadastrados} fizeram a primeira acao de valor em 7 dias`
      : `Ativacao, coorte ${c.coorte}: AINDA NAO DA PARA LER (a janela fecha em ${maisDias(c.coorte, FECHA_D1_7)}; hoje sao ${c.ativados_7d} de ${c.cadastrados}, PISO)`,
    legivel: fechada,
    motivo: fechada ? "" : `a janela de 7 dias fecha em ${maisDias(c.coorte, FECHA_D1_7)}`,
  };
}
