// A fila do Guardião diz a verdade sobre as conferências que existem?
//
// POR QUE ISTO EXISTE (03/10/2026), e é a recomendação 1 da rodada do Guardião
// daquele dia, nas palavras dele: "a fila do Guardião devia ser conferida por
// uma conferência, não por mim: um `conferir:fila` que reprova quando existe
// `conferir:X` sem linha na tabela resolveria de uma vez o que duas
// recomendações seguidas não resolveram".
//
// Duas recomendações seguidas não resolveram porque a recomendação ia para
// outro papel e envelhecia calada, que é exatamente a regra que DIRETRIZES
// ganhou no mesmo dia. E no dia em que ele escreveu isso já havia um caso vivo
// com menos de 24 horas: `conferir:cadastro`, criada naquela manhã, não estava
// na tabela.
//
// O QUE ELA PROTEGE, e cada item é um jeito diferente de a fila mentir:
//
//   1. conferência que existe e não está na fila NUNCA é sorteada para prova;
//      ela some do rodízio sem ninguém decidir isso;
//   2. linha na fila para conferência que não existe mais faz a rodada gastar
//      tempo procurando e, pior, infla o denominador do "quantas faltam";
//   3. estado escrito fora do molde (uma data inventada, um "em breve") quebra
//      a ordenação, e a ordenação é o que decide quais seis a próxima rodada
//      pega;
//   4. ordem errada entrega as seis primeiras linhas erradas, que é o único
//      jeito de o rodízio inteiro apontar para o lugar errado em silêncio.
//
// O QUE ELA NÃO ALCANÇA: se a conferência é BOA. Isso é a rodada do Guardião,
// plantando defeito. Aqui só se prova que a lista de quem precisa ser provada
// está completa e na ordem certa.
//
// Rode com: npm run conferir:fila
import { readFileSync } from "node:fs";

const RAIZ = new URL("..", import.meta.url).pathname;
const ler = (p: string) => readFileSync(`${RAIZ}${p}`, "utf8");

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Fila: toda conferência que existe está na fila do Guardião, e na ordem que o rodízio usa?");

const pkg = JSON.parse(ler("package.json")) as { scripts: Record<string, string> };
const manual = ler("docs/agentes/guardiao-conferencias.md");
/** O manual sem quebra de linha: frase quebrada em duas linhas é frase presente. */
const manualCorrido = manual.replace(/\s+/g, " ");

// `conferir:tudo` e `conferir:navegador` ficam de fora: o primeiro é o atalho
// que roda os outros, o segundo é a porta das suítes de navegador, que entram
// na fila uma a uma pelo nome da suíte.
const FORA_DA_FILA = new Set(["conferir:tudo", "conferir:navegador"]);
const conferencias = Object.keys(pkg.scripts).filter((k) => k.startsWith("conferir:") && !FORA_DA_FILA.has(k));

const linhas = [...manual.matchAll(/^\| `(conferir:[a-z-]+)` \| ([^|]*)\| ([^|]*)\|$/gm)].map((m) => ({
  nome: m[1]!,
  estado: m[2]!.trim(),
  mordeu: m[3]!.trim(),
}));
const naFila = new Map(linhas.map((l) => [l.nome, l]));

// ── 1. NINGUÉM SOME DO RODÍZIO ─────────────────────────────────────────────
{
  conferir("a fila tem linhas", linhas.length > 10, `achei ${linhas.length}`);
  for (const c of conferencias) {
    conferir(
      `${c} está na fila`,
      naFila.has(c),
      "conferencia fora da fila nunca e sorteada para prova, e some do rodizio sem ninguem decidir isso",
    );
  }
  for (const l of linhas) {
    conferir(
      `${l.nome} da fila existe no package.json`,
      conferencias.includes(l.nome),
      "linha para conferencia que nao existe mais infla o denominador de quantas faltam",
    );
  }
  conferir("não há linha repetida", new Set(linhas.map((l) => l.nome)).size === linhas.length);
}

