// A renovação da assinatura web existe no funil, e uma reentrega não a conta duas vezes.
//
// Esta conferência nasce do buraco medido em 01/10/2026, no dia da PRIMEIRA
// cobrança real do produto. O ciclo do cliente virou de 01/10 para 01/11 às
// 23:53:13, a assinatura seguiu `active`, e `funil_eventos` não registrou
// nada. O webhook do Stripe escrevia `assinou`, `cancelou` e `expirou`, e
// nunca escreveu `renovou` em lugar nenhum: o único `renovou` do projeto
// morava no gêmeo do RevenueCat, e a loja nunca vendeu.
//
// O sintoma era o pior possível, porque não parecia sintoma: `renovacoes 0` no
// painel, com `funilCorreto.ts` declarando `renovou` mensurável desde 22/08.
// Zero que lê como "ninguém renovou" quando significa "ninguém mediu" é a
// armadilha que esta casa já catalogou três vezes, e desta vez caiu no
// dinheiro, que é a coisa que o produto existe para contar.
//
// O que ela protege, nesta ordem de importância:
//
//   1. a virada de ciclo é reconhecida, e só ela: reentrega de webhook,
//      assinatura nova e correção para trás NÃO viram receita inventada
//   2. a LEITURA do ciclo antigo vem antes da ESCRITA do novo, que é a ordem
//      sem a qual a renovação fica invisível para sempre, em silêncio
//   3. a rota realmente escreve `renovou` (o buraco original)
//   4. `renovou` e `cancelou` não estão encadeados num `else`, senão a virada
//      de ciclo engole o churn quando os dois chegam juntos
//   5. o evento não carrega valor, porque preço de plano não é caixa
//
// Rode com: npm run conferir:renovacao
import { readFileSync } from "node:fs";
import { fimDoCiclo, viradaDeCiclo } from "../lib/ciclo.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const OUT_2026 = Math.floor(Date.parse("2026-10-01T23:52:23Z") / 1000);
const NOV_2026 = Math.floor(Date.parse("2026-11-01T23:52:23Z") / 1000);

/** Uma assinatura do Stripe com só o que o ciclo usa, no formato NOVO (no item). */
const noItem = (fim: number) =>
  ({ items: { data: [{ current_period_end: fim }] } }) as unknown as Parameters<typeof viradaDeCiclo>[1];

/** A mesma coisa no formato VELHO, com o ciclo no objeto da assinatura. */
const noObjeto = (fim: number) =>
  ({ items: { data: [{}] }, current_period_end: fim }) as unknown as Parameters<typeof viradaDeCiclo>[1];

// ── 1. o caso real de 01/10: o ciclo andou um mês para frente ───────────────
{
  conferir(
    "ciclo que anda para frente é renovação",
    viradaDeCiclo(OUT_2026, noItem(NOV_2026)) === true,
    "é exatamente a virada de 01/10/2026, a primeira cobrança real do produto"
  );
}

// ── 2. reentrega do MESMO webhook não é renovação ───────────────────────────
//
// O Stripe reentrega sempre que não recebe 2xx, e é isto que faz a dedup
// existir sem índice no banco: na segunda entrega o ciclo gravado já é o novo.
// Se esta linha cair, uma reentrega vira uma renovação a mais no mês, e
// `renovou` é de propósito o único evento financeiro SEM índice único por
// assinatura (renovar de novo é fato novo todo mês).
{
  conferir(
    "reentrega do mesmo webhook não conta renovação",
    viradaDeCiclo(NOV_2026, noItem(NOV_2026)) === false,
    "o ciclo já gravado é o mesmo que está chegando"
  );
}

// ── 3. assinatura que o banco não conhece é `assinou`, não `renovou` ────────
{
  conferir(
    "sem ciclo gravado não há renovação",
    viradaDeCiclo(null, noItem(NOV_2026)) === false,
    "primeira entrega de uma assinatura nova é venda, e ela já tem o seu próprio evento"
  );
}

// ── 4. correção para TRÁS não é renovação ───────────────────────────────────
//
// Mexer na data no painel do Stripe (ou uma entrega fora de ordem) manda um
// ciclo ANTERIOR ao gravado. Com `!==` no lugar do `>`, isso viraria receita.
{
  conferir(
    "ciclo que anda para trás não conta renovação",
    viradaDeCiclo(NOV_2026, noItem(OUT_2026)) === false,
    "entrega fora de ordem, ou data corrigida na mão, não é dinheiro novo"
  );
}

// ── 5. arredondamento de ida e volta não inventa uma renovação por mês ──────
//
// O banco guarda o instante como texto com fuso e o Stripe manda segundos
// inteiros. Sem a folga, a diferença de um segundo entre as duas leituras
// seria lida como virada em TODO update de assinatura.
{
  conferir(
    "diferença de segundos não conta renovação",
    viradaDeCiclo(NOV_2026 - 3, noItem(NOV_2026)) === false,
    "é arredondamento entre o texto do banco e os segundos do Stripe"
  );
  // E a folga não pode comer uma virada de verdade, que é de um mês.
  conferir(
    "a folga não engole a virada de um mês",
    viradaDeCiclo(OUT_2026, noItem(NOV_2026)) === true
  );
}

