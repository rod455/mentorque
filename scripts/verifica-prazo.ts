// O /api/dados responde antes de o Vigia desistir (21/10/2026).
//
// POR QUE. Em 21/10 o Vigia esperou 30 s e ficou cego, e nenhuma consulta da
// rota chegou ao banco nesse tempo. As consultas não tinham prazo: uma conexão
// travada segurava a rota até os 60 s do teto. O conserto (lib/prazo.ts) só
// vale se três coisas forem verdade AO MESMO TEMPO, e esta conferência prova
// cada uma contra o fetch de verdade e o cliente da Supabase de verdade, num
// servidor local que trava de propósito:
//   1. o prazo corta, inclusive quando o banco manda o cabeçalho e trava no corpo;
//   2. o cliente da Supabase devolve `{ error }` e NÃO tenta de novo sozinho
//      (ele repete falha de rede em GET até três vezes, e aí o prazo virava 4x);
//   3. a conta fecha: orçamento + um prazo cabe nos 30 s do Vigia, e a rota
//      usa o cliente com prazo e confere o orçamento antes de cada consulta.
//
// Rode com: npm run conferir:prazo
import { createServer, type Server } from "node:http";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { createClient } from "@supabase/supabase-js";
import { ORCAMENTO_DA_ROTA_MS, PRAZO_POR_CONSULTA_MS, cabeMaisUma, fetchComPrazo, foiOPrazo } from "../lib/prazo.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Prazo: a consulta travada vira buraco declarado, e a rota responde antes de o Vigia desistir.");

const PRAZO_DE_TESTE = 150;
const TIMEOUT_DO_VIGIA_MS = 30000;

// Se o prazo deixar de cortar, a consulta de teste trava para sempre. Isso é
// reprovação, não espera: em 10 s a conferência grita e sai.
setTimeout(() => {
  console.error("FALHA  a conferência travou: algum pedido não foi cortado pelo prazo");
  process.exit(1);
}, 10000).unref();

