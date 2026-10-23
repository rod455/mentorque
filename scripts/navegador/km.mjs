// O lembrete mensal de km: quando ele deve e quando NÃO deve aparecer.
//
// O primeiro caso é um defeito real que chegou até o dono: carro recém
// cadastrado abria a folha pedindo o km no mesmo dia, porque a falta de
// carimbo era lida como 1970 e "1970 foi há mais de 30 dias".
import { garagem, CARRO, abrirApp, dia } from "./base.mjs";

export const nome = "km";
export const sobre = "o lembrete mensal de quilometragem e o km pedido na tela de saúde";

const agoraMenos = (dias) => new Date(Date.now() - dias * 86400000).toISOString();

export async function rodar({ nav, ok }) {
  // Quiz já respondido em todos os cenários: tira a folha do primeiro quiz do
  // caminho, senão ela abre por cima e as asserções medem o diálogo errado.
  const comCarro = (extra) =>
    garagem({
      vehicles: [{ ...CARRO, kmUpdatedAt: undefined, ...extra }],
      quiz: { ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 },
    });

  // "Pediu" é a PENDÊNCIA de km parado na linha 6 do Início (desde
  // 06/10/2026; até então era uma folha que abria por cima da tela). A folha
  // continua existindo, mas só abre no toque da linha, e o que só ela tem é
  // o botão "Salvar km". (Até 12/09/2026 o detector era `/Confirme|km
  // atual|Salvar km/` e reprovou três casos sem folha nenhuma: detector que
  // casa com texto de qualquer card não mede a folha, mede o vocabulário.)
  const abrir = async (sessao) => {
    const app = await abrirApp(nav, { sessao });
    const corpo = await app.corpo();
    const s = await app.sessaoGravada();
    const pediu = (await app.pg.locator('[data-pendencia="km-parado"]').count()) === 1;
    return { ...app, corpo, carimbo: s?.vehicles?.[0]?.kmUpdatedAt ?? null, pediu, folhaAberta: /Salvar km/i.test(corpo) };
  };

  // 1. Carro RECÉM-CADASTRADO (sem carimbo): não pode pedir o km.
  {
    const c = await abrir(comCarro({}));
    ok("carro sem carimbo NÃO pede o km", !c.pediu);
    ok("e ganha o carimbo de agora", !!c.carimbo && Date.now() - Date.parse(c.carimbo) < 60000, String(c.carimbo));
    await c.fechar();
  }

  // 2. Km informado há 10 dias: não pede.
  {
    const c = await abrir(comCarro({ kmUpdatedAt: agoraMenos(10) }));
    ok("km de 10 dias atrás não pede", !c.pediu);
    await c.fechar();
  }

  // 3. Km informado há 40 dias: PEDE.
  {
    const c = await abrir(comCarro({ kmUpdatedAt: agoraMenos(40) }));
    ok("km de 40 dias atrás pede, como pendência na linha", c.pediu);
    ok("e NÃO abre a folha por cima da tela sozinho", !c.folhaAberta);
    if (c.pediu) {
      await c.pg.locator('[data-pendencia="km-parado"]').first().click();
      await c.pg.waitForTimeout(500);
      ok("tocar na pendência abre a folha", /Salvar km/i.test(await c.pg.locator("body").innerText()));
      // Confirma o MESMO número: tem de carimbar mesmo assim, senão quem não
      // rodou nada no mês é perguntado de novo todo dia.
      await c.pg.locator("input").first().fill("98000");
      await c.pg.getByRole("button", { name: /Salvar km/i }).first().click();
      await c.pg.waitForTimeout(1200);
      const s = await c.sessaoGravada();
      const carimbo = s?.vehicles?.[0]?.kmUpdatedAt ?? null;
      ok("confirmar o MESMO km carimba a data de hoje", !!carimbo && Date.now() - Date.parse(carimbo) < 60000, String(carimbo));
      ok("a folha fecha depois de salvar", !/Salvar km/i.test(await c.pg.locator("body").innerText()));
      ok("e a pendência some da linha", (await c.pg.locator('[data-pendencia="km-parado"]').count()) === 0);
    }
    await c.fechar();
  }

  // 4. Carro sem km nenhum: não pede nada e não carimba.
  {
    const c = await abrir(comCarro({ odometerKm: undefined }));
    ok("carro sem odômetro não pede nem carimba", !c.pediu && !c.carimbo);
    await c.fechar();
  }

  // 5. A tela de saúde pede o km onde a falta dele aparece (22/10/2026).
  //
  // Sem odômetro, o risco usa "idade vezes 12.000" e a tela diz isso. A
  // ressalva passou a oferecer o campo ali mesmo, e o evento `informou_km` é a
  // única leitura de se alguém responde. Junto, a folha do quiz de saúde passou
  // a contar quem abre (`abriu_quiz_saude`): sem isso, desistir no meio não
  // deixa rastro, porque a folha não salva incompleto.
  {
    const eventos = [];
    const c = await abrirApp(nav, { sessao: comCarro({ odometerKm: undefined }), rota: "/app?ir=health" });
    c.pg.on("request", (r) => {
      if (!r.url().includes("/api/funil")) return;
      try { eventos.push(JSON.parse(r.postData() ?? "{}")); } catch { /* corpo que não é JSON */ }
    });
    const botao = c.pg.locator("[data-informar-km]");
    ok("sem odômetro, a saúde oferece informar o km", (await botao.count()) === 1);
    if ((await botao.count()) === 1) {
      await botao.click();
      await c.pg.getByPlaceholder(/Km do painel/i).fill("abc");
      await c.pg.getByRole("button", { name: /^Salvar$/ }).click();
      await c.pg.waitForTimeout(300);
      ok("km sem número é recusado com aviso", /Digite o km em números/i.test(await c.corpo()));
      await c.pg.getByPlaceholder(/Km do painel/i).fill("87000");
      await c.pg.getByRole("button", { name: /^Salvar$/ }).click();
      await c.pg.waitForTimeout(1200);
      const s = await c.sessaoGravada();
      ok("salvar grava o odômetro no carro", s?.vehicles?.[0]?.odometerKm === 87000, String(s?.vehicles?.[0]?.odometerKm));
      ok("e a ressalva do km estimado some", !/estimada pela idade/i.test(await c.corpo()) && (await botao.count()) === 0);
      ok("e o funil recebe informou_km da saúde", eventos.some((e) => e.evento === "informou_km" && e.origem === "saude"), JSON.stringify(eventos.map((e) => e.evento)));
    }
    await c.pg.getByRole("button", { name: /Fazer o Quiz de Saúde/i }).first().click();
    await c.pg.waitForTimeout(1500);
    const aberturas = eventos.filter((e) => e.evento === "abriu_quiz_saude");
    ok("abrir a folha do quiz de saúde conta a abertura, uma vez", aberturas.length === 1 && aberturas[0].origem === "primeira", JSON.stringify(eventos.map((e) => e.evento)));
    ok("e abrir não conta como completar", !eventos.some((e) => e.evento === "completou_quiz_saude"));
    ok("nenhum erro de página na saúde", c.erros.length === 0, c.erros.join(" | "));
    await c.fechar();
  }
}
