-- Uma linha por pedido RECUSADO porque o limite do gratuito acabou.
--
-- POR QUÊ (05/11/2026). O dono aprovou testar a compra avulsa
-- (`compra-avulsa-por-momento` no caderno de experimentos), e a oferta aparece
-- justamente em quem bate no limite do Biela. Só que a rota recusava a quarta
-- pergunta sem gravar nada: o denominador do teste não existia, e o "cerca de
-- 40 por mês" saía de quem chegou a 3, que é um piso, não a contagem.
--
-- Tabela própria, e não um evento do funil, de propósito: aqui quem grava é o
-- SERVIDOR, na mesma rota que recusa, então a contagem vale desde já para
-- todas as versões do app, sem esperar binário. E não entra em
-- `biela_perguntas` nem em `orcamentos_analisados`, porque linha ali conta
-- contra o limite da própria pessoa.
--
-- NÃO GUARDA A PERGUNTA NEM A FOTO. Só quem bateu, onde e quando.

create table if not exists public.limites_atingidos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  -- 'biela' ou 'orcamento': as duas rotas com limite do gratuito.
  onde text not null check (onde in ('biela', 'orcamento')),
  mes text not null,
  user_id uuid,
  anon_id text,
  -- Quantas já tinha feito no mês quando foi recusado (o limite, normalmente).
  feitas integer,
  plataforma text,
  versao text,
  constraint limites_atingidos_tem_dono check (user_id is not null or anon_id is not null)
);

create index if not exists limites_atingidos_onde_mes on public.limites_atingidos (onde, mes);

-- Ninguém lê isto pelo cliente: quem grava é o service_role na rota.
alter table public.limites_atingidos enable row level security;
