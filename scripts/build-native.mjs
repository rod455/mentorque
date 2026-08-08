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

// Variáveis que ficam EMBUTIDAS no pacote. Se faltar alguma, o build continua
// passando e o .ipa sobe normalmente — o estrago só aparece no aparelho, com
// login morto ou paywall vazio. Melhor quebrar aqui, com o nome do que faltou.
const REQUIRED = {
  NEXT_PUBLIC_SUPABASE_URL: "login e banco de dados",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "login e banco de dados",
  NEXT_PUBLIC_SITE_URL: "para onde o app manda os fetch de /api",
  NEXT_PUBLIC_REVENUECAT_IOS_KEY: "assinatura pela Apple",
};

// O client id do Google não entra nesta lista: ele é público e mora no código
// (lib/app/socialLogin.ts), justamente para não existir build sem ele.
function checkEnv() {
  const missing = Object.entries(REQUIRED).filter(([k]) => !process.env[k]?.trim());
  if (!missing.length) {
    log(`variáveis do pacote: ${Object.keys(REQUIRED).length}/${Object.keys(REQUIRED).length} presentes`);
    // O erro clássico é trocar SITE_URL pela URL do Supabase — aí todo fetch
    // de /api vai para um domínio que não tem essas rotas.
    if (/supabase\.co/i.test(process.env.NEXT_PUBLIC_SITE_URL ?? "")) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL está apontando para o Supabase. Deve ser o site do app " +
        "(ex.: https://mentorque.com.br) — é de lá que vêm as rotas /api."
      );
    }
    // Endereço sem esquema (ou com espaço colado) só estoura lá na frente, no
    // meio da pré-renderização, com uma mensagem que não diz qual variável é.
    for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SITE_URL"]) {
      const raw = process.env[k].trim();
      let ok = false;
      try { ok = /^https?:$/.test(new URL(raw).protocol); } catch { ok = false; }
      if (!ok) {
        throw new Error(
          `${k} não é uma URL válida: "${raw}"\n` +
          "Precisa começar com https:// e não pode ter espaço nem barra sobrando.\n" +
          (k.includes("SUPABASE")
            ? "Ex.: https://ajaxhsvjvmqtiyzelgrd.supabase.co"
            : "Ex.: https://mentorque.com.br")
        );
      }
    }
    return;
  }
  const lista = missing.map(([k, uso]) => `  - ${k}  (${uso})`).join("\n");
  const msg = `faltam variáveis de ambiente no build:\n${lista}\n\n` +
    "No Codemagic: Applications → Mentorque → Environment variables, com\n" +
    '"Mentorque" no campo de grupo.';
  // Em CI isso é fatal. Localmente segue, para dar para testar o empacotamento.
  if (process.env.CI) throw new Error(msg);
  log(`AVISO — ${msg}`);
}

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

checkEnv();

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

// O app tem que SER o index.html da raiz.
//
// O roteador do Capacitor no iOS (Router.swift) resolve assim:
//
//     if pathUrl.pathExtension.isEmpty { return basePath + "/index.html" }
//
// Ou seja, TODO caminho sem extensão devolve o index.html da raiz — é o
// comportamento clássico de SPA. Uma primeira versão daqui punha na raiz um
// redirecionamento para "./app/"; como "/app/" também não tem extensão, o
// Capacitor devolvia a raiz de novo e o app entrava em laço infinito: tela
// preta, sem nem chegar na splash.
//
// Copiando o HTML do app para a raiz, qualquer rota cai direto nele. A landing
// exportada em "/" é substituída de propósito: ela é do site, não do app.
fs.copyFileSync(path.join(DEST, "app", "index.html"), path.join(DEST, "index.html"));

const size = execSync(`du -sh ${DEST}`).toString().split("\t")[0];
log(`pronto — native/app (${size})`);
