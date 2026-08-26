-- PROPOSTA — NÃO APLICADA NO BANCO. Depende de decisão do Rodrigo.
--
-- (Todos os outros arquivos desta pasta são registro do que JÁ está aplicado.
-- Este não é. Alterar view existente está fora da alçada dos agentes.)
--
-- O PROBLEMA
--
-- A view `funil_semana` mistura duas unidades de medida na mesma linha:
--
--   aberturas          count(*)          eventos
--   visitantes         count(distinct)   pessoas
--   viram_paywall      count(*)          eventos
--   iniciaram_checkout count(*)          eventos
--   assinaturas        count(*)          eventos
--
-- Quem lê o retrato vê "visitantes 6, viram paywall 4, iniciaram checkout 3" e
-- entende funil de pessoas. Não é: 6 são pessoas, 4 e 3 são eventos. Na semana
-- de 2026-08-24 os 4 eventos de paywall e os 3 de checkout são DUAS pessoas, e
-- uma delas sozinha responde por 3 e 3. Taxa de passagem calculada em cima
-- disso (paywall→checkout = 75%) não significa nada.
--
-- Pior: a `funil_etapas_28d`, que alimenta a quebra de funil do /painel, já
-- conta pessoas distintas. As duas views respondem diferente sobre a mesma
-- semana, e ninguém sabe qual está na tela.
--
-- A PROPOSTA
--
-- Colunas NOVAS ao lado das que já existem, com sufixo _pessoas. Nada é
-- removido nem renomeado: /api/funil, o retrato do Analista e o /painel
-- continuam lendo o que liam, e quem quiser funil comparável usa as novas.
-- A identidade é a mesma de funil_etapas_28d — coalesce(anon_id, user_id) —
-- para as duas views enfim concordarem.

create or replace view public.funil_semana
  with (security_invoker = on) as
select
  date_trunc('week', criado_em)::date            as semana,
  count(*) filter (where evento = 'abriu_app')                                    as aberturas,
  count(distinct coalesce(anon_id, user_id::text))
    filter (where evento = 'abriu_app')                                           as visitantes,
  count(*) filter (where evento = 'cadastro')                                     as cadastros,
  count(*) filter (where evento = 'viu_paywall')                                  as viram_paywall,
  count(*) filter (where evento = 'iniciou_checkout')                             as iniciaram_checkout,
  count(*) filter (where evento = 'assinou')                                      as assinaturas,
  count(*) filter (where evento = 'renovou')                                      as renovacoes,
  count(*) filter (where evento = 'cancelou')                                     as cancelamentos,
  count(*) filter (where evento = 'expirou')                                      as expirados,
  -- Novas: as mesmas etapas medidas em PESSOAS, comparáveis entre si.
  count(distinct coalesce(anon_id, user_id::text))
    filter (where evento = 'viu_paywall')                                         as viram_paywall_pessoas,
  count(distinct coalesce(anon_id, user_id::text))
    filter (where evento = 'iniciou_checkout')                                    as iniciaram_checkout_pessoas,
  count(distinct coalesce(anon_id, user_id::text))
    filter (where evento = 'assinou')                                             as assinaturas_pessoas,
  count(distinct coalesce(anon_id, user_id::text))
    filter (where evento in ('abriu_trilha', 'cadastrou_carro'))                  as ativaram_pessoas
from public.funil_eventos
group by 1
order by 1 desc;

revoke all on public.funil_semana from anon, authenticated;
grant select on public.funil_semana to service_role;
