// Shared ingestion helpers for the Biela RAG (used by ingest-manual.mjs and
// ingest-folder.mjs). Extract text from a PDF/txt, chunk it, embed with OpenAI,
// and load into manuals / manual_chunks.
import { readFileSync } from "node:fs";
import { PDFParse } from "pdf-parse";

export async function bytesFrom({ file, url }) {
  if (url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`download ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }
  return new Uint8Array(readFileSync(file));
}

export async function extractText(bytes) {
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // "%PDF"
  if (!isPdf) return Buffer.from(bytes).toString("utf8");
  const parser = new PDFParse({ data: bytes });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

// ~800-char chunks on paragraph boundaries; drops tiny/noise fragments.
export function chunk(text, size = 800) {
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

export async function embed(input, openaiKey) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({ model: "text-embedding-3-small", input }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${await res.text()}`);
  return (await res.json()).data.map((d) => d.embedding);
}

// Delete any existing manual for this exact make/model/year (cascade clears its
// chunks) so re-ingesting is idempotent. Different years of the same model
// coexist — only the matching year is replaced.
async function clearExisting(supabase, make, model, year) {
  let q = supabase.from("manuals").delete().eq("make", make);
  q = model ? q.eq("model", model) : q.is("model", null);
  q = year != null ? q.eq("year_from", year) : q;
  const { error } = await q;
  if (error) throw error;
}

// Full ingest of one manual's text. Returns the number of chunks stored.
export async function ingestManual({ supabase, openaiKey, make, model = null, year = null, title = null, text, replace = true, log = () => {} }) {
  const chunks = chunk(text);
  if (chunks.length === 0) throw new Error("no text extracted (scanned PDF? needs OCR)");
  if (replace) await clearExisting(supabase, make, model, year);

  const { data: manual, error } = await supabase
    .from("manuals").insert({ make, model, title, year_from: year, year_to: year }).select("id").single();
  if (error) throw error;

  for (let i = 0; i < chunks.length; i += 64) {
    const batch = chunks.slice(i, i + 64);
    const embeddings = await embed(batch, openaiKey);
    const rows = batch.map((content, j) => ({ manual_id: manual.id, make, model, year, content, embedding: embeddings[j] }));
    const { error: e2 } = await supabase.from("manual_chunks").insert(rows);
    if (e2) throw e2;
    log(`  ${Math.min(i + 64, chunks.length)}/${chunks.length}`);
  }
  return chunks.length;
}
