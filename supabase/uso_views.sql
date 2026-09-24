-- A régua de uso do app: pessoas distintas, retenção e frequência.
--
-- JÁ APLICADO no banco (via integração). Guardado aqui como registro da fonte.
--
-- Três views sobre funil_eventos (identidade = anon_id, com user_id de
-- reserva), lidas pelo /api/dados e resumidas no retrato diário. Definições
-- e interpretação: docs/agentes/skills/analise-da-operacao.md.
--
-- uso_diario:      usuários distintos e aberturas por dia (fuso de Brasília)
-- uso_semanal:     usuários ativos, aberturas e frequência por semana
-- retencao_coortes: de quem se cadastrou na semana X, % que voltou em
--                   1 a 7 dias e em 8 a 30 dias depois do cadastro

create or replace view public.uso_diario
  with (security_invoker = on) as
select
  (criado_em at time zone 'America/Sao_Paulo')::date as dia,
  count(distinct public.identidade(anon_id, user_id))
    filter (where evento = 'abriu_app')              as usuarios,
  count(*) filter (where evento = 'abriu_app')       as aberturas
from public.funil_eventos
group by 1
order by 1 desc;

create or replace view public.uso_semanal
  with (security_invoker = on) as
select
  date_trunc('week', criado_em at time zone 'America/Sao_Paulo')::date as semana,
  count(distinct public.identidade(anon_id, user_id))
    filter (where evento = 'abriu_app')              as usuarios_ativos,
  count(*) filter (where evento = 'abriu_app')       as aberturas,
  round(
    count(*) filter (where evento = 'abriu_app')::numeric
    / nullif(count(distinct public.identidade(anon_id, user_id))
        filter (where evento = 'abriu_app'), 0), 1)  as aberturas_por_usuario
from public.funil_eventos
group by 1
order by 1 desc;


-- COORTE IMATURA, colunas acrescentadas em 23/09/2026 pelo QA.
--
-- POR QUE. O retrato mostra as quatro coortes mais recentes lado a lado, com
-- a mesma cara, e as duas primeiras ainda estao ENCHENDO. Provado pelo
-- historico do proprio retrato: a coorte de 14/09 foi lida como 2 de 8 no dia
-- 19, 2 de 11 no dia 20 e 3 de 16 no dia 21. O denominador cresce enquanto a
-- semana esta aberta, e o numerador cresce enquanto a janela de cada pessoa
-- nao fecha. Quem le "0 de 15 ativaram" na semana corrente le uma queda que
-- ainda nao aconteceu.
--
-- QUANDO FECHA. A coorte e a semana; a ultima pessoa dela cadastra no dia
-- coorte+6 e a janela usa `< cadastrado_em + 8 days`. Entao:
--   semana_fechada   coorte + 7   (nao entra mais ninguem no denominador)
--   janela de 7 dias coorte + 14  (o numerador parou de subir)
--   janela de 8 a 30 coorte + 37
--
-- ADITIVO: as colunas antigas nao mudaram de nome, de ordem nem de valor.
-- Quem ja lia continua lendo igual; quem quiser saber se pode concluir usa as
-- novas. O retrato e montado no n8n, fora deste repositorio, entao a coluna e
-- o unico jeito de a fonte contar isso a quem consome.
create or replace view public.retencao_coortes
  with (security_invoker = on) as
with cadastros as (
  select public.identidade(anon_id, user_id) as pessoa, min(criado_em) as cadastrado_em
  from public.funil_eventos
  where evento = 'cadastro' and public.identidade(anon_id, user_id) is not null
  group by 1
)
select
  date_trunc('week', c.cadastrado_em at time zone 'America/Sao_Paulo')::date as coorte,
  count(*) as cadastrados,
  count(*) filter (where exists (
    select 1 from public.funil_eventos a
    where a.evento = 'abriu_app'
      and public.identidade(a.anon_id, a.user_id) = c.pessoa
      and a.criado_em >= c.cadastrado_em + interval '1 day'
      and a.criado_em <  c.cadastrado_em + interval '8 days'
  )) as voltaram_d1_7,
  count(*) filter (where exists (
    select 1 from public.funil_eventos a
    where a.evento = 'abriu_app'
      and public.identidade(a.anon_id, a.user_id) = c.pessoa
      and a.criado_em >= c.cadastrado_em + interval '8 days'
      and a.criado_em <  c.cadastrado_em + interval '31 days'
  )) as voltaram_d8_30,
  (date_trunc('week', c.cadastrado_em at time zone 'America/Sao_Paulo')::date + 7)
    <= (now() at time zone 'America/Sao_Paulo')::date as semana_fechada,
  (date_trunc('week', c.cadastrado_em at time zone 'America/Sao_Paulo')::date + 14)
    <= (now() at time zone 'America/Sao_Paulo')::date as d1_7_fechada,
  (date_trunc('week', c.cadastrado_em at time zone 'America/Sao_Paulo')::date + 37)
    <= (now() at time zone 'America/Sao_Paulo')::date as d8_30_fechada
from cadastros c
group by 1
order by 1 desc;

revoke all on public.uso_diario, public.uso_semanal, public.retencao_coortes from anon, authenticated;
grant select on public.uso_diario, public.uso_semanal, public.retencao_coortes to service_role;

-- 2026-08-23: a varredura de permissões achou seis objetos sem acesso do
-- papel de serviço (funil_eventos NUNCA tinha aceitado um evento). Corrigidos
-- com grants e, para o futuro, o padrão do schema passou a incluir o papel:
--   alter default privileges for role postgres in schema public
--     grant select, insert, update, delete on tables to service_role;

-- 2026-09-01: a identidade saiu do coalesce copiado em cada view e virou a
-- função public.identidade (ver supabase/identidade.sql). Junto veio a coluna
-- `aberturas_sem_identidade` em uso_diario, uso_semanal e funil_semana: o
-- aparelho sem localStorage deixou de contar como pessoa, e o tamanho desse
-- ponto cego passou a aparecer em vez de sumir. Nenhuma coluna foi renomeada
-- nem removida, então /api/dados, o retrato e o /painel continuam lendo o que
-- liam.
