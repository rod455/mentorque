// As contas do plano de revisão, conferidas sem navegador.
//
// Por que aqui e não numa suíte de tela: uma data errada não quebra nada
// visível. A tela desenha bonito, o texto sai bem escrito, e a pessoa é
// mandada à oficina no mês errado. É o tipo de defeito que só uma asserção
// sobre o NÚMERO pega, e é o tipo que custa caro em confiança.
//
// Rode com: npm run conferir:revisoes
import {
  planoDoItem,
  planoDosItens,
  somarMeses,
  visitaUnica,
  type PlanoDeItem,
} from "../lib/app/planoDeRevisao.ts";
import type { ServiceRecord, Vehicle } from "../lib/app/types.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const HOJE = new Date("2026-08-30T12:00:00");

const carro = (extra: Partial<Vehicle> = {}): Vehicle => ({
  id: "v1",
  type: "car",
  make: "Volkswagen",
  model: "Golf",
  year: 2018,
  ...extra,
});

const servico = (type: string, date: string, km?: number): ServiceRecord => ({
  id: `s-${type}-${date}`,
  vehicleId: "v1",
  type,
  date,
  km: km ?? 0,
  total: 0,
  parts: [],
  notes: "",
});

// ── somarMeses ──────────────────────────────────────────────────────────────
conferir("somarMeses soma um ano", somarMeses("2026-03-12", 12) === "2027-03-12");
conferir(
  "somarMeses não escorrega de mês (31/01 + 1 = 28/02)",
  somarMeses("2026-01-31", 1) === "2026-02-28",
  `deu ${somarMeses("2026-01-31", 1)}`,
);
conferir("somarMeses respeita ano bissexto", somarMeses("2024-01-31", 1) === "2024-02-29");
conferir("somarMeses recusa data inválida", somarMeses("nem-data", 3) === null);

// ── data prevista pelo tempo ────────────────────────────────────────────────
{
  // Óleo: a cada 10.000 km OU 12 meses. Última troca em 12/03/2026, 90.000 km.
  const p = planoDoItem(carro({ odometerKm: 95700 }), [servico("oil", "2026-03-12", 90000)], "oil", HOJE)!;
  conferir("óleo: data prevista é a última + 12 meses", p.dataPrevista === "2027-03-12", `deu ${p.dataPrevista}`);
  conferir("óleo: âncora é o serviço", p.ancora === "servico");
  conferir("óleo: km previsto é 90.000 + 10.000", p.kmPrevisto === 100000, `deu ${p.kmPrevisto}`);
  conferir("óleo: faltam 4.300 km", p.kmRestantes === 4300, `deu ${p.kmRestantes}`);
  conferir("óleo: não é estimado (tem registro)", p.kmEstimado === false);
  conferir("óleo: não está vencido", p.vencido === false);
}

// Sem serviço do tipo: a âncora vira a data de compra.
{
  const p = planoDoItem(carro({ purchaseDate: "2024-06-10", odometerKm: 30000 }), [], "brakefluid", HOJE)!;
  conferir("fluido: 24 meses a partir da compra", p.dataPrevista === "2026-06-10", `deu ${p.dataPrevista}`);
  conferir("fluido: âncora é a compra", p.ancora === "compra");
  conferir("fluido: vencido (a data passou)", p.vencido === true);
}

// ── o caso do usado sem histórico ───────────────────────────────────────────
//
// É a razão de kmEstimado existir. A conta ingênua (0 + intervalo) diria que a
// troca de óleo de um carro com 98.000 km está "vencida há 88.000 km", que é
// ruído com cara de dado.
{
  const p = planoDoItem(carro({ odometerKm: 98000 }), [], "oil", HOJE)!;
  conferir("usado sem histórico: previsão vai para os 100.000", p.kmPrevisto === 100000, `deu ${p.kmPrevisto}`);
  conferir("usado sem histórico: faltam 2.000 km", p.kmRestantes === 2000, `deu ${p.kmRestantes}`);
  conferir("usado sem histórico: marcado como estimado", p.kmEstimado === true);
  conferir(
    "usado sem histórico: NÃO diz que venceu há 88.000 km",
    p.kmRestantes! > 0,
    `kmRestantes = ${p.kmRestantes}`,
  );
}

