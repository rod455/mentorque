// O relatório de parceiros da AppsFlyer, lido de verdade.
//
// POR QUE ISTO EXISTE (03/10/2026). Até hoje a AppsFlyer era via de mão única:
// o app MANDAVA instalação para ela (`lib/app/atribuicao.ts`) e ninguém lia de
// volta. A pergunta "qual campanha trouxe a conta" custou uma noite de prints
// de painel, e ela é semanal.
//
// POR QUE A REGRA MORA AQUI, E NÃO NUM NÓ DE CÓDIGO DO n8n. O coletor precisa
// de um lugar que a `npm run conferir` alcance. Nó de código do n8n não é
// conferido por nada, e o que este arquivo faz (ler CSV com vírgula dentro de
// campo, somar por fonte, e carregar o aviso do zero estrutural) é exatamente
// o tipo de coisa que quebra em silêncio. O n8n faz o que ele faz bem: busca o
// arquivo e entrega.
//
// O AVISO QUE VIAJA COM O NÚMERO, e ele não é enfeite: o Google Ads é rede
// autoatribuída. A AppsFlyer só enxerga instalação dele depois que a integração
// é ligada no console dela. Enquanto não for, as instalações do Google caem
// dentro de `Organic`, e um leitor desavisado lê "o Google não trouxe ninguém"
// onde o dado diz "ninguém perguntou". É o quinto zero estrutural desta casa, e
// por isso o aviso é CAMPO do pacote, não comentário de código.

/** Uma linha do relatório, já lida. */
export type LinhaDeParceiro = {
  fonte: string;
  campanha: string | null;
  instalacoes: number;
  sessoes: number;
  leais: number;
  /** Só existe quando a integração de custo está ligada no console. */
  custo: number | null;
};

export type LeituraDeParceiros = {
  linhas: LinhaDeParceiro[];
  instalacoes: number;
  organicas: number;
  pagas: number;
  /** Fontes pagas que a AppsFlyer conhece, em ordem de instalação. */
  fontesPagas: string[];
  /** `true` quando nenhuma linha trouxe custo: integração de custo desligada. */
  semCusto: boolean;
};

// LIMITE CONHECIDO DO TRANSPORTE (03/10/2026): o CSV chega pelo n8n como texto
// e o acento se perde no caminho. Na primeira coleta real, "Lançamento
// Mentorque" foi gravado como "Lan?amento Mentorque". Os NÚMEROS não são
// afetados (eles são ASCII), e o nome da campanha é rótulo, não chave. Fica
// dito porque no dia em que alguém agrupar por nome de campanha, duas grafias
// da mesma campanha viram duas linhas.

/** O rótulo que a AppsFlyer usa para o que ela não atribuiu a ninguém. */
export const FONTE_ORGANICA = "Organic";

/**
 * Lê uma linha de CSV respeitando aspas.
 *
 * `Lançamento, Mentorque` num campo entre aspas vira UM campo. Fazer
 * `split(",")` aqui é o defeito clássico: ele desloca todas as colunas à
 * direita e o número de instalações passa a vir da coluna errada, com cara de
 * número certo.
 */
export function colunas(linha: string): string[] {
  const saida: string[] = [];
  let atual = "";
  let dentroDeAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      // Aspas dobradas dentro de campo entre aspas são uma aspa literal.
      if (dentroDeAspas && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else {
        dentroDeAspas = !dentroDeAspas;
      }
    } else if (c === "," && !dentroDeAspas) {
      saida.push(atual);
      atual = "";
    } else {
      atual += c;
    }
  }
  saida.push(atual);
  return saida.map((s) => s.trim());
}

/**
 * Número da AppsFlyer, que escreve `N/A` para "não sei".
 *
 * `N/A` tem que virar `null` e NÃO zero, pela mesma regra do valor da fatura em
 * `lib/ciclo.ts`: zero é resposta (não gastou) e ausente é "não deu para
 * saber". Juntar os dois faria o custo sumir com cara de campanha grátis.
 */
