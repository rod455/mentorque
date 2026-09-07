// Há quantos dias cada ação do dono está parada.
//
// Lê docs/agentes/acoes-do-dono.md e ordena pela mais velha. Sem opinião, sem
// análise: a análise é do relatório semanal, e esta lista existe justamente
// porque uma coisa parada há quatro dias ainda não chegou a nenhuma cobrança
// semanal (ver o cabeçalho do próprio documento).
//
//   npm run acoes            imprime a lista
//   npm run conferir:acoes   confere só o formato, e reprova se ele mentir
//
// A conferência NÃO reprova por idade, de propósito. Bloquear o push de quem
// programa porque alguém não entrou num console de terceiro seria castigar a
// pessoa errada, e conferência que castiga errado é conferência que alguém
// desliga.
import { readFileSync } from "node:fs";

const CAMINHO = "docs/agentes/acoes-do-dono.md";
const texto = readFileSync(new URL(`../${CAMINHO}`, import.meta.url), "utf8");
const soConferir = process.argv.includes("--conferir");

type Acao = { desde: string; dias: number; acao: string; porque: string; quem: string };

const hoje = new Date();
hoje.setUTCHours(0, 0, 0, 0);

const problemas: string[] = [];
const acoes: Acao[] = [];

// Só as linhas da tabela: começam com barra, têm cinco colunas, e a primeira
// precisa ser uma data. O cabeçalho e o separador caem fora por isso mesmo.
for (const linha of texto.split("\n")) {
  if (!linha.trim().startsWith("|")) continue;
  const col = linha.split("|").slice(1, -1).map((c) => c.trim());
  if (col.length !== 4) {
    if (col.length && /^\d{4}-\d{2}-\d{2}$/.test(col[0])) problemas.push(`linha com ${col.length} colunas em vez de 4: ${linha.trim().slice(0, 60)}`);
    continue;
  }
  const [desde, acao, porque, quem] = col;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) continue; // cabeçalho e separador

  const d = new Date(`${desde}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) {
    problemas.push(`data que não existe: ${desde}`);
    continue;
  }
  const dias = Math.round((hoje.getTime() - d.getTime()) / 86400000);
  if (dias < 0) problemas.push(`data no futuro: ${desde} (${acao.slice(0, 40)})`);
  if (!acao) problemas.push(`ação sem texto na linha de ${desde}`);
  if (!quem) problemas.push(`falta quem levantou, na linha de ${desde}`);
  acoes.push({ desde, dias, acao, porque, quem });
}

if (soConferir) {
  console.log("Ações do dono: a lista de idade está com data que dá para acreditar?");
  if (!acoes.length) problemas.push(`${CAMINHO} não tem nenhuma linha de ação; se a lista zerou de verdade, tudo bem, mas quase sempre é a tabela que quebrou`);
  for (const p of problemas) console.error(`FALHA  ${p}`);
  if (problemas.length) {
    console.error(`\n${problemas.length} problema(s) na lista de ações. Uma lista de idade com data errada mente com cara de dado.`);
    process.exit(1);
  }
  console.log(`Ações do dono: ${acoes.length} na lista, todas com data que existe e não está no futuro.`);
  process.exit(0);
}

acoes.sort((a, b) => b.dias - a.dias);

if (!acoes.length) {
  console.log("Nada parado esperando o dono. Se isso te surpreendeu, confira a tabela em " + CAMINHO + ".");
  process.exit(0);
}

console.log(`\nParADO ESPERANDO O DONO (${acoes.length}), da mais velha para a mais nova:\n`.replace("ParADO", "PARADO"));
for (const a of acoes) {
  const idade = a.dias === 0 ? "entrou hoje" : a.dias === 1 ? "1 dia" : `${a.dias} dias`;
  console.log(`  ${idade.padStart(11)}  ${a.acao}`);
  console.log(`               ${a.porque}`);
  console.log(`               desde ${a.desde}, levantada por ${a.quem}\n`);
}
const velha = acoes[0];
if (velha.dias >= 3) {
  console.log(`A mais velha está parada há ${velha.dias} dias. Quando isso custa dinheiro por dia, o custo já passou de "lembrete".`);
}
