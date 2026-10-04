// O alarme de erros dispara por razão, e desistência não conta como defeito?
//
// POR QUE ISTO EXISTE (29/09/2026). Em 28/09 a casa escreveu a regra "alarme é
// sempre uma razão, nunca uma contagem" em três lugares: no SQL do
// denominador, no campo de `/api/dados` e na linha do retrato. E o Vigia, o
// único que manda e-mail para o dono, continuou disparando em
// `erros7d.total >= 20`, com 23 relatos no retrato do dia. O conserto não
// chegou a quem consome, pela terceira vez na mesma semana.
//
// O que esta conferência protege:
//   1. a decisão de avisar sai da RAZÃO (aparelhos com defeito / ativos), e
//      nunca de uma contagem de relatos;
//   2. desistência ("cancelled by user") NÃO entra na conta de defeito: eram 7
//      dos 16 aparelhos, e contá-los é o alarme medindo a instrumentação;
//   3. a razão só é legível depois que a janela de 7 dias inteira cai depois
//      de 19/09, quando o aparelho passou a vir no relato. Antes disso, a
//      subida de 0,7% para 2,8% é a janela ENCHENDO, não piora;
//   4. o silêncio é EXPLICADO. Alarme que cala sem dizer por que é
//      indistinguível de alarme quebrado;
//   5. o retrato PUBLICA a linha e a decisão, senão elas existem e ninguém
//      usa, que é palavra por palavra o que aconteceu em 23/09 com as colunas
//      de maturidade das coortes.
//
// O QUE ELA NÃO ALCANÇA: o e-mail é montado no nó do n8n. Esta conferência
// garante que a decisão certa SAIA por `/api/dados`; imprimir `alarme.texto`
// em vez de recalcular é um passo no painel, e ele está feito e publicado
// (28/09 ensinou que salvar no n8n não publica: o fluxo roda a versão ativa).
//
// Rode com: npm run conferir:alarme
import { readFileSync } from "node:fs";
import {
  APARELHO_NO_ERRO_DESDE,
  MINIMO_DE_ATIVOS,
  RAZAO_LEGIVEL_DESDE,
  TETO_DE_APARELHOS_COM_DEFEITO,
  alarmeDeErros,
  classeDoErro,
  contaDeErros,
  diasEntre,
  linhaDeErros,
} from "../lib/alarmeDeErros.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

console.log("Alarme de erros: razão, e não contagem?");

// ── 1. AS DATAS DA JANELA ───────────────────────────────────────────────────
{
  conferir("o aparelho entra no relato desde 19/09/2026", APARELHO_NO_ERRO_DESDE === "2026-09-19", APARELHO_NO_ERRO_DESDE);
  conferir("e a razão fica inteira 7 dias depois", RAZAO_LEGIVEL_DESDE === "2026-09-26", RAZAO_LEGIVEL_DESDE);
  conferir("dias entre duas datas atravessa o mês", diasEntre("2026-09-27", "2026-10-02") === 5, String(diasEntre("2026-09-27", "2026-10-02")));
}

// ── 2. A CLASSE DE CADA MENSAGEM REAL DO BANCO ──────────────────────────────
//
// Todas estas estavam em `app_erros` na janela de 28/09, copiadas como estão.
{
  const casos: [string, string][] = [
    ["login nativo google: Google Sign-In cancelled by user ([16] Cancelled by user.) package=mentorque.app", "desistencia"],
    ["login nativo google: Google Sign-In cancelled by user (User cancelled the selector) package=mentorque.app", "desistencia"],
    ["app fechou sozinho em: abriu o app", "defeito"],
    ["push: sem rede ao registrar o token", "ambiente"],
    ["login nativo google: Google Sign-In failed: [16] Account reauth failed.", "defeito"],
    ['"LocalNotifications.then()" is not implemented on ios', "defeito"],
    ["login nativo apple: The operation couldn’t be completed.", "defeito"],
  ];
  for (const [msg, esperada] of casos) {
    conferir(`"${msg.slice(0, 48)}" é ${esperada}`, classeDoErro(msg) === esperada, classeDoErro(msg));
  }
  conferir("mensagem vazia não derruba a régua", classeDoErro("") === "defeito");
  conferir("nulo também não", classeDoErro(null) === "defeito");
}

