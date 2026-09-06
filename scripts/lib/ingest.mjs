// Shared ingestion helpers for the Biela RAG (used by ingest-manual.mjs and
// ingest-folder.mjs). Extract text from a PDF/txt, chunk it, embed with Voyage,
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

/**
 * Tira do texto extraído o que o Postgres não guarda.
 *
 * POR QUE (05/09/2026). No primeiro lote grande, 4 dos 27 manuais falharam com
 * `unsupported Unicode escape sequence`, que é erro do BANCO, não do arquivo:
 * o Postgres não aceita o caractere NUL (`\u0000`) dentro de texto, e alguns
 * PDFs trazem NUL no meio do conteúdo extraído. O manual inteiro era recusado
 * por causa de um byte invisível.
 *
 * Junto com o NUL saem os outros caracteres de controle do bloco C0, que em
 * texto de manual são sempre lixo de extração. Quebra de linha e tabulação
 * ficam, porque a picotagem em parágrafos depende delas.
 *
 * Isto é limpeza, não conserto de conteúdo: se um PDF vier vazio ou ilegível,
 * quem avisa continua sendo o aviso de "vazio, escaneado?" e o de "curto
 * demais para um manual inteiro".
 */
export function limpaTexto(texto) {
  return String(texto).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export async function extractText(bytes) {
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // "%PDF"
  if (!isPdf) return limpaTexto(Buffer.from(bytes).toString("utf8"));
  const parser = new PDFParse({ data: bytes });
  try {
    return limpaTexto((await parser.getText()).text);
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

// O provedor de embedding. Mudou de OpenAI para Voyage em 05/09/2026, e o
// porquê está em lib/rag.ts, que é o outro lado desta mesma decisão. Os dois
// arquivos declaram modelo e dimensão, e a `npm run conferir:embedding` reprova
// se um sair do outro: espaço vetorial diferente entre quem grava e quem
// procura não dá erro em lugar nenhum, só devolve resultado ruim.
export const EMBEDDING = {
  endpoint: "https://api.voyageai.com/v1/embeddings",
  modelo: "voyage-4-lite",
  dimensoes: 1024,
};

/**
 * Vetoriza textos.
 *
 * `input_type` é "document" aqui e "query" no lib/rag.ts, e a diferença não é
 * cosmética: a Voyage prepara os dois espaços de formas diferentes, e trocar
 * os tipos piora a busca sem quebrar nada nem avisar ninguém.
 */
export async function embed(input, voyageKey) {
  const res = await fetch(EMBEDDING.endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${voyageKey}` },
    body: JSON.stringify({
      model: EMBEDDING.modelo,
      input: Array.isArray(input) ? input : [input],
      input_type: "document",
      output_dimension: EMBEDDING.dimensoes,
    }),
  });
  if (!res.ok) throw new Error(`embeddings ${res.status}: ${await res.text()}`);
  const vetores = (await res.json()).data.map((d) => d.embedding);
  // Conferir a dimensão do que VOLTOU, e não confiar no que a gente pediu: a
  // coluna do banco é vector(1024) e um vetor de outro tamanho seria recusado
  // lá na frente, no meio de um lote, com erro que não diz o que houve.
  const errado = vetores.find((v) => v.length !== EMBEDDING.dimensoes);
  if (errado) throw new Error(`a Voyage devolveu vetor de ${errado.length}, e a coluna espera ${EMBEDDING.dimensoes}`);
  return vetores;
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
export async function ingestManual({ supabase, voyageKey, make, model = null, year = null, title = null, text, replace = true, log = () => {} }) {
  const chunks = chunk(text);
  if (chunks.length === 0) throw new Error("no text extracted (scanned PDF? needs OCR)");
  if (replace) await clearExisting(supabase, make, model, year);

  const { data: manual, error } = await supabase
    .from("manuals").insert({ make, model, title, year_from: year, year_to: year }).select("id").single();
  if (error) throw error;

  for (let i = 0; i < chunks.length; i += 64) {
    const batch = chunks.slice(i, i + 64);
    const embeddings = await embed(batch, voyageKey);
    const rows = batch.map((content, j) => ({ manual_id: manual.id, make, model, year, content, embedding_voyage: embeddings[j] }));
    const { error: e2 } = await supabase.from("manual_chunks").insert(rows);
    if (e2) throw e2;
    log(`  ${Math.min(i + 64, chunks.length)}/${chunks.length}`);
  }
  return chunks.length;
}
