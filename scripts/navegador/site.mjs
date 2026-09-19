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
// A LISTA SAI DE PÉ, NÃO DE NOME (15/09/2026). O filtro por nome de arquivo é
// uma lista de exceções, e lista de exceções envelhece: `links.ts` não é guia,
// é o registro de links da home, e o primeiro `caminho:` de dentro dele é o do
// guia de barulho. Resultado: `/barulho-no-carro` entrava DUAS vezes e a suíte
// media o mesmo guia duas vezes achando que eram dois. Ninguém viu porque
// medir de novo passa de novo.
//
// O `Set` é o que resolve de verdade: qualquer arquivo futuro que por acaso
// tenha um `caminho:` dentro deixa de inflar a lista. O filtro por nome fica,
// só para não abrir arquivo à toa.
const GUIAS = [
  ...new Set(
    readdirSync(PASTA_GUIAS)
      .filter((f) => f.endsWith(".ts") && !["tipos.ts", "index.ts", "links.ts"].includes(f))
      .map((f) => (readFileSync(join(PASTA_GUIAS, f), "utf8").match(/caminho:\s*"([^"]+)"/) ?? [])[1])
      .filter(Boolean),
  ),
].sort();

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
      // ── A MANCHETE NÃO PODE ESTOURAR O TRILHO DELA ──────────────────────
      //
      // Só na home, e só porque ali mora um carrossel: três frases giram no
      // mesmo lugar e NÃO têm a mesma altura. Se a mais alta passar do
      // `min-height` do trilho, a caixa cresce quando ela entra e empurra tudo
      // que vem abaixo, botões de loja inclusive. A pessoa vê a página pular.
      //
      // Isto entrou em 19/09/2026 depois de o rastro do Chrome DevTools medir
      // CLS 0,19 na home (acima de 0,10 já é ruim). A causa estava medida: no
      // celular a terceira frase ocupava 142px contra um trilho de 120px. O
      // defeito já existia com o trilho em 136px, estourando por 6px, e uma
      // mudança visual do mesmo dia baixou para 120px e triplicou o estouro.
      //
      // Nenhuma conferência daqui pegava isso: a página não vaza para o lado,
      // não tem rolagem lateral e nenhum texto some. Ela só PULA, e pulo não
      // aparece em foto nem em asserção de texto.
      if (caminho === "/") {
        const trilho = await pg.evaluate(() => {
          const h1 = document.querySelector("h1");
          if (!h1) return null;
          const caixa = h1.parentElement;
          return {
            minima: Math.round(parseFloat(getComputedStyle(caixa).minHeight) || 0),
            alturas: [Math.round(h1.getBoundingClientRect().height)],
          };
        });

        if (trilho) {
          // Clica em cada bolinha e mede a frase que entrou. Fica FORA do
          // evaluate porque a troca é animada e medir cedo lê o meio do
          // caminho, que foi o erro da primeira versão da conferência da barra.
          const bolinhas = await pg.locator('[aria-label^="Ir para a frase"]').count();
          for (let i = 0; i < bolinhas; i++) {
            await pg.locator('[aria-label^="Ir para a frase"]').nth(i).click();
            await pg.waitForTimeout(650);
            const alt = await pg.evaluate(() =>
              Math.round(document.querySelector("h1").getBoundingClientRect().height)
            );
            trilho.alturas.push(alt);
          }
          const maior = Math.max(...trilho.alturas);
          ok(
            `/ @ ${largura}px: a manchete mais alta cabe no trilho (sem pulo)`,
            maior <= trilho.minima,
            `trilho ${trilho.minima}px, frase mais alta ${maior}px` +
              (maior > trilho.minima ? `, ESTOURA ${maior - trilho.minima}px` : "")
          );
        }
      }

      await pg.close();
    }
    await ctx.close();
  }

  // ── O GUIA RENDERIZADO, não o código do guia ─────────────────────────────
  //
  // A `conferir:guias` lê os arquivos; isto aqui abre a página e olha o que a
  // pessoa e o robô recebem. Três coisas que entraram em 08/09/2026 e que só
  // existem de verdade se aparecerem no HTML: a data visível, o link no meio
  // do texto (a marcação `[[...]]` virou `<a>` e não texto cru), e o cartão de
  // compartilhamento respondendo imagem. Um guia basta AQUI: o que está sendo
  // conferido é o componente, e ele é o mesmo para todos. A conferência da
  // barra, logo abaixo, roda em todos, e o comentário dela explica por quê.
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 900 } });
    const pg = await ctx.newPage();
    const caminho = GUIAS[0];
    await pg.goto(BASE + caminho, { waitUntil: "networkidle" }).catch(() => {});
    const visto = await pg.evaluate(() => ({
      data: !!document.querySelector("main time[datetime]"),
      publicado: /Publicado em/.test(document.querySelector("main")?.textContent ?? ""),
      // Pelo atributo que a marcação `[[...]]` produz, e não por "<a> dentro
      // de <article>": a primeira versão reprovou o guia de barulho, cujo único
      // link do corpo está no bloco de segurança, que é <section>. E "a[href^='/']"
      // solto pegaria a lista de outros guias no fim da página, que não é corpo.
      linkNoCorpo: !!document.querySelector("main a[data-link-no-texto]"),
      marcacaoCrua: /\[\[/.test(document.querySelector("main")?.textContent ?? ""),
      article: /"@type":"Article"/.test(document.querySelector("script[type='application/ld+json']")?.textContent ?? ""),
      og: document.querySelector("meta[property='og:image']")?.getAttribute("content") ?? "",
    }));
    ok(`${caminho}: a data de publicação está na página`, visto.data && visto.publicado);
    ok(`${caminho}: há link para outro guia no meio do texto`, visto.linkNoCorpo);
    ok(`${caminho}: nenhuma marcação [[...]] saiu crua para a pessoa`, !visto.marcacaoCrua);
    ok(`${caminho}: o dado estruturado é um Article`, visto.article);
    ok(`${caminho}: o og:image é o cartão do próprio guia`, visto.og.endsWith(`/og${caminho}`), visto.og);
    const resp = await pg.request.get(BASE + `/og${caminho}`).catch(() => null);
    ok(
      `${caminho}: o cartão de compartilhamento responde uma imagem`,
      !!resp && resp.status() === 200 && (resp.headers()["content-type"] ?? "").startsWith("image/"),
      resp ? `${resp.status()} ${resp.headers()["content-type"] ?? ""}` : "sem resposta"
    );

    await pg.close();
    await ctx.close();
  }

  // A BARRA FIXA COM AS LOJAS (15/09/2026, pedido do dono). Os guias são o
  // destino do anúncio de busca, e a barra é a única saída para a loja que
  // quem lê metade e desiste chega a ver. Três perguntas, e a primeira é a que
  // uma conferência de texto não responderia: ela CONTINUA no topo depois de
  // rolar? `position: sticky` morre em silêncio quando um pai ganha `overflow`
  // ou `transform`, e a página segue funcionando.
  //
  // ISTO RODA EM TODOS OS GUIAS, e o bloco de cima não (16 linhas acima:
  // "um guia basta"). A diferença não é capricho. Lá em cima o que se confere
  // é o COMPONENTE, igual para todos. Aqui metade do que se confere é do
  // CONTEÚDO de cada guia: a folga da âncora depende do índice daquele guia, e
  // `position: sticky` morre por causa de um pai com `overflow`, que um bloco
  // novo pode trazer sem ninguém perceber.
  //
  // E o custo de descobrir isso foi baixo por acaso: em 15/09 o agente de SEO
  // publicou o quinto guia horas depois de a barra entrar, e a suíte aprovou
  // sem nunca ter olhado a barra dele. Amostra de um vira ponto cego assim que
  // alguém acrescenta o segundo.
  for (const caminho of GUIAS) {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 900 } });
    const pg = await ctx.newPage();
    await pg.goto(BASE + caminho, { waitUntil: "networkidle" }).catch(() => {});
    const barra = await pg.evaluate(() => {
      // MESMA BLINDAGEM DA MEDIDA DE CORTE LATERAL, pelo mesmo motivo: sem a
      // folha de estilo, `position: sticky` não existe e esta conferência
      // acusaria a barra de ter saído do lugar quando o que faltou foi o CSS.
      // Aconteceu comigo em 15/09, com um servidor de desenvolvimento meu
      // disputando o `.next` com o da suíte.
      const semEstilo = ![...document.styleSheets].some((f) => {
        try { return f.cssRules.length > 0; } catch { return true; }
      });
      if (semEstilo) return { semEstilo: true };
      return { lojas: [...document.querySelectorAll("header a[target='_blank']")].map((a) => a.getAttribute("href") ?? "") };
    });
    // A rolagem e a espera ficam FORA do evaluate: a página rola suave, e
    // medir 120ms depois do pedido lia o meio do caminho (a primeira versão
    // desta conferência reprovou por isso, com a barra certa).
    await pg.evaluate(() => window.scrollTo(0, 1200));
    await pg.waitForTimeout(600);
    Object.assign(barra, await pg.evaluate(() => {
      const r = document.querySelector("header").getBoundingClientRect();
      return { grudou: Math.round(r.top) === 0 && r.height > 0, rolou: window.scrollY > 400 };
    }));
    ok(
      `${caminho}: a barra do topo continua no lugar depois de rolar`,
      barra.semEstilo ? false : barra.grudou && barra.rolou,
      barra.semEstilo ? "a página abriu SEM CSS; derrube os servidores de desenvolvimento e rode de novo" : JSON.stringify(barra)
    );
    ok(
      `${caminho}: a barra leva às duas lojas`,
      barra.lojas.some((h) => h.includes("play.google.com")) && barra.lojas.some((h) => h.includes("apps.apple.com")),
      barra.lojas.join(" | ")
    );

    // E a âncora do índice não pode cair atrás da barra: o `scroll-mt` do bloco
    // tem que ser maior que a altura dela, senão o título some embaixo.
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.locator('nav[aria-label="Índice do guia"] a').first().click();
    await pg.waitForTimeout(700);
    const folga = await pg.evaluate(() => {
      const h = document.querySelector("header").getBoundingClientRect();
      const a = document.querySelector("article[id]").getBoundingClientRect();
      return Math.round(a.top - h.bottom);
    });
    ok(`${caminho}: o índice não joga o bloco atrás da barra`, folga >= 0, `folga de ${folga}px`);

    await pg.close();
    await ctx.close();
  }
}
