-- Respostas do quiz diário.
--
-- Rode uma vez no painel do Supabase: SQL Editor → cole → Run.
--
-- PARA QUE ISTO EXISTE: uma frase só, "62% acertaram hoje". É ela que
-- transforma o quiz de exercício solitário em coisa de gente, e ela não pode
-- ser inventada — só existe porque todo mundo vê a MESMA pergunta no mesmo
-- dia (ver lib/app/quiz/sequencia.ts).
--
-- O que NÃO fica aqui: nada que sirva para saber o que uma pessoa respondeu.
-- Guardamos a resposta ligada a um identificador para poder contar uma vez por
-- pessoa, e é só. Não há tela, relatório nem rota que devolva a resposta de
-- alguém — o GET devolve dois números agregados e mais nada.
--
-- QUEM ESCREVE: só o servidor, pela rota /api/quiz, com a chave de serviço.
-- RLS ligado e sem política nenhuma, igual à funil_eventos: anon e
-- authenticated não leem nem escrevem direto.

create table if not exists public.quiz_respostas (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),

  -- Dia LOCAL do aparelho (yyyy-mm-dd), não a data do servidor. A pergunta do
  -- dia é escolhida pelo calendário de quem responde: quem está no Japão vê a
  -- pergunta de amanhã antes de nós, e a estatística dele pertence ao dia dele.
  dia         date not null,
  pergunta_id text not null,
  acertou     boolean not null,

  -- Identidade do aparelho, criada antes do login (ver lib/app/anon.ts).
  -- Não é PII. É o que permite contar uma resposta por pessoa sem exigir conta.
  anon_id     text not null,
  user_id     uuid
);

alter table public.quiz_respostas enable row level security;
revoke all on public.quiz_respostas from anon, authenticated;

-- Uma resposta por pessoa por dia E POR PERGUNTA. Não é só higiene de dados:
-- sem isto, quem reinstalasse, tocasse duas vezes ou deixasse o app aberto em
-- dois aparelhos entraria várias vezes na conta e a porcentagem deixaria de
-- significar "das pessoas que responderam".
--
-- A pergunta entrou na chave em 08/10/2026 (migração
-- quiz_respostas_uma_por_dia_e_pergunta, decisão do dono sobre o achado do
-- QA de 07/10). Até então a chave era (dia, anon_id), e a resposta do
-- ONBOARDING, dada no mesmo dia, fazia o banco recusar a resposta da pergunta
-- do dia em silêncio (a rota trata o conflito como sucesso). A porcentagem
-- continua significando o mesmo: ela é por pergunta, que é a unidade do GET.
create unique index if not exists quiz_respostas_uma_por_dia_e_pergunta
  on public.quiz_respostas (dia, anon_id, pergunta_id);

-- O índice que o GET usa: conta do dia + pergunta.
create index if not exists quiz_respostas_dia_pergunta
  on public.quiz_respostas (dia, pergunta_id);

-- CUIDADO AO LER ESTA TABELA (achado do QA, 07/10/2026).
--
-- Ela tem DUAS populações dentro, e misturá-las já produziu a leitura errada
-- na primeira tentativa desta própria rodada: "média de 5 respostas por dia",
-- que não é participação no quiz diário nenhuma.
--
-- Das 373 linhas de 07/10, **314 são de uma pergunta só**, a `oleo-intervalo`,
-- que é a do ONBOARDING (`perguntaDoOnboarding`, fora da rotação diária em
-- lib/app/quiz/sequencia.ts). Ela é respondida uma vez por cada pessoa que
-- instala, então cresce com INSTALAÇÕES e não com uso. O quiz diário de
-- verdade tem 59 respostas, de 23 aparelhos, em 34 dias: 1,7 por dia.
--
-- A ironia que fecha o assunto: a pergunta do onboarding é a ÚNICA com
-- respostas de sobra para a frase "62% acertaram" aparecer (314, contra o piso
-- de 20), e é justamente a única tela que nunca pede o placar. As 35 perguntas
-- que pediriam a frase ficam em 1,7 por dia, e em 42 dias a frase apareceu em
-- UM. A view `quiz_participacao`, no fim deste arquivo, separa as duas para
-- ninguém repetir a conta.
--
-- Resumo por dia, para os agentes e para acompanhar se o quiz está pegando.
-- security_invoker: a view NÃO fura o RLS — só a chave de serviço lê.
create or replace view public.quiz_dia
  with (security_invoker = on) as