// ── 3. A JANELA REAL DE 28/09, QUE IA DISPARAR O ALARME DE NOVO ─────────────
//
// 23 relatos, 16 aparelhos, 321 ativos. O Vigia disparava em `total >= 20`.
// Por defeito são 9 aparelhos em 321, 2,8%: não é incidente, e o alarme tem
// de calar E DIZER POR QUE.
{
  const relatos = [
    ...Array.from({ length: 11 }, (_, i) => ({ mensagem: "app fechou sozinho em: abriu o app", anon_id: `f${i % 6}` })),
    ...Array.from({ length: 7 }, (_, i) => ({ mensagem: "Google Sign-In cancelled by user ([16] Cancelled by user.)", anon_id: `c${i}` })),
    { mensagem: "push: sem rede ao registrar o token", anon_id: "r1" },
    { mensagem: "login nativo google: Google Sign-In failed: [16] Account reauth failed.", anon_id: "d1" },
    { mensagem: '"LocalNotifications.then()" is not implemented on ios', anon_id: "d2" },
    { mensagem: "login nativo apple: The operation couldn’t be completed.", anon_id: "d3" },
  ];
  const c = contaDeErros(relatos);
  conferir("conta todos os relatos", c.relatos === 22, String(c.relatos));
  conferir("9 aparelhos com defeito", c.porClasse.defeito.aparelhos === 9, String(c.porClasse.defeito.aparelhos));
  conferir("7 com desistência", c.porClasse.desistencia.aparelhos === 7, String(c.porClasse.desistencia.aparelhos));
  conferir("1 com ambiente", c.porClasse.ambiente.aparelhos === 1, String(c.porClasse.ambiente.aparelhos));
  conferir("e o mesmo aparelho não conta duas vezes", c.aparelhos === 17, String(c.aparelhos));

  const ativos = { android: 264, web: 46, ios: 11 };
  const a = alarmeDeErros(c, ativos, "2026-09-29", { mensagem: "app fechou sozinho em: abriu o app", total: 11, aparelhos: 6, ultimo: "2026-09-29" });
  conferir("2,8% dos aparelhos NÃO dispara alarme", a.deveAvisar === false, a.texto);
  conferir("e o silêncio diz o número e o teto", /2\.8%/.test(a.silencio) && /teto de 10%/.test(a.silencio), a.silencio);

  const l = linhaDeErros(c, ativos, "2026-09-29");
  conferir("a linha do retrato é legível hoje", l.legivel === true, l.motivo);
  conferir("e traz a razão por defeito", /9 de 321 aparelhos ativos com defeito \(2\.8%\)/.test(l.texto), l.texto);
  conferir("e separa a desistência na frase", /desistencia/.test(l.texto), l.texto);
  conferir(
    "e NÃO apresenta os 22 relatos como se fossem defeito",
    !/22 relatos.*defeito em 9/.test(l.texto.replace(/;.*/, "")),
    l.texto,
  );
}

// ── 4. O INCIDENTE DE VERDADE DISPARA ───────────────────────────────────────
//
// A régua não pode virar um muro que nunca avisa: foi para isso que ela existe.
{
  const relatos = Array.from({ length: 60 }, (_, i) => ({ mensagem: "app fechou sozinho em: abriu o app", anon_id: `x${i}` }));
  const c = contaDeErros(relatos);
  const a = alarmeDeErros(c, { android: 200 }, "2026-10-10", { mensagem: "app fechou sozinho em: abriu o app", total: 60, aparelhos: 60, ultimo: "2026-10-10" });
  conferir("60 de 200 aparelhos (30%) dispara", a.deveAvisar === true, a.silencio);
  conferir("o e-mail diz a razão", /60 de 200 aparelhos ativos/.test(a.texto), a.texto);
  conferir("e diz QUAL é o defeito", /app fechou sozinho/.test(a.texto), a.texto);
  conferir("sem silêncio sobrando", a.silencio === "", a.silencio);
}

