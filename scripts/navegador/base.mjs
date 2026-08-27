// O andaime comum das conferências de navegador.
//
// Existe porque cada suíte repetia as mesmas 40 linhas: abrir o Chromium,
// semear a garagem no localStorage, esperar o app hidratar, contar falhas.
// Quarenta linhas de cerimônia antes da primeira asserção é o que faz alguém
// desistir de escrever a conferência e "testar na mão" — e o que não é
// conferido volta como defeito.
//
// Com isto, uma suíte nova começa na primeira linha que interessa.

import { chromium } from "playwright";
import { existsSync } from "node:fs";

export const BASE = process.env.BASE ?? "http://localhost:3000";

/**
 * Quanto esperar o app ficar de pé depois de abrir.
 *
 * O /app hidrata, lê o localStorage, resolve a sessão da nuvem e só então
 * desenha o estado real. Medir antes disso é medir a tela de carregamento.
 * Nove segundos é folgado de propósito: uma conferência que falha sozinha de
 * vez em quando é pior que nenhuma, porque ensina a ignorar o vermelho.
 */
export const ESPERA_DE_ABERTURA = 9000;

const CELULAR = { width: 390, height: 844 };

/** yyyy-mm-dd de hoje deslocado de `n` dias (negativo = passado). */
export function dia(n = 0) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}

/** O carro padrão das conferências. */
export const CARRO = {
  id: "v1",
  type: "car",
  make: "Volkswagen",
  model: "Golf GTI",
  year: 2014,
  nickname: "Golfinho",
  odometerKm: 98000,
  // Carimbo recente de propósito: sem ele o lembrete mensal de km abre junto e
  // vira um segundo diálogo por cima do que está sendo conferido.
  kmUpdatedAt: new Date().toISOString(),
  purchaseDate: "2019-03-10",
};

/**
 * Uma sessão semeada. Passe só o que a conferência precisa mudar.
 *
 * `semCarro: true` devolve a garagem vazia — é o caso de quem só espiou o app,
 * e vários caminhos se comportam diferente ali.
 */
export function garagem({ semCarro = false, ...resto } = {}) {
  return {
    onboarded: true,
    name: "Rod",
    email: null,
    state: null,
    city: null,
    premium: false,
    vehicles: semCarro ? [] : [CARRO],
    activeVehicleId: semCarro ? null : CARRO.id,
    services: [],
    claimedMilestones: [],
    momentPhotos: {},
    seenLessons: [],
    savedLessons: [],
    pinnedLessons: [],
    reminders: [],
    startedAt: dia(0),
    notifications: false,
    units: "metric",
    avatar: null,
    ...resto,
  };
}

/** Um contador de conferências com nome, para o relatório do final. */
export function conferidor() {
  const falhas = [];
  const ok = (nome, condicao, extra = "") => {
    if (!condicao) falhas.push(nome);
    console.log(`  ${condicao ? "✓" : "✗"} ${nome}${extra ? "  " + extra : ""}`);
  };
  return { ok, falhas };
}

export async function abrirNavegador() {
  // O caminho do Chromium muda por máquina. Com a variável, funciona em
  // qualquer lugar; sem ela e sem o caminho conhecido, o Playwright acha o
  // dele sozinho.
  const caminho = process.env.CHROMIUM ?? "/opt/pw-browsers/chromium";
  return chromium.launch(existsSync(caminho) ? { executablePath: caminho } : {});
}

/**
 * Abre o app com uma sessão já semeada e espera ele ficar de pé.
 *
 * Devolve `{ pg, ctx, fechar, corpo() }`. O `corpo()` lê o texto da tela
 * inteira, que é como quase toda asserção aqui é escrita.
 */
