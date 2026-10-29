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
      ? `Ativacao, coorte ${c.coorte}: ${c.ativados_7d} de ${c.cadastrados} fizeram algo de valor alem do carro em 7 dias (regua de 17/10, comparavel desde a coorte de 28/09)`
      : `Ativacao, coorte ${c.coorte}: AINDA NAO DA PARA LER (a janela fecha em ${maisDias(c.coorte, FECHA_D1_7)}; hoje sao ${c.ativados_7d} de ${c.cadastrados}, PISO)`,
    legivel: fechada,
    motivo: fechada ? "" : `a janela de 7 dias fecha em ${maisDias(c.coorte, FECHA_D1_7)}`,
  };
}

/**
 * A linha da RECEITA DE ANÚNCIO.
 *
 * POR QUE ELA EXISTE (14/10/2026). Em 07/10 o QA achou, aplicando a regra do
 * dono ("antes de publicar um zero, pergunte quem escreve aquele número"), que
 * o retrato publicava `AdMob 7d: 0.00 USD de receita de anuncio` enquanto o
 * pacote bruto do próprio coletor trazia `porDia: []` e a nota "sem linhas do
 * app do Mentorque no periodo". O coletor é honesto; a frase impressa perdia a
 * ressalva no caminho e afirmava zero medido onde não houve medição.
 *
 * A ironia é que o `play_console`, no MESMO retrato, trata a situação idêntica
 * do jeito certo e diz com todas as letras "NAO E ZERO MEDIDO". Duas fontes, a
 * mesma ausência, dois tratamentos.
 *
 * Foi recomendado em 07/10 e continuava igual em 14/10, uma semana depois. O
 * conserto do renderizador é do Analista e mora no n8n, mas a frase pronta é
 * nossa, pelo mesmo caminho que a de coorte tomou em 28/09: ela nasce aqui,
 * sai por `/api/dados`, a conferência cobra, e o painel só imprime.
 *
 * A DIFERENÇA QUE ELA GUARDA: zero com linhas é receita medida de R$ 0,00
 * (anúncio servido e ninguém clicou, resposta legítima); zero SEM linhas é
 * "a fonte não publicou nada no período", que não é resultado. Juntar as duas
 * é o mesmo erro que fazia cupom de 100% virar receita sumida.
 */
export function linhaDeAnuncio(a: {
  /** Ganhos da janela, na moeda do pacote. */
  ganhos7d?: number | null;
  moeda?: string | null;
  /** Quantas linhas por dia a fonte devolveu. Vazio = não publicou nada. */
  porDia?: unknown[] | null;
  /** A nota que o coletor escreve quando sabe que não houve linha. */
  nota?: string | null;
}): LinhaDoRetrato {
  const moeda = String(a.moeda ?? "USD").toUpperCase();
  const linhas = Array.isArray(a.porDia) ? a.porDia.length : 0;
  // `typeof number` e não `Number(...)`: `Number(null)` é 0, e campo ausente
  // virando zero medido é a confusão que esta função existe para impedir.
  const temNumero = typeof a.ganhos7d === "number" && Number.isFinite(a.ganhos7d);

  if (linhas === 0) {
    const nota = (a.nota ?? "").trim();
    return {
      texto:
        `AdMob 7d: NAO E ZERO MEDIDO (a fonte nao publicou linha nenhuma no periodo` +
        `${nota ? `: ${nota}` : ""})`,
      legivel: false,
      motivo: nota || "a fonte nao devolveu linha nenhuma no periodo",
    };
  }
  if (!temNumero) {
    return {
      texto: `AdMob 7d: NAO DA PARA LER (a fonte devolveu ${linhas} dia(s) e nenhum valor de ganho)`,
      legivel: false,
      motivo: "a fonte devolveu dias sem o campo de ganho",
    };
  }
  return {
    texto: `AdMob 7d: ${a.ganhos7d!.toFixed(2)} ${moeda} de receita de anuncio (${linhas} dia(s) com linha)`,
    legivel: true,
    motivo: "",
  };
}

