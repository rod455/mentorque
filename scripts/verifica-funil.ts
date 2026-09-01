// O funil só publica taxa quando a taxa quer dizer alguma coisa.
//
// Esta conferência nasce de um caso real (01/09/2026): o relatório do Diretor
// publicou 17 → 8 → 2 → 2 → 2 como se fosse um funil, com taxa entre os
// degraus. As contas estavam certas e os números não queriam dizer nada, por
// erro de UNIDADE: `abriu_app` dispara uma vez por sessão para quem estiver
// lá, e `cadastrou_carro` dispara no instante do ato e nunca mais. O de cima
// é estoque de todos, o de baixo é fluxo de novatos.
//
// O que ela protege:
//   1. ato dividido por evento de sessão não vira taxa, vira motivo
//   2. janela que começa antes de os dois serem mensuráveis não vira taxa
//   3. zero no degrau de cima é SEM MEDIÇÃO, não é 0%
//   4. a tabela MEDIDO_DESDE não pode ser mais nova que o primeiro evento
//      realmente gravado (essa parte é auditada contra o banco pelo Analista;
//      aqui a gente garante que a tabela existe e cobre todo evento)
//
// Rode com: npm run conferir:funil
import {
  CADEIA_ATO,
  CADEIA_SESSAO,
  MEDIDO_DESDE,
  NATUREZA,
  FONTE_MELHOR,
  RESSALVAS,
  degrau,
  degrausDaCadeia,
  janelaDaCadeia,
  janelaValida,
  podeComparar,
  type EventoFunil,
} from "../lib/funilCorreto.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const HOJE = "2026-09-01";
const CEDO = "2026-08-04"; // 28 dias antes, a janela que o /api/dados usa

// ── o caso real: o 17 → 2 que virou "taxa de ativação" ─────────────────────
{
  const d = degrau("abriu_app", "cadastrou_carro", 17, 2, CEDO);
  conferir("ato sobre sessão NÃO vira taxa", d.taxa === null, `taxa saiu: ${d.taxa}`);
  conferir("e o motivo diz por quê, com as duas naturezas", /ATO|SESS/i.test(d.motivo ?? ""), d.motivo ?? "(sem motivo)");
  conferir("o motivo nomeia os dois eventos", (d.motivo ?? "").includes("cadastrou_carro") && (d.motivo ?? "").includes("abriu_app"), d.motivo ?? "");
}

// ── dois de sessão se comparam ──────────────────────────────────────────────
{
  const d = degrau("abriu_app", "viu_paywall", 17, 8, HOJE);
  conferir("sessão com sessão vira taxa", d.taxa === 47.1, `taxa=${d.taxa}`);
  conferir("taxa boa não carrega motivo", d.motivo === null, String(d.motivo));
}

// ── dois atos se comparam ───────────────────────────────────────────────────
{
  const d = degrau("iniciou_checkout", "assinou", 2, 1, HOJE);
  conferir("ato com ato vira taxa", d.taxa === 50, `taxa=${d.taxa}`);
}

// ── a janela curta demais ───────────────────────────────────────────────────
{
  // cadastrou_carro só é mensurável desde 23/08; uma janela que abre em 04/08
  // daria 19 dias a mais de contagem para o degrau de cima.
  const d = degrau("abriu_trilha", "viu_paywall", 10, 3, CEDO);
  conferir("janela anterior ao instrumento NÃO vira taxa", d.taxa === null, `taxa=${d.taxa}`);
  conferir("e o motivo mostra as duas datas", (d.motivo ?? "").includes(CEDO) && (d.motivo ?? "").includes(d.validoDesde), d.motivo ?? "");

  const ok = degrau("abriu_trilha", "viu_paywall", 10, 3, "2026-08-25");
  conferir("a mesma comparação vale na janela certa", ok.taxa === 30, `taxa=${ok.taxa}`);
}

// ── zero em cima é SEM MEDIÇÃO, não 0% ─────────────────────────────────────
{
  const d = degrau("abriu_app", "viu_paywall", 0, 0, HOJE);
  conferir("degrau de cima vazio não vira 0%", d.taxa === null, `taxa=${d.taxa}`);
  conferir("e o motivo diz SEM MEDIÇÃO", /SEM MEDI/i.test(d.motivo ?? ""), d.motivo ?? "");
}

// ── evento técnico nunca é degrau ───────────────────────────────────────────
{
  const c = podeComparar("abriu_app", "atribuicao");
  conferir("atribuicao não é degrau de funil", c.ok === false);
  conferir("e o motivo diz que ela mede a medição", !c.ok && /medi/i.test(c.motivo), !c.ok ? c.motivo : "");
}