// Um "banco" que trava: em /cabeca nunca responde; em /corpo manda o cabeçalho
// e para no meio do corpo; em /ok responde na hora.
let pedidos = 0;
const servidor: Server = createServer((req, res) => {
  pedidos++;
  if (req.url?.startsWith("/rest/v1/ok")) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end("[]");
  } else if (req.url?.startsWith("/rest/v1/corpo")) {
    res.writeHead(200, { "content-type": "application/json" });
    res.write("[");
  }
});
await new Promise<void>((ok) => servidor.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;

// ── 1. o prazo corta, no fetch de verdade ────────────────────────────────────
{
  const comeco = Date.now();
  let nome = "";
  try {
    await fetchComPrazo(PRAZO_DE_TESTE)(`${base}/rest/v1/cabeca`);
  } catch (e) {
    nome = (e as Error).name;
  }
  const levou = Date.now() - comeco;
  conferir("o fetch travado desiste no prazo", nome === "AbortError" && levou < PRAZO_DE_TESTE * 5, `nome=${nome} levou=${levou}ms`);

  const sinal = new AbortController();
  sinal.abort();
  let nomeDeFora = "";
  try {
    await fetchComPrazo(60000)(`${base}/rest/v1/cabeca`, { signal: sinal.signal });
  } catch (e) {
    nomeDeFora = (e as Error).name;
  }
  conferir("e o cancelamento de quem chamou continua valendo", nomeDeFora === "AbortError", `nome=${nomeDeFora}`);
}

// ── 2. o cliente da Supabase devolve o erro e não repete ─────────────────────
{
  const cliente = createClient(base, "chave-de-teste", {
    auth: { persistSession: false },
    global: { fetch: fetchComPrazo(PRAZO_DE_TESTE) },
  });

  pedidos = 0;
  let comeco = Date.now();
  const travada = await cliente.from("cabeca").select("*");
  let levou = Date.now() - comeco;
  conferir("consulta travada no cabeçalho volta como erro, sem estourar", !!travada.error && travada.data === null);
  conferir("e o erro é reconhecido como prazo", foiOPrazo(travada), travada.error?.message);
  conferir("e o cliente NÃO tenta de novo sozinho", pedidos === 1, `pedidos=${pedidos}`);
  conferir("e volta perto do prazo, não de 4 prazos", levou < PRAZO_DE_TESTE * 3, `levou=${levou}ms`);

  pedidos = 0;
  comeco = Date.now();
  const noCorpo = await cliente.from("corpo").select("*");
  levou = Date.now() - comeco;
  conferir("consulta travada NO CORPO também é cortada", foiOPrazo(noCorpo) && levou < PRAZO_DE_TESTE * 3, `${noCorpo.error?.message} levou=${levou}ms`);

  const ok = await cliente.from("ok").select("*");
  conferir("consulta que responde passa sem erro", !ok.error && Array.isArray(ok.data), ok.error?.message);
  conferir("e erro de banco comum não vira prazo", !foiOPrazo({ error: { message: "duplicate key value violates unique constraint" } }));
}

servidor.closeAllConnections();
servidor.close();

// ── 3. a conta fecha, e a rota usa as peças ──────────────────────────────────
{
  conferir(
    `orçamento + um prazo cabe nos ${TIMEOUT_DO_VIGIA_MS / 1000} s do Vigia`,
    ORCAMENTO_DA_ROTA_MS + PRAZO_POR_CONSULTA_MS < TIMEOUT_DO_VIGIA_MS,
    `${ORCAMENTO_DA_ROTA_MS} + ${PRAZO_POR_CONSULTA_MS}`,
  );
  conferir("o prazo passa da consulta mais lenta já vista (2,7 s em 43 retratos)", PRAZO_POR_CONSULTA_MS >= 2700 * 2);
  conferir("o orçamento passa da rota mais lenta já vista (7,1 s)", ORCAMENTO_DA_ROTA_MS >= 7100 * 2);
  conferir("dentro do orçamento ainda cabe consulta", cabeMaisUma(0, ORCAMENTO_DA_ROTA_MS - 1));
  conferir("com o orçamento gasto, não cabe mais", !cabeMaisUma(0, ORCAMENTO_DA_ROTA_MS));

  const operacao = leia("lib/operacao.ts");
  const coleta = operacao.slice(operacao.indexOf("export async function coletarDadosOperacao"), operacao.indexOf("export async function resumoAvaliacoes"));
  conferir("a coleta usa o cliente com prazo", /const admin = getSupabaseAdminComPrazo\(\);/.test(coleta) && !/getSupabaseAdmin\(\)/.test(coleta));
  conferir("o medir confere o orçamento antes de começar", /if \(!cabeMaisUma\(t0, inicio\)\) \{[\s\S]{0,200}falhas\[nome\] =/.test(coleta));
  conferir("e o prazo esgotado vai para as falhas com o nome dele", /foiOPrazo\(r\)\) falhas\[nome\] =/.test(coleta));

  const admin = leia("lib/supabaseAdmin.ts");
  conferir("o cliente com prazo usa o fetch com prazo", /global: \{ fetch: fetchComPrazo\(PRAZO_POR_CONSULTA_MS\) \}/.test(admin));
  const rota = leia("app/api/dados/route.ts");
  conferir("o teto da função continua acima do pior caso da rota", Number(rota.match(/maxDuration = (\d+)/)?.[1] ?? 0) * 1000 > ORCAMENTO_DA_ROTA_MS + PRAZO_POR_CONSULTA_MS);
}

if (falhas) {
  console.error(`\nPrazo: ${falhas} conferência(s) reprovada(s).`);
  process.exit(1);
}
console.log("Prazo: consulta travada vira buraco no prazo, e a rota cabe no tempo do Vigia.");
