// O onboarding, agora que ele é UM só.
//
// POR QUE ESTA SUÍTE NASCE EM 23/10/2026. O teste A/B `onboarding-curto` rodou
// seis semanas e a versão de cinco páginas ganhou no degrau da conta (214 de
// 891 contra 179 de 960, com um segundo corte concordando). Promover a
// vencedora significa apagar a variante do código, e apagar variante é mexer
// na ARITMÉTICA das páginas: `total`, `paginaSocial` e o índice da última
// página eram todos calculados com um `curto ? ... : ...` dentro.
//
// E nenhuma suíte abria o onboarding, porque a `garagem()` da base nasce com
// `onboarded: true` para todas as outras. Ou seja: um erro de um a mais ou um a
// menos aqui atingiria TODA pessoa nova e não apareceria em conferência
// nenhuma. Esta suíte abre o app sem sessão, que é o caminho de quem chega.
//
// O QUE ELA NÃO ALCANÇA, e fica dito: ela anda na web, e a última página do
// Android é outra (a do carro, desde 11/09). O que ela prova é a aritmética
// das páginas de apresentação e a presença da prova social, que é o que a
// promoção de hoje mexeu.
import { abrirApp } from "./base.mjs";

export const nome = "apresentacao";
export const sobre = "o onboarding tem cinco páginas, com a prova social dentro";

// Sem `sessao`: nada é gravado, então o app roda o onboarding de verdade.
const SEM_SESSAO = { chaves: { "mq-primeiro-quiz-nao": "1" } };

async function avancar(pg) {
  const b = pg.getByRole("button", { name: /Começar|Continuar/i }).first();
  if (!(await b.count())) return false;
  await b.click();
  await pg.waitForTimeout(900);
  return true;
}

export async function rodar({ nav, ok }) {
  // ---- 1. as cinco páginas, e a prova social entre elas -------------------
  {
    const app = await abrirApp(nav, SEM_SESSAO);
    const { pg } = app;

    const primeira = await app.corpo();
    ok(
      "quem chega sem sessão cai no onboarding",
      /Começar|Continuar/i.test(primeira),
      primeira.replace(/\n/g, " | ").slice(0, 140),
    );

    // Anda até o fim, guardando o texto de cada página.
    const paginas = [primeira];
    for (let i = 0; i < 8; i++) {
      if (!(await avancar(pg))) break;
      const t = await app.corpo();
      paginas.push(t);
      // A última página de apresentação é a que vende ou a que pede o carro.
      if (/7 dias|Cadastre o seu primeiro carro|Agora não/i.test(t)) break;
    }

    ok(
      "a apresentação tem cinco páginas, não três",
      paginas.length === 5,
      `andei por ${paginas.length}: ${paginas.map((p) => p.replace(/\n/g, " ").slice(0, 28)).join(" // ")}`,
    );

    const comProvaSocial = paginas.filter((p) => /Amado por motoristas|Avaliações e histórias reais/i.test(p));
    ok(
      "a prova social continua dentro do onboarding",
      comProvaSocial.length === 1,
      `páginas com prova social: ${comProvaSocial.length}`,
    );

    // A prova social é a QUARTA página: três cards, ela, e a última. Se a
    // aritmética escorregar, ela aparece no lugar errado e este degrau pega.
    ok(
      "e ela é a quarta página",
      /Amado por motoristas|Avaliações e histórias reais/i.test(paginas[3] ?? ""),
      (paginas[3] ?? "(não existe)").replace(/\n/g, " | ").slice(0, 120),
    );

    // Os números da prova social são os medidos, não os inventados que saíram
    // em 04/10 por decisão do dono. Prova social que volta a inventar é o erro
    // mais caro desta tela.
    const social = paginas[3] ?? "";
    ok("a prova social mostra a nota real", /5,0/.test(social), social.replace(/\n/g, " | ").slice(0, 160));
    ok("e não voltou a inventar número", !/4,8|10\.000|5\.000/.test(social));

    ok("nenhum erro de página no onboarding", app.erros.length === 0, app.erros[0] ?? "");
    await app.fechar();
  }

  // ---- 2. não existe mais sorteio: dois aparelhos veem a MESMA coisa ------
  //
  // O id `onboarding-curto` saiu de `EXPERIMENTOS`, então `variante()` não
  // sorteia mais nada. Dois aparelhos diferentes (contextos diferentes, anon_id
  // diferente) têm de ver a mesma primeira página. Se alguém reativar o teste
  // sem registrar no caderno, este degrau é o que grita.
  {
    const primeiras = [];
    for (let i = 0; i < 2; i++) {
      const app = await abrirApp(nav, SEM_SESSAO);
      primeiras.push((await app.corpo()).replace(/\s+/g, " ").trim().slice(0, 120));
      await app.fechar();
    }
    ok(
      "dois aparelhos veem a mesma apresentação",
      primeiras[0] === primeiras[1],
      `A: ${primeiras[0]}\n   B: ${primeiras[1]}`,
    );
  }
}
