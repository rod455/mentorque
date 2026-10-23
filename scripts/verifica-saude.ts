// O número da saúde do carro diz de onde ele veio?
//
// POR QUE ISTO EXISTE (21/10/2026, varredura dirigida do quiz de saúde, que
// estava na fila desde 07/10). O quiz tem 13 perguntas e produz três números
// que a pessoa lê direto na tela: a saúde (score), o VHS e o VRI. Dois achados
// saíram da varredura, e a diferença entre eles é o que esta conferência
// guarda.
//
// O PRIMEIRO ERA TEORIA E FICOU DESARMADO: `hasQuiz` na tela é
// `Object.keys(quiz).length > 0`, então UMA resposta de treze viraria
// "diagnóstico baseado no seu quiz" com doze notas padrão por baixo. Medido no
// banco: 378 carros, 300 com zero respostas, 78 com as treze, e NENHUM parcial.
// Não existe porque a folha do quiz não deixa salvar incompleto (botão
// desabilitado e retorno antecipado no `submit`). A trava é o que torna
// `hasQuiz` honesto, e ela mora numa tela, longe de quem lê o número: se um dia
// entrar "continuar depois" ou gravação automática, o rótulo passa a mentir em
// silêncio. É esta conferência que grita nesse dia.
//
// O SEGUNDO ERA REAL E FOI CONSERTADO: o km cai para `idade * 12000` quando o
// odômetro não foi informado, e esse componente tem o MAIOR peso do VRI (0,25).
// A tela mostrava o VRI como número próprio dizendo "baseado no seu quiz", sem
// ressalva. Em 21/10: 222 dos 378 carros sem odômetro, e 25 deles com o quiz
// completo. Tamanho medido, para ninguém ler como urgente: 0 a 2 pontos no
// score, até 6 no VRI exibido sozinho.
//
// Rode com: npm run conferir:saude
import { readFileSync } from "node:fs";
import { HEALTH_QUESTIONS, computeQuizHealth } from "../lib/app/healthQuiz.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");
/** O fonte sem comentário: conferência de texto só vale sobre o que o motor executa. */
const semComentarios = (f: string) => f.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const completo: Record<string, string> = {};
for (const q of HEALTH_QUESTIONS) completo[q.id] = q.opts[Math.floor(q.opts.length / 2)]!.key;

// ── 1. O KM ESTIMADO VIAJA NO RESULTADO ────────────────────────────────────
{
  const comKm = computeQuizHealth(completo, { year: 2015, odometerKm: 60000 } as never);
  const semKm = computeQuizHealth(completo, { year: 2015 } as never);

  conferir("km informado NÃO é marcado como estimado", comKm.kmEstimado === false);
  conferir("km ausente É marcado como estimado", semKm.kmEstimado === true);

  // Odômetro zero é o mesmo que não informado: ninguém roda com zero, e o
  // cálculo já tratava assim. Se a marca não acompanhasse, o zero viraria km
  // medido de 0 e o carro apareceria como novíssimo.
  const kmZero = computeQuizHealth(completo, { year: 2015, odometerKm: 0 } as never);
  conferir("odômetro zero conta como estimado", kmZero.kmEstimado === true, JSON.stringify(kmZero));

  // E a marca não pode mentir para o outro lado: carro novo com km informado
  // continua medido.
  const novo = computeQuizHealth(completo, { year: 2026, odometerKm: 1200 } as never);
  conferir("carro novo com km informado não é estimado", novo.kmEstimado === false);
}

// ── 2. O TAMANHO DO EFEITO, QUE É O QUE IMPEDE A DRAMATIZAÇÃO ──────────────
//
// Esta asserção não protege um invariante de produto: ela protege a FRASE que
// eu publiquei ("0 a 2 pontos no score, até 6 no VRI"). Se alguém mudar os
// pesos, a frase do diário de 21/10 passa a estar errada e ninguém saberia.
{
  const real = computeQuizHealth(completo, { year: 2008, odometerKm: 90000 } as never);
  const estimado = computeQuizHealth(completo, { year: 2008 } as never);
  const difScore = Math.abs(real.score - estimado.score);
  const difVri = Math.abs(real.vri - estimado.vri);
  // O LIMITE É O NÚMERO DE HOJE, E NÃO UMA FOLGA, e descobri isso plantando:
  // com `<= 3` eu dobrei o peso do VRI no score (0,2 para 0,4) e a asserção
  // passou verde, porque a folga absorvia a mudança. Asserção que existe para
  // tornar uma frase publicada falsificável tem que apertar no valor publicado.
  conferir(
    "o km estimado move o SCORE em no máximo 2 pontos",
    difScore <= 2,
    `moveu ${difScore}: a frase do diário de 21/10 ("0 a 2 pontos no score") precisa ser reescrita`,
  );
  // E o parâmetro de que a frase depende, lido na fonte: é o peso do VRI no
  // score que mantém o efeito pequeno. Mexer nele é mexer na conclusão.
  const regra = semComentarios(leia("lib/app/healthQuiz.ts"));
  conferir(
    "o VRI entra no score com peso 0,2",
    /0\.8 \* vhsFinal \+ 0\.2 \* \(100 - vri\)/.test(regra),
    "o efeito pequeno do km estimado vem deste peso: mudá-lo muda o tamanho do achado",
  );
  conferir(
    "e o VRI move mais, que é por isso que a ressalva fica na tela",
    difVri >= 3,
    `moveu ${difVri}: se o VRI parou de se mexer, a ressalva perdeu o motivo e vale reler`,
  );
}

