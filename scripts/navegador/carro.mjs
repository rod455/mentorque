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

export async function rodar({ nav, ok }) {
  // ---- com três carros -----------------------------------------------------
  {
    const app = await abrirApp(nav, { sessao: SESSAO(FROTA), chaves: { "mq-primeiro-quiz-nao": "1" } });
    const { pg } = app;

    const gatilho = pg.getByRole("button", { name: /Trocar de carro/i }).first();
    ok("o carro ativo aparece na barra de cima", (await gatilho.count()) > 0);
    ok("o gatilho mostra o carro selecionado", /Golfinho/.test(await gatilho.innerText()));

    await gatilho.click();
    await pg.waitForTimeout(500);
    const lista = pg.getByRole("menu");
    ok("a lista desce com os OUTROS carros", (await lista.count()) > 0);
    const itens = await lista.getByRole("menuitem").allInnerTexts();
    ok("os outros dois estão na lista, o ativo não",
      itens.length === 2 && itens.some((t) => /Unozinho/.test(t)) && itens.some((t) => /Nininha/.test(t)) && !itens.some((t) => /Golfinho/.test(t)),
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

    // Em 320px nada da barra de cima fica inalcançável.
    await pg.setViewportSize({ width: 320, height: 844 });
    await pg.waitForTimeout(500);
    const fora = await controlesForaDaTela(pg, "header");
    ok("em 320px a barra de cima cabe inteira", fora.length === 0, fora.join(" | "));

    ok("nenhum erro de página", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // ---- com um carro só -----------------------------------------------------
  {
    const app = await abrirApp(nav, { sessao: SESSAO([{ ...CARRO }]), chaves: { "mq-primeiro-quiz-nao": "1" } });
    ok("com um carro só, o seletor não existe", (await app.pg.getByRole("button", { name: /Trocar de carro/i }).count()) === 0);
    ok("e a marca volta por extenso", (await app.pg.locator('header img[src*="lockup"]').count()) > 0);
    await app.fechar();
  }
}
