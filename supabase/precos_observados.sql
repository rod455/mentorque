-- Preços de serviço observados pelos usuários, sem ninguém dentro.
--
-- POR QUE (10/09/2026). O app compara o valor de um serviço com "a sua região"
-- usando faixas de referência escritas à mão em lib/app/pricing.ts e
-- lib/app/precos.ts, com fatores por estado que o próprio arquivo chama de
-- chute inicial. A única fonte de dado REAL é o registro que a pessoa faz:
-- tipo de serviço, valor pago, estado e cidade. Esta tabela guarda isso, e é
-- ela que vai virar a faixa de verdade quando um par (tipo, estado) tiver
-- observações suficientes (30 é o primeiro corte; ver /api/precos GET).
--
-- SEM NINGUÉM DENTRO: não há user_id, anon_id, placa, oficina nem nota. O que
-- entra é o suficiente para uma mediana por região e nada que aponte para
-- uma pessoa. Cidade é texto livre normalizado pelo app; UF é a sigla.
--
-- QUEM ESCREVE: só o servidor, pela rota /api/precos, com a chave de serviço.
-- Mesmo padrão de app_erros: RLS ligado e SEM política.

create table if not exists public.precos_observados (
  id           uuid primary key default gen_random_uuid(),
  criado_em    timestamptz not null default now(),

  tipo         text not null,     -- chave do serviço: oil, brakes, revision...
  valor        integer not null,  -- em reais, inteiro, como a pessoa digitou
  uf           text,              -- SP, RJ...
  cidade       text,              -- normalizada: sem acento, minúscula
  tipo_veiculo text,              -- car | moto
  ano          integer,           -- ano do veículo
  plataforma   text,              -- ios | android | web
  versao       text               -- versão do app
);

alter table public.precos_observados enable row level security;
revoke all on public.precos_observados from anon, authenticated;
grant select, insert, update, delete on public.precos_observados to service_role;

create index if not exists precos_observados_tipo_uf on public.precos_observados (tipo, uf);
create index if not exists precos_observados_criado on public.precos_observados (criado_em);
