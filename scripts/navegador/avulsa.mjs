// A compra avulsa na parede da Biela: o caminho inteiro, com as rotas dubladas.
//
// POR QUE ESTA SUÍTE EXISTE (09/11/2026). O dono decidiu em 08/11 que no
// Android a compra avulsa passa pelo Stripe, fora do app, e volta para ele.
// `npm run conferir:avulsa` cobra a regra e a ligação no fonte. O que só o
// navegador prova é o CAMINHO: que a parede mostra os três formatos com o
// preço certo, que o toque chama o checkout com o produto e a identidade, que
// a volta confirma a sessão certa e destranca o campo, e que o cancelamento
// avisa sem destrancar nada.
//
// O QUE ELA NÃO ALCANÇA: o Stripe de verdade, a aba do sistema e o deep link
// `mentorque://compra` no aparelho. Aqui é a web, onde a volta é pelo
// /app?ir=biela&compra=. O caminho do aparelho está no roteiro da ficha da
// 3.4, e sobre ele a resposta honesta, até alguém pagar num Android, é "sem
// sinal ainda".
import { garagem, dia, abrirApp, BASE } from "./base.mjs";

export const nome = "avulsa";
export const sobre = "a parede da Biela vende pacote e passe, e a volta do Stripe destranca";

const SESSAO = "cs_test_suite0123456789";

async function dublar(ctx, registro) {
  await ctx.route("**/api/biela", (rota) =>
    rota.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, mode: "ai", answer: "Óleo a cada 10.000 km, pelo manual.", restantes: 0, creditos: 0, passeAte: null }),
    }),
  );
  await ctx.route("**/api/avulsa/checkout", async (rota) => {
    registro.checkout.push(JSON.parse(rota.request().postData() ?? "{}"));
    await rota.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, sessao: SESSAO, url: `${BASE}/compra-concluida?sessao=${SESSAO}&de=web` }),
    });
  });
  await ctx.route("**/api/avulsa/confirmar", async (rota) => {
    const corpo = JSON.parse(rota.request().postData() ?? "{}");
    registro.confirmar.push(corpo);
    await rota.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        corpo.sessao === SESSAO
          ? { ok: true, ligada: true, compra: "gravou", restantes: 10, creditos: 10, passeAte: null }
          : { ok: true, ligada: true, compra: null, restantes: 0, creditos: 0, passeAte: null },
      ),
    });
  });
}

async function perguntar(pg, texto) {
  const campo = pg.locator("textarea").first();
  await campo.click();
  await campo.fill(texto);
  await campo.press("Enter");
  await pg.waitForTimeout(1500);
}

async function comprarEVoltar(nav, ok) {
  const registro = { checkout: [], confirmar: [] };
  const app = await abrirApp(nav, { sessao: garagem({ startedAt: dia(0) }), rota: "/app?ir=biela" });
  await dublar(app.ctx, registro);
  const { pg } = app;

  ok("a Biela abre com o campo de pergunta", (await pg.locator("textarea").count()) > 0);
  ok("antes da pergunta grátis, nenhuma folha de compra", (await pg.locator("[data-compra-avulsa]").count()) === 0);

  await perguntar(pg, "De quanto em quanto tempo troco o óleo?");
  const parede = await app.corpo();
  ok("gasta a grátis, a parede aparece com a folha avulsa", (await pg.locator("[data-compra-avulsa]").count()) === 1);
  ok("com os três formatos", (await pg.locator('[data-avulsa="pacote_2"]').count()) === 1 && (await pg.locator('[data-avulsa="pacote_10"]').count()) === 1 && (await pg.locator('[data-avulsa="passe_7d"]').count()) === 1);
  ok("e os preços do dono", /R\$ 1,90/.test(parede) && /R\$ 4,90/.test(parede) && /R\$ 9,90/.test(parede), parede.slice(parede.indexOf("Ou pague"), parede.indexOf("Ou pague") + 160).replace(/\n+/g, " | "));
  ok("e o Premium continua logo abaixo", (await pg.locator('[data-premium="biela"]').count()) === 1);
  ok("e o campo de pergunta some", (await pg.locator("textarea").count()) === 0);

  await pg.locator('[data-avulsa="pacote_10"]').click();
  await pg.waitForTimeout(ESPERA_DA_VOLTA);
  const pedido = registro.checkout[0] ?? {};
  ok("o toque chama o checkout com o produto", pedido.produto === "pacote_10", JSON.stringify(pedido));
  ok("e com a identidade do aparelho", typeof pedido.anonId === "string" && pedido.anonId.length > 4);
  ok("e diz que veio da web", pedido.plataforma === "web");

  ok("a volta confirma a sessão certa", registro.confirmar.some((c) => c.sessao === SESSAO), JSON.stringify(registro.confirmar));
  const depois = await app.corpo();
  ok("e avisa que a compra foi confirmada", /compra confirmada/i.test(depois));
  ok("e o campo de pergunta volta", (await pg.locator("textarea").count()) > 0);
  ok("e o saldo diz quantas cabem", /10 perguntas restantes/i.test(depois), depois.match(/\d+ perguntas? [^\n]*/)?.[0] ?? "");
  ok("a URL perde a sessão depois de confirmar", !/compra=/.test(pg.url()), pg.url());
  const pendente = await pg.evaluate(() => localStorage.getItem("mentorque.compraAvulsaPendente"));
  ok("e a sessão pendente é limpa", pendente === null, String(pendente));
  ok("nenhum erro de página no caminho da compra", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}

async function cancelar(nav, ok) {
  const registro = { checkout: [], confirmar: [] };
  const app = await abrirApp(nav, { sessao: garagem({ startedAt: dia(0) }), rota: "/compra-concluida?cancelou=1&de=web" });
  await dublar(app.ctx, registro);
  await app.pg.waitForTimeout(ESPERA_DA_VOLTA);
  const texto = await app.corpo();
  ok("cancelar volta para a Biela avisando que nada foi cobrado", /Nada foi cobrado/i.test(texto), app.pg.url());
  ok("e não confirma sessão nenhuma", !registro.confirmar.some((c) => c.sessao), JSON.stringify(registro.confirmar));
  ok("nenhum erro de página no cancelamento", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}

/** O servidor de antes da tabela (o estado de 09/11, até o SQL rodar): a
 *  resposta não traz `creditos`, e a parede tem de mostrar só o Premium. */
async function servidorSemAvulsa(nav, ok) {
  const app = await abrirApp(nav, { sessao: garagem({ startedAt: dia(0) }), rota: "/app?ir=biela" });
  await app.ctx.route("**/api/biela", (rota) =>
    rota.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, mode: "ai", answer: "Óleo a cada 10.000 km.", restantes: 0 }) }),
  );
  await perguntar(app.pg, "De quanto em quanto tempo troco o óleo?");
  ok("sem a compra ligada no servidor, a parede NÃO mostra os pacotes", (await app.pg.locator("[data-compra-avulsa]").count()) === 0);
  ok("e mostra o Premium, como antes", (await app.pg.locator('[data-premium="biela"]').count()) === 1);
  ok("nenhum erro de página sem a compra ligada", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}

const ESPERA_DA_VOLTA = 9000;

export async function rodar({ nav, ok }) {
  await comprarEVoltar(nav, ok);
  await cancelar(nav, ok);
  await servidorSemAvulsa(nav, ok);
}
