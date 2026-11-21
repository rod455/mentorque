// A pesquisa curta: o que vale como resposta, quem vê, e a rota que grava.
//
// POR QUE (16/11/2026, plano de receita). As respostas desta pesquisa vão
// decidir onde o dinheiro da mídia vai. Um defeito aqui aparece como número
// inventado (valor fora da lista entrando no banco), como resposta pela metade
// contada como resposta, ou como a pesquisa interrompendo quem acabou de
// chegar. As regras são executadas; a rota só é lida para provar que as usa.
//
// Rode com: npm run conferir:pesquisa
import { readFileSync } from "node:fs";
import { completa, DIAS_PARA_PERGUNTAR, mostrarPesquisa, respostasValidas, TETO_DO_LIVRE } from "../lib/pesquisa/perguntas.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Pesquisa curta: respostas válidas, quem vê e a rota.");

const cheia = { sentir: "muito", gasto: "ate500", seguro: "sim", preco: "ate10" };
conferir("as quatro respostas da lista passam", JSON.stringify(respostasValidas(cheia)) === JSON.stringify(cheia), JSON.stringify(respostasValidas(cheia)));
conferir("valor fora da lista é descartado", respostasValidas({ ...cheia, preco: "R$ 1.000" }).preco === undefined);
conferir("pergunta inventada não entra", !("cpf" in respostasValidas({ ...cheia, cpf: "123" })));
conferir("entrada que não é objeto vira vazia", JSON.stringify(respostasValidas("oi")) === "{}" && JSON.stringify(respostasValidas(null)) === "{}");
conferir("o texto livre é cortado no teto", (respostasValidas({ livre: "x".repeat(TETO_DO_LIVRE + 50) }).livre ?? "").length === TETO_DO_LIVRE);
conferir("texto livre só de espaços não entra", respostasValidas({ livre: "   " }).livre === undefined);
conferir("com as quatro, está completa", completa(respostasValidas(cheia)));
conferir("faltando uma, não está", !completa(respostasValidas({ sentir: "muito", gasto: "ate500", seguro: "sim" })));
conferir("o texto livre sozinho não completa", !completa(respostasValidas({ livre: "pagaria se..." })));

const agora = new Date("2026-11-16T12:00:00Z");
const diasAtras = (d: number) => new Date(agora.getTime() - d * 86_400_000).toISOString();
conferir(`quem começou há ${DIAS_PARA_PERGUNTAR} dias vê`, mostrarPesquisa({ comecouEm: diasAtras(DIAS_PARA_PERGUNTAR), agora, jaFeita: false }));
conferir("quem chegou hoje não vê", !mostrarPesquisa({ comecouEm: diasAtras(0), agora, jaFeita: false }));
conferir("quem já respondeu ou dispensou não vê", !mostrarPesquisa({ comecouEm: diasAtras(30), agora, jaFeita: true }));
conferir("sem data de começo, não vê", !mostrarPesquisa({ comecouEm: null, agora, jaFeita: false }));
conferir("data ilegível não vira pesquisa", !mostrarPesquisa({ comecouEm: "ontem", agora, jaFeita: false }));

const rota = leia("app/api/pesquisa/route.ts");
// A LIGAÇÃO NAS DUAS PONTAS (21/11/2026, rodada 9 do Guardião). Era
// `/respostasValidas\(body\.respostas\)/`, só a chamada. Plantei
// `const r = (respostasValidas(body.respostas), body.respostas);` e esta
// conferência ficou VERDE: o filtro roda, o resultado é jogado fora, e o corpo
// CRU vai para o banco, que é o item 1 do que esta conferência existe para
// pegar (valor fora da lista entrando no banco). Então a asserção prende a
// variável recebendo a chamada, e o que vai para o banco saindo dela.
conferir(
  "a rota filtra pela lista, e é o filtrado que vai para o banco",
  /const r = respostasValidas\(body\.respostas\);/.test(rota) &&
    /sentir: r\.sentir,[\s\S]{0,200}preco: r\.preco,/.test(rota),
  "afirmar so a chamada deixa passar `(respostasValidas(...), body.respostas)`, que foi o plantio de 21/11",
);
conferir("a rota recusa resposta incompleta", /if \(!completa\(r\)\) return NextResponse\.json\(\{ ok: false, error: "incompleta" \}, \{ status: 422 \}\)/.test(rota));
conferir("a rota grava uma por aparelho", /onConflict: "pesquisa,anon_id", ignoreDuplicates: true/.test(rota));
const card = leia("components/app/PesquisaCurta.tsx");
conferir("o card decide pela função pura", /mostrarPesquisa\(\{ comecouEm, agora: new Date\(\), jaFeita \}\)/.test(card));

if (falhas) {
  console.error(`\n${falhas} falha(s).`);
  process.exit(1);
}
console.log("Pesquisa curta: tudo certo.");
