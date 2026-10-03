// Os relatórios do Play Console que moram no Cloud Storage.
//
// POR QUE ISTO EXISTE (03/10/2026). O degrau mais importante da escada de
// aquisição, a instalação TOTAL do Android, não estava em coletor nenhum. O
// `play_console` que a casa tinha fala com a API de Reporting, que só entrega
// vitals, e mesmo isso ela nunca entregou (35 dias, 33 pacotes vazios). A
// instalação vive em outro lugar: num bucket de relatórios mensais em CSV.
//
// O dono passou os endereços em 03/10:
//   gs://pubsite_prod_6201974234817249283/stats/installs/
//   gs://pubsite_prod_6201974234817249283/stats/store_performance/
//
// DUAS ARMADILHAS CONHECIDAS DESTE FORMATO, e as duas quebram calado:
//
//   1. **o arquivo é UTF-16**, com marca de ordem de bytes. Lido como UTF-8, o
//      cabeçalho vira uma sopa com um byte nulo entre cada letra, nenhuma
//      coluna é encontrada, e um leitor ingênuo devolve zero linha com cara de
//      "mês sem instalação";
//   2. **o cabeçalho vem no idioma da conta.** O mesmo relatório sai em
//      português ou em inglês dependendo de quem baixou, então procurar o nome
//      exato da coluna funciona hoje e some amanhã.
//
// A REGRA DESTE ARQUIVO: formato que eu não reconheço NÃO vira zero. Vira
// `formatoDesconhecido` com o cabeçalho que chegou, para a próxima rodada ter o
// que ler. Zero é resposta; "não entendi o arquivo" é outra.

/** Tira a marca de ordem de bytes e converte UTF-16 para texto legível. */
export function destextoUtf16(bruto: string): string {
  if (!bruto) return "";
  // Marca de ordem de bytes do UTF-16, nas duas ordens, já decodificada.
  let t = bruto.replace(/^﻿/, "").replace(/^￾/, "");
  // O sintoma de UTF-16 lido como byte: um nulo entre cada letra.
  if (t.includes("\u0000")) t = t.replace(/\u0000/g, "");
  return t;
}

/** Lê uma linha de CSV respeitando aspas. */
export function colunasDoCsv(linha: string): string[] {
  const saida: string[] = [];
  let atual = "";
  let aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      if (aspas && linha[i + 1] === '"') { atual += '"'; i++; } else { aspas = !aspas; }
    } else if (c === "," && !aspas) { saida.push(atual); atual = ""; } else { atual += c; }
  }
  saida.push(atual);
  return saida.map((s) => s.trim());
}

/**
 * Acha a coluna por QUALQUER um dos nomes possíveis, sem diferenciar
 * maiúscula, acento ou idioma. Procurar o nome exato e em uma língua só é como
 * este formato quebra no dia em que alguém troca o idioma da conta.
 */
export function achaColuna(cabecalho: string[], nomes: string[]): number {
  const limpo = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const alvos = nomes.map(limpo);
  return cabecalho.findIndex((c) => alvos.some((a) => limpo(c).includes(a)));
}

export type DiaDeInstalacao = { dia: string; instalacoes: number | null; desinstalacoes: number | null };

export type LeituraDeInstalacoes =
  | { ok: true; dias: DiaDeInstalacao[]; total: number; de: string; ate: string }
  | { ok: false; formatoDesconhecido: string; cabecalho: string[] };

/**
 * O relatório `installs ... overview`: uma linha por dia.
 *
 * O numero que interessa e a instalacao por DISPOSITIVO, nao por usuario: a
 * escada compara com a AppsFlyer, que conta aparelho.
 */
export function leInstalacoes(bruto: string | null | undefined): LeituraDeInstalacoes {
  const texto = destextoUtf16(typeof bruto === "string" ? bruto : "");
  const linhas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length === 0) return { ok: false, formatoDesconhecido: "arquivo vazio", cabecalho: [] };

  const cabecalho = colunasDoCsv(linhas[0]!);
  const iDia = achaColuna(cabecalho, ["date", "data"]);
  const iInst = achaColuna(cabecalho, ["daily device installs", "instalacoes diarias de dispositivos", "device installs"]);
  const iDesinst = achaColuna(cabecalho, ["daily device uninstalls", "desinstalacoes diarias de dispositivos", "device uninstalls"]);
  if (iDia < 0 || iInst < 0) {
    return {
      ok: false,
      formatoDesconhecido: "nao achei a coluna de data ou a de instalacoes por dispositivo",
      cabecalho,
    };
  }

  const num = (v: string | undefined): number | null => {
    if (v === undefined) return null;
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  };

  const dias: DiaDeInstalacao[] = [];
  for (const l of linhas.slice(1)) {
    const c = colunasDoCsv(l);
    const dia = (c[iDia] ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) continue;
    dias.push({
      dia,
      instalacoes: num(c[iInst]),
      desinstalacoes: iDesinst >= 0 ? num(c[iDesinst]) : null,
    });
  }
  if (dias.length === 0) {
    return { ok: false, formatoDesconhecido: "cabecalho reconhecido, mas nenhuma linha com data valida", cabecalho };
  }
  const ordenado = [...dias].sort((a, b) => a.dia.localeCompare(b.dia));
  return {
    ok: true,
    dias: ordenado,
    total: ordenado.reduce((s, d) => s + (d.instalacoes ?? 0), 0),
    de: ordenado[0]!.dia,
    ate: ordenado[ordenado.length - 1]!.dia,
  };
}

/**
 * Escolhe o arquivo mais novo de uma listagem do bucket.
 *
 * Os relatorios sao MENSAIS e o nome carrega o ano e o mes (`..._202610_...`).
 * Pegar "o ultimo da lista" e confiar numa ordem que a API nao promete.
 */
export function arquivoMaisNovo(nomes: string[], sufixo: string): string | null {
  const candidatos = nomes
    .filter((n) => n.endsWith(sufixo))
    .map((n) => ({ nome: n, mes: (n.match(/_(\d{6})_/) ?? [])[1] ?? "" }))
    .filter((c) => c.mes)
    .sort((a, b) => b.mes.localeCompare(a.mes));
  return candidatos[0]?.nome ?? null;
}
