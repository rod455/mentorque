// As páginas do site em larguras de celular: nada pode passar da borda.
//
// Esta suíte existe por um defeito que chegou ao dono por foto: os botões da
// home ficavam cortados no celular. Nenhuma asserção de texto pegaria aquilo,
// porque a página "funcionava" — só que metade dela estava fora da tela.
import { BASE } from "./base.mjs";

export const nome = "site";
export const sobre = "vazamento lateral das páginas do site em telas de celular";

// `/landing` é a LP de tráfego pago. Entra aqui porque é a página cujo corte
// lateral custa dinheiro na hora: cada visita dela foi comprada.
const PAGINAS = ["/", "/landing", "/sobre", "/termos", "/privacidade"];
const LARGURAS = [320, 360, 390, 430];

export async function rodar({ nav, ok }) {
  for (const largura of LARGURAS) {
    const ctx = await nav.newContext({
      viewport: { width: largura, height: 900 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    for (const caminho of PAGINAS) {
      const pg = await ctx.newPage();
      await pg.goto(BASE + caminho, { waitUntil: "networkidle" }).catch(() => {});
      await pg.waitForTimeout(600);

      const achados = await pg.evaluate((w) => {
        const fora = [];
        const rolagem = document.documentElement.scrollWidth > document.documentElement.clientWidth;
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const est = getComputedStyle(el);
          if (est.visibility === "hidden" || est.display === "none") continue;
          // O que foi posicionado fora da tela de propósito (brilhos e motivos
          // decorativos usam deslocamento negativo) é sempre aria-hidden.
          if (el.closest("[aria-hidden='true']")) continue;
          if (r.right > w + 1 || r.left < -1) {
            fora.push(`<${el.tagName.toLowerCase()}> ${Math.round(r.left)}..${Math.round(r.right)} "${(el.textContent ?? "").trim().slice(0, 30)}"`);
          }
        }
        return { rolagem, fora: fora.slice(0, 4) };
      }, largura);

      ok(
        `${caminho} @ ${largura}px`,
        !achados.rolagem && achados.fora.length === 0,
        achados.rolagem ? "rolagem lateral " + achados.fora.join(" | ") : achados.fora.join(" | ")
      );
      await pg.close();
    }
    await ctx.close();
  }
}
