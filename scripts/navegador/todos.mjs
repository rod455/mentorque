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

const SUITES = ["telas", "sintoma", "pos-conta", "quiz", "historico", "calendario", "conta", "suporte", "primeiro-quiz", "km", "selo", "carro", "moto", "porta", "foto", "avisos", "venda", "site", "erros", "orcamento", "combustivel", "datas", "motorista", "apresentacao"];

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

// O SUPABASE DE MENTIRA (26/10/2026). Sem as variáveis públicas do Supabase o
// app roda como convidado puro, e nenhuma suíte alcança o que acontece DEPOIS
// do login (a volta ao paywall de quem foi parado pela conta, por exemplo). A
// suíte que exporta `supabaseFalso = true` roda num servidor subido com um
// endereço que não existe; ela mesma responde as chamadas dele no navegador,
// então nada sai da máquina e nenhuma conta de verdade é criada. As outras
// suítes continuam no servidor de sempre, porque ligar o login para todas
// mudaria o ambiente de 23 suítes de uma vez.
export const SUPABASE_FALSO = {
  NEXT_PUBLIC_SUPABASE_URL: "https://falso.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "chave-falsa-de-teste",
};

async function subirServidor(env = {}) {
  console.log(`Subindo o servidor de desenvolvimento${Object.keys(env).length ? " com o Supabase de mentira" : ""}...`);
  const p = spawn("npm", ["run", "dev"], { stdio: "ignore", detached: true, env: { ...process.env, ...env } });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    if (await noAr()) return p;
  }
  try { process.kill(-p.pid); } catch { /* já morreu */ }
  throw new Error("o servidor não subiu em 2 minutos");
}

// ---- execução --------------------------------------------------------------

const modulos = new Map();
for (const alvo of alvos) modulos.set(alvo, await import(`./${alvo}.mjs`));
const comumAlvos = alvos.filter((a) => !modulos.get(a).supabaseFalso);
const falsoAlvos = alvos.filter((a) => modulos.get(a).supabaseFalso);

let servidor = null;
let servidorDeFora = false;
if (await noAr()) {
  servidorDeFora = true;
  console.log(`Usando o servidor já de pé em ${BASE}`);
} else {
  servidor = await subirServidor(comumAlvos.length ? {} : SUPABASE_FALSO);
}

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

async function rodarSuite(alvo) {
  const suite = modulos.get(alvo);
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

for (const alvo of comumAlvos) await rodarSuite(alvo);

// As suítes do Supabase de mentira. Com servidor nosso, troca de servidor;
// com servidor de fora, não dá para saber com que variáveis ele subiu, e a
// suíte REPROVA dizendo por quê, em vez de passar ou pular calada.
if (falsoAlvos.length) {
  if (servidorDeFora) {
    for (const alvo of falsoAlvos) {
      const msg = "precisa do servidor com o Supabase de mentira: derrube o servidor de pé e rode de novo";
      console.log(`\n▸ ${modulos.get(alvo).nome}\n  ✗ ${msg}`);
      falhasTotais.push(`${modulos.get(alvo).nome}: ${msg}`);
    }
  } else {
    if (comumAlvos.length) {
      try { process.kill(-servidor.pid); } catch { /* ok */ }
      for (let i = 0; i < 20 && (await noAr()); i++) await new Promise((r) => setTimeout(r, 500));
      servidor = await subirServidor(SUPABASE_FALSO);
    }
    for (const alvo of falsoAlvos) await rodarSuite(alvo);
  }
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
