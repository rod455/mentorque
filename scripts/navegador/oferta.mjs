// A oferta do Premium no primeiro dia: aparece para o carro recém-cadastrado,
// leva ao Premium, e o "agora não" a esconde de vez.
//
// POR QUE ESTA SUÍTE EXISTE (16/11/2026, plano de receita). `npm run
// conferir:oferta-primeiro-dia` executa a regra (quem vê e quem não vê) e lê
// a ligação no fonte. O que só o navegador prova é a TELA: que o card aparece
// de verdade na tela do carro, que o botão abre o Premium, e que o "agora
// não" sobrevive a uma recarga, porque guardar o "não" é a promessa da regra.
//
// O QUE ELA NÃO ALCANÇA: o iPhone (a regra esconde a oferta lá, e isso a
// conferência de script prova) e a compra de verdade na loja.
import { garagem, CARRO, dia, abrirApp, BASE, ESPERA_DE_ABERTURA } from "./base.mjs";

export const nome = "oferta";
export const sobre = "o Premium aparece no primeiro dia do carro, e o \"agora não\" vale para sempre";

const SESSAO = (vehicles) =>
  garagem({
    vehicles,
    startedAt: dia(0),
    quiz: { ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 },
  });
const CHAVES = { "mq-primeiro-quiz-nao": "1" };

export async function rodar({ nav, ok }) {
  // 1. Carro cadastrado agora: a oferta aparece e leva ao Premium.
  {
    const app = await abrirApp(nav, { sessao: SESSAO([{ ...CARRO, createdAt: new Date().toISOString() }]), chaves: CHAVES, rota: "/app?ir=car" });
    const { pg } = app;
    await pg.waitForTimeout(1500);
    const card = pg.locator("[data-oferta-primeiro-dia]");
    ok("carro de hoje: a oferta aparece na tela do carro", (await card.count()) === 1);
    const texto = (await card.count()) ? await card.innerText() : "";
    ok("e diz 7 dias grátis e o nome do carro", /7 dias, de graça/i.test(texto) && /Golfinho|Golf GTI/i.test(texto), texto.replace(/\n+/g, " | "));
    if (await card.count()) {
      await card.getByRole("button", { name: /Começar 7 dias grátis/i }).click();
      await pg.waitForTimeout(1500);
      ok("o botão abre a tela do Premium", /Premium/i.test(await app.corpo()) && (await pg.locator("[data-oferta-primeiro-dia]").count()) === 0);
    }
    ok("nenhum erro de página na oferta", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // 2. "Agora não" esconde, e a recarga não traz de volta.
  {
    const app = await abrirApp(nav, { sessao: SESSAO([{ ...CARRO, createdAt: new Date().toISOString() }]), chaves: CHAVES, rota: "/app?ir=car" });
    const { pg } = app;
    await pg.waitForTimeout(1500);
    const card = pg.locator("[data-oferta-primeiro-dia]");
    if (await card.count()) await card.getByRole("button", { name: /Agora não/i }).click();
    await pg.waitForTimeout(500);
    ok("\"agora não\" esconde a oferta", (await pg.locator("[data-oferta-primeiro-dia]").count()) === 0);
    // Reabre a TELA DO CARRO, e não só recarrega: o app limpa o `ir=` da URL,
    // e uma recarga simples cai no Início, onde o card nunca está. A primeira
    // versão desta linha recarregava e passou verde com o "não" esquecido.
    // A espera é a da abertura (a tela de entrada dura segundos). A segunda
    // versão desta linha esperava 2 s, olhava a tela de entrada e ficava
    // cega do mesmo jeito; quem pegou foi a bateria completa de 16/11.
    await pg.goto(BASE + "/app?ir=car", { waitUntil: "domcontentloaded" });
    await pg.waitForTimeout(ESPERA_DE_ABERTURA + 1500);
    ok("a tela do carro reabriu", /Golfinho/i.test(await app.corpo()));
    ok("e depois de reabrir a oferta não volta", (await pg.locator("[data-oferta-primeiro-dia]").count()) === 0);
    await app.fechar();
  }

  // 3. Carro de semanas atrás: a oferta do começo não vira faixa permanente.
  {
    const antigo = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const app = await abrirApp(nav, { sessao: SESSAO([{ ...CARRO, createdAt: antigo }]), chaves: CHAVES, rota: "/app?ir=car" });
    await app.pg.waitForTimeout(1500);
    ok("carro de 10 dias atrás: sem oferta", (await app.pg.locator("[data-oferta-primeiro-dia]").count()) === 0);
    await app.fechar();
  }
}
