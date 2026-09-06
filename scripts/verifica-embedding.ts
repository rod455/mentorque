// Quem grava e quem procura estão no MESMO espaço vetorial?
//
// POR QUE ISTO EXISTE (05/09/2026). A busca de manual tem dois lados que
// precisam combinar e que moram em arquivos diferentes: a ingestão
// (scripts/lib/ingest.mjs) vetoriza o manual, e a consulta (lib/rag.ts)
// vetoriza a pergunta. Se um usar um modelo e o outro usar outro, ou se as
// dimensões divergirem, NADA QUEBRA DE FORMA VISÍVEL: a busca continua
// respondendo, só que com trechos errados, e a Biela responde com a mesma
// segurança de sempre em cima de material que não tem nada a ver.
//
// É o pior tipo de defeito que existe aqui: silencioso, plausível, e do outro
// lado tem alguém decidindo se leva o carro na oficina.
//
// O risco não é teórico. Em 05/09 a base inteira trocou de provedor, de OpenAI
// para Voyage, e nessa troca os dois lados foram editados à mão, em arquivos
// separados, um .ts e um .mjs. Quem repetir essa cirurgia daqui a um ano vai
// mexer num e esquecer o outro.
//
// O que ela cobra:
//   1. os dois lados declaram o mesmo endpoint, modelo e dimensão
//   2. a ingestão manda `input_type: "document"` e a consulta, `"query"`
//   3. a dimensão declarada é a mesma da coluna criada na migração
//
// Rode com: npm run conferir:embedding
import { readFileSync } from "node:fs";
import { EMBEDDING as DA_CONSULTA } from "../lib/rag.ts";
import { EMBEDDING as DA_INGESTAO, limpaTexto } from "./lib/ingest.mjs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Embedding: quem grava e quem procura falam a mesma língua?");

// ── 1. os dois lados combinam ───────────────────────────────────────────────
{
  conferir(
    "o mesmo endpoint dos dois lados",
    DA_CONSULTA.endpoint === DA_INGESTAO.endpoint,
    `consulta ${DA_CONSULTA.endpoint}, ingestão ${DA_INGESTAO.endpoint}`
  );
  conferir(
    "o mesmo modelo dos dois lados",
    DA_CONSULTA.modelo === DA_INGESTAO.modelo,
    `consulta ${DA_CONSULTA.modelo}, ingestão ${DA_INGESTAO.modelo}`
  );
  conferir(
    "a mesma dimensão dos dois lados",
    DA_CONSULTA.dimensoes === DA_INGESTAO.dimensoes,
    `consulta ${DA_CONSULTA.dimensoes}, ingestão ${DA_INGESTAO.dimensoes}`
  );
  if (!falhas) console.log(`  ✓ ${DA_CONSULTA.modelo}, ${DA_CONSULTA.dimensoes} dimensões, nos dois lados`);
}

// ── 2. o input_type é assimétrico, e tem que ser ────────────────────────────
//
// A Voyage prepara espaços diferentes para pergunta e para documento. Trocar
// os dois tipos, ou usar o mesmo nos dois lados, piora a busca sem quebrar
// nada. Como isso mora no corpo da requisição e não numa constante, aqui se
// confere lendo o arquivo, e por isso os comentários saem antes: nesta casa
// todo comentário cita o código que explica, e uma conferência de texto ingênua
// aprovaria a documentação do conserto em vez do conserto.
{
  const semComentarios = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  const consulta = semComentarios(readFileSync(new URL("../lib/rag.ts", import.meta.url), "utf8"));
  const ingestao = semComentarios(readFileSync(new URL("./lib/ingest.mjs", import.meta.url), "utf8"));

  conferir('a consulta manda input_type "query"', /input_type:\s*"query"/.test(consulta));
  conferir('a consulta NÃO manda "document"', !/input_type:\s*"document"/.test(consulta));
  conferir('a ingestão manda input_type "document"', /input_type:\s*"document"/.test(ingestao));
  conferir('a ingestão NÃO manda "query"', !/input_type:\s*"query"/.test(ingestao));

  // E os dois pedem a dimensão explicitamente, em vez de aceitar o padrão do
  // provedor, que pode mudar sem aviso e derrubar a inserção em produção.
  conferir("a consulta declara a dimensão que quer", /output_dimension/.test(consulta));
  conferir("a ingestão declara a dimensão que quer", /output_dimension/.test(ingestao));
}

