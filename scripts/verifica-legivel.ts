// O retrato publica número onde não dá para ler?
//
// POR QUE ISTO EXISTE (28/09/2026), e a frase é do dono: "estamos a mais de um
// mês medindo semana a semana e até hoje temos partes que não estão mensuradas
// corretamente".
//
// A história, em cinco dias, com as colunas certas existindo o tempo todo:
//
//   23/09  o QA consertou NA FONTE: as views de coorte ganharam
//          `semana_fechada`, `janela_fechada`, `d1_7_fechada`, `d8_30_fechada`,
//          e `conferir:coorte` passou a cobrar que elas existam;
//   25/09  o CRO publicou "coorte de 14/09 FECHADA, zero voltando em 1 a 7
//          dias". A `d1_7_fechada` daquela coorte era FALSE;
//   28/09  o Diretor abriu o relatório com "a última coorte fechada voltou
//          ZERO", e a retenção virou a métrica da operação em cima disso.
//
// Ou seja: a conferência de 23/09 cobrava que a COLUNA existisse, e ela
// existia. Ninguém cobrava que ela CHEGASSE a quem lê. Esta cobra.
//
// O que ela protege:
//   1. janela aberta não vira número: o lugar dele é ocupado pelo motivo;
//   2. janela fechada continua virando número, senão a régua vira um muro;
//   3. as contas de fechamento são as do QA (coorte+14 e coorte+37), e mexer
//      numa delas em silêncio é o jeito de a linha voltar a mentir;
//   4. o retrato PUBLICA as linhas prontas, senão elas existem e ninguém usa,
//      que é exatamente o que aconteceu com as colunas.
//
// O QUE ELA NÃO ALCANÇA: o texto do retrato é montado no n8n. Esta conferência
// garante que a frase certa SAIA por `/api/dados`; imprimir a frase em vez de
// remontá-la é um passo no painel, e enquanto ele não for dado o retrato
// continua com o texto antigo.
//
// Rode com: npm run conferir:legivel
import { readFileSync } from "node:fs";
import { FECHA_D1_7, FECHA_D8_30, linhaDeAtivacao, linhaDeRetencao, maisDias } from "../lib/retratoLegivel.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Retrato: janela aberta vira motivo, e não número?");

// ── 1. AS CONTAS DAS JANELAS ────────────────────────────────────────────────
{
  conferir("a semana de 7 dias fecha em coorte+14", FECHA_D1_7 === 14, `está em ${FECHA_D1_7}`);
  conferir("a de 8 a 30 fecha em coorte+37", FECHA_D8_30 === 37, `está em ${FECHA_D8_30}`);
  conferir("somar dias atravessa a virada do mês", maisDias("2026-09-28", 14) === "2026-10-12", maisDias("2026-09-28", 14));
  conferir("e a virada do ano", maisDias("2026-12-28", 14) === "2027-01-11", maisDias("2026-12-28", 14));
}

// ── 2. O CASO REAL DE 25/09, QUE FOI PUBLICADO ERRADO ───────────────────────
//
// A coorte de 14/09, como ela estava no banco naquele dia e ainda hoje:
// `d1_7_fechada = false`. A frase publicada foi "coorte FECHADA, zero
// voltando". Esta linha existe para essa frase não poder mais nascer.
{
  const l = linhaDeRetencao({
    coorte: "2026-09-14",
    cadastrados: 16,
    voltaram_d1_7: 0,
    voltaram_d8_30: 0,
    d1_7_fechada: false,
    d8_30_fechada: false,
  });
  conferir("coorte com janela aberta NÃO é legível", l.legivel === false);
  conferir(
    "e o texto não diz '0 voltaram' como se fosse resultado",
    !/0 voltaram em 1 a 7 dias/.test(l.texto),
    l.texto,
  );
  conferir("o texto diz que não dá para ler", /AINDA NAO DA PARA LER/.test(l.texto), l.texto);
  conferir("e diz QUANDO vai dar", /fecha em 2026-09-28/.test(l.texto), l.texto);
  conferir("o número cru continua lá, marcado como piso", /PISO/.test(l.texto), l.texto);
  conferir("o motivo nomeia as duas janelas abertas", /1 a 7 dias e 8 a 30 dias/.test(l.motivo), l.motivo);
}

// ── 3. JANELA FECHADA CONTINUA VIRANDO NÚMERO ───────────────────────────────
//
// A régua não pode virar um muro que recusa tudo: a coorte madura é o que
// sustenta qualquer leitura de retenção.
{
  const l = linhaDeRetencao({
    coorte: "2026-08-01",
    cadastrados: 8,
    voltaram_d1_7: 1,
    voltaram_d8_30: 2,
    d1_7_fechada: true,
    d8_30_fechada: true,
  });
  conferir("coorte madura é legível", l.legivel === true, l.motivo);
  conferir("e sai com os dois números", /1 voltaram em 1 a 7 dias, 2 em 8 a 30 dias/.test(l.texto), l.texto);
  conferir("sem ressalva sobrando", l.motivo === "", l.motivo);
  conferir("e sem a palavra PISO", !/PISO/.test(l.texto), l.texto);
}

