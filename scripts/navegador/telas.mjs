// Abre todas as telas principais e confere que cada uma DESENHA.
//
// É a rede de segurança que faltava para mexer na organização do código. As
// outras suítes conferem comportamento em profundidade, mas só de umas poucas
// telas; um arquivo separado no lugar errado, um import esquecido, e metade do
// app quebraria com todas elas verdes.
//
// Aqui a pergunta é rasa e ampla: a tela aparece, e o console fica limpo? Erro
// de renderização em React não derruba o app inteiro — a tela some e o resto
// continua, então "não deu erro visível" não quer dizer nada. Por isso cada
// caso confere um TEXTO que só existe naquela tela, e o `pageerror` junto.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "telas";
export const sobre = "todas as telas principais desenham, e o console fica limpo";

// Sessão de quem já usa o app: com carro, com histórico e com o quiz do dia
// feito, para nenhuma folha automática entrar na frente do que está sendo
// conferido.
const SESSAO = (extra = {}) =>
  garagem({
    startedAt: "2026-01-01",
    // Os campos são os de ServiceRecord em lib/app/types.ts: `km` e `total`,
    // não "odometerKm"/"cost", e `parts` é obrigatório. Errei isto na primeira
    // escrita e o app inteiro caiu na tela de erro — vale como aviso: um
    // registro de serviço malformado derruba o app todo, não só o card dele.
    services: [
      { id: "s1", vehicleId: "v1", type: "oil", date: dia(-30), km: 97000, total: 320, parts: [], notes: "" },
    ],
    quiz: { ultimoDia: dia(0), sequencia: 3, recorde: 3, perdaoEm: null, respostas: 3, acertos: 2 },
    ...extra,
  });

