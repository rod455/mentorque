-- Métricas diárias de fontes externas (uma linha por dia e por fonte).
--
-- JÁ APLICADO no banco (via integração). Guardado aqui como registro da fonte.
--
-- Mesa de pouso única do Analista de Dados (n8n, workflow "Analista: métricas
-- externas"): cada braço do workflow coleta uma fonte e grava aqui pela rota
-- /api/metricas. O retrato diário (docs/dados/retrato.md) lê tudo pelo
-- /api/dados e entrega ao Diretor, CRO e ASO.
--
-- O campo dados é jsonb de propósito: cada fonte tem formato próprio e o
-- formato evolui sem migração. O par (dia, fonte) é a chave, então recoletar
-- no mesmo dia só substitui a linha.
create table if not exists public.metricas_diarias (
  dia          date not null,
  fonte        text not null check (fonte in (
    'search_console', 'stripe', 'youtube', 'meta_ads', 'google_ads',
    'revenuecat', 'vercel', 'admob', 'app_store_connect', 'play_console'
  )),
  dados        jsonb not null default '{}'::jsonb,
  coletado_em  timestamptz not null default now(),
  primary key (dia, fonte)
);

alter table public.metricas_diarias enable row level security;
revoke all on public.metricas_diarias from anon, authenticated;

create index if not exists metricas_diarias_fonte_dia
  on public.metricas_diarias (fonte, dia desc);
