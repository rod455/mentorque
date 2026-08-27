// O selo da sequência na faixa do quiz, nos três estados.
//
// O caso 1 é o que importa: sem sequência o selo não aparece. "🔥 0" não
// motiva ninguém, anuncia um zero.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "selo";
export const sobre = "o selo do foguinho na faixa do quiz";

export async function rodar({ nav, ok }) {
  const abrir = async (quiz) => {
    const app = await abrirApp(nav, {
      sessao: garagem({ startedAt: "2026-01-01", ...(quiz ? { quiz } : {}) }),
      chaves: { "mq-primeiro-quiz-nao": "1" },
    });
    const faixa = app.pg.getByRole("button", { name: /Pergunta d/i }).first();
    const tem = (await faixa.count()) > 0;
    const selo = faixa.locator("[role=img]");
    return {
      ...app,
      html: tem ? await faixa.innerHTML() : "",
      texto: tem ? await faixa.innerText() : "",
      rotulo: (await selo.count()) ? await selo.getAttribute("aria-label") : null,
    };
  };

  // 1. Nunca respondeu: sem selo.
  {
    const c = await abrir(null);
    ok("sem sequência não mostra selo", !c.html.includes("🔥"), c.texto.replace(/\n/g, " | "));
    await c.fechar();
  }

  // 2. Respondeu ontem, hoje pendente: selo com 1.
  {
    const c = await abrir({ ultimoDia: dia(-1), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 });
    ok("pendente com sequência mostra o selo", c.html.includes("🔥"));
    ok("o selo traz o número 1", /\b1\b/.test(c.texto), c.texto.replace(/\n/g, " | "));
    ok("o selo tem rótulo lido em voz alta", c.rotulo === "1 dia seguido", String(c.rotulo));
    ok("o subtítulo não repete a sequência", !/dia seguido/.test(c.texto.split("\n").slice(0, 2).join(" ")));
    await c.fechar();
  }

  // 3. Já respondeu hoje, sequência 7.
  {
    const c = await abrir({ ultimoDia: dia(0), sequencia: 7, recorde: 7, perdaoEm: null, respostas: 7, acertos: 5 });
    ok("feito mostra selo com 7", c.html.includes("🔥") && /7/.test(c.texto));
    ok("o rótulo diz 7 dias seguidos", c.rotulo === "7 dias seguidos", String(c.rotulo));
    ok("subtítulo fala do amanhã", /A próxima sai amanhã/.test(c.texto), c.texto.replace(/\n/g, " | "));
    await c.fechar();
  }
}
