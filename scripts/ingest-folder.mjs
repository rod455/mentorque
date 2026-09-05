#!/usr/bin/env node
/**
 * Batch-ingest a whole folder of manuals into the Biela RAG.
 *
 * Name each PDF as `Make_Model_Year.pdf` (the trailing 4-digit year is
 * optional) using the SAME make/model spelling the app uses. Examples:
 *   Fiat_Strada_2022.pdf
 *   Volkswagen_T-Cross_2025.pdf
 *   Hyundai_HB20_2023.pdf
 *   Chevrolet_Onix.pdf            (no year)
 * A `Make__Model__Year.pdf` (double underscore) form is also accepted for
 * models whose name has spaces.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest-folder.mjs ./manuais
 *   node --env-file=.env.local scripts/ingest-folder.mjs --dry ./manuais   # parse only, no cost
 *
 * Re-running replaces a manual's chunks for that year (no duplicates); different
 * years of the same model coexist. One bad file doesn't stop the batch.
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { bytesFrom, extractText, chunk, ingestManual } from "./lib/ingest.mjs";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const dir = args.find((a) => !a.startsWith("--"));
if (!dir) { console.error("Usage: node scripts/ingest-folder.mjs [--dry] ./folder"); process.exit(1); }

const { NEXT_PUBLIC_SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: KEY, OPENAI_API_KEY: OAI } = process.env;
if (!dry) {
  // Dizer QUAIS faltam, não as três de novo. O ensaio (--dry) não usa nenhuma
  // delas, então quem chega aqui já rodou o ensaio com sucesso e acha que está
  // tudo configurado: a lista genérica manda a pessoa reconferir as três, e a
  // que falta costuma ser uma só.
  const faltando = [
    !URL && "NEXT_PUBLIC_SUPABASE_URL",
    !KEY && "SUPABASE_SERVICE_ROLE_KEY",
    !OAI && "OPENAI_API_KEY",
  ].filter(Boolean);
  if (faltando.length) {
    console.error(
      `${faltando.length === 1 ? "Falta esta variável" : "Faltam estas variáveis"} no .env.local: ${faltando.join(", ")}.\n` +
        `\nPara ver só os NOMES do que já existe lá (sem mostrar valor nenhum):\n` +
        `  Get-Content .env.local | ForEach-Object { ($_ -split '=')[0] }\n` +
        `\nO jeito de trazer o que falta, sem copiar segredo à mão:\n` +
        `  vercel env pull .env.local\n` +
        `\nOu rode com --dry, que lê os arquivos sem escrever nada e não precisa de chave.`
    );
    process.exit(1);
  }
}

// "Make_Model_Year.pdf" (or "Make__Model__Year.pdf") -> { make, model, year }.
// The trailing 4-digit part, if present, is the year.
function parseName(fname) {
  const stem = basename(fname, extname(fname));
  let make, model, year = null;
  if (stem.includes("__")) {
    const p = stem.split("__").map((s) => s.trim()).filter(Boolean);
    if (p.length && /^\d{4}$/.test(p[p.length - 1])) year = parseInt(p.pop(), 10);
    make = p[0];
    model = p.slice(1).join(" ") || null;
  } else {
    const p = stem.split("_").map((s) => s.trim()).filter(Boolean);
    if (p.length && /^\d{4}$/.test(p[p.length - 1])) year = parseInt(p.pop(), 10);
    make = p[0];
    model = p.slice(1).join(" ") || null;
  }
  return { make, model, year, title: stem };
}

// O CATÁLOGO DO APP, para avisar sobre manual que ninguém vai alcançar.
//
// POR QUE ISTO EXISTE (05/09/2026). A busca (match_manual_chunks) filtra marca
// e modelo NO DURO: só o ano é aproximado. Então um manual cujo modelo não
// existe em "Adicionar carro" nunca é consultado por ninguém, e a falha é
// silenciosa dos dois lados: a ingestão diz "✓ 300 chunks" e a Biela responde
// no genérico para sempre.
//
// Aconteceu no primeiro lote de verdade: dos 27 manuais, o Fiat Bravo não
// estava no catálogo. O aviso é aqui, ANTES de gastar token de embedding, e é
// aviso e não recusa: pode haver motivo para subir um manual antes do modelo
// entrar na lista. Só não pode ser por engano.
//
// Repare que o caminho é montado com `join`, e NÃO com `new URL`: a linha do
// topo faz `const { NEXT_PUBLIC_SUPABASE_URL: URL }`, que sombreia o `URL`
// global do Node. `new URL(...)` aqui dentro estoura "not a constructor", e na
// primeira versão o `catch` engolia isso e devolvia `null`, ou seja, o aviso
// nunca saía para ninguém. Foi pego plantando um modelo inventado no lote de
// teste e vendo a ingestão aprovar calada.
function catalogoDoApp() {
  try {
    const fonte = readFileSync(join(import.meta.dirname, "../lib/app/conteudo/veiculos.ts"), "utf8");
    const bloco = fonte.match(/const modelsByMake[^=]*= \{([\s\S]*?)\n\};/);
    if (!bloco) {
      console.warn("⚠️  não consegui ler modelsByMake em veiculos.ts: sigo sem conferir o catálogo.");
      return null;
    }
    const chaves = new Set();
    for (const linha of bloco[1].split("\n")) {
      const m = linha.match(/^\s*"?([^":]+)"?:\s*\[(.*)\],\s*$/);
      if (!m) continue;
      const marca = m[1].replace(/"/g, "").trim();
      for (const mod of m[2].split(",").map((x) => x.trim().replace(/^"|"$/g, "")).filter(Boolean)) {
        chaves.add(normaliza(marca) + "|" + normaliza(mod));
      }
    }
    return chaves.size ? chaves : null;
  } catch (e) {
    // Reportar em vez de engolir: foi um catch mudo aqui que escondeu o
    // sombreamento do URL e deixou o aviso desligado sem ninguém saber.
    console.warn(`⚠️  não consegui ler o catálogo de veículos (${e.message}): sigo sem conferir.`);
    return null;
  }
}
/** A mesma normalização que match_manual_chunks usa do lado do banco. */
const normaliza = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Abaixo disto não é manual inteiro, é pedaço.
 *
 * O aviso de "empty — scanned?" só pega o caso extremo, zero caractere. O caso
 * traiçoeiro é o do MEIO, e ele apareceu no primeiro lote de verdade: entre 28
 * manuais que extraíram de 196 mil a 412 mil caracteres, o Ford Fiesta 2018
 * extraiu 11.120. Três pedaços contra os 250 dos irmãos.
 *
 * Isso entra no banco sem reclamar e é PIOR que não ter: o modelo passa a
 * contar como coberto, a busca acha os três pedaços, e a Biela responde com
 * uma confiança que não tem lastro. Manual faltando a gente vê na lista de
 * cobertura; manual pela metade, não.
 *
 * 30 mil caracteres é folgado para baixo de propósito: é cerca de 15 páginas,
 * menos do que qualquer manual de fábrica e o triplo do arquivo problemático.
 * A causa costuma ser PDF só de imagem com umas poucas páginas de texto, ou
 * suplemento em vez do manual.
 */
