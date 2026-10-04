// A Vercel builda só quando tem o que buildar?
//
// POR QUE ISTO EXISTE (04/10/2026). A Vercel avisou que a conta chegou a 75% dos
// 10 GB de Deployment Storage no dia 3 do mês. Deployment Storage é o ACUMULADO
// dos builds guardados, então o número cresce com quantas vezes a casa publica.
// Medido nos 40 commits anteriores a este: 17 só mexiam em `docs/`, `.claude/`
// ou `supabase/`, pastas que a Vercel nem sobe (estão no `.vercelignore`), e
// cada um deles gerou um build inteiro igual ao anterior, guardado como se
// fosse novo. O retrato diário sozinho fez 40 commits em 30 dias, todos de doc.
//
// O CONSERTO mora em `vercel.json`, no `ignoreCommand`: a Vercel roda esse
// comando antes do build, e sai 0 quer dizer "não builda", sai 1 quer dizer
// "builda" (ao contrário do que o nome sugere, e é por isso que o comportamento
// é PROVADO abaixo num repositório de mentira, não só lido). Fonte:
// vercel.com/docs/project-configuration#ignorecommand, cujo próprio exemplo é
// `git diff HEAD^ HEAD --quiet ./packages/app`, então `HEAD^` existe lá.
//
// O QUE ESTA CONFERÊNCIA PROTEGE, e cada item é um jeito de quebrar calado:
//
//   1. `ignoreCommand` apagado ou com nome errado: a Vercel volta a buildar
//      tudo e ninguém vê, porque "buildou" não é erro;
//   2. pasta excluída no comando que a Vercel SERVE: commit que muda só essa
//      pasta não sobe, e o site fica velho com cara de publicado. Por isso
//      toda pasta excluída do comando tem que estar também no `.vercelignore`
//      (o que não sobe não precisa buildar), e toda pasta do `.vercelignore`
//      não pode ser lida por `app/` ou `lib/` em tempo de execução. Esse
//      segundo caso quase aconteceu em 03/10 com `assets/`;
//   3. o comando "parece certo" e sai com o código invertido. Lido, passa;
//      executado, não. Então ele é executado contra commits de verdade num
//      repositório temporário: um só de doc tem que sair 0, um misto tem que
//      sair 1, e um que mexe só em `vercel.json` ou em `public/` também 1.
//
// O QUE ELA NÃO ALCANÇA: o que a Vercel faz com o comando lá dentro (clone
// raso, caminho do git). Isso só o painel dela mostra, e o jeito de ler é a
// aba Deployments dizer "Canceled" com o motivo "ignored build step" num commit
// só de doc. A primeira leitura dessa aba fica para a rodada seguinte.
//
// Rode com: npm run conferir:publicacao
import { execSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const ler = (p: string) => readFileSync(`${RAIZ}${p}`, "utf8");

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Publicação: a Vercel pula o build quando o commit não muda nada que ela sirva?");

// ── 1. O COMANDO EXISTE E É O QUE SE ESPERA ────────────────────────────────
const vercel = JSON.parse(ler("vercel.json")) as { ignoreCommand?: unknown };
const comando = typeof vercel.ignoreCommand === "string" ? vercel.ignoreCommand : "";
conferir("vercel.json tem ignoreCommand", comando.length > 0, "sem ele a Vercel builda todo commit, inclusive os so de doc");
conferir(
  "e ele compara o commit com o anterior",
  /git diff --quiet HEAD\^ HEAD/.test(comando),
  "a comparacao e o que decide; outra forma precisa ser provada de novo abaixo",
);

/** As pastas que o comando ignora: `':(exclude)docs'` vira `docs`. */
const excluidas = [...comando.matchAll(/:\(exclude\)([^'" ]+)/g)].map((m) => m[1]!.replace(/\/$/, ""));
conferir("o comando exclui pelo menos as pastas de documentação", excluidas.includes("docs") && excluidas.includes(".claude"));

// ── 2. O QUE O COMANDO IGNORA É O QUE A VERCEL NÃO SOBE ────────────────────
const vercelignore = ler(".vercelignore")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.replace(/\/$/, ""));

for (const pasta of excluidas) {
  conferir(
    `${pasta}/ fica fora do build E fora do upload`,
    vercelignore.includes(pasta),
    "pasta que a Vercel serve nao pode ser motivo para pular build: o site ficaria velho com cara de publicado",
  );
}
// Linha do `.vercelignore` que não corresponde a nada não exclui nada, e é
// erro de digitação. Mas "existe no disco" é a pergunta errada para medir isso,
// e ela deixou o `npm run conferir` VERMELHO para todo mundo em 04/10: a
// `pecas-geradas/` só NASCE quando alguém roda o gerador de peças
// (`scripts/pecas.mjs`), então em qualquer clone limpo ela não existe, e a
// conferência reprovava sem nenhum defeito na frente dela.
//
// A pergunta certa é o que o REPOSITÓRIO tem, não o que esta máquina tem. Daí
// `git ls-files`: ele responde igual em clone novo e em máquina de trabalho.
//
// A exceção é nomeada uma por uma, com o motivo, porque exceção em conferência
// é buraco (foi assim que o detector de corte lateral engoliu uma folha
// inteira): pasta que nasce em tempo de execução não é rastreada e nunca vai
// estar no `git ls-files`.
const NASCEM_RODANDO = new Set([
  // scripts/pecas.mjs e scripts/encolhe-biela.mjs escrevem aqui.
  "pecas-geradas",
]);
const rastreadas = new Set(
  execSync("git ls-files", { cwd: RAIZ, encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((f) => f.split("/")[0]!),
);
for (const pasta of vercelignore) {
  if (NASCEM_RODANDO.has(pasta)) continue;
  conferir(
    `${pasta}/ do .vercelignore existe no repositório`,
    rastreadas.has(pasta),
    "linha com erro de digitacao nao exclui nada: nenhum arquivo versionado comeca com esse nome",
  );
}

// Nenhuma pasta excluída pode ser lida em tempo de execução. Foi assim que
// `assets/` quase saiu em 03/10: pela cara de material de trabalho. A regra é
// olhar o fonte, então aqui se olha o fonte.
{
  const fontes = execSync("git ls-files app lib", { cwd: RAIZ, encoding: "utf8" })
    .split("\n")
    .filter((f) => /\.(ts|tsx|mjs|js)$/.test(f));
  // "Lê em tempo de execução" é uma linha que chama o sistema de arquivos E
  // cita a pasta como caminho. Só o nome entre aspas não basta: `"android"` é
  // plataforma em dezenas de arquivos, `"tools"` é nome de ícone, e um comentário
  // que cita `docs/x.md` não lê nada.
  const LE_ARQUIVO = /readFileSync|readdirSync|readFile\b|createReadStream|existsSync|statSync|process\.cwd\(\)/;
  for (const pasta of vercelignore) {
    const padrao = new RegExp(`["'\`](\\./)?${pasta.replace(/[.]/g, "\\.")}(/|["'\`])`);
    const leitores = fontes.filter((f) =>
      readFileSync(`${RAIZ}${f}`, "utf8")
        .split("\n")
        .some((linha) => LE_ARQUIVO.test(linha) && padrao.test(linha)),
    );
    conferir(
      `nada em app/ ou lib/ lê ${pasta}/ em tempo de execução`,
      leitores.length === 0,
      `excluir a pasta quebraria em silencio: ${leitores.join(", ")}`,
    );
  }
  conferir("assets/ NÃO está no .vercelignore", !vercelignore.includes("assets"), "app/api/pecas/route.tsx le assets/pecas e assets/fontes ao responder");
  conferir("public/ NÃO está no .vercelignore", !vercelignore.includes("public"));
}

// ── 3. O COMANDO EXECUTADO, NÃO LIDO ───────────────────────────────────────
//
// Um repositório de mentira com commits de cada tipo. `0` é "pula o build",
// `1` é "builda". O código invertido é o defeito que a leitura não pega.
if (comando) {
  const repo = mkdtempSync(join(tmpdir(), "mentorque-publicacao-"));
  const git = (args: string) =>
    execSync(`git ${args}`, {
      cwd: repo,
      encoding: "utf8",
      env: { ...process.env, GIT_AUTHOR_NAME: "c", GIT_AUTHOR_EMAIL: "c@c", GIT_COMMITTER_NAME: "c", GIT_COMMITTER_EMAIL: "c@c" },
    });
  const escreve = (caminho: string, conteudo: string) => {
    mkdirSync(dirname(join(repo, caminho)), { recursive: true });
    writeFileSync(join(repo, caminho), conteudo);
  };
  const commit = (msg: string, arquivos: Record<string, string>) => {
    for (const [c, v] of Object.entries(arquivos)) escreve(c, v);
    git("add -A");
    git(`commit -q -m "${msg}"`);
  };
  /** O que a Vercel veria: o código de saída do comando no HEAD atual. */
  const decisao = () => spawnSync("sh", ["-c", comando], { cwd: repo, encoding: "utf8" }).status;

  try {
    git("init -q");
    commit("base", { "app/page.tsx": "1", "docs/a.md": "1", "vercel.json": "{}", "public/x.txt": "1", "supabase/s.sql": "1" });

    commit("so doc", { "docs/a.md": "2" });
    conferir("commit só de docs/ PULA o build (sai 0)", decisao() === 0, `saiu ${decisao()}`);

    commit("so pastas internas", { ".claude/x.md": "2", "supabase/s.sql": "2" });
    conferir("commit só de .claude/ e supabase/ PULA o build (sai 0)", decisao() === 0, `saiu ${decisao()}`);

    commit("misto", { "docs/a.md": "3", "app/page.tsx": "2" });
    conferir("commit de doc E código BUILDA (sai 1)", decisao() === 1, `saiu ${decisao()}`);

    commit("so codigo", { "lib/x.ts": "1" });
    conferir("commit só de código BUILDA (sai 1)", decisao() === 1, `saiu ${decisao()}`);

    commit("so vercel.json", { "vercel.json": '{"a":1}' });
    conferir("commit só de vercel.json BUILDA (sai 1)", decisao() === 1, "mudar a configuracao da Vercel sem publicar e nao ter mudado");

    commit("so public", { "public/x.txt": "2" });
    conferir("commit só de public/ BUILDA (sai 1)", decisao() === 1, "public/ e servido cru: mudou, tem que subir");

    commit("doc com nome parecido", { "docs-do-app/x.md": "1" });
    conferir("pasta de nome parecido com a excluída NÃO é excluída (sai 1)", decisao() === 1, "exclusao por prefixo pegaria pasta que a Vercel serve");
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da publicação reprovaram.`);
  process.exit(1);
}
console.log(
  `Publicação: o build é pulado para ${excluidas.map((p) => `${p}/`).join(", ")}, e só para elas; executado em 7 commits de mentira com o código de saída certo em todos.`,
);
