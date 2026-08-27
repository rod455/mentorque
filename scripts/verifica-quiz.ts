// Conferência da regra do quiz diário. Rode com `npm run verifica:quiz`.
//
// Existe porque tudo aqui é aritmética de data, e aritmética de data errada
// não dá erro: dá o número errado, calado, meses depois. Uma sequência de 40
// dias apagada por um fuso horário não volta, e a pessoa também não.
//
// Roda no node puro (--experimental-strip-types), sem instalar nada. Se um dia
// o projeto ganhar um executor de testes de verdade, este arquivo vira o
// primeiro caso dele sem precisar ser reescrito.
import {
  QUIZ_ZERADO,
  aoResponder,
  aoResponderPassado,
  diasEntre,
  mesclarQuiz,
  perguntaDoDia,
  respondeuHoje,
  respostaDe,
  sequenciaHoje,
  temPerdao,
  type EstadoQuiz,
} from "../lib/app/quiz/sequencia.ts";

let falhas = 0;
function ok(nome: string, condicao: boolean, extra = "") {
  if (!condicao) falhas++;
  console.log(`${condicao ? "✓" : "✗"} ${nome}${extra ? "  " + extra : ""}`);
}

// ---- diasEntre -------------------------------------------------------------
ok("mesmo dia = 0", diasEntre("2026-08-26", "2026-08-26") === 0);
ok("dia seguinte = 1", diasEntre("2026-08-26", "2026-08-27") === 1);
ok("virada de mes", diasEntre("2026-08-31", "2026-09-01") === 1);
ok("virada de ano", diasEntre("2026-12-31", "2027-01-01") === 1);
ok("ano bissexto", diasEntre("2028-02-28", "2028-02-29") === 1);
ok("para tras = negativo", diasEntre("2026-08-27", "2026-08-26") === -1);
ok("uma semana", diasEntre("2026-08-20", "2026-08-27") === 7);
// Inicio e fim do horario de verao do hemisferio norte, onde o dia tem 23h/25h.
ok("entrada do horario de verao (EUA)", diasEntre("2026-03-07", "2026-03-09") === 2);
ok("saida do horario de verao (EUA)", diasEntre("2026-10-31", "2026-11-02") === 2);

// Atalho: o que interessa nestas conferencias e a REGRA de data, nao qual
// opcao foi tocada. A pergunta e a escolha vao fixas.
const resp = (acertou: boolean) => ({ perguntaId: "p", escolha: 0, acertou });

// ---- primeira resposta -----------------------------------------------------
let e: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-01", resp(true));
ok("primeira resposta abre sequencia em 1", e.sequencia === 1, `seq=${e.sequencia}`);
ok("primeira resposta conta acerto", e.acertos === 1 && e.respostas === 1);
ok("recorde acompanha", e.recorde === 1);

// ---- dias seguidos ---------------------------------------------------------
e = aoResponder(e, "2026-09-02", resp(false));
ok("errar NAO quebra a sequencia", e.sequencia === 2, `seq=${e.sequencia}`);
ok("errar nao conta acerto", e.acertos === 1 && e.respostas === 2);
e = aoResponder(e, "2026-09-03", resp(true));
ok("terceiro dia seguido", e.sequencia === 3);

// ---- responder duas vezes no mesmo dia -------------------------------------
const antes = e;
e = aoResponder(e, "2026-09-03", resp(true));
ok("segunda resposta no mesmo dia nao conta", e === antes && e.sequencia === 3);
ok("respondeuHoje enxerga o dia ja respondido", respondeuHoje(e, "2026-09-03"));
ok("respondeuHoje e falso no dia seguinte", !respondeuHoje(e, "2026-09-04"));

// ---- o perdao --------------------------------------------------------------
// Pulou 04, volta no 05: perdao disponivel, sequencia segue.
ok("tem perdao antes de gastar", temPerdao(e, "2026-09-05"));
e = aoResponder(e, "2026-09-05", resp(true));
ok("um dia pulado com perdao mantem a sequencia", e.sequencia === 4, `seq=${e.sequencia}`);
ok("o perdao foi gasto", e.perdaoEm === "2026-09-05");
ok("nao tem perdao logo depois de gastar", !temPerdao(e, "2026-09-06"));

