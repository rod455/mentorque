-- Leitura dos testes A/B: eventos e pessoas por experimento e variante.
--
-- JÁ APLICADO no banco (via integração). Guardado aqui como registro da fonte.
--
-- Os eventos do funil chegam carimbados com os experimentos que o aparelho
-- está vendo (extra.exp, gravado pela rota /api/funil a partir de
-- lib/app/experimentos.ts). Esta view explode o carimbo e agrega, então a
-- conversão por variante sai de "pessoas que viram paywall na variante a"
-- contra "na variante b", sem tabela nova de tracking.
-- Caderno e regras: docs/agentes/experimentos.md e o manual do CRO.

create or replace view public.experimentos_resultados
  with (security_invoker = on) as
select
  e.key   as experimento,
  e.value as variante,
  f.evento,
  count(*) as eventos,
  count(distinct public.identidade(f.anon_id, f.user_id)) as pessoas
from public.funil_eventos f, jsonb_each_text(f.extra->'exp') e
where f.extra ? 'exp'
group by 1, 2, 3
order by 1, 2, 3;

revoke all on public.experimentos_resultados from anon, authenticated;
grant select on public.experimentos_resultados to service_role;