// ── 5. DESISTÊNCIA EM MASSA NÃO DISPARA ─────────────────────────────────────
//
// O caso que o alarme antigo errava por construção: 60 pessoas fechando a tela
// de login é sinal de produto, não defeito, e não acorda ninguém às 7h30.
{
  const relatos = Array.from({ length: 60 }, (_, i) => ({ mensagem: "Google Sign-In cancelled by user ([16] Cancelled by user.)", anon_id: `y${i}` }));
  const c = contaDeErros(relatos);
  const a = alarmeDeErros(c, { android: 200 }, "2026-10-10");
  conferir("60 desistências NÃO disparam", a.deveAvisar === false, a.texto);
  conferir("e o silêncio explica que não há defeito", /nenhum aparelho com defeito/.test(a.silencio), a.silencio);
}

// ── 6. ANTES DE 26/09 A RAZÃO NÃO PODE SER LIDA ─────────────────────────────
{
  const c = contaDeErros(Array.from({ length: 40 }, (_, i) => ({ mensagem: "app fechou sozinho", anon_id: `z${i}` })));
  const a = alarmeDeErros(c, { android: 200 }, "2026-09-24");
  conferir("em 24/09 o alarme cala", a.deveAvisar === false, a.texto);
  conferir("e diz que a razão fica inteira em 26/09", /2026-09-26/.test(a.silencio), a.silencio);

  const l = linhaDeErros(c, { android: 200 }, "2026-09-24");
  conferir("a linha do retrato também não se diz legível", l.legivel === false, l.motivo);
  conferir("e marca o número como PISO", /PISO/.test(l.texto), l.texto);
}

// ── 7. POUCA GENTE ATIVA: RAZÃO SEM SENTIDO ─────────────────────────────────
//
// 2 de 3 aparelhos é 67% e não é incidente nenhum. Dividir por um número
// pequeno é o jeito mais fácil de fabricar um alarme.
{
  const c = contaDeErros([{ mensagem: "app fechou sozinho", anon_id: "a" }, { mensagem: "app fechou sozinho", anon_id: "b" }]);
  const a = alarmeDeErros(c, { android: 3 }, "2026-10-10");
  conferir("com 3 ativos o alarme cala", a.deveAvisar === false, a.texto);
  conferir("e diz que a razão não tem sentido", /3 aparelhos ativos/.test(a.silencio), a.silencio);
  conferir(
    "o mínimo de ativos é uma constante, e não um número solto no meio do código",
    MINIMO_DE_ATIVOS >= 30,
    String(MINIMO_DE_ATIVOS),
  );
  const l = linhaDeErros(c, { android: 3 }, "2026-10-10");
  conferir("e a linha do retrato diz SEM DENOMINADOR", /SEM DENOMINADOR/.test(l.texto), l.texto);
}

// ── 8. OCORRÊNCIA VELHA DENTRO DA JANELA É DITA ─────────────────────────────
//
// Regra de 19/09: o aviso do push saiu cinco dias seguidos sobre um erro que a
// 2.6 já tinha consertado, porque as ocorrências velhas seguiam na janela.
{
  const c = contaDeErros(Array.from({ length: 40 }, (_, i) => ({ mensagem: "app fechou sozinho", anon_id: `w${i}` })));
  const a = alarmeDeErros(c, { android: 200 }, "2026-10-10", { mensagem: "app fechou sozinho", total: 40, aparelhos: 40, ultimo: "2026-10-05" });
  conferir("ainda dispara (a razão estourou)", a.deveAvisar === true, a.silencio);
  conferir("mas avisa que a última ocorrência é velha", /ocorrencia velha|5 dias atras/.test(a.texto), a.texto);
}

