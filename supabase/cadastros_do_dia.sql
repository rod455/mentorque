-- Quem criou conta num dia (horário de Brasília).
--
-- JÁ APLICADO no banco (migration cadastros_do_dia). Este arquivo é o
-- registro da fonte; para recriar, cole no SQL Editor e rode.
--
-- USO no SQL Editor do Supabase:
--   select * from cadastros_do_dia('2026-08-22');
--
-- Colunas: horário (Brasília), e-mail, nome, método de login (email, google,
-- apple), aparelho (ios/android/web) e versão do app, e se o e-mail foi
-- confirmado. Aparelho e versão vêm do evento "cadastro" do funil; contas
-- criadas antes do funil existir aparecem com esses campos nulos.

create or replace function public.cadastros_do_dia(dia date)
returns table (
  horario_brasilia timestamp,
  email text,
  nome text,
  metodo text,
  aparelho text,
  versao_app text,
  email_confirmado boolean
)
language sql
security definer
set search_path = public, auth
as $$
  select
    (u.created_at at time zone 'America/Sao_Paulo')::timestamp(0) as horario_brasilia,
    u.email::text,
    coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name') as nome,
    coalesce(u.raw_app_meta_data->>'provider', 'email') as metodo,
    f.plataforma as aparelho,
    f.versao as versao_app,
    (u.email_confirmed_at is not null) as email_confirmado
  from auth.users u
  left join lateral (
    select fe.plataforma, fe.versao
    from public.funil_eventos fe
    where fe.user_id = u.id and fe.evento = 'cadastro'
    order by fe.criado_em
    limit 1
  ) f on true
  where (u.created_at at time zone 'America/Sao_Paulo')::date = dia
  order by u.created_at;
$$;

-- Só o painel (e a chave de serviço) enxergam; app e anônimos, nunca.
revoke all on function public.cadastros_do_dia(date) from anon, authenticated;

-- ─ Variante por período (também JÁ APLICADA no banco) ─
-- Uso:  select * from cadastros_no_periodo('2026-07-21', '2026-07-30');
-- Exclui contas de teste (email começando com fake_). Datas em horário de
-- Brasília, inclusivas nas duas pontas.
create or replace function public.cadastros_no_periodo(inicio date, fim date)
returns table (
  id uuid,
  email text,
  horario_brasilia timestamp,
  email_confirmado_em timestamp,
  metodo text,
  aparelho text,
  versao_app text
)
language sql
security definer
set search_path = public, auth
as $$
  select
    u.id,
    u.email::text,
    (u.created_at at time zone 'America/Sao_Paulo')::timestamp(0),
    (u.email_confirmed_at at time zone 'America/Sao_Paulo')::timestamp(0),
    coalesce(u.raw_app_meta_data->>'provider', 'email') as metodo,
    f.plataforma as aparelho,
    f.versao as versao_app
  from auth.users u
  left join lateral (
    select fe.plataforma, fe.versao
    from public.funil_eventos fe
    where fe.user_id = u.id and fe.evento = 'cadastro'
    order by fe.criado_em
    limit 1
  ) f on true
  where u.email not like 'fake_%'
    and (u.created_at at time zone 'America/Sao_Paulo')::date between inicio and fim
  order by u.created_at desc;
$$;

revoke all on function public.cadastros_no_periodo(date, date) from anon, authenticated;