export async function abrirApp(nav, { sessao, chaves = {}, rota = "/app" } = {}) {
  const ctx = await nav.newContext({ viewport: CELULAR, deviceScaleFactor: 2, locale: "pt-BR" });

  // O `if` é obrigatório e não é zelo: o addInitScript roda a CADA navegação,
  // recarga inclusive. Sem ele, recarregar apagaria justamente a resposta que
  // a conferência acabou de gravar e quer conferir do outro lado.
  await ctx.addInitScript(([s, c]) => {
    try {
      if (s && !localStorage.getItem("mentorque-garage")) {
        localStorage.setItem("mentorque-garage", JSON.stringify(s));
      }
      localStorage.setItem("mentorque-welcome-back", "1");
      for (const [k, v] of Object.entries(c)) localStorage.setItem(k, v);
    } catch { /* modo privado */ }
  }, [sessao ?? null, chaves]);

  const pg = await ctx.newPage();
  const erros = [];
  pg.on("pageerror", (e) => erros.push(e.message));

  await pg.goto(BASE + rota, { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(ESPERA_DE_ABERTURA);

  return {
    pg,
    ctx,
    erros,
    corpo: () => pg.locator("body").innerText(),
    tela: () => pg.locator("main").innerText(),
    /** Recarrega e espera de novo, mantendo o que o app gravou. */
    recarregar: async () => {
      await pg.reload({ waitUntil: "domcontentloaded" });
      await pg.waitForTimeout(ESPERA_DE_ABERTURA);
    },
    /** O que o app gravou na sessão, lido de dentro do navegador. */
    sessaoGravada: () =>
      pg.evaluate(() => {
        try { return JSON.parse(localStorage.getItem("mentorque-garage") ?? "{}"); } catch { return {}; }
      }),
    fechar: () => ctx.close(),
  };
}

/**
 * Denuncia todo elemento que passa da borda direita da tela.
 *
 * Corte lateral no celular não aparece em nenhuma asserção de texto: a página
 * "funciona", só que metade dela está fora. Foi assim que os botões da home do
 * site ficaram cortados sem ninguém perceber.
 */
export async function vazandoDaTela(pg, seletor = "body *") {
  return pg.evaluate((sel) => {
    const largura = document.documentElement.clientWidth;
    const fora = [];
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const est = getComputedStyle(el);
      if (est.visibility === "hidden" || est.display === "none") continue;
      // O que está fora da tela de propósito é sempre aria-hidden: brilhos,
      // motivos decorativos e ícones usam deslocamento negativo.
      if (el.closest("[aria-hidden='true']")) continue;
      if (r.right > largura + 1 || r.left < -1) {
        const cls = typeof el.className === "string" ? el.className.split(" ")[0] : "";
        fora.push(`${el.tagName.toLowerCase()}${cls ? "." + cls : ""} ${Math.round(r.left)}..${Math.round(r.right)}`);
      }
    }
    return fora.slice(0, 5);
  }, seletor);
}

/**
 * Botões e campos que a pessoa NÃO alcança porque estão fora da tela.
 *
 * Por que não a varredura geral acima: dentro do app existem roladores
 * horizontais legítimos (a fileira de carros da Home mostra um chip pela
 * metade de propósito). Tentei ensinar a varredura a ignorar rolador e ela
 * ficou CEGA — a folha usa `overflow-y-auto`, e no CSS isso faz o `overflow-x`
 * computar como `auto` também, então a exceção engolia a folha inteira.
 * Plantei um elemento largo demais lá dentro e o detector não acusou nada.
 *
 * Então a pergunta aqui é outra, e não tem como ser enganada: existe algum
 * CONTROLE cuja caixa passa da borda? Elemento decorativo saindo não machuca
 * ninguém; botão que não dá para tocar, sim.
 *
 * Passe `dentroDe` para limitar a um trecho ("div[role=dialog]").
 */
export async function controlesForaDaTela(pg, dentroDe = "body") {
  return pg.evaluate((raiz) => {
    const largura = document.documentElement.clientWidth;
    const base = document.querySelector(raiz);
    if (!base) return ["(não achei " + raiz + ")"];
    const fora = [];
    for (const el of base.querySelectorAll("button, a, input, select, textarea")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const est = getComputedStyle(el);
      if (est.visibility === "hidden" || est.display === "none") continue;
      if (r.right > largura + 1 || r.left < -1) {
        const rotulo = (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30);
        fora.push(`${el.tagName.toLowerCase()} "${rotulo}" ${Math.round(r.left)}..${Math.round(r.right)}`);
      }
    }
    return fora.slice(0, 5);
  }, dentroDe);
}

/** A página inteira rola para o lado? Nunca deve, em nenhuma largura. */
export async function rolaParaOLado(pg) {
  return pg.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}
