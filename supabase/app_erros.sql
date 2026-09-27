-- Erros de execução capturados dentro do app (a visão "de dentro" que a
-- Sentinela não tem: tela quebrada, exceção de JavaScript, promessa rejeitada).
--
-- JÁ APLICADO no banco (via integração). Guardado aqui como registro da fonte.
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
-- Tabela criada via integração não herda DML para o papel de serviço:
-- sem este grant a rota devolvia "permission denied" (aprendido em 2026-08-22).
grant select, insert, update, delete on public.app_erros to service_role;

create index if not exists app_erros_criado on public.app_erros (criado_em);

-- AS DUAS COLUNAS QUE FALTAVAM NESTE ARQUIVO (trazidas em 27/09/2026).
--
-- As duas já existiam no BANCO e não existiam aqui, que é a armadilha desta
-- casa desde 26/08, quando o arquivo do funil foi encontrado três eventos
-- atrás do aplicado. Quem lesse este arquivo para entender a tabela veria uma
-- tabela que não é a que está no ar.
--
-- `anon_id` (17/09/2026, recomendação da QA de 16/09): sem ele, "dez
-- ocorrências do mesmo erro" pode ser dez pessoas ou uma reabrindo o app, e as
-- duas leituras pedem reações opostas. É o MESMO id do funil (lib/app/anon.ts),
-- então nada passou a ser guardado sobre ninguém que já não fosse.
--
-- `aparelho` (27/09/2026): modelo, versão do sistema, memória aproximada e
-- núcleos, montados em lib/app/aparelho.ts a partir do `navigator`. Nasceu do
-- relato de "app fechou sozinho", que é o único desta tabela que fala de
-- RECURSO da máquina: sem ele, "morre na tela de cadastro do carro" e "morre
-- na tela de cadastro do carro num Android de 2GB" são a mesma linha e pedem
-- consertos diferentes. Descreve o hardware, não a pessoa: modelo e memória
-- aproximada são iguais para milhões de aparelhos.
alter table public.app_erros add column if not exists anon_id text;
alter table public.app_erros add column if not exists aparelho text;
