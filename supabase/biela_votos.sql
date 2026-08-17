-- Votos nas respostas da Biela — o material para ela melhorar com o tempo.
--
-- Rode uma vez no painel do Supabase: SQL Editor → cole → Run.
--
-- QUEM ESCREVE AQUI: só o servidor, pela rota /api/biela-voto, usando a chave
-- de serviço. O aplicativo nunca fala com esta tabela direto.
--
-- É por isso que o RLS fica ligado e SEM nenhuma política: a chave de serviço
-- passa por cima do RLS, e todo o resto do mundo — `anon`, `authenticated` —
-- bate numa tabela sem política nenhuma e não lê nem escreve nada. Sem essa
-- trava, um voto guarda a pergunta digitada por alguém, e pergunta de gente
-- costuma trazer placa, nome e endereço no meio sem ninguém pedir.
--
-- (Na lista de espera esse detalhe custou caro na direção oposta: a política
-- existia, o GRANT não, e o formulário devolvia 500. Política e permissão são
-- duas camadas independentes. Aqui não usamos nenhuma das duas de propósito.)

create table if not exists public.biela_votos (
  id           uuid primary key default gen_random_uuid(),
  criado_em    timestamptz not null default now(),

  voto         text not null check (voto in ('up', 'down')),
  -- Só no 👎: por que a resposta não serviu.
  motivo       text check (motivo in ('errada', 'incompleta', 'confusa')),
  comentario   text,

  -- O par que importa. A Biela responde cada pergunta ISOLADA (a rota manda uma
  -- única mensagem, sem histórico), então este par é o contexto completo da
  -- resposta — não existe conversa para reconstruir.
  pergunta     text not null,
  resposta     text not null,

  -- Contexto que muda a resposta.
  carro        text,           -- "Fiat Argo 2020"
  com_manual   boolean,        -- a resposta usou trecho do manual?
  modo         text,           -- 'ai' | 'basic'
  locale       text,
  plataforma   text,
  versao       text,

  -- Sem nome, sem e-mail, sem user_id. Um voto não precisa saber de quem é, e
  -- guardar identidade junto de texto livre é como um banco de feedback vira um
  -- banco de dados pessoais sem ninguém ter decidido isso.
  aparelho     text            -- id anônimo do aparelho, só para agrupar
);

alter table public.biela_votos enable row level security;

-- Consulta do dia a dia: os 👎 da semana, do mais recente para o mais antigo.
create index if not exists biela_votos_criado_em_idx
  on public.biela_votos (criado_em desc);

comment on table public.biela_votos is
  'Votos nas respostas da Biela. Escrita só pelo servidor (service role). Descarte automático em 90 dias pelo resumo semanal.';
