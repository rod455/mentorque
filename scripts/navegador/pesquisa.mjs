// A pesquisa curta do Início: aparece para quem já voltou, grava as quatro
// respostas e some de vez.
//
// POR QUE ESTA SUÍTE EXISTE (16/11/2026, plano de receita). `npm run
// conferir:pesquisa` executa a regra (quem vê, o que vale como resposta). O
// que só o navegador prova é o caminho: o card no Início, a folha que só
// envia completa, o corpo que vai para /api/pesquisa e o card que não volta.
//
// O QUE ELA NÃO ALCANÇA: a gravação no banco (a rota é dublada aqui).
import { garagem, dia, abrirApp, BASE } from "./base.mjs";

export const nome = "pesquisa";
export const sobre = "a pesquisa curta aparece para quem voltou, envia completa e some";

const LIGADA = { "mentorque.pesquisaReceita": "", "mq-primeiro-quiz-nao": "1" };
const QUIZ = { ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 };

export async function rodar({ nav, ok }) {
  // 1. Quem começou há 10 dias vê, responde e envia.
  {
    const enviados = [];
    const app = await abrirApp(nav, { sessao: garagem({ startedAt: dia(-10), quiz: QUIZ }), chaves: LIGADA });
    await app.ctx.route("**/api/pesquisa", async (rota) => {
      enviados.push(JSON.parse(rota.request().postData() ?? "{}"));
      await rota.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, guardado: true }) });
    });
    const { pg } = app;
    const card = pg.locator("[data-pesquisa-curta]");
    ok("quem voltou vê o card da pesquisa no Início", (await card.count()) === 1);
    if (await card.count()) {
      await card.getByRole("button", { name: /^Responder$/i }).click();
      await pg.waitForTimeout(500);
      const enviar = pg.locator("[data-folha-pesquisa]").getByRole("button", { name: /^Enviar$/i });
      ok("sem responder, Enviar fica desligado", await enviar.isDisabled());
      for (const [p, op] of [["sentir", "muito"], ["gasto", "ate2000"], ["seguro", "nao"], ["preco", "ate10"]]) {
        await pg.locator(`[data-pergunta="${p}"] [data-opcao="${op}"]`).click();
      }
      ok("com as quatro, Enviar liga", !(await enviar.isDisabled()));
      await enviar.click();
      await pg.waitForTimeout(1200);
      const r = enviados[0]?.respostas ?? {};
      ok("o envio leva as quatro respostas", r.sentir === "muito" && r.gasto === "ate2000" && r.seguro === "nao" && r.preco === "ate10", JSON.stringify(enviados[0]));
      ok("e a identidade do aparelho", typeof enviados[0]?.anonId === "string" && enviados[0].anonId.length > 4);
      ok("e agradece", /Obrigado/i.test(await app.corpo()));
    }
    await pg.goto(BASE + "/app", { waitUntil: "domcontentloaded" });
    await pg.waitForTimeout(2000);
    ok("depois de enviar, o card não volta", (await pg.locator("[data-pesquisa-curta]").count()) === 0);
    ok("nenhum erro de página na pesquisa", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // 2. Quem chegou hoje não é interrompido.
  {
    const app = await abrirApp(nav, { sessao: garagem({ startedAt: dia(0), quiz: QUIZ }), chaves: LIGADA });
    ok("quem chegou hoje não vê a pesquisa", (await app.pg.locator("[data-pesquisa-curta]").count()) === 0);
    await app.fechar();
  }
}
