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
// A VARREDURA SEMANAL CONTINUA, e não é redundante: ela olha o DIFF da semana
// com commit e linha, serve para contar exposição, e alcança o que foi apagado
// depois (esta aqui só vê o estado de agora). As duas perguntas são diferentes:
// aqui, "tem segredo no repositório?"; lá, "entrou segredo esta semana?".
//
// O QUE ELA NÃO ALCANÇA, e é muito: segredo que nunca passou pelo git. As
// chaves em texto puro dos fluxos do n8n, que foram o achado das rodadas 2, 3 e
// 4, vivem no n8n e não aqui. Nenhuma conferência de repositório vê aquilo.
//
// Rode com: npm run conferir:segredo
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

console.log("Segredo: alguma chave com forma de verdade entrou no repositório?");

const arquivos = execFileSync("git", ["ls-files"], { cwd: RAIZ, encoding: "utf8" })
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
    for (const [nome, forma] of FORMAS) {
      const m = linhas[i].match(forma);
      if (!m) continue;

      const liberado = DE_PROPOSITO.some(([a, f]) => a === arquivo && f === nome);
      if (liberado && pareceModelo(m[0])) continue;

      falhas++;
      // NUNCA imprimir o valor: a regra do manual é dizer ONDE está e nunca O
      // QUE É, porque segredo citado no relatório vazou duas vezes.
      console.error(`FALHA  ${nome} em ${arquivo}:${i + 1} (trecho de ${m[0].length} caracteres)`);
      if (liberado) {
        console.error("       este arquivo tem exceção para esta forma, e o trecho NÃO parece modelo:");
        console.error("       tem dígito ou corrida longa, ou seja, tem cara de valor de verdade");
      } else {
        console.error("       tire o valor do repositório e gire a chave; depois diga ao dono");
        console.error("       se for molde e não valor, acrescente o par a DE_PROPOSITO com o motivo");
      }
    }
  }
}

if (falhas) {
  console.error(`\n${falhas} achado(s) com forma de chave. NÃO cite o valor em relatório nenhum.`);
  process.exit(1);
}
console.log(`Segredo: ${lidos} arquivos de texto lidos, nenhuma forma de chave fora dos ${DE_PROPOSITO.length} moldes conhecidos.`);
