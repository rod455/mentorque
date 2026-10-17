// O que é grátis e o que é Premium: a regra e quem a usa (17/10/2026).
//
// POR QUE. Decisão do dono em 17/10 (docs/agentes/propostas/o-que-sai-do-gratis.md):
// a segunda consulta de sintoma mostra só a causa mais provável no grátis, e o
// custo por km do caderno de gastos vira Premium. Um defeito aqui tem dois
// lados ruins: aberto demais, o Premium perde o motivo; fechado demais, a
// pessoa perde o valor antes de vê-lo (a primeira consulta tem de ser inteira).
// E a tabela do Premium tem de dizer o mesmo que o código: em 17/10 duas linhas
// dela mentiam.
//
// Rode com: npm run conferir:gratis
import { readFileSync } from "node:fs";
import { causasLivres, itensLivres } from "../lib/app/primeiroSintoma.ts";
import { LIMITE_GRATIS_POR_MES } from "../lib/biela/limite.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Grátis: a primeira consulta inteira, o custo por km no Premium e a tabela dizendo a verdade.");

// ── a regra ─────────────────────────────────────────────────────────────────
{
  conferir("a primeira consulta de sintoma mostra todas as causas", causasLivres({ premium: false, ehOPrimeiro: true, total: 5 }) === 5);
  conferir("da segunda em diante, o grátis vê só a mais provável", causasLivres({ premium: false, ehOPrimeiro: false, total: 5 }) === 1);
  conferir("o Premium vê tudo sempre", causasLivres({ premium: true, ehOPrimeiro: false, total: 5 }) === 5);
  conferir("sintoma sem causa não vira número negativo", causasLivres({ premium: false, ehOPrimeiro: false, total: 0 }) === 0);
  conferir("o checklist da primeira consulta vem inteiro", itensLivres({ premium: false, ehOPrimeiro: true, total: 8 }) === 8);
  conferir("da segunda em diante, os 3 primeiros itens", itensLivres({ premium: false, ehOPrimeiro: false, total: 8 }) === 3);
}

// ── quem usa a regra ────────────────────────────────────────────────────────
{
  const sintomas = leia("components/app/screens/Symptoms.tsx");
  conferir(
    "a tela de sintoma pergunta se é a primeira e passa isso à regra",
    /useState\(\(\) => ehOPrimeiroSintoma\(id\)\)/.test(sintomas) &&
      /causasLivres\(\{ premium: s\.premium, ehOPrimeiro, total: sx\.causes\.length \}\)/.test(sintomas),
  );
  conferir(
    "e corta as causas pelo número que a regra devolveu",
    /shownCauses = sx\.causes\.slice\(0, livres\)/.test(sintomas) && /lockedCauses = sx\.causes\.slice\(livres\)/.test(sintomas),
  );
  conferir(
    "o checklist usa a mesma regra",
    /itensLivres\(\{ premium: s\.premium, ehOPrimeiro: ehOPrimeiroSintoma\(symptomId\), total: sx\.checklist\.length \}\)/.test(sintomas),
  );

  const abastecimento = leia("components/app/screens/Abastecimento.tsx");
  conferir(
    "o custo por km só aparece em número para o Premium",
    /salvo\.custoPorKm != null && s\.premium \? \(\s*<p[^>]*>\{brlCentavos\(salvo\.custoPorKm\)\}/.test(abastecimento) &&
      (abastecimento.match(/brlCentavos\(salvo\.custoPorKm\)/g) ?? []).length === 1,
  );
  conferir("e o consumo também", /salvo\.consumo != null && s\.premium &&/.test(abastecimento));

  const home = leia("components/app/screens/Home.tsx");
  conferir("o card do Início não mostra o custo por km ao grátis", /!s\.premium \? ` · \$\{t\.cardPorKmPremium\}`/.test(home));
}

// ── a tabela diz o que o código faz ─────────────────────────────────────────
{
  const conteudo = leia("lib/app/content.ts");
  const tabela = conteudo.slice(conteudo.indexOf("knowTitle:"), conteudo.indexOf("] as { icon: string; label: string; free:"));
  conferir("a tabela existe", tabela.length > 100);
  conferir(
    `a linha do Biela diz o limite que o servidor conta (${LIMITE_GRATIS_POR_MES} por mês)`,
    new RegExp(`Perguntas ao Biela[^\\n]*free: "ltd", nota: T\\("${LIMITE_GRATIS_POR_MES}/mês"`).test(tabela),
  );
  conferir("o Biela não aparece trancado no grátis", !/Biela[^\n]*free: "lock"/.test(tabela));
  conferir("o custo por km aparece trancado no grátis", /Custo por km e consumo[^\n]*free: "lock"/.test(tabela));
  conferir("o plano de revisão não aparece trancado (o grátis tem o plano)", !/Plano de revisão[^\n]*free: "lock"/.test(tabela));
}

if (falhas) {
  console.error(`\nGrátis: ${falhas} conferência(s) reprovada(s).`);
  process.exit(1);
}
console.log("Grátis: a regra, as telas e a tabela dizem a mesma coisa.");