// ── 4. A MEIA MATURIDADE, QUE É O CASO MAIS COMUM ───────────────────────────
//
// Em 28/09 TODAS as quatro coortes do retrato estavam assim: a de 1 a 7 dias
// fechada e a de 8 a 30 aberta. As quatro apareciam com "0 em 8 a 30 dias".
{
  const l = linhaDeRetencao({
    coorte: "2026-09-07",
    cadastrados: 11,
    voltaram_d1_7: 1,
    voltaram_d8_30: 1,
    d1_7_fechada: true,
    d8_30_fechada: false,
  });
  conferir("meia maturidade não é legível", l.legivel === false);
  conferir("a metade madura sai como número", /1 voltaram em 1 a 7 dias/.test(l.texto), l.texto);
  conferir("e só a outra vira motivo", /8 a 30 dias AINDA NAO DA PARA LER/.test(l.texto), l.texto);
  conferir("o motivo nomeia só a aberta", l.motivo === "janela(s) em aberto: 8 a 30 dias", l.motivo);
}

// ── 5. ATIVAÇÃO, o caso que sugeria uma queda que não existe ────────────────
//
// "2 de 51" (janela aberta) impresso ao lado de "6 de 11" (fechada) sugere uma
// queda de 55% para 4%. A primeira não é uma taxa.
{
  const aberta = linhaDeAtivacao({ coorte: "2026-09-21", cadastrados: 51, ativados_7d: 2, janela_fechada: false });
  conferir("ativação com janela aberta não é legível", aberta.legivel === false);
  conferir("e não sai como '2 de 51 fizeram'", !/2 de 51 fizeram/.test(aberta.texto), aberta.texto);
  conferir("diz quando fecha", /fecha em 2026-10-05/.test(aberta.texto), aberta.texto);

  const fechada = linhaDeAtivacao({ coorte: "2026-09-07", cadastrados: 11, ativados_7d: 6, janela_fechada: true });
  conferir("ativação madura é legível", fechada.legivel === true);
  conferir("e sai como número", /6 de 11 fizeram/.test(fechada.texto), fechada.texto);
}

// ── 6. COLUNA AUSENTE É TRATADA COMO ABERTA ─────────────────────────────────
//
// Se a view perder a coluna, o certo é calar, não afirmar. Falhar para o lado
// de "não sei" é o único lado seguro numa medida que vira decisão.
{
  const l = linhaDeRetencao({ coorte: "2026-09-07", cadastrados: 11, voltaram_d1_7: 1, voltaram_d8_30: 1 });
  conferir("retenção sem a coluna de maturidade NÃO se diz legível", l.legivel === false, l.motivo);

  // A ativação precisa do MESMO caso, e esta linha nasceu de um defeito
  // plantado que não mordeu: trocar `=== true` por `!== false` na ativação
  // passava verde, porque este bloco só cobria a retenção. Conferência que
  // cobre metade de uma regra deixa a outra metade sem rede.
  const a = linhaDeAtivacao({ coorte: "2026-09-07", cadastrados: 11, ativados_7d: 6 });
  conferir("ativação sem a coluna de maturidade NÃO se diz legível", a.legivel === false, a.motivo);
  conferir("e o texto dela também cala o número", /AINDA NAO DA PARA LER/.test(a.texto), a.texto);

  // E o nulo, que é o que o Postgres devolve quando a coluna existe e a linha
  // não tem valor: mesmo tratamento do ausente.
  const n = linhaDeRetencao({ coorte: "2026-09-07", cadastrados: 11, voltaram_d1_7: 1, voltaram_d8_30: 1, d1_7_fechada: null, d8_30_fechada: null });
  conferir("nulo na coluna é tratado como janela aberta", n.legivel === false, n.motivo);
}

// ── 7. E O RETRATO PUBLICA AS LINHAS ────────────────────────────────────────
//
// Sem isto, elas existem e ninguém usa, que é palavra por palavra o que
// aconteceu com as colunas entre 23 e 28/09.
{
  const operacao = readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8");
  conferir("o retrato publica as linhas de retenção", /linhasRetencao:/.test(operacao));
  conferir("e as de ativação", /linhasAtivacao:/.test(operacao));
  conferir(
    "as duas saem da função, e não de uma cópia local",
    /\.map\(linhaDeRetencao\)/.test(operacao) && /\.map\(linhaDeAtivacao\)/.test(operacao),
    "regra copiada no leitor é regra que para de acompanhar a fonte, que é o defeito do Guardião de 26/09",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de legibilidade reprovaram.`);
  process.exit(1);
}
console.log("Retrato: janela aberta sai como motivo, janela fechada sai como número.");
