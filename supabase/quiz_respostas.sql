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

-- Uma resposta por pessoa por dia. Não é só higiene de dados: sem isto, quem
-- reinstalasse, tocasse duas vezes ou deixasse o app aberto em dois aparelhos
-- entraria várias vezes na conta e a porcentagem deixaria de significar
-- "das pessoas que responderam".
create unique index if not exists quiz_respostas_uma_por_dia
  on public.quiz_respostas (dia, anon_id);

-- O índice que o GET usa: conta do dia + pergunta.
create index if not exists quiz_respostas_dia_pergunta
  on public.quiz_respostas (dia, pergunta_id);

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
