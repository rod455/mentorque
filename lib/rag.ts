// Shared RAG retrieval for the Biela features (chat + revisions plan).
// Embeds a query and pulls the most relevant manual passages for a car from
// Supabase. Returns "" (no grounding) unless the embeddings provider and the
// service-role key are configured and manuals were ingested.
import { createClient } from "@supabase/supabase-js";

export type CarCtx = { make?: string; model?: string; year?: number; km?: number | null };

export async function retrieveManualContext(query: string, car: CarCtx | null, matchCount = 6): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!openaiKey || !supaUrl || !serviceKey) return "";
  try {
    const embRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: "text-embedding-3-small", input: query }),
    });
    if (!embRes.ok) throw new Error(`embeddings_${embRes.status}`);
    const emb = (await embRes.json()).data?.[0]?.embedding;
    if (!emb) return "";

    const supabase = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.rpc("match_manual_chunks", {
      query_embedding: emb,
      match_count: matchCount,
      f_make: car?.make ?? null,
      f_model: car?.model ?? null,
    });
    if (error || !Array.isArray(data) || data.length === 0) return "";
    return (data as { content: string }[]).map((r, i) => `[${i + 1}] ${r.content}`).join("\n\n");
  } catch (err) {
    console.warn("[rag] manual retrieval failed:", err);
    return "";
  }
}
