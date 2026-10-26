// Quem toca em assinar sem conta, cria a conta e volta: o que acontece depois.
//
// POR QUE (26/10/2026). Desde 12/10, quatro aparelhos tocaram em assinar sem
// conta, três criaram a conta em menos de um minuto, e nenhum chegou ao
// checkout. Nenhuma suíte alcançava o depois do login, porque sem as
// variáveis do Supabase o app roda como convidado puro. Esta roda num servidor
// com um Supabase de mentira (`supabaseFalso`, ver todos.mjs) e responde as
// chamadas dele aqui mesmo: nada sai da máquina, nenhuma conta é criada.
//
// O que se prova: depois do login a COMPRA É RETOMADA sozinha, no mesmo
// passo que a pessoa pediu (aqui, o checkout do site com o plano anual), sem
// segundo toque (decisão do dono, 26/10/2026); a volta grava `viu_paywall`
// com origem `pos-conta`, uma vez só; e as duas marcas são apagadas. Os dois
// lados negativos, que são os que protegem o dinheiro: conta que JÁ ASSINA
// não vê compra nenhuma, e retomada vencida não abre nada.
//
// O que NÃO se prova: o login do Google no Android sai do app para o
// navegador do sistema e volta por link profundo. Esse ida e volta não existe
// no Chromium; aqui o login é o de e-mail, que roda dentro da página. O
// evento novo é justamente o que vai dizer, nos aparelhos, se a volta acontece
// também por lá.
import { garagem, abrirApp } from "./base.mjs";

export const nome = "pos-conta";
export const sobre = "quem é parado pela conta tem a compra retomada depois do login, e quem já assina não";
export const supabaseFalso = true;

const UID = "00000000-0000-4000-8000-0000000000aa";

/** Responde, no navegador, tudo que o app pediria ao Supabase de mentira. */
async function supabaseDeMentira(pg, { assinaturaAtiva = false } = {}) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const agora = Math.floor(Date.now() / 1000);
  const jwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: UID, aud: "authenticated", role: "authenticated", exp: agora + 3600, iat: agora })}.assinatura`;
  const user = { id: UID, aud: "authenticated", role: "authenticated", email: "teste@exemplo.com", app_metadata: { provider: "email" }, user_metadata: {}, created_at: new Date().toISOString() };
  const pedidos = [];
  await pg.route("**/falso.supabase.co/**", (r) => {
    const url = r.request().url();
    pedidos.push(url);
    if (url.includes("/auth/v1/token")) {
      return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ access_token: jwt, token_type: "bearer", expires_in: 3600, expires_at: agora + 3600, refresh_token: "r1", user }) });
    }
    if (url.includes("/auth/v1/user")) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(user) });
    if (url.includes("/rest/v1/subscriptions") && assinaturaAtiva) {
      return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ status: "active", current_period_end: null, cancel_at_period_end: false }]) });
    }
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  return pedidos;
}

/** Abre o app, pede o paywall, toca em assinar sem conta e entra por e-mail. */
async function assinarEntrarPorEmail(nav, ok, { assinaturaAtiva = false, antesDoLogin } = {}) {
  const app = await abrirApp(nav, { sessao: garagem({ startedAt: "2026-01-01" }), chaves: { "mq-primeiro-quiz-nao": "1" } });
  const { pg } = app;
  const pedidos = await supabaseDeMentira(pg, { assinaturaAtiva });
  const eventos = [];
  await pg.route("**/api/funil", (r) => {
    try { eventos.push(JSON.parse(r.request().postData() ?? "{}")); } catch { /* corpo que não é JSON */ }
    return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await pg.getByRole("button", { name: /Teste o Premium|Premium/i }).first().click().catch(() => {});
  await pg.waitForTimeout(1500);
  await pg.getByRole("button", { name: /Começar 7 dias grátis/i }).first().click().catch(() => {});
  await pg.waitForTimeout(1500);
  const telaDeEntrar = await app.tela();
  if (antesDoLogin) await antesDoLogin(pg);
  await pg.getByPlaceholder(/voce@email.com/).first().fill("teste@exemplo.com");
  await pg.getByPlaceholder(/mínimo 6/).first().fill("senha123");
  await pg.getByRole("button", { name: /^Entrar$/ }).last().click();
  await pg.waitForTimeout(3500);
  return { app, pg, pedidos, eventos, telaDeEntrar };
}

const checkouts = (eventos) => eventos.filter((e) => e.evento === "iniciou_checkout");

export async function rodar({ nav, ok }) {
  // 1. O caminho do dono: tocou em assinar, criou a conta, a compra reabre.
  {
    const { app, pg, pedidos, eventos, telaDeEntrar } = await assinarEntrarPorEmail(nav, ok);
    ok("tocar em assinar sem conta leva à tela de entrar", /Falta só a conta/i.test(telaDeEntrar));
    ok("e grava o tentou_assinar com o botão tocado", eventos.some((e) => e.evento === "tentou_assinar" && e.origem === "web-annual"), JSON.stringify(eventos.map((e) => [e.evento, e.origem])));
    ok(
      "o login passou pelo Supabase de mentira",
      pedidos.some((u) => u.includes("/auth/v1/token")),
      pedidos.length ? "" : "nenhum pedido ao Supabase: o servidor subiu sem as variáveis de mentira?",
    );
    const voltas = eventos.filter((e) => e.evento === "viu_paywall" && e.origem === "pos-conta");
    ok("a volta é contada uma vez, com a conta", voltas.length === 1 && voltas[0].userId === UID, JSON.stringify(voltas));
    const c = checkouts(eventos);
    ok("depois do login a compra é retomada sozinha, no mesmo plano", c.length === 1 && c[0].origem === "web-annual" && c[0].userId === UID, JSON.stringify(c));
    const marcas = await pg.evaluate(() => [window.localStorage.getItem("mq-veio-assinar"), window.localStorage.getItem("mq-compra-a-retomar")]);
    ok("e as duas marcas são apagadas, para não retomar de novo", marcas[0] === null && marcas[1] === null, JSON.stringify(marcas));
    ok("nenhum erro de página", app.erros.length === 0, app.erros.join(" | "));
    await app.fechar();
  }

  // 2. Conta que já assina: entrar não pode abrir uma segunda compra.
  {
    const { app, eventos } = await assinarEntrarPorEmail(nav, ok, { assinaturaAtiva: true });
    ok("conta que já assina não vê compra retomada", checkouts(eventos).length === 0, JSON.stringify(checkouts(eventos)));
    const tela = await app.tela();
    ok("e sai do paywall", !/Experimente o Premium/i.test(tela), tela.slice(0, 80).replace(/\n/g, " "));
    await app.fechar();
  }

  // 3. Retomada vencida: quem demorou mais de dez minutos não é surpreendido.
  {
    const { app, eventos } = await assinarEntrarPorEmail(nav, ok, {
      antesDoLogin: (pg) =>
        pg.evaluate(() => {
          const r = JSON.parse(window.localStorage.getItem("mq-compra-a-retomar") ?? "{}");
          r.t = Date.now() - 11 * 60 * 1000;
          window.localStorage.setItem("mq-compra-a-retomar", JSON.stringify(r));
        }),
    });
    ok("retomada vencida não abre compra nenhuma", checkouts(eventos).length === 0, JSON.stringify(checkouts(eventos)));
    ok("e a pessoa fica no paywall, como antes", /Experimente o Premium/i.test(await app.tela()));
    await app.fechar();
  }
}