// ── 2. OS TRÊS ESTADOS, E SÓ ELES ──────────────────────────────────────────
//
// `nunca` (ninguém nunca plantou), `no nascimento (autor), dd/mm/aaaa` (o autor
// plantou ao escrever) e `dd/mm/aaaa` (rodada do Guardião). Estado fora do
// molde quebra a ordenação, e a ordenação é o que escolhe as seis da semana.
{
  const NUNCA = /^nunca$/;
  const NASCIMENTO = /^no nascimento \(autor\), (\d{2})\/(\d{2})\/(\d{4})$/;
  const DATA = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  for (const l of linhas) {
    const ok = NUNCA.test(l.estado) || NASCIMENTO.test(l.estado) || DATA.test(l.estado);
    conferir(`o estado de ${l.nome} está no molde`, ok, `"${l.estado}" não é nunca, nem data, nem nascimento`);

    // Data que o calendário não tem, pelo mesmo motivo da lista do dono: o
    // JavaScript conserta 31/02 sozinho e a ordenação sai torta em silêncio.
    const m = l.estado.match(NASCIMENTO) ?? l.estado.match(DATA);
    if (m) {
      const iso = `${m[3]}-${m[2]}-${m[1]}`;
      const d = new Date(`${iso}T00:00:00Z`);
      conferir(
        `a data de ${l.nome} existe no calendário`,
        !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso,
        l.estado,
      );
    }
  }
  conferir(
    "quem já foi provado diz se mordeu",
    linhas.filter((l) => !NUNCA.test(l.estado)).every((l) => l.mordeu.length > 0),
    `sem isso a fila guarda a data e perde o resultado: ${linhas.filter((l) => !NUNCA.test(l.estado) && !l.mordeu).map((l) => l.nome).join(", ")}`,
  );
  conferir(
    "e quem nunca foi provado não diz nada",
    linhas.filter((l) => NUNCA.test(l.estado)).every((l) => l.mordeu.length === 0),
    "nunca provada com resultado preenchido e contradicao escrita na propria linha",
  );
}

// ── 3. A ORDEM, QUE É O QUE O RODÍZIO USA ──────────────────────────────────
//
// "A próxima rodada pega as seis primeiras linhas e pronto", diz o manual.
// Então a ordem não é estética: ela É a regra de seleção. Primeiro as `nunca`,
// depois as provadas pelo autor, depois as do Guardião.
{
  const peso = (e: string) => (/^nunca$/.test(e) ? 1 : /^no nascimento/.test(e) ? 2 : 3);
  const pesos = linhas.map((l) => peso(l.estado));
  const ordenado = pesos.every((p, i) => i === 0 || pesos[i - 1]! <= p);
  conferir(
    "as nunca provadas vêm primeiro, depois as do autor, depois as do Guardião",
    ordenado,
    "a proxima rodada pega as seis primeiras linhas: ordem errada entrega as seis erradas",
  );

  const primeiras = linhas.slice(0, 6).filter((l) => /^nunca$/.test(l.estado)).length;
  const nunca = linhas.filter((l) => /^nunca$/.test(l.estado)).length;
  conferir(
    "e as seis primeiras são de verdade as mais atrasadas",
    nunca === 0 || primeiras === Math.min(6, nunca),
    `${primeiras} das 6 primeiras são "nunca", e existem ${nunca} nunca provadas`,
  );
}

// ── 4. O NÚMERO QUE O DIRETOR LÊ ───────────────────────────────────────────
//
// A rodada de 03/10 publicou "39 nunca provadas" contando como nunca tudo que
// não passou pelo Guardião. Medido nos commits, 25 daquelas tinham defeito
// plantado no nascimento e as órfãs eram 15. O manual precisa explicar os três
// estados, senão o próximo leitor repete a conta errada.
{
  conferir("o manual explica os três estados", /Os três estados/.test(manual));
  conferir(
    "e diz por que plantio do autor não vale como prova de fora",
    /o autor planta o defeito que ele pensou/.test(manualCorrido),
    "sem isso o estado novo vira um jeito de dar a conferencia por provada",
  );
  const nunca = linhas.filter((l) => l.estado === "nunca").length;
  const nascimento = linhas.filter((l) => /^no nascimento/.test(l.estado)).length;
  const guardiao = linhas.length - nunca - nascimento;
  console.log(`       fila: ${linhas.length} conferências, ${nunca} nunca plantadas, ${nascimento} plantadas pelo autor, ${guardiao} provadas pelo Guardião`);
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da fila reprovaram.`);
  process.exit(1);
}
console.log("Fila: ninguém de fora do rodízio, nenhuma linha órfã, estados no molde e as mais atrasadas em cima.");
