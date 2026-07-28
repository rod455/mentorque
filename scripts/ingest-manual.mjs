#!/usr/bin/env node
/**
 * Ingest a single car manual into the Biela RAG knowledge base.
 *
 * Accepts a PDF (local path or signed URL) or a .txt file. For a whole folder,
 * use scripts/ingest-folder.mjs instead.
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest-manual.mjs --make Chevrolet --model Onix Onix.pdf
 *   node --env-file=.env.local scripts/ingest-manual.mjs --make Chevrolet --model Onix --url "https://...signed..."
 *   node scripts/ingest-manual.mjs --make Chevrolet --model Onix --dry Onix.pdf   # parse+chunk only
 *
 * Env (not needed with --dry): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 * Run supabase/migrations/0002_manuals_rag.sql + 0003_manuals_grants.sql first.
 */
import { createClient } from "@supabase/supabase-js";
import { bytesFrom, extractText, chunk, ingestManual } from "./lib/ingest.mjs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const make = opt("make");
const model = opt("model") ?? null;
const year = opt("year") ? parseInt(opt("year"), 10) : null;
const title = opt("title") ?? null;
const url = opt("url");
const dry = args.includes("--dry");
const file = args.filter((a) => !a.startsWith("--")).find((a) => a !== make && a !== model && a !== title && a !== url && a !== opt("year"));

if (!make || (!file && !url)) { console.error("Missing --make or a PDF/txt file (or --url). See header for usage."); process.exit(1); }

const { NEXT_PUBLIC_SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: KEY, OPENAI_API_KEY: OAI } = process.env;
if (!dry && (!URL || !KEY || !OAI)) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY (or pass --dry to test parsing).");
  process.exit(1);
}

async function main() {
  console.log(`Loading ${url ? "from URL" : file}...`);
  const bytes = await bytesFrom({ file, url });
  const text = await extractText(bytes);
  const chunks = chunk(text);
  console.log(`Extracted ${text.length} chars → ${chunks.length} chunks for ${make} ${model ?? ""}.`);
  console.log(`Sample chunk:\n  "${(chunks[Math.floor(chunks.length / 2)] ?? "").slice(0, 200)}..."`);

  if (dry) { console.log("\n[--dry] Skipping embeddings/insert."); return; }

  const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
  const n = await ingestManual({ supabase, openaiKey: OAI, make, model, year, title, text, replace: true, log: (m) => console.log(m) });
  console.log(`Done. ${n} chunks stored.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