// ── 9. E O TETO É UM TETO, NÃO UM CHÃO ──────────────────────────────────────
{
  conferir("o teto está em 10%", TETO_DE_APARELHOS_COM_DEFEITO === 0.1, String(TETO_DE_APARELHOS_COM_DEFEITO));
  const c = contaDeErros(Array.from({ length: 20 }, (_, i) => ({ mensagem: "app fechou sozinho", anon_id: `v${i}` })));
  // 20 de 200 é exatamente 10%: em cima do teto dispara, porque teto que só
  // pega o que passa deixa o caso de borda calado para sempre.
  const a = alarmeDeErros(c, { android: 200 }, "2026-10-10", null);
  conferir("exatamente no teto, dispara", a.deveAvisar === true, a.silencio);
  const b = alarmeDeErros(contaDeErros(Array.from({ length: 19 }, (_, i) => ({ mensagem: "app fechou sozinho", anon_id: `u${i}` }))), { android: 200 }, "2026-10-10", null);
  conferir("um abaixo do teto, cala", b.deveAvisar === false, b.texto);
}

// ── 10. E O RETRATO PUBLICA A LINHA E A DECISÃO ─────────────────────────────
{
  const operacao = readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8");
  conferir("o retrato publica a linha de erros", /linha: linhaDeErros\(/.test(operacao));
  conferir("e a decisão de alarme", /alarme: alarmeDeErros\(/.test(operacao));
  conferir("e a conta por classe", /porClasse: contagemDeErros\.porClasse/.test(operacao));
  conferir(
    "o pior defeito é escolhido pela classe, e não o primeiro do top",
    /classeDoErro\(t\.mensagem\) === "defeito"/.test(operacao),
    'sem isso o e-mail aponta para "Google Sign-In cancelled by user", que é desistência',
  );
}


// ── 5. A DESISTÊNCIA CHEGA COM O TIPO DESDE A 3.0 (04/10/2026) ──────────────
//
// A origem passou a dizer o que é: `relatarLoginNativo` grava
// `tipo = "desistencia"` quando a frase é de cancelamento, e o leitor aceita
// o tipo antes da frase. As linhas antigas continuam classificadas pela
// frase, porque não têm tipo.
{
  conferir("tipo desistencia vence a frase", classeDoErro("login nativo google: Google Sign-In failed: [16] Account reauth failed.", "desistencia") === "desistencia");
  conferir("tipo erro não muda a leitura pela frase", classeDoErro("login nativo google: Google Sign-In cancelled by user", "erro") === "desistencia");
  conferir("sem tipo, a frase decide", classeDoErro("app fechou sozinho em: abriu o app", null) === "defeito");
  const c = contaDeErros([
    { mensagem: "login nativo apple: The operation couldn’t be completed.", anon_id: "t1", tipo: "desistencia" },
    { mensagem: "login nativo apple: The operation couldn’t be completed.", anon_id: "t2", tipo: "erro" },
  ]);
  conferir("contaDeErros lê o tipo da linha", c.porClasse.desistencia.aparelhos === 1 && c.porClasse.defeito.aparelhos === 1, JSON.stringify(c.porClasse));
  const operacao = readFileSync(new URL("../lib/operacao.ts", import.meta.url), "utf8");
  conferir("o retrato pede a coluna tipo ao ler app_erros", /app_erros"\)\.select\("[^"]*\btipo\b/.test(operacao), "sem a coluna, o tipo gravado na origem nunca chega ao leitor");
  const erros = readFileSync(new URL("../lib/app/erros.ts", import.meta.url), "utf8");
  conferir("a origem grava o tipo pela MESMA régua do leitor", /classeDoErro\(motivo\) === "desistencia" \? "desistencia" : "erro"/.test(erros), "duas réguas para a mesma frase é o jeito de a origem e o leitor discordarem");
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) do alarme de erros reprovaram.`);
  process.exit(1);
}
console.log("Alarme de erros: dispara por razão, separa desistência de defeito, e explica o silêncio.");
