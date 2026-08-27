// A troca de carro pela lista na barra de cima.
//
// O que precisa ser verdade: com 2+ carros o carro ativo aparece no topo,
// tocar abre a lista com os OUTROS, escolher troca o carro ativo do app
// inteiro (o cartão "SEU CARRO" muda junto), e a escolha sobrevive à recarga.
// Com um carro só, nada disso existe.
import { garagem, CARRO, dia, abrirApp, controlesForaDaTela } from "./base.mjs";

export const nome = "carro";
export const sobre = "a lista de troca de carro na barra de cima";

const FROTA = [
  { ...CARRO, nickname: "Golfinho" },
  { id: "v2", type: "car", make: "Fiat", model: "Uno", year: 2008, nickname: "Unozinho", odometerKm: 210000, kmUpdatedAt: CARRO.kmUpdatedAt, purchaseDate: "2015-02-01" },
  { id: "v3", type: "moto", make: "Honda", model: "CB 500F", year: 2019, nickname: "Nininha", odometerKm: 22000, kmUpdatedAt: CARRO.kmUpdatedAt, purchaseDate: "2021-07-01" },
];

// Quiz do dia feito e primeiro-quiz dispensado: nenhuma folha na frente.
const SESSAO = (vehicles) =>
  garagem({
    vehicles,
    startedAt: "2026-08-23",
    quiz: { ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 },
  });

// Em cada largura de celular: nada fora da tela E nada por cima de nada.
//
// A segunda parte existe por dois defeitos reais que a primeira NÃO pega: o
// botão do carro vazou por baixo do chip do quiz (botão é elemento de
// formulário e não encolhe com o pai sem max-w-full), e depois o chip cobriu
// a marca por extenso no caso de UM carro. Controles visíveis e dentro da
// tela, então "fora da tela" passava verde com um por cima do outro.
async function nadaSeAtropela(pg, ok, largura) {
  await pg.setViewportSize({ width: largura, height: 844 });
  await pg.waitForTimeout(500);
  const fora = await controlesForaDaTela(pg, "header");
  ok(`em ${largura}px a barra de cima cabe inteira`, fora.length === 0, fora.join(" | "));
  const sobreposto = await pg.evaluate(() => {
    const els = [...document.querySelectorAll("header button")].map((el) => ({
      rotulo: (el.getAttribute("aria-label") ?? el.textContent ?? "").slice(0, 20),
      r: el.getBoundingClientRect(),
    }));
    for (let i = 0; i < els.length; i++)
      for (let j = i + 1; j < els.length; j++) {
        const a = els[i].r, b = els[j].r;
        if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1)
          return `${els[i].rotulo} sobre ${els[j].rotulo}`;
      }
    return null;
  });
  ok(`em ${largura}px nenhum controle cobre outro`, sobreposto === null, sobreposto ?? "");
}

