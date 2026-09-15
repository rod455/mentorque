-- O que já foi mandado para cada APARELHO sem conta.
--
-- Gêmea de jornada_envios, e separada dela de propósito: lá a chave é a conta
-- (uuid, not null) e o índice único garante "nunca dois no mesmo dia por
-- pessoa". Enfiar aparelho na mesma tabela exigiria afrouxar esse índice para
-- uma versão parcial, e a garantia que mais importa ficaria mais difícil de
-- ler. Duas tabelas, duas travas, cada uma óbvia.
--
-- Ver lib/jornada/aparelho.ts para a decisão e app/api/cron/jornada para o
-- laço que grava aqui.

create table if not exists public.jornada_envios_aparelho (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null,
  chave text not null,
  dia date not null,
  criado_em timestamptz not null default now()
);

-- A única defesa que sobrevive ao cron rodando duas vezes no mesmo dia.
create unique index if not exists jornada_envios_aparelho_um_por_dia
  on public.jornada_envios_aparelho (anon_id, dia);

create index if not exists jornada_envios_aparelho_dia
  on public.jornada_envios_aparelho (anon_id, dia desc);

-- Ninguém lê isto pelo cliente: quem grava e lê é o service_role no cron.
alter table public.jornada_envios_aparelho enable row level security;
