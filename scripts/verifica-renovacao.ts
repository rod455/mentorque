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
import { cicloVencido, faturaDaVirada, fimDoCiclo, linhaDeCiclosVencidos, valorDoCheckout, viradaDeCiclo } from "../lib/ciclo.ts";

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
  // ESTA ASSERÇÃO DIZIA "não carimba valor NENHUM" ATÉ 02/10/2026.
  //
  // Ela nasceu certa: o que a rota tinha em mãos era PREÇO DE PLANO, e preço
  // não é caixa (um cupom de 100% produz a mesma virada com fatura de R$
  // 0,00). A conclusão de 01/10 foi que, para saber quanto entrou, o dono
  // precisaria acrescentar `invoice.paid` ao endpoint.
  //
  // Era uma saída, não a única: a assinatura carrega `latest_invoice`, e a
  // fatura passou a ser BUSCADA na hora da virada, com a chave que a casa já
  // tem. Então agora o evento PODE carregar dinheiro, desde que seja o
  // `amount_paid` de uma fatura PAGA.
  //
  // O que continua proibido é o preço do plano, que é o erro original. Por
  // isso a asserção deixou de ser "nenhum valor" e passou a nomear o que não
  // pode entrar.
  conferir(
    "o `renovou` não carimba PREÇO DE PLANO",
    extraDoRenovou !== "" && !/\bprice\b|unit_amount|precoDoPlano|planPrice/i.test(extraDoRenovou),
    `o extra saiu com: ${extraDoRenovou.replace(/\s+/g, " ").trim() || "(não achei o extra)"}`
  );
  conferir(
    "e o valor que ele carrega vem da FATURA",
    /pagoCentavos: fatura\.centavos/.test(extraDoRenovou),
    "sem isto o evento volta a dizer que o ciclo virou e nada sobre quanto entrou"
  );
  conferir(
    "e quando a fatura não é lida, isso é DITO em vez de virar zero",
    /semValor/.test(extraDoRenovou),
    "ausente e zero nao podem virar a mesma coisa: receita sumiria com cara de cortesia"
  );
  conferir(
    "e diz de qual assinatura e de qual ciclo ele fala",
    /sub:/.test(extraDoRenovou) && /ciclo:/.test(extraDoRenovou),
    "sem os dois não há como cruzar o evento com a assinatura depois"
  );
}

