// O modo motorista de aplicativo, do interruptor no Perfil até apagar no histórico.
//
// Prova a peça inteira: com o modo desligado o Início mostra o custo do
// carro; ligar no Perfil troca o card pela conta do dia; lançar o dia
// devolve ganhou, custou, sobrou e o lucro por km (o custo vem dos dois
// abastecimentos semeados); o histórico lista o dia; apagar apaga. E sem
// abastecimento, a devolução diz que o custo falta em vez de inventar.
import { abrirApp, controlesForaDaTela, dia, garagem } from "./base.mjs";

export const nome = "motorista";
export const sobre = "o modo motorista: interruptor no Perfil, ganhou/custou/sobrou no Início, tela, histórico";

const quiz = { ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 };
// Dois abastecimentos: R$ 0,67 por km (200 / 300).
const abastecimentos = [
  { id: "a1", vehicleId: "v1", date: dia(-10), km: 98000, valor: 180, litros: 30, combustivel: "gasolina" },
  { id: "a2", vehicleId: "v1", date: dia(-3), km: 98300, valor: 200, litros: 32, combustivel: "gasolina" },
];

export async function rodar({ nav, ok }) {
  // 1. Modo desligado: o card do custo, como sempre.
  const app = await abrirApp(nav, { sessao: garagem({ quiz, abastecimentos }) });
  const { pg } = app;
  const corpo0 = await app.corpo();
  ok("com o modo desligado, o Início mostra o custo do carro", /Custo do carro/i.test(corpo0) && !/rendeu hoje/.test(corpo0));

  // 2. Ligar no Perfil.
  await pg.getByRole("button", { name: /^Perfil$/i }).first().click();
  await pg.waitForTimeout(1200);
  const perfil = await app.corpo();
  ok("o Perfil tem o interruptor do modo motorista, abaixo dos avisos", /Trabalho com o carro por aplicativo/.test(perfil) && perfil.indexOf("Notifica") < perfil.indexOf("Trabalho com o carro"));
  const linha = pg.locator("div, li, button", { hasText: /Trabalho com o carro por aplicativo/ }).locator("[role=switch]").last();
  await linha.click();
  await pg.waitForTimeout(500);
  ok("o interruptor liga e grava na sessão", (await app.sessaoGravada())?.motoristaDeApp === true);

  // 3. O Início troca o card.
  await pg.getByRole("button", { name: /^Início$/i }).first().click();
  await pg.waitForTimeout(1200);
  const corpo1 = await app.corpo();
  ok("o Início passa a convidar para lançar o dia", /Quanto o .* rendeu hoje\?/.test(corpo1) && (await pg.locator("[data-dia-do-motorista]").count()) === 1);
  ok("e ainda oferece o abastecimento", /Abasteci/.test(corpo1));

  // 4. Lançar o dia.
  await pg.getByRole("button", { name: /^Lançar o dia$/i }).click();
  await pg.waitForTimeout(800);
  ok("abre a tela do dia de trabalho", /O que o aplicativo pagou/.test(await app.corpo()));
  const campo = (rotulo) => pg.locator("label", { hasText: rotulo }).locator("input");
  await campo("Recebido no dia").fill("240");
  await pg.getByRole("button", { name: /Salvar o dia/i }).click();
  await pg.waitForTimeout(400);
  ok("sem km, recusa antes de salvar", /Digite os km rodados/.test(await app.corpo()));
  await campo("Km rodados").fill("180");
  await pg.getByRole("button", { name: /Salvar o dia/i }).click();
  await pg.waitForTimeout(800);
  const c1 = await app.corpo();
  ok("a devolução diz quanto sobrou (240 − 180 × 0,67 = 119)", /R\$\s?119\s+sobrou/.test(c1), c1.slice(c1.indexOf("Registrado"), c1.indexOf("Registrado") + 160).replace(/\n+/g, " | "));
  ok("e o lucro por km (0,66)", /R\$\s?0,66 de lucro por km/.test(c1));
  ok("e explica que o custo é só combustível ainda", /só combustível, sem reserva/.test(c1));
  const s1 = await app.sessaoGravada();
  ok("o dia está na sessão, e o km do carro NÃO mudou", s1?.ganhos?.length === 1 && s1.ganhos[0].valor === 240 && s1.ganhos[0].km === 180 && s1?.vehicles?.[0]?.odometerKm === 98000);
  ok("nenhum controle fora da tela", (await controlesForaDaTela(pg)).length === 0);
  if (process.env.FOTO_DO_MOTORISTA) await pg.screenshot({ path: process.env.FOTO_DO_MOTORISTA, fullPage: false }).catch(() => undefined);

  // 5. Pronto: o card do Início mostra a conta.
  await pg.getByRole("button", { name: /^Pronto$/i }).click();
  await pg.waitForTimeout(800);
  const corpo2 = await app.corpo();
  ok("o card mostra ganhou, custou e sobrou", /Ganhou R\$\s?240 · custou R\$\s?121 · sobrou R\$\s?119/.test(corpo2), corpo2.slice(corpo2.indexOf("Hoje com"), corpo2.indexOf("Hoje com") + 120).replace(/\n+/g, " | "));

  // 6. Histórico: a linha do dia; apagar apaga.
  await pg.getByRole("button", { name: /^Lançar o dia$/i }).click();
  await pg.waitForTimeout(600);
  await pg.getByRole("button", { name: /^Cancelar$/i }).click();
  await pg.waitForTimeout(600);
  await pg.getByRole("button", { name: /^Calendário$|^Histórico$/i }).first().click();
  await pg.waitForTimeout(1200);
  ok("o histórico lista o dia de trabalho", (await pg.locator("[data-ganho]").count()) === 1 && /Dia de trabalho/.test(await app.corpo()));
  await pg.locator("[data-ganho]").first().click();
  await pg.waitForTimeout(600);
  await pg.getByRole("button", { name: /Apagar este dia/i }).click();
  await pg.waitForTimeout(600);
  ok("apagar apaga e avisa", /Dia apagado/.test(await app.corpo()) && (await app.sessaoGravada())?.ganhos?.length === 0);
  await app.fechar();

  // 7. Sem abastecimento, a conta diz que o custo falta.
  const app2 = await abrirApp(nav, { sessao: garagem({ quiz, motoristaDeApp: true }) });
  await app2.pg.getByRole("button", { name: /^Lançar o dia$/i }).click();
  await app2.pg.waitForTimeout(800);
  const campo2 = (rotulo) => app2.pg.locator("label", { hasText: rotulo }).locator("input");
  await campo2("Recebido no dia").fill("300");
  await campo2("Km rodados").fill("200");
  await app2.pg.getByRole("button", { name: /Salvar o dia/i }).click();
  await app2.pg.waitForTimeout(800);
  const c2 = await app2.corpo();
  ok("sem abastecimento, a devolução diz que o custo aparece depois de dois", /Ganhou R\$\s?300 em 200 km\. O custo aparece depois de dois abastecimentos/.test(c2) && !/sobrou/.test(c2));
  await app2.pg.getByRole("button", { name: /^Pronto$/i }).click();
  await app2.pg.waitForTimeout(800);
  ok("e o card do Início também não inventa custo", /Ganhou R\$\s?300 · 200 km · registre dois abastecimentos/.test(await app2.corpo()));
  await app2.fechar();
}
