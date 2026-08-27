// A pergunta do dia, de ponta a ponta: faixa no Início, tela, sequência,
// já-respondido, faixa no Calendário e o envio para /api/quiz.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "quiz";
export const sobre = "a pergunta do dia, do Início até o envio da resposta";

export async function rodar({ nav, ok }) {
  // Respondeu ontem: hoje a sequência tem de ir para 2.
  const app = await abrirApp(nav, {
    sessao: garagem({
      quiz: { ultimoDia: dia(-1), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 },
    }),
  });
  const { pg } = app;

  const envios = [];
  pg.on("request", (r) => {
    if (r.url().includes("/api/quiz") && r.method() === "POST") envios.push(r.postData());
  });

  // A chamada agora é o chip "Quiz Diário" na barra de cima (QuizNoTopo).
  const chip = pg.getByRole("button", { name: /Quiz Diário/i }).first();
  ok("chip do quiz na barra de cima", (await chip.count()) > 0);
  const txtChip = await chip.innerText();
  ok("o chip mostra a sequência de ontem", /🔥/.test(txtChip) && /\b1\b/.test(txtChip), txtChip.replace(/\n/g, " | "));

  await chip.click();
  await pg.waitForTimeout(1200);
  const pergunta = await pg.locator("h2").first().innerText();
  ok("a tela do quiz abriu com a pergunta do dia", pergunta.length > 15, pergunta.slice(0, 60));

  await pg.locator("main >> css=button").nth(1).click();
  await pg.waitForTimeout(1800);
  const depois = await app.corpo();
  ok("mostrou o resultado", /Acertou|Não é essa/.test(depois));
  ok("a sequência foi para 2", /2 dias seguidos/.test(depois), (depois.match(/\d+ dias? seguidos?/) ?? ["?"])[0]);
  ok("mostrou novo recorde", /Novo recorde/.test(depois));
  ok("oferece a aula completa", /Ver a aula completa/.test(depois));

  ok("mandou a resposta para /api/quiz", envios.length === 1, envios[0]?.slice(0, 140) ?? "(nenhum envio)");
  const enviado = envios[0] ? JSON.parse(envios[0]) : {};
  ok(
    "o envio leva dia, pergunta, acerto e anônimo",
    !!enviado.dia && !!enviado.perguntaId && typeof enviado.acertou === "boolean" && !!enviado.anonId
  );

  // Volta ao Início: o chip tem de virar "feito".
  await pg.getByRole("button", { name: /^Início$/i }).first().click();
  await pg.waitForTimeout(1200);
  const depoisChip = pg.getByRole("button", { name: /Quiz Diário/i }).first();
  ok("o chip virou feito, com o selo em 2",
    /feita/i.test((await depoisChip.getAttribute("aria-label")) ?? "") && /🔥/.test(await depoisChip.innerText()) && /\b2\b/.test(await depoisChip.innerText()),
    ((await depoisChip.getAttribute("aria-label")) ?? "") + " | " + (await depoisChip.innerText()));

  await pg.getByRole("button", { name: /^Calendário$/i }).first().click();
  await pg.waitForTimeout(1500);
  ok("o chip aparece também no Calendário", (await pg.getByRole("button", { name: /Quiz Diário/i }).count()) > 0);

  // Recarrega e tenta responder de novo.
  await app.recarregar();
  await pg.getByRole("button", { name: /Quiz Diário/i }).first().click();
  await pg.waitForTimeout(1200);
  const tela2 = await app.tela();
  ok("não deixa responder duas vezes no mesmo dia", /já respondeu hoje/i.test(tela2));
  ok("continua mostrando a sequência", /2 dias seguidos/.test(tela2));

  ok("nenhum erro de página", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}
