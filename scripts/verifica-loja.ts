// A venda da loja chega até o Premium, e quando não chega, grita?
//
// POR QUE ISTO EXISTE (02/10/2026). O QA achou em 30/09 que o RevenueCat saiu
// de zero para UMA assinatura ativa em 25/09 e o banco não conhece nenhuma.
// Cinco dias sem ninguém saber, e o que denunciou foi o descompasso entre duas
// fontes, não um alarme. Se for compra de gente de verdade, a pessoa pagou e
// está sem Premium desde então.
//
// O QUE ESTA CONFERÊNCIA PROTEGE:
//   1. a compra do onboarding sai COM identidade. `initPurchases(null)` ali é
//      a causa provável do caso de 25/09: sem `appUserID` e sem `logIn`, a
//      folha da Apple abre com o id anônimo do RevenueCat mesmo com a pessoa
//      logada;
//   2. o webhook NÃO perde a venda com um 200. Identidade inútil passou a
//      virar linha em `app_erros`, com o `app_user_id` que permite achar a
//      compra no painel e ligar o Premium na mão;
//   3. só evento COM DINHEIRO gera relato. Alarmar sobre `CANCELLATION` sem
//      conta ensinaria a ignorar o alarme, que é a lição de 19/09;
//   4. o retrato PUBLICA a contagem, senão a rede existe e ninguém olha, que
//      é o defeito que esta casa passou a semana de 28/09 consertando;
//   5. o upsert do Stripe não APAGA cupom e gclid quando não os conhece.
//
// O QUE ELA NÃO ALCANÇA, e é a metade que importa saber: nenhuma compra de
// loja de verdade passou por este código. As suítes rodam num Chromium sem
// Capacitor, então o caminho da Apple não é reproduzível daqui. Isto é teoria
// em produção até a próxima venda de loja, e a prova é ela.
//
// Rode com: npm run conferir:loja
import { readFileSync } from "node:fs";
import {
  ORIGEM_VENDA_SEM_CONTA,
  ehVendaComDinheiro,
  identidadeUsavel,
  linhaDeVendaSemConta,
  relatoDeVendaSemConta,
} from "../lib/loja/vendaSemConta.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

console.log("Loja: a compra chega ao Premium, e quando não chega, deixa rastro?");

// ── 1. A IDENTIDADE QUE SERVE E A QUE NÃO SERVE ─────────────────────────────
{
  conferir("o id de conta do Supabase serve", identidadeUsavel("fcd41994-1d3c-4f5e-8a2b-9c0d1e2f3a4b"));
  conferir("maiúsculas também", identidadeUsavel("FCD41994-1D3C-4F5E-8A2B-9C0D1E2F3A4B"));
  conferir("com espaço em volta, serve", identidadeUsavel("  fcd41994-1d3c-4f5e-8a2b-9c0d1e2f3a4b  "));
  // O formato que o RevenueCat gera quando ninguém se identificou. É ELE que
  // chegou (ou chegaria) no caso de 25/09.
  conferir("o id anônimo do RevenueCat NÃO serve", !identidadeUsavel("$RCAnonymousID:8f3a2b1c9d4e5f60"));
  conferir("vazio não serve", !identidadeUsavel(""));
  conferir("nulo não serve", !identidadeUsavel(null));
  conferir("pedaço de uuid não serve", !identidadeUsavel("fcd41994-1d3c"));
}

// ── 2. SÓ DINHEIRO GERA RELATO ──────────────────────────────────────────────
//
// A lição de 19/09: alarme que grita sobre coisa que não é defeito ensina o
// dono a ignorar o vigia, e aí o dia em que doer passa batido.
{
  for (const t of ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE"]) {
    conferir(`${t} é dinheiro`, ehVendaComDinheiro(t));
  }
  for (const t of ["CANCELLATION", "EXPIRATION", "BILLING_ISSUE", "TEST", "", null]) {
    conferir(`${t || "(vazio)"} NÃO é dinheiro`, !ehVendaComDinheiro(t));
  }
  conferir("minúscula também conta", ehVendaComDinheiro("initial_purchase"));
}

// ── 3. O RELATO LEVA A CHAVE DE BUSCA ───────────────────────────────────────
//
// Relato sem o `app_user_id` só serve para saber que doeu. Com ele, o dono abre
// o painel do RevenueCat, acha a compra e liga o Premium na mão.
{
  const r = relatoDeVendaSemConta({
    id: "1A2B3C4D-EVT",
    type: "INITIAL_PURCHASE",
    app_user_id: "$RCAnonymousID:8f3a2b1c9d4e5f60",
    product_id: "mentorque_annual",
    store: "APP_STORE",
  });
  conferir("a origem é a que o retrato conta", r.origem === ORIGEM_VENDA_SEM_CONTA, r.origem);
  conferir("o relato leva o app_user_id", /RCAnonymousID:8f3a2b1c9d4e5f60/.test(r.mensagem), r.mensagem);
  conferir("e o id do evento", /1A2B3C4D-EVT/.test(r.mensagem), r.mensagem);
  conferir("e o produto", /mentorque_annual/.test(r.mensagem), r.mensagem);
  conferir("e diz o que fazer", /ligar na mao/.test(r.mensagem), r.mensagem);
  conferir("a loja vira plataforma", r.plataforma === "ios", r.plataforma);
  conferir("Play também", relatoDeVendaSemConta({ store: "PLAY_STORE" }).plataforma === "android");
  conferir("loja desconhecida não inventa plataforma", relatoDeVendaSemConta({}).plataforma === "loja");
  conferir(
    "e o relato NÃO carrega nome nem e-mail",
    !/@/.test(r.mensagem),
    "o corpo do RevenueCat não manda isso, e o que basta para recuperar a venda é o identificador",
  );
}

