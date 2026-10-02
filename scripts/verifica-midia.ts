// O gasto de anúncio: a frase do retrato esconde campanha parada?
//
// POR QUE ISTO EXISTE (02/10/2026). O caso real: em 24/09 o agente de Mídia leu
// R$ 163,59 numa janela de oito datas como "uns R$ 20 por dia" e propôs uma ação
// de R$ 640 por mês. A campanha tinha parado naquele mesmo dia, e o dinheiro da
// janela estava todo nas primeiras datas. O total estava certo e a leitura
// estava errada, e isso custou uma proposta inteira mais oito dias de fila.
//
// Esta conferência usa os NÚMEROS DAQUELE DIA como caso de teste. Se a frase
// não gritar neles, ela não serve: foi exatamente ali que a casa errou.
//
// O QUE ELA NÃO ALCANÇA: a frase é por FONTE (a conta inteira do Google, a
// conta inteira do Meta), porque o retrato só recebe o `porDia` da conta. Uma
// campanha que para dentro de uma conta que continua gastando não aparece aqui,
// e o lugar de ver isso é a coleta por campanha que o agente faz na rodada.
// Dizer isso é parte do trabalho: conferência que promete o que não alcança é
// pior que conferência que falta.
//
// Rode com: npm run conferir:midia
import {
  DIAS_DA_PONTA,
  FONTES_DE_GASTO,
  QUEDA_QUE_E_PARADA,
  gastoDoDia,
  linhaDeGasto,
  ritmoDeGasto,
} from "../lib/midiaLegivel.ts";
import { readFileSync } from "node:fs";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

console.log("Mídia: a frase do gasto esconde campanha que parou de entregar?");

// ── 1. O CASO DE 24/09: A BUSCA QUE PAROU ──────────────────────────────────
//
// Oito datas, o dinheiro nas primeiras, impressão caindo antes do gasto. É o
// retrato do erro, com a ordem de grandeza real daquela semana.
{
  const busca = [
    { dia: "2026-09-17", custo: 20.1, impressoes: 1958 },
    { dia: "2026-09-18", custo: 21.4, impressoes: 1810 },
    { dia: "2026-09-19", custo: 19.8, impressoes: 1702 },
    { dia: "2026-09-20", custo: 22.3, impressoes: 1500 },
    { dia: "2026-09-21", custo: 20.9, impressoes: 980 },
    { dia: "2026-09-22", custo: 18.78, impressoes: 668 },
    { dia: "2026-09-23", custo: 1.2, impressoes: 98 },
    { dia: "2026-09-24", custo: 0.4, impressoes: 70 },
  ];
  const l = linhaDeGasto("google_ads", busca, "2026-09-24");
  conferir("a frase grita que a campanha parou", l.parada === true, l.texto);
  conferir("e diz com todas as letras que não é economia", /e nao economia/.test(l.texto), l.texto);
  conferir("o total continua lá, porque ele não é mentira", /R\$ 124,88/.test(l.texto), l.texto);
  conferir("a janela inteira aparece", /2026-09-17 a 2026-09-24/.test(l.texto), l.texto);
  conferir("a data da leitura aparece", /lido em 2026-09-24/.test(l.texto), l.texto);
  conferir("o ritmo das duas pontas aparece", /por dia nos 3 primeiros/.test(l.texto), l.texto);
  conferir("a queda da impressão entra como reforço", /impressao caiu \d+% no mesmo periodo/.test(l.texto), l.texto);
  conferir(
    "e a causa NÃO é inventada",
    /A causa mora no painel/.test(l.texto) && /NAO da para dizer qual|não dá para dizer qual/.test(l.texto),
    l.texto,
  );
  conferir("o motivo diz QUAL sinal disparou", /fim da janela seco/.test(l.motivo), l.motivo);
  conferir("e o sinal aparece na frase", /Nos 2 ultimos dias saiu/.test(l.texto), l.texto);
}

// ── 2. SEMANA NORMAL NÃO VIRA ALARME ───────────────────────────────────────
//
// Esta é a metade que decide se alguém vai manter a frase: alarme que dispara
// com oscilação de leilão é alarme que alguém desliga, e aí o de verdade
// também morre.
{
  const normal = [
    { dia: "2026-09-25", custo: 21.25, impressoes: 1108 },
    { dia: "2026-09-26", custo: 21.01, impressoes: 1029 },
    { dia: "2026-09-27", custo: 26.35, impressoes: 915 },
    { dia: "2026-09-28", custo: 25.05, impressoes: 2364 },
    { dia: "2026-09-29", custo: 19.9, impressoes: 1500 },
    { dia: "2026-09-30", custo: 23.4, impressoes: 1600 },
  ];
  const l = linhaDeGasto("google_ads", normal, "2026-10-02");
  conferir("semana normal não é chamada de parada", l.parada === false, l.texto);
  conferir("e não ganha suspeita inventada", !/PAROU|suspeita/i.test(l.texto), l.texto);
  conferir("mas ainda traz janela, ritmo e data da leitura", /janela/.test(l.texto) && /Ritmo/.test(l.texto) && /lido em/.test(l.texto), l.texto);
}

