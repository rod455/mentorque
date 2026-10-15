-- O RESUMO DOS E-MAILS DA JORNADA, SOMADO NO BANCO (15/10/2026).
--
-- POR QUE EXISTE. A rota /api/dados puxava as LINHAS de `jornada_envios` e
-- de `email_eventos` e somava em TypeScript, com `.limit(3000)` e
-- `.limit(5000)`. Só que a API do Supabase devolve no máximo 1.000 linhas por
-- consulta, seja qual for o `limit` pedido. Em 15/10 havia 2.019 eventos em 30
-- dias, a rota via 1.000, e o retrato publicava cerca de 40 e-mails abertos
-- quando o banco tinha 77. O dono perguntou "as pessoas estão abrindo nossos
-- e-mails?" e a resposta do painel estava pela metade, sem aviso nenhum.
-- Os envios estavam em 889, a caminho do mesmo corte.
--
-- Somar aqui devolve uma linha por chave (umas vinte), longe de qualquer teto.
--
-- AS REGRAS, as mesmas da conta antiga (lib/operacao.ts):
--   * janela de 30 dias pela data do ENVIO (`dia`);
--   * um e-mail conta uma vez por tipo: abrir três vezes é "abriu";
--   * `com_id` é o denominador das taxas: envio sem id do Resend é anterior a
--     19/09 e nunca vai ter evento;
--   * `sem_eventos` é o envio com id e nenhum evento: muitos aqui quer dizer
--     webhook mudo, não leitor sumido.
create or replace view public.email_resumo_30d
  with (security_invoker = on) as
with env as (
  select chave, email_id
  from public.jornada_envios
  where dia >= (now() - interval '30 days')::date
), ev as (
  select id_externo,
    bool_or(tipo = 'delivered') as entregue,
    bool_or(tipo = 'opened') as aberto,
    bool_or(tipo = 'clicked') as clicado,
    bool_or(tipo in ('bounced', 'complained', 'failed')) as problema
  from public.email_eventos
  group by id_externo
)
select
  env.chave,
  count(*)::int as enviados,
  count(env.email_id)::int as com_id,
  (count(*) filter (where env.email_id is not null and ev.id_externo is null))::int as sem_eventos,
  (count(*) filter (where ev.entregue))::int as entregues,
  (count(*) filter (where ev.aberto))::int as abertos,
  (count(*) filter (where ev.clicado))::int as clicados,
  (count(*) filter (where ev.problema))::int as problemas
from env
left join ev on ev.id_externo = env.email_id
group by env.chave;
