// A porta de entrada de quem não tem carro: perguntar primeiro, cadastrar depois.
//
// POR QUE ESTA SUÍTE EXISTE (28/09/2026). O Início de quem não tem carro dizia
// "Vamos cadastrar o seu primeiro carro" e o botão grande ia ao formulário, que
// é o maior vazamento do produto: cinco em seis que o abrem nas lojas não
// terminam, e `comecou_onboarding` é a última ação de 78,7% na web. A ordem
// mudou: pergunta ao Biela primeiro, e o carro é pedido DEPOIS da resposta.
//
// `npm run conferir:porta` já cobra a ligação no fonte. O que só o navegador
// prova é o CAMINHO: que o toque leva onde deve, que o convite não aparece
// antes da resposta e aparece depois dela, e que o cadastro continua
// alcançável em um toque para quem já sabe o que quer.
//
// O QUE ELA NÃO ALCANÇA: a qualidade da resposta do Biela sem carro. A rota é
// dublada aqui (não se gasta chamada paga numa conferência), então isto prova
// a MECÂNICA da tela, não se o texto convence. Quem responde isso é o número
// depois de uns dias no ar.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "porta";
export const sobre = "quem não tem carro pergunta antes de cadastrar";

const SEM_CARRO = garagem({ semCarro: true, startedAt: dia(0) });
const CHAVES = { "mq-primeiro-quiz-nao": "1" };

/** Responde /api/biela sem gastar chamada paga, e sem depender de rede. */
async function dublarBiela(ctx) {
  await ctx.route("**/api/biela", (rota) =>
    rota.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        mode: "ai",
        answer: "Barulho ao frear costuma ser pastilha no fim. Vale olhar hoje.",
        restantes: 4,
      }),
    }),
  );
}

async function perguntarPrimeiro(nav, ok) {
  const app = await abrirApp(nav, { sessao: SEM_CARRO, chaves: CHAVES });
  await dublarBiela(app.ctx);
  const { pg } = app;

  // ---- 1. o Início pergunta, em vez de mandar cadastrar ---------------------
  const texto = await app.corpo();
  ok("o Início de quem não tem carro faz uma PERGUNTA", /O que está acontecendo com o seu carro/i.test(texto), texto.slice(0, 80).replace(/\n/g, " "));
  ok("e não manda cadastrar de cara", !/Vamos cadastrar o seu primeiro carro/i.test(texto));

  const perguntar = pg.getByRole("button", { name: /Perguntar para o Biela/i }).first();
  ok("o botão grande convida a perguntar", (await perguntar.count()) > 0);

  // ---- 2. o cadastro continua a UM toque ----------------------------------
  //
  // A troca é de ordem, e não de esconder o cadastro: quem já sabe o que quer
  // não pode ser obrigado a conversar antes.
  const cadastrar = pg.getByRole("button", { name: /cadastrar meu carro/i }).first();
  ok("o cadastro continua alcançável em um toque", (await cadastrar.count()) > 0);

  // ---- 3. o toque leva ao Biela -------------------------------------------
  await perguntar.click();
  await pg.waitForTimeout(1200);
  const naBiela = await app.corpo();
  // A saudação está no texto da página; o "Pergunte ao Biela..." é PLACEHOLDER
  // e não entra em `innerText`. A primeira versão desta linha procurava o
  // placeholder e reprovava uma tela que estava certa.
  const temCampo = await pg.locator("textarea").count();
  ok("tocar no botão grande abre o Biela", /Sou o Biela/i.test(naBiela) && temCampo > 0, naBiela.slice(0, 80).replace(/\n/g, " "));

  // ---- 4. ANTES da resposta, nenhum convite ------------------------------
  //
  // É a condição que separa esta mudança do pedágio de antes: convidar antes
  // de entregar é o mesmo formulário, só que numa tela diferente.
  const antes = await pg.getByText(/Essa resposta serve para qualquer carro/i).count();
  ok("antes de perguntar, o convite do carro NÃO aparece", antes === 0, "convidar antes de entregar é o pedágio de volta");

  // ---- 5. pergunta, recebe, E AÍ o convite ---------------------------------
  const campo = pg.locator("textarea").first();
  await campo.click();
  await campo.fill("Barulho ao frear");
  await pg.getByRole("button", { name: /^Enviar$/i }).first().click().catch(async () => {
    await campo.press("Enter");
  });
  await pg.waitForTimeout(1500);

  const depois = await app.corpo();
  ok("a resposta do Biela aparece", /pastilha/i.test(depois), depois.slice(-120).replace(/\n/g, " "));
  ok("e o convite do carro aparece DEPOIS dela", /Essa resposta serve para qualquer carro/i.test(depois));

  // ---- 6. o convite leva ao cadastro --------------------------------------
  await pg.getByRole("button", { name: /^Cadastrar meu carro$/i }).first().click();
  await pg.waitForTimeout(1200);
  const noCadastro = await app.corpo();
  ok("o convite leva ao cadastro de carro", /Adicionar carro/i.test(noCadastro), noCadastro.slice(0, 60).replace(/\n/g, " "));

  // O FORMULÁRIO CURTO É O PADRÃO desde 02/10/2026, e esta é a conferência que
  // pega a volta dele. Ele venceu o A/B "cadastro-em-duas-etapas" (108 de 173
  // contra 78 de 173), e o teste saiu do código: sem sorteio, todo aparelho
  // novo tem que ver a versão curta. Se alguém devolver os sete campos por
  // padrão, estas duas linhas reprovam.
  const campos = await pg.evaluate(() =>
    [...document.querySelectorAll("label, input, button")]
      .filter((e) => e.checkVisibility?.())
      .map((e) => (e.textContent || e.getAttribute("placeholder") || "").trim())
      .join(" | ")
      .toLowerCase());
  // "ano" NÃO entra nesta asserção de propósito: ele só aparece depois de a
  // pessoa escolher o modelo, e foi esta conferência que me corrigiu nisso.
  ok("o cadastro novo pede marca e modelo", /marca/.test(campos) && /modelo/.test(campos), campos.slice(0, 160));
  ok("e NÃO pede km nem foto de entrada", !/quil[oó]metr|\bkm\b/.test(campos) && !/foto/.test(campos), campos.slice(0, 200));

  ok("nenhum erro de página no caminho inteiro", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}

/** Quem JÁ tem carro não perde nada: desde 04/10/2026 (aposta
 *  `inicio-pergunta-unica`) o Início é o mesmo para todo mundo, a pergunta
 *  ao Biela como porta, e o carro aparece logo abaixo como segundo bloco. */
async function quemTemCarroSegueIgual(nav, ok) {
  const app = await abrirApp(nav, { sessao: garagem({ startedAt: dia(0) }), chaves: CHAVES });
  const texto = await app.corpo();
  ok("com carro, o Início pergunta o que está acontecendo com o carro", /O que está acontecendo com o seu carro/i.test(texto));
  ok("e o botão grande é perguntar para o Biela", /Perguntar para o Biela/i.test(texto));
  ok("e o carro aparece como segundo bloco, com o nome dele", /Seu carro/i.test(texto) && /Golfinho|Golf GTI/i.test(texto));
  ok("o convite de cadastrar carro não sobra para quem já tem", !/Essa resposta serve para qualquer carro/i.test(texto));
  ok("nenhum erro de página com carro na garagem", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();
}

export async function rodar({ nav, ok }) {
  await perguntarPrimeiro(nav, ok);
  await quemTemCarroSegueIgual(nav, ok);
}