// ── 3. a coluna do banco tem a dimensão declarada ───────────────────────────
//
// A migração está guardada no repositório justamente para isto poder ser
// conferido sem rede. Se alguém trocar o modelo por um de outra dimensão e
// esquecer a coluna, a gravação estoura no meio de um lote de 28 mil.
{
  const migracao = readFileSync(new URL("../supabase/embedding-voyage.sql", import.meta.url), "utf8");
  const m = migracao.match(/embedding_voyage\s+vector\((\d+)\)/);
  conferir("a migração declara a coluna embedding_voyage", !!m, "não achei `embedding_voyage vector(N)`");
  if (m) {
    conferir(
      "a coluna tem a mesma dimensão do modelo",
      Number(m[1]) === DA_CONSULTA.dimensoes,
      `coluna vector(${m[1]}), modelo ${DA_CONSULTA.dimensoes}`
    );
  }
  conferir(
    "a busca compara na coluna da Voyage",
    /embedding_voyage\s*<=>/.test(migracao),
    "match_manual_chunks precisa comparar em embedding_voyage, não na coluna antiga"
  );
}

// -- 4. O TEXTO QUE ENTRA NO BANCO ------------------------------------------
//
// O caso, de 05/09/2026: no primeiro lote grande, 4 dos 27 manuais foram
// recusados com `unsupported Unicode escape sequence`. Erro do BANCO, nao do
// arquivo: o Postgres nao guarda o caractere NUL dentro de texto, e alguns
// PDFs trazem NUL no meio do conteudo extraido. Um manual inteiro perdido por
// causa de um byte invisivel, e a mensagem nao fala em PDF nem em NUL, entao
// ninguem liga uma coisa a outra sem ja ter passado por isso.
{
  const NUL = String.fromCharCode(0);
  const VT = String.fromCharCode(11);
  const sujo = `Troca do ${NUL}oleo${VT} do motor.\n\nSegundo paragrafo.`;
  const limpo = limpaTexto(sujo);

  conferir("o NUL sai do texto extraido", !limpo.includes(NUL), "e ele que o Postgres recusa");
  conferir("os outros controles do bloco C0 tambem saem", !limpo.includes(VT));
  conferir("a quebra de linha FICA", limpo.includes("\n"), "a picotagem em paragrafos depende dela");
  conferir("o acento fica intacto", limpo.includes("oleo"), limpo.slice(0, 40));
}

// -- 5. O TRECHO DIZ DE QUAL MANUAL SAIU ------------------------------------
//
// A DECISAO DO DONO, 06/09/2026: nao havendo manual do ano exato, a busca usa o
// ano mais proximo que existe e a Biela responde a partir dele. Manual de outro
// ano e muito melhor que nenhum manual, e a busca ja fazia isso, porque o ano
// so ordena e nao filtra.
//
// O que faltava era a honestidade do outro lado. A rota jogava fora marca,
// modelo e ano, que a consulta ja devolvia, e a Biela respondia como se o
// trecho fosse do manual do carro da pessoa. Um EcoSport 2003 recebendo o
// manual de 2017 e outra geracao, com outro motor: a resposta continua util, e
// afirmar que ela e do manual daquele carro e que nao pode.
//
// Sem esta conferencia, alguem "simplifica" o map de volta para so o conteudo e
// a etiqueta some sem quebrar nada.
{
  const semComentarios3 = (f: string) =>
    f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  const rag = semComentarios3(readFileSync(new URL("../lib/rag.ts", import.meta.url), "utf8"));
  const rota = semComentarios3(readFileSync(new URL("../app/api/biela/route.ts", import.meta.url), "utf8"));

  conferir(
    "o trecho devolvido carrega marca, modelo e ano",
    /r\.make/.test(rag) && /r\.model/.test(rag) && /r\.year/.test(rag),
    "sem isso a Biela nao tem como dizer de que manual falou"
  );
  conferir(
    "e a etiqueta entra no texto que vai para o modelo",
    /manual \$\{etiqueta\}|\$\{etiqueta\}/.test(rag),
    "devolver os campos e nao usa-los seria pior: parece resolvido e nao esta"
  );
  conferir(
    "a rota manda a Biela avisar quando o ano do manual nao bate",
    /ano do manual for diferente/.test(rota),
    "a instrucao em portugues e a que vale para os nossos motoristas"
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do embedding reprovaram.`);
  process.exit(1);
}
console.log("Embedding: ingestão e consulta no mesmo modelo, mesma dimensão, tipos certos.");
