#!/usr/bin/env node
/**
 * EXPERIMENTO: encolher a Biela dentro da chapa, para alargar a coluna de texto.
 *
 * O pedido do dono (07/09/2026) foi direto: dá para reduzir a Biela também? A
 * conta favorece. Na chapa da curiosidade ela ocupa de x 433 até a borda; a 85%
 * a borda esquerda dela vai para uns 530, o que alarga a coluna de texto em
 * quase um quarto.
 *
 * O PROBLEMA é que ela está desenhada DENTRO do PNG, sem canal de
 * transparência. Encolher significa três coisas: recortar ela do quadro,
 * remendar o buraco que sobra com textura de quadro-negro, e colar a versão
 * menor por cima. O remendo é a parte que pode denunciar: o quadro tem textura
 * e um leve escurecimento nas bordas, então retângulo colado aparece.
 *
 * A MÁSCARA sai da cor, e não de recorte à mão: a Biela é marrom (pelo) e azul
 * escuro (macacão) sobre um quadro cinza neutro. O mesmo critério da
 * lib/pecas/silhueta.ts, com uma folga de alguns pixels para pegar a borda
 * antisserrilhada.
 *
 * O REMENDO copia textura da MESMA LINHA, do lado esquerdo do quadro, que está
 * vazio nas oito chapas. Mesma linha para respeitar o escurecimento vertical.
 *
 * Uso:
 *   node scripts/encolhe-biela.mjs 0.85            gera em pecas-geradas/biela/
 *   node scripts/encolhe-biela.mjs 0.85 --gravar   substitui as chapas
 *
 * NÃO É PARA RODAR NO ESCURO: gere, olhe as oito, e só então grave. O caminho
 * limpo continua sendo a v2 das chapas que o dono já pediu ao ilustrador; isto
 * aqui é cirurgia em cima de arte pronta.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "..");
const escala = Number(process.argv[2] ?? 0.85);
const gravar = process.argv.includes("--gravar");
const destino = join(RAIZ, "pecas-geradas/biela");

const { CHAPAS } = await import(join(RAIZ, "lib/pecas/chapas.ts"));
const { chromium } = await import("playwright");
const caminhoDoNavegador = process.env.CHROMIUM ?? "/opt/pw-browsers/chromium";
const nav = await chromium.launch(existsSync(caminhoDoNavegador) ? { executablePath: caminhoDoNavegador } : {});
const pg = await nav.newPage();
mkdirSync(destino, { recursive: true });

for (const chapa of CHAPAS) {
  const origem = join(RAIZ, "assets/pecas", chapa.formato, chapa.arquivo);
  const b64 = readFileSync(origem).toString("base64");

  const saida = await pg.evaluate(
    async ({ b64, escala }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const L = img.width, A = img.height;

      const tela = document.createElement("canvas");
      tela.width = L; tela.height = A;
      const ctx = tela.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const dados = ctx.getImageData(0, 0, L, A);
      const d = dados.data;
      const ehBiela = (i) => {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        // Pelo marrom e macacão azulado: claro OU colorido. O quadro é cinza
        // neutro e escuro, e o giz branco da etiqueta fica fora da faixa.
        return max > 78 || max - min > 26;
      };

      // A CAIXA DA BIELA. Ela encosta na borda de baixo e na da direita nas
      // oito chapas, então basta achar onde ela COMEÇA. Duas coisas atrapalham
      // e ficam de fora da busca: a etiqueta de giz com a régua, no topo, e a
      // bandeja de giz, que atravessa a chapa inteira lá embaixo.
      const deY = Math.round(A * 0.15);
      const ateY = Math.round(A * 0.88);
      let x1 = L, y1 = A;
      for (let y = deY; y < ateY; y++) {
        for (let x = Math.round(L * 0.3); x < L; x++) {
          if (ehBiela((y * L + x) * 4)) { if (x < x1) x1 = x; if (y < y1) y1 = y; break; }
        }
      }

      // A BIELA RECORTADA, com fundo transparente, para poder colar menor. O
      // recorte vai da caixa dela até o fim da chapa: ela pisa na frente da
      // bandeja, e cortar acima da bandeja decepava os pés.
      const largura = L - x1, altura = A - y1;
      const corte = document.createElement("canvas");
      corte.width = largura; corte.height = altura;
      const cctx = corte.getContext("2d");
      const so = cctx.createImageData(largura, altura);
      for (let y = y1; y < A; y++) {
        for (let x = x1; x < L; x++) {
          const o = (y * L + x) * 4;
          const p = ((y - y1) * largura + (x - x1)) * 4;
          so.data[p] = d[o]; so.data[p + 1] = d[o + 1]; so.data[p + 2] = d[o + 2];
          so.data[p + 3] = ehBiela(o) ? 255 : 0;
        }
      }
      cctx.putImageData(so, 0, 0);

      const nl = Math.round(largura * escala), na = Math.round(altura * escala);
      const novoX1 = L - nl, novoY1 = A - na;

      // O REMENDO É PELA MÁSCARA, e não por retângulo. Apagar retângulos
      // deixou DUAS Bielas na imagem: a menor por cima, e a original
      // aparecendo por trás onde a menor não alcança. O que precisa sumir é a
      // silhueta inteira dela, pixel a pixel.
      //
      // A TEXTURA vem da MESMA LINHA, à esquerda, que é quadro vazio nas oito
      // chapas. Mesma linha porque o quadro escurece de cima para baixo. Na
      // faixa da bandeja de giz a fonte é uma janela estreita de bandeja limpa,
      // senão o giz e o apagador se repetiriam.
      const bandeja = Math.round(A * 0.9);
      const limpo = { de: 60, ate: 140 };
      for (let y = y1; y < A; y++) {
        const naBandeja = y >= bandeja;
        const fonteDe = naBandeja ? limpo.de : 0;
        const fonteAte = naBandeja ? limpo.ate : x1;
        const faixa = fonteAte - fonteDe;
        for (let x = x1; x < L; x++) {
          const o = (y * L + x) * 4;
          // Espelhado, para o emenda não repetir padrão em faixas visíveis.
          const passo = (x - x1) % (2 * faixa);
          const fx = fonteDe + (passo < faixa ? faixa - 1 - passo : passo - faixa);
          const f = (y * L + fx) * 4;
          // FORA DA BANDEJA, apaga tudo que NÃO PARECE QUADRO, comparando com a
          // textura da mesma linha. Testar cor fixa deixava o contorno escuro do
          // macacão para trás, e sobrava um fantasma dela na imagem: o macacão é
          // quase tão escuro quanto o quadro. Na bandeja o critério volta a ser
          // a cor, porque ali o que está desenhado não é quadro e precisa ficar.
          const dela = naBandeja
            ? ehBiela(o)
            : Math.abs(d[o] - d[f]) > 10 || Math.abs(d[o + 1] - d[f + 1]) > 10 || Math.abs(d[o + 2] - d[f + 2]) > 10;
          if (!dela) continue;
          d[o] = d[f]; d[o + 1] = d[f + 1]; d[o + 2] = d[f + 2];
        }
      }
      ctx.putImageData(dados, 0, 0);

      // Ancorada embaixo e à direita: ela pisa na frente da bandeja de giz, e
      // subir os pés dela faria a peça parecer flutuando.
      ctx.drawImage(corte, novoX1, novoY1, nl, na);

      return { url: tela.toDataURL("image/png"), x1, y1, novoX1: L - nl };
    },
    { b64, escala }
  );

  const arquivo = join(destino, chapa.arquivo);
  writeFileSync(arquivo, Buffer.from(saida.url.split(",")[1], "base64"));
  if (gravar) writeFileSync(origem, Buffer.from(saida.url.split(",")[1], "base64"));
  console.log(`  ${chapa.secao}/${chapa.formato}: a Biela começava em x ${saida.x1}, agora em ${saida.novoX1}`);
}

await nav.close();
console.log(`\nGeradas em ${destino}. Olhe as oito antes de gravar.`);
