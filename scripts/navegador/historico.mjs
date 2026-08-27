// O calendário do quiz e a pergunta que continua na tela depois de respondida.
//
// A asserção que mais importa aqui é a da sequência: responder um dia passado
// NÃO pode fazer o foguinho subir. Se subisse, bastaria uma tarde preenchendo
// o mês para o app exibir dias que nunca aconteceram.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "historico";
export const sobre = "o calendário das perguntas anteriores e a resposta remostrada";

export async function rodar({ nav, ok }) {
  const app = await abrirApp(nav, {
    // Entrou no app há 40 dias: sem isso o calendário desabilita os dias
    // anteriores ao cadastro (e faz certo — não se cobra ausência de quem nem
    // tinha o app), e não sobra dia em aberto para a conferência tocar.
    sessao: garagem({
      startedAt: dia(-40),
      quiz: { ultimoDia: dia(-1), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 },
    }),
  });
  const { pg } = app;

  const envios = [];
  pg.on("request", (r) => {
    if (r.url().includes("/api/quiz") && r.method() === "POST") envios.push(r.postData());
  });

  // ---- responde a de hoje ---------------------------------------------------
  await pg.getByRole("button", { name: /Quiz Diário/i }).first().click();
  await pg.waitForTimeout(1200);
  const perguntaDeHoje = await pg.locator("h2").first().innerText();
  await pg.locator("main >> css=button").nth(1).click();
  await pg.waitForTimeout(1500);
  ok("respondeu a de hoje", /Acertou|Não é essa/.test(await app.corpo()));
  ok("oferece o calendário logo depois de responder", (await pg.getByRole("button", { name: /Ver perguntas anteriores/i }).count()) > 0);

  // ---- reabre: a pergunta continua na tela ----------------------------------
  await app.recarregar();
  await pg.getByRole("button", { name: /Quiz Diário/i }).first().click();
  await pg.waitForTimeout(1500);
  const respondido = await app.tela();
  ok("a resposta sobreviveu à recarga", /já respondeu hoje/i.test(respondido));
  ok("REMOSTRA a pergunta do dia", respondido.includes(perguntaDeHoje.slice(0, 40)), perguntaDeHoje.slice(0, 50));
  ok("marca qual foi a resposta da pessoa", /sua resposta/i.test(respondido));
  ok("remostra a explicação", /Acertou|Não é essa/.test(respondido) && /Ver a aula completa/.test(respondido));
  ok("mantém a sequência à vista", /2 dias seguidos/.test(respondido));

  // ---- o calendário ---------------------------------------------------------
  await pg.getByRole("button", { name: /Ver perguntas anteriores/i }).first().click();
  await pg.waitForTimeout(1200);
  const cal = await app.tela();
  ok("o calendário abriu", /Perguntas anteriores/i.test(cal));
  ok("tem legenda das três cores", /acertou/.test(cal) && /errou/.test(cal) && /em aberto/.test(cal));

  // A janela do gratis: 7 dias, mas nunca antes de 23/08/2026, que e o
  // primeiro dia do quiz. O numero esperado depende do dia em que a suite
  // roda, entao ele e CALCULADO, nao fixado.
  const INICIO_DO_QUIZ = "2026-08-23";
  const diasDesdeInicio = Math.round((Date.parse(dia(0)) - Date.parse(INICIO_DO_QUIZ)) / 86400000) + 1;
  const esperadoGratis = Math.min(7, diasDesdeInicio);
  const naGrade = await pg.getByRole("button", { name: /de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro):/i }).count();
  ok(`a grade do grátis tem ${esperadoGratis} dias`, naGrade === esperadoGratis, `n=${naGrade}`);
  const temCerca = diasDesdeInicio > 7;
  const banner = await pg.getByRole("button", { name: /Premium/i }).count();
  ok(temCerca ? "o convite Premium aparece (há arquivo atrás da cerca)" : "sem arquivo fechado, sem convite Premium",
    temCerca ? banner > 0 : banner === 0, `banners=${banner}`);
  ok("os dias vêm agrupados por mês, com o mês escrito", /JANEIRO|FEVEREIRO|MARÇO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO/i.test(cal));
  const marcado = await pg.getByRole("button", { name: /: (acertou|errou)$/i }).count();
  ok("o dia de hoje aparece marcado", marcado === 1, `n=${marcado}`);

  // ---- responder um dia que passou ------------------------------------------
  const emAberto = pg.getByRole("button", { name: /: em aberto$/i });
  const rotulo = await emAberto.last().getAttribute("aria-label");
  await emAberto.last().click();
  await pg.waitForTimeout(1000);
  const aberto = await app.tela();
  ok("abriu o dia em branco", /Você não respondeu neste dia/i.test(aberto), rotulo ?? "");
  ok("avisa da sequência ANTES de responder", /não muda a sua sequência/i.test(aberto));

  const antes = envios.length;
  await pg.locator("main >> css=button").last().click();
  await pg.waitForTimeout(1500);
  const passado = await app.tela();
  ok("mostrou a explicação do dia passado", /Acertou|Não é essa/.test(passado) && /Ver a aula completa/.test(passado));
  ok("NÃO manda dia antigo para a estatística do dia", envios.length === antes, `envios=${envios.length - antes}`);

  // A prova do dia.
  await pg.getByRole("button", { name: /^Início$/i }).first().click();
  await pg.waitForTimeout(1500);
  const faixa = await pg.getByRole("button", { name: /Quiz Diário/i }).first().innerText();
  ok("responder o passado NÃO mexeu na sequência", /🔥/.test(faixa) && /\b2\b/.test(faixa) && !/\b3\b/.test(faixa), faixa.replace(/\n/g, " | "));

  // ---- e persiste -----------------------------------------------------------
  await app.recarregar();
  await pg.getByRole("button", { name: /Quiz Diário/i }).first().click();
  await pg.waitForTimeout(1200);
  await pg.getByRole("button", { name: /Ver perguntas anteriores/i }).first().click();
  await pg.waitForTimeout(1200);
  const marcados = await pg.getByRole("button", { name: /: (acertou|errou)$/i }).count();
  ok("a resposta do dia passado sobreviveu à recarga", marcados === 2, `marcados=${marcados}`);

  ok("nenhum erro de página", app.erros.length === 0, app.erros[0] ?? "");
  await app.fechar();

  // ---- Premium: o arquivo inteiro -------------------------------------------
  {
    const b = await abrirApp(nav, {
      sessao: garagem({
        premium: true,
        quiz: {
          ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1,
          historico: [{ dia: dia(0), perguntaId: "tracao-traseira", escolha: 1, acertou: false }],
        },
      }),
      chaves: { "mq-primeiro-quiz-nao": "1" },
    });
    await b.pg.getByRole("button", { name: /Quiz Diário/i }).first().click();
    await b.pg.waitForTimeout(1200);
    await b.pg.getByRole("button", { name: /Ver perguntas anteriores/i }).first().click();
    await b.pg.waitForTimeout(1200);
    const grade = await b.pg.getByRole("button", { name: /de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro):/i }).count();
    ok(`Premium vê todos os ${diasDesdeInicio} dias desde 23/08`, grade === diasDesdeInicio, `n=${grade}`);
    ok("Premium não vê convite de assinatura", (await b.pg.getByRole("button", { name: /Premium/i }).count()) === 0);
    await b.fechar();
  }
}