/**
 * A linha do VITALS DO PLAY (crash e ANR do processo nativo).
 *
 * POR QUE ELA EXISTE (28/10/2026, varredura do QA). Este é o ÚNICO instrumento
 * da casa que mede o processo nativo do Android: a migalha de fechamento mede o
 * JavaScript, e quando o app morre o JavaScript morre junto. E ele passou por
 * três estados sem o retrato dizer uma palavra sobre nenhum, porque a linha
 * legível nunca existiu e o dado só vivia no JSON bruto:
 *
 *   · de 22/08 a 17/10, SUPRIMIDO: o Play não publica vitals abaixo de um
 *     mínimo de usuários distintos, e ninguém via isso;
 *   · em 18, 19 e 20/10, VIVO, com dado de verdade (crashRate 0 em 50, 70 e 60
 *     usuários distintos nos dias 13, 14 e 15/10). Três dias de dado novo, o
 *     primeiro da história do app, e ninguém leu;
 *   · desde 21/10, ERRO: "Bad request - please check your parameters". Oito dias
 *     quebrado sem ninguém notar.
 *
 * Os três são invisíveis pelo mesmo motivo, e é o motivo que esta função
 * remove. Mesma estrada da linha de coorte (28/09) e da do AdMob (14/10): a
 * frase nasce aqui, sai por `/api/dados`, a conferência cobra, e o painel só
 * imprime.
 *
 * E A DATA DA LINHA VIAJA JUNTO, que é a parte fácil de errar: a API do Play
 * atrasa de três a cinco dias, então o pacote coletado em 20/10 traz o dia
 * 15/10. Publicar o número sem a data dele faria o leitor achar que é de hoje.
 */
export type VitalsDoPlay = {
  crash?: { estado?: string | null; motivo?: string | null; linhas?: number | null } | null;
  anr?: { estado?: string | null; motivo?: string | null; linhas?: number | null } | null;
  crashPorDia?: { dia?: string | null; metricas?: { crashRate?: number | null; distinctUsers?: number | null } | null }[] | null;
  nota?: string | null;
};

export function linhaDeVitals(v: VitalsDoPlay): LinhaDoRetrato {
  const estado = String(v.crash?.estado ?? "").trim();
  const motivo = String(v.crash?.motivo ?? "").trim();

  // ERRO é diferente de SUPRIMIDO, e confundir os dois é o que deixou o coletor
  // oito dias quebrado: "o Play não publica para nós" soa definitivo e vira
  // paisagem, enquanto "a nossa requisição está malformada" é conserto nosso.
  if (estado === "erro") {
    return {
      texto: `Vitals do Play: COLETOR FALHANDO${motivo ? ` (${motivo})` : ""}. Nao e supressao do Play, e erro da nossa requisicao.`,
      legivel: false,
      motivo: motivo || "o coletor devolveu erro",
    };
  }

  const dias = Array.isArray(v.crashPorDia) ? v.crashPorDia : [];
  if (estado !== "ok" || dias.length === 0) {
    const nota = String(v.nota ?? "").trim();
    return {
      texto:
        "Vitals do Play: NAO E ZERO MEDIDO (o Play nao publicou vitals no periodo; ele suprime abaixo de um minimo de usuarios distintos)" +
        `${nota ? `: ${nota}` : ""}`,
      legivel: false,
      motivo: nota || "o Play nao publicou vitals no periodo",
    };
  }

  // A linha mais recente, pela data, e não a última do array: ordem de array é
  // promessa de quem montou, e já mordeu esta casa em 04/10 na leitura do Play.
  const comData = dias.filter((d) => typeof d?.dia === "string" && d.dia);
  if (comData.length === 0) {
    return {
      texto: "Vitals do Play: NAO DA PARA LER (o coletor trouxe linhas sem data)",
      legivel: false,
      motivo: "linhas sem data",
    };
  }
  const maisNova = comData.reduce((a, b) => (String(a.dia) >= String(b.dia) ? a : b));
  const taxa = maisNova.metricas?.crashRate;
  const usuarios = maisNova.metricas?.distinctUsers;
  // `typeof number` e não `Number(...)`: campo ausente virando zero medido é a
  // confusão que esta família de funções existe para impedir.
  if (typeof taxa !== "number" || !Number.isFinite(taxa)) {
    return {
      texto: `Vitals do Play: NAO DA PARA LER (a linha de ${maisNova.dia} veio sem taxa de crash)`,
      legivel: false,
      motivo: "linha sem taxa de crash",
    };
  }
  const quantos = typeof usuarios === "number" && Number.isFinite(usuarios) ? `${usuarios} usuarios distintos` : "usuarios distintos nao informados";
  return {
    texto:
      `Vitals do Play, dia ${maisNova.dia} (a API atrasa de 3 a 5 dias, NAO e hoje): ` +
      `crash em ${taxa}% dos ${quantos}. Mede o processo NATIVO, nao a migalha de fechamento.`,
    legivel: true,
    motivo: "",
  };
}