export async function rodar({ nav, ok }) {
  // ---- com três carros -----------------------------------------------------
  {
    const app = await abrirApp(nav, { sessao: SESSAO(FROTA), chaves: { "mq-primeiro-quiz-nao": "1" } });
    const { pg } = app;

    const gatilho = pg.getByRole("button", { name: /Trocar de carro/i }).first();
    ok("o carro ativo aparece na barra de cima", (await gatilho.count()) > 0);
    ok("o gatilho mostra o carro selecionado COM o ano", /Golfinho\s+2014/.test(await gatilho.innerText()), await gatilho.innerText());

    await gatilho.click();
    await pg.waitForTimeout(500);
    const lista = pg.getByRole("menu");
    ok("a lista desce com os OUTROS carros", (await lista.count()) > 0);
    const itens = await lista.getByRole("menuitem").allInnerTexts();
    ok("os outros dois estão na lista, com ano, e o ativo não",
      itens.length === 2 && itens.some((t) => /Unozinho 2008/.test(t)) && itens.some((t) => /Nininha 2019/.test(t)) && !itens.some((t) => /Golfinho/.test(t)),
      JSON.stringify(itens));

    await lista.getByRole("menuitem").filter({ hasText: "Unozinho" }).click();
    await pg.waitForTimeout(800);
    ok("a lista fecha ao escolher", (await pg.getByRole("menu").count()) === 0);
    ok("o gatilho passa a mostrar o escolhido", /Unozinho/.test(await gatilho.innerText()));
    ok("o cartão SEU CARRO acompanha", /Uno 2008|Unozinho/.test(await app.tela()));

    // Fechar tocando fora, sem escolher. O toque vai num canto VAZIO do
    // cabeçalho de propósito: tocar no meio do <main> acerta um cartão e
    // navega para outra tela, onde a barra de cima nem existe.
    await gatilho.click();
    await pg.waitForTimeout(400);
    await pg.locator("header").click({ position: { x: 250, y: 8 } });
    await pg.waitForTimeout(400);
    ok("tocar fora fecha sem trocar", (await pg.getByRole("menu").count()) === 0 && /Unozinho/.test(await gatilho.innerText()));

    // A escolha sobrevive à recarga.
    await app.recarregar();
    ok("a troca sobrevive à recarga", /Unozinho/.test(await pg.getByRole("button", { name: /Trocar de carro/i }).first().innerText()));

    for (const largura of [390, 360, 320]) {
      await nadaSeAtropela(pg, ok, largura);

      // O texto no DOM não prova nada: o truncate corta na tela e o innerText
      // continua inteiro. Então aqui a régua é o pixel — o span do ano não
      // pode estar cortado — e o chip do quiz tem que estar sem o rótulo
      // escrito, que é de onde saem os 67px que o nome do carro precisa.
      // (Em 320px o ano pode cortar: é o limite físico, e o nome cede antes.)
      const aperto = await pg.evaluate(() => {
        const g = document.querySelector('header button[aria-label*="Trocar"]');
        const ano = [...(g?.querySelectorAll("span") ?? [])].find((s) => /^\d{4}$/.test(s.textContent ?? ""));
        const chip = [...document.querySelectorAll("header button")].find((b) => (b.getAttribute("aria-label") ?? "").includes("Quiz"));
        return {
          anoInteiro: !!ano && ano.scrollWidth <= ano.clientWidth + 1,
          // innerText, não textContent: o rótulo escondido por CSS continua no
          // DOM, e textContent o veria mesmo invisível.
          chipTexto: (chip?.innerText ?? "").trim(),
        };
      });
      if (largura >= 360) ok(`em ${largura}px o ano aparece inteiro, sem corte`, aperto.anoInteiro);
      ok(`em ${largura}px o chip do quiz cede o rótulo escrito`, !/Di[áa]rio|Daily/i.test(aperto.chipTexto), aperto.chipTexto);
    }

    ok("nenhum erro de página", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // ---- com um carro só -----------------------------------------------------
  {
    const app = await abrirApp(nav, { sessao: SESSAO([{ ...CARRO }]), chaves: { "mq-primeiro-quiz-nao": "1" } });
    const { pg } = app;
    ok("com um carro só, o seletor não existe", (await pg.getByRole("button", { name: /Trocar de carro/i }).count()) === 0);
    ok("e a marca volta por extenso", (await pg.locator('header img[src*="lockup"]:visible').count()) > 0);

    // O buraco por onde a regressão de 27/08 passou: as réguas de aperto só
    // rodavam com 3 carros, onde a marca é o símbolo pequeno. Com um carro a
    // marca por extenso é o item mais largo da barra, e o chip do quiz a
    // cobria. Agora: por extenso de 360px para cima, símbolo abaixo, rótulo
    // escrito do chip só de 430px para cima.
    for (const largura of [480, 430, 390, 360, 320]) {
      await nadaSeAtropela(pg, ok, largura);
      const marca = await pg.evaluate(() => ({
        lockup: !!document.querySelector('header img[src*="lockup"]')?.checkVisibility(),
        simbolo: !!document.querySelector('header img[src*="mark"]')?.checkVisibility(),
      }));
      ok(`em ${largura}px a marca certa: ${largura >= 360 ? "por extenso" : "símbolo"}`,
        largura >= 360 ? marca.lockup && !marca.simbolo : marca.simbolo && !marca.lockup,
        JSON.stringify(marca));
      const chipTexto = await pg.evaluate(() =>
        ([...document.querySelectorAll("header button")].find((b) => (b.getAttribute("aria-label") ?? "").includes("Quiz"))?.innerText ?? "").trim());
      ok(`em ${largura}px o chip ${largura >= 430 ? "mostra" : "esconde"} o rótulo escrito`,
        largura >= 430 ? /Di[áa]rio|Daily/i.test(chipTexto) : !/Di[áa]rio|Daily/i.test(chipTexto), chipTexto);
    }
    ok("nenhum erro de página com um carro", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }
}
