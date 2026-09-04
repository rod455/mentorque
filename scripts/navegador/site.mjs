// As páginas do site em larguras de celular: nada pode passar da borda.
//
// Esta suíte existe por um defeito que chegou ao dono por foto: os botões da
// home ficavam cortados no celular. Nenhuma asserção de texto pegaria aquilo,
// porque a página "funcionava" — só que metade dela estava fora da tela.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { BASE } from "./base.mjs";

export const nome = "site";
export const sobre = "vazamento lateral das páginas do site em telas de celular";

// Os guias de sintoma são LIDOS do registro, não escritos aqui.
//
// Esta lista já era à mão, e lista à mão é como uma página nova deixa de ser
// conferida sem ninguém notar: ela sobe, funciona, e simplesmente não está
// entre as que alguém olha em 320px. Guia novo passa a ser conferido no dia em
// que nasce, que é justamente quando o corte lateral costuma entrar.
const PASTA_GUIAS = new URL("../../lib/site/guias", import.meta.url).pathname;
const GUIAS = readdirSync(PASTA_GUIAS)
  .filter((f) => f.endsWith(".ts") && f !== "tipos.ts" && f !== "index.ts")
  .map((f) => (readFileSync(join(PASTA_GUIAS, f), "utf8").match(/caminho:\s*"([^"]+)"/) ?? [])[1])
  .filter(Boolean)
  .sort();

// `/landing` é a LP de tráfego pago. Entra aqui porque é a página cujo corte
// lateral custa dinheiro na hora: cada visita dela foi comprada.
const PAGINAS = ["/", "/landing", "/sobre", "/termos", "/privacidade", ...GUIAS];
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
        // A PÁGINA CHEGOU COM ESTILO? Sem CSS, toda imagem desenha no tamanho
        // natural e a página inteira "vaza", então a suíte acusa corte lateral
        // em tudo, apontando para o lugar errado.
        //
        // Aconteceu em 04/09/2026, e a causa vale ficar escrita porque ela vai
        // se repetir: o `todos.mjs` SOBE O PRÓPRIO servidor quando não acha um
        // de pé, e o derruba no fim. Com um servidor levantado à mão junto, os
        // dois disputam o mesmo `.next` e o `layout.css` passa a devolver 404.
        // A home e a /landing reprovaram em todas as larguras por isso, e o
        // diagnóstico "corte lateral" mandou procurar defeito de layout que
        // não existia. Se esta mensagem aparecer, derrube os servidores de
        // desenvolvimento e deixe a suíte cuidar do dela.
        //
        // Conferência que reprova pelo motivo errado é pior que conferência
        // que não reprova: ela manda consertar o que não está quebrado.
        // O teste é a FOLHA existir com regras dentro, e não uma classe
        // aplicando. Duas versões anteriores erraram aqui e reprovaram o site
        // inteiro, cada uma por um motivo que vale lembrar:
        //   - a cor do body: o fundo é pintado num filho, então body
        //     transparente é o normal deste site;
        //   - a classe `hidden` do Tailwind: ele só gera a classe que o
        //     projeto usa, e essa não é usada em lugar nenhum, então ela não
        //     existe no CSS nem quando tudo está certo.
        const semEstilo = ![...document.styleSheets].some((f) => {
          try {
            return f.cssRules.length > 0;
          } catch {
            // Folha de outra origem não deixa ler as regras. Se ela está aqui,
            // carregou.
            return true;
          }
        });
        if (semEstilo) return { semEstilo: true, rolagem: false, fora: [] };
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
        return { semEstilo: false, rolagem, fora: fora.slice(0, 4) };
      }, largura);

      ok(
        `${caminho} @ ${largura}px`,
        !achados.semEstilo && !achados.rolagem && achados.fora.length === 0,
        achados.semEstilo
          ? "a página abriu SEM CSS (folha de estilo não carregou); a medida de corte lateral não vale nada assim"
          : achados.rolagem
            ? "rolagem lateral " + achados.fora.join(" | ")
            : achados.fora.join(" | ")
      );
      await pg.close();
    }
    await ctx.close();
  }
}
