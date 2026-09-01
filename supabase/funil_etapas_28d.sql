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
select evento, count(distinct public.identidade(anon_id, user_id)) as pessoas
from public.funil_eventos
where criado_em >= now() - interval '28 days'
group by 1
union all
select 'ativacao', count(distinct public.identidade(anon_id, user_id))
from public.funil_eventos
where evento in ('abriu_trilha', 'cadastrou_carro')
  and criado_em >= now() - interval '28 days';

revoke all on public.funil_etapas_28d from anon, authenticated;
grant select on public.funil_etapas_28d to service_role;

-- 2026-09-01: a janela de 28 dias soldada dentro desta view virou problema.
-- Os eventos passaram a ser mensuráveis em 22 e 23/08, e uma janela de 28
-- dias hoje abre em 04/08: o degrau de baixo ganharia dezoito dias a mais de
-- contagem que o de cima, e a taxa mediria calendário, não comportamento.
--
-- Entrou a função `public.funil_etapas(p_desde date)`, que recebe a janela de
-- fora. Quem decide o corte é lib/funilCorreto.ts, que sabe desde quando cada
-- evento existe; o banco só obedece. Esta view continua de pé para não
-- quebrar quem já lia dela.
--
-- create or replace function public.funil_etapas(p_desde date)
-- returns table (evento text, pessoas bigint) language sql stable as $$
--   select evento, count(distinct public.identidade(anon_id, user_id))
--   from public.funil_eventos where criado_em >= p_desde group by 1
--   union all
--   select 'ativacao', count(distinct public.identidade(anon_id, user_id))
--   from public.funil_eventos
--   where evento in ('abriu_trilha','cadastrou_carro') and criado_em >= p_desde
-- $$;
