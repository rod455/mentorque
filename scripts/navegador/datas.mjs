// As datas do carro: informar no calendário, ver no Início e no Diagnóstico.
import { abrirApp, controlesForaDaTela, dia, garagem } from "./base.mjs";

export const nome = "datas";
export const sobre = "as datas do carro: informar no calendário, o card do Início e o passo do Diagnóstico";

export async function rodar({ nav, ok }) {
  const sessao = garagem({ quiz: { ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 } });
  const app = await abrirApp(nav, { sessao, rota: "/app?ir=revisions" });
  const { pg } = app;

  // 1. O card no calendário, com as quatro linhas por informar.
  const c0 = await app.corpo();
  // O título é caixa alta por CSS, e o innerText devolve como está na tela.
  ok("o calendário mostra Datas do carro", /Datas do carro/i.test(c0) && (await pg.locator("[data-data-do-carro]").count()) === 4);
  ok("sem data, cada linha diz Informar", (await pg.locator("[data-data-do-carro]", { hasText: "Informar" }).count()) === 4);

  // 2. Informar o IPVA para daqui a 20 dias, com valor.
  await pg.locator('[data-data-do-carro="ipva"]').click();
  await pg.waitForTimeout(500);
  const em = dia(20);
  await pg.locator('input[type="date"]').fill(em);
  await pg.locator('input[inputmode="numeric"]').last().fill("1200");
  await pg.getByRole("button", { name: /^Salvar$/i }).click();
  await pg.waitForTimeout(600);
  ok("salvar confirma e promete os três avisos", /30, 7 e 1 dia antes/.test(await app.corpo()));
  const s1 = await app.sessaoGravada();
  ok("a data ficou no carro, com o valor", s1?.vehicles?.[0]?.datas?.ipva?.em === em && s1.vehicles[0].datas.ipva.valor === 1200);
  await pg.locator('button[aria-label="close"]').last().click();
  await pg.waitForTimeout(400);
  ok("a linha do IPVA diz em quantos dias vence, com o valor", /IPVA[\s\S]{0,40}vence em 20 dias · R\$\s?1\.200/.test(await app.corpo()));
  ok("nenhum controle fora da tela", (await controlesForaDaTela(pg)).length === 0);

  // 3. O Início mostra a data a vencer, abaixo do custo do carro.
  await pg.getByRole("button", { name: /^Início$/i }).click();
  await pg.waitForTimeout(800);
  const h = await app.corpo();
  ok("o Início avisa que o IPVA vence em 20 dias", /IPVA do .* vence em 20 dias/.test(h));
  ok("com o valor e o convite a ver as datas", /R\$\s?1\.200 · toque para ver todas as datas/.test(h));
  ok("abaixo do custo do carro", h.indexOf("custa por km") < h.indexOf("vence em 20 dias"));

  // 4. O Diagnóstico do carro (na tela do carro, pelo card do Início) conta
  //    as datas como passo feito: o card só lista o que falta.
  await pg.locator("button", { hasText: /Seu carro/i }).first().click();
  await pg.waitForTimeout(800);
  const d = await app.corpo();
  const trecho = d.slice(d.indexOf("Diagnóstico do"), d.indexOf("Diagnóstico do") + 700);
  ok("o Diagnóstico tem seis passos e as datas contam como feito", /Diagnóstico do .*: \d de 6/.test(d) && !/As datas do carro/.test(trecho), trecho.slice(0, 80).replace(/\n+/g, " | "));

  // 5. Uma data distante não aparece no Início; uma vencida aparece em vermelho.
  await app.fechar();
  const app2 = await abrirApp(nav, { sessao: garagem({ quiz: sessao.quiz, vehicles: [{ ...sessao.vehicles[0], datas: { seguro: { em: dia(200) }, cnh: { em: dia(-3) } } }] }) });
  const h2 = await app2.corpo();
  ok("data distante fica fora do Início; a vencida entra", !/Seguro do/.test(h2) && /CNH do motorista do .* venceu há 3 dias/.test(h2));
  await app2.fechar();

  // 6. Pelo final da placa (13/09/2026): com estado e placa guardados, as
  //    linhas do IPVA e do licenciamento oferecem a data com um toque; a
  //    folha sugere pelo calendário; sem calendário, diz quais existem.
  const app3 = await abrirApp(nav, { sessao: garagem({ quiz: sessao.quiz, state: "SP", vehicles: [{ ...sessao.vehicles[0], plate: "ABC1D27" }] }), rota: "/app?ir=revisions" });
  const p3 = app3.pg;
  const c3 = await app3.corpo();
  ok("SP, final 7: a linha do licenciamento oferece 31/10 pela placa", (await p3.locator('[data-sugestao-da-placa="licenciamento"]').count()) === 1 && /Pela placa: 31\/10\/\d{4}/.test(c3), c3.slice(c3.indexOf("Licenciamento"), c3.indexOf("Licenciamento") + 60).replace(/\n+/g, " | "));
  ok("e a do IPVA oferece um dia de janeiro", /Pela placa: \d\d\/01\/\d{4}/.test(c3));
  ok("seguro e CNH não têm sugestão (não há calendário)", (await p3.locator('[data-sugestao-da-placa="seguro"]').count()) === 0 && (await p3.locator('[data-sugestao-da-placa="cnh"]').count()) === 0);
  await p3.locator('[data-sugestao-da-placa="ipva"]').getByRole("button", { name: /^Usar$/i }).click();
  await p3.waitForTimeout(500);
  const s3 = await app3.sessaoGravada();
  ok("Usar grava o IPVA no carro (20 de janeiro, final 7 em SP)", /-01-20$/.test(s3?.vehicles?.[0]?.datas?.ipva?.em ?? ""), JSON.stringify(s3?.vehicles?.[0]?.datas));
  ok("e a linha some, porque a data já está lá", (await p3.locator('[data-sugestao-da-placa="ipva"]').count()) === 0);
  await p3.locator('[data-data-do-carro="seguro"]').click();
  await p3.waitForTimeout(500);
  ok("a folha do seguro não tem o bloco da placa", (await p3.locator("[data-pela-placa]").count()) === 0);
  await p3.locator('button[aria-label="close"]').last().click();
  await p3.waitForTimeout(400);
  await p3.locator('[data-data-do-carro="licenciamento"]').click();
  await p3.waitForTimeout(500);
  ok("a folha do licenciamento vem com estado e final preenchidos", (await p3.locator("[data-pela-placa] select").inputValue()) === "SP" && (await p3.locator("[data-pela-placa] input").inputValue()) === "7");
  await p3.getByRole("button", { name: /Sugerir a data/i }).click();
  await p3.waitForTimeout(400);
  ok("sugerir explica a data pelo calendário", /Final 7 em SP: vence 31\/10\/\d{4}, pelo calendário de \d{4}/.test(await app3.corpo()));
  await p3.getByRole("button", { name: /^Salvar$/i }).click();
  await p3.waitForTimeout(600);
  ok("salvar grava o licenciamento", /-10-31$/.test((await app3.sessaoGravada())?.vehicles?.[0]?.datas?.licenciamento?.em ?? ""));
  await p3.locator('button[aria-label="close"]').last().click();
  await p3.waitForTimeout(400);
  await app3.fechar();

  const app4 = await abrirApp(nav, { sessao: garagem({ quiz: sessao.quiz }), rota: "/app?ir=revisions" });
  const p4 = app4.pg;
  ok("sem estado e sem placa, nenhuma linha oferece data", (await p4.locator("[data-sugestao-da-placa]").count()) === 0);
  await p4.locator('[data-data-do-carro="ipva"]').click();
  await p4.waitForTimeout(500);
  await p4.locator("[data-pela-placa] select").selectOption("AC");
  await p4.locator("[data-pela-placa] input").fill("3");
  await p4.getByRole("button", { name: /Sugerir a data/i }).click();
  await p4.waitForTimeout(400);
  const c4 = await app4.corpo();
  ok("estado sem calendário: a folha diz e lista os que existem", /Ainda não temos o calendário de AC/.test(c4) && /Calendários que o app já conhece: .*SP/.test(c4));
  const s4 = await app4.sessaoGravada();
  ok("o estado e o final ficaram guardados para a próxima vez", s4?.state === "AC" && s4?.vehicles?.[0]?.finalDaPlaca === "3");
  await app4.fechar();
}
