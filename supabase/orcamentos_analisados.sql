-- Análises de orçamento por foto, sem ninguém dentro e sem a foto.
--
-- POR QUE (13/09/2026). A pessoa tira foto do orçamento da oficina e a Biela
-- explica linha a linha (lib/orcamento/analise.ts, rota /api/orcamento). Esta
-- tabela existe por dois motivos:
--   1. o LIMITE do gratuito: duas análises por mês (decisão do dono em
--      13/09/2026); a rota conta aqui antes de chamar o modelo, que é pago
--      por uso;
--   2. a LEITURA: quantas análises, com quantos itens, de quais serviços, e
--      se quem analisou volta (cruzando com funil_eventos.analisou_orcamento).
--
-- O QUE NÃO ENTRA: a foto (não é guardada em lugar nenhum), o nome da
-- oficina, o texto das linhas. Só as chaves de serviço reconhecidas e os
-- valores, que um dia alimentam as faixas de preço como precos_observados.
--
-- QUEM ESCREVE: só o servidor, pela rota /api/orcamento, com a chave de
-- serviço. RLS ligado e SEM política, como app_erros e precos_observados.

create table if not exists public.orcamentos_analisados (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  mes         text not null,          -- "2026-09": o mês do limite
  user_id     uuid,                   -- quem estava logado, ou null
  anon_id     text,                   -- o aparelho, quando não há conta
  premium     boolean not null default false,
  ilegivel    boolean not null default false,
  n_itens     integer not null default 0,
  total       numeric,                -- o total lido, em reais
  servicos    jsonb,                  -- [{"servico":"oil","valor":280}] só dos itens com referência
  uf          text,
  cidade      text,
  plataforma  text,
  versao      text
);

alter table public.orcamentos_analisados enable row level security;
revoke all on public.orcamentos_analisados from anon, authenticated;
grant select, insert, update, delete on public.orcamentos_analisados to service_role;

create index if not exists orcamentos_analisados_mes_user on public.orcamentos_analisados (mes, user_id);
create index if not exists orcamentos_analisados_mes_anon on public.orcamentos_analisados (mes, anon_id);
