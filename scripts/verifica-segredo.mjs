// Segredo com forma de chave entrou no repositório?
//
// POR QUE ISTO EXISTE (18/10/2026). A varredura de segredo é a fonte nº 3 deste
// papel desde 19/09, e até hoje ela vivia FORA do repositório: um script no
// scratchpad da sessão do agente, reescrito de memória toda semana porque o
// contêiner morre. Em 18/10 eu reescrevi e saiu DIFERENTE do da semana anterior
// (ganhou a forma `sk-ant-`, que eu só pensei em acrescentar depois de achar uma
// chave da Anthropic em texto puro no n8n em 11/10).
//
// Instrumento que deriva de memória é o que este papel existe para pegar nos
// outros, então ele vira código aqui. O que muda, além de não se perder:
//
//   · ele roda a cada `npm run conferir`, e não uma vez por semana. Segredo
//     commitado numa terça era achado no domingo seguinte, com até 6 dias de
//     exposição; agora é achado antes do push;
//   · qualquer pessoa roda, não só o agente de domingo;
//   · e a forma nova entra aqui, onde fica, em vez de na memória de uma sessão.
//
// AS DUAS PERGUNTAS, E OS DOIS MODOS (a segunda entrou em 25/10/2026):
//
//   `npm run conferir:segredo`                      → "tem segredo no
//     repositório AGORA?" Olha a árvore de trabalho, roda na bateria.
//   `node scripts/verifica-segredo.mjs --semana [dias]` → "ENTROU segredo nos
//     últimos dias?" Olha o diff com commit, arquivo e linha, e alcança o que
//     foi acrescentado e depois apagado, que o modo de cima não vê.
//
// O segundo modo existe porque a varredura semanal da rodada de domingo era a
// ÚLTIMA parte deste papel que ainda vivia no scratchpad da sessão, reescrita
// de memória toda semana. Em 18/10 o modo da bateria nasceu e a varredura
// semanal continuou fora, com a sua própria lista de formas; em 18/10 à noite
// o retorno do dono acrescentou sete formas aqui, e a varredura da semana não
// as teria. Duas listas de formas é uma lista errada. Agora as duas perguntas
// leem o mesmo `FORMAS`, e forma nova serve às duas de graça.
//
// O QUE O MODO `--semana` NÃO ALCANÇA: diff de commit de MERGE (o `git log -p`
// não mostra, por desenho), e segredo que entrou antes da janela de dias
// pedida. Para esse, o modo da árvore responde, se ainda estiver lá.
//
// O QUE NENHUM DOS DOIS ALCANÇA, e é muito: segredo que nunca passou pelo git.
// As chaves em texto puro dos fluxos do n8n, que foram o achado das rodadas 2,
// 3 e 4, vivem no n8n e não aqui. Nenhuma conferência de repositório vê aquilo.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const RAIZ = new URL("..", import.meta.url).pathname;
let falhas = 0;

/**
 * As formas de chave que esta casa usa de verdade.
 *
 * A lista é a do manual do papel (`docs/agentes/seguranca-dependencias.md`),
 * mais a da Anthropic, que entrou depois do achado de 11/10. Acrescentar forma
 * aqui é de graça; esquecer de acrescentar é o que custou seis dias.
 */
