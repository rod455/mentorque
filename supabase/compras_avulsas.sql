-- Uma linha por compra avulsa PAGA (pacote de perguntas ou passe de 7 dias).
--
-- POR QUÊ (09/11/2026). O dono decidiu em 05/11 os dois formatos da compra
-- avulsa (`compra-avulsa-por-momento` no caderno) e em 08/11 que no Android ela
-- passa pelo Stripe, abrindo o checkout fora do app e voltando para ele. A
-- regra do que cada compra libera mora em lib/avulsa/direito.ts.
--
-- Quem grava é o SERVIDOR, por dois caminhos que se cobrem: o webhook do
-- Stripe (checkout.session.completed) e a confirmação que o app pede ao
-- voltar (/api/avulsa/confirmar). O id da sessão do Stripe é único, então a
-- mesma compra nunca entra duas vezes.
--
-- NÃO EXIGE CONTA (decisão do dono, 05/11): o direito fica com o aparelho
-- (`anon_id`) e passa para a conta (`user_id`) quando ela existe.

create table if not exists public.compras_avulsas (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  sessao text not null unique,
  produto text not null check (produto in ('pacote_2', 'pacote_10', 'passe_7d')),
  -- Pacote: quantas perguntas ao Biela. Passe: nulo.
  perguntas integer,
  -- Passe: até quando vale. Pacote: nulo.
  passe_ate timestamptz,
  valor_centavos integer,
  moeda text,
  user_id uuid,
  anon_id text,
  plataforma text,
  versao text,
  constraint compras_avulsas_tem_dono check (user_id is not null or anon_id is not null)
);

create index if not exists compras_avulsas_user on public.compras_avulsas (user_id);
create index if not exists compras_avulsas_anon on public.compras_avulsas (anon_id);

-- Ninguém lê isto pelo cliente: quem grava e lê é o service_role nas rotas.
alter table public.compras_avulsas enable row level security;

-- A pergunta paga diz com o que foi paga: 'credito' (de um pacote) ou
-- 'passe'. Nula é a pergunta grátis do mês (ou a do Premium). O limite do
-- grátis conta só as nulas, senão quem comprou perderia a grátis do mês.
alter table public.biela_perguntas add column if not exists pago_com text
  check (pago_com is null or pago_com in ('credito', 'passe'));
