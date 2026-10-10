// O formulário "Fale com a gente" não sai sem e-mail (10/10/2026).
//
// Pedido do dono: chegaram dúvidas sem e-mail e não houve como responder. O
// formulário é o único canal de volta, então ele só envia com um endereço que
// pareça um endereço. Esta suíte prova os dois lados da fronteira: sem e-mail
// e com e-mail torto NADA sai para /api/feedback e a tela diz por quê; com
// e-mail válido o envio acontece e leva o endereço.
import { garagem, abrirApp } from "./base.mjs";

export const nome = "suporte";
export const sobre = "o formulário de dúvidas exige e-mail antes de enviar";

export async function rodar({ nav, ok }) {
  const app = await abrirApp(nav, {
    sessao: garagem({ email: null }),
    chaves: { "mq-primeiro-quiz-nao": "1" },
  });
  const { pg } = app;

  // Nenhum e-mail de verdade sai desta conferência: a rota é respondida aqui.
  const envios = [];
  await pg.route("**/api/feedback", async (route) => {
    envios.push(JSON.parse(route.request().postData() ?? "{}"));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await pg.getByRole("button", { name: /^Perfil$/i }).first().click();
  await pg.waitForTimeout(900);
  await pg.getByText(/Fale com a gente/i).first().click();
  await pg.waitForTimeout(600);

  const campoEmail = pg.locator("[data-suporte-email]").first();
  ok("o formulário tem o campo de e-mail", (await campoEmail.count()) === 1);
  ok("e o campo é obrigatório para o navegador também", (await campoEmail.getAttribute("required")) !== null);

  await pg.locator("textarea").first().fill("Minha dúvida de teste: o app não abre a aula.");
  await pg.getByRole("button", { name: /Enviar mensagem/i }).first().click();
  await pg.waitForTimeout(600);
  ok("sem e-mail, a tela diz que precisa dele", (await pg.locator("[data-suporte-email-erro]").count()) === 1);
  ok("e NADA foi enviado", envios.length === 0, `envios=${envios.length}`);

  await campoEmail.fill("rodrigo");
  await pg.getByRole("button", { name: /Enviar mensagem/i }).first().click();
  await pg.waitForTimeout(600);
  ok("com e-mail torto, continua sem enviar", envios.length === 0 && (await pg.locator("[data-suporte-email-erro]").count()) === 1);

  await campoEmail.fill("pessoa@exemplo.com");
  ok("digitar apaga o aviso", (await pg.locator("[data-suporte-email-erro]").count()) === 0);
  await pg.getByRole("button", { name: /Enviar mensagem/i }).first().click();
  await pg.waitForTimeout(1200);
  ok("com e-mail válido, envia uma vez", envios.length === 1, `envios=${envios.length}`);
  ok("e o envio leva o e-mail e a mensagem", envios[0]?.email === "pessoa@exemplo.com" && /aula/.test(envios[0]?.message ?? ""), JSON.stringify(envios[0] ?? {}).slice(0, 160));
  ok("a tela confirma o envio", /Mensagem enviada/i.test(await app.corpo()));

  ok("nenhum erro de página", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}