const FORMAS = [
  ["chave do Stripe em modo real", /sk_live_[A-Za-z0-9]{6,}/],
  ["chave do Stripe em teste", /sk_test_[A-Za-z0-9]{6,}/],
  ["segredo de webhook do Stripe", /whsec_[A-Za-z0-9]{6,}/],
  ["JWT (chave do Supabase)", /eyJ[A-Za-z0-9_-]{20,}/],
  ["token da Meta", /\bEAA[A-Za-z0-9]{20,}/],
  ["chave da Anthropic", /sk-ant-[A-Za-z0-9_-]{10,}/],
  ["SERVICE_ROLE com valor", /SERVICE_ROLE[A-Z_]*\s*[:=]\s*["'`]?[A-Za-z0-9_\-.]{8,}/],
  ["SECRET com valor", /[A-Z_]*SECRET[A-Z_]*\s*[:=]\s*["'`]?[A-Za-z0-9_\-.]{8,}/],
  // As sete abaixo entraram em 18/10/2026, no retorno do dono: as chaves que a
  // casa USA e que a lista de cima não via. A mais grave é a privada em PEM:
  // a do APNs (APNS_CHAVE_P), a da conta de serviço do FCM (FCM_CONTA_SERVICO),
  // a da App Store Connect e a da conta de serviço do Play são todas assim, e
  // são as que mais custam se vazarem (mandam aviso e mexem nas lojas).
  ["chave privada (PEM)", /-----BEGIN (?:RSA |EC |ENCRYPTED |OPENSSH )?PRIVATE KEY-----/],
  ["chave do Resend", /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{12,}/],
  ["chave da Voyage", /\bpa-[A-Za-z0-9_-]{30,}/],
  ["token do GitHub", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/],
  ["chave de API do Google", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["segredo de cliente OAuth do Google", /\bGOCSPX-[A-Za-z0-9_-]{20,}/],
  ["token de bot do Telegram", /\b\d{8,10}:AA[A-Za-z0-9_-]{30,}/],
];

/**
 * Onde a forma aparece de propósito, por ser MODELO e não valor.
 *
 * Exceção em conferência é buraco, então cada uma tem o motivo escrito e vale
 * só para o par (arquivo, forma). E ela NÃO basta: o trecho ainda precisa
 * passar por `pareceModelo` abaixo. Isso é o que impede o buraco de verdade,
 * que seria alguém colar uma chave REAL no `.env.example` e a exceção engolir.
 */
const DE_PROPOSITO = [
  [".env.example", "SERVICE_ROLE com valor", "o arquivo é o molde das variáveis, e o lado direito é instrução"],
  [".claude/skills/google-ads-api-mcp-setup/SKILL.md", "SECRET com valor", "documentação de fora, do Google, com exemplo de linha de comando"],
];

/**
 * Onde a forma aparece com VALOR DE VERDADE, de propósito, porque a chave é
 * pública por desenho (18/10/2026).
 *
 * Diferente de `DE_PROPOSITO`: aqui o trecho É uma chave real, e o teste de
 * modelo não se aplica. Por isso a lista é mínima, cada par tem o motivo, e o
 * par vale só para aquele arquivo e aquela forma: a mesma chave em qualquer
 * outro arquivo reprova.
 */
const PUBLICA_POR_DESENHO = [
  ["android/app/google-services.json", "chave de API do Google", "a configuração do Firebase do Android vai dentro do app e é pública por desenho; o que a protege é a restrição por pacote e SHA-1 no Google Cloud, não o segredo"],
];

/**
 * Trecho SEM NENHUM DÍGITO é nome de variável, não valor.
 * `sk_service_role_aqui` passa; `eyJhbGciOi...` não.
 *
 * A primeira versão desta função também reprovava "corrida longa de base64", e
 * estava errada: `--aaa-aaa-aaaa="aaaaaa_aaaaaaa_aa=..."` da documentação do
 * Google é uma corrida de 50 caracteres e é obviamente um nome. Underscore e
 * letra fazem corrida comprida sem ter entropia nenhuma.
 *
 * Dígito é o teste que separa de verdade: toda chave desta casa tem dígito
 * (`sk_live_`, `sk-ant-api03-`, JWT do Supabase, token da Meta), e nome de
 * variável de exemplo não tem. E o erro cai para o lado seguro: modelo COM
 * dígito dá alarme falso, que custa um comentário; chave sem dígito passaria
 * batida, e isso não existe.
 */
function pareceModelo(trecho) {
  return !/\d/.test(trecho);
}

/**
 * Uma linha de texto, e o que ela tem de forma de chave.
 *
 * É o único lugar que decide o que é achado, e por isso os dois modos passam
 * por aqui: exceção que vale na árvore vale no diff, e forma nova serve às
 * duas sem ninguém lembrar de copiar.
 *
 * Devolve `{ nome, tamanho, liberado }`, NUNCA o trecho. O valor não sai desta
 * função, para que nenhum chamador consiga imprimi-lo por descuido: a regra do
 * manual é dizer ONDE está e nunca O QUE É.
 */
function formasNaLinha(linha, arquivo) {
  const achados = [];
  for (const [nome, forma] of FORMAS) {
    const m = linha.match(forma);
    if (!m) continue;
    if (PUBLICA_POR_DESENHO.some(([a, f]) => a === arquivo && f === nome)) continue;
    const liberado = DE_PROPOSITO.some(([a, f]) => a === arquivo && f === nome);
    if (liberado && pareceModelo(m[0])) continue;
    achados.push({ nome, tamanho: m[0].length, liberado });
  }
  return achados;
}

/** Diz o achado e o que fazer, sem nunca dizer o valor. */
function relata(onde, { nome, tamanho, liberado }) {
  falhas++;
  console.error(`FALHA  ${nome} em ${onde} (trecho de ${tamanho} caracteres)`);
  if (liberado) {
    console.error("       este arquivo tem exceção para esta forma, e o trecho NÃO parece modelo:");
    console.error("       tem dígito, ou seja, tem cara de valor de verdade");
  } else {
    console.error("       tire o valor do repositório e gire a chave; depois diga ao dono");
    console.error("       se for molde e não valor, acrescente o par a DE_PROPOSITO com o motivo");
  }
}

const argumentos = process.argv.slice(2);
const modoSemana = argumentos.includes("--semana");

if (modoSemana) {
  const dias = Number(argumentos[argumentos.indexOf("--semana") + 1]) || 7;
  console.log(`Segredo: entrou alguma chave com forma de verdade nos últimos ${dias} dias?`);

  // `--unified=0` porque só as linhas acrescentadas interessam, e sem contexto
  // o diff fica pequeno. `--no-color` para o `+` do começo da linha ser sempre
  // o `+` do diff, e não um código de cor.
  const diff = execFileSync(
    "git",
    ["log", `--since=${dias} days ago`, "-p", "--unified=0", "--no-color"],
    { cwd: RAIZ, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 },
  );

  let commit = "(sem commit)";
  let arquivo = "(sem arquivo)";
  let linhaNova = 0;
  let commits = 0;
  let acrescentadas = 0;

  for (const linha of diff.split("\n")) {
    const mCommit = /^commit ([0-9a-f]{7,40})$/.exec(linha);
    if (mCommit) {
      commit = mCommit[1].slice(0, 7);
      commits++;
      continue;
    }
    if (linha.startsWith("+++ b/")) {
      arquivo = linha.slice(6);
      continue;
    }
    if (linha.startsWith("+++ ") || linha.startsWith("--- ")) continue;
    const mPedaco = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(linha);
    if (mPedaco) {
      linhaNova = Number(mPedaco[1]);
      continue;
    }
    if (!linha.startsWith("+")) continue;

    const texto = linha.slice(1);
    acrescentadas++;
    for (const achado of formasNaLinha(texto, arquivo)) {
      relata(`${arquivo}:${linhaNova}, no commit ${commit}`, achado);
    }
    linhaNova++;
  }

  if (falhas) {
    console.error(`\n${falhas} achado(s) com forma de chave no diff. NÃO cite o valor em relatório nenhum.`);
    process.exit(1);
  }
  console.log(
    `Segredo: ${commits} commits e ${acrescentadas} linhas acrescentadas lidas, nenhuma com forma de chave.`,
  );
  console.log("Segredo: isto não alcança commit de merge nem o que entrou antes da janela.");
} else {
  console.log("Segredo: alguma chave com forma de verdade entrou no repositório?");

  // Os arquivos do git E os que ainda não foram adicionados, menos os que o
  // `.gitignore` exclui (18/10/2026). Só com `ls-files`, uma chave num arquivo
  // novo passava pela conferência antes do `git add` e só era vista depois do
  // commit, que é tarde: o push costuma vir junto.
  const arquivos = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: RAIZ, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);

  let lidos = 0;
  for (const arquivo of arquivos) {
    let fonte;
    try {
      fonte = readFileSync(`${RAIZ}${arquivo}`, "utf8");
    } catch {
      continue; // apagado no meio do caminho, ou ilegível
    }
    if (fonte.includes("\u0000")) continue; // binário
    lidos++;

    const linhas = fonte.split("\n");
    for (let i = 0; i < linhas.length; i++) {
      for (const achado of formasNaLinha(linhas[i], arquivo)) {
        relata(`${arquivo}:${i + 1}`, achado);
      }
    }
  }

  if (falhas) {
    console.error(`\n${falhas} achado(s) com forma de chave. NÃO cite o valor em relatório nenhum.`);
    process.exit(1);
  }
  const excecoes = DE_PROPOSITO.length + PUBLICA_POR_DESENHO.length;
  console.log(`Segredo: ${lidos} arquivos de texto lidos, ${FORMAS.length} formas procuradas, nenhuma fora das ${excecoes} exceções nomeadas.`);
}