// ── O VALOR DA PRIMEIRA COBRANCA (03/10/2026) ──────────────────────────────
//
// A renovacao ja dizia quanto entrou; a PRIMEIRA cobranca nao dizia, e e o mes
// 1 de todo cliente. Em 13 assinaturas, nenhum primeiro pagamento tem valor no
// funil. O valor vem da propria sessao do checkout, que ja chega com tudo.
{
  console.log("O valor da primeira cobranca, que vem do checkout:");

  const pago = valorDoCheckout({ payment_status: "paid", amount_total: 2990, currency: "BRL", invoice: "in_1" });
  conferir("checkout pago vira centavos", pago?.centavos === 2990, JSON.stringify(pago));
  conferir("e a moeda sai minuscula", pago?.moeda === "brl", JSON.stringify(pago));
  conferir("e o id da fatura viaja junto", pago?.fatura === "in_1", JSON.stringify(pago));

  // CUPOM DE 100%: o Stripe marca `no_payment_required`, e isso e ZERO MEDIDO.
  // Tratar como ausente faria o mes de cortesia sumir junto com o mes que
  // ninguem conseguiu ler, que e a confusao que o `semValor` existe para
  // evitar. E a campanha de 03/10 oferece exatamente um cupom de 100%, entao
  // este caso e o PROXIMO a acontecer, nao um caso de laboratorio.
  const cortesia = valorDoCheckout({ payment_status: "no_payment_required", amount_total: 0, currency: "brl" });
  conferir("cortesia e zero, e nao ausencia", cortesia?.centavos === 0, JSON.stringify(cortesia));
  conferir("e sem fatura no objeto o campo nao aparece", cortesia?.fatura === undefined, JSON.stringify(cortesia));

  // E O QUE NAO PODE VIRAR RECEITA.
  conferir("checkout nao pago nao vira valor", valorDoCheckout({ payment_status: "unpaid", amount_total: 2990 }) === null);
  conferir("sem payment_status nao vira valor", valorDoCheckout({ amount_total: 2990 }) === null);
  conferir(
    "valor ausente nao vira zero",
    valorDoCheckout({ payment_status: "paid", amount_total: null }) === null,
    "zero medido e ausencia nao podem virar a mesma coisa no caminho",
  );
  conferir("valor negativo nao passa", valorDoCheckout({ payment_status: "paid", amount_total: -1 }) === null);
  conferir(
    "fatura como objeto nao vira id de mentira",
    valorDoCheckout({ payment_status: "paid", amount_total: 100, invoice: { id: "in_x" } })?.fatura === undefined,
  );

  // A LIGACAO NA ROTA, que e onde o buraco morava: regra consertada na fonte
  // que o consumidor nao usa nao e conserto, e foi assim que cinco
  // conferencias desta casa ficaram verdes com o defeito de pe em 03/10.
  const rota = readFileSync(new URL("../app/api/stripe/webhook/route.ts", import.meta.url), "utf8");
  conferir("a rota importa a regra do valor do checkout", /import \{[^}]*valorDoCheckout[^}]*\} from "@\/lib\/ciclo"/.test(rota));
  conferir(
    "e a chama na sessao do checkout",
    /const pago = valorDoCheckout\(session\)/.test(rota),
    "sem isto o mes 1 continua sem caixa, com a regra escrita e ninguem usando",
  );
  conferir(
    "e o `assinou` carrega o valor quando ele existe",
    /funil\("assinou"[\s\S]{0,400}pagoCentavos: pago\.centavos/.test(rota),
    "a regra pode estar certa e o evento sair vazio do mesmo jeito",
  );
  conferir(
    "e diz `semValor` quando nao da para saber",
    /semValor: "checkout nao pago"/.test(rota),
    "evento sem campo nenhum nao distingue cortesia de leitura falhada",
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

// ── QUANTO ENTROU, E O CICLO QUE VENCEU SEM NINGUEM MEXER (02/10/2026) ─────
{
  console.log("Quanto entrou, e o ciclo que vencia sem ninguem olhar:");

  // A FATURA. `amount_paid` e dinheiro recebido; so fatura PAGA conta, porque
  // `open` e `draft` sao promessa e `void` e fatura que deixou de existir.
  const subComFatura = { latest_invoice: "in_123" } as unknown as Parameters<typeof faturaDaVirada>[0];
  const paga = await faturaDaVirada(subComFatura, async () => ({ status: "paid", amount_paid: 2990, currency: "BRL" }));
  conferir("fatura paga vira centavos", paga?.centavos === 2990, JSON.stringify(paga));
  conferir("e a moeda sai minuscula", paga?.moeda === "brl", JSON.stringify(paga));
  conferir("e o id da fatura viaja junto", paga?.fatura === "in_123", JSON.stringify(paga));

  // O CUPOM DE 100%: zero e resposta legitima, e precisa ser DIFERENTE de "nao
  // sei". Foi o que aconteceu na virada de 01/09.
  const cortesia = await faturaDaVirada(subComFatura, async () => ({ status: "paid", amount_paid: 0, currency: "brl" }));
  conferir("cortesia e zero, e nao ausencia", cortesia?.centavos === 0, JSON.stringify(cortesia));

  // FATURA PAGA SEM VALOR: ausencia, nao cortesia. Mesma armadilha achada no
  // `valorDoCheckout` em 03/10, plantada aqui porque o codigo era o mesmo.
  const semValor = await faturaDaVirada(subComFatura, async () => ({ status: "paid", amount_paid: null, currency: "brl" }));
  conferir("fatura paga sem amount_paid nao vira zero", semValor === null, JSON.stringify(semValor));

  for (const estado of ["open", "draft", "void", "uncollectible"]) {
    const f = await faturaDaVirada(subComFatura, async () => ({ status: estado, amount_paid: 2990, currency: "brl" }));
    conferir(`fatura ${estado} NAO vira receita`, f === null, JSON.stringify(f));
  }

  // NUNCA LANCA: perder o valor e ruim, perder o `renovou` por causa do valor
  // seria trocar um problema por outro pior.
  // O `try` aqui NAO e zelo: sem ele, uma versao de `faturaDaVirada` que
  // volte a lancar derruba o script inteiro, e script derrubado nao imprime
  // FALHA nenhuma. Foi o que aconteceu ao plantar este defeito em 02/10:
  // conferencia que morre nao provou nada, so pareceu ter provado.
  let explodiu: unknown = "nao rodou";
  try {
    explodiu = await faturaDaVirada(subComFatura, async () => { throw new Error("stripe fora do ar"); });
  } catch {
    explodiu = "LANCOU";
  }
  conferir("erro ao buscar a fatura nao derruba nada", explodiu === null, String(explodiu));
  const semFatura = await faturaDaVirada({} as Parameters<typeof faturaDaVirada>[0], async () => ({ status: "paid", amount_paid: 1 }));
  conferir("assinatura sem latest_invoice devolve nulo", semFatura === null);
  const objeto = await faturaDaVirada(
    { latest_invoice: { id: "in_obj" } } as unknown as Parameters<typeof faturaDaVirada>[0],
    async (id) => ({ status: "paid", amount_paid: 500, currency: "brl", id }) as never,
  );
  conferir("latest_invoice como objeto tambem e lido", objeto?.fatura === "in_obj", JSON.stringify(objeto));

  // O CICLO VENCIDO. A folga de um dia existe porque o webhook chega minutos
  // depois da virada, e alarme que dispara no minuto exato grita todo mes a toa.
  conferir("ciclo de ontem ainda nao e vencido (folga)", cicloVencido("2026-10-01T00:00:00Z", "2026-10-02") === false);
  conferir("ciclo de tres dias atras e vencido", cicloVencido("2026-09-29T00:00:00Z", "2026-10-02") === true);
  conferir("ciclo futuro nao e vencido", cicloVencido("2026-11-01T00:00:00Z", "2026-10-02") === false);
  conferir("sem ciclo nao inventa vencimento", cicloVencido(null, "2026-10-02") === false);
  conferir("lixo no lugar da data nao vira alarme", cicloVencido("nao e data", "2026-10-02") === false);

  const nenhuma = linhaDeCiclosVencidos([]);
  conferir("sem ciclo vencido o alarme cala", nenhuma.deveAvisar === false);
  conferir("e diz por que calou", /nenhuma assinatura ativa/.test(nenhuma.silencio), nenhuma.silencio);

  const uma = linhaDeCiclosVencidos([{ fim: "2026-09-29T00:00:00Z" }, { fim: "2026-09-20T00:00:00Z" }]);
  conferir("com ciclo vencido o alarme dispara", uma.deveAvisar === true);
  conferir("e diz quantas", /CICLO VENCIDO: 2/.test(uma.texto), uma.texto);
  conferir("e aponta a mais antiga", /mais antigo em 2026-09-20/.test(uma.texto), uma.texto);

  const operacao = readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8");
  conferir("o retrato publica os ciclos vencidos", /ciclosVencidos: linhaDeCiclosVencidos\(/.test(operacao));
  conferir(
    "e le o fim do ciclo do banco para isso",
    /select\("status[^"]*current_period_end"\)/.test(operacao),
    "sem a coluna na consulta, a regua recebe undefined e nunca acusa nada",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da renovação reprovaram.`);
  process.exit(1);
}
console.log("Renovação: o valor vem da fatura paga, e ciclo vencido com status ativo grita.");
