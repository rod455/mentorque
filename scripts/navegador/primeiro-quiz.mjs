// Os dois gatilhos do primeiro quiz, e os casos em que ele NÃO deve aparecer.
//
// A folha aparece depois do primeiro carro cadastrado, ou no dia seguinte para
// quem não cadastrou nenhum. Tudo o mais é silêncio: quem já respondeu, quem
// fechou sem responder, e qualquer tela que não seja o Início ou o hub do carro.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "primeiro-quiz";
export const sobre = "quando a folha do primeiro quiz aparece e quando não";

const TROCA_OLEO = /De quanto em quanto tempo se troca o óleo/i;

export async function rodar({ nav, ok }) {
  // `texto` é o retrato da tela na abertura; `corpo()` continua sendo a
  // leitura ao vivo. Confundir os dois foi o que quebrou a primeira portagem.
  const cenario = async (sessao, chaves = {}) => {
    const app = await abrirApp(nav, { sessao, chaves });
    const texto = await app.corpo();
    return { ...app, texto, apareceu: TROCA_OLEO.test(texto) };
  };

  // 1. Sem carro, primeiro dia: NÃO aparece.
  {
    const c = await cenario(garagem({ semCarro: true }));
    ok("sem carro no primeiro dia, não aparece", !c.apareceu);
    await c.fechar();
  }

  // 2. Sem carro, dia seguinte: APARECE.
  {
    const c = await cenario(garagem({ semCarro: true, startedAt: dia(-1) }));
    ok("sem carro no dia seguinte, aparece", c.apareceu);
    ok("usa o convite de quem não tem carro", /Toda manhã tem uma pergunta nova/i.test(c.texto));
    await c.fechar();
  }

  // 3. Com carro, mesmo no primeiro dia: APARECE, com o outro convite.
  {
    const c = await cenario(garagem());
    ok("com carro, aparece no mesmo dia", c.apareceu);
    ok("usa o convite de quem acabou de cadastrar", /Carro na garagem/i.test(c.texto));
    if (c.apareceu) {
      await c.pg.locator("button").filter({ hasText: /manual do seu carro mandar/i }).first().click();
      await c.pg.waitForTimeout(1200);
      const depois = await c.corpo();
      // O trecho vem da explicação da pergunta de onboarding (id
      // `oleo-intervalo`). Se o texto dela mudar, este pedaço muda junto: é o
      // preço de conferir que a EXPLICAÇÃO apareceu, e não só um "Acertou".
      ok("acertou e explicou", /Acertou/i.test(depois) && /afeta o seu bolso/i.test(depois));
      ok("explica o combinado uma vez só", /uma por dia, um minuto/i.test(depois));
      // Desde 08/10/2026 (achado do QA de 07/10, decisão do dono): a resposta
      // do onboarding é estudo, não presença. Ela NÃO carimba o dia nem abre
      // a sequência, para a pergunta do dia 1 continuar disponível.
      const s = await c.sessaoGravada();
      ok("a sequência NÃO abre no onboarding", !s?.quiz?.ultimoDia && !(s?.quiz?.sequencia > 0), JSON.stringify(s?.quiz ?? null));
      ok("a resposta fica guardada como onboarding, fora do histórico por dia",
        s?.quiz?.onboarding?.perguntaId === "oleo-intervalo" && (s?.quiz?.historico ?? []).length === 0,
        JSON.stringify(s?.quiz ?? null));
      ok("conta nos totais", s?.quiz?.respostas === 1, `resp=${s?.quiz?.respostas}`);

      // O botão principal leva à pergunta DE HOJE, e ela tem de ser oferecida
      // (era aqui que a tela dizia "você já respondeu hoje").
      await c.pg.locator("[data-primeiro-quiz-hoje]").first().click();
      await c.pg.waitForTimeout(1500);
      const telaDoQuiz = await c.corpo();
      ok("o botão abre a pergunta do dia, e ela é oferecida", !/já respondeu hoje/i.test(telaDoQuiz) && !TROCA_OLEO.test(telaDoQuiz), telaDoQuiz.slice(0, 120).replace(/\n/g, " | "));
      await c.pg.locator("main >> css=button").nth(1).click();
      await c.pg.waitForTimeout(1800);
      const respondida = await c.corpo();
      ok("responder a de hoje abre a sequência em 1", /Sua sequência começou hoje|1 dia seguido/i.test(respondida), (respondida.match(/\d+ dias? seguidos?|Sua sequência começou hoje/i) ?? ["?"])[0]);

      await c.pg.getByRole("button", { name: /^Início$/i }).first().click();
      await c.pg.waitForTimeout(800);
      await c.recarregar();
      ok("não volta depois de respondido", !TROCA_OLEO.test(await c.corpo()));
    }
    await c.fechar();
  }

  // 4. Já respondeu algum dia: NÃO aparece.
  {
    const c = await cenario(
      garagem({ quiz: { ultimoDia: dia(-3), sequencia: 3, recorde: 3, perdaoEm: null, respostas: 3, acertos: 2 } })
    );
    ok("quem já respondeu antes não vê o primeiro quiz", !c.apareceu);
    await c.fechar();
  }

  // 5. Dispensou antes: NÃO volta.
  {
    const c = await cenario(garagem(), { "mq-primeiro-quiz-nao": "1" });
    ok("quem fechou sem responder não vê de novo", !c.apareceu);
    await c.fechar();
  }

  // 6. Não interrompe fora do Início e do hub do carro.
  {
    const c = await cenario(garagem());
    ok("aparece no Início", c.apareceu);
    if (c.apareceu) {
      await c.pg.locator("div[role=dialog] button").first().click();
      await c.pg.waitForTimeout(500);
      await c.pg.getByRole("button", { name: /^Estudos$/i }).first().click();
      await c.pg.waitForTimeout(1500);
      ok("não reabre em Estudos", !TROCA_OLEO.test(await c.corpo()));
    }
    await c.fechar();
  }

  // 7. O onboarding NÃO tem mais o quiz.
  {
    const app = await abrirApp(nav);
    let viuQuiz = false;
    for (let i = 0; i < 8; i++) {
      if (TROCA_OLEO.test(await app.corpo())) { viuQuiz = true; break; }
      const btn = app.pg.getByRole("button", { name: /^(Continuar|Próximo|Avançar|Começar)/i }).first();
      if (!(await btn.count())) break;
      await btn.click();
      await app.pg.waitForTimeout(1300);
    }
    ok("o onboarding não tem mais a página do quiz", !viuQuiz);
    await app.fechar();
  }
}
