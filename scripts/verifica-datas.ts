// As datas do carro: a régua dos dias, os avisos e as ligações.
//
// O que protege (13/09/2026):
//   1. "vence em n dias" conta dias inteiros a partir de hoje, sem fuso
//      atrapalhando;
//   2. cada data vira até três avisos (30, 7 e 1 dia antes, às 9h), só os
//      futuros, com ids fixos por (tipo, antecedência) a partir de 8;
//   3. o Início só mostra a data a 30 dias ou menos (ou vencida há até 60);
//   4. as ligações: calendário, Diagnóstico do carro, Início, abertura.
//
// Rode com: npm run conferir:datas
import { readFileSync } from "node:fs";
import { ANTECEDENCIAS, avisosDasDatas, dataParaOInicio, datasDoCarro, diasAte, estadoDaData, idsDosAvisosDeData, TIPOS_DE_DATA } from "../lib/app/datasDoCarro.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

console.log("Datas do carro: dias inteiros, três avisos por data, e o Início só a 30 dias.");

const hoje = new Date(2026, 8, 13, 15, 30); // 13/09/2026 à tarde

// ── 1. a régua dos dias ─────────────────────────────────────────────────────
conferir("hoje é 0", diasAte("2026-09-13", hoje) === 0);
conferir("amanhã é 1, mesmo à tarde", diasAte("2026-09-14", hoje) === 1);
conferir("ontem é -1", diasAte("2026-09-12", hoje) === -1);
conferir("30 dias à frente", diasAte("2026-10-13", hoje) === 30);
conferir("os estados", estadoDaData(-3) === "vencida" && estadoDaData(0) === "hoje" && estadoDaData(30) === "chegando" && estadoDaData(31) === "distante");

const carro = { datas: { ipva: { em: "2026-10-01", valor: 1200 }, seguro: { em: "2027-03-10" }, cnh: { em: "2026-09-10" } } };
const lidas = datasDoCarro(carro, hoje);
conferir("as datas saem da mais próxima para a mais distante", lidas.map((d) => d.tipo).join(",") === "cnh,ipva,seguro", lidas.map((d) => d.tipo).join(","));
conferir("cada uma com os dias", lidas[0].dias === -3 && lidas[1].dias === 18 && lidas[2].dias === 178);
conferir("data mal formada é ignorada", datasDoCarro({ datas: { ipva: { em: "01/10/2026" } } }, hoje).length === 0);
conferir("carro sem datas devolve vazio", datasDoCarro({}, hoje).length === 0 && datasDoCarro(null, hoje).length === 0);

// ── 2. os avisos ────────────────────────────────────────────────────────────
const avisos = avisosDasDatas(carro, 8, hoje);
conferir("IPVA em 18 dias gera só os avisos de 7 e 1 dia (o de 30 já passou)", avisos.filter((a) => a.tipo === "ipva").map((a) => a.diasAntes).join(",") === "7,1", JSON.stringify(avisos.map((a) => [a.tipo, a.diasAntes])));
conferir("seguro em 178 dias gera os três", avisos.filter((a) => a.tipo === "seguro").length === 3);
conferir("CNH vencida não gera aviso", avisos.filter((a) => a.tipo === "cnh").length === 0);
const ipva7 = avisos.find((a) => a.tipo === "ipva" && a.diasAntes === 7)!;
conferir("o aviso sai às 9h do dia certo (24/09 para 01/10)", ipva7.quando.getDate() === 24 && ipva7.quando.getMonth() === 8 && ipva7.quando.getHours() === 9, String(ipva7.quando));
conferir("os ids são fixos por (tipo, antecedência), a partir de 8", ipva7.id === 8 + TIPOS_DE_DATA.indexOf("ipva") * ANTECEDENCIAS.length + 1 && avisos.find((a) => a.tipo === "seguro" && a.diasAntes === 30)!.id === 8 + 2 * 3 + 0);
conferir("os avisos vêm em ordem de tempo", avisos.every((a, i) => i === 0 || a.quando.getTime() >= avisos[i - 1].quando.getTime()));
const ids = idsDosAvisosDeData(8);
conferir("doze ids reservados, 8 a 19, sem repetir", ids.length === 12 && ids[0] === 8 && ids[11] === 19 && new Set(ids).size === 12);

// ── 3. o Início ─────────────────────────────────────────────────────────────
conferir("o Início mostra a mais próxima a até 30 dias, vencida incluída", dataParaOInicio(carro, hoje)?.tipo === "cnh");
conferir("sem nada a 30 dias, o Início fica quieto", dataParaOInicio({ datas: { seguro: { em: "2027-03-10" } } }, hoje) === null);
conferir("vencida há mais de 60 dias sai do Início", dataParaOInicio({ datas: { ipva: { em: "2026-06-01" } } }, hoje) === null);

// ── 4. as ligações ──────────────────────────────────────────────────────────
{
  conferir("os ids das datas começam em 8 na tabela de avisos", /datasDoCarro: 8,/.test(leia("lib/app/notificacoes.ts")));
  const lembrete = leia("lib/app/lembreteDatas.ts");
  conferir("o lembrete cancela o que não é mais agendado antes de agendar", lembrete.indexOf("cancelar(id)") < lembrete.indexOf("await agendar("));
  conferir("o lembrete desligado cancela os doze", /if \(!o\.quer \|\| !o\.veiculo\) \{[\s\S]{0,120}for \(const id of ids\) await cancelar\(id\)/.test(lembrete));
  const abertura = leia("lib/app/aberturaDoApp.ts");
  conferir("a abertura sincroniza os avisos das datas e reage a mudança de data", /sincronizarLembreteDatas\(\{/.test(abertura) && /JSON\.stringify\(veiculo\?\.datas/.test(abertura));
  conferir("o calendário de revisões mostra as datas", /<DatasDoCarro v=\{v\} \/>/.test(leia("components/app/screens/Revisions.tsx")));
  conferir("o Diagnóstico do carro tem o passo das datas", /rotulo: d\.datas, ganho: d\.datasGanho/.test(leia("components/app/screens/CarHub.tsx")));
  const home = leia("components/app/screens/Home.tsx");
  conferir("o Início mostra a data a vencer, depois do custo do carro", home.indexOf("<DataAVencer car={car} />") > home.indexOf("<CustoDoCarro ") && /dataParaOInicio\(car\)/.test(home));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de datas reprovaram.`);
  process.exit(1);
}
console.log("Datas: dias inteiros, três avisos por data, ids fixos, e o Início só quando importa.");
