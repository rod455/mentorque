// O relatório que sai da casa está inteiro e no formato combinado?
//
// POR QUE ISTO EXISTE (19/09/2026). O relatório semanal de mídia é a primeira
// entrega nossa que vai por e-mail, em PDF, para alguém de FORA da operação (o
// Luiz). Tudo o que os agentes escreviam até aqui era lido por quem já tem
// contexto. PDF que chega sozinho na caixa de outra pessoa não tem ninguém do
// lado para dizer "esse número é de semana passada" ou "isso aí é um traço de
// tabela que vazou".
//
// O caminho inteiro é: o agente grava o .md, roda `npm run relatorio:pdf`,
// commita os dois, e o fluxo do n8n às 10h de quinta anexa o PDF. Esta
// conferência cobre a parte que é nossa e que dá para conferir sem rede:
//
//   1. o contrato da primeira linha (é ele que separa relatório de hoje de
//      relatório velho, e é a trava que impede o Luiz de receber número velho)
//   2. a conversão de markdown para HTML nos casos que o manual promete
//   3. o arquivo de relatório do repositório passa por essa conversão inteiro
//
// Rode com: npm run conferir:relatorio
import { readFileSync, existsSync } from "node:fs";
import { dataDoRelatorio, corpoEmHtml, paginaDoRelatorio } from "../lib/relatorio/markdown.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Relatório de mídia: o que sai da casa está no formato combinado?");

// ── 1. a primeira linha, que é a trava contra mandar número velho ──────────
conferir("a data sai da primeira linha", dataDoRelatorio("Relatório de mídia gerado em 2026-09-19\n\n# oi") === "2026-09-19");
conferir("sem a linha, a data é nula", dataDoRelatorio("# Mídia da semana\n\nGastamos muito.") === null);
conferir(
  "data com formato torto não passa por data",
  dataDoRelatorio("Relatório de mídia gerado em 19/09/2026") === null,
  "se isto passar, o fluxo compara lixo com a data de hoje e manda relatório velho para fora",
);

// ── 2. a conversão, caso a caso ────────────────────────────────────────────
{
  const html = corpoEmHtml("## Um título\n\nUma frase **forte** com `código`.\n");
  conferir("título vira título", html.includes("<h2>Um título</h2>"));
  conferir("negrito vira negrito", html.includes("<strong>forte</strong>"));
  conferir("código vira código", html.includes("<code>código</code>"));
}
{
  // Quebra de linha do arquivo NÃO é quebra de parágrafo: o markdown daqui é
  // quebrado em 80 colunas e o PDF saía com buraco no meio da frase.
  const html = corpoEmHtml("Uma frase que continua\nna linha de baixo.\n\nOutra frase.\n");
  conferir(
    "linha quebrada continua o mesmo parágrafo",
    html === "<p>Uma frase que continua na linha de baixo.</p><p>Outra frase.</p>",
    html,
  );
}
{
  const html = corpoEmHtml("| a | b |\n|---|---|\n| 1 | 2 |\n");
  conferir("a tabela vira tabela", html.includes("<table>") && html.includes("<td>1</td>"));
  conferir("a primeira linha da tabela é cabeçalho", html.includes("<th>a</th>"));
  conferir(
    "a linha de tracinhos não vaza para dentro da tabela",
    !html.includes("---"),
    "o separador do markdown virando célula é o defeito que aparece na cara de quem recebe",
  );
}
{
  const html = corpoEmHtml("- primeiro\n- segundo\n");
  conferir("lista vira lista", html === "<ul><li>primeiro</li><li>segundo</li></ul>");
}
{
  // O texto do relatório é NOSSO, mas HTML solto dentro dele quebraria a
  // página inteira do PDF, e `<` aparece em qualquer comparação de número.
  const html = corpoEmHtml("Gasto < R$ 100 e uma <tag> qualquer.\n");
  conferir("sinal de menor é escapado", html.includes("&lt; R$ 100"), html);
  conferir("tag solta não vira tag", !html.includes("<tag>"), html);
}

// ── 3. o relatório de verdade do repositório ───────────────────────────────
{
  const caminho = new URL("../docs/agentes/relatorios/midia-ultimo.md", import.meta.url);
  conferir("o arquivo do relatório existe", existsSync(caminho), "é ele que o fluxo do n8n busca no raw do GitHub");
  if (existsSync(caminho)) {
    const texto = readFileSync(caminho, "utf8");
    conferir(
      "ele começa com a linha de data",
      dataDoRelatorio(texto) !== null,
      "sem essa linha o fluxo não manda para ninguém de fora, e o dono recebe aviso no lugar do relatório",
    );
    const pagina = paginaDoRelatorio(texto);
    conferir("a página tem a marca no topo", pagina.includes("Mentorque"));
    conferir("e o rodapé que diz de onde veio", pagina.includes("agente de Mídia paga"));
    conferir(
      "nada de marcação crua sobrou no corpo",
      !/<p>[^<]*(\*\*|^\s*#)/.test(pagina),
      "asterisco ou cerquilha dentro de parágrafo quer dizer que a conversão não entendeu a linha",
    );
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do relatório reprovaram.`);
  process.exit(1);
}
console.log("Relatório: a trava da data morde, a conversão cobre o que o manual promete, e o arquivo do repositório passa inteiro.");
