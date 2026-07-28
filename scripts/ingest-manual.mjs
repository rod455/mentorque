#!/usr/bin/env node
/**
 * Ingest a car manual into the Biela RAG knowledge base.
 *
 * Accepts a PDF (local path or signed URL) or a .txt file. Splits it into
 * ~800-char chunks, embeds each with OpenAI text-embedding-3-small, and inserts
 * them into `manuals` / `manual_chunks`.
 *
 * Usage:
 *   node scripts/ingest-manual.mjs --make Chevrolet --model Onix Onix.pdf
 *   node scripts/ingest-manual.mjs --make Chevrolet --model Onix --url "https://...signed-url..."
 *   node scripts/ingest-manual.mjs --make Chevrolet --model Onix --dry Onix.pdf   # parse+chunk only
 *
 * Env (not needed with --dry): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 * Run supabase/migrations/0002_manuals_rag.sql first.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const has = (name) => args.includes(`--${name}`);
const make = opt("make");
const model = opt("model") ?? null;
const title = opt("title") ?? null;
const url = opt("url");
const dry = has("dry");
const file = args.filter((a) => !a.startsWith("--")).find((a) => a !== make && a !== model && a !== title && a !== url);

if (!make || (!file && !url)) { console.error("Missing --make or a PDF/txt file (or --url). See header for usage."); process.exit(1); }

const { NEXT_PUBLIC_SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: KEY, OPENAI_API_KEY: OAI } = process.env;
if (!dry && (!URL || !KEY || !OAI)) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY (or pass --dry to test parsing).");
  process.exit(1);
}

async function loadBytes() {
  if (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  return new Uint8Array(readFileSync(file));
}

async function extractText(bytes) {
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // "%PDF"
  if (!isPdf) return Buffer.from(bytes).toString("utf8");
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

// ~800-char chunks on paragraph boundaries; drops tiny/noise fragments.
function chunk(text, size = 800) {
  const clean = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n");
  const parts = clean.split(/\n{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p.length > 20);
  const out = [];
  let buf = "";
  for (const p of parts) {
    if ((buf + " " + p).length > size && buf) { out.push(buf); buf = p; }
    else buf = buf ? buf + " " + p : p;
  }
  if (buf) out.push(buf);
  return out;
}

async function embed(input) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${OAI}` },
    body: JSON.stringify({ model: "text-embedding-3-small", input }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${await res.text()}`);
  return (await res.json()).data.map((d) => d.embedding);
}

async function main() {
  console.log(`Loading ${url ? "from URL" : file}...`);
  const bytes = await loadBytes();
  const text = await extractText(bytes);
  const chunks = chunk(text);
  console.log(`Extracted ${text.length} chars → ${chunks.length} chunks for ${make} ${model ?? ""}.`);
  console.log(`Sample chunk:\n  "${(chunks[Math.floor(chunks.length / 2)] ?? "").slice(0, 200)}..."`);

  if (dry) { console.log("\n[--dry] Skipping embeddings/insert."); return; }

  const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
  const { data: manual, error: mErr } = await supabase
    .from("manuals").insert({ make, model, title }).select("id").single();
  if (mErr) throw mErr;

  for (let i = 0; i < chunks.length; i += 64) {
    const batch = chunks.slice(i, i + 64);
    const embeddings = await embed(batch);
    const rows = batch.map((content, j) => ({ manual_id: manual.id, make, model, content, embedding: embeddings[j] }));
    const { error } = await supabase.from("manual_chunks").insert(rows);
    if (error) throw error;
    console.log(`  inserted ${Math.min(i + 64, chunks.length)}/${chunks.length}`);
  }
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
