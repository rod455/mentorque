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
    'revenuecat', 'vercel', 'admob', 'app_store_connect', 'play_console',
    'app_store_downloads', 'play_downloads',
    -- Instalação por fonte de mídia (AppsFlyer, Pull API, 03/10/2026).
    'appsflyer'
  )),
  dados        jsonb not null default '{}'::jsonb,
  coletado_em  timestamptz not null default now(),
  primary key (dia, fonte)
);

alter table public.metricas_diarias enable row level security;
revoke all on public.metricas_diarias from anon, authenticated;
-- Tabela criada via integração não herda DML para o papel de serviço:
-- sem este grant a rota devolvia "permission denied" (aprendido em 2026-08-22).
grant select, insert, update, delete on public.metricas_diarias to service_role;

create index if not exists metricas_diarias_fonte_dia
  on public.metricas_diarias (fonte, dia desc);

-- A LISTA ESTÁ EM DOIS LUGARES, E ISSO QUASE CUSTOU UMA COLETA (03/10/2026).
--
-- A rota `/api/metricas` valida a fonte contra um `Set` em TypeScript, e o
-- banco valida contra esta cláusula `check`. São duas cópias da mesma lista, e
-- em 03/10 elas divergiram: o `appsflyer` entrou no código, a rota aceitou o
-- pacote, e o banco recusou com `gravacao_falhou`. A rota devolveu 500 e o
-- coletor teria gravado nada todo dia, em silêncio, se a execução não tivesse
-- sido conferida na hora.
--
-- Por isso a `npm run conferir:aquisicao` passou a comparar as duas listas e
-- reprovar quando elas se separam. Regra copiada diverge em silêncio; é a
-- mesma lição da lista de destinos da `acoes-do-dono`.