// Odômetro exatamente no múltiplo: a próxima é a seguinte, não a de agora.
{
  const p = planoDoItem(carro({ odometerKm: 100000 }), [], "oil", HOJE)!;
  conferir("odômetro no múltiplo: previsão é a próxima", p.kmPrevisto === 110000, `deu ${p.kmPrevisto}`);
}

// ── sem dado nenhum ─────────────────────────────────────────────────────────
{
  const p = planoDoItem(carro(), [], "airfilter", HOJE);
  conferir("sem km e sem prazo: devolve null em vez de inventar", p === null);
}

// ── vencido pelo km ─────────────────────────────────────────────────────────
{
  const p = planoDoItem(carro({ odometerKm: 102000 }), [servico("oil", "2026-08-01", 90000)], "oil", HOJE)!;
  conferir("óleo vencido pelo km", p.vencido === true);
  conferir("óleo vencido: km restante negativo", p.kmRestantes === -2000, `deu ${p.kmRestantes}`);
  conferir(
    "vencido pelo km mesmo com a data ainda no futuro",
    p.dataPrevista === "2027-08-01" && p.vencido === true,
  );
}

// ── a visita única ──────────────────────────────────────────────────────────
{
  // Fluido de freio (24 meses a partir da compra) cai em 10/06/2026; óleo (12
  // meses a partir da última) cai em 01/07/2026, 21 dias depois. Bateria (48
  // meses) só em 2028 e fica de fora — é ela que prova que a janela filtra.
  const v = carro({ purchaseDate: "2024-06-10", odometerKm: 30000 });
  const servicos = [servico("oil", "2025-07-01", 29000)];
  const planos = planoDosItens(v, servicos, ["oil", "brakefluid", "battery"], HOJE);

  const grupo = visitaUnica(planos, 90);
  conferir("visita única: existe com 2+ itens próximos", grupo !== null);
  if (grupo) {
    const datas = planos
      .filter((p) => grupo.keys.includes(p.key))
      .map((p) => p.dataPrevista!)
      .sort();
    conferir(
      "visita única: sugere o dia MAIS CEDO do grupo, nunca o mais tarde",
      grupo.dia === datas[0],
      `sugeriu ${grupo.dia}, mais cedo é ${datas[0]}`,
    );
    conferir("visita única: junta pelo menos dois", grupo.keys.length >= 2);
    conferir(
      "visita única: deixa de fora o item que só cai em 2028",
      !grupo.keys.includes("battery"),
      `juntou ${grupo.keys.join(", ")}`,
    );
  }
}

// Um item só não vira sugestão de juntar.
{
  const p: PlanoDeItem[] = [
    { key: "oil", dataPrevista: "2027-01-10", mesesIntervalo: 12, ancora: "servico", kmRestantes: null, kmIntervalo: null, kmPrevisto: null, kmEstimado: false, vencido: false },
  ];
  conferir("visita única: um item só não sugere nada", visitaUnica(p, 90) === null);
}

// Datas distantes não viram uma visita só.
{
  const base = { mesesIntervalo: 12, ancora: "servico" as const, kmRestantes: null, kmIntervalo: null, kmPrevisto: null, kmEstimado: false, vencido: false };
  const p: PlanoDeItem[] = [
    { key: "oil", dataPrevista: "2027-01-10", ...base },
    { key: "battery", dataPrevista: "2028-11-01", ...base },
  ];
  conferir("visita única: itens a dois anos de distância não se juntam", visitaUnica(p, 90) === null);
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de revisão reprovaram.`);
  process.exit(1);
}
console.log("Revisões: as contas de data e de km conferem.");
