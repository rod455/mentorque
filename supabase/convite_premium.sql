-- Quem recebe o convite do Premium (24/10/2026). Migração convite_premium_publico.
--
-- O PEDIDO, do dono: "quem tem usado o app regularmente e não assinou o
-- premium". A régua escrita aqui, para a próxima rodada saber o que "regular"
-- quis dizer: conta com e-mail que teve evento no funil em 3 DIAS DIFERENTES
-- nos últimos 30 (dia de Brasília) e pelo menos um nos últimos 14. Em 24/10
-- eram 24 contas, 23 fora a do time.
--
-- O evento do funil carrega `user_id` só depois do login; antes, só o
-- `anon_id`. Por isso o uso é ligado à conta pelo par (user_id, anon_id) que o
-- próprio funil já viu junto: sem isso, os dias de convidado antes da conta
-- ficariam de fora e a régua contaria só o uso depois do login.
--
-- QUEM FICA DE FORA, consultado na hora (é função, não lista): quem já assina
-- (active ou trialing, de qualquer loja), quem pediu para sair da lista, quem
-- já recebeu este convite, e as três contas do time (a mesma lista de
-- `contas_criadas.sql` e `estado_da_base.sql`; mudou uma, mude as três).
--
-- `security definer` porque lê `auth.users`, e por isso só o service_role
-- executa. `pg_temp` por último no search_path (ver estado_da_base.sql).

create or replace function public.publico_convite_premium(p_chave text, p_dias_minimos int default 3)
returns table(user_id uuid, email text, nome text, dias bigint, ultimo timestamptz)
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  with pares as (
    select distinct f.user_id, f.anon_id
    from public.funil_eventos f
    where f.user_id is not null and f.anon_id is not null
  ),
  eventos as (
    select coalesce(f.user_id, p.user_id) as uid, f.criado_em
    from public.funil_eventos f
    left join pares p on f.user_id is null and p.anon_id = f.anon_id
    where f.criado_em >= now() - interval '30 days'
  ),
  uso as (
    select uid,
      count(distinct (criado_em at time zone 'America/Sao_Paulo')::date) as dias,
      max(criado_em) as ultimo
    from eventos
    where uid is not null
    group by uid
  )
  select u.id, u.email::text,
    coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
    uso.dias, uso.ultimo
  from uso
  join auth.users u on u.id = uso.uid
  where uso.dias >= p_dias_minimos
    and uso.ultimo >= now() - interval '14 days'
    and u.email is not null
    and u.email::text <> all (array[
      'mentorque.ar@gmail.com',
      'rodrigomoraessilva455@gmail.com',
      'revisor@mentorque.com.br'
    ]::text[])
    and not exists (
      select 1 from public.subscriptions s
      where s.user_id = u.id and s.status in ('active', 'trialing')
    )
    and not exists (select 1 from public.jornada_saidas j where j.user_id = u.id)
    and not exists (
      select 1 from public.jornada_envios e where e.user_id = u.id and e.chave = p_chave
    )
  order by uso.dias desc, uso.ultimo desc
$$;

revoke all on function public.publico_convite_premium(text, int) from public, anon, authenticated;
grant execute on function public.publico_convite_premium(text, int) to service_role;
