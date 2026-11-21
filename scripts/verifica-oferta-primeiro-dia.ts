// A oferta do Premium no primeiro dia: quem vê, quem não vê, e a ligação.
//
// POR QUE (16/11/2026, plano de receita). Um defeito aqui tem dois jeitos de
// custar caro: mostrar teste grátis no iPhone, onde a Apple não tem oferta (a
// promessa falsa de outubro), ou mostrar a faixa para sempre, para quem já
// disse "agora não". A regra mora numa função pura e é EXECUTADA aqui; o fonte
// da tela só é lido para provar que ela usa a regra.
//
// Rode com: npm run conferir:oferta-primeiro-dia
import { readFileSync } from "node:fs";
import { DIAS_DA_OFERTA, mostrarOfertaDoPrimeiroDia, type EntradaDaOferta } from "../lib/app/ofertaPrimeiroDia.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Oferta do primeiro dia: para quem aparece, e onde.");

const agora = new Date("2026-11-16T12:00:00Z");
const base: EntradaDaOferta = { premium: false, plataforma: "other", carroDesde: "2026-11-16T09:00:00Z", agora, recusou: false };
const horasAtras = (h: number) => new Date(agora.getTime() - h * 3_600_000).toISOString();

conferir("Android ou web, carro de hoje, sem Premium: aparece", mostrarOfertaDoPrimeiroDia(base) === true);
conferir("no app do iPhone não aparece (a Apple não tem oferta de teste)", mostrarOfertaDoPrimeiroDia({ ...base, plataforma: "ios" }) === false);
conferir("quem é Premium não vê", mostrarOfertaDoPrimeiroDia({ ...base, premium: true }) === false);
conferir("quem tocou em \"agora não\" não vê de novo", mostrarOfertaDoPrimeiroDia({ ...base, recusou: true }) === false);
conferir("sem carro, não aparece", mostrarOfertaDoPrimeiroDia({ ...base, carroDesde: null }) === false);
conferir("data de carro ilegível não vira oferta", mostrarOfertaDoPrimeiroDia({ ...base, carroDesde: "ontem" }) === false);
conferir(`ainda aparece perto do fim dos ${DIAS_DA_OFERTA} dias`, mostrarOfertaDoPrimeiroDia({ ...base, carroDesde: horasAtras(DIAS_DA_OFERTA * 24 - 1) }) === true);
conferir(`some depois de ${DIAS_DA_OFERTA} dias`, mostrarOfertaDoPrimeiroDia({ ...base, carroDesde: horasAtras(DIAS_DA_OFERTA * 24 + 1) }) === false);
conferir("carro com data no futuro (relógio errado) não vira oferta", mostrarOfertaDoPrimeiroDia({ ...base, carroDesde: horasAtras(-5) }) === false);

// A ligação: a tela usa a regra, com a plataforma do TESTE (não a do aparelho),
// e o botão leva ao Premium com a origem que o funil vai contar.
const hub = leia("components/app/screens/CarHub.tsx");
// A LIGAÇÃO SE AFIRMA NAS DUAS PONTAS (21/11/2026, rodada 9 do Guardião).
//
// Era `/mostrarOfertaDoPrimeiroDia\(\{/`, só a chamada. Plantei
// `const mostrarOferta = true || mostrarOfertaDoPrimeiroDia({...})` e esta
// conferência ficou VERDE: a chamada continua escrita, a regra é pulada, e a
// faixa de teste grátis aparece no iPhone, que é a promessa falsa de outubro e
// a razão desta conferência existir.
//
// Texto é o único instrumento que alcança a ligação (a tela não roda aqui), e
// por isso a ligação se afirma nas DUAS pontas: a variável recebendo a chamada
// e a MESMA variável desenhando a faixa. Quem quiser burlar precisa mexer nas
// duas, e aí quebra.
conferir(
  "o CarHub decide pela função pura, e é esse resultado que desenha a faixa",
  /const mostrarOferta = mostrarOfertaDoPrimeiroDia\(\{/.test(hub) &&
    /\{mostrarOferta && \(\s*<div data-oferta-primeiro-dia>/.test(hub),
  "afirmar so a chamada deixa passar `= true || mostrarOferta...`, que foi o plantio de 21/11",
);
conferir("a plataforma vem do trialPlatform()", /plataforma:\s*trialPlatform\(\)\s*===\s*"ios"/.test(hub));
conferir("o botão leva ao Premium com a origem primeiro-dia", /go\(\{ name: "subscribe", ctx: "primeiro-dia" \}\)/.test(hub));
conferir("o \"agora não\" fica gravado", /localStorage\.setItem\(CHAVE_RECUSOU, "1"\)/.test(hub));

if (falhas) {
  console.error(`\n${falhas} falha(s).`);
  process.exit(1);
}
console.log("Oferta do primeiro dia: tudo certo.");
