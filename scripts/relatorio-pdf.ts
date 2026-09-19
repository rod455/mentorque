// Transforma o relatório de mídia em PDF, que é o que sai anexado no e-mail.
//
// Quem roda isto é o agente de Mídia paga, no fim da rodada de quinta, logo
// depois de gravar `docs/agentes/relatorios/midia-ultimo.md`:
//
//   npm run relatorio:pdf
//
// Depois ele commita os DOIS arquivos, o .md e o .pdf. O fluxo do n8n às 10h
// busca o PDF no repositório e anexa; sem o PDF commitado, o e-mail não sai
// para ninguém de fora.
//
// Usa o Chromium que já existe no ambiente remoto (`/opt/pw-browsers/chromium`,
// o mesmo das conferências de navegador), sem Playwright e sem serviço de
// terceiro: converter HTML em PDF é coisa que o navegador faz sozinho com
// `--print-to-pdf`, e o Playwright aqui só acrescentaria uma instalação de um
// minuto por rodada.
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { paginaDoRelatorio, dataDoRelatorio } from "../lib/relatorio/markdown.ts";

const RAIZ = new URL("..", import.meta.url).pathname;
const MD = join(RAIZ, "docs/agentes/relatorios/midia-ultimo.md");
const PDF = join(RAIZ, "docs/agentes/relatorios/midia-ultimo.pdf");

const CAMINHOS_DO_NAVEGADOR = [
  process.env.CHROMIUM_CAMINHO,
  "/opt/pw-browsers/chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
].filter(Boolean) as string[];

const navegador = CAMINHOS_DO_NAVEGADOR.find((c) => existsSync(c));
if (!navegador) {
  console.error(
    "Não achei o Chromium para gerar o PDF. Procurei em:\n  " +
      CAMINHOS_DO_NAVEGADOR.join("\n  ") +
      "\nAponte outro caminho em CHROMIUM_CAMINHO. Sem PDF, NÃO commite o relatório dizendo que está pronto:\n" +
      "o fluxo do e-mail não manda relatório sem anexo, e o dono recebe o aviso no seu lugar."
  );
  process.exit(1);
}

if (!existsSync(MD)) {
  console.error(`Não existe ${MD}. O PDF é feito a partir do markdown, então grave o relatório primeiro.`);
  process.exit(1);
}

const texto = readFileSync(MD, "utf8");
const data = dataDoRelatorio(texto);
if (!data) {
  console.error(
    "O relatório não começa com a linha `Relatório de mídia gerado em AAAA-MM-DD`.\n" +
      "Essa linha não é enfeite: é com ela que o fluxo do e-mail decide se o relatório é o de hoje."
  );
  process.exit(1);
}

const pasta = mkdtempSync(join(tmpdir(), "relatorio-"));
const html = join(pasta, "relatorio.html");
writeFileSync(html, paginaDoRelatorio(texto), "utf8");

execFileSync(
  navegador,
  [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    `--print-to-pdf=${PDF}`,
    `file://${html}`,
  ],
  { stdio: "pipe" }
);

const tamanho = readFileSync(PDF).length;
console.log(`PDF do relatório de ${data} gerado: docs/agentes/relatorios/midia-ultimo.pdf (${Math.round(tamanho / 1024)} KB).`);
console.log("Commite o .md E o .pdf: o e-mail de quinta anexa o PDF que estiver na main.");
