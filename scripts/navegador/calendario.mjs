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
export const sobre = "os lembretes de serviço dizem a data e o km, e o nome não corta em 360px";

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
}
