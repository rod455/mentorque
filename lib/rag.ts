// Shared RAG retrieval for the Biela features (chat + revisions plan).
// Embeds a query and pulls the most relevant manual passages for a car from
// Supabase. Returns "" (no grounding) unless the embeddings provider and the
// service-role key are configured and manuals were ingested.
import { createClient } from "@supabase/supabase-js";

export type CarCtx = {
  make?: string; model?: string; year?: number; km?: number | null;
  // Motorização e versão MUDAM a resposta: intervalo de correia, tipo de óleo e
  // meia dúzia de outras coisas dependem de ser 1.0 turbo ou 1.3 aspirado. O
  // cadastro sempre teve os dois campos; eles só não chegavam até aqui, e a
  // Biela respondia "depende da versão que você comprou" para quem já tinha
  // informado a versão.
  engine?: string; version?: string;
};

// O PROVEDOR DE EMBEDDING, e por que ele mudou em 05/09/2026.
//
// Era a OpenAI (`text-embedding-3-small`, 1536 dimensões). A conta ficou sem
// crédito e o dono decidiu migrar para a Voyage, que é a que a própria
// Anthropic indica. Vale registrar o que NÃO era possível: trocar para o
// Claude. A Anthropic não tem API de embedding, em modelo nenhum; o Claude já
// era quem respondia na `/api/biela`, e a OpenAI só existia aqui.
//
// `input_type` é a parte que mais muda a qualidade e a mais fácil de errar. A
// Voyage embeda PERGUNTA e DOCUMENTO em espaços preparados de formas
// diferentes, e usar o tipo errado degrada a busca sem quebrar nada. Aqui é
// sempre `query`, porque aqui é a pergunta do motorista; na ingestão
// (scripts/lib/ingest.mjs) é sempre `document`. A `conferir:embedding` cobra
// os dois lados.
//
// A dimensão é declarada e não deixada no padrão: a coluna do banco é
// `vector(1024)`, e um dia em que a Voyage mude o padrão sem a gente pedir
// viraria erro de inserção em produção.
export const EMBEDDING = {
  endpoint: "https://api.voyageai.com/v1/embeddings",
  modelo: "voyage-4-lite",
  dimensoes: 1024,
} as const;

export async function retrieveManualContext(query: string, car: CarCtx | null, matchCount = 6): Promise<string> {
  const voyageKey = process.env.VOYAGE_API_KEY;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!voyageKey || !supaUrl || !serviceKey) return "";
  try {
    const embRes = await fetch(EMBEDDING.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${voyageKey}` },
      body: JSON.stringify({
        model: EMBEDDING.modelo,
        input: [query],
        input_type: "query",
        output_dimension: EMBEDDING.dimensoes,
      }),
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
      f_year: car?.year ?? null,
    });
    if (error || !Array.isArray(data) || data.length === 0) return "";
    return (data as { content: string }[]).map((r, i) => `[${i + 1}] ${r.content}`).join("\n\n");
  } catch (err) {
    // A BUSCA FALHA EM SILÊNCIO, e esse silêncio custou caro em 05/09/2026.
    //
    // Devolver "" é o comportamento certo: a Biela responde de conhecimento
    // geral em vez de dar erro na cara do motorista. O problema era que ISSO
    // ERA TUDO. Quando a conta da OpenAI ficou sem crédito, a busca morreu e a
    // Biela passou a responder sem consultar nenhum dos 85 manuais, com a
    // mesma cara de sempre. Ninguém percebeu, porque um `console.warn` em
    // função serverless não é visto por pessoa nenhuma.
    //
    // Continuar devolvendo "" e AVISAR são coisas diferentes, e agora ele faz
    // as duas. O relato vai para a mesma tabela onde o app grava os defeitos
    // dele, então o QA já olha esse lugar.
    console.warn("[rag] manual retrieval failed:", err);
    void avisarQueABuscaCaiu(err, supaUrl, serviceKey);
    return "";
  }
}

/**
 * Grava que a busca de manual caiu. Nunca estoura: se o aviso falhar, o
 * silêncio volta, e ainda assim é melhor que derrubar a resposta da Biela por
 * causa do relatório sobre ela.
 */
async function avisarQueABuscaCaiu(err: unknown, supaUrl: string, serviceKey: string): Promise<void> {
  try {
    const supabase = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });
    await supabase.from("app_erros").insert({
      tipo: "erro",
      mensagem: `busca de manual caiu: ${err instanceof Error ? err.message : String(err)}`.slice(0, 400),
      origem: "rag",
      plataforma: "servidor",
    });
  } catch {
    /* o aviso sobre a falha não pode virar outra falha */
  }
}