export function numero(bruto: string | undefined): number | null {
  if (bruto === undefined) return null;
  const t = bruto.trim();
  if (!t || t === "N/A" || t === "-") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Acha a coluna pelo começo do cabeçalho, que é estável; o resto não é. */
function indiceDe(cabecalho: string[], comeco: string): number {
  return cabecalho.findIndex((c) => c.toLowerCase().startsWith(comeco.toLowerCase()));
}

/**
 * Lê o CSV do relatório de parceiros (partners_report).
 *
 * Devolve `null` quando o conteúdo não é aquele relatório, e isso é de
 * propósito: a Pull API responde 200 com texto de erro em alguns casos, e
 * tratar texto de erro como "zero instalação" seria inventar um número.
 */
export function leParceiros(csv: string | null | undefined): LeituraDeParceiros | null {
  if (typeof csv !== "string") return null;
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length === 0) return null;

  const cabecalho = colunas(linhas[0]!);
  const iFonte = indiceDe(cabecalho, "Media Source");
  const iCampanha = indiceDe(cabecalho, "Campaign");
  const iInstalacoes = indiceDe(cabecalho, "Installs");
  if (iFonte < 0 || iInstalacoes < 0) return null;
  const iSessoes = indiceDe(cabecalho, "Sessions");
  const iLeais = indiceDe(cabecalho, "Loyal Users");
  const iCusto = indiceDe(cabecalho, "Total Cost");

  const lidas: LinhaDeParceiro[] = [];
  for (const bruta of linhas.slice(1)) {
    const c = colunas(bruta);
    const fonte = (c[iFonte] ?? "").trim();
    if (!fonte) continue;
    const campanha = iCampanha >= 0 ? (c[iCampanha] ?? "").trim() : "";
    lidas.push({
      fonte,
      campanha: campanha && campanha !== "None" ? campanha : null,
      instalacoes: numero(c[iInstalacoes]) ?? 0,
      sessoes: iSessoes >= 0 ? (numero(c[iSessoes]) ?? 0) : 0,
      leais: iLeais >= 0 ? (numero(c[iLeais]) ?? 0) : 0,
      custo: iCusto >= 0 ? numero(c[iCusto]) : null,
    });
  }

  const organicas = lidas.filter((l) => l.fonte === FONTE_ORGANICA).reduce((s, l) => s + l.instalacoes, 0);
  const pagas = lidas.filter((l) => l.fonte !== FONTE_ORGANICA).reduce((s, l) => s + l.instalacoes, 0);
  const fontesPagas = [...new Set(lidas.filter((l) => l.fonte !== FONTE_ORGANICA).map((l) => l.fonte))];

  return {
    linhas: lidas,
    instalacoes: organicas + pagas,
    organicas,
    pagas,
    fontesPagas,
    // `every` sobre lista vazia é `true`, e aí "sem linha nenhuma" viraria
    // "custo desligado". São coisas diferentes: sem linha não há o que dizer.
    semCusto: lidas.length > 0 && lidas.every((l) => l.custo === null),
  };
}

/** O pacote que vai para `metricas_diarias`, com os avisos dentro. */
export type PacoteDaAppsFlyer = {
  janela: { de: string; ate: string };
  android: LeituraDeParceiros | null;
  ios: LeituraDeParceiros | null;
  instalacoes: number;
  organicas: number;
  pagas: number;
  fontesPagas: string[];
  avisos: string[];
};

/** O que precisa estar ligado no console para o número significar o que parece. */
export const AVISO_GOOGLE =
  "Google Ads nao aparece como fonte: rede autoatribuida sem integracao ligada no console da AppsFlyer. " +
  "As instalacoes dele caem dentro de Organic. ZERO aqui significa NAO PERGUNTADO, nunca 'nao trouxe ninguem'.";

export const AVISO_CUSTO =
  "Custo vazio em todas as linhas: integracao de custo desligada no console. " +
  "O custo por instalacao tem que ser calculado com o gasto dos paineis de anuncio.";

export const AVISO_SDK =
  "A AppsFlyer conta por baixo: em 22/09/2026 foram medidos 25% dos aparelhos Android da 2.7.0 que nunca " +
  "subiram o SDK. Use proporcao entre fontes, nao total absoluto.";

export function montaPacote(
  janela: { de: string; ate: string },
  android: LeituraDeParceiros | null,
  ios: LeituraDeParceiros | null,
): PacoteDaAppsFlyer {
  const vivos = [android, ios].filter((x): x is LeituraDeParceiros => x !== null);
  const fontesPagas = [...new Set(vivos.flatMap((v) => v.fontesPagas))];
  const avisos: string[] = [AVISO_SDK];

  // O aviso do Google entra quando ele NAO esta na lista, que e o estado de
  // hoje. No dia em que a integracao for ligada, o aviso some sozinho, e some
  // porque o dado mudou, nao porque alguem lembrou de apagar a frase.
  if (!fontesPagas.some((f) => /google/i.test(f))) avisos.push(AVISO_GOOGLE);
  if (vivos.length > 0 && vivos.every((v) => v.semCusto)) avisos.push(AVISO_CUSTO);
  if (android === null) avisos.push("Relatorio do Android nao foi lido nesta coleta.");
  if (ios === null) avisos.push("Relatorio do iPhone nao foi lido nesta coleta.");

  return {
    janela,
    android,
    ios,
    instalacoes: vivos.reduce((s, v) => s + v.instalacoes, 0),
    organicas: vivos.reduce((s, v) => s + v.organicas, 0),
    pagas: vivos.reduce((s, v) => s + v.pagas, 0),
    fontesPagas,
    avisos,
  };
}