select
  dia,
  pergunta_id,
  count(*)                                as respostas,
  count(*) filter (where acertou)         as acertos,
  round(100.0 * count(*) filter (where acertou) / nullif(count(*), 0))::int as pct_acerto,
  count(*) filter (where user_id is not null) as respostas_logadas
from public.quiz_respostas
group by dia, pergunta_id
order by dia desc;

-- Participação separada por população, aplicada em 07/10/2026 (QA).
--
-- POR QUE ELA EXISTE: a `quiz_dia` acima agrupa por (dia, pergunta_id), e quem
-- somar aquelas linhas para responder "quanta gente faz o quiz por dia" soma a
-- pergunta do onboarding junto e erra por quatro vezes. Esta view responde a
-- pergunta que os agentes realmente fazem, com as duas populações nomeadas e
-- separadas, de modo que não dá para somar sem ver o que se está somando.
--
-- `onboarding` cresce com INSTALAÇÕES; `diario` cresce com USO. Nunca some as
-- duas: são perguntas diferentes sobre produtos diferentes.
--
-- O id fica escrito aqui porque SQL não importa TypeScript, e a fonte da
-- verdade é `perguntaDoOnboarding(perguntasDoQuiz())` em
-- lib/app/quiz/sequencia.ts, que devolve `perguntas[0]`. Se alguém reordenar
-- `perguntasDoQuiz`, este id cala e a view passa a separar a população errada
-- em silêncio. É exatamente por isso que `npm run conferir:quiz-populacao`
-- compara os dois e reprova se divergirem.
create or replace view public.quiz_participacao
  with (security_invoker = on) as
select
  dia,
  case when pergunta_id = 'oleo-intervalo' then 'onboarding' else 'diario' end as tipo,
  count(*)                                    as respostas,
  count(distinct anon_id)                     as aparelhos,
  count(*) filter (where acertou)              as acertos,
  count(*) filter (where user_id is not null)  as respostas_logadas
from public.quiz_respostas
group by dia, 2
order by dia desc, 2;

revoke all on public.quiz_participacao from anon, authenticated;
grant select on public.quiz_participacao to service_role;

-- Ensaiada no banco antes de subir, em 07/10/2026: a view devolveu
-- `diario` 59 respostas em 34 dias (1,7 por dia) e `onboarding` 314 em 40
-- dias, que são os mesmos números apurados à mão na varredura. O ensaio do
-- índice (abaixo) foi desfeito na mesma transação, e a conferência de resíduo
-- voltou zero.
--
-- E O QUE O ENSAIO DO ÍNDICE MOSTROU, que era o achado da varredura: o
-- `quiz_respostas_uma_por_dia` era único em (dia, anon_id) SEM a pergunta.
-- Inserida a resposta do onboarding, a resposta da pergunta DO DIA, da mesma
-- pessoa no mesmo dia, era recusada pelo índice. Somado à tela (que decidia
-- por `ultimoDia`, carimbado pelo onboarding), o quiz do dia 1 não acontecia.
-- CONSERTADO em 08/10/2026 (decisão do dono, caminho B da proposta em
-- docs/agentes/propostas/o-quiz-do-dia-1-nunca-acontece.md): o índice ganhou
-- a pergunta (acima) e o app deixou de carimbar o dia na resposta do
-- onboarding. A leitura do conserto é o evento `abriu_quiz` do funil.
