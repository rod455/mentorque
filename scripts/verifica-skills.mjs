// As skills do projeto continuam de pé e apontando para o que existe?
//
// POR QUE ISTO EXISTE. As skills de `.claude/skills/` carregam sozinhas quando
// a conversa encosta no assunto delas, e é justamente isso que as torna
// perigosas quando apodrecem: ninguém abre para conferir, elas simplesmente
// aparecem no meio de uma decisão e são obedecidas.
//
// O modo de apodrecer é conhecido e chato: elas apontam para arquivos do
// repositório (`lib/operacao.ts`, `docs/mapa-do-codigo.md`) porque a alternativa
// seria copiar o conteúdo, e regra copiada é regra que diverge. O preço dessa
// escolha é que renomear ou mover um arquivo deixa a skill mandando ler algo
// que não está mais lá, e ela continua sendo carregada como se nada tivesse
// acontecido. Um agente sênior tomando decisão com base num ponteiro quebrado é
// pior do que um agente sem skill nenhuma.
//
// Confere três coisas, e cada uma pega uma forma diferente de estragar:
//   1. o `name` do cabeçalho bate com o nome da pasta (o que não bate, não carrega)
//   2. existe `description`, e ela é longa o bastante para dizer QUANDO usar
//      (descrição curta é descrição que nunca dispara)
//   3. todo caminho de arquivo citado no corpo existe de verdade
//
// Rode com: npm run conferir:skills
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const PASTA = join(RAIZ, ".claude/skills");

/**
 * Piso do tamanho da descrição.
 *
 * A descrição é o ÚNICO texto que decide se a skill é carregada, e o modo de
 * errar é sempre o mesmo: descrever o que a skill é ("análise da operação") em
 * vez de quando usá-la. Descrição curta é quase sempre o primeiro sintoma
 * disso. Não é um número mágico, é um piso baixo o suficiente para não
 * incomodar quem escreveu direito.
 */
const MINIMO_DESCRICAO = 120;

let falhas = 0;
function conferir(nome, condicao, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

if (!existsSync(PASTA)) {
  console.log("Skills: nenhuma skill de projeto ainda, nada a conferir.");
  process.exit(0);
}

const skills = readdirSync(PASTA).filter((d) => statSync(join(PASTA, d)).isDirectory());
conferir("existe pelo menos uma skill", skills.length > 0);

for (const skill of skills) {
  const arquivo = join(PASTA, skill, "SKILL.md");
  if (!existsSync(arquivo)) {
    conferir(`${skill} tem SKILL.md`, false, "pasta de skill sem SKILL.md não carrega");
    continue;
  }
  const fonte = readFileSync(arquivo, "utf8");
  const cabecalho = fonte.split("---")[1] ?? "";

  const nome = (cabecalho.match(/^name:\s*(.+)$/m) ?? [])[1]?.trim();
  conferir(`${skill}: o name bate com a pasta`, nome === skill, `name é "${nome}"`);

  const desc = (cabecalho.match(/^description:\s*([\s\S]+?)(?=\n[a-z-]+:|$)/m) ?? [])[1]?.trim() ?? "";
  conferir(
    `${skill}: a descrição diz QUANDO usar`,
    desc.length >= MINIMO_DESCRICAO,
    `tem ${desc.length} caracteres; descrição curta costuma descrever o que a skill É, e aí ela nunca dispara`
  );

  // Todo caminho citado entre crases precisa existir. Curinga (`**`) e pastas
  // ficam de fora: são referências a áreas, não a arquivos.
  const caminhos = [...fonte.matchAll(/`([a-zA-Z0-9_./-]+\.(?:ts|tsx|mjs|md|json|gradle|properties))`/g)]
    .map((m) => m[1])
    .filter((p) => p.includes("/") || p.endsWith(".json"));
  for (const p of new Set(caminhos)) {
    conferir(`${skill}: o caminho ${p} existe`, existsSync(join(RAIZ, p)), "skill que manda ler arquivo movido ensina errado");
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de skills reprovaram.`);
  process.exit(1);
}
console.log(`Skills: ${skills.length} de projeto, todas carregáveis e apontando para arquivo que existe.`);
