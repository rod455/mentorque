// Quem está olhando quando o app quebra?
//
// POR QUE ISTO EXISTE. Em 04/09/2026 a web tinha 16 onboardings começados e
// ZERO terminados, contra 17 de 27 no aplicativo das lojas. A tabela
// `app_erros` estava vazia para a web, e essa tabela vazia foi usada como
// prova de que o problema era de produto, não de defeito.
//
// A tabela estava vazia porque ninguém estava olhando. O `vigiarErros()` era
// chamado dentro do `useFunilDeAbertura`, montado pelo Shell, e o Shell só
// existe DEPOIS do onboarding. As cinco primeiras telas da vida de um usuário
// novo, que é onde o dinheiro do anúncio cai, rodavam sem coletor nenhum.
//
// Conferência que só olha o caminho feliz não teria pego isso: o app funciona
// perfeitamente enquanto nada quebra. Aqui a gente QUEBRA de propósito e exige
// que o app conte.
import { abrirNavegador, BASE, conferidor, ESPERA_DE_ABERTURA } from "./base.mjs";

export const nome = "erros";
export const sobre = "o coletor de erros está de pé desde a primeira tela";

/**
 * Abre uma tela e devolve os relatos que ela mandaria para /api/erros.
 *
 * A rota é interceptada e respondida na hora: a conferência não pode gravar
 * erro de mentira no banco de verdade.
 */
async function comCaptura(nav, { sessao, rota = "/app" }) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, locale: "pt-BR" });
  const relatos = [];
  await ctx.route("**/api/erros", async (r) => {
    try { relatos.push(JSON.parse(r.request().postData() ?? "{}")); } catch { /* ignora */ }
    await r.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
  });
  await ctx.addInitScript((s) => {
    try {
      if (s) localStorage.setItem("mentorque-garage", JSON.stringify(s));
      localStorage.setItem("mentorque-welcome-back", "1");
    } catch { /* modo privado */ }
  }, sessao ?? null);
  const pg = await ctx.newPage();
  await pg.goto(BASE + rota, { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(ESPERA_DE_ABERTURA);
  return { pg, relatos, fechar: () => ctx.close() };
}

/** Estoura um erro de verdade dentro da página, do jeito que um defeito estoura. */
async function plantarDefeito(pg) {
  await pg.evaluate(() => {
    setTimeout(() => { throw new Error("defeito plantado pela conferencia"); }, 0);
  });
  await pg.waitForTimeout(1200);
}

export async function rodar({ nav, ok }) {
  // ---- a tela que ninguém vigiava -----------------------------------------
  // Sem sessão semeada, o app abre no ONBOARDING. É exatamente o estado em que
  // o coletor não existia.
  {
    const { pg, relatos, fechar } = await comCaptura(nav, { sessao: null });
    const naTela = await pg.locator("body").innerText();
    ok("sem sessão, o app abre no onboarding", /continuar/i.test(naTela), naTela.slice(0, 60).replace(/\n+/g, " | "));

    await plantarDefeito(pg);
    ok(
      "erro no ONBOARDING vira relato",
      relatos.some((r) => (r.mensagem ?? "").includes("defeito plantado")),
      `relatos=${relatos.length}`
    );
    // O relato sem plataforma não serve para separar web de loja, que é a
    // pergunta que originou tudo isto.
    //
    // O `length > 0` não é enfeite: sem ele o `every` numa lista VAZIA responde
    // verdadeiro, e a asserção passava sorrindo justamente no caso em que nada
    // foi relatado. Pego plantando o defeito, que é para isso que se planta.
    ok(
      "o relato diz de que plataforma veio",
      relatos.length > 0 && relatos.every((r) => !!r.plataforma),
      JSON.stringify(relatos.map((r) => r.plataforma))
    );
    await fechar();
  }

  // ---- e continua de pé depois do onboarding ------------------------------
  // O Shell também chama `vigiarErros()`. A trava interna precisa impedir
  // ouvinte duplicado, senão o mesmo erro vira duas linhas e o "top" de erros
  // mais comuns passa a mentir.
  {
    const sessao = {
      onboarded: true, name: "Rod", email: null, state: null, city: null, premium: false,
      vehicles: [{ id: "v1", type: "car", make: "Volkswagen", model: "Golf GTI", year: 2014, nickname: "Golfinho", odometerKm: 98000, kmUpdatedAt: new Date().toISOString(), purchaseDate: "2019-03-10" }],
      services: [], reminders: [], activeVehicleId: "v1", startedAt: "2026-01-01",
    };
    const { pg, relatos, fechar } = await comCaptura(nav, { sessao });
    await plantarDefeito(pg);
    const plantados = relatos.filter((r) => (r.mensagem ?? "").includes("defeito plantado"));
    ok("erro DEPOIS do onboarding também vira relato", plantados.length >= 1, `n=${plantados.length}`);
    ok("e vira UM relato, não dois", plantados.length === 1, `n=${plantados.length}`);
    await fechar();
  }
}

// Roda sozinha: node scripts/navegador/erros.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const nav = await abrirNavegador();
  const { ok, falhas } = conferidor();
  await rodar({ nav, ok });
  await nav.close();
  if (falhas.length) { console.error(`\n${falhas.length} falha(s)`); process.exit(1); }
}
