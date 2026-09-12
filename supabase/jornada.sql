-- A jornada de recorrência por e-mail e push.
--
-- JÁ APLICADO no banco (migração jornada_de_recorrencia, 12/09/2026). Guardado
-- aqui como registro da fonte.
--
-- POR QUE EXISTE: o dono aprovou em 12/09 a jornada proposta em
-- docs/agentes/propostas/jornada-de-recorrencia.md. Um cron diário
-- (app/api/cron/jornada/route.ts) decide, por conta, qual e-mail cabe hoje,
-- ou nenhum. Duas coisas precisam sobreviver a qualquer falha desse cron:
--
--   jornada_envios   o que já foi mandado, para quem, em que dia. É a trava
--                    contra o envio DOBRADO (o cron rodar de novo, a Vercel
--                    repetir a chamada) e a memória de "faz quantos dias que
--                    esta pessoa recebeu algo". O índice único (user_id, dia)
--                    é a regra "nunca dois no mesmo dia" escrita no banco, e
--                    não só no código.
--   jornada_saidas   quem pediu para sair. Sai de tudo, na hora, e nunca mais
--                    volta a entrar por conta de regra nenhuma.
--
-- RLS ligado e SEM policy: só o servidor (service_role) lê e escreve. O app
-- não toca nestas tabelas.

create table if not exists public.jornada_envios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  chave text not null,                 -- 'd2', 'vencida:oil', 'sazonal:ferias-2026-12'
  dia date not null,
  canais text[] not null default '{email}',
  criado_em timestamptz not null default now()
);
create index if not exists jornada_envios_pessoa_dia on public.jornada_envios (user_id, dia desc);
create unique index if not exists jornada_envios_um_por_dia on public.jornada_envios (user_id, dia);

create table if not exists public.jornada_saidas (
  user_id uuid primary key,
  criado_em timestamptz not null default now(),
  motivo text
);

alter table public.jornada_envios enable row level security;
alter table public.jornada_saidas enable row level security;
revoke all on public.jornada_envios, public.jornada_saidas from anon, authenticated;
grant all on public.jornada_envios, public.jornada_saidas to service_role;