const MINIMO_DE_MANUAL = 30000;

async function main() {
  // Pasta que não existe dava uma pilha de ENOENT do readdirSync, com sete
  // linhas de node:internal e nenhuma pista do que fazer. Quem roda isto está
  // com a pasta de manuais aberta na tela, não lendo stack trace.
  let files;
  try {
    files = readdirSync(dir).filter((f) => /\.(pdf|txt)$/i.test(f)).sort();
  } catch (e) {
    console.error(
      e.code === "ENOENT"
        ? `A pasta "${dir}" não existe.\n` +
          `Passe o caminho onde os PDFs estão de verdade, entre aspas se tiver espaço:\n` +
          `  node --env-file=.env.local scripts/ingest-folder.mjs --dry "C:\\Users\\voce\\Downloads\\manuais"`
        : `Não consegui ler a pasta "${dir}": ${e.message}`
    );
    process.exit(1);
  }
  if (files.length === 0) { console.error(`Nenhum .pdf ou .txt em ${dir}`); process.exit(1); }
  console.log(`Found ${files.length} file(s) in ${dir}${dry ? " (dry run)" : ""}.\n`);

  const catalogo = catalogoDoApp();
  const foraDoCatalogo = [];
  const curtos = [];

  const supabase = dry ? null : createClient(URL, KEY, { auth: { persistSession: false } });
  const ok = [], skipped = [], failed = [];

  for (const f of files) {
    const { make, model, year, title } = parseName(f);
    if (!make || !model) {
      console.warn(`⚠️  Skipping "${f}" — name must be Make_Model_Year.pdf`);
      skipped.push(f);
      continue;
    }
    const tag = `${make} ${model}${year ? " " + year : ""}`;
    if (catalogo && !catalogo.has(normaliza(make) + "|" + normaliza(model))) {
      console.warn(
        `⚠️  "${make} ${model}" não está em lib/app/conteudo/veiculos.ts.\n` +
          `    A busca filtra marca e modelo no duro, então ninguém vai conseguir\n` +
          `    cadastrar esse carro e este manual nunca vai ser consultado.`
      );
      foraDoCatalogo.push(tag);
    }
    try {
      const bytes = await bytesFrom({ file: join(dir, f) });
      const text = await extractText(bytes);
      const curto = text.length > 0 && text.length < MINIMO_DE_MANUAL;
      if (curto) curtos.push(`${tag} (${text.length} chars)`);
      if (dry) {
        const n = chunk(text).length;
        const alerta = n === 0 ? "⚠️ (vazio — escaneado?)" : curto ? "⚠️ (curto demais para um manual inteiro)" : "";
        console.log(`• ${tag}: ${text.length} chars → ${n} chunks ${alerta}`);
        ok.push(f);
        continue;
      }
      process.stdout.write(`• ${tag}: ingesting... `);
      const n = await ingestManual({ supabase, openaiKey: OAI, make, model, year, title, text, replace: true });
      console.log(`${n} chunks ✓`);
      ok.push(f);
    } catch (e) {
      console.log(`\n  ✗ ${f}: ${e.message}`);
      failed.push(f);
    }
  }

  console.log(`\nDone. ${ok.length} ok, ${skipped.length} skipped, ${failed.length} failed.`);
  if (foraDoCatalogo.length) {
    console.warn(
      `\n⚠️  ${foraDoCatalogo.length} manual(is) de modelo que não está no catálogo: ${foraDoCatalogo.join(", ")}.\n` +
        `    Enquanto o modelo não entrar em lib/app/conteudo/veiculos.ts (e a conferir:frota passar),\n` +
        `    ninguém consegue cadastrar esse carro e o manual fica inalcançável.`
    );
  }
  if (curtos.length) {
    console.warn(
      `\n⚠️  ${curtos.length} arquivo(s) com menos de ${MINIMO_DE_MANUAL} caracteres: ${curtos.join(", ")}.\n` +
        `    Manual de fábrica não é tão curto. Costuma ser PDF só de imagem com poucas\n` +
        `    páginas de texto, ou suplemento em vez do manual. Subir assim é pior que\n` +
        `    não subir: o modelo passa a contar como coberto e a Biela responde com\n` +
        `    confiança que não tem lastro.`
    );
  }
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
