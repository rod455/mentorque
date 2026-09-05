#!/usr/bin/env node
/**
 * Reembeda na Voyage os trechos de manual que já estão no banco.
 *
 * POR QUE ISTO EXISTE (05/09/2026). A conta da OpenAI ficou sem crédito e a
 * troca de provedor foi decidida. Vetor de um modelo não conversa com vetor de
 * outro: os 28.426 trechos existentes foram feitos com `text-embedding-3-small`
 * em 1536 dimensões, e a Voyage devolve 1024. Sem este script, migrar
 * significaria subir os 85 manuais de novo, e a maioria dos PDFs originais não
 * está mais na mão de ninguém.
 *
 * O QUE SALVA A OPERAÇÃO é que o TEXTO está guardado. `manual_chunks.content`
 * tem cada pedaço como ele foi picado, então dá para refazer só a vetorização,
 * sem PDF nenhum. Nada de reprocessar arquivo, nada de risco de picar
 * diferente e mudar o resultado da busca por outro motivo.
 *
 * É RETOMÁVEL de propósito. Ele só pega linhas com `embedding_voyage` nulo,
 * então cair no meio (rede, cota, notebook fechado) não perde o que já foi:
 * rodar de novo continua de onde parou. Com 28 mil trechos e a rede no meio,
 * "roda tudo ou nada" seria uma armadilha.
 *
 * A coluna velha NÃO é tocada. Enquanto as duas existirem dá para comparar a
 * qualidade da busca e voltar atrás. A limpeza é um passo separado, depois.
 *
 * Uso:
 *   node scripts/reembeddar.mjs --sonda     confere a chave e a dimensão, 1 chamada
 *   node scripts/reembeddar.mjs             reembeda tudo o que falta
 *   node scripts/reembeddar.mjs --limite 500   só um pedaço, para provar antes
 *   node scripts/reembeddar.mjs --devagar     cabe no limite de conta sem cartão
 *
 * Precisa de NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e
 * VOYAGE_API_KEY no .env.local.
 */
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { embed, EMBEDDING } from "./lib/ingest.mjs";

// Mesmo carregador do `npm run dev`, pelo mesmo motivo do ingest-folder: o
// `--env-file` do Node já deixou variável de fora sem avisar.
let comoCarregou = "não tentei";
try {
  const mod = await import("@next/env");
  const loadEnvConfig = mod.loadEnvConfig ?? mod.default?.loadEnvConfig;
  if (typeof loadEnvConfig !== "function") throw new Error("@next/env não expôs loadEnvConfig");
  const r = loadEnvConfig(join(import.meta.dirname, ".."), true);
  comoCarregou = (r?.loadedEnvFiles ?? []).length ? "li o .env.local" : "não achei .env.local";
} catch (e) {
  comoCarregou = `o carregador falhou: ${e.message}`;
}

const args = process.argv.slice(2);
const sonda = args.includes("--sonda");
const limite = Number((args[args.indexOf("--limite") + 1] ?? "").trim()) || null;

// O MODO DEVAGAR, para conta sem forma de pagamento cadastrada.
//
// A Voyage aplica 3 requisições por minuto e 10 mil tokens por minuto até
// alguém cadastrar um cartão, e isso NÃO é uma questão de dinheiro: os tokens
// grátis continuam valendo depois. Só que com esse teto um lote de 64 trechos
// (uns 13 mil tokens) já estoura sozinho, e a primeira tentativa aqui bateu em
// 429 três vezes seguidas e parou.
//
// 32 trechos dão perto de 6 mil tokens, e uma requisição a cada 21 segundos
// dá 2,8 por minuto. Cabe nos dois tetos com folga.
const devagar = args.includes("--devagar");
const LOTE = Number((args[args.indexOf("--lote") + 1] ?? "").trim()) || (devagar ? 32 : 64);
const PAUSA_MS = devagar ? 21000 : 0;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const URL_SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VOYAGE = process.env.VOYAGE_API_KEY;
const faltando = [
  !URL_SUPA && "NEXT_PUBLIC_SUPABASE_URL",
  !CHAVE && "SUPABASE_SERVICE_ROLE_KEY",
  !VOYAGE && "VOYAGE_API_KEY",
].filter(Boolean);
if (faltando.length) {
  console.error(`Faltam no .env.local: ${faltando.join(", ")}.\nCarregando o .env: ${comoCarregou}`);
  process.exit(1);
}

