-- Onde o funil quebra: pessoas distintas por etapa nos últimos 28 dias.
--
-- JÁ APLICADO no banco (via integração). Guardado aqui como registro da fonte.
--
-- A linha sintética 'ativacao' junta abriu_trilha e cadastrou_carro (primeira
-- ação de valor). O /api/dados transforma em quebraFunil (taxa de passagem
-- etapa a etapa) e o painel destaca a maior quebra, que é o alvo natural dos
-- testes A/B propostos pelo CRO.

create or replace view public.funil_etapas_28d
  with (security_invoker = on) as
select evento, count(distinct coalesce(anon_id, user_id::text)) as pessoas
from public.funil_eventos
where criado_em >= now() - interval '28 days'
group by 1
union all
select 'ativacao', count(distinct coalesce(anon_id, user_id::text))
from public.funil_eventos
where evento in ('abriu_trilha', 'cadastrou_carro')
  and criado_em >= now() - interval '28 days';

revoke all on public.funil_etapas_28d from anon, authenticated;
grant select on public.funil_etapas_28d to service_role;