// Pula de novo dentro dos 7 dias: agora zera.
e = aoResponder(e, "2026-09-07", resp(true));
ok("segundo pulo dentro da semana zera", e.sequencia === 1, `seq=${e.sequencia}`);
ok("recorde nao diminui", e.recorde === 4, `rec=${e.recorde}`);
ok("perdao gasto continua marcado no dia antigo", e.perdaoEm === "2026-09-05");

// Passados 7 dias do perdao anterior, ganha outro.
ok("perdao volta depois de 7 dias", temPerdao(e, "2026-09-12"));

// ---- dois dias pulados nao tem perdao --------------------------------------
let f: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-01", resp(true));
f = aoResponder(f, "2026-09-02", resp(true));
f = aoResponder(f, "2026-09-05", resp(true)); // pulou 03 e 04
ok("dois dias pulados zeram mesmo com perdao na mao", f.sequencia === 1, `seq=${f.sequencia}`);
ok("perdao nao foi gasto a toa", f.perdaoEm === null);

// ---- sequenciaHoje ---------------------------------------------------------
let g: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-01", resp(true));
g = aoResponder(g, "2026-09-02", resp(true));
g = aoResponder(g, "2026-09-03", resp(true)); // seq 3
ok("no proprio dia mostra a sequencia", sequenciaHoje(g, "2026-09-03") === 3);
ok("no dia seguinte ainda mostra (da para continuar)", sequenciaHoje(g, "2026-09-04") === 3);
ok("com um dia pulado e perdao, ainda mostra", sequenciaHoje(g, "2026-09-05") === 3);
ok("com dois dias pulados, mostra zero", sequenciaHoje(g, "2026-09-06") === 0);
ok("sumiu ha duas semanas mostra zero", sequenciaHoje(g, "2026-09-20") === 0);
ok("estado zerado mostra zero", sequenciaHoje(QUIZ_ZERADO, "2026-09-01") === 0);

// Sem perdao disponivel, o dia pulado ja aparece como zero ANTES de responder.
let h: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-01", resp(true));
h = aoResponder(h, "2026-09-03", resp(true)); // gasta o perdao, seq 2
ok("sem perdao, um dia pulado ja mostra zero", sequenciaHoje(h, "2026-09-05") === 0, `seq=${sequenciaHoje(h, "2026-09-05")}`);

// ---- pergunta do dia -------------------------------------------------------
const banco = Array.from({ length: 65 }, (_, i) => ({
  id: `p${i}`, aula: "x", pergunta: "?", opcoes: ["a", "b"], correta: 0, porque: "",
}));
const p1 = perguntaDoDia(banco, "2026-09-01");
ok("o primeiro dia da rotacao e a pergunta 2 do banco", p1?.id === "p1", `saiu ${p1?.id}`);
ok("a pergunta 1 nunca sai na rotacao diaria",
  Array.from({ length: 200 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 8, 1 + i));
    return perguntaDoDia(banco, d.toISOString().slice(0, 10))?.id;
  }).every((id) => id !== "p0"));
ok("dias diferentes, perguntas diferentes",
  perguntaDoDia(banco, "2026-09-01")?.id !== perguntaDoDia(banco, "2026-09-02")?.id);
ok("o mesmo dia sempre da a mesma pergunta",
  perguntaDoDia(banco, "2026-10-15")?.id === perguntaDoDia(banco, "2026-10-15")?.id);
ok("da a volta depois de 64 dias",
  perguntaDoDia(banco, "2026-09-01")?.id === perguntaDoDia(banco, "2026-11-04")?.id,
  `${perguntaDoDia(banco, "2026-09-01")?.id} vs ${perguntaDoDia(banco, "2026-11-04")?.id}`);
ok("data anterior a epoca nao quebra", !!perguntaDoDia(banco, "2026-01-05"));
ok("banco de uma pergunta so nao quebra", perguntaDoDia([banco[0]], "2026-09-10")?.id === "p0");

// ---- juntar nuvem e aparelho -----------------------------------------------
// Este bloco existe por um defeito real: `mergeSessions` montava a sessao campo
// a campo e nao tinha `quiz`. Logado, toda recarga passava por ali e a resposta
// do dia evaporava.
const q = (ultimoDia: string | null, sequencia: number, recorde = sequencia, perdaoEm: string | null = null, respostas = sequencia, acertos = sequencia): EstadoQuiz =>
  ({ ultimoDia, sequencia, recorde, perdaoEm, respostas, acertos });

