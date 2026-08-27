// Gera o PDF de revisão das perguntas do quiz.
//
//   npm run quiz:pdf
//
// A fonte é sempre lib/app/quiz/perguntas.ts, nunca o markdown: documento e
// código que se copiam um do outro acabam discordando, e a revisão perde o
// sentido no dia em que o revisor aprova um texto que o app não usa.
//
// Sai em duas seções, PT e EN, com a resposta certa destacada e a explicação
// inteira, que é o que precisa ser conferido de fato.
// O Playwright NÃO é dependência do projeto: ele arrasta um navegador inteiro,
// e isso não se paga num script que roda de vez em quando. Quando ele não está
// presente, o script grava o HTML e explica como imprimir — a revisão não pode
// depender de instalar nada.
//   npx playwright@latest install-deps  (só se for gerar o PDF por aqui)
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { perguntasDoQuiz, type Pergunta } from "../lib/app/quiz/perguntas.ts";

const SAIDA = process.argv[2] ?? "docs/quiz-perguntas.pdf";

const escapar = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function bloco(p: Pergunta, n: number): string {
  const opcoes = p.opcoes
    .map((o, i) => {
      const certa = i === p.correta;
      return `<li class="${certa ? "certa" : ""}">
        <span class="marca">${certa ? "✓" : String.fromCharCode(65 + i)}</span>
        <span>${escapar(o)}</span>
      </li>`;
    })
    .join("");

  return `<article>
    <h3><span class="num">${n}</span>${escapar(p.pergunta)}</h3>
    <ul class="opcoes">${opcoes}</ul>
    <p class="porque"><b>Por que:</b> ${escapar(p.porque)}</p>
    <p class="meta">id <code>${escapar(p.id)}</code> · aula <code>${escapar(p.aula)}</code></p>
  </article>`;
}

function secao(titulo: string, perguntas: Pergunta[]): string {
  return `<section>
    <h2>${escapar(titulo)}</h2>
    ${perguntas.map((p, i) => bloco(p, i + 1)).join("")}
  </section>`;
}

