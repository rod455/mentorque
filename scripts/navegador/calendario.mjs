// O bloco "Próximos serviços" do Calendário: ele diz QUANDO, e cabe na tela.
//
// Duas perguntas que só o navegador responde, e as duas vinham de defeito real
// relatado pelo dono em 30/08:
//
//   1. O nome do serviço estava sendo CORTADO no Android. Corte lateral não
//      aparece em asserção de texto nenhuma: o `innerText` devolve "Pneus
//      (rodízio/troca)" inteiro mesmo quando a tela mostra "Pneus (rodí…".
//      Quem sabe a verdade é o `scrollWidth` do elemento.
//   2. A linha dizia só o nome e "Já fiz esse serviço", que responde à
//      pergunta errada. Agora precisa dizer a data, o km e de onde saiu a
//      regra.
//
// A largura é 360px de propósito: é a tela do Android comum, e foi nela que o
// corte apareceu. Conferir em 390 (iPhone) deixaria o defeito passar.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "calendario";
export const sobre = "o plano de revisão diz data e km, não inventa atraso, e cabe em 360px";

const ANDROID_ESTREITO = { width: 360, height: 800 };

// Duas revisões caindo perto uma da outra, de propósito: é o que faz a
// sugestão de "leve tudo numa visita só" aparecer.
//
//   óleo    12 meses, feito há 10 meses  → vence em ~2 meses
//   fluido  24 meses, feito há 22 meses  → vence em ~2 meses
//   pneus   só por km, sem prazo         → é o nome comprido que cortava
const SESSAO = () =>
  garagem({
    startedAt: "2026-01-01",
    quiz: { ultimoDia: dia(0), sequencia: 3, recorde: 3, perdaoEm: null, respostas: 3, acertos: 2 },
    services: [
      { id: "s1", vehicleId: "v1", type: "oil", date: dia(-304), km: 90000, total: 320, parts: [], notes: "" },
      { id: "s2", vehicleId: "v1", type: "brakefluid", date: dia(-669), km: 78000, total: 180, parts: [], notes: "" },
    ],
    reminders: ["v1:oil", "v1:brakefluid", "v1:tires"],
  });

