// A pergunta do onboarding não se confunde com o quiz diário.
//
// Esta conferência nasce da varredura de 07/10/2026, e o defeito que ela pega
// não é de código: é de LEITURA, a doença que esta casa perseguiu setembro
// inteiro. A tabela `quiz_respostas` tem duas populações dentro, e na primeira
// tentativa desta própria rodada eu somei as duas e publiquei "média de 5
// respostas por dia" como participação no quiz. Não era: das 373 linhas, 314
// são de UMA pergunta, a do onboarding, respondida uma vez por cada pessoa que
// instala. O quiz diário tem 1,7 por dia.
//
// A view `quiz_participacao` (supabase/quiz_respostas.sql) separa as duas, e
// separa comparando o `pergunta_id` com um id ESCRITO À MÃO no SQL, porque SQL
// não importa TypeScript. Esse é o ponto frágil: a fonte da verdade é
// `perguntaDoOnboarding(perguntasDoQuiz())`, que devolve `perguntas[0]`. Quem
// reordenar o banco de perguntas, ou renomear o id da primeira, deixa a view
// separando a população errada EM SILÊNCIO, e o próximo agente volta a somar
// instalação com uso.
//
// O que ela protege:
//   1. o id no SQL é o mesmo que o código chama de pergunta do onboarding
//   2. a pergunta do onboarding continua FORA da rotação diária (senão um dia
//      por ciclo o quiz do dia seria a pergunta que todo mundo já respondeu)
//   3. a view existe no arquivo, com as duas populações nomeadas
//
// Rode com: npm run conferir:quiz-populacao
import { readFileSync } from "node:fs";
import { perguntaDoOnboarding, perguntaDoDia, INICIO_DO_QUIZ } from "../lib/app/quiz/sequencia.ts";
import { perguntasDoQuiz } from "../lib/app/quiz/perguntas.ts";

let falhas = 0;
function conferir(nome: string, condicao: boolean, detalhe = "") {
  if (condicao) return;
  falhas++;
  console.error(`FALHA  ${nome}${detalhe ? `\n       ${detalhe}` : ""}`);
}

const leia = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");

// O locale muda o TEXTO e não os ids, e é o id que esta conferência olha.
const perguntas = perguntasDoQuiz("pt");
const onboarding = perguntaDoOnboarding(perguntas);
const sql = leia("supabase/quiz_respostas.sql");

// ── 1. o id do SQL é o mesmo que o código chama de onboarding ───────────────
{
  conferir("existe pergunta de onboarding", !!onboarding?.id, "perguntasDoQuiz() voltou vazio?");

  // O id como a view o escreve: `pergunta_id = '<id>'`. Procuro a forma, e não
  // só o texto solto, porque o id também aparece nos comentários explicativos
  // deste mesmo arquivo: casar com o comentário deixaria a conferência verde
  // com a view já apontando para outra pergunta. É o erro que esta casa já
  // cometeu duas vezes (o `@capacitor/core` citado num comentário, e o
  // `SECURITY DEFINER` dentro de outro).
  const naView = /pergunta_id\s*=\s*'([^']+)'/.exec(sql)?.[1] ?? "";
  conferir(
    "a view separa pelo id que o código chama de onboarding",
    !!onboarding && naView === onboarding.id,
    `a view usa '${naView}' e perguntaDoOnboarding devolve '${onboarding?.id}'. ` +
      "Reordenar perguntasDoQuiz sem mexer no SQL faz a view separar a população errada em silêncio."
  );
}

// ── 2. a pergunta do onboarding fica FORA da rotação diária ─────────────────
//
// Se ela entrasse, um dia por ciclo o quiz do dia seria a pergunta que todo
// mundo respondeu no primeiro minuto de app, com a explicação repetida. E a
// separação da view perderia o sentido, porque o mesmo id passaria a ser as
// duas populações ao mesmo tempo.
{
  const rotacao = new Set<string>();
  // Um ciclo inteiro a partir da época, com folga: toda pergunta que a rotação
  // sabe devolver tem que aparecer aqui.
  const EPOCA = Date.parse(`${INICIO_DO_QUIZ}T12:00:00Z`);
  for (let n = 0; n < perguntas.length + 5; n++) {
    const dia = new Date(EPOCA + n * 86400000).toISOString().slice(0, 10);
    const p = perguntaDoDia(perguntas, dia);
    if (p) rotacao.add(p.id);
  }
  conferir(
    "a rotação diária não devolve a pergunta do onboarding",
    !!onboarding && !rotacao.has(onboarding.id),
    `a rotação devolveu '${onboarding?.id}', que é a do onboarding`
  );
  conferir(
    "e a rotação cobre o resto do banco",
    rotacao.size === perguntas.length - 1,
    `a rotação devolveu ${rotacao.size} perguntas distintas de um banco de ${perguntas.length}`
  );
}

// ── 3. a view existe, com as duas populações nomeadas ──────────────────────
{
  conferir("a view de participação existe no arquivo", /create or replace view public\.quiz_participacao/.test(sql));
  conferir(
    "e nomeia as duas populações",
    /'onboarding'/.test(sql) && /'diario'/.test(sql),
    "sem os dois nomes a view volta a ser uma soma sem etiqueta"
  );
  // security_invoker: a view não pode furar o RLS da tabela.
  conferir(
    "a view não fura o RLS",
    /create or replace view public\.quiz_participacao[\s\S]{0,80}security_invoker\s*=\s*on/.test(sql),
    "sem security_invoker a view entrega resposta de gente para quem não deveria ler"
  );
}

if (falhas) {
  console.error(`\n${falhas} conferência(s) da população do quiz reprovaram.`);
  process.exit(1);
}
console.log(
  "População do quiz: o id do onboarding bate entre o SQL e o código, ele fica fora\n" +
    "da rotação diária, e a view separa instalação de uso com as duas etiquetas."
);
