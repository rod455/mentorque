// O modo motorista de aplicativo: a conta do dia e as ligações.
//
// O que protege (13/09/2026, peça 4 da rotina do carro):
//   1. o custo do dia é km rodado vezes o custo por km, e sem dois
//      abastecimentos NÃO há custo (a conta diz que falta, não inventa);
//   2. a reserva de manutenção só entra com serviço com valor E 500 km
//      registrados nos últimos 12 meses; senão fica de fora;
//   3. sobrou é ganhou menos custou; lucro por km é sobrou pelos km;
//   4. o mês soma os dias e conta os dias com lançamento;
//   5. as ligações: interruptor no Perfil, o card do Início troca de cara
//      com o modo ligado, a tela, o histórico, o resumo do mês, o funil.
//
// Rode com: npm run conferir:motorista
import { readFileSync } from "node:fs";
import { contaDoDia, contaDoMes, contaDoPeriodo, lancamentoValido, reservaPorKm } from "../lib/app/motorista.ts";
import type { Abastecimento, Ganho, ServiceRecord } from "../lib/app/types.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

console.log("Motorista: ganhou, custou, sobrou; sem custo por km, a conta diz que falta.");

const a = (date: string, km: number, valor: number): Abastecimento => ({ id: `a-${date}`, vehicleId: "v1", date, km, valor, litros: 30, combustivel: "gasolina" });
const g = (date: string, valor: number, km: number): Ganho => ({ id: `g-${date}`, vehicleId: "v1", date, valor, km });
const sv = (date: string, km: number, total?: number): ServiceRecord => ({ id: `s-${date}`, vehicleId: "v1", type: "oil", date, km, total, parts: [] });

// Dois abastecimentos: R$ 0,67 por km (200 / 300).
const dois = [a("2026-09-01", 98000, 180), a("2026-09-08", 98300, 200)];

// ── 1. sem custo por km, sem custo ──────────────────────────────────────────
{
  const c = contaDoDia({ ganhos: [g("2026-09-13", 240, 180)], abastecimentos: [], servicos: [], hoje: "2026-09-13" });
  conferir("sem abastecimento, ganhou e km saem mas custou e sobrou são null", c.ganhou === 240 && c.km === 180 && c.custou === null && c.sobrou === null && c.lucroPorKm === null, JSON.stringify(c));
  const um = contaDoDia({ ganhos: [g("2026-09-13", 240, 180)], abastecimentos: [dois[0]], servicos: [], hoje: "2026-09-13" });
  conferir("com um abastecimento só, ainda sem custo", um.custou === null);
}

// ── 2 e 3. a conta do dia ───────────────────────────────────────────────────
{
  const c = contaDoDia({ ganhos: [g("2026-09-13", 240, 180), g("2026-09-12", 300, 200)], abastecimentos: dois, servicos: [], hoje: "2026-09-13" });
  conferir("o dia conta só os lançamentos de hoje", c.ganhou === 240 && c.km === 180 && c.dias === 1, JSON.stringify(c));
  conferir("custou é km × custo por km (180 × 0,67 = 120,60)", c.custou === 120.6, String(c.custou));
  conferir("sobrou é ganhou menos custou (119,40)", c.sobrou === 119.4, String(c.sobrou));
  conferir("lucro por km é sobrou pelos km (0,66)", c.lucroPorKm === 0.66, String(c.lucroPorKm));
  conferir("sem serviço com valor, a reserva fica de fora", c.reservaPorKm === null && c.custoPorKm === 0.67);
}

// ── 2. a reserva de manutenção ──────────────────────────────────────────────
{
  conferir("sem serviço com valor, reserva é null", reservaPorKm([sv("2026-08-01", 97500)], dois, "2026-09-13") === null);
  conferir("com serviço de R$ 320 e 800 km registrados (97.500 a 98.300), reserva é 0,40", reservaPorKm([sv("2026-08-01", 97500, 320)], dois, "2026-09-13") === 0.4, String(reservaPorKm([sv("2026-08-01", 97500, 320)], dois, "2026-09-13")));
  conferir("com menos de 500 km registrados, reserva é null (divisão frouxa)", reservaPorKm([sv("2026-08-01", 98000, 320)], dois, "2026-09-13") === null);
  conferir("serviço de mais de 12 meses atrás não entra", reservaPorKm([sv("2025-08-01", 90000, 320)], dois, "2026-09-13") === null);
  const c = contaDoDia({ ganhos: [g("2026-09-13", 240, 100)], abastecimentos: dois, servicos: [sv("2026-08-01", 97500, 320)], hoje: "2026-09-13" });
  conferir("com reserva, o custo por km soma as duas partes (0,67 + 0,40 = 1,07)", c.custoPorKm === 1.07 && c.custou === 107, JSON.stringify(c));
}

