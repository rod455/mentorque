// O site não leva ao /app; o /app continua existindo.
//
// DECISÃO DO DONO (12/09/2026): "quero que exista o /app mas só consiga
// acessar se digitar completamente. Tire todas as rotas que levam até lá, mas
// continua existindo a rota." Antes disso, por algumas horas do mesmo dia,
// houve uma porteira que fechava o /app para quem não tinha conta; saiu no
// mesmo dia, por esta decisão.
//
// Dois lados, os dois precisam valer:
//   1. nenhuma página nem seção do site aponta para "/app" (link, botão,
//      redirecionamento, texto de idioma). Quem chega lá, chega digitando.
//   2. a rota existe e abre sem porteira: a página do app renderiza o
//      onboarding ou o Shell, e não uma tela de "baixe o app".
//
// Ficam de fora, de propósito: os atalhos de venda em next.config.mjs
// (/ALE100 e afins levam a /app?assinar=) e o botão do e-mail de lançamento
// (lib/email), porque não estão em página nenhuma do site: são links que o
// dono manda na conversa para quem já foi convencido. E tudo
// dentro de app/app, app/api, components/app e lib/app, que é o app falando de
// si mesmo.
//
// Rode com: npm run conferir:caminho
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const raiz = new URL("../", import.meta.url).pathname;
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => readFileSync(join(raiz, caminho), "utf8");

function arquivos(dir: string, acc: string[] = []): string[] {
  const abs = join(raiz, dir);
  if (!existsSync(abs)) return acc;
  for (const nome of readdirSync(abs)) {
    const rel = join(dir, nome);
    if (statSync(join(raiz, rel)).isDirectory()) arquivos(rel, acc);
    else if (/\.(tsx?|mjs)$/.test(nome)) acc.push(rel);
  }
  return acc;
}

console.log("Caminho: o site não leva ao /app; o /app existe para quem digita.");

// ── 1. o site não aponta para o /app ─────────────────────────────────────────
const doSite = [
  ...arquivos("components/sections"),
  ...arquivos("components/site"),
  ...arquivos("lib/site"),
  ...arquivos("lib/i18n"),
  ...arquivos("app").filter((a) => !/^app\/(app|api)\//.test(a)),
];
conferir("o varredor encontrou o site", doSite.length > 20, `só ${doSite.length} arquivos; a lista de pastas envelheceu?`);

// Um "/app" como destino: precedido de aspas, crase, parêntese ou "=", e
// seguido de fim de rota. "apps.apple.com/br/app/" e "android/app" não casam.
const destino = /["'`(=]\/app(?=[?"'`#/\s)]|$)/m;
for (const a of doSite) {
  const fonte = semComentarios(leia(a));
  const m = fonte.match(destino);
  conferir(`${a} não leva ao /app`, !m, m ? `encontrado: ${m[0]}` : "");
}

// ── 2. a rota existe e abre sem porteira ─────────────────────────────────────
conferir("a rota /app existe", existsSync(join(raiz, "app/app/page.tsx")));
const pagina = semComentarios(leia("app/app/page.tsx"));
conferir("a página do app abre o onboarding ou o Shell", /<OnboardingFlow/.test(pagina) && /<Shell/.test(pagina));
conferir("e não tem porteira", !/porteira|BaixeOApp|hostname/i.test(pagina), "a porteira de 12/09 saiu no mesmo dia, por decisão do dono");
conferir("a tela 'baixe o app' não existe mais", !existsSync(join(raiz, "components/app/BaixeOApp.tsx")));

if (falhas) {
  console.error(`\n${falhas} conferência(s) do caminho reprovaram.`);
  process.exit(1);
}
console.log(`Caminho: ${doSite.length} arquivos do site sem link para o /app; a rota segue aberta.`);