export async function rodar({ nav, ok }) {
  const app = await abrirApp(nav, {
    sessao: SESSAO(),
    chaves: { "mq-primeiro-quiz-nao": "1" },
  });
  const { pg } = app;

  const aba = async (rotulo) => {
    await pg.getByRole("button", { name: rotulo }).first().click();
    await pg.waitForTimeout(1500);
    return app.tela();
  };
  // Voltar só se houver para onde: as raízes de aba não têm botão de voltar, e
  // esperar por um que não existe trava a conferência em vez de reprovar.
  const voltar = async () => {
    const b = pg.getByRole("button", { name: /voltar/i }).first();
    if (await b.count()) {
      await b.click();
      await pg.waitForTimeout(1000);
    }
  };

  // ---- as cinco abas -------------------------------------------------------
  ok("Início desenha", /O que vamos cuidar|Diagnosticar um problema/i.test(await app.tela()));
  ok("o chip do quiz está na barra de cima", (await pg.getByRole("button", { name: /Quiz Diário/i }).count()) > 0);
  ok("Carros desenha", /Golfinho|Golf GTI/i.test(await aba(/^Carros$/i)));
  ok("Problemas desenha", (await aba(/^Problemas$/i)).length > 80);
  // O título nomeia o carro ativo ("Calendário do seu Golfinho"): com o
  // seletor na barra de cima, ele é a confirmação de qual carro a tela mostra.
  ok("Calendário desenha, com o carro ativo no título", /Calendário do seu Golfinho/.test(await aba(/^Calendário$/i)));

  const estudos = await aba(/^Estudos$/i);
  ok("Estudos desenha", estudos.length > 120, estudos.slice(0, 50).replace(/\n/g, " "));

  // ---- "para o seu carro" e o leitor de aula --------------------------------
  // A tela de Estudos lista TRILHAS e categorias, não aulas soltas. O caminho
  // até uma aula passa por "Para o seu <carro>", que de quebra exerce o
  // ItemDeAula compartilhado.
  await pg.getByRole("button", { name: /Para o seu/i }).first().click();
  await pg.waitForTimeout(1600);
  const paraVoce = await app.tela();
  ok("'Para o seu carro' desenha", paraVoce.length > 100, paraVoce.slice(0, 50).replace(/\n/g, " "));

  const aulas = pg.locator("main button").filter({ hasText: /Artigo|Vídeo|Checklist/i });
  if (await aulas.count()) {
    await aulas.first().click();
    await pg.waitForTimeout(2200);
    const aula = await app.tela();
    ok("o leitor de aula desenha", aula.length > 200, aula.slice(0, 60).replace(/\n/g, " "));
    await voltar();
  } else {
    ok("o leitor de aula desenha", false, "não achei aula em 'Para o seu carro'");
  }
  // ---- uma trilha ----------------------------------------------------------
  // Volta pela aba, e não por botões de voltar contados: a pilha muda conforme
  // a tela, e contar cliques é o jeito mais frágil possível de navegar.
  await aba(/^Estudos$/i);
  await pg.getByRole("button", { name: /Começar/i }).first().click();
  await pg.waitForTimeout(1600);
  const trilha = await app.tela();
  ok("a trilha desenha", trilha.length > 100, trilha.slice(0, 50).replace(/\n/g, " "));
  await voltar();

  // ---- o perfil ------------------------------------------------------------
  // O Perfil não é aba: chega-se por ele pelo ícone da barra de cima, que só
  // existe nas raízes. Nas telas profundas o AppHeader toma o lugar dela.
  await aba(/^Início$/i);
  const perfil = await aba(/^Perfil$/i);
  ok("Perfil desenha", /Idioma|Language|Conta|Sair/i.test(perfil), perfil.slice(0, 60).replace(/\n/g, " "));

  // ---- o "?" flutuante --------------------------------------------------------
  // Pedido do dono (09/09/2026): um botão fixo nas abas que leva direto ao
  // formulário de dúvida, com a tela já rolada até ele. Duas coisas que só o
  // navegador prova: o botão existe na aba e some no Perfil (onde cobriria o
  // botão de enviar), e o toque deixa o formulário DENTRO da área visível do
  // <main>, não só presente no DOM lá embaixo.
  {
    const semBotaoNoPerfil = (await pg.getByRole("button", { name: /Dúvidas ou sugestões/i }).count()) === 0;
    ok("o ? flutuante não aparece no Perfil", semBotaoNoPerfil);
    await aba(/^Início$/i);
    const botao = pg.getByRole("button", { name: /Dúvidas ou sugestões/i }).first();
    ok("o ? flutuante aparece na aba Início", (await botao.count()) === 1);
    await botao.click();
    await pg.waitForTimeout(2500);
    const visto = await pg.evaluate(() => {
      const main = document.querySelector("main");
      const alvo = document.getElementById("fale-com-a-gente");
      if (!main || !alvo) return { temPerfil: false, dentro: false, detalhe: "sem main ou sem bloco" };
      const m = main.getBoundingClientRect();
      const a = alvo.getBoundingClientRect();
      const dentro = a.top >= m.top - 4 && a.top < m.bottom - 120;
      // A suíte roda DESLOGADA: o Perfil sem sessão mostra o cartão de login,
      // não "Conta" nem "Sair". O que existe nos dois estados é Idioma.
      return { temPerfil: /Idioma|Language/i.test(main.textContent ?? ""), dentro, detalhe: `bloco em ${Math.round(a.top)}px, main de ${Math.round(m.top)} a ${Math.round(m.bottom)}` };
    });
    ok("o toque no ? abre o Perfil", visto.temPerfil);
    ok("e a tela rola até o formulário de dúvida", visto.dentro, visto.detalhe);
  }

  ok("nenhum erro de página em nenhuma delas", app.erros.length === 0, app.erros.slice(0, 2).join(" | "));
  await app.fechar();

  // ---- o paywall -----------------------------------------------------------
  // Saiu de Profile.tsx para Subscribe.tsx. Chega-se a ele por uma aula
  // trancada, que é o caminho real de quem não assina.
  {
    const b = await abrirApp(nav, { sessao: SESSAO(), chaves: { "mq-primeiro-quiz-nao": "1" } });
    await b.pg.getByRole("button", { name: /^Estudos$/i }).first().click();
    await b.pg.waitForTimeout(1500);
    const trancada = b.pg.locator("main button").filter({ hasText: /Premium/i });
    if (await trancada.count()) {
      await trancada.first().click();
      await b.pg.waitForTimeout(2000);
      const pay = await b.tela();
      ok("o paywall desenha", /Premium/i.test(pay) && pay.length > 200, pay.slice(0, 60).replace(/\n/g, " "));
      ok("o paywall traz o comparativo de planos", /Grátis|Free/i.test(pay));
    } else {
      ok("o paywall desenha", false, "não achei aula trancada para chegar nele");
    }
    ok("nenhum erro de página no paywall", b.erros.length === 0, b.erros[0] ?? "");
    await b.fechar();
  }

  // ---- a Biela -------------------------------------------------------------
  // Saiu de Learn.tsx para Biela.tsx. Com assinatura abre o chat; sem ela, o
  // card leva ao paywall — os dois caminhos importam.
  {
    const b = await abrirApp(nav, {
      sessao: SESSAO({ premium: true }),
      chaves: { "mq-primeiro-quiz-nao": "1" },
    });
    await b.pg.getByRole("button", { name: /^Estudos$/i }).first().click();
    await b.pg.waitForTimeout(1500);
    const card = b.pg.locator("main button").filter({ hasText: /Biela/i });
    if (await card.count()) {
      await card.first().click();
      await b.pg.waitForTimeout(1800);
      const chat = await b.tela();
      ok("a conversa com a Biela desenha", chat.length > 100, chat.slice(0, 60).replace(/\n/g, " "));
      ok("tem campo para escrever", (await b.pg.locator("main textarea, main input[type=text]").count()) > 0);
    } else {
      ok("a conversa com a Biela desenha", false, "não achei o card da Biela em Estudos");
    }
    ok("nenhum erro de página na Biela", b.erros.length === 0, b.erros[0] ?? "");
    await b.fechar();
  }
}