// ── 4. A FRASE DO RETRATO, NOS DOIS ESTADOS ─────────────────────────────────
{
  const zero = linhaDeVendaSemConta(0);
  conferir("zero é dito como normal", /nenhuma/.test(zero.texto), zero.texto);
  conferir("e não grita", !/PERDIDAS/.test(zero.texto), zero.texto);

  const uma = linhaDeVendaSemConta(1);
  conferir("uma venda perdida grita", /VENDAS DE LOJA PERDIDAS \(30d\): 1/.test(uma.texto), uma.texto);
  conferir("e diz onde achar o rastro", new RegExp(ORIGEM_VENDA_SEM_CONTA).test(uma.texto), uma.texto);
  conferir("e diz que alguém pagou", /pagou/.test(uma.texto), uma.texto);
}

// ── 5. A COMPRA DO ONBOARDING SAI COM IDENTIDADE ────────────────────────────
//
// É a causa provável do caso de 25/09, e a única asserção aqui que olha o app.
{
  const onb = semComentarios(readFileSync(new URL("../components/app/OnboardingFlow.tsx", import.meta.url), "utf8"));
  // O recorte NÃO exige o fecho da função de propósito: a primeira versão
  // pedia `\n  };` dentro de 400 caracteres, o corpo é maior que isso, e as
  // duas asserções reprovaram no código CERTO. Conferência que depende do
  // tamanho do corpo quebra na próxima linha que alguém acrescentar.
  const buy = onb.match(/const buyNow = async \(\) => \{[\s\S]{0,300}/);
  conferir("achei o buyNow do onboarding", !!buy, "se o nome mudou, esta asserção ficou cega");
  conferir(
    "a compra do onboarding passa a identidade para o RevenueCat",
    !!buy && /initPurchases\(user\?\.id \?\? null\)|initPurchases\(user\.id\)/.test(buy[0]),
    `${buy?.[0]?.match(/initPurchases\([^)]*\)/)?.[0] ?? "não achei a chamada"}; com null o plugin pula o logIn e a compra fica na conta anônima`,
  );
}

// ── 6. O WEBHOOK NÃO PERDE A VENDA EM SILÊNCIO ──────────────────────────────
{
  const rota = semComentarios(readFileSync(new URL("../app/api/revenuecat/webhook/route.ts", import.meta.url), "utf8"));
  conferir(
    "a identidade é conferida pela régua, e não por uma cópia da regex",
    /identidadeUsavel\(userId\)/.test(rota) && !/\[0-9a-f\]\{8\}/.test(rota),
    "regex copiada no leitor é regra que para de acompanhar a fonte",
  );
  conferir(
    "identidade inútil com dinheiro vira linha em app_erros",
    /ehVendaComDinheiro\(event\.type\)[\s\S]{0,300}from\("app_erros"\)\.insert/.test(rota),
    "sem isto a venda paga sai com um 200 e nunca mais existe",
  );
  conferir(
    "e o relato vem da régua, não montado ali",
    /relatoDeVendaSemConta\(event\)/.test(rota),
  );
}

// ── 7. O RETRATO PUBLICA ────────────────────────────────────────────────────
{
  const operacao = semComentarios(readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8"));
  conferir("o retrato conta as vendas sem conta", /ORIGEM_VENDA_SEM_CONTA/.test(operacao));
  conferir("e publica a frase pronta", /linhaSemConta: linhaDeVendaSemConta\(/.test(operacao));
  conferir("a janela é de 30 dias", /vendas_sem_conta[\s\S]{0,300}d30/.test(operacao), "em 7 dias o caso de 25/09 teria passado batido");
}

// ── 8. O UPSERT NÃO APAGA O QUE NÃO CONHECE ─────────────────────────────────
//
// Achado do QA em 01/10, de passagem: as três assinaturas têm `cupom` nulo, e
// os três códigos foram preenchidos à mão em 02/09. O upsert roda a cada
// webhook e gravava NULL por cima.
{
  const sync = semComentarios(readFileSync(new URL("../lib/subscriptionSync.ts", import.meta.url), "utf8"));
  conferir(
    "cupom só é escrito quando existe",
    /\.\.\.\(typeof sub\.metadata\?\.cupom === "string"[\s\S]{0,120}\{ cupom:/.test(sync),
    "`cupom: ... : null` apaga preenchimento manual no proximo webhook",
  );
  conferir(
    "gclid também",
    /\.\.\.\(typeof sub\.metadata\?\.gclid === "string"[\s\S]{0,120}\{ gclid:/.test(sync),
    "o gclid e a chave da devolucao da conversao ao Google Ads: apagado, a campanha otimiza no escuro",
  );
  conferir(
    "e nenhum dos dois volta a afirmar null",
    !/cupom:[^,\n]*:\s*null/.test(sync) && !/gclid:[^,\n]*:\s*null/.test(sync),
    sync.match(/(cupom|gclid):[^\n]*null[^\n]*/)?.[0] ?? "",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da loja reprovaram.`);
  process.exit(1);
}
console.log("Loja: a compra sai com identidade, e a que chegar sem conta deixa rastro com a chave de busca.");
