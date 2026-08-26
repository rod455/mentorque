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
  diasEntre,
  perguntaDoDia,
  respondeuHoje,
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

// ---- primeira resposta -----------------------------------------------------
let e: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-01", true);
ok("primeira resposta abre sequencia em 1", e.sequencia === 1, `seq=${e.sequencia}`);
ok("primeira resposta conta acerto", e.acertos === 1 && e.respostas === 1);
ok("recorde acompanha", e.recorde === 1);

// ---- dias seguidos ---------------------------------------------------------
e = aoResponder(e, "2026-09-02", false);
ok("errar NAO quebra a sequencia", e.sequencia === 2, `seq=${e.sequencia}`);
ok("errar nao conta acerto", e.acertos === 1 && e.respostas === 2);
e = aoResponder(e, "2026-09-03", true);
ok("terceiro dia seguido", e.sequencia === 3);

// ---- responder duas vezes no mesmo dia -------------------------------------
const antes = e;
e = aoResponder(e, "2026-09-03", true);
ok("segunda resposta no mesmo dia nao conta", e === antes && e.sequencia === 3);
ok("respondeuHoje enxerga o dia ja respondido", respondeuHoje(e, "2026-09-03"));
ok("respondeuHoje e falso no dia seguinte", !respondeuHoje(e, "2026-09-04"));

// ---- o perdao --------------------------------------------------------------
// Pulou 04, volta no 05: perdao disponivel, sequencia segue.
ok("tem perdao antes de gastar", temPerdao(e, "2026-09-05"));
e = aoResponder(e, "2026-09-05", true);
ok("um dia pulado com perdao mantem a sequencia", e.sequencia === 4, `seq=${e.sequencia}`);
ok("o perdao foi gasto", e.perdaoEm === "2026-09-05");
ok("nao tem perdao logo depois de gastar", !temPerdao(e, "2026-09-06"));

// Pula de novo dentro dos 7 dias: agora zera.
e = aoResponder(e, "2026-09-07", true);
ok("segundo pulo dentro da semana zera", e.sequencia === 1, `seq=${e.sequencia}`);
ok("recorde nao diminui", e.recorde === 4, `rec=${e.recorde}`);
ok("perdao gasto continua marcado no dia antigo", e.perdaoEm === "2026-09-05");

// Passados 7 dias do perdao anterior, ganha outro.
ok("perdao volta depois de 7 dias", temPerdao(e, "2026-09-12"));

// ---- dois dias pulados nao tem perdao --------------------------------------
let f: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-01", true);
f = aoResponder(f, "2026-09-02", true);
f = aoResponder(f, "2026-09-05", true); // pulou 03 e 04
ok("dois dias pulados zeram mesmo com perdao na mao", f.sequencia === 1, `seq=${f.sequencia}`);
ok("perdao nao foi gasto a toa", f.perdaoEm === null);

// ---- sequenciaHoje ---------------------------------------------------------
let g: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-01", true);
g = aoResponder(g, "2026-09-02", true);
g = aoResponder(g, "2026-09-03", true); // seq 3
ok("no proprio dia mostra a sequencia", sequenciaHoje(g, "2026-09-03") === 3);
ok("no dia seguinte ainda mostra (da para continuar)", sequenciaHoje(g, "2026-09-04") === 3);
ok("com um dia pulado e perdao, ainda mostra", sequenciaHoje(g, "2026-09-05") === 3);
ok("com dois dias pulados, mostra zero", sequenciaHoje(g, "2026-09-06") === 0);
ok("sumiu ha duas semanas mostra zero", sequenciaHoje(g, "2026-09-20") === 0);
ok("estado zerado mostra zero", sequenciaHoje(QUIZ_ZERADO, "2026-09-01") === 0);

// Sem perdao disponivel, o dia pulado ja aparece como zero ANTES de responder.
let h: EstadoQuiz = aoResponder(QUIZ_ZERADO, "2026-09-01", true);
h = aoResponder(h, "2026-09-03", true); // gasta o perdao, seq 2
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

// ---- um ano de uso real ----------------------------------------------------
// Responde todo dia por 365 dias: a sequencia tem de bater exatamente.
let ano: EstadoQuiz = QUIZ_ZERADO;
for (let i = 0; i < 365; i++) {
  const d = new Date(Date.UTC(2026, 0, 1 + i));
  ano = aoResponder(ano, d.toISOString().slice(0, 10), i % 3 !== 0);
}
ok("365 dias seguidos dao sequencia 365", ano.sequencia === 365, `seq=${ano.sequencia}`);
ok("365 respostas contadas", ano.respostas === 365);

console.log(falhas ? `\n${falhas} verificacao(oes) falharam.` : "\nTodas as verificacoes passaram.");
process.exit(falhas ? 1 : 0);
