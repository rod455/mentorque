#!/usr/bin/env node
// Planta um defeito, roda uma conferência, desfaz PELA CÓPIA e prova que desfez.
//
// Por que isto existe (10/10/2026): a regra de 13/09 diz que defeito plantado
// se desfaz com cópia de segurança, nunca com `git checkout` de arquivo. Em
// 10/10 o Guardião escreveu o desfazer como `cp ...bak || git checkout`, a
// cópia não existia, e o `git checkout` rodou. Não custou nada daquela vez, e
// é por isso que o atalho é perigoso. Regra que depende de lembrança não é
// regra: aqui ela vira o único caminho.
//
// O que ele garante, nesta ordem:
//   1. a cópia de segurança é escrita ANTES de qualquer mudança, fora do
//      repositório, e se não der para escrevê-la o programa PARA;
//   2. o texto a trocar aparece EXATAMENTE uma vez no arquivo (zero ou mais de
//      uma é erro: plantio que não sabe onde caiu não prova nada);
//   3. a conferência roda sozinha, e o código de saída é lido direto, sem cano;
//   4. o arquivo volta pela cópia, e o programa confere byte a byte que voltou,
//      inclusive quando a conferência estoura ou alguém aperta Ctrl+C.
//
// Uso:
//   node scripts/plantio.mjs <conferir:nome> <arquivo> <texto-antigo> <texto-novo> [args da conferência]
//
// O que vem depois do texto novo vai para a conferência. É o que deixa plantar
// contra UMA suíte de navegador (`... conferir:navegador <arquivo> <a> <b> km`),
// em vez de rodar a bateria inteira de 11 minutos por um plantio.
//
// Exemplo (o defeito de 30/08, no consumidor da pilha):
//   node scripts/plantio.mjs conferir:navegacao lib/app/nav.tsx \
//     'setP((s) => comNovaRaiz(s, v))' 'setP(() => ({ views: [v], raizes: [] }))'
//
// Imprime "MORDEU" quando a conferência reprova com o defeito de pé, e "CEGA"
// quando ela passa. O código de saída do programa é 0 quando mordeu e 2 quando
// ficou cega, para dar para encadear numa prova maior. Qualquer problema de
// processo (cópia, texto, restauração) sai com 1 e explica.
import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { tmpdir } from "node:os";

const [conferencia, arquivo, antigo, novo, ...argsDaConferencia] = process.argv.slice(2);
if (!conferencia || !arquivo || antigo === undefined || novo === undefined) {
  console.error("uso: node scripts/plantio.mjs <conferir:nome> <arquivo> <texto-antigo> <texto-novo>");
  process.exit(1);
}
if (!/^conferir:[\w-]+$/.test(conferencia)) {
  console.error(`"${conferencia}" não é um script conferir:* do package.json`);
  process.exit(1);
}
const caminho = resolve(arquivo);
if (!existsSync(caminho)) {
  console.error(`arquivo não existe: ${arquivo}`);
  process.exit(1);
}

// 1. A cópia, fora do repositório, antes de tudo. Sem ela, nada acontece.
const pasta = resolve(tmpdir(), "mentorque-plantio");
mkdirSync(pasta, { recursive: true });
const copia = resolve(pasta, `${basename(arquivo)}.${Date.now()}.bak`);
const original = readFileSync(caminho);
writeFileSync(copia, original);
if (!existsSync(copia) || !readFileSync(copia).equals(original)) {
  console.error(`não consegui escrever a cópia de segurança em ${copia}; PARANDO sem tocar no arquivo`);
  process.exit(1);
}

// 2. O texto tem de aparecer uma vez só.
const texto = original.toString("utf8");
const ocorrencias = texto.split(antigo).length - 1;
if (ocorrencias !== 1) {
  console.error(`o texto antigo aparece ${ocorrencias} vez(es) em ${arquivo}; precisa aparecer exatamente 1. Nada foi mudado.`);
  process.exit(1);
}

let restaurado = false;
function restaurar() {
  if (restaurado) return;
  copyFileSync(copia, caminho);
  restaurado = readFileSync(caminho).equals(original);
  if (!restaurado) {
    console.error(`ATENÇÃO: ${arquivo} NÃO voltou ao original. A cópia está em ${copia}; restaure à mão com cp.`);
    process.exit(1);
  }
}
// 3. Planta e roda a conferência sozinha, lendo o código de saída direto.
//
// A conferência roda SEM bloquear este processo, e todo sinal de parada
// restaura. Até 22/10/2026 só o Ctrl+C (SIGINT) restaurava, e a conferência
// rodava num `spawnSync`: um `timeout` em volta do plantio manda SIGTERM, o
// processo morria no meio da suíte de navegador, e o defeito ficou de pé no
// `Health.tsx`. Voltou pela cópia, à mão. Regra que depende de como o
// processo morre não é regra.
writeFileSync(caminho, texto.replace(antigo, novo));
//
// `detached` põe a conferência num grupo de processos próprio, e a parada mata
// o grupo inteiro: a suíte de navegador sobe um servidor de desenvolvimento
// que, morto só o `npm`, ficava solto segurando a porta.
const filho = spawn("npm", ["run", "--silent", conferencia, ...argsDaConferencia], { stdio: ["ignore", "pipe", "pipe"], detached: true });
for (const sinal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sinal, () => {
    try { process.kill(-filho.pid, "SIGTERM"); } catch { /* o grupo já acabou */ }
    restaurar();
    console.error(`${sinal}: plantio interrompido, ${arquivo} restaurado pela cópia (${copia})`);
    process.exit(1);
  });
}
process.on("exit", () => restaurar());
let saidaTexto = "";
filho.stdout.on("data", (d) => { saidaTexto += d; });
filho.stderr.on("data", (d) => { saidaTexto += d; });
const saida = await new Promise((ok) => filho.on("close", (codigo) => ok(codigo ?? 1)));

// 4. Desfaz pela cópia e confere que desfez.
restaurar();

const veredito = saida === 0 ? "CEGA" : "MORDEU";
console.log(`${veredito}  ${conferencia} com o defeito em ${arquivo}: saída ${saida}; arquivo restaurado pela cópia (${copia})`);
if (saida === 0) {
  const ultimas = saidaTexto.trim().split("\n").slice(-3).join("\n");
  if (ultimas) console.log(ultimas);
}
process.exit(saida === 0 ? 2 : 0);