ok("sem nuvem, vale o aparelho", mesclarQuiz(undefined, q("2026-09-03", 3))?.sequencia === 3);
ok("sem aparelho, vale a nuvem", mesclarQuiz(q("2026-09-03", 3), undefined)?.sequencia === 3);
ok("os dois vazios dao vazio", mesclarQuiz(undefined, undefined) === undefined);

// O caso do defeito: respondeu AGORA no aparelho, a nuvem ainda esta em ontem.
{
  const m = mesclarQuiz(q("2026-09-02", 1), q("2026-09-03", 2))!;
  ok("a resposta mais nova vence a nuvem atrasada", m.ultimoDia === "2026-09-03" && m.sequencia === 2, `${m.ultimoDia} seq=${m.sequencia}`);
}
// E o contrario: respondeu em outro aparelho e este esta velho.
{
  const m = mesclarQuiz(q("2026-09-05", 5), q("2026-09-02", 2))!;
  ok("a nuvem mais nova vence o aparelho atrasado", m.ultimoDia === "2026-09-05" && m.sequencia === 5, `${m.ultimoDia} seq=${m.sequencia}`);
}
// Dia e sequencia andam juntos: nunca o dia de um com o numero do outro.
{
  const m = mesclarQuiz(q("2026-09-02", 40), q("2026-09-03", 2))!;
  ok("nao mistura o dia de um com a sequencia do outro", m.ultimoDia === "2026-09-03" && m.sequencia === 2, `${m.ultimoDia} seq=${m.sequencia}`);
  ok("mas o recorde antigo sobrevive", m.recorde === 40, `rec=${m.recorde}`);
}
// Mesmo dia dos dois lados: fica a sequencia maior.
{
  const m = mesclarQuiz(q("2026-09-03", 3), q("2026-09-03", 7))!;
  ok("mesmo dia fica com a sequencia maior", m.sequencia === 7, `seq=${m.sequencia}`);
}
// Perdao gasto num aparelho conta no outro.
{
  const m = mesclarQuiz(q("2026-09-03", 3, 3, "2026-09-01"), q("2026-09-03", 3, 3, null))!;
  ok("perdao gasto na nuvem conta no aparelho", m.perdaoEm === "2026-09-01", String(m.perdaoEm));
  const n = mesclarQuiz(q("2026-09-03", 3, 3, "2026-09-01"), q("2026-09-03", 3, 3, "2026-09-02"))!;
  ok("entre dois perdoes fica o mais recente", n.perdaoEm === "2026-09-02", String(n.perdaoEm));
}
// Totais sao maximo, nunca soma.
{
  const m = mesclarQuiz(q("2026-09-03", 3, 3, null, 30, 20), q("2026-09-03", 3, 3, null, 28, 19))!;
  ok("respostas e acertos sao o maximo, nao a soma", m.respostas === 30 && m.acertos === 20, `${m.respostas}/${m.acertos}`);
}
// Nuvem sem nenhum dia (conta nova) e aparelho com resposta de hoje.
{
  const m = mesclarQuiz(QUIZ_ZERADO, q("2026-09-03", 1))!;
  ok("conta nova na nuvem nao apaga a resposta do aparelho", m.ultimoDia === "2026-09-03" && m.sequencia === 1, `${m.ultimoDia} seq=${m.sequencia}`);
}

