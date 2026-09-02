// O link de venda: /app?assinar=anual|mensal leva à compra depois do login.
//
// O que dá para conferir SEM uma sessão de verdade (as suítes rodam
// deslogadas) é a metade da frente, que é onde o link pode prender alguém:
// cair na tela de entrar, limpar o parâmetro da URL para recarga não reabrir
// compra, soltar quem desiste do login, e ignorar valor inválido.
//
// E a TRAVESSIA, que é o que faltava aqui e por isso passou.
//
// Em 02/09/2026 o dono clicou em mentorque.com.br/ALE100, entrou com o Google
// e caiu na tela inicial: sem pagamento e sem cupom. Esta suíte estava verde,
// porque conferia só a ida. O plano e o cupom viviam na memória da página, e
// login social na web recarrega a página inteira (o navegador sai para o
// provedor e volta), então a memória morria no meio do caminho.
//
// A recarga aqui é a imitação honesta desse ida-e-volta. Ela não faz login de
// verdade, mas exercita exatamente o que quebrou: sobreviver ao fim da página.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "venda";
export const sobre = "o link /app?assinar leva ao login e não prende ninguém";

const SESSAO = () =>
  garagem({
    startedAt: "2026-08-23",
    quiz: { ultimoDia: dia(0), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 },
  });

export async function rodar({ nav, ok }) {
  // ---- o caminho feliz deslogado: direto para a tela de entrar -------------
  {
    const app = await abrirApp(nav, {
      sessao: SESSAO(),
      chaves: { "mq-primeiro-quiz-nao": "1" },
      rota: "/app?assinar=anual",
    });
    const { pg } = app;
    await pg.waitForTimeout(800);
    const tela = await app.tela();
    ok("deslogado, o link cai na tela de entrar", /Entrar|Salve sua garagem/i.test(tela), tela.slice(0, 60).replace(/\n/g, " "));
    ok("o parâmetro sai da URL na hora", !pg.url().includes("assinar"), pg.url());

    // Quem desiste do login volta para o app e NÃO é jogado de novo no Entrar.
    // (O rótulo da seta é "back": a tela de entrar tem herói no lugar do
    // cabeçalho e usa o botão flutuante próprio.)
    const voltar = pg.getByRole("button", { name: /^back$|voltar/i }).first();
    ok("a tela de entrar tem por onde desistir", (await voltar.count()) > 0);
    await voltar.click();
    await pg.waitForTimeout(1200);
    const depois = await app.tela();
    ok("desistir do login solta a pessoa no app", /O que vamos cuidar|Diagnosticar/i.test(depois), depois.slice(0, 60).replace(/\n/g, " "));

    // E recarregar não reabre a compra, porque o parâmetro já não existe.
    await app.recarregar();
    await pg.waitForTimeout(500);
    ok("recarregar não reabre o pedido de login", !/Salve sua garagem/i.test(await app.tela()));

    ok("nenhum erro de página", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // ---- com cupom e UTM: some o que é da compra, fica o que é do funil ------
  {
    const app = await abrirApp(nav, {
      sessao: SESSAO(),
      chaves: { "mq-primeiro-quiz-nao": "1" },
      rota: "/app?assinar=anual&cupom=PREMIUM30&utm_source=zap",
    });
    await app.pg.waitForTimeout(800);
    ok("com cupom, também cai na tela de entrar", /Entrar|Salve sua garagem/i.test(await app.tela()));
    const url = app.pg.url();
    ok("assinar e cupom somem da URL, o UTM fica",
      !url.includes("assinar") && !url.includes("cupom") && url.includes("utm_source=zap"), url);
    ok("nenhum erro de página com cupom", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // ---- o atalho: /ALE100 é o link inteiro dobrado --------------------------
  // Os atalhos moram no next.config.mjs (ATALHOS). Este caso prova a corrente
  // completa: atalho → redirect com plano, cupom e rastreio → tela de entrar,
  // com o rastreio sobrevivendo na URL para o funil.
  {
    const app = await abrirApp(nav, {
      sessao: SESSAO(),
      chaves: { "mq-primeiro-quiz-nao": "1" },
      rota: "/ALE100",
    });
    await app.pg.waitForTimeout(800);
    ok("o atalho termina na tela de entrar", /Entrar|Salve sua garagem/i.test(await app.tela()));
    const url = app.pg.url();
    ok("o atalho deixa só o rastreio na URL",
      url.includes("utm_campaign=ale100") && !url.includes("assinar") && !url.includes("cupom"), url);
    ok("nenhum erro de página no atalho", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // ---- a travessia: a compra tem que sobreviver ao fim da página ----------
  //
  // O caso do relato, e o único que teria pegado o defeito. O atalho inteiro,
  // com cupom de verdade, e depois uma recarga: é o que o login social faz.
  {
    const app = await abrirApp(nav, {
      sessao: SESSAO(),
      chaves: { "mq-primeiro-quiz-nao": "1" },
      rota: "/ALE100",
    });
    const { pg } = app;
    await pg.waitForTimeout(800);

    const guardada = () =>
      pg.evaluate(() => {
        try { return JSON.parse(localStorage.getItem("mq-venda-pendente") ?? "null"); } catch { return null; }
      });

    const antes = await guardada();
    ok("a compra fica guardada no aparelho, não na memória da página", antes !== null);
    ok("com o plano do atalho", antes?.plano === "monthly", String(antes?.plano));
    ok("e com o cupom do atalho", antes?.cupom === "ALESSANDRO1MES", String(antes?.cupom));
    ok("indo direto ao pagamento, não ao paywall", antes?.direto === true, String(antes?.direto));

    await app.recarregar();
    const depois = await guardada();
    ok("a compra atravessa a recarga do login social", depois?.cupom === "ALESSANDRO1MES", String(depois?.cupom));
    ok("e o plano atravessa junto", depois?.plano === "monthly", String(depois?.plano));
    ok("a tela de entrar continua na frente", /Entrar|Salve sua garagem/i.test(await app.tela()));
    ok("nenhum erro de página na travessia", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // ---- valor inválido: o link vira uma abertura normal ---------------------
  {
    const app = await abrirApp(nav, {
      sessao: SESSAO(),
      chaves: { "mq-primeiro-quiz-nao": "1" },
      rota: "/app?assinar=nada",
    });
    await app.pg.waitForTimeout(500);
    ok("valor inválido abre o app normal", /O que vamos cuidar|Diagnosticar/i.test(await app.tela()));
    ok("nenhum erro de página com valor inválido", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }
}
