// Gera as camadas do ícone adaptativo do Android a partir de public/logo/mark.svg.
//
// O ícone adaptativo tem duas camadas de 108dp que o launcher recorta com a
// máscara do aparelho (círculo, quadrado arredondado, gota…). A regra é:
//
//   fundo   → preenche os 108dp INTEIROS. É o que aparece nos cantos.
//   frente  → só a marca, dentro dos 66dp centrais (a "zona segura"), porque
//             tudo fora disso pode ser cortado pela máscara.
//
// O que existia aqui violava as duas: a frente trazia o quadrado escuro inteiro
// com a marca dentro, o fundo era branco, e o XML encolhia AS DUAS em 16.7%.
// Na tela isso virava um quadradinho escuro flutuando, com uma tira branca
// escapando por baixo e transparência em toda a volta.
//
// Uso (o Playwright não é dependência do projeto — é só desta ferramenta):
//   npx --yes playwright@1.56 node scripts/android-icons.mjs
// ou, com o Playwright instalado global:
//   node --experimental-default-type=module scripts/android-icons.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// Resolvido em tempo de execução para o arquivo não quebrar `npm ci` de quem
// nunca vai gerar ícone.
const require_ = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require_("playwright"));
} catch {
  console.error("[icones] Playwright não encontrado. Rode: npm i --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

const GRAFITE = "#16181D";
// Marca ocupando 62% do lado: dentro da zona segura (66%) com uma folga que
// evita encostar na borda da máscara mais agressiva.
const OCUPACAO = 0.62;

// Lado da camada adaptativa (108dp) por densidade.
const DENSIDADES = {
  "mipmap-ldpi": 81,
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
};

const raiz = process.cwd();
const RES = path.join(raiz, "android", "app", "src", "main", "res");
const svg = fs.readFileSync(path.join(raiz, "public", "logo", "mark.svg"), "utf8");

const navegador = await chromium.launch();
const pagina = await (await navegador.newContext({ deviceScaleFactor: 1 })).newPage();

for (const [pasta, lado] of Object.entries(DENSIDADES)) {
  const destino = path.join(RES, pasta);
  if (!fs.existsSync(destino)) continue;

  // Fundo: cor chapada, sem recorte nenhum.
  await pagina.setViewportSize({ width: lado, height: lado });
  await pagina.setContent(
    `<body style="margin:0;width:${lado}px;height:${lado}px;background:${GRAFITE}"></body>`
  );
  fs.writeFileSync(path.join(destino, "ic_launcher_background.png"), await pagina.screenshot());

  // Frente: a marca centrada e transparente em volta.
  const marca = Math.round(lado * OCUPACAO);
  await pagina.setContent(
    `<body style="margin:0;width:${lado}px;height:${lado}px;display:grid;place-items:center;background:transparent">
       <div style="width:${marca}px;height:${marca}px">${svg.replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"')}</div>
     </body>`
  );
  fs.writeFileSync(
    path.join(destino, "ic_launcher_foreground.png"),
    await pagina.screenshot({ omitBackground: true })
  );

  console.log(`[icones] ${pasta}: fundo e frente em ${lado}x${lado} (marca ${marca}px)`);
}

await navegador.close();
