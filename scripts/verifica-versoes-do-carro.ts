// A versão do carro da pessoa sobrevive até a tela?
//
// POR QUE ISTO EXISTE (28/09/2026). Chegou uma foto: alguém cadastrando um
// Hyundai Creta Ultimate 2.0 22/23, a lista de versões parando em "Creta
// Limited 1.0 TB 12V Flex Aut.", e a frase "não tem ele aqui".
//
// A FIPE tinha. A nossa rota devolvia, na posição 29 de 29. A TELA cortava em
// 12, e o décimo segundo item era exatamente a última linha da foto.
//
// O que esta conferência protege:
//
//   1. na dúvida, MOSTRA. Versão cujo ano não deu para conferir não some;
//   2. o caso da foto, inteiro, do que a rota devolve ao que a tela desenha;
//   3. a tela não corta de novo o que a rota já limitou;
//   4. o teto do filtro de ano cobre os carros populares. Ele era 20, e o
//      Creta tem 29 e o Gol mais de 30: o filtro se desligava justamente onde
//      era mais necessário;
//   5. a rota e a tela leem os MESMOS números, de um arquivo só.
//
// O QUE ELA NÃO ALCANÇA: a FIPE. Ela não faz rede. Se a FIPE parar de trazer a
// versão, quem percebe é o relato, não esta conferência.
//
// Rode com: npm run conferir:versoes-do-carro
import { readFileSync } from "node:fs";
import {
  LOTE_DE_ANO,
  MAX_VERSOES,
  ORCAMENTO_DE_ANO_MS,
  TETO_PARA_FILTRAR_POR_ANO,
  versaoServeParaOAno,
} from "../lib/app/versoesDoCarro.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

console.log("Versão do carro: a da pessoa chega até a tela?");

// ── 1. NA DÚVIDA, MOSTRA ────────────────────────────────────────────────────
//
// É a regra da casa nesta tela, e cada linha aqui é um jeito de a dúvida
// aparecer no mundo real.
{
  conferir("sem ano escolhido, toda versão serve", versaoServeParaOAno(["2018-1"], null));
  conferir("chamada que FALHOU não esconde a versão", versaoServeParaOAno(null, 2022), "timeout nosso não pode apagar o carro de alguém");
  conferir("resposta vazia não esconde a versão", versaoServeParaOAno([], 2022));
  conferir("ano que bate, serve", versaoServeParaOAno(["2021-1", "2022-1"], 2022));
  conferir("ano que não bate, sai", versaoServeParaOAno(["2018-1", "2019-1"], 2022) === false);
  // Zero-km: a FIPE usa "32000-..." para o ano corrente.
  conferir("zero-km não é confundido com o ano pedido", versaoServeParaOAno(["32000-1"], 2022) === false);
}

// ── 2. O CASO DA FOTO, INTEIRO ──────────────────────────────────────────────
//
// A lista abaixo é a resposta REAL de /api/versions para Hyundai Creta 2022,
// colhida em 28/09/2026, na ordem em que veio. Ela está aqui inteira de
// propósito: o defeito era de POSIÇÃO, e uma lista resumida não o reproduz.
const CRETA_2022 = [
  "Creta 1 Million 1.6 16V Flex Aut.",
  "Creta Action 1.0 TB 12V Aut.",
  "Creta Action 1.6 16V Flex Aut.",
  "Creta Attitude 1.6 16V Flex Aut.",
  "Creta Attitude 1.6 16V Flex Mec.",
  "Creta Attitude Plus 1.6 16V Flex Aut.",
  "Creta Comfort 1.0 TB 12V Flex Aut.",
  "Creta Comfort Plus 1.0 TB 12V Flex Aut.",
  "Creta Comfort Safety 1.0 TB 12V Aut.",
  "Creta Launch Edition 1.6 16V Flex Aut.",
  "Creta Limit. Safety 1.0 TB 12V Flex Aut.",
  "Creta Limited 1.0 TB 12V Flex Aut.",
  "Creta Limited Edition 1.6 16V Flex Aut.",
  "Creta N Line 1.0 TB 12V Flex Aut.",
  "Creta N Line 1.6 TB 12V Flex Aut.",
  "Creta N Line Night Ed. 2.0 16V Flex Aut.",
  "Creta Plat. Safety 1.0 TB 12V Flex Aut.",
  "Creta Platinum 1.0 TB 12V Flex Aut.",
  "Creta Prestige 2.0 16V Flex Aut.",
  "Creta Pulse 1.6 16V Flex Aut.",
  "Creta Pulse 1.6 16V Flex Mec.",
  "Creta Pulse 2.0 16V Flex Aut.",
  "Creta Pulse Plus 1.6 16V Flex Aut.",
  "Creta Smart 1.6 16V Flex Aut.",
  "Creta Smart Plus 1.6 16V Flex Aut.",
  "Creta Sport 2.0 16V Flex Aut.",
  "Creta Ultimate 1.6 TB 16V Aut.",
  "Creta Ultimate 1.6 TB 16V Flex Aut.",
  "Creta Ultimate 2.0 16V Flex Aut.",
];
const O_CARRO_DELA = "Creta Ultimate 2.0 16V Flex Aut.";

/** O que a TELA desenha, copiado de components/app/screens/Cars.tsx. */
function oQueATelaDesenha(versoes: string[], digitado: string): string[] {
  const q = digitado.trim().toLowerCase();
  return versoes.filter((v) => !q || v.toLowerCase().includes(q)).filter((v) => v.toLowerCase() !== q);
}