// A SONDA existe para a primeira chamada custar uma linha, e não 28 mil.
// Chave errada, modelo com outro nome ou dimensão diferente do que a coluna
// espera: tudo isso aparece aqui, em dois segundos, antes de qualquer gasto.
if (sonda) {
  const [v] = await embed(["Teste de sonda: o filtro de óleo do motor."], VOYAGE);
  console.log(`Voyage respondeu. Modelo ${EMBEDDING.modelo}, vetor de ${v.length} dimensões.`);
  console.log(`A coluna embedding_voyage espera ${EMBEDDING.dimensoes}. ${v.length === EMBEDDING.dimensoes ? "Combina." : "NÃO COMBINA."}`);
  process.exit(v.length === EMBEDDING.dimensoes ? 0 : 1);
}

const supabase = createClient(URL_SUPA, CHAVE, { auth: { persistSession: false } });

const { count: total } = await supabase
  .from("manual_chunks").select("id", { count: "exact", head: true }).is("embedding_voyage", null);
if (!total) {
  console.log("Nada a fazer: todos os trechos já têm embedding da Voyage.");
  process.exit(0);
}
console.log(`${total} trecho(s) sem embedding da Voyage.${limite ? ` Vou fazer ${limite}.` : ""}\n`);

let feitos = 0;
let falhas = 0;
let falhas429 = 0;
const alvo = limite ?? total;
if (devagar) console.log("Modo devagar: 32 por vez, uma requisição a cada 21s. Cabe no limite de conta sem cartão.\n");

while (feitos < alvo) {
  // Sempre a MESMA consulta, sem paginação por offset: como cada volta preenche
  // a coluna, as linhas pendentes vão sumindo do resultado sozinhas. Paginar
  // por offset aqui pularia linhas, porque o conjunto muda a cada gravação.
  const { data: pendentes, error } = await supabase
    .from("manual_chunks")
    .select("id, content")
    .is("embedding_voyage", null)
    .limit(Math.min(LOTE, alvo - feitos));
  if (error) { console.error(`\nErro lendo o banco: ${error.message}`); process.exit(1); }
  if (!pendentes?.length) break;

  try {
    const vetores = await embed(pendentes.map((p) => p.content), VOYAGE);
    // Um update por linha porque cada uma leva o próprio vetor. É mais lento
    // que um upsert em bloco e é o que mantém o script retomável: se cair aqui,
    // o que já gravou está gravado e o resto continua nulo.
    for (let i = 0; i < pendentes.length; i++) {
      const { error: e2 } = await supabase
        .from("manual_chunks").update({ embedding_voyage: vetores[i] }).eq("id", pendentes[i].id);
      if (e2) throw e2;
    }
    feitos += pendentes.length;
    falhas = 0;
    falhas429 = 0;
    process.stdout.write(`\r  ${feitos}/${alvo} trechos                                   `);
  } catch (e) {
    // 429 NÃO É FALHA, é a API pedindo para esperar. Desistir aqui foi o erro
    // da primeira versão: três lotes seguidos batiam no limite e o script
    // parava, quando bastava respirar. Espera crescente, e o contador de
    // falhas só sobe em erro que não é de cadência.
    const limitado = /embeddings 429/.test(e.message);
    if (limitado) {
      const s = Math.min(60, 15 * (falhas429 + 1));
      falhas429++;
      process.stdout.write(`\r  ${feitos}/${alvo} trechos  (limite de cadência, esperando ${s}s)   `);
      await espera(s * 1000);
      continue;
    }
    falhas++;
    console.error(`\n  ✗ lote falhou: ${e.message}`);
    if (falhas >= 3) { console.error("Três lotes seguidos falharam por erro que não é de cadência. Parando; rode de novo que ele continua daqui."); process.exit(1); }
  }
  if (PAUSA_MS) await espera(PAUSA_MS);
}

console.log(`\n\nPronto. ${feitos} trecho(s) reembeddados.`);
const { count: sobra } = await supabase
  .from("manual_chunks").select("id", { count: "exact", head: true }).is("embedding_voyage", null);
console.log(
  sobra
    ? `Ainda faltam ${sobra}. Rode de novo para continuar.`
    : "Todos os trechos já estão na Voyage. O próximo passo é apontar a busca para a coluna nova."
);
