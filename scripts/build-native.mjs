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
// `@next/env` é CommonJS: o import nomeado não resolve num arquivo .mjs.
import nextEnv from "@next/env";

const root = process.cwd();

// `.env.local` é lido pelo Next lá dentro do `next build` — este script roda
// antes, no Node puro, onde ele não existe. Sem isto a conferência abaixo
// acusaria variáveis faltando mesmo com o arquivo no lugar (no CI passava
// batido, porque lá elas são variáveis de ambiente de verdade).
nextEnv.loadEnvConfig(root, false, { info: () => {}, error: console.error });
// Rotas que existem SÓ no site e não podem entrar no pacote do app.
//
// `output: "export"` exige que TUDO seja renderizável estaticamente, e nenhuma
// destas é: as rotas de API são route handlers, a LP de campanha lê
// searchParams no servidor e o painel é `force-dynamic`. Nenhuma delas faz
// sentido dentro do binário — a WebView serve só /app —, então saem do caminho
// na hora de exportar e voltam logo depois.
//
// Nasceu só com `api`. Virou lista quando /landing e /painel entraram no site e
// quebraram o build do app em silêncio: ninguém rodou `build:native` entre a
// criação delas e o envio seguinte. Rota nova de site vem para cá.
//
// As LPs de palavra-chave entram aqui pelo outro motivo: elas SÃO exportáveis
// (renderizam no servidor sem searchParams), mas são páginas de busca do site,
// escritas para quem ainda não tem o app. Dentro do binário virariam peso morto
// com links para as lojas onde a pessoa já está.
const SO_NO_SITE = ["api", "landing", "painel", "barulho-no-carro", "sobre"];
const PARK = path.join(root, ".build-native-parked");
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

// O endereço pode ser válido como URL e ainda assim não existir. Foi o que
// aconteceu com `https://mentorque.app` (que era o exemplo no .env.example e
// não resolve): o app abria normalmente e nenhuma rota respondia — Biela
// repetindo a mesma frase, FIPE mudo, revisões vazias. Como o valor fica
// EMBUTIDO no binário, o conserto exige um build novo e uma revisão da loja.
// Melhor descobrir aqui, em dois segundos.
async function checkSiteAlcancavel() {
  const cru = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!cru) return;
  // Mesma normalização de lib/app/apiBase.ts: é este o endereço que o app vai
  // chamar de verdade, então é este que precisa ser testado.
  const base = cru.replace(/\/+$/, "").replace(/^(https?:\/\/)mentorque\.com\.br/i, "$1www.mentorque.com.br");
  if (base !== cru.replace(/\/+$/, "")) log(`endereço normalizado: ${cru} → ${base}`);
  const alvo = `${base}/api/versions?make=fiat&model=argo`;
  try {
    // `redirect: "manual"` de propósito. O Node segue redirecionamento sozinho e
    // a conferência passava mesmo com o domínio respondendo 308 — enquanto no
    // aparelho o mesmo 308 mata a chamada, porque o navegador se recusa a
    // seguir redirecionamento que troca de origem num fetch. Foi assim que a
    // Biela ficou muda por dias.
    const r = await fetch(alvo, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(15000) });
    if (r.status >= 300 && r.status < 400) {
      throw new Error(
        `redireciona (${r.status}) para ${r.headers.get("location") ?? "?"}\n` +
        "  Use o endereço final, sem salto: no app um redirecionamento entre\n" +
        "  origens derruba o fetch com \"Load failed\"."
      );
    }
    if (!r.ok) throw new Error(`respondeu ${r.status}`);
    log(`site alcançável, sem redirecionamento: ${base}`);
  } catch (e) {
    const msg = `NEXT_PUBLIC_SITE_URL não respondeu: ${base}\n` +
      `  (${e instanceof Error ? e.message : e})\n\n` +
      "É de lá que o app busca TODAS as rotas /api — Biela, FIPE, revisões,\n" +
      "feedback. Com o endereço errado o app abre e não responde nada, e o\n" +
      "valor vai embutido no binário: só um build novo conserta.\n" +
      "Deve ser https://www.mentorque.com.br — com www, que é o endereço final\n" +
      "(o domínio sem www responde 308 e o app não segue esse salto).";
    if (process.env.CI) throw new Error(msg);
    log(`AVISO — ${msg}`);
  }
}

function guardarSoDoSite() {
  const guardadas = [];
  fs.mkdirSync(PARK, { recursive: true });
  for (const nome of SO_NO_SITE) {
    const de = path.join(root, "app", nome);
    if (!fs.existsSync(de)) continue;
    fs.renameSync(de, path.join(PARK, nome));
    guardadas.push(nome);
  }
  log(`fora da exportação: ${guardadas.map((n) => `app/${n}`).join(", ") || "nada"}`);
}

function restoreApi() {
  if (!fs.existsSync(PARK)) return;
  const nomes = fs.readdirSync(PARK);
  for (const nome of nomes) {
    const para = path.join(root, "app", nome);
    fs.rmSync(para, { recursive: true, force: true });
    fs.renameSync(path.join(PARK, nome), para);
  }
  fs.rmSync(PARK, { recursive: true, force: true });
  if (nomes.length) log(`devolvido: ${nomes.map((n) => `app/${n}`).join(", ")}`);
}

// Qualquer saída (erro, Ctrl+C) precisa devolver as rotas — senão o repositório
// fica quebrado e o build da Vercel vai junto.
process.on("exit", restoreApi);
process.on("SIGINT", () => { restoreApi(); process.exit(130); });
process.on("SIGTERM", () => { restoreApi(); process.exit(143); });

checkEnv();
await checkSiteAlcancavel();

try {
  if (fs.existsSync(PARK)) {
    throw new Error(
      ".build-native-parked já existe — um build anterior morreu no meio.\n" +
      "  Devolva o que está lá para dentro de app/ antes de seguir."
    );
  }

  guardarSoDoSite();

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

// Somado em Node, não com `du`: o build também roda no Windows (Android Studio
// na máquina do desenvolvedor), onde `du` não existe — e derrubava o script
// depois de o pacote já estar pronto, com um erro que não dizia isso.
function tamanho(dir) {
  let total = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const alvo = path.join(dir, e.name);
    total += e.isDirectory() ? tamanho(alvo) : fs.statSync(alvo).size;
  }
  return total;
}
log(`pronto — native/app (${Math.round(tamanho(DEST) / 1024 / 1024)} MB)`);