export async function rodar({ nav, ok }) {
  const ctx = await nav.newContext({ viewport: ANDROID_ESTREITO, deviceScaleFactor: 2, locale: "pt-BR" });
  await ctx.close();

  const b = await abrirApp(nav, { sessao: SESSAO() });
  await b.pg.setViewportSize(ANDROID_ESTREITO);
  await b.pg.getByRole("button", { name: /^Calendário$/i }).first().click();
  await b.pg.waitForTimeout(2500);

  const tela = await b.tela();

  // ---- diz QUANDO ---------------------------------------------------------
  ok("o bloco de próximos serviços aparece", /Próximos serviços/i.test(tela), tela.slice(0, 80).replace(/\n/g, " "));
  ok(
    "algum lembrete traz uma data no formato dd/mm/aaaa",
    /\d{2}\/\d{2}\/\d{4}/.test(tela),
    tela.replace(/\n/g, " | ").slice(0, 200),
  );
  ok("a origem da regra é citada", /segundo o manual/i.test(tela));
  ok(
    "o item por km diz quantos km faltam",
    /em [\d.]+ km/i.test(tela),
    tela.replace(/\n/g, " | ").slice(0, 200),
  );

  // ---- a sugestão de juntar numa ida só -----------------------------------
  ok("sugere levar tudo numa visita só", /uma visita só/i.test(tela), tela.replace(/\n/g, " | ").slice(0, 200));

  // ---- e CABE na tela -----------------------------------------------------
  //
  // scrollWidth > clientWidth é a definição de "tem texto que não coube". O
  // innerText mentiria aqui: ele devolve a string inteira mesmo cortada.
  const cortados = await b.pg.evaluate(() => {
    const nomes = ["Troca de óleo", "Fluido de freio", "Pneus (rodízio/troca)"];
    const fora = [];
    for (const el of Array.from(document.querySelectorAll("main *"))) {
      const t = (el.textContent ?? "").trim();
      if (!nomes.includes(t)) continue;
      if (el.children.length) continue;
      if (el.scrollWidth > el.clientWidth + 1) fora.push(`${t} (${el.scrollWidth} > ${el.clientWidth})`);
    }
    return fora;
  });
  ok("nenhum nome de serviço é cortado em 360px", cortados.length === 0, cortados.join("; "));

  const achouPneus = await b.pg.locator("main", { hasText: "Pneus (rodízio/troca)" }).count();
  ok("o nome comprido (Pneus) está inteiro na tela", achouPneus > 0);

  ok("nenhum erro de página no Calendário", b.erros.length === 0, b.erros[0] ?? "");
  await b.fechar();

  // ---- o susto do usado recém-cadastrado ----------------------------------
  //
  // Defeito real, com foto do dono (30/08): um carro com 98.000 km e sem
  // histórico abria "Próximas revisões" com CINCO itens em vermelho — "vencida
  // há 88.000 km", "há 78.000 km", "há 58.000 km". Ninguém estava atrasado: a
  // conta somava o intervalo a um "último serviço" que valia zero por não
  // existir. Para quem acabou de comprar um usado, é um susto inventado por
  // aritmética, e é o primeiro contato dela com o app.
  const u = await abrirApp(nav, {
    sessao: garagem({
      startedAt: "2026-01-01",
      quiz: { ultimoDia: dia(0), sequencia: 3, recorde: 3, perdaoEm: null, respostas: 3, acertos: 2 },
      vehicles: [{
        id: "v1", type: "car", make: "Volkswagen", model: "Golf", year: 2024,
        odometerKm: 98000, kmUpdatedAt: new Date().toISOString(), purchaseDate: dia(-10),
      }],
      services: [],
    }),
  });
  await u.pg.setViewportSize(ANDROID_ESTREITO);
  await u.pg.getByRole("button", { name: /^Carros$/i }).first().click();
  await u.pg.waitForTimeout(1200);
  await u.pg.locator('main [role="button"]').first().click();
  await u.pg.waitForTimeout(1800);
  const irRevisoes = u.pg.locator("main button, main a").filter({ hasText: /Próximas revisões/i }).first();
  if (await irRevisoes.count()) { await irRevisoes.click(); await u.pg.waitForTimeout(3000); }
  const rev = await u.tela();

  ok(
    "usado sem histórico NÃO abre com revisões vencidas",
    !/vencida h[áa]/i.test(rev),
    (rev.match(/vencida h[áa][^\n]*/i) ?? [""])[0],
  );
  ok("ele diz que a previsão é a confirmar", /A confirmar/i.test(rev), rev.replace(/\n/g, " | ").slice(0, 160));
  ok("e avisa que o km é estimado", /estimado/i.test(rev));

  // ---- o convite a cadastrar a última revisão -----------------------------
  //
  // O banner é a saída do estado estimado: sem nenhum serviço registrado, ele
  // convida a cadastrar a última revisão (aproximada serve). O X dispensa por
  // veículo e a dispensa SOBREVIVE à recarga — um X que volta ensina a pessoa
  // a ignorar banner, que é pior do que não ter banner.
  ok("o convite a cadastrar a última revisão aparece", /última revisão/i.test(rev), rev.replace(/\n/g, " | ").slice(0, 160));
  const cta = u.pg.locator("main button").filter({ hasText: /Cadastrar última revisão/i }).first();
  ok("o convite tem o botão de cadastrar", (await cta.count()) > 0);

  const x = u.pg.locator('main [aria-label="dispensar"]').first();
  ok("o convite tem o X de dispensar", (await x.count()) > 0);
  if (await x.count()) {
    await x.click();
    await u.pg.waitForTimeout(600);
    ok("o X fecha o convite", !/última revisão\?/i.test(await u.tela()));
    await u.recarregar();
    await u.pg.getByRole("button", { name: /^Carros$/i }).first().click();
    await u.pg.waitForTimeout(1000);
    await u.pg.locator('main [role="button"]').first().click();
    await u.pg.waitForTimeout(1500);
    const rev2 = u.pg.locator("main button, main a").filter({ hasText: /Próximas revisões/i }).first();
    if (await rev2.count()) { await rev2.click(); await u.pg.waitForTimeout(2500); }
    ok("a dispensa sobrevive à recarga", !/última revisão\?/i.test(await u.tela()));
  }

  // O nome longo do carro recém-comprado também cabe: "menos de 1 mês" era a
  // string que estourava o cartão no Android do dono.
  await u.pg.getByRole("button", { name: /^Carros$/i }).first().click();
  await u.pg.waitForTimeout(1000);
  await u.pg.locator('main [role="button"]').first().click();
  await u.pg.waitForTimeout(2000);
  const estouro = await u.pg.evaluate(() => {
    const fora = [];
    for (const el of Array.from(document.querySelectorAll("main *"))) {
      if (el.children.length) continue;
      const t = (el.textContent ?? "").trim();
      if (t.length < 4) continue;
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) fora.push(`${t} (${el.scrollWidth}>${el.clientWidth})`);
    }
    return fora;
  });
  ok("o cartão do carro comprado há dias não corta texto em 360px", estouro.length === 0, estouro.join("; "));
  ok("nenhum erro de página no carro novo", u.erros.length === 0, u.erros[0] ?? "");
  await u.fechar();
}
