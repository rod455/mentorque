// O sintoma leva à aula que responde ele, e a aula diz por onde foi aberta.
//
// POR QUE (26/10/2026). Duas linhas da fila do Conteúdo para a Engenharia:
// a tela do sintoma não tinha caminho para a aula que explica aquilo, e o
// `viu_aula` gravava só o id, sem a porta. Sem o caminho, a régua "de quem
// consulta o sintoma, quantos abrem a aula" daria zero e a culpa cairia na
// aula; sem a porta, a régua nem conseguiria separar quem veio do sintoma.
//
// O que se prova aqui: o card aparece no sintoma que tem aula e some no que
// não tem; tocar abre o leitor; e o evento que sai carrega o id no `origem` e
// a porta no `detalhe`, que é o que o banco guarda em `extra.detalhe`.
import { garagem, abrirApp } from "./base.mjs";

export const nome = "sintoma";
export const sobre = "o sintoma oferece a aula que responde ele, e o viu_aula grava a porta";

export async function rodar({ nav, ok }) {
  const eventos = [];
  const app = await abrirApp(nav, {
    sessao: garagem({ startedAt: "2026-01-01" }),
    chaves: { "mq-primeiro-quiz-nao": "1" },
  });
  const { pg } = app;
  pg.on("request", (r) => {
    if (!r.url().includes("/api/funil")) return;
    try { eventos.push(JSON.parse(r.postData() ?? "{}")); } catch { /* corpo que não é JSON */ }
  });

  const abrirSintoma = async (texto) => {
    await pg.getByRole("button", { name: /^Biela$/i }).first().click();
    await pg.waitForTimeout(1200);
    await pg.getByPlaceholder(/Descreva o problema/i).fill(texto);
    await pg.waitForTimeout(600);
    await pg.getByRole("button", { name: new RegExp(texto, "i") }).first().click();
    await pg.waitForTimeout(1500);
  };

  // 1. Sintoma com aula: o card aparece, com a aula certa.
  await abrirSintoma("Barulho ao frear");
  const card = pg.locator("[data-aula-do-sintoma]");
  ok("o sintoma com aula mostra o card da aula", (await card.count()) === 1);
  const textoDoCard = (await card.count()) ? await card.innerText() : "";
  ok("e o card traz a aula de freio", /Freio: os avisos que vêm antes do barulho/i.test(textoDoCard), textoDoCard.slice(0, 120).replace(/\n/g, " "));

  // 2. Tocar abre o leitor, e o evento sai com a porta.
  if ((await card.count()) === 1) {
    await card.getByRole("button").first().click();
    await pg.waitForTimeout(1800);
    ok("tocar abre o leitor da aula", /Freio: os avisos/i.test(await app.tela()));
    const viu = eventos.filter((e) => e.evento === "viu_aula");
    ok(
      "o viu_aula sai com o id no origem e a porta sintoma no detalhe",
      viu.some((e) => e.origem === "diag-freio-avisos" && e.detalhe === "sintoma"),
      JSON.stringify(viu.map((e) => [e.origem, e.detalhe])),
    );
  }

  // 3. Sintoma sem aula de frente: nada de card que mande para outra coisa.
  await abrirSintoma("Ar-condicionado não gela");
  ok("o sintoma sem aula não mostra card", (await pg.locator("[data-aula-do-sintoma]").count()) === 0);

  // 4. Outra porta, para provar que a porta não está chumbada em "sintoma":
  //    a busca de Estudos.
  await pg.getByRole("button", { name: /^Estudos$/i }).first().click();
  await pg.waitForTimeout(1200);
  const busca = pg.getByPlaceholder(/O que você quer aprender/i).first();
  if (await busca.count()) {
    await busca.fill("superaquecimento");
    await pg.waitForTimeout(800);
    await pg.getByRole("button", { name: /Superaquecimento: o que fazer/i }).first().click();
    await pg.waitForTimeout(1800);
    const viu = eventos.filter((e) => e.evento === "viu_aula" && e.origem === "diag-superaquecimento");
    ok("a aula aberta pela busca grava a porta busca", viu.some((e) => e.detalhe === "busca"), JSON.stringify(viu.map((e) => e.detalhe)));
  } else {
    ok("a busca de Estudos foi encontrada", false);
  }

  ok("nenhum erro de página", app.erros.length === 0, app.erros.join(" | "));
  await app.fechar();
}
