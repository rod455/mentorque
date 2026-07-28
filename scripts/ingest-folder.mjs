#!/usr/bin/env node
/**
 * Batch-ingest a whole folder of manuals into the Biela RAG.
 *
 * Name each PDF as `Make__Model.pdf` (double underscore between make and model)
 * using the SAME make/model spelling the app uses. Examples:
 *   Chevrolet__Onix.pdf
 *   Hyundai__HB20.pdf
 *   Volkswagen__T-Cross.pdf
 *   Toyota__Corolla Cross.pdf
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest-folder.mjs ./manuais
 *   node --env-file=.env.local scripts/ingest-folder.mjs --dry ./manuais   # parse only, no cost
 *
 * Re-running replaces a manual's chunks (no duplicates). One bad file doesn't
 * stop the batch. Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */
import { readdirSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { bytesFrom, extractText, chunk, ingestManual } from "./lib/ingest.mjs";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const dir = args.find((a) => !a.startsWith("--"));
if (!dir) { console.error("Usage: node scripts/ingest-folder.mjs [--dry] ./folder"); process.exit(1); }

const { NEXT_PUBLIC_SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: KEY, OPENAI_API_KEY: OAI } = process.env;
if (!dry && (!URL || !KEY || !OAI)) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY (or pass --dry).");
  process.exit(1);
}

// "Make__Model.pdf" -> { make, model }
function parseName(fname) {
  const stem = basename(fname, extname(fname));
  const parts = stem.split("__").map((s) => s.trim()).filter(Boolean);
  return { make: parts[0], model: parts[1] ?? null, title: stem };
}

async function main() {
  const files = readdirSync(dir).filter((f) => /\.(pdf|txt)$/i.test(f)).sort();
  if (files.length === 0) { console.error(`No .pdf/.txt files in ${dir}`); process.exit(1); }
  console.log(`Found ${files.length} file(s) in ${dir}${dry ? " (dry run)" : ""}.\n`);

  const supabase = dry ? null : createClient(URL, KEY, { auth: { persistSession: false } });
  const ok = [], skipped = [], failed = [];

  for (const f of files) {
    const { make, model, title } = parseName(f);
    if (!make || !model) {
      console.warn(`⚠️  Skipping "${f}" — name must be Make__Model.pdf`);
      skipped.push(f);
      continue;
    }
    try {
      const bytes = await bytesFrom({ file: join(dir, f) });
      const text = await extractText(bytes);
      if (dry) {
        const n = chunk(text).length;
        console.log(`• ${make} ${model}: ${text.length} chars → ${n} chunks ${n === 0 ? "⚠️ (empty — scanned?)" : ""}`);
        ok.push(f);
        continue;
      }
      process.stdout.write(`• ${make} ${model}: ingesting... `);
      const n = await ingestManual({ supabase, openaiKey: OAI, make, model, title, text, replace: true });
      console.log(`${n} chunks ✓`);
      ok.push(f);
    } catch (e) {
      console.log(`\n  ✗ ${f}: ${e.message}`);
      failed.push(f);
    }
  }

  console.log(`\nDone. ${ok.length} ok, ${skipped.length} skipped, ${failed.length} failed.`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
