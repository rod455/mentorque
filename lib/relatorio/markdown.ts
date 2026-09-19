// O markdown do relatório vira o HTML que vira o PDF do e-mail.
//
// POR QUE ISTO EXISTE (19/09/2026). O relatório semanal de mídia é a primeira
// coisa nossa que sai para alguém de FORA da operação por e-mail, em PDF. Até
// aqui tudo o que os agentes escreviam era lido por quem já tem contexto: o
// dono, o artifact, o DIARIO. Um PDF que chega sozinho na caixa de outra
// pessoa não tem ninguém do lado para explicar.
//
// A conversão mora AQUI, e não dentro do nó do n8n, por um motivo prático: aqui
// ela é conferível. O `npm run conferir:relatorio` planta defeito nela e vê se
// a conferência grita. Dentro do n8n ela seria um texto que ninguém compila e
// que só falha na frente do destinatário.
//
// O subconjunto é de propósito pequeno, e o manual do agente promete só ele:
// título, parágrafo, lista, tabela, negrito e código. Qualquer outra coisa sai
// como parágrafo, que é feio e legível, nunca como marcação crua no meio da
// frase.

/** A linha que abre todo relatório. O fluxo do e-mail compara ela com o dia. */
export const LINHA_DA_DATA = /^Relat[oó]rio de m[ií]dia gerado em (\d{4}-\d{2}-\d{2})/m;

/** A data do relatório, ou null quando o arquivo não segue o contrato. */
export function dataDoRelatorio(texto: string): string | null {
  return texto.match(LINHA_DA_DATA)?.[1] ?? null;
}

const escapa = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Negrito e código dentro da linha, com o resto escapado. */
export function inline(s: string): string {
  return escapa(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/** O corpo do markdown em HTML, sem cabeçalho de página. */
export function corpoEmHtml(texto: string): string {
  const linhas = texto.split("\n");
  let html = "";
  let lista = false;
  let tabela = false;
  let primeiraLinhaDaTabela = true;
  // O markdown do repositório quebra linha em 80 colunas, e quebra de linha ali
  // é formatação de arquivo, não de texto. Sem juntar, cada linha vira um
  // parágrafo e o PDF sai com buraco entre uma linha e outra da mesma frase.
  let paragrafo: string[] = [];
  const fechaParagrafo = () => {
    if (paragrafo.length) { html += `<p>${inline(paragrafo.join(" "))}</p>`; paragrafo = []; }
  };
  const fechaLista = () => {
    if (lista) { html += "</ul>"; lista = false; }
  };
  const fechaTabela = () => {
    if (tabela) { html += "</tbody></table>"; tabela = false; }
  };

  for (const bruta of linhas) {
    const l = bruta.trim();
    // A data vira o cabeçalho da página e o assunto do e-mail, não corpo.
    if (LINHA_DA_DATA.test(l)) continue;
    if (!l) { fechaParagrafo(); fechaLista(); fechaTabela(); continue; }

    if (l.startsWith("|")) {
      const celulas = l.split("|").slice(1, -1).map((c) => c.trim());
      // A linha de tracinhos é separador do markdown. Deixar ela passar enche a
      // tabela de "---" na frente de quem recebe.
      if (celulas.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      if (!tabela) {
        fechaParagrafo();
        fechaLista();
        html += "<table><tbody>";
        tabela = true;
        primeiraLinhaDaTabela = true;
      }
      const tag = primeiraLinhaDaTabela ? "th" : "td";
      html += "<tr>" + celulas.map((c) => `<${tag}>${inline(c)}</${tag}>`).join("") + "</tr>";
      primeiraLinhaDaTabela = false;
      continue;
    }
    fechaTabela();

    const titulo = l.match(/^(#{1,3})\s+(.*)$/);
    if (titulo) {
      fechaParagrafo();
      fechaLista();
      const nivel = titulo[1].length === 1 ? "h1" : titulo[1].length === 2 ? "h2" : "h3";
      html += `<${nivel}>${inline(titulo[2])}</${nivel}>`;
      continue;
    }
    if (/^[-*]\s+/.test(l)) {
      fechaParagrafo();
      if (!lista) { html += "<ul>"; lista = true; }
      html += `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }
    // Continuação indentada de um item de lista pertence ao item, não a um
    // parágrafo novo. Sem isto, a segunda linha de um item salta para fora da
    // lista e o texto fica desalinhado no PDF.
    if (lista && /^\s{2,}/.test(bruta)) {
      html = html.replace(/<\/li>$/, " " + inline(l) + "</li>");
      continue;
    }
    fechaLista();
    paragrafo.push(l);
  }
  fechaParagrafo();
  fechaLista();
  fechaTabela();
  return html;
}

/**
 * A página inteira, pronta para virar PDF.
 *
 * Fundo claro de propósito: o app é escuro, mas PDF escuro é PDF que a pessoa
 * imprime e gasta um cartucho, ou que sai ilegível no leitor dela. O âmbar da
 * marca aparece no filete e nos títulos, que já dá identidade.
 */
export function paginaDoRelatorio(texto: string): string {
  const data = dataDoRelatorio(texto);
  const cabecalho = data
    ? `<div class="topo"><span class="marca">Mentorque</span><span class="data">Mídia paga, relatório de ${data}</span></div>`
    : `<div class="topo"><span class="marca">Mentorque</span><span class="data">Mídia paga</span></div>`;
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Mídia da semana</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: Helvetica, Arial, sans-serif; color: #16181D; font-size: 11pt; line-height: 1.5; }
  .topo { border-bottom: 3px solid #F2A623; padding-bottom: 6px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: baseline; }
  .marca { font-weight: bold; font-size: 13pt; letter-spacing: .5px; }
  .data { color: #555; font-size: 9.5pt; }
  h1 { font-size: 17pt; margin: 0 0 10px; }
  h2 { font-size: 13pt; margin: 20px 0 8px; border-left: 4px solid #F2A623; padding-left: 8px; }
  h3 { font-size: 11.5pt; margin: 16px 0 6px; }
  p, li { margin: 6px 0; }
  ul { margin: 6px 0 6px 18px; padding: 0; }
  table { border-collapse: collapse; margin: 12px 0; width: 100%; font-size: 10pt; }
  th, td { border: 1px solid #CFCBC0; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #F4F2EC; font-weight: bold; }
  code { background: #F4F2EC; padding: 1px 4px; border-radius: 3px; font-size: 9.5pt; }
  .rodape { margin-top: 26px; border-top: 1px solid #CFCBC0; padding-top: 8px; color: #666; font-size: 8.5pt; }
</style></head>
<body>
${cabecalho}
${corpoEmHtml(texto)}
<div class="rodape">Relatório semanal do agente de Mídia paga do Mentorque. Dúvida sobre qualquer número daqui: fale com o Rodrigo.</div>
</body></html>`;
}