{
  conferir(
    "a lista do caso real continua com 29 versões",
    CRETA_2022.length === 29,
    "se alguém mexer nesta lista, o resto desta seção deixa de reproduzir o defeito"
  );
  conferir(
    "o carro dela é o ÚLTIMO da lista, que é o que fazia o defeito",
    CRETA_2022[CRETA_2022.length - 1] === O_CARRO_DELA
  );

  // A rota devolve, e o teto dela não pode cortar o caso real.
  const daRota = CRETA_2022.slice(0, MAX_VERSOES);
  conferir("a rota devolve o carro dela", daRota.includes(O_CARRO_DELA), `teto da rota: ${MAX_VERSOES}`);

  // E a tela desenha, sem a pessoa digitar nada. Este é O teste.
  const naTela = oQueATelaDesenha(daRota, "");
  conferir(
    "a tela desenha o carro dela SEM ela digitar nada",
    naTela.includes(O_CARRO_DELA),
    `a tela desenhou ${naTela.length} de ${daRota.length}; o último foi "${naTela[naTela.length - 1]}"`
  );

  // O sintoma exato do relato, para ninguém achar que a conferência é teórica:
  // com o corte de 12 que existia, a lista terminava na linha da foto.
  const comOCorteAntigo = oQueATelaDesenha(daRota, "").slice(0, 12);
  conferir(
    "e o corte antigo de 12 REALMENTE escondia o carro dela",
    !comOCorteAntigo.includes(O_CARRO_DELA) &&
      comOCorteAntigo[comOCorteAntigo.length - 1] === "Creta Limited 1.0 TB 12V Flex Aut.",
    "se isto passar a ser falso, esta conferência parou de reproduzir o defeito que a fez nascer"
  );

  // E quem digita acha do mesmo jeito.
  conferir("digitar 'ultimate 2.0' acha o carro dela", oQueATelaDesenha(daRota, "ultimate 2.0").includes(O_CARRO_DELA));
  conferir("digitar 'ULTIMATE' sem ligar para maiúscula também", oQueATelaDesenha(daRota, "ULTIMATE").length === 3);
}

// ── 3. A TELA NÃO CORTA O QUE A ROTA JÁ LIMITOU ─────────────────────────────
//
// Dois tetos para a mesma lista, e o de baixo menor que o de cima, é o defeito
// de 28/09 inteiro. Quem mexe num não sabe do outro.
{
  const tela = leia("components/app/screens/Cars.tsx");
  const bloco = /const verMatches = versions([\s\S]*?);\n/.exec(tela)?.[1] ?? "";
  conferir("o bloco do verMatches continua sendo encontrado", bloco.length > 0, "o arquivo mudou de forma; releia antes de confiar nesta conferência");
  conferir(
    "a tela NÃO corta a lista de versões",
    !/\.slice\(/.test(bloco),
    `apareceu um corte novo em verMatches: ${bloco.trim().slice(0, 120)}. Quem limita é a rota; a caixa já rola sozinha.`
  );
}

// ── 4. O TETO DO FILTRO DE ANO COBRE OS CARROS POPULARES ────────────────────
//
// Ele era 20. O Creta tem 29 versões e o Gol mais de 30, então o filtro de ano
// se desligava exatamente nos modelos com mais versões, que são os que mais
// precisam dele. O resultado era uma lista longa E de todos os anos.
{
  conferir(
    "o teto do filtro de ano cobre o Creta (29 versões)",
    TETO_PARA_FILTRAR_POR_ANO >= 29,
    `está em ${TETO_PARA_FILTRAR_POR_ANO}; com 20, o Creta e o Gol ficavam sem filtro de ano`
  );
  conferir(
    "o teto do filtro alcança tudo o que a rota pode devolver",
    TETO_PARA_FILTRAR_POR_ANO >= MAX_VERSOES,
    "versão que a rota devolve e o filtro não alcança é versão de ano errado na cara da pessoa"
  );
  conferir("o orçamento de tempo cabe no maxDuration da rota", ORCAMENTO_DE_ANO_MS < 15000);
  conferir("o lote é maior que um, senão a conferência de ano vira fila", LOTE_DE_ANO > 1);
}

// ── 5. A ROTA LÊ OS MESMOS NÚMEROS, E NÃO OS DELA ───────────────────────────
{
  const rota = leia("app/api/versions/route.ts");
  for (const nome of ["MAX_VERSOES", "TETO_PARA_FILTRAR_POR_ANO", "ORCAMENTO_DE_ANO_MS", "LOTE_DE_ANO"]) {
    conferir(`a rota usa ${nome} do arquivo de regras`, rota.includes(nome), "número escrito à mão na rota volta a divergir da tela");
  }
  conferir(
    "a rota decide o ano pela função com a regra da dúvida",
    /versaoServeParaOAno\(/.test(rota),
    "sem ela, a rota volta a descartar em silêncio a versão cuja conferência falhou"
  );
  conferir(
    "a rota não voltou a cortar em número escrito à mão",
    !/\.slice\(0,\s*\d+\)/.test(rota),
    "o corte tem que sair de MAX_VERSOES, senão os dois lados divergem de novo"
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) das versões do carro reprovaram.`);
  process.exit(1);
}
console.log(
  `Versão do carro: o Creta Ultimate 2.0 chega à tela, o filtro de ano cobre até ${TETO_PARA_FILTRAR_POR_ANO}\n` +
    "versões, e na dúvida a lista mostra em vez de esconder."
);
