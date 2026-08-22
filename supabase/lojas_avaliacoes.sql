-- Avaliações públicas do app nas lojas (App Store e Google Play).
--
-- JÁ APLICADO no banco (via integração). Guardado aqui como registro da fonte.
--
-- Coletadas pelo Analista de Dados (n8n, workflow "Analista: avaliações das
-- lojas") e gravadas pela rota /api/avaliacoes. Servem ao Diretor (resumo
-- semanal), ao ASO & Lojas (respostas e tendências) e à curadoria de
-- depoimentos reais para a LP.
create table if not exists public.lojas_avaliacoes (
  id           text primary key,          -- id da avaliação na loja (dedup natural)
  loja         text not null check (loja in ('app_store', 'google_play')),
  coletado_em  timestamptz not null default now(),
  avaliado_em  timestamptz,               -- quando a loja informa a data
  nota         int check (nota between 1 and 5),
  titulo       text,
  texto        text,
  autor        text,
  versao       text,
  respondido   boolean not null default false
);

alter table public.lojas_avaliacoes enable row level security;
revoke all on public.lojas_avaliacoes from anon, authenticated;

create index if not exists lojas_avaliacoes_loja_coleta
  on public.lojas_avaliacoes (loja, coletado_em desc);
