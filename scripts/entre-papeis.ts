// A fila entre papéis: o que um papel deixou com outro, por idade.
//
// Irmã da `acoes-do-dono.ts`, e nasceu em 06/10/2026 da leitura de outubro do
// Diretor: "recomendação que depende de outro papel envelhece calada" foi
// escrita com palavras quase iguais em quatro manuais no mesmo dia, e dois
// desfechos medidos (a recomendação do Guardião que envelheceu um mês, o
// relatório da Mídia que não chegou a quem devia). Quatro manuais com a mesma
// frase não são quatro falhas, é instrumento faltando.
//
// Lê docs/agentes/entre-papeis.md, ordena pela mais velha e agrupa por quem
// recebe. `--conferir` só confere o formato. NÃO reprova por idade, de
// propósito: pedido parado aparece em bloco próprio e o Diretor o lê na
// segunda; travar o push de quem programa porque uma rodada semanal não
// chegou castiga a pessoa errada (mesma razão da fila do dono).
//
// Os papéis válidos vêm da TABELA de DIRETRIZES, não de uma lista aqui: uma
// segunda lista seria regra copiada, que diverge em silêncio.
import { readFileSync } from "node:fs";

const CAMINHO = "docs/agentes/entre-papeis.md";
const raiz = new URL("..", import.meta.url);
const ler = (p: string) => readFileSync(new URL(p, raiz), "utf8");
const texto = ler(CAMINHO);
const soConferir = process.argv.includes("--conferir");

/** Apelido de cada papel: a primeira palavra do nome na tabela do time. */
const PAPEIS = new Set<string>(["Engenharia"]);
for (const m of ler("docs/agentes/DIRETRIZES.md").matchAll(/^\| ([^|]+?) \| [^|]+\| [^|]+\| [a-z-]+\.md \|$/gm)) {
  const nome = m[1]!.trim();
  if (nome === "Papel") continue;
  PAPEIS.add(nome.split(/[\s/]/)[0]!);
}

/** Passado disto, o pedido não está esperando a rodada: está esquecido. */
const DIAS_PARADO = 14;

type Pedido = { desde: string; de: string; para: string; pedido: string; porque: string; dias: number };

const hoje = new Date();
hoje.setUTCHours(0, 0, 0, 0);
const problemas: string[] = [];
const pedidos: Pedido[] = [];

for (const linha of texto.split("\n")) {
  if (!linha.trim().startsWith("|")) continue;
  const col = linha.split("|").slice(1, -1).map((c) => c.trim());
  if (col.length !== 5) {
    if (col.length && /^\d{4}-\d{2}-\d{2}$/.test(col[0]!)) problemas.push(`linha com ${col.length} colunas em vez de 5: ${linha.trim().slice(0, 60)}`);
    continue;
  }
  const [desde, de, para, pedido, porque] = col as [string, string, string, string, string];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) {
    if (desde !== "Desde" && !/^-+$/.test(desde)) problemas.push(`linha sem data no lugar da data: "${desde.slice(0, 20)}" (${pedido.slice(0, 40)})`);
    continue;
  }
  const d = new Date(`${desde}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== desde) {
    problemas.push(`data que o calendário não tem: ${desde}`);
    continue;
  }
  const dias = Math.round((hoje.getTime() - d.getTime()) / 86400000);
  if (dias < 0) problemas.push(`data no futuro: ${desde} (${pedido.slice(0, 40)})`);
  for (const [rotulo, papel] of [["De", de], ["Para", para]] as const) {
    if (!PAPEIS.has(papel)) problemas.push(`${rotulo} "${papel}" não é papel da tabela do time (linha de ${desde}). Válidos: ${[...PAPEIS].join(", ")}`);
  }
  if (/^dono$/i.test(para)) problemas.push(`pedido para o dono na linha de ${desde}: vai para acoes-do-dono.md`);
  if (!pedido) problemas.push(`pedido sem texto na linha de ${desde}`);
  if (!porque) problemas.push(`pedido sem o porquê na linha de ${desde}`);
  pedidos.push({ desde, de, para, pedido, porque, dias });
}

if (soConferir) {
  console.log("Fila entre papéis: as linhas têm data que dá para acreditar e papéis que existem?");
  for (const p of problemas) console.error(`FALHA  ${p}`);
  if (problemas.length) {
    console.error(`\n${problemas.length} problema(s) na fila entre papéis.`);
    process.exit(1);
  }
  console.log(`Fila entre papéis: ${pedidos.length} pedido(s), todos com data que o calendário tem e papéis da tabela.`);
  process.exit(0);
}

pedidos.sort((a, b) => b.dias - a.dias);
if (!pedidos.length) {
  console.log(`Nenhum pedido parado entre papéis. Se isso te surpreendeu, confira a tabela em ${CAMINHO}.`);
  process.exit(0);
}
const idadeDe = (dias: number) => (dias === 0 ? "entrou hoje" : dias === 1 ? "1 dia" : `${dias} dias`);
const porPara = new Map<string, Pedido[]>();
for (const p of pedidos) porPara.set(p.para, [...(porPara.get(p.para) ?? []), p]);

console.log(`\nPARADO ENTRE PAPÉIS: ${pedidos.length} pedido(s), para ${porPara.size} papel(is). Quem recebe abre a rodada por aqui:\n`);
for (const [para, lista] of [...porPara.entries()].sort((x, y) => y[1][0]!.dias - x[1][0]!.dias)) {
  console.log(`  ${para}  (${lista.length === 1 ? "1 pedido" : `${lista.length} pedidos`})`);
  for (const p of lista) {
    console.log(`     ${idadeDe(p.dias).padStart(11)}  de ${p.de}: ${p.pedido}`);
    console.log(`                  ${p.porque}`);
  }
  console.log("");
}
const parados = pedidos.filter((p) => p.dias > DIAS_PARADO);
if (parados.length) {
  console.log(`SEM MOVIMENTO há mais de ${DIAS_PARADO} dias: ${parados.length}. O Diretor cobra na segunda, com o custo de hoje ou a decisão de fechar.\n`);
  for (const p of parados) console.log(`  ${idadeDe(p.dias).padStart(11)}  ${p.de} -> ${p.para}: ${p.pedido.slice(0, 90)}`);
  console.log("");
}
