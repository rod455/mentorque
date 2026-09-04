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
import { readFileSync, readdirSync, existsSync, statSync, lstatSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

// SÓ AS NOSSAS. Skill instalada de fora (`npx skills add`) entra aqui como
// LINK SIMBÓLICO apontando para `.agents/skills/`, e ela não deve ser julgada
// por estas regras: os caminhos que ela cita são dela, não do nosso
// repositório, e o dono dela é outro. Conferir skill de terceiro daria
// reprovação todo dia por uma coisa que não temos como consertar, e conferência
// que reprova sem ação possível é conferência que a pessoa aprende a ignorar.
//
// A distinção é feita com `lstat`, que NÃO segue o link. O `statSync` comum
// seguiria e a pasta de fora pareceria nossa.
const tudo = readdirSync(PASTA);
const deFora = tudo.filter((d) => lstatSync(join(PASTA, d)).isSymbolicLink());
const skills = tudo.filter(
  (d) => !lstatSync(join(PASTA, d)).isSymbolicLink() && statSync(join(PASTA, d)).isDirectory()
);
conferir("existe pelo menos uma skill nossa", skills.length > 0);

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

  // A skill precisa estar VISÍVEL AO GIT, senão ela existe só na máquina de
  // quem escreveu. O `.gitignore` ignora `.claude/skills/*` e libera as nossas
  // uma a uma (para instalação de fora ficar ignorada sozinha), então esquecer
  // a linha de liberação é o jeito silencioso de perder uma skill: ela funciona
  // para quem escreveu e não existe para mais ninguém.
  let ignorada = false;
  try {
    // `--no-index` é obrigatório: sem ele o `check-ignore` PULA arquivo já
    // rastreado, e como as nossas skills já estão no git ele responderia "não
    // ignorada" sempre, testando nada. Descoberto plantando o defeito, que é
    // exatamente para isso que se planta.
    execFileSync("git", ["check-ignore", "-q", "--no-index", join(".claude/skills", skill, "SKILL.md")], { cwd: RAIZ });
    ignorada = true;
  } catch {
    /* saída diferente de zero = não está ignorada, que é o certo */
  }
  conferir(
    `${skill}: está versionada (não ignorada pelo git)`,
    !ignorada,
    "falta a linha `!/.claude/skills/<nome>/` no .gitignore; sem ela a skill não chega nas sessões remotas"
  );

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
const nota = deFora.length ? ` (+${deFora.length} de fora, não conferidas)` : "";
console.log(`Skills: ${skills.length} nossas, todas carregáveis e apontando para arquivo que existe${nota}.`);
