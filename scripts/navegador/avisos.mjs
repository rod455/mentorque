// O sino de avisos: dispensar com o X, e a folha em telas estreitas.
import { garagem, CARRO, abrirApp, controlesForaDaTela, rolaParaOLado } from "./base.mjs";

export const nome = "avisos";
export const sobre = "o sino, o X que dispensa e a folha em telas estreitas";

const FROTA = [
  // Apelido longo de propósito: é o pior caso do corte lateral.
  { ...CARRO, nickname: "Golfinho da minha vida inteira" },
  { id: "v2", type: "car", make: "Fiat", model: "Uno", year: 2008, nickname: "Unozinho", odometerKm: 210000, kmUpdatedAt: CARRO.kmUpdatedAt, purchaseDate: "2015-02-01" },
  { id: "v3", type: "moto", make: "Honda", model: "CB 500F", year: 2019, nickname: "Nininha", odometerKm: 22000, kmUpdatedAt: CARRO.kmUpdatedAt, purchaseDate: "2021-07-01" },
];

export async function rodar({ nav, ok }) {
  const sessao = garagem({ vehicles: FROTA, startedAt: "2026-01-01" });

  // ---- dispensar com o X ---------------------------------------------------
  {
    const app = await abrirApp(nav, { sessao, chaves: { "mq-primeiro-quiz-nao": "1" } });
    const { pg } = app;
    const abrirSino = async () => {
      await pg.getByRole("button", { name: /avisos/i }).first().click();
      await pg.waitForTimeout(500);
    };
    const titulos = () => pg.locator("div[role=dialog] button >> css=span.font-display").allInnerTexts();

    await abrirSino();
    const antes = await titulos();
    ok("o sino abre com avisos dentro", antes.length > 1, `n=${antes.length}`);

    if (antes.length > 1) {
      const alvo = antes[1];
      await pg.getByRole("button", { name: /Dispensar aviso/i }).nth(1).click();
      await pg.waitForTimeout(400);
      ok("o aviso sai da lista na hora", !(await titulos()).includes(alvo), alvo);

      // Recarrega: o dispensado continua fora e o resto volta.
      await app.recarregar();
      await abrirSino();
      const depois = await titulos();
      ok("continua fora depois de recarregar", !depois.includes(alvo));
      ok("os outros continuam lá", depois.length === antes.length - 1, `sobrou ${depois.length}, esperado ${antes.length - 1}`);
    }
    await app.fechar();
  }

  // ---- a folha em telas estreitas ------------------------------------------
  // Corte lateral não aparece em nenhuma asserção de texto: a folha
  // "funciona", só que o X do dispensar está fora da tela e ninguém alcança.
  for (const largura of [320, 360, 430]) {
    const app = await abrirApp(nav, { sessao, chaves: { "mq-primeiro-quiz-nao": "1" } });
    await app.pg.setViewportSize({ width: largura, height: 844 });
    await app.pg.getByRole("button", { name: /avisos/i }).first().click();
    await app.pg.waitForTimeout(600);
    const fora = await controlesForaDaTela(app.pg, "div[role=dialog]");
    ok(`em ${largura}px, todo botão da folha é alcançável`, fora.length === 0, fora.join(" | "));
    ok(`em ${largura}px, a folha não faz a página rolar para o lado`, !(await rolaParaOLado(app.pg)));
    await app.fechar();
  }
}
