// O caderno de gastos: as contas do abastecimento e as ligações.
//
// O que protege (13/09/2026):
//   1. custo por km e consumo só existem com DOIS pontos, e o primeiro tanque
//      não conta (foi consumido antes do trecho medido);
//   2. gasto por período inclui o primeiro, porque dinheiro é dinheiro;
//   3. o km nunca anda para trás;
//   4. registrar carimba o km do carro (é o que tira a pergunta mensal);
//   5. as ligações: card no Início abaixo do carro, tela, histórico, funil.
//
// Rode com: npm run conferir:combustivel
import { readFileSync } from "node:fs";
import { consumoKmPorLitro, custoPorKm, devolucao, gastoDaSemana, gastoDoMes, gastoNoPeriodo, kmValido } from "../lib/app/combustivel.ts";
import type { Abastecimento } from "../lib/app/types.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

console.log("Combustível: custo por km com dois pontos, o primeiro tanque de fora, o km só para frente.");

const a = (date: string, km: number, valor: number, litros?: number): Abastecimento => ({ id: `${date}-${km}`, vehicleId: "v1", date, km, valor, litros, combustivel: "gasolina" });

// ── 1. dois pontos ──────────────────────────────────────────────────────────
conferir("sem abastecimento, custo por km é null", custoPorKm([]) === null);
conferir("com um só, custo por km é null", custoPorKm([a("2026-09-01", 98000, 180, 30)]) === null);
const dois = [a("2026-09-01", 98000, 180, 30), a("2026-09-08", 98300, 200, 32)];
conferir("com dois, o custo é o segundo valor dividido pelos km rodados (200 / 300)", custoPorKm(dois) === 0.67, String(custoPorKm(dois)));
conferir("o consumo é km rodados sobre os litros do segundo (300 / 32)", consumoKmPorLitro(dois) === 9.4, String(consumoKmPorLitro(dois)));
const tres = [...dois, a("2026-09-13", 98700, 210, 33)];
conferir("com três, soma os dois últimos sobre o trecho inteiro (410 / 700)", custoPorKm(tres) === 0.59, String(custoPorKm(tres)));
conferir("a ordem da lista não importa", custoPorKm([...tres].reverse()) === 0.59);
conferir("sem litros, consumo é null mas custo por km existe", consumoKmPorLitro([a("2026-09-01", 98000, 180), a("2026-09-08", 98300, 200)]) === null && custoPorKm([a("2026-09-01", 98000, 180), a("2026-09-08", 98300, 200)]) === 0.67);
conferir("km igual nos dois pontos não divide por zero", custoPorKm([a("2026-09-01", 98000, 180), a("2026-09-08", 98000, 200)]) === null);

// ── 2. o período inclui o primeiro ──────────────────────────────────────────
conferir("gasto no período soma tudo o que cai nele", gastoNoPeriodo(tres, "2026-09-01", "2026-09-08") === 380);
const hoje = new Date("2026-09-13T12:00:00");
conferir("a semana são os últimos sete dias, hoje incluído (08 e 13 entram, 01 não)", gastoDaSemana(tres, hoje) === 410, String(gastoDaSemana(tres, hoje)));
conferir("o mês é o mês civil", gastoDoMes([...tres, a("2026-08-30", 97800, 150)], hoje) === 590);
const dev = devolucao(tres, hoje);
conferir("a devolução junta as três contas e o número de lançamentos", dev.custoPorKm === 0.59 && dev.consumo === 10.8 && dev.mes === 590 && dev.lancamentos === 3, JSON.stringify(dev));

// ── 3. o km só para frente ──────────────────────────────────────────────────
conferir("km menor que o atual é recusado", kmValido(90000, 98000) === "menor");
conferir("km igual ao atual passa", kmValido(98000, 98000) === null);
conferir("km sem número é inválido", kmValido(NaN, 98000) === "invalido");
conferir("sem km atual, qualquer km válido passa", kmValido(10, undefined) === null);

// ── 4 e 5. as ligações ──────────────────────────────────────────────────────
{
  const store = leia("lib/app/store.tsx");
  conferir("registrar carimba o km e a data do km", /addAbastecimento[\s\S]{0,600}kmUpdatedAt: new Date\(\)\.toISOString\(\)/.test(store));
  conferir("a sessão leva os abastecimentos para a nuvem", /abastecimentos: mergeById\(cloud\.abastecimentos/.test(store));
  conferir("apagar o carro apaga os abastecimentos dele", /abastecimentos = \(p\.abastecimentos \?\? \[\]\)\.filter\(\(r\) => r\.vehicleId !== id\)/.test(store));

  const home = leia("components/app/screens/Home.tsx");
  const carro = home.indexOf("HealthPill score=");
  const custo = home.indexOf("<CustoDoCarro ");
  const fixados = home.indexOf("{/* Fixados");
  conferir("o card Custo do carro fica abaixo do card do carro e acima do resto", carro > 0 && custo > carro && fixados > custo);
  conferir("o card abre a tela de abastecimento com a origem", /name: "abastecimento", origem: "inicio"/.test(home));

  const tela = leia("components/app/screens/Abastecimento.tsx");
  conferir("a tela emite registrou_abastecimento com a origem", /funil\("registrou_abastecimento",\s*\{[^}]*origem/.test(tela));
  conferir("a tela recusa km menor antes de salvar", /kmValido\(kmN, v\.odometerKm\)/.test(tela) && tela.indexOf("kmValido(") < tela.indexOf("addAbastecimento(rec)"));
  conferir("a devolução aparece depois de salvar", /devolucaoTitulo/.test(tela) && /brlCentavos\(salvo\.custoPorKm\)/.test(tela));

  const historico = leia("components/app/screens/History.tsx");
  conferir("o histórico lista os abastecimentos junto dos serviços", /data-abastecimento/.test(historico) && /abastecimentosFor\(s, v\.id\)/.test(historico));
  conferir("a soma do mês fica grátis no topo do histórico", /data-faixa-do-mes/.test(historico));
  conferir("o relatório de gastos inclui combustível", /abastecimentos\.reduce\(\(a, x\) => a \+ x\.valor, 0\)/.test(historico));

  conferir("a navegação conhece a tela", /name: "abastecimento"/.test(leia("lib/app/nav.tsx")));
  conferir("o Shell desenha a tela na aba do histórico", /case "abastecimento": return <AbastecimentoScreen/.test(leia("components/app/telas.tsx")) && /abastecimento: "history"/.test(leia("components/app/Shell.tsx")));
  for (const [arq, re] of [
    ["lib/app/funil.ts", /"registrou_abastecimento"/],
    ["lib/funilCorreto.ts", /registrou_abastecimento: "aparelho"/],
    ["lib/funilCorreto.ts", /registrou_abastecimento: "sessao"/],
    ["lib/funilCorreto.ts", /registrou_abastecimento: "2026-09-13"/],
    ["app/api/funil/route.ts", /"registrou_abastecimento"/],
    ["supabase/funil_eventos.sql", /'registrou_abastecimento'/],
  ] as const) {
    conferir(`o funil conhece registrou_abastecimento em ${arq}`, re.test(leia(arq)));
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de combustível reprovaram.`);
  process.exit(1);
}
console.log("Combustível: as contas fecham, o km só anda para frente, e o card está no lugar que o CRO decidiu.");
