// O link de venda: /app?assinar=anual|mensal leva à compra depois do login.
//
// O que dá para conferir SEM uma sessão de verdade (as suítes rodam
// deslogadas) é a metade da frente, que é onde o link pode prender alguém:
// cair na tela de entrar, limpar o parâmetro da URL para recarga não reabrir
// compra, soltar quem desiste do login, e ignorar valor inválido. O salto
// final (logado → checkout do Stripe) reusa o mesmo caminho do plano
// pendente do onboarding, que já está em produção.
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
