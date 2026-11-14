-- A venda avulsa, degrau por degrau, em 7 e 30 dias. Uma linha por janela.
--
-- POR QUÊ (14/11/2026). A 3.4 foi a produção na Play com a compra avulsa pelo
-- Stripe, e o retrato diário não lia nada dela: nem as compras, nem quem viu
-- os pacotes, nem as recusas de limite que existem desde 05/11. Os agentes só
-- veriam venda se alguém fosse ao banco na mão. Esta view é o que o
-- /api/metricas lê, numa consulta só, e o retrato publica em
-- `vendas.vendaAvulsa`.
--
-- Os degraus, na ordem do funil, todos sem a plataforma `teste`:
--   podiam_ver  pessoas que usaram a pergunta GRÁTIS numa versão que tem a
--               parede (web, ou app 3.4.0 em diante). Com o limite de 1, a
--               parede aparece logo depois dessa resposta.
--   viram       aparelhos com `viu_avulsa`. MEDIDO SÓ DESDE 14/11 21h50 UTC:
--               antes disso o check de `funil_eventos` recusava o evento.
--   tocaram     aparelhos com `tentou_avulsa` (abriu o checkout).
--   compras     linhas de `compras_avulsas` (pagas, uma por sessão do Stripe).
--   recusas     pessoas que levaram 429 da Biela numa sessão nova (voltaram e
--               tentaram de novo depois de a parede aparecer).
create or replace view public.venda_avulsa_resumo
  with (security_invoker = on) as
with janelas(janela, desde) as (
  values ('7d', now() - interval '7 days'), ('30d', now() - interval '30 days')
)
select
  j.janela,
  (select count(distinct coalesce(b.user_id::text, b.anon_id))
     from public.biela_perguntas b
    where b.criado_em >= j.desde and b.premium = false and b.pago_com is null
      and coalesce(b.plataforma, '') <> 'teste'
      and (b.plataforma = 'web'
           or (b.versao ~ '^[0-9]+(\.[0-9]+)*$' and string_to_array(b.versao, '.')::int[] >= array[3, 4, 0])))::int as podiam_ver,
  (select count(distinct f.anon_id) from public.funil_eventos f
    where f.evento = 'viu_avulsa' and f.criado_em >= j.desde and coalesce(f.plataforma, '') <> 'teste')::int as viram,
  (select count(distinct f.anon_id) from public.funil_eventos f
    where f.evento = 'tentou_avulsa' and f.criado_em >= j.desde and coalesce(f.plataforma, '') <> 'teste')::int as tocaram,
  (select coalesce(jsonb_object_agg(t.origem, t.n), '{}'::jsonb) from (
     select coalesce(f.origem, '?') as origem, count(*)::int as n from public.funil_eventos f
      where f.evento = 'tentou_avulsa' and f.criado_em >= j.desde and coalesce(f.plataforma, '') <> 'teste'
      group by 1) t) as toques_por_produto,
  (select count(*) from public.compras_avulsas c
    where c.criado_em >= j.desde and coalesce(c.plataforma, '') <> 'teste')::int as compras,
  (select coalesce(jsonb_object_agg(t.produto, t.n), '{}'::jsonb) from (
     select c.produto, count(*)::int as n from public.compras_avulsas c
      where c.criado_em >= j.desde and coalesce(c.plataforma, '') <> 'teste'
      group by 1) t) as compras_por_produto,
  (select coalesce(sum(c.valor_centavos), 0) from public.compras_avulsas c
    where c.criado_em >= j.desde and coalesce(c.plataforma, '') <> 'teste')::int as receita_centavos,
  (select count(distinct coalesce(l.user_id::text, l.anon_id)) from public.limites_atingidos l
    where l.onde = 'biela' and l.criado_em >= j.desde and coalesce(l.plataforma, '') <> 'teste')::int as recusas
from janelas j;

revoke all on public.venda_avulsa_resumo from anon, authenticated;
grant select on public.venda_avulsa_resumo to service_role;