// ── 4. o mês ────────────────────────────────────────────────────────────────
{
  const ganhos = [g("2026-09-01", 200, 150), g("2026-09-02", 250, 170), g("2026-08-31", 999, 500)];
  const m = contaDoMes({ ganhos, abastecimentos: dois, servicos: [], mes: "2026-09" });
  conferir("o mês soma só os dias dele (450 em 320 km, 2 dias)", m.ganhou === 450 && m.km === 320 && m.dias === 2, JSON.stringify(m));
  conferir("e fecha a conta (custou 214,40; sobrou 235,60; 0,74 por km)", m.custou === 214.4 && m.sobrou === 235.6 && m.lucroPorKm === 0.74, JSON.stringify(m));
  const p = contaDoPeriodo({ ganhos, abastecimentos: dois, servicos: [], desde: "2026-08-31", ate: "2026-09-01" });
  conferir("o período é inclusivo nas duas pontas", p.ganhou === 1199 && p.dias === 2);
  conferir("mês sem ganho: zero, não null", contaDoMes({ ganhos, abastecimentos: dois, servicos: [], mes: "2026-07" }).ganhou === 0);
}

// ── validação ───────────────────────────────────────────────────────────────
conferir("valor zero é recusado", lancamentoValido(0, 100) === "valor");
conferir("km zero é recusado", lancamentoValido(100, 0) === "km");
conferir("km sem número é recusado", lancamentoValido(100, NaN) === "km");
conferir("valor e km positivos passam", lancamentoValido(240, 180) === null);

// ── 5. as ligações ──────────────────────────────────────────────────────────
{
  const store = leia("lib/app/store.tsx");
  conferir("a sessão leva o interruptor e os dias para a nuvem", /ganhos: mergeById\(cloud\.ganhos/.test(store) && /motoristaDeApp: cloud\.motoristaDeApp \?\? local\.motoristaDeApp/.test(store));
  conferir("apagar o carro apaga os dias dele", /const ganhos = \(p\.ganhos \?\? \[\]\)\.filter\(\(r\) => r\.vehicleId !== id\)/.test(store));
  conferir("o dia de trabalho NÃO carimba o km do carro", !/addGanho[\s\S]{0,400}odometerKm/.test(store));

  const perfil = leia("components/app/screens/Profile.tsx");
  conferir("o interruptor mora no Perfil, na mesma lista dos avisos", /label=\{c\.motorista\.perfilRotulo\}/.test(perfil) && /<Toggle on=\{s\.motoristaDeApp\} onChange=\{setMotoristaDeApp\}/.test(perfil));
  conferir("e não no onboarding", !/motoristaDeApp/.test(leia("components/app/OnboardingFlow.tsx")));

  const home = leia("components/app/screens/Home.tsx");
  conferir("com o modo ligado, o card do custo vira a conta do dia", /if \(s\.motoristaDeApp\) return <DiaDoMotorista/.test(home) && /data-dia-do-motorista/.test(home));
  conferir("o card abre a tela do dia com a origem, e ainda o abastecimento", /name: "ganhos", origem: "inicio"/.test(home) && home.indexOf("DiaDoMotorista") < home.indexOf("function CustoDoCarro"));
  conferir("o resumo do mês ganha o lucro por km com o modo ligado", /subMotorista/.test(home) && /contaDoMes\(\{ ganhos: ganhosFor/.test(home));

  const tela = leia("components/app/screens/Ganhos.tsx");
  conferir("a tela emite lancou_ganho com a origem", /funil\("lancou_ganho",\s*\{[^}]*origem/.test(tela));
  conferir("a tela valida antes de salvar", /lancamentoValido\(val, kmN\)/.test(tela) && tela.indexOf("lancamentoValido(") < tela.indexOf("addGanho(rec)"));
  conferir("a devolução mostra sobrou, e sem custo diz que falta", /data-conta-do-dia/.test(tela) && /t\.semCusto/.test(tela));

  const historico = leia("components/app/screens/History.tsx");
  conferir("o histórico lista os dias de trabalho com o modo ligado", /data-ganho/.test(historico) && /s\.motoristaDeApp \? ganhosFor\(s, v\.id\)/.test(historico));

  conferir("a navegação conhece a tela", /name: "ganhos"/.test(leia("lib/app/nav.tsx")));
  conferir("o Shell desenha a tela na aba do histórico", /case "ganhos": return <GanhosScreen/.test(leia("components/app/telas.tsx")) && /ganhos: "history"/.test(leia("components/app/Shell.tsx")));

  const emails = leia("lib/jornada/emails.ts");
  conferir("o e-mail do mês traz o lucro por km só com o modo ligado", /if \(p\.motoristaDeApp\) \{[\s\S]{0,700}de lucro por km/.test(emails));
  conferir("o cron lê o interruptor e os dias", /motoristaDeApp: d\.motoristaDeApp === true/.test(leia("app/api/cron/jornada/route.ts")) && /ganhos: Array\.isArray\(d\.ganhos\)/.test(leia("app/api/cron/jornada/route.ts")));

  for (const [arq, re] of [
    ["lib/app/funil.ts", /"lancou_ganho"/],
    ["lib/funilCorreto.ts", /lancou_ganho: "aparelho"/],
    ["lib/funilCorreto.ts", /lancou_ganho: "sessao"/],
    ["lib/funilCorreto.ts", /lancou_ganho: "2026-09-13"/],
    ["app/api/funil/route.ts", /"lancou_ganho"/],
    ["supabase/funil_eventos.sql", /'lancou_ganho'/],
  ] as const) {
    conferir(`o funil conhece lancou_ganho em ${arq}`, re.test(leia(arq)));
  }
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do modo motorista reprovaram.`);
  process.exit(1);
}
console.log("Motorista: a conta fecha, não inventa custo, e o interruptor está onde o CRO decidiu.");