const pt = perguntasDoQuiz("pt");
const en = perguntasDoQuiz("en");

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Perguntas do quiz diário</title>
<style>
  @page { size: A4; margin: 18mm 16mm 16mm; }
  * { box-sizing: border-box; }
  body { font: 10.5pt/1.5 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1a1a1c; margin: 0; }
  h1 { font-size: 21pt; margin: 0 0 2mm; letter-spacing: -0.01em; }
  .sub { color: #6b6b70; font-size: 9.5pt; margin: 0 0 6mm; }
  .regras { background: #f6f6f4; border-left: 3px solid #f2a623; padding: 4mm 5mm; margin: 0 0 8mm; border-radius: 0 4px 4px 0; }
  .regras h4 { margin: 0 0 2mm; font-size: 10pt; }
  .regras ol { margin: 0; padding-left: 5mm; color: #43434a; }
  .regras li { margin: 0.8mm 0; }
  h2 { font-size: 13pt; margin: 8mm 0 4mm; padding-bottom: 1.5mm; border-bottom: 1.5px solid #e3e3e0; }
  article { break-inside: avoid; page-break-inside: avoid; margin: 0 0 6mm; padding-bottom: 4mm; border-bottom: 1px solid #ededea; }
  h3 { font-size: 11.5pt; margin: 0 0 2.5mm; font-weight: 650; display: flex; gap: 3mm; align-items: baseline; }
  .num { display: inline-block; min-width: 7mm; color: #b07a12; font-variant-numeric: tabular-nums; }
  .opcoes { list-style: none; margin: 0 0 3mm; padding: 0 0 0 10mm; }
  .opcoes li { display: flex; gap: 2.5mm; align-items: baseline; margin: 1.2mm 0; color: #55555c; }
  .opcoes li.certa { color: #14532d; font-weight: 650; }
  .marca { display: inline-grid; place-items: center; width: 4.6mm; height: 4.6mm; border-radius: 50%;
           background: #e8e8e4; color: #75757c; font-size: 7.5pt; font-weight: 700; flex: 0 0 auto; }
  .certa .marca { background: #16a34a; color: #fff; }
  .porque { margin: 0 0 1.5mm 10mm; color: #2e2e33; }
  .porque b { color: #1a1a1c; }
  .meta { margin: 0 0 0 10mm; font-size: 8pt; color: #9a9aa0; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8pt; }
</style></head>
<body>
  <h1>Perguntas do quiz diário</h1>
  <p class="sub">Mentorque · ${pt.length} perguntas · gerado a partir de <code>lib/app/quiz/perguntas.ts</code></p>

  <div class="regras">
    <h4>Como revisar</h4>
    <ol>
      <li>O que mais importa: a opção marcada em verde está mesmo certa?</li>
      <li>A explicação promete demais? (nada de número inventado ou economia garantida)</li>
      <li>A explicação faz sentido sozinha, para quem errou e não vai abrir a aula?</li>
      <li>Marque o número da pergunta e o que mudar. A ordem importa: é a ordem em que elas saem, e a nº 1 é a que aparece dentro do onboarding.</li>
    </ol>
  </div>

  ${secao(`Português (${pt.length})`, pt)}
  ${secao(`Inglês (${en.length})`, en)}
</body></html>`;

const tmp = SAIDA.replace(/\.pdf$/, ".html");
writeFileSync(tmp, html, "utf8");

// O markdown sai do MESMO lugar, e é por isso que ele existe aqui embaixo em
// vez de ser mantido à mão.
//
// Ele já ficou parado uma vez: o banco mudou, o .md não, e o arquivo passou a
// contradizer o app enquanto o próprio cabeçalho dele prometia ser fiel ao
// código. Documento de revisão que discorda do que o app faz é pior que
// documento nenhum, porque o revisor aprova um texto que ninguém vai ver.
function markdown(): string {
  const bloco = (p: Pergunta, n: number) =>
    [
      `### ${n}. ${p.pergunta}`,
      "",
      ...p.opcoes.map((o, i) => `- ${i === p.correta ? "**✓**" : `${String.fromCharCode(65 + i)})`} ${o}`),
      "",
      `**Por que:** ${p.porque}`,
      "",
      `<sub>id \`${p.id}\` · aula \`${p.aula}\`</sub>`,
      "",
    ].join("\n");

  return [
    "# Perguntas do quiz diário",
    "",
    "Gerado por `npm run quiz:pdf` a partir de `lib/app/quiz/perguntas.ts`.",
    "**Não edite este arquivo**: o que vale é o código, e a próxima geração",
    "apaga qualquer correção feita aqui.",
    "",
    "**Como revisar:** o que mais importa não é o estilo, é se a resposta",
    "marcada como correta está certa e se a explicação não promete demais.",
    "Cite o `id` da pergunta, e não o número: o número muda quando alguma é",
    "removida, o id não.",
    "",
    `## Português (${pt.length})`,
    "",
    ...pt.map((p, i) => bloco(p, i + 1)),
    `## Inglês (${en.length})`,
    "",
    ...en.map((p, i) => bloco(p, i + 1)),
  ].join("\n");
}

writeFileSync(SAIDA.replace(/\.pdf$/, ".md"), markdown(), "utf8");

// Tipo mínimo escrito à mão, e não `typeof import("playwright")`: o pacote não
// está instalado, então referenciar os tipos dele quebraria o `tsc --noEmit`
// do projeto inteiro por causa de um script auxiliar. O `import()` fica numa
// variável para o compilador não tentar resolver o módulo.
type Navegador = {
  launch: (o: { executablePath?: string }) => Promise<{
    newPage: () => Promise<{
      goto: (url: string, o?: { waitUntil?: string }) => Promise<unknown>;
      pdf: (o: Record<string, unknown>) => Promise<unknown>;
    }>;
    close: () => Promise<void>;
  }>;
};

let chromium: Navegador;
try {
  const pacote = "playwright";
  ({ chromium } = (await import(pacote)) as { chromium: Navegador });
} catch {
  console.log(`HTML gerado: ${tmp}`);
  console.log("Playwright não instalado — abra o HTML no navegador e use Imprimir → Salvar como PDF.");
  process.exit(0);
}

const nav = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const pg = await nav.newPage();
// Caminho absoluto: `file://` sobre um caminho relativo vira um host, não um
// arquivo, e o navegador reclama de um endereço que parece certo.
await pg.goto(pathToFileURL(resolve(tmp)).href, { waitUntil: "load" });
await pg.pdf({
  path: SAIDA,
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate:
    '<div style="width:100%;font-size:7pt;color:#9a9aa0;padding:0 16mm;display:flex;justify-content:space-between;">' +
    "<span>Mentorque · perguntas do quiz diário</span>" +
    '<span class="pageNumber"></span></div>',
  margin: { top: "18mm", bottom: "16mm", left: "16mm", right: "16mm" },
});
await nav.close();

console.log(`PDF gerado: ${SAIDA} (${pt.length} perguntas em PT + ${en.length} em EN)`);
