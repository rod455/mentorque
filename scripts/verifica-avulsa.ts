// A compra avulsa: o que cada produto libera, quem paga cada pergunta, e as
// portas do servidor que não podem vazar.
//
// POR QUE (09/11/2026). O dono decidiu os formatos e os preços em 05/11 e, em
// 08/11, que no Android a compra passa pelo Stripe, fora do app. Um defeito
// aqui não aparece como tela quebrada: aparece como pergunta de graça para
// todo mundo, como crédito comido de quem pagou, ou como um pacote de R$ 1,90
// virando Premium.
//
// Rode com: npm run conferir:avulsa
import { readFileSync } from "node:fs";
import {
  cabemAinda, creditosRestantes, ehProdutoAvulso, oQueACompraLibera, PRODUTOS, quemPagaAPergunta,
  SALDO_VAZIO, TETO_DO_PASSE_POR_DIA, type Saldo,
} from "../lib/avulsa/direito.ts";
import { anonSeguro, filtroDeDono, sessaoAvulsaPaga } from "../lib/avulsa/servidor.ts";
import { voltaDaCompra } from "../lib/app/voltaDaCompra.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
const leia = (caminho: string) => semComentarios(readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8"));

console.log("Compra avulsa: produtos, quem paga a pergunta e as portas do servidor.");

// ── os produtos, com os preços do dono (05/11) ─────────────────────────────
{
  conferir("pacote de 2 por R$ 1,90", PRODUTOS.pacote_2.centavos === 190 && PRODUTOS.pacote_2.perguntas === 2);
  conferir("pacote de 10 por R$ 4,90", PRODUTOS.pacote_10.centavos === 490 && PRODUTOS.pacote_10.perguntas === 10);
  conferir("passe de 7 dias por R$ 9,90", PRODUTOS.passe_7d.centavos === 990 && PRODUTOS.passe_7d.dias === 7 && PRODUTOS.passe_7d.perguntas === null);
  conferir("teto de uso justo do passe: 30 por dia", TETO_DO_PASSE_POR_DIA === 30);
  conferir("produto inventado não passa", !ehProdutoAvulso("premium") && !ehProdutoAvulso("toString") && ehProdutoAvulso("pacote_2"));
  const pago = new Date("2026-11-09T12:00:00Z");
  const passe = oQueACompraLibera("passe_7d", pago);
  conferir("o passe vale 7 dias a partir do pagamento", passe.passeAte?.toISOString() === "2026-11-16T12:00:00.000Z" && passe.perguntas === null, String(passe.passeAte?.toISOString()));
  const pacote = oQueACompraLibera("pacote_10", pago);
  conferir("o pacote não dá passe", pacote.passeAte === null && pacote.perguntas === 10);
}

// ── quem paga a pergunta ───────────────────────────────────────────────────
{
  const agora = new Date("2026-11-09T12:00:00Z");
  const base = { premium: false, gratisFeitasNoMes: 0, limiteGratis: 1, saldo: SALDO_VAZIO, agora };
  const comCredito: Saldo = { ...SALDO_VAZIO, creditosComprados: 2, creditosUsados: 0 };
  const comPasse: Saldo = { ...SALDO_VAZIO, passeAte: new Date("2026-11-10T00:00:00Z") };
  const passeVencido: Saldo = { ...SALDO_VAZIO, passeAte: new Date("2026-11-09T11:59:59Z") };

  const d1 = quemPagaAPergunta(base);
  conferir("sem nada comprado, a primeira do mês é grátis", d1.pode && d1.pagoCom === null);
  const d2 = quemPagaAPergunta({ ...base, gratisFeitasNoMes: 1 });
  conferir("sem nada comprado, a segunda é recusada", !d2.pode && d2.motivo === "limite");
  const d3 = quemPagaAPergunta({ ...base, saldo: comCredito });
  conferir("com crédito, a grátis do mês sai antes (o crédito não é comido)", d3.pode && d3.pagoCom === null);
  const d4 = quemPagaAPergunta({ ...base, gratisFeitasNoMes: 1, saldo: comCredito });
  conferir("grátis usada e crédito sobrando: paga com crédito", d4.pode && d4.pagoCom === "credito");
  const d5 = quemPagaAPergunta({ ...base, gratisFeitasNoMes: 1, saldo: { ...comCredito, creditosUsados: 2 } });
  conferir("crédito acabado: recusa", !d5.pode);
  const d6 = quemPagaAPergunta({ ...base, gratisFeitasNoMes: 1, saldo: comPasse });
  conferir("passe valendo: pode, pago com passe", d6.pode && d6.pagoCom === "passe");
  const d7 = quemPagaAPergunta({ ...base, gratisFeitasNoMes: 1, saldo: { ...comPasse, perguntasDoPasseHoje: 30 } });
  conferir("passe no teto do dia: recusa com motivo próprio", !d7.pode && d7.motivo === "teto_do_passe");
  const d8 = quemPagaAPergunta({ ...base, gratisFeitasNoMes: 1, saldo: passeVencido });
  conferir("passe vencido não vale", !d8.pode);
  const d9 = quemPagaAPergunta({ ...base, premium: true, gratisFeitasNoMes: 99, saldo: comCredito });
  conferir("Premium não gasta crédito", d9.pode && d9.pagoCom === null);

  conferir("o saldo diz quantas cabem: grátis + créditos", cabemAinda({ ...base, saldo: comCredito }) === 3);
  conferir("com passe, o saldo é nulo (sem teto a mostrar)", cabemAinda({ ...base, saldo: comPasse }) === null);
  conferir("crédito restante nunca negativo", creditosRestantes({ ...SALDO_VAZIO, creditosComprados: 1, creditosUsados: 5 }) === 0);
}

// ── as portas do servidor ──────────────────────────────────────────────────
{
  conferir("id de aparelho com vírgula ou parêntese não entra no filtro", anonSeguro("a,user_id.eq.x") === null && anonSeguro("abc)") === null);
  conferir("id de aparelho normal entra", anonSeguro("4eee7ae7-2a90-4c7a-aee0-ef5f5280ba1f") === "4eee7ae7-2a90-4c7a-aee0-ef5f5280ba1f");
  conferir("sem conta e sem aparelho, não há dono", filtroDeDono(null, null) === null);
  conferir("conta e aparelho entram juntos no filtro", filtroDeDono("00000000-0000-0000-0000-000000000000", "abc") === "user_id.eq.00000000-0000-0000-0000-000000000000,anon_id.eq.abc");
  const paga = { id: "cs_test_123456789", mode: "payment", payment_status: "paid", metadata: { tipo: "avulsa", produto: "pacote_2", anon_id: "abc" } };
  conferir("sessão avulsa paga é reconhecida", sessaoAvulsaPaga(paga));
  conferir("sessão não paga não grava", !sessaoAvulsaPaga({ ...paga, payment_status: "unpaid" }));
  conferir("assinatura não é compra avulsa", !sessaoAvulsaPaga({ ...paga, mode: "subscription" }));
  conferir("produto fora da lista não grava", !sessaoAvulsaPaga({ ...paga, metadata: { ...paga.metadata, produto: "premium" } }));

  const webhook = leia("app/api/stripe/webhook/route.ts");
  const i = webhook.indexOf('session.metadata?.tipo === "avulsa"');
  const j = webhook.indexOf("if (session.subscription)");
  conferir("o webhook separa a avulsa ANTES de tocar na assinatura", i > 0 && j > i);
  const ramo = i > 0 ? webhook.slice(i, j) : "";
  conferir("e o ramo avulso termina sem upsertSubscription", /break;/.test(ramo) && !/upsertSubscription/.test(ramo));
  conferir("e lança quando a compra paga não grava (o Stripe reenvia)", /throw new Error/.test(ramo));

  const biela = leia("app/api/biela/route.ts");
  conferir("a Biela consulta o direito antes de recusar", /quemPagaAPergunta\(/.test(biela) && /decisao \? !decisao\.pode : !podePerguntar/.test(biela));
  conferir("com a avulsa ligada, o grátis conta só a pergunta não paga", /avulsa \? q0\.is\("pago_com", null\) : q0/.test(biela));
  conferir("pago_com só vai no insert com a avulsa ligada (sem a coluna, o insert falharia)", /\.\.\.\(avulsa \? \{ pago_com: pagoCom \} : \{\}\)/.test(biela));
  conferir("a avulsa só liga quando a tabela existe", /avulsa = await avulsaPronta\(admin\)/.test(biela));

  const orc = leia("app/api/orcamento/route.ts");
  conferir("o passe libera o orçamento", /comPasse = passeValendo\(/.test(orc) && /if \(!premium && !comPasse\)/.test(orc));

  const confirmar = leia("app/api/avulsa/confirmar/route.ts");
  conferir("a confirmação só grava sessão DESTA pessoa", /daPessoa/.test(confirmar) && /if \(!daPessoa\) compra = "recusou"/.test(confirmar));
  const checkout = leia("app/api/avulsa/checkout/route.ts");
  conferir("o checkout é pagamento único em real", /mode: "payment"/.test(checkout) && /currency: "brl"/.test(checkout) && /unit_amount: p\.centavos/.test(checkout));
  conferir("o checkout marca a sessão como avulsa", /tipo: "avulsa"/.test(checkout));
}

// ── a volta do Stripe ──────────────────────────────────────────────────────
{
  const app = voltaDaCompra("?sessao=cs_live_abcdefghij&de=app");
  conferir("no app, volta pelo mentorque://compra com a sessão", app.tipo === "app" && app.url === "mentorque://compra?compra=cs_live_abcdefghij", app.url);
  const web = voltaDaCompra("?sessao=cs_live_abcdefghij&de=web");
  conferir("na web, volta para o /app com a sessão", web.tipo === "web" && web.url === "/app?compra=cs_live_abcdefghij", web.url);
  const torta = voltaDaCompra("?sessao=javascript:alert(1)&de=app");
  conferir("sessão sem forma de sessão do Stripe não passa", torta.url === "mentorque://compra", torta.url);
  const cancelou = voltaDaCompra("?cancelou=1&de=app");
  conferir("cancelado volta avisando", cancelou.cancelou && cancelou.url === "mentorque://compra?compra=cancelou", cancelou.url);
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da compra avulsa reprovaram.`);
  process.exit(1);
}
console.log("Compra avulsa: produtos, regra, servidor e volta conferidos.");
