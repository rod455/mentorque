// Quem toca em assinar sem conta, cria a conta e volta: o que acontece depois.
//
// POR QUE (26/10/2026). Desde 12/10, quatro aparelhos tocaram em assinar sem
// conta, três criaram a conta em menos de um minuto, e nenhum chegou ao
// checkout. Nenhuma suíte alcançava o depois do login, porque sem as
// variáveis do Supabase o app roda como convidado puro. Esta roda num servidor
// com um Supabase de mentira (`supabaseFalso`, ver todos.mjs) e responde as
// chamadas dele aqui mesmo: nada sai da máquina, nenhuma conta é criada.
//
// O que se prova: depois do login a pessoa está de novo no paywall, e não na
// tela inicial; a volta grava `viu_paywall` com origem `pos-conta`, uma vez
// só; e a marca do botão de assinar é apagada. O lado negativo: reabrir o
// paywall depois não grava outra volta.
//
// O que NÃO se prova: o login do Google no Android sai do app para o
// navegador do sistema e volta por link profundo. Esse ida e volta não existe
// no Chromium; aqui o login é o de e-mail, que roda dentro da página. O
// evento novo é justamente o que vai dizer, nos aparelhos, se a volta acontece
// também por lá.
import { garagem, abrirApp } from "./base.mjs";

export const nome = "pos-conta";
export const sobre = "quem é parado pela conta volta ao paywall depois do login, e a volta é contada";
export const supabaseFalso = true;

const UID = "00000000-0000-4000-8000-0000000000aa";

/** Responde, no navegador, tudo que o app pediria ao Supabase de mentira. */
async function supabaseDeMentira(pg) {
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
    return r.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  return pedidos;
}

export async function rodar({ nav, ok }) {
  const app = await abrirApp(nav, { sessao: garagem({ startedAt: "2026-01-01" }), chaves: { "mq-primeiro-quiz-nao": "1" } });
  const { pg } = app;
  const pedidos = await supabaseDeMentira(pg);
  const eventos = [];
  await pg.route("**/api/funil", (r) => {
    try { eventos.push(JSON.parse(r.request().postData() ?? "{}")); } catch { /* corpo que não é JSON */ }
    return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  const voltas = () => eventos.filter((e) => e.evento === "viu_paywall" && e.origem === "pos-conta");

  await pg.getByRole("button", { name: /Teste o Premium|Premium/i }).first().click().catch(() => {});
  await pg.waitForTimeout(1500);
  await pg.getByRole("button", { name: /Começar 7 dias grátis/i }).first().click().catch(() => {});
  await pg.waitForTimeout(1500);
  ok("tocar em assinar sem conta leva à tela de entrar", /Falta só a conta/i.test(await app.tela()));
  ok("e grava o tentou_assinar", eventos.some((e) => e.evento === "tentou_assinar"), JSON.stringify(eventos.map((e) => e.evento)));
  ok("nenhuma volta contada antes do login", voltas().length === 0);

  await pg.getByPlaceholder(/voce@email.com/).first().fill("teste@exemplo.com");
  await pg.getByPlaceholder(/mínimo 6/).first().fill("senha123");
  await pg.getByRole("button", { name: /^Entrar$/ }).last().click();
  await pg.waitForTimeout(3000);

  ok(
    "o login passou pelo Supabase de mentira",
    pedidos.some((u) => u.includes("/auth/v1/token")),
    pedidos.length ? "" : "nenhum pedido ao Supabase: o servidor subiu sem as variáveis de mentira?",
  );
  const depois = await app.tela();
  ok("depois do login a pessoa está de novo no paywall", /Experimente o Premium/i.test(depois) && !/Falta só a conta/i.test(depois), depois.slice(0, 100).replace(/\n/g, " "));
  ok("a volta é contada uma vez, com a conta", voltas().length === 1 && voltas()[0].userId === UID, JSON.stringify(voltas()));
  const marca = await pg.evaluate(() => window.localStorage.getItem("mq-veio-assinar"));
  ok("e a marca do botão de assinar é apagada", marca === null, String(marca));

  // O lado negativo: sair e reabrir o paywall já não é volta de login.
  await pg.getByRole("button", { name: /voltar|fechar|close/i }).first().click().catch(() => {});
  await pg.waitForTimeout(1500);
  await pg.getByRole("button", { name: /Teste o Premium|Premium/i }).first().click().catch(() => {});
  await pg.waitForTimeout(1500);
  ok("reabrir o paywall não conta outra volta", voltas().length === 1, JSON.stringify(voltas()));

  ok("nenhum erro de página", app.erros.length === 0, app.erros.join(" | "));
  await app.fechar();
}