// ── 6. o ciclo é lido nos DOIS formatos da API ──────────────────────────────
//
// `current_period_end` migrou do objeto da assinatura para o ITEM nas versões
// novas, e o projeto já tropeçou nisso uma vez (ver o comentário do
// `fimDoCiclo`). Quem lê o ciclo para reconhecer a virada tem que ler o mesmo
// campo que quem o grava, senão a comparação é entre um número e um `undefined`
// e a renovação nunca aparece.
{
  conferir("o ciclo é lido do item", fimDoCiclo(noItem(NOV_2026)) === NOV_2026);
  conferir("e do objeto da assinatura, no formato velho", fimDoCiclo(noObjeto(NOV_2026)) === NOV_2026);
  conferir("virada reconhecida também no formato velho", viradaDeCiclo(OUT_2026, noObjeto(NOV_2026)) === true);
  conferir(
    "assinatura sem ciclo nenhum não vira renovação",
    viradaDeCiclo(OUT_2026, { items: { data: [] } } as unknown as Parameters<typeof viradaDeCiclo>[1]) === false
  );
}

// ── 7. A LIGAÇÃO NA ROTA, que é onde o buraco morava ────────────────────────
//
// Tudo acima prova a REGRA. Nada disso prova que a rota a usa, e era
// justamente ligação o que faltava em 01/10: a função podia existir e ninguém
// chamar, que é o mesmo que não existir.
const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

/** O fonte sem comentário nenhum: conferência de texto só vale sobre o que o motor executa. */
function semComentarios(fonte: string): string {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

{
  const rota = semComentarios(leia("app/api/stripe/webhook/route.ts"));

  conferir(
    "o webhook do Stripe escreve `renovou`",
    /funil\(\s*["']renovou["']/.test(rota),
    "o buraco de 01/10: a rota escrevia assinou, cancelou e expirou, e nunca renovou"
  );

  // A ORDEM. `cicloNoBanco` lê o ciclo VELHO; `upsertSubscription` grava o
  // novo. Invertidos, o banco já tem o ciclo novo quando a comparação acontece,
  // não há virada nunca mais, e o sintoma é silêncio: o funil volta a dizer
  // `renovacoes 0` sem ninguém notar. É a mesma armadilha da migalha no Shell.
  const iLeitura = rota.indexOf("cicloNoBanco(");
  const iEscrita = rota.indexOf("upsertSubscription(admin, sub)");
  conferir(
    "o ciclo antigo é lido ANTES de o novo ser gravado",
    iLeitura >= 0 && iEscrita > iLeitura,
    `cicloNoBanco em ${iLeitura}, upsertSubscription em ${iEscrita}. Trocados, nenhuma renovação é registrada e o funil fica em zero calado.`
  );

  // O `else` que eu mesmo escrevi e desfiz no mesmo dia: com `renovou` e
  // `cancelou` encadeados, uma entrega que trouxesse a virada de ciclo E o
  // desligamento da renovação registraria só a primeira, e o churn sumiria.
  conferir(
    "`renovou` e `cancelou` não estão no mesmo `else`",
    !/viradaDeCiclo[\s\S]{0,1200}?\}\s*else if[\s\S]{0,120}cancel_at_period_end/.test(rota),
    "encadeados, a virada de ciclo engole o churn quando os dois chegam na mesma entrega"
  );

  // PREÇO NÃO É CAIXA (direcionamento 8). O que esta rota tem em mãos é o
  // preço do plano; um cupom de 100% produz esta mesma virada com fatura de
  // R$ 0,00, e foi o que aconteceu em 01/09. Carimbar valor aqui faria o funil
  // afirmar dinheiro que ninguém confirmou.
  const extraDoRenovou = /funil\(\s*["']renovou["'][^;]*?\{([\s\S]*?)\}\s*\)/.exec(rota)?.[1] ?? "";
  conferir(
    "o `renovou` da web não carimba valor nenhum",
    extraDoRenovou !== "" && !/valor|preco|price|amount|unit_amount/i.test(extraDoRenovou),
    `o extra saiu com: ${extraDoRenovou.replace(/\s+/g, " ").trim() || "(não achei o extra)"}`
  );
  conferir(
    "e diz de qual assinatura e de qual ciclo ele fala",
    /sub:/.test(extraDoRenovou) && /ciclo:/.test(extraDoRenovou),
    "sem os dois não há como cruzar o evento com a assinatura depois"
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da renovação reprovaram.`);
  process.exit(1);
}
console.log(
  "Renovação: a virada de ciclo entra no funil uma vez só, reentrega e correção\n" +
    "para trás não inventam receita, e a leitura do ciclo antigo vem antes da escrita."
);