// ── a fonte do cadastro viaja junto com a taxa ─────────────────────────────
//
// O evento `cadastro` só dispara para conta criada há menos de 7 dias, e esse
// buraco NENHUM build conserta: a conta de 08/08 continua velha demais, hoje e
// sempre. Por isso a contagem sai de auth.users. Quem lê a taxa precisa saber
// disso na mesma linha, senão vai comparar com um número do evento e achar que
// um dos dois está errado.
{
  const d = degrau("cadastro", "iniciou_checkout", 4, 2, HOJE);
  conferir("a taxa sai", d.taxa === 50);
  conferir(
    "e a fonte de verdade vem junto, porque ela não some com janela boa",
    d.ressalvas.some((r) => r.includes("auth.users")),
    JSON.stringify(d.ressalvas),
  );
  conferir("o cadastro declara que tem fonte melhor que o evento", !!FONTE_MELHOR.cadastro);
  conferir(
    "e a declaração explica o buraco dos 7 dias",
    (FONTE_MELHOR.cadastro ?? "").includes("7 dias"),
    FONTE_MELHOR.cadastro ?? "",
  );
  // Ressalva e fonte melhor são listas diferentes e as duas viajam.
  conferir("RESSALVAS existe mesmo vazia, para não sumir a ideia", typeof RESSALVAS === "object");
}

// ── a tabela cobre todo evento, senão a regra tem buraco ───────────────────
{
  const eventos = Object.keys(NATUREZA) as EventoFunil[];
  const semData = eventos.filter((e) => !MEDIDO_DESDE[e]);
  conferir("todo evento declara desde quando é mensurável", semData.length === 0, semData.join(", "));
  const dataRuim = eventos.filter((e) => !/^\d{4}-\d{2}-\d{2}$/.test(MEDIDO_DESDE[e]));
  conferir("toda data está em aaaa-mm-dd", dataRuim.length === 0, dataRuim.join(", "));
}

// ── as cadeias publicadas são internamente comparáveis ─────────────────────
{
  for (const [nome, cadeia] of [["sessão", CADEIA_SESSAO], ["ato", CADEIA_ATO]] as const) {
    const naturezas = new Set(cadeia.map((e) => NATUREZA[e]));
    conferir(`a cadeia de ${nome} tem uma natureza só`, naturezas.size === 1, [...naturezas].join(", "));
  }
  const todos = [...CADEIA_SESSAO, ...CADEIA_ATO];
  conferir("nenhum evento técnico entrou numa cadeia", todos.every((e) => NATUREZA[e] !== "tecnico"));

  const degraus = degrausDaCadeia(CADEIA_ATO, new Map([["cadastro", 4], ["iniciou_checkout", 2], ["assinou", 1]]), HOJE);
  conferir("a cadeia de ato produz um degrau a menos que os eventos", degraus.length === CADEIA_ATO.length - 1);
  conferir("e todos os degraus dela têm taxa", degraus.every((d) => d.taxa !== null), JSON.stringify(degraus.map((d) => d.motivo)));
}

// ── a janela válida é a mais restritiva ────────────────────────────────────
{
  conferir(
    "janelaValida pega a data mais nova entre os eventos",
    janelaValida(["abriu_app", "cadastrou_carro"]) === "2026-08-23",
    janelaValida(["abriu_app", "cadastrou_carro"]),
  );
}

// ── a janela encurta em vez de recusar tudo ────────────────────────────────
//
// Recusar seria honesto e inútil: pedir 28 dias hoje abre antes de os eventos
// existirem, e jogar fora o funil inteiro por causa dos dias que não existem é
// trocar um número errado por nenhum número.
{
  const j = janelaDaCadeia([...CADEIA_SESSAO, ...CADEIA_ATO], CEDO);
  conferir("janela curta demais é ENCURTADA, não recusada", j.desde === "2026-08-22", j.desde);
  conferir("e o encurtamento é declarado", j.encurtada === true);
  conferir("com aviso que mostra as duas datas", (j.aviso ?? "").includes(CEDO) && (j.aviso ?? "").includes("2026-08-22"), j.aviso ?? "");

  // E com a janela já encurtada, a taxa SAI.
  const d = degrau("abriu_app", "viu_paywall", 18, 7, j.desde);
  conferir("com a janela encurtada a taxa sai", d.taxa === 38.9, `taxa=${d.taxa} motivo=${d.motivo}`);

  const folgada = janelaDaCadeia(CADEIA_SESSAO, "2026-08-25");
  conferir("janela que já cabe não é mexida", folgada.desde === "2026-08-25" && !folgada.encurtada);
  conferir("e não inventa aviso", folgada.aviso === null, String(folgada.aviso));
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de funil reprovaram.`);
  process.exit(1);
}
console.log("Funil: taxa só sai quando os dois degraus são da mesma natureza e a janela cobre os dois.");
