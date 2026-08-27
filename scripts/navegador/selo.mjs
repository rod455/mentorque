// O chip do quiz na barra de cima, nos três estados.
//
// O caso 1 é o que importa: sem sequência o foguinho não aparece. "🔥 0" não
// motiva ninguém, anuncia um zero. E o rótulo falado (aria-label) precisa
// dizer a frase inteira, porque "✓ 🔥 7" não se lê em voz alta.
import { garagem, dia, abrirApp } from "./base.mjs";

export const nome = "selo";
export const sobre = "o chip do quiz e o foguinho, nos três estados";

export async function rodar({ nav, ok }) {
  const abrir = async (quiz) => {
    const app = await abrirApp(nav, {
      sessao: garagem({ startedAt: "2026-08-23", ...(quiz ? { quiz } : {}) }),
      chaves: { "mq-primeiro-quiz-nao": "1" },
    });
    const chip = app.pg.getByRole("button", { name: /Quiz Diário/i }).first();
    const tem = (await chip.count()) > 0;
    return {
      ...app,
      tem,
      texto: tem ? await chip.innerText() : "",
      rotulo: tem ? (await chip.getAttribute("aria-label")) ?? "" : "",
    };
  };

  // 1. Nunca respondeu: chip chama, sem foguinho.
  {
    const c = await abrir(null);
    ok("o chip existe mesmo sem resposta nenhuma", c.tem);
    ok("sem sequência não mostra foguinho", !c.texto.includes("🔥"), c.texto.replace(/\n/g, " | "));
    ok("o rótulo convida para a pergunta", /Um minuto|One minute/i.test(c.rotulo), c.rotulo);
    await c.fechar();
  }

  // 2. Respondeu ontem, hoje pendente: foguinho com 1, estado de chamada.
  {
    const c = await abrir({ ultimoDia: dia(-1), sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1 });
    ok("pendente com sequência mostra o foguinho", c.texto.includes("🔥"));
    ok("o foguinho traz o número 1", /\b1\b/.test(c.texto), c.texto.replace(/\n/g, " | "));
    ok("o rótulo fala a sequência por extenso", /1 dia seguido/.test(c.rotulo), c.rotulo);
    ok("pendente NÃO diz feita", !/feita/i.test(c.rotulo));
    await c.fechar();
  }

  // 3. Já respondeu hoje, sequência 7: confirmado, foguinho com 7.
  {
    const c = await abrir({ ultimoDia: dia(0), sequencia: 7, recorde: 7, perdaoEm: null, respostas: 7, acertos: 5 });
    ok("feito mostra o ✓ e o foguinho com 7", c.texto.includes("✓") && c.texto.includes("🔥") && /7/.test(c.texto), c.texto.replace(/\n/g, " | "));
    ok("o rótulo diz feita e 7 dias seguidos", /feita/i.test(c.rotulo) && /7 dias seguidos/.test(c.rotulo), c.rotulo);
    await c.fechar();
  }
}
