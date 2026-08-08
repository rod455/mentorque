// Gera o pacote que vai DENTRO do app das lojas.
//
// O site na Vercel continua sendo um app Next completo, com rotas de API. Já a
// versão do app precisa ser puramente estática, porque roda de dentro do
// binário, sem servidor. `output: "export"` do Next faz isso — mas ele recusa
// exportar um projeto que tenha route handlers.
//
// Então aqui: tiramos `app/api` do caminho, exportamos, e devolvemos. As APIs
// seguem existindo só no build da Vercel; o app nativo chama elas por URL
// absoluta (ver lib/app/apiBase.ts).
//
// Saída: native/app/ — é o `webDir` do capacitor.config.ts.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const API = path.join(root, "app", "api");
const API_PARKED = path.join(root, ".api-parked");
// Com `distDir` customizado, `output: "export"` grava o HTML dentro do próprio
// distDir em vez de `out/`.
const OUT = path.join(root, ".next-native");
const DEST = path.join(root, "native", "app");

const log = (m) => console.log(`[build:native] ${m}`);

function restoreApi() {
  if (fs.existsSync(API_PARKED)) {
    fs.rmSync(API, { recursive: true, force: true });
    fs.renameSync(API_PARKED, API);
    log("app/api devolvido");
  }
}

// Qualquer saída (erro, Ctrl+C) precisa devolver app/api — senão o repositório
// fica quebrado e o build da Vercel vai junto.
process.on("exit", restoreApi);
process.on("SIGINT", () => { restoreApi(); process.exit(130); });
process.on("SIGTERM", () => { restoreApi(); process.exit(143); });

try {
  if (fs.existsSync(API_PARKED)) {
    throw new Error(".api-parked já existe — um build anterior morreu no meio. Devolva app/api antes de seguir.");
  }

  log("guardando app/api fora do caminho da exportação");
  fs.renameSync(API, API_PARKED);

  log("exportando o app estático");
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "native" },
  });
} finally {
  restoreApi();
}

const outDir = fs.existsSync(path.join(root, "out", "app", "index.html")) ? path.join(root, "out") : OUT;
if (!fs.existsSync(path.join(outDir, "app", "index.html"))) {
  throw new Error(`exportação não produziu ${outDir}/app/index.html`);
}

log(`copiando ${path.relative(root, outDir)} → native/app`);
fs.rmSync(DEST, { recursive: true, force: true });
// Só o que a WebView serve. `cache/` e afins do distDir ficam de fora — são
// artefatos de build e engordariam o binário à toa.
fs.mkdirSync(DEST, { recursive: true });
for (const entry of fs.readdirSync(outDir)) {
  if (entry === "cache" || entry === "server" || entry.startsWith("BUILD_ID") || entry.endsWith(".json")) continue;
  fs.cpSync(path.join(outDir, entry), path.join(DEST, entry), { recursive: true });
}

// A WebView abre o index.html da raiz do webDir. O app mora em /app/, então a
// raiz redireciona para lá. É navegação na MESMA origem (capacitor://localhost),
// então continua dentro do app — diferente do wrapper antigo, que apontava para
// uma URL https e por isso escapava para o Safari.
fs.writeFileSync(
  path.join(DEST, "index.html"),
  `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Mentorque</title>
    <style>html,body{height:100%;margin:0;background:#16181d}</style>
    <script>location.replace("./app/");</script>
  </head>
  <body></body>
</html>
`
);

const size = execSync(`du -sh ${DEST}`).toString().split("\t")[0];
log(`pronto — native/app (${size})`);