// ── 3. QUEM USA A REGRA: A TELA MOSTRA A RESSALVA ──────────────────────────
//
// A família de asserção que deixou cinco conferências desta casa verdes com
// defeito de pé em 03/10: a regra pode estar certa e ninguém chamar.
{
  const tela = semComentarios(leia("components/app/screens/Health.tsx"));
  const texto = leia("lib/app/content.ts");

  conferir(
    "a tela mostra a ressalva do km estimado",
    /result\.kmEstimado\s*&&/.test(tela),
    "o campo existir sem a tela olhar é o mesmo que não existir",
  );
  conferir(
    "e usa a string de conteúdo, não texto solto",
    /h\.quizKmEstimado/.test(tela) && /quizKmEstimado:\s*T\(/.test(texto),
    "texto cravado na tela não traduz e não passa pela conferência de travessão",
  );
  conferir(
    "a ressalva NÃO substitui o 'baseado no seu quiz'",
    /h\.quizBasedOn/.test(tela),
    "o quiz foi respondido mesmo: sumir com a confirmação trocaria um erro por outro",
  );
}

// ── 4. A TRAVA QUE TORNA `hasQuiz` HONESTO ─────────────────────────────────
//
// Esta é a asserção do achado que ficou DESARMADO, e ela existe justamente
// porque o defeito não existe hoje. `hasQuiz` é "tem pelo menos uma chave", e o
// que o salva é a folha não deixar salvar incompleto. As duas coisas moram em
// lugares diferentes e nenhuma enxerga a outra.
{
  const tela = semComentarios(leia("components/app/screens/Health.tsx"));

  conferir(
    "a folha do quiz só salva com tudo respondido",
    /const allDone = answered === total;/.test(tela),
    "sem a trava, uma resposta de treze passa a valer como quiz completo",
  );
  conferir(
    "e o `submit` volta atrás quando falta resposta",
    /if \(!allDone\) return;/.test(tela),
    "o botão desabilitado sozinho não basta: toque duplo e teclado chegam no submit",
  );
  conferir(
    "o botão fica desabilitado enquanto falta resposta",
    /disabled=\{!allDone\}/.test(tela),
    "sem isto a pessoa toca e nada acontece, que é pior que o botão apagado",
  );
  conferir(
    "o rótulo de quiz respondido continua exigindo pelo menos uma resposta",
    /Object\.keys\(v\.quiz\)\.length/.test(tela),
    "se este rótulo passar a ser sempre verdadeiro, carro sem quiz nenhum vira diagnóstico",
  );
}

// ── 5. QUEM ABRE, QUEM TERMINA, E O KM PEDIDO NA SAÚDE (22/10/2026) ───────
//
// A trava de cima tem um preço: desistir no meio não deixa rastro. Os dois
// eventos separam "nunca abriu" de "abriu e saiu". O `completou` só pode sair
// DEPOIS da trava, senão conta quem tocou no botão com resposta faltando. O
// caminho da tela (abrir, informar o km, salvar) está na suíte de navegador
// `km`; daqui só o que ela não alcança sem responder as catorze perguntas.
{
  const tela = semComentarios(leia("components/app/screens/Health.tsx"));
  const submit = tela.slice(tela.indexOf("const submit = () => {"), tela.indexOf("back();", tela.indexOf("const submit = () => {")));
  conferir(
    "terminar o quiz conta, e só depois da trava",
    /if \(!allDone\) return;[\s\S]*updateVehicle\(v\.id, \{ quiz: answers[\s\S]*funil\("completou_quiz_saude"/.test(submit),
    "o evento antes do `if (!allDone) return` conta quem não terminou",
  );
  conferir("abrir e terminar levam a mesma origem (primeira ou refazer)", /funil\("abriu_quiz_saude", \{ origem: origemDoQuiz/.test(tela) && /funil\("completou_quiz_saude", \{ origem: origemDoQuiz/.test(tela));
  const funilCorreto = leia("lib/funilCorreto.ts");
  conferir(
    "os três eventos novos entram no banco, na rota e no funil",
    ["abriu_quiz_saude", "completou_quiz_saude", "informou_km"].every(
      (e) => leia("supabase/funil_eventos.sql").includes(`'${e}'`) && leia("app/api/funil/route.ts").includes(`"${e}"`) && funilCorreto.includes(`${e}: "2026-10-22"`),
    ),
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da saúde reprovaram.`);
  process.exit(1);
}
console.log(
  "Saúde: o km estimado viaja no resultado e aparece na tela, o efeito medido\n" +
    "continua pequeno no score, e a trava que torna o rótulo honesto está de pé.",
);
