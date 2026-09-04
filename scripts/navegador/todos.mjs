// Roda as conferências de navegador.
//
//   npm run conferir:navegador           todas
//   npm run conferir:navegador quiz km   só essas
//
// Sobe o servidor de desenvolvimento sozinho quando não há um de pé, e o
// derruba no final. Isso é de propósito: uma conferência que exige dois
// terminais e a ordem certa entre eles é uma conferência que ninguém roda.

import { spawn } from "node:child_process";
import { BASE, abrirNavegador, conferidor } from "./base.mjs";

const SUITES = ["telas", "quiz", "historico", "calendario", "conta", "primeiro-quiz", "km", "selo", "carro", "avisos", "venda", "site", "erros"];

const pedidas = process.argv.slice(2);
const desconhecida = pedidas.find((p) => !SUITES.includes(p));
if (desconhecida) {
  console.error(`Suíte desconhecida: ${desconhecida}\nDisponíveis: ${SUITES.join(", ")}`);
  process.exit(2);
}
const alvos = pedidas.length ? pedidas : SUITES;

// ---- o servidor ------------------------------------------------------------

async function noAr() {
  try {
    const r = await fetch(BASE + "/app", { signal: AbortSignal.timeout(2500) });
    return r.ok;
  } catch {
    return false;
  }
}

async function subirServidor() {
  console.log("Subindo o servidor de desenvolvimento...");
  const p = spawn("npm", ["run", "dev"], { stdio: "ignore", detached: true });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    if (await noAr()) return p;
  }
  try { process.kill(-p.pid); } catch { /* já morreu */ }
  throw new Error("o servidor não subiu em 2 minutos");
}

// ---- execução --------------------------------------------------------------

let servidor = null;
if (!(await noAr())) servidor = await subirServidor();
else console.log(`Usando o servidor já de pé em ${BASE}`);

let nav;
try {
  nav = await abrirNavegador();
} catch (e) {
  console.error(
    "\nNão consegui abrir o Chromium. O Playwright não faz parte das dependências\n" +
      "do projeto de propósito (ele puxaria o download de navegadores para dentro do\n" +
      "build da Vercel). Para rodar as conferências:\n\n" +
      "  npm i --no-save playwright\n\n" +
      `Detalhe: ${e.message}`
  );
  if (servidor) try { process.kill(-servidor.pid); } catch { /* ok */ }
  process.exit(2);
}

const falhasTotais = [];
const inicio = Date.now();

for (const alvo of alvos) {
  const suite = await import(`./${alvo}.mjs`);
  console.log(`\n▸ ${suite.nome} — ${suite.sobre}`);
  const { ok, falhas } = conferidor();
  try {
    await suite.rodar({ nav, ok });
  } catch (e) {
    falhas.push(`a suíte quebrou: ${e.message}`);
    console.log(`  ✗ a suíte quebrou: ${e.message}`);
  }
  falhasTotais.push(...falhas.map((f) => `${suite.nome}: ${f}`));
}

await nav.close();
if (servidor) try { process.kill(-servidor.pid); } catch { /* ok */ }

const segundos = Math.round((Date.now() - inicio) / 1000);
if (falhasTotais.length) {
  console.log(`\n${falhasTotais.length} conferência(s) falharam em ${segundos}s:`);
  for (const f of falhasTotais) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`\nTudo conferido em ${segundos}s.`);
