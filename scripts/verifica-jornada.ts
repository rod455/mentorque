// A jornada de recorrência: a decisão, os textos e as ligações.
//
// POR QUE (12/09/2026). O dono aprovou a jornada de e-mails e push. Cada
// regra da decisão (lib/jornada/decisao.ts) erra em silêncio: ninguém reclama
// do e-mail que não chegou, e quem recebe dois no mesmo dia não avisa, sai.
// Os casos abaixo são os que mais custariam se errassem: quem saiu recebendo,
// quem usa o app hoje recebendo, dois em três dias, a cadência disparando em
// rajada para as contas antigas, "vencido" inventado a partir da data de
// compra. E os textos: sem travessão, sem preço de plano, com etiqueta e com
// o link de sair.
//
// Rode com: npm run conferir:jornada
import { readFileSync } from "node:fs";
import {
  escolherEmail,
  ESPACO_MINIMO_DIAS,
  MARCOS_DA_CADENCIA,
  type PessoaDaJornada,
} from "../lib/jornada/decisao.ts";
import { montarMensagem, renderEmail, linkDoApp } from "../lib/jornada/emails.ts";
import type { ServiceRecord, Vehicle } from "../lib/app/types";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

const HOJE = "2026-09-12";
const diasAtras = (n: number, de = HOJE) => {
  const d = new Date(`${de}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

const gol = (extra: Partial<Vehicle> = {}): Vehicle => ({ id: "v1", type: "car", make: "Volkswagen", model: "Gol", year: 2016, odometerKm: 84300, kmUpdatedAt: `${diasAtras(5)}T12:00:00Z`, ...extra });
const oleo = (diasAtrasN: number, total?: number): ServiceRecord => ({ id: `s${diasAtrasN}`, vehicleId: "v1", type: "oil", date: diasAtras(diasAtrasN), km: 80000, total, parts: [] });

function pessoa(extra: Partial<PessoaDaJornada> = {}): PessoaDaJornada {
  return {
    userId: "u1",
    email: "a@b.c",
    nome: "Rodrigo",
    contaCriadaEm: diasAtras(40),
    veiculos: [],
    carroPrincipalId: null,
    servicos: [],
    quizRespostas: 3,
    ultimaAtividade: diasAtras(2),
    temManual: false,
    uf: "SP",
    cidade: null,
    saiu: false,
    envios: [],
    ...extra,
  };
}
const chave = (p: PessoaDaJornada, hoje = HOJE) => escolherEmail(p, hoje)?.chave ?? null;

console.log("Jornada: quem recebe o quê, e quando.");

// ── os cortes que valem antes de tudo ───────────────────────────────────────
{
  const vencida = pessoa({ veiculos: [gol()], carroPrincipalId: "v1", servicos: [oleo(500)] });
  conferir("com óleo trocado há 500 dias, a escolha é 'vencida:oil'", chave(vencida) === "vencida:oil", `veio ${chave(vencida)}`);
  conferir("quem SAIU não recebe nada, nem com revisão vencida", chave({ ...vencida, saiu: true }) === null);
  conferir("quem mexeu no app HOJE não recebe nada hoje", chave({ ...vencida, ultimaAtividade: HOJE }) === null);
  conferir("recebeu ontem: nada hoje", chave({ ...vencida, envios: [{ chave: "d9", dia: diasAtras(1) }] }) === null);
  conferir(`recebeu há ${ESPACO_MINIMO_DIAS} dias: pode`, chave({ ...vencida, envios: [{ chave: "d9", dia: diasAtras(ESPACO_MINIMO_DIAS) }] }) === "vencida:oil");
  conferir("a mesma 'vencida:oil' não repete em 30 dias", chave({ ...vencida, envios: [{ chave: "vencida:oil", dia: diasAtras(10) }] }) !== "vencida:oil");
  conferir("depois de 30 dias, repete", chave({ ...vencida, envios: [{ chave: "vencida:oil", dia: diasAtras(31) }] }) === "vencida:oil");
}

// ── vencido só com registro ─────────────────────────────────────────────────
{
  const soCompra = pessoa({ veiculos: [gol({ purchaseDate: diasAtras(900) })], carroPrincipalId: "v1" });
  conferir("carro só com data de compra (30 meses) NÃO vira 'vencida'", !(chave(soCompra) ?? "").startsWith("vencida:"), `veio ${chave(soCompra)}; sem registro do serviço, 'vencido' é invenção`);
}

// ── a cadência e a janela dela ──────────────────────────────────────────────
{
  const nova = pessoa({ contaCriadaEm: HOJE, ultimaAtividade: diasAtras(1) });
  conferir("conta criada hoje, sem carro: d0", chave(nova) === "d0", `veio ${chave(nova)}`);
  const dia2 = pessoa({ contaCriadaEm: diasAtras(2), envios: [{ chave: "d0", dia: diasAtras(2) }] });
  conferir("dia 2 com d0 há 2 dias: espera (um a cada três dias)", chave(dia2) === null, `veio ${chave(dia2)}`);
  const dia3 = pessoa({ contaCriadaEm: diasAtras(3), envios: [{ chave: "d0", dia: diasAtras(3) }] });
  conferir("dia 3 com d0 há 3 dias: d2 (ainda na janela)", chave(dia3) === "d2", `veio ${chave(dia3)}`);
  const velha = pessoa({ contaCriadaEm: diasAtras(40), ultimaAtividade: diasAtras(2) });
  conferir("conta de 40 dias sem nada pendente: NENHUM e-mail da cadência (nada de rajada)", chave(velha) === null, `veio ${chave(velha)}`);
  const dia5comServico = pessoa({ contaCriadaEm: diasAtras(5), veiculos: [gol()], carroPrincipalId: "v1", servicos: [oleo(100)], envios: [{ chave: "d0", dia: diasAtras(5) }, { chave: "d2", dia: diasAtras(3) }] });
  conferir("d5 pede o primeiro serviço; quem já registrou não recebe o d5", chave(dia5comServico) !== "d5", `veio ${chave(dia5comServico)}`);
  const marcos = MARCOS_DA_CADENCIA.map((m) => m.chave).join(",");
  conferir("os cinco marcos existem", marcos === "d0,d2,d5,d9,d14", marcos);
}

// ── gatilhos, um a um ───────────────────────────────────────────────────────
{
  // 340 dias: a régua de meses do app (health.ts) conta por mês do calendário,
  // e 350 dias já viram 12 meses, vencido. Aos 340, faltam 25 dias.
  const chegando = pessoa({ veiculos: [gol()], carroPrincipalId: "v1", servicos: [oleo(340)] });
  conferir("óleo trocado há 340 dias (intervalo de 12 meses): 'chegando:oil'", chave(chegando) === "chegando:oil", `veio ${chave(chegando)}`);

  const pagou = pessoa({ veiculos: [gol()], carroPrincipalId: "v1", servicos: [oleo(2, 280)] });
  conferir("serviço com valor registrado há 2 dias: comparação de preço", chave(pagou) === "preco:s2", `veio ${chave(pagou)}`);
  conferir("a comparação sai UMA vez por serviço", chave({ ...pagou, envios: [{ chave: "preco:s2", dia: diasAtras(4) }] }) !== "preco:s2");

  const parado = pessoa({ veiculos: [gol({ createdAt: `${diasAtras(3)}T10:00:00Z` })], carroPrincipalId: "v1", quizRespostas: 0 });
  conferir("carro cadastrado há 3 dias, sem serviço e sem quiz: 'parado-2'", chave(parado) === "parado-2", `veio ${chave(parado)}`);
  conferir("respondeu o quiz: não é 'parado'", chave({ ...parado, quizRespostas: 1 }) !== "parado-2");
  const parado7 = { ...parado, veiculos: [gol({ createdAt: `${diasAtras(8)}T10:00:00Z` })], envios: [{ chave: "parado-2", dia: diasAtras(6) }] };
  conferir("uma semana depois, 'parado-7'", chave(parado7) === "parado-7", `veio ${chave(parado7)}`);

  const km = pessoa({ veiculos: [gol({ kmUpdatedAt: `${diasAtras(50)}T10:00:00Z` })], carroPrincipalId: "v1" });
  conferir("km sem atualizar há 50 dias: 'km'", chave(km) === "km", `veio ${chave(km)}`);

  const sumiu = pessoa({ ultimaAtividade: diasAtras(20) });
  conferir("sem atividade há 20 dias: 'sumiu-14'", chave(sumiu) === "sumiu-14", `veio ${chave(sumiu)}`);
  const sumiu30 = pessoa({ ultimaAtividade: diasAtras(45) });
  conferir("sem atividade há 45 dias: 'sumiu-30'", chave(sumiu30) === "sumiu-30", `veio ${chave(sumiu30)}`);

  const novaComVencida = pessoa({ contaCriadaEm: diasAtras(2), ultimaAtividade: diasAtras(1), veiculos: [gol()], carroPrincipalId: "v1", servicos: [oleo(500)] });
  conferir("gatilho ganha de cadência", chave(novaComVencida) === "vencida:oil", `veio ${chave(novaComVencida)}`);
}

// ── sazonais ────────────────────────────────────────────────────────────────
{
  const comCarro = pessoa({ veiculos: [gol({ kmUpdatedAt: "2026-12-01T10:00:00Z" })], carroPrincipalId: "v1", ultimaAtividade: "2026-12-01" });
  conferir("3 de dezembro, com carro: férias", chave(comCarro, "2026-12-03") === "sazonal:ferias-12-2026", `veio ${chave(comCarro, "2026-12-03")}`);
  conferir("20 de dezembro: fora da janela", chave({ ...comCarro, ultimaAtividade: "2026-12-18", veiculos: [gol({ kmUpdatedAt: "2026-12-18T10:00:00Z" })] }, "2026-12-20") === null);
  conferir("sem carro, sem sazonal", chave(pessoa({ ultimaAtividade: "2026-12-01" }), "2026-12-03") === null);
  conferir("o mesmo ano não repete", chave({ ...comCarro, envios: [{ chave: "sazonal:ferias-12-2026", dia: "2026-11-30" }] }, "2026-12-05") === null);
}

// ── os textos ───────────────────────────────────────────────────────────────
{
  const carro = gol({ purchaseDate: diasAtras(400), createdAt: `${diasAtras(3)}T10:00:00Z` });
  const com = pessoa({ veiculos: [carro], carroPrincipalId: "v1", servicos: [oleo(2, 280), { ...oleo(500), id: "s500" }], temManual: true, cidade: "Campinas" });
  const sem = pessoa();
  const casos: { chave: string; p: PessoaDaJornada; item?: string; servico?: ServiceRecord }[] = [
    { chave: "d0", p: sem }, { chave: "d0", p: com },
    { chave: "d2", p: sem }, { chave: "d2", p: com },
    { chave: "d5", p: sem }, { chave: "d5", p: com },
    { chave: "d9", p: sem }, { chave: "d9", p: com },
    { chave: "d14", p: sem }, { chave: "d14", p: com },
    { chave: "vencida:oil", p: com, item: "oil" },
    { chave: "chegando:brakefluid", p: com, item: "brakefluid" },
    { chave: "preco:s2", p: com, servico: com.servicos[0] },
    { chave: "parado-2", p: com }, { chave: "parado-7", p: com },
    { chave: "km", p: com },
    { chave: "sumiu-14", p: com }, { chave: "sumiu-30", p: sem },
    { chave: "sazonal:ferias-12-2026", p: com }, { chave: "sazonal:chuva-2026", p: com }, { chave: "sazonal:ipva-2027", p: com },
  ];
  const travessao = /—/;
  const precoDePlano = /R\$\s?\d+[,.]\d{2}\s*(por|\/)\s*(mês|ano)|premium|assine|assinatura/i;
  for (const c of casos) {
    const carroDoCaso = c.p.veiculos[0] ?? null;
    let m;
    try {
      m = montarMensagem({ chave: c.chave, familia: "gatilho", motivo: "teste", carro: carroDoCaso, item: c.item, servico: c.servico }, c.p, HOJE);
    } catch (err) {
      conferir(`${c.chave} (${carroDoCaso ? "com" : "sem"} carro) tem texto`, false, String(err));
      continue;
    }
    const rotulo = `${c.chave} (${carroDoCaso ? "com" : "sem"} carro)`;
    const tudo = [m.assunto, m.preheader, m.titulo, ...m.paragrafos, ...(m.destaque?.itens ?? []), m.cta.texto, m.push.titulo, m.push.corpo].join("\n");
    conferir(`${rotulo}: sem travessão`, !travessao.test(tudo));
    conferir(`${rotulo}: sem preço de plano nem oferta`, !precoDePlano.test(tudo), tudo.match(precoDePlano)?.[0]);
    conferir(`${rotulo}: o link leva a etiqueta da jornada`, m.cta.url.includes("utm_source=email") && m.cta.url.includes("utm_campaign=jornada") && m.cta.url.includes("utm_content="), m.cta.url);
    conferir(`${rotulo}: push curto`, m.push.titulo.length <= 70 && m.push.corpo.length <= 160, `${m.push.titulo.length}/${m.push.corpo.length}`);
    if (carroDoCaso && !["d5", "d9", "d14"].includes(c.chave) && !c.chave.startsWith("sumiu") && !c.chave.startsWith("preco")) {
      conferir(`${rotulo}: fala do carro pelo nome`, m.assunto.includes("Gol"), m.assunto);
    }
    const r = renderEmail(m, "https://www.mentorque.com.br/api/jornada/sair?u=u1&a=x");
    conferir(`${rotulo}: o e-mail tem o link de sair`, r.html.includes("/api/jornada/sair?u=u1&a=x") && r.text.includes("/api/jornada/sair?u=u1&a=x"));
    conferir(`${rotulo}: um botão só`, (r.html.match(/border-radius:999px/g) ?? []).length === 1);
  }
  conferir("a etiqueta não carrega dois-pontos", !linkDoApp("vencida:oil").includes("%3A") && linkDoApp("vencida:oil").includes("utm_content=vencida-oil"), linkDoApp("vencida:oil"));
}

// ── as ligações ─────────────────────────────────────────────────────────────
{
  const cron = leia("app/api/cron/jornada/route.ts");
  conferir("o cron nasce em ensaio: só envia com JORNADA_ATIVA=sim", /JORNADA_ATIVA/.test(cron) && /=== "sim"/.test(cron));
  conferir("o cron consulta a decisão e monta o texto", /escolherEmail\(/.test(cron) && /montarMensagem\(/.test(cron));
  conferir("o cron manda push pelo mesmo transporte", /enviarPush\(/.test(cron));
  conferir("o cron grava o envio", /from\("jornada_envios"\)\.insert/.test(cron));
  conferir("o cron exige a chave", /CRON_SECRET/.test(cron) && /chaveDadosOk/.test(cron));
  conferir("o e-mail sai com List-Unsubscribe de um clique", /List-Unsubscribe-Post/.test(cron));
  const vercel = readFileSync(new URL("../vercel.json", import.meta.url), "utf8");
  conferir("a Vercel agenda o cron todo dia às 9h de Brasília (12h UTC)", /"\/api\/cron\/jornada"[\s\S]{0,60}"0 12 \* \* \*"/.test(vercel));
  const sair = leia("app/api/jornada/sair/route.ts");
  conferir("sair confere a assinatura e grava a saída", /assinaturaConfere\(/.test(sair) && /jornada_saidas/.test(sair) && /export async function POST/.test(sair));
  const push = leia("app/api/push/enviar/route.ts");
  conferir("a rota de push usa o transporte compartilhado", /from "@\/lib\/push\/transporte"/.test(push) && /enviarPush\(/.test(push));
  const sql = readFileSync(new URL("../supabase/jornada.sql", import.meta.url), "utf8");
  conferir("o banco tem a trava 'nunca dois no mesmo dia'", /unique index[\s\S]{0,80}\(user_id, dia\)/.test(sql));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da jornada reprovaram.`);
  process.exit(1);
}
console.log("Jornada: decisão, textos e ligações conferidos.");
