-- Visão de empresa: ativação real, vendas por coorte e origem de cadastro.
--
-- JÁ APLICADO no banco (via integração). Guardado aqui como registro da fonte.
--
-- Junto com esta migração, o CHECK de funil_eventos ganhou os eventos de
-- primeira ação de valor: 'abriu_trilha' e 'cadastrou_carro' (emitidos pelo
-- app a partir do build seguinte ao 8/43; na web, desde 2026-08-23).
--
-- ativacao_coortes:       da coorte semanal de cadastro, quantos fizeram a
--                         primeira ação de valor em até 7 dias
-- assinaturas_coortes:    coorte MENSAL de quem assinou; quantos renovaram e
--                         quantos saíram (cancelou ou expirou)
-- cadastros_por_campanha: cadastros dos últimos 28 dias por utm_source e
--                         utm_campaign (a ponta nossa do CAC; o gasto vem de
--                         meta_ads/google_ads na mesa de métricas)

create or replace view public.ativacao_coortes
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
    select 1 from public.funil_eventos e
    where e.evento in ('abriu_trilha', 'cadastrou_carro')
      and public.identidade(e.anon_id, e.user_id) = c.pessoa
      and e.criado_em >= c.cadastrado_em
      and e.criado_em <  c.cadastrado_em + interval '8 days'
  )) as ativados_7d
from cadastros c
group by 1
order by 1 desc;

create or replace view public.assinaturas_coortes
  with (security_invoker = on) as
with assinantes as (
  select public.identidade(anon_id, user_id) as pessoa, min(criado_em) as assinou_em
  from public.funil_eventos
  where evento = 'assinou' and public.identidade(anon_id, user_id) is not null
  group by 1
)
select
  date_trunc('month', a.assinou_em at time zone 'America/Sao_Paulo')::date as coorte,
  count(*) as assinaram,
  count(*) filter (where exists (
    select 1 from public.funil_eventos e
    where e.evento = 'renovou'
      and public.identidade(e.anon_id, e.user_id) = a.pessoa
  )) as renovaram,
  count(*) filter (where exists (
    select 1 from public.funil_eventos e
    where e.evento in ('cancelou', 'expirou')
      and public.identidade(e.anon_id, e.user_id) = a.pessoa
  )) as sairam
from assinantes a
group by 1
order by 1 desc;

create or replace view public.cadastros_por_campanha
  with (security_invoker = on) as
select
  coalesce(extra->'utm'->>'utm_source', '(direto)')         as origem,
  coalesce(extra->'utm'->>'utm_campaign', '(sem campanha)') as campanha,
  count(*) as cadastros_28d
from public.funil_eventos
where evento = 'cadastro' and criado_em >= now() - interval '28 days'
group by 1, 2
order by 3 desc;

revoke all on public.ativacao_coortes, public.assinaturas_coortes, public.cadastros_por_campanha from anon, authenticated;
grant select on public.ativacao_coortes, public.assinaturas_coortes, public.cadastros_por_campanha to service_role;
