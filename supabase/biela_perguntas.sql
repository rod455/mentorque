-- Uma linha por pergunta respondida pela Biela, para o limite do gratuito.
--
-- POR QUÊ (15/09/2026, decisão do dono: a Biela entra no gratuito com cinco
-- perguntas por mês). Sem esta tabela o limite não existe: o contador da tela
-- vivia em estado de React e zerava a cada abertura do app, e a rota não
-- conferia nada. Com o limite em zero isso nunca apareceu; com cinco,
-- apareceria como conta da API no fim do mês.
--
-- Gêmea de `orcamentos_analisados`, e de propósito com a mesma forma: quem tem
-- conta conta por `user_id`, quem não tem conta por `anon_id`, e o mês é o
-- mesmo texto "aaaa-mm" nos dois. Ver lib/biela/limite.ts.
--
-- NÃO GUARDA A PERGUNTA NEM A RESPOSTA. O que o limite precisa saber é quantas
-- foram, e mais nada. Conversa sobre o carro de alguém não é dado que a gente
-- precise ter, e o que não se guarda não vaza.

create table if not exists public.biela_perguntas (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  mes text not null,
  user_id uuid,
  anon_id text,
  premium boolean not null default false,
  -- Veio do manual do carro ou de conhecimento geral. Serve para ler se a
  -- Biela gratuita está respondendo com fonte ou no escuro.
  usou_manual boolean not null default false,
  plataforma text,
  versao text
);

-- Linha sem dono nenhum não conta para ninguém e seria lixo silencioso.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'biela_perguntas_tem_dono') then
    alter table public.biela_perguntas
      add constraint biela_perguntas_tem_dono
      check (user_id is not null or anon_id is not null);
  end if;
end $$;

-- Os dois recortes exatos que a rota faz para contar, e só eles.
create index if not exists biela_perguntas_conta_mes
  on public.biela_perguntas (user_id, mes) where user_id is not null;
create index if not exists biela_perguntas_aparelho_mes
  on public.biela_perguntas (anon_id, mes) where anon_id is not null;

-- Ninguém lê isto pelo cliente: quem grava e conta é o service_role na rota.
alter table public.biela_perguntas enable row level security;
