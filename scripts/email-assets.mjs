// Gera os dois arquivos de imagem usados nos e-mails.
//
// E-mail não carrega SVG (o Gmail e o Outlook simplesmente não renderizam) e
// não gosta de arquivo grande: várias caixas cortam a mensagem quando ela passa
// de ~100 KB, e o Biela original tem quase 1 MB. Então aqui saem duas versões
// PNG pequenas, com fundo transparente, servidas pelo site.
//
// Rodar só quando a arte mudar: `node scripts/email-assets.mjs`.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const raiz = process.cwd();
const destino = path.join(raiz, "public", "email");
fs.mkdirSync(destino, { recursive: true });

// O mesmo traçado de public/logo/mark.svg, desenhado em Python porque não há
// conversor de SVG nesta máquina. Fica em 2x (240px) para não serrilhar em
// tela retina, e é exibido a 120px no HTML.
const script = `
from PIL import Image, ImageDraw
import math

LADO = 240
ESCALA = LADO / 300.0
AMBER = (242, 166, 35, 255)

def P(x, y):
    return (x * ESCALA, y * ESCALA)

# O hexágono do mark.svg, achatado em segmentos: as curvas dos cantos são
# arredondamentos pequenos e somem no tamanho final.
hexagono = [P(247,134.41), P(251.5,142), P(247,165.59), P(212,226.21),
            P(207.5,234), P(185,241.80), P(115,241.80), P(92.5,234),
            P(88,226.21), P(53,165.59), P(48.5,150), P(53,134.41),
            P(88,73.79), P(92.5,66), P(115,58.20), P(185,58.20),
            P(207.5,66), P(212,73.79)]

img = Image.new("RGBA", (LADO, LADO), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.line(hexagono + [hexagono[0]], fill=AMBER, width=max(1, round(12.3 * ESCALA)), joint="curve")

# O "M"
m = [P(118,198), P(118,117), P(150,170.46), P(182,117), P(182,198)]
d.line(m, fill=AMBER, width=max(1, round(28 * ESCALA)), joint="curve")
for ponto in m:
    r = 28 * ESCALA / 2
    d.ellipse([ponto[0]-r, ponto[1]-r, ponto[0]+r, ponto[1]+r], fill=AMBER)

img.save("${destino.replace(/\\/g, "/")}/marca.png")

# Biela acenando: é o gesto certo para uma boas-vindas. Reduzido para 2x da
# altura exibida (160px) e com a paleta encolhida, que nesta arte de traço não
# muda nada visível e corta o arquivo em ordens de grandeza.
biela = Image.open("public/biela/biela-acenando.png")
alvo_h = 320
biela = biela.resize((round(biela.width * alvo_h / biela.height), alvo_h), Image.LANCZOS)
# FASTOCTREE é o único método de quantização que aceita RGBA — os outros
# exigem imagem sem canal alfa, e o fundo transparente é o que faz o Biela
# assentar sobre a faixa escura do cabeçalho.
biela.convert("RGBA").quantize(colors=128, method=Image.FASTOCTREE).save(
    "${destino.replace(/\\/g, "/")}/biela.png", optimize=True)
`;

execFileSync("python3", ["-c", script], { cwd: raiz, stdio: "inherit" });

for (const nome of ["marca.png", "biela.png"]) {
  const kb = Math.round(fs.statSync(path.join(destino, nome)).size / 1024);
  console.log(`[email-assets] public/email/${nome} — ${kb} KB`);
}
