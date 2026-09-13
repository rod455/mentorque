// O caderno de gastos, do card do Início até apagar no histórico.
//
// Prova a tela inteira: o card vazio convida, o primeiro abastecimento
// carimba o km e explica que o próximo destrava o custo, o segundo devolve
// custo por km e consumo, o histórico lista os dois com a soma do mês, e
// apagar apaga. O km menor que o atual é recusado antes de salvar.
import { abrirApp, controlesForaDaTela, dia, garagem } from "./base.mjs";

export const nome = "combustivel";
export const sobre = "o abastecimento em três toques: card, devolução, histórico e apagar";

export async function rodar({ nav, ok }) {
  // Quiz já respondido: tira a folha do primeiro quiz do caminho, senão ela
  // abre por cima e engole o toque no card (a suíte de km anota o mesmo).
  const app = await abrirApp(nav, { sessao: garagem({ quiz: { ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 } }) });
  const { pg } = app;

  // 1. O card vazio, abaixo do carro.
  const corpo0 = await app.corpo();
  ok("o Início convida ao primeiro abastecimento", /Quanto o .* custa por km\?/.test(corpo0));
  ok("o card fica abaixo do card do carro", corpo0.indexOf("Seu carro") < corpo0.indexOf("custa por km"));
  await pg.getByRole("button", { name: /Registrar abastecimento/i }).click();
  await pg.waitForTimeout(800);
  ok("abre a tela de abastecimento", /Valor, litros e o km do painel/.test(await app.corpo()));

  // 2. Km menor é recusado.
  const campo = (rotulo) => pg.locator("label", { hasText: rotulo }).locator("input");
  await campo("Valor pago").fill("180");
  await campo("Km do painel").fill("90000");
  await pg.getByRole("button", { name: /Salvar abastecimento/i }).click();
  await pg.waitForTimeout(400);
  ok("km menor que o registrado é recusado", /menor que o registrado/.test(await app.corpo()));

  // 3. O primeiro abastecimento.
  await campo("Km do painel").fill("98100");
  await campo("Litros").fill("30");
  await pg.getByRole("button", { name: /Salvar abastecimento/i }).click();
  await pg.waitForTimeout(800);
  const c1 = await app.corpo();
  ok("o primeiro explica que o próximo destrava o custo por km", /Primeiro abastecimento guardado/.test(c1));
  ok("e mostra o mês", /Este mês em combustível: R\$\s?180/.test(c1));
  ok("e diz que o km do calendário foi atualizado", /km do calendário foi atualizado para 98\.100/.test(c1));
  const s1 = await app.sessaoGravada();
  ok("o km do carro foi carimbado no store", s1?.vehicles?.[0]?.odometerKm === 98100 && Date.now() - Date.parse(s1?.vehicles?.[0]?.kmUpdatedAt ?? 0) < 60000);
  ok("o abastecimento está na sessão", s1?.abastecimentos?.length === 1 && s1.abastecimentos[0].valor === 180 && s1.abastecimentos[0].litros === 30);
  ok("nenhum controle fora da tela", (await controlesForaDaTela(pg)).length === 0);

  // 4. Pronto: o card do Início muda.
  await pg.getByRole("button", { name: /^Pronto$/i }).click();
  await pg.waitForTimeout(800);
  const corpo1 = await app.corpo();
  ok("o card passa a mostrar a semana", /Esta semana: R\$\s?180/.test(corpo1));
  ok("e pede mais um para o custo por km", /Mais um abastecimento/.test(corpo1));

  // 5. O segundo: custo por km e consumo.
  await pg.getByRole("button", { name: /^Abasteci$/i }).first().click();
  await pg.waitForTimeout(600);
  await campo("Valor pago").fill("200");
  await campo("Km do painel").fill("98400");
  await campo("Litros").fill("32");
  await pg.getByRole("button", { name: /Salvar abastecimento/i }).click();
  await pg.waitForTimeout(800);
  const c2 = await app.corpo();
  ok("o segundo devolve o custo por km (200 / 300)", /R\$\s?0,67\s+por km/.test(c2), c2.slice(c2.indexOf("hoje:"), c2.indexOf("hoje:") + 120).replace(/\n+/g, " | "));
  ok("e o consumo (300 / 32)", /9,4 km por litro/.test(c2));
  if (process.env.FOTO_DO_COMBUSTIVEL) await pg.screenshot({ path: process.env.FOTO_DO_COMBUSTIVEL, fullPage: false }).catch(() => undefined);

  // 6. Histórico: a soma do mês e as duas linhas; apagar apaga.
  await pg.getByRole("button", { name: /Ver no histórico/i }).click();
  await pg.waitForTimeout(800);
  const h = await app.corpo();
  ok("o histórico mostra a soma do mês grátis", /Este mês: combustível R\$\s?380/.test(h));
  ok("e lista os dois abastecimentos", (await pg.locator("[data-abastecimento]").count()) === 2);
  await pg.locator("[data-abastecimento]").first().click();
  await pg.waitForTimeout(600);
  await pg.getByRole("button", { name: /Apagar este abastecimento/i }).click();
  await pg.waitForTimeout(600);
  ok("apagar apaga e avisa", /Abastecimento apagado/.test(await app.corpo()) && (await app.sessaoGravada())?.abastecimentos?.length === 1);

  await app.fechar();
}