// ── 3. IMPRESSÃO CAINDO ANTES DO GASTO: AVISO, NÃO PROVA ───────────────────
{
  const antes = [
    { dia: "2026-09-25", custo: 21, impressoes: 2000 },
    { dia: "2026-09-26", custo: 20, impressoes: 1900 },
    { dia: "2026-09-27", custo: 21, impressoes: 1800 },
    { dia: "2026-09-28", custo: 20, impressoes: 300 },
    { dia: "2026-09-29", custo: 19, impressoes: 200 },
    { dia: "2026-09-30", custo: 21, impressoes: 150 },
  ];
  const l = linhaDeGasto("google_ads", antes, "2026-10-02");
  conferir("não chama de parada, porque o gasto não caiu", l.parada === false, l.texto);
  conferir("mas avisa que a impressão caiu antes", /impressao cai ANTES do gasto|impressão cai ANTES/i.test(l.texto), l.texto);
  conferir("e diz que é suspeita, não prova", /suspeita, nao prova|suspeita, não prova/i.test(l.texto), l.texto);
}

// ── 4. O QUE A FRASE FAZ QUANDO NÃO DÁ PARA DIZER ──────────────────────────
{
  const curta = [
    { dia: "2026-10-01", custo: 20 },
    { dia: "2026-10-02", custo: 1 },
  ];
  const l = linhaDeGasto("meta_ads", curta, "2026-10-02");
  conferir("janela curta não vira alarme", l.parada === false, l.texto);
  conferir("e o motivo é dito em vez de omitido", /Janela curta demais/.test(l.texto), l.texto);
  conferir("precisa de duas pontas de verdade", ritmoDeGasto(curta) === null, JSON.stringify(ritmoDeGasto(curta)));

  const vazia = linhaDeGasto("meta_ads", [], "2026-10-02");
  conferir("sem dado nenhum, diz que não há dado", /nenhum dia de gasto/.test(vazia.texto), vazia.texto);
  conferir("e não chama ausência de dado de parada", vazia.parada === false, vazia.texto);
}

// ── 5. AS DUAS FONTES ESCREVEM O GASTO COM NOMES DIFERENTES ────────────────
//
// O Google manda `custo` e o Meta manda `gasto`. Ler só um dos dois daria
// R$ 0,00 numa conta que gasta, que é zero com cara de medida.
{
  conferir("o `custo` do Google é lido", gastoDoDia({ dia: "x", custo: 12.5 }) === 12.5);
  conferir("o `gasto` do Meta é lido", gastoDoDia({ dia: "x", gasto: 7.25 }) === 7.25);
  conferir("campo ausente é zero e não NaN", gastoDoDia({ dia: "x" }) === 0);
  conferir("texto no lugar do número não contamina a soma", gastoDoDia({ dia: "x", custo: "abc" as unknown as number }) === 0);

  const meta = [
    { dia: "2026-09-25", gasto: 20.96, impressoes: 1578 },
    { dia: "2026-09-26", gasto: 16.74, impressoes: 1605 },
    { dia: "2026-09-27", gasto: 17.42, impressoes: 1909 },
    { dia: "2026-09-28", gasto: 0.2, impressoes: 40 },
    { dia: "2026-09-29", gasto: 0.1, impressoes: 30 },
    { dia: "2026-09-30", gasto: 0, impressoes: 10 },
  ];
  const l = linhaDeGasto("meta_ads", meta, "2026-10-02");
  conferir("e a conta do Meta parada também grita", l.parada === true, l.texto);
}

// ── 6. A RÉGUA NÃO DISPARA COM OSCILAÇÃO NORMAL ────────────────────────────
{
  conferir("o limiar é alto o bastante para não pegar leilão", QUEDA_QUE_E_PARADA >= 0.6, String(QUEDA_QUE_E_PARADA));
  conferir("e baixo o bastante para pegar parada", QUEDA_QUE_E_PARADA <= 0.9, String(QUEDA_QUE_E_PARADA));
  conferir("a ponta tem pelo menos três dias", DIAS_DA_PONTA >= 3, String(DIAS_DA_PONTA));

  // Queda de 50% é semana fraca, não parada.
  const fraca = [
    { dia: "2026-09-25", custo: 20 },
    { dia: "2026-09-26", custo: 20 },
    { dia: "2026-09-27", custo: 20 },
    { dia: "2026-09-28", custo: 10 },
    { dia: "2026-09-29", custo: 10 },
    { dia: "2026-09-30", custo: 10 },
  ];
  conferir("queda de metade não é parada", linhaDeGasto("google_ads", fraca, "2026-10-02").parada === false);
}

// ── 7. O RETRATO PUBLICA A FRASE, E NÃO SÓ O TOTAL ─────────────────────────
//
// Regra da semana: conserto na fonte que não muda o consumidor não é conserto.
// A frase existir e o retrato não imprimir é o mesmo que não ter escrito.
{
  const op = semComentarios(readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8"));
  conferir("o retrato publica a frase pronta", /gastoLegivel: FONTES_DE_GASTO\.map/.test(op), "funcao que ninguem chama nao e entrega");
  conferir("e ela é montada com linhaDeGasto", /linhaDeGasto\(f, dados\.porDia \?\? \[\], pacote\?\.dia/.test(op), op.includes("linhaDeGasto") ? "chamada diferente do esperado" : "nem chama");
  conferir(
    "a data da leitura vem do pacote, não de hoje",
    /pacote\?\.dia \?\? "sem coleta"/.test(op),
    "carimbar hoje num pacote de ontem e exatamente o defeito que o frescor das fontes existe para pegar",
  );
  conferir("as duas fontes de gasto entram", FONTES_DE_GASTO.length === 2 && FONTES_DE_GASTO.includes("meta_ads"), FONTES_DE_GASTO.join(", "));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da frase de mídia reprovaram.`);
  process.exit(1);
}
console.log("Mídia: a janela está dentro da frase, parada não passa por economia, e oscilação não vira alarme.");
