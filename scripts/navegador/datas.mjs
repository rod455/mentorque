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
}
