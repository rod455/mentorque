-- Erros de execução capturados dentro do app (a visão "de dentro" que a
-- Sentinela não tem: tela quebrada, exceção de JavaScript, promessa rejeitada).
--
-- Rode uma vez no painel do Supabase: SQL Editor → cole → Run.
--
-- QUEM ESCREVE AQUI: só o servidor, pela rota /api/erros, com a chave de
-- serviço. Mesmo padrão da biela_votos e do funil: RLS ligado e SEM política,
-- então anon/authenticated não leem nem escrevem nada.
--
-- Stack e mensagem podem conter caminho de arquivo e detalhe técnico, nunca
-- dado do usuário: o coletor (lib/app/erros.ts) não anexa nome, e-mail ou id.

create table if not exists public.app_erros (
  id         uuid primary key default gen_random_uuid(),
  criado_em  timestamptz not null default now(),

  tipo       text,   -- erro | promessa
  mensagem   text not null,
  stack      text,
  origem     text,   -- tela/arquivo:linha em que estourou
  plataforma text,   -- ios | android | web
  versao     text    -- versão do app
);

alter table public.app_erros enable row level security;
revoke all on public.app_erros from anon, authenticated;

create index if not exists app_erros_criado on public.app_erros (criado_em);
