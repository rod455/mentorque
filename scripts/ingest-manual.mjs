#!/usr/bin/env node
/**
 * Ingest a car manual into the Biela RAG knowledge base.
 *
 * Usage:
 *   node scripts/ingest-manual.mjs --make Chevrolet --model Onix [--title "Onix 2020"] path/to/manual.txt
 *
 * Input is plain text (extract it from the PDF first, e.g. `pdftotext`). The
 * script splits it into ~800-char chunks, embeds each with OpenAI
 * text-embedding-3-small, and inserts them into `manuals` / `manual_chunks`.
 *
 * Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 * Run the 0002_manuals_rag.sql migration first.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const make = opt("make");
const model = opt("model") ?? null;
const title = opt("title") ?? null;
const file = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1]?.startsWith("--") === false) ?? args[args.length - 1];

const { NEXT_PUBLIC_SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: KEY, OPENAI_API_KEY: OAI } = process.env;
if (!make || !file) { console.error("Missing --make or file path. See header for usage."); process.exit(1); }
if (!URL || !KEY || !OAI) { console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY"); process.exit(1); }

// ~800-char chunks on paragraph/sentence boundaries.
function chunk(text, size = 800) {
  const parts = text.replace(/\r/g, "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const out = [];
  let buf = "";
  for (const p of parts) {
    if ((buf + "\n\n" + p).length > size && buf) { out.push(buf); buf = p; }
    else buf = buf ? buf + "\n\n" + p : p;
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
  const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
  const text = readFileSync(file, "utf8");
  const chunks = chunk(text);
  console.log(`Ingesting ${chunks.length} chunks for ${make} ${model ?? ""}...`);

  const { data: manual, error: mErr } = await supabase
    .from("manuals").insert({ make, model, title }).select("id").single();
  if (mErr) throw mErr;

  // Embed + insert in batches of 64.
  for (let i = 0; i < chunks.length; i += 64) {
    const batch = chunks.slice(i, i + 64);
    const embeddings = await embed(batch);
    const rows = batch.map((content, j) => ({ manual_id: manual.id, make, model, content, embedding: embeddings[j] }));
    const { error } = await supabase.from("manual_chunks").insert(rows);
    if (error) throw error;
    console.log(`  ${Math.min(i + 64, chunks.length)}/${chunks.length}`);
  }
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
