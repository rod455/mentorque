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
  CADEIA_PRIMEIRA_SESSAO,
  CADEIA_SESSAO,
  MEDIDO_DESDE,
  NATUREZA,
  UNIDADE,
  FONTE_MELHOR,
  RESSALVAS,
  degrau,
  degrausDaCadeia,
  janelaDaCadeia,
  janelaValida,
  podeComparar,
  type EventoFunil,
} from "../lib/funilCorreto.ts";
import { readFileSync } from "node:fs";

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
//
// O par aqui era `iniciou_checkout → assinou`, e ele ERA a demonstração de que
// ato com ato vira taxa. Deixou de servir em 05/09/2026, quando entrou a regra
// do espaço de identidade: aqueles dois são atos, sim, mas um é contado por
// aparelho e o outro por conta. O exemplo agora é um par que fica do mesmo
// lado da fronteira, e o par antigo virou o caso de teste da trava nova.
{
  const d = degrau("cadastro", "iniciou_checkout", 2, 1, HOJE);
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

// ── ATO NÃO RESPONDE "QUANTOS TÊM" ─────────────────────────────────────────
//
// O caso, de 05/09/2026: eu publiquei uma tabela com "cadastrou_carro: 2" e,
// na mesma resposta, "10 veículos cadastrados". O dono leu as duas juntas e
// perguntou como é que 2 vira 10. As duas estavam certas: 2 é quantos
// aparelhos cadastraram DENTRO da janela, 10 é quantos veículos as contas TÊM
// hoje, somados desde antes de o instrumento existir.
//
// A regra já estava escrita em prosa aqui e em supabase/estado_da_base.sql. O
// que faltava era ela viajar GRUDADA no degrau: prosa não acompanha a tabela
// que alguém cola numa resposta.
{
  const d = degrau("abriu_cadastro_de_carro", "cadastrou_carro", 10, 2, "2026-09-03");
  conferir("a taxa do formulário sai", d.taxa === 20, `taxa=${d.taxa} motivo=${d.motivo}`);
  conferir(
    "e ela viaja com o aviso de que ato não é estoque",
    d.ressalvas.some((r) => r.includes("estado_da_base")),
    JSON.stringify(d.ressalvas),
  );
  conferir("o cadastrou_carro declara que tem fonte melhor", !!FONTE_MELHOR.cadastrou_carro);
  conferir(
    "e a declaração diz que é ATO e aponta para onde está o estoque",
    /ATO/.test(FONTE_MELHOR.cadastrou_carro ?? "") && (FONTE_MELHOR.cadastrou_carro ?? "").includes("estado_da_base"),
    FONTE_MELHOR.cadastrou_carro ?? "",
  );
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
  for (const [nome, cadeia] of [["sessão", CADEIA_SESSAO], ["ato", CADEIA_ATO], ["primeira sessão", CADEIA_PRIMEIRA_SESSAO]] as const) {
    const naturezas = new Set(cadeia.map((e) => NATUREZA[e]));
    conferir(`a cadeia de ${nome} tem uma natureza só`, naturezas.size === 1, [...naturezas].join(", "));
  }
  const todos = [...CADEIA_SESSAO, ...CADEIA_ATO, ...CADEIA_PRIMEIRA_SESSAO];
  conferir("nenhum evento técnico entrou numa cadeia", todos.every((e) => NATUREZA[e] !== "tecnico"));

  const degraus = degrausDaCadeia(CADEIA_ATO, new Map([["cadastro", 4], ["iniciou_checkout", 2], ["assinou", 1]]), HOJE);
  conferir("a cadeia de ato produz um degrau a menos que os eventos", degraus.length === CADEIA_ATO.length - 1);

  // O PRIMEIRO degrau vira taxa; o SEGUNDO não pode virar, e é resultado, não
  // falta. `assinou` chega pelo webhook da cobrança e é contado por conta,
  // enquanto `iniciou_checkout` acontece no aparelho e é contado por anon_id.
  conferir("cadastro → checkout vira taxa (os dois no aparelho)", degraus[0].taxa === 50, `taxa=${degraus[0].taxa}`);
  conferir("checkout → assinou NÃO vira taxa", degraus[1].taxa === null, `taxa saiu: ${degraus[1].taxa}`);
  conferir(
    "e o motivo fala em aparelho e conta",
    /APARELHO/.test(degraus[1].motivo ?? "") && /CONTA/.test(degraus[1].motivo ?? ""),
    degraus[1].motivo ?? "(sem motivo)",
  );
}

// ── A FRONTEIRA ENTRE APARELHO E CONTA ─────────────────────────────────────
//
// O caso real de 05/09/2026, medido com `funil_canonico` na janela de 01/09:
//
//   iniciou_checkout   3 pessoas   3 aparelhos   3 contas
//   assinou            1 pessoa    0 aparelhos   1 conta
//
// A régua oficial (`public.identidade`) usa anon_id com user_id de reserva, e
// é isso que faz a armadilha ser invisível: os dois números existem, os dois
// são plausíveis, e a divisão dá 33%. Só que quem assinou não está, e nunca
// vai estar, dentro da lista de quem iniciou: são chaves de espaços
// diferentes. Antes desta regra, esse 33% saía impresso.
{
  const d = degrau("iniciou_checkout", "assinou", 3, 1, HOJE);
  conferir("aparelho sobre conta NÃO vira taxa", d.taxa === null, `taxa saiu: ${d.taxa}`);
  conferir("o motivo nomeia os dois eventos", (d.motivo ?? "").includes("iniciou_checkout") && (d.motivo ?? "").includes("assinou"), d.motivo ?? "");
  conferir("e explica que são listas de chaves diferentes", /chaves diferentes/.test(d.motivo ?? ""), d.motivo ?? "");

  // A trava é simétrica: não adianta inverter a ordem para escapar dela.
  const invertido = podeComparar("assinou", "cadastro");
  conferir("a trava vale nos dois sentidos", invertido.ok === false, JSON.stringify(invertido));

  // E não pode ser tão zelosa a ponto de recusar o que é legítimo.
  conferir("dois eventos de aparelho continuam comparáveis", podeComparar("cadastro", "iniciou_checkout").ok === true);
  conferir("dois eventos de conta continuam comparáveis", podeComparar("assinou", "cancelou").ok === true);

  const semUnidade = (Object.keys(NATUREZA) as EventoFunil[]).filter((e) => !UNIDADE[e]);
  conferir("todo evento declara em que espaço de identidade nasce", semUnidade.length === 0, semUnidade.join(", "));
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

// ── a cadeia da primeira sessão ────────────────────────────────────────────
//
// Ela existe para separar dois consertos OPOSTOS: quem nunca chega ao
// formulário (problema de descoberta) e quem chega e desiste (problema de
// formulário). Se ela deixar de ser comparável, volta a ser caixa preta.
{
  conferir(
    "a cadeia da primeira sessão NÃO começa por abriu_app",
    !CADEIA_PRIMEIRA_SESSAO.includes("abriu_app"),
    "abriu_app é de sessão: abrir a cadeia com ele é fluxo sobre estoque outra vez",
  );
  conferir(
    "ela abre por comecou_onboarding",
    CADEIA_PRIMEIRA_SESSAO[0] === "comecou_onboarding",
    CADEIA_PRIMEIRA_SESSAO[0],
  );
  conferir(
    "ela termina em cadastrou_carro",
    CADEIA_PRIMEIRA_SESSAO[CADEIA_PRIMEIRA_SESSAO.length - 1] === "cadastrou_carro",
  );
  conferir(
    "ela tem o degrau que separa 'não achou' de 'desistiu'",
    CADEIA_PRIMEIRA_SESSAO.includes("abriu_cadastro_de_carro"),
  );

  const pessoas = new Map<EventoFunil, number>([
    ["comecou_onboarding", 100],
    ["terminou_onboarding", 60],
    ["abriu_cadastro_de_carro", 30],
    ["cadastrou_carro", 24],
  ]);
  const ds = degrausDaCadeia(CADEIA_PRIMEIRA_SESSAO, pessoas, "2026-09-01");
  conferir("os três degraus saem com taxa", ds.every((d) => d.taxa !== null), JSON.stringify(ds.map((d) => d.motivo)));
  conferir("e as taxas conferem", ds.map((d) => d.taxa).join(",") === "60,50,80", ds.map((d) => d.taxa).join(","));

  // Antes da 1.6 chegar aos aparelhos, a janela de 28 dias abre antes do
  // instrumento: é SEM MEDIÇÃO, e tem que dizer isso em vez de mostrar zero.
  const cedo = degrausDaCadeia(CADEIA_PRIMEIRA_SESSAO, new Map(), CEDO);
  conferir("antes do instrumento, nenhum degrau inventa taxa", cedo.every((d) => d.taxa === null));
  conferir("e todos trazem motivo", cedo.every((d) => !!d.motivo), JSON.stringify(cedo.map((d) => d.motivo)));
}

// ── A LISTA DE EVENTOS MORA EM QUATRO LUGARES ──────────────────────────────
//
// Esta é a armadilha mais cara do funil, e ela já mordeu: um evento novo
// declarado no app e esquecido na rota é recusado com 400, e a métrica some em
// silêncio. Esquecido no `check` do banco, o insert é recusado. Esquecido na
// NATUREZA, o funil não sabe se pode dividir.
//
// A conferência lê os quatro arquivos e exige que digam a mesma coisa.
{
  const ler = (caminho: string) => readFileSync(new URL(caminho, import.meta.url), "utf8");
  const nomes = (texto: string, re: RegExp) =>
    new Set([...texto.matchAll(re)].map((m) => m[1]));

  const tipoApp = ler("../lib/app/funil.ts");
  const rota = ler("../app/api/funil/route.ts");
  const sql = ler("../supabase/funil_eventos.sql");

  // O tipo do app: as alternativas da união EventoFunil.
  const bloco = tipoApp.slice(tipoApp.indexOf("export type EventoFunil"), tipoApp.indexOf(";", tipoApp.indexOf("export type EventoFunil")));
  const noApp = nomes(bloco, /\|\s*"([a-z_]+)"/g);

  const blocoRota = rota.slice(rota.indexOf("EVENTOS_DO_APP"), rota.indexOf("]);", rota.indexOf("EVENTOS_DO_APP")));
  const naRota = nomes(blocoRota, /"([a-z_]+)"/g);

  const blocoSql = sql.slice(sql.indexOf("check (evento in ("), sql.indexOf("))", sql.indexOf("check (evento in (")));
  const noBanco = nomes(blocoSql, /'([a-z_]+)'/g);

  const naRegra = new Set(Object.keys(NATUREZA));

  conferir("o app declara os três eventos da primeira sessão", ["comecou_onboarding", "terminou_onboarding", "abriu_cadastro_de_carro"].every((e) => noApp.has(e)), [...noApp].join(", "));

  const faltandoNaRota = [...noApp].filter((e) => !naRota.has(e));
  conferir(
    "todo evento do app é aceito pela rota /api/funil",
    faltandoNaRota.length === 0,
    faltandoNaRota.length ? `${faltandoNaRota.join(", ")} seriam recusados com 400 e a métrica sumiria em silêncio` : "",
  );

  const faltandoNoBanco = [...noApp].filter((e) => !noBanco.has(e));
  conferir(
    "todo evento do app cabe no check do banco",
    faltandoNoBanco.length === 0,
    faltandoNoBanco.length ? `${faltandoNoBanco.join(", ")} teriam o insert recusado` : "",
  );

  const faltandoNaRegra = [...noApp].filter((e) => !naRegra.has(e));
  conferir(
    "todo evento do app tem natureza declarada",
    faltandoNaRegra.length === 0,
    faltandoNaRegra.length ? `${faltandoNaRegra.join(", ")}: o funil não saberia se pode dividir` : "",
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) de funil reprovaram.`);
  process.exit(1);
}
console.log("Funil: taxa só sai quando os dois degraus são da mesma natureza e a janela cobre os dois.");