// ---- historico e responder o passado ---------------------------------------
// O calendario depende inteiro disto: sem historico nao ha o que remostrar, e
// se responder o passado alimentasse a sequencia bastaria uma tarde
// preenchendo o mes para o app exibir 30 dias que nunca aconteceram.
{
  let h: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-10", { perguntaId: "p7", escolha: 2, acertou: true });
  ok("responder guarda o dia no historico", respostaDe(h, "2026-09-10")?.perguntaId === "p7");
  ok("guarda a opcao escolhida", respostaDe(h, "2026-09-10")?.escolha === 2);
  ok("dia sem resposta devolve null", respostaDe(h, "2026-09-09") === null);

  // O passado: entra no historico e nos totais, e nao encosta na sequencia.
  const seqAntes = h.sequencia;
  h = aoResponderPassado(h, "2026-09-05", { perguntaId: "p2", escolha: 0, acertou: false });
  ok("responder o passado guarda a resposta", respostaDe(h, "2026-09-05")?.perguntaId === "p2");
  ok("responder o passado NAO mexe na sequencia", h.sequencia === seqAntes, `seq=${h.sequencia}`);
  ok("responder o passado NAO mexe no ultimo dia", h.ultimoDia === "2026-09-10", String(h.ultimoDia));
  ok("responder o passado NAO gasta perdao", h.perdaoEm === null);
  ok("responder o passado conta no total", h.respostas === 2 && h.acertos === 1, `${h.respostas}/${h.acertos}`);

  // Primeira resposta e a que vale, dos dois lados.
  const congelado = h;
  h = aoResponderPassado(h, "2026-09-05", { perguntaId: "p2", escolha: 1, acertou: true });
  ok("dia passado ja respondido nao e sobrescrito", h === congelado);
  const antesDeHoje = h;
  h = aoResponder(h, "2026-09-10", { perguntaId: "p7", escolha: 0, acertou: false });
  ok("dia de hoje ja respondido nao e sobrescrito", h === antesDeHoje);

  ok("historico fica em ordem de data", (h.historico ?? []).map((r) => r.dia).join() === "2026-09-05,2026-09-10");

  // Teto: o historico sobe para a nuvem a cada mudanca, entao nao pode crescer
  // para sempre.
  let longo: EstadoQuiz = QUIZ_ZERADO;
  for (let i = 0; i < 500; i++) {
    const d = new Date(Date.UTC(2025, 0, 1 + i));
    longo = aoResponder(longo, d.toISOString().slice(0, 10), resp(true));
  }
  ok("historico respeita o teto", (longo.historico ?? []).length === 400, `n=${(longo.historico ?? []).length}`);
  ok("o teto corta o comeco, nao o fim", respostaDe(longo, "2026-05-15") !== null && respostaDe(longo, "2025-01-01") === null);
}

// Juntar historicos de dois aparelhos: a UNIAO, um registro por dia.
{
  const comH = (dias: string[], ultimoDia: string, sequencia: number): EstadoQuiz => ({
    ultimoDia, sequencia, recorde: sequencia, perdaoEm: null, respostas: dias.length, acertos: dias.length,
    historico: dias.map((dia) => ({ dia, perguntaId: "p", escolha: 0, acertou: true })),
  });
  const m = mesclarQuiz(comH(["2026-09-01", "2026-09-02"], "2026-09-02", 2), comH(["2026-09-02", "2026-09-03"], "2026-09-03", 3))!;
  ok("historico junta os dois lados sem duplicar dia", (m.historico ?? []).map((r) => r.dia).join() === "2026-09-01,2026-09-02,2026-09-03");
  ok("total nao fica abaixo do historico", m.respostas === 3, `resp=${m.respostas}`);
}
// Dia presente nos dois: fica o da nuvem.
{
  const um = (perguntaId: string, escolha: number): EstadoQuiz => ({
    ultimoDia: "2026-09-01", sequencia: 1, recorde: 1, perdaoEm: null, respostas: 1, acertos: 1,
    historico: [{ dia: "2026-09-01", perguntaId, escolha, acertou: true }],
  });
  const m = mesclarQuiz(um("nuvem", 1), um("aparelho", 2))!;
  ok("dia repetido fica com o da nuvem", respostaDe(m, "2026-09-01")?.perguntaId === "nuvem");
}
// Aparelho sem historico nenhum (versao antiga do app) nao apaga o da nuvem.
{
  const nuvem: EstadoQuiz = {
    ultimoDia: "2026-09-02", sequencia: 2, recorde: 2, perdaoEm: null, respostas: 2, acertos: 2,
    historico: [{ dia: "2026-09-02", perguntaId: "p", escolha: 0, acertou: true }],
  };
  const m = mesclarQuiz(nuvem, q("2026-09-02", 2))!;
  ok("aparelho sem historico nao apaga o da nuvem", (m.historico ?? []).length === 1);
}

// ---- um ano de uso real ----------------------------------------------------
// Responde todo dia por 365 dias: a sequencia tem de bater exatamente.
let ano: EstadoQuiz = QUIZ_ZERADO;
for (let i = 0; i < 365; i++) {
  const d = new Date(Date.UTC(2026, 0, 1 + i));
  ano = aoResponder(ano, d.toISOString().slice(0, 10), resp(i % 3 !== 0));
}
ok("365 dias seguidos dao sequencia 365", ano.sequencia === 365, `seq=${ano.sequencia}`);
ok("365 respostas contadas", ano.respostas === 365);

console.log(falhas ? `\n${falhas} verificacao(oes) falharam.` : "\nTodas as verificacoes passaram.");
process.exit(falhas ? 1 : 0);
