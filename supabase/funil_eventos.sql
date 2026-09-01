-- Funil da operação: do primeiro acesso à assinatura (e ao churn).
--
-- Rode uma vez no painel do Supabase: SQL Editor → cole → Run.
--
-- QUEM ESCREVE AQUI: só o servidor, pela rota /api/funil, usando a chave de
-- serviço. Igual à biela_votos: RLS ligado e SEM política nenhuma — anon e
-- authenticated não leem nem escrevem nada; a chave de serviço passa por cima.
--
-- Os eventos vêm de duas origens com pesos diferentes:
--   · do APP (via rota): abriu_app, cadastro, viu_paywall, iniciou_checkout.
--     São sinais de comportamento — bons para taxas, não são dinheiro.
--   · dos WEBHOOKS (RevenueCat e Stripe): assinou, renovou, cancelou, expirou.
--     São o fato financeiro, confirmados pela loja/processador. A rota do app
--     RECUSA esses quatro de propósito: ninguém fabrica conversão via fetch.
--
-- anon_id: identidade anônima criada no aparelho antes do login (localStorage)
-- para o funil enxergar "abriu → cadastrou" como a mesma pessoa. Não é PII.

create table if not exists public.funil_eventos (
  id         uuid primary key default gen_random_uuid(),
  criado_em  timestamptz not null default now(),

  -- abriu_trilha e cadastrou_carro entraram depois (primeira ação de valor,
  -- a linha 'ativacao' de funil_etapas_28d). Estavam no banco e faltavam
  -- AQUI: rodar este arquivo como estava recriava a restrição sem os dois, e
  -- a partir daí toda ativação seria recusada em silêncio, porque
  -- /api/funil não confere o erro do insert e responde ok do mesmo jeito.
  -- 'atribuicao' é o único evento TÉCNICO desta tabela, e entrou por uma
  -- razão específica (29/08): o SDK de atribuição falha em silêncio de
  -- propósito, e por isso não havia como responder "o SDK subiu neste
  -- aparelho?" sem adivinhar. Ele grava o desfecho da inicialização (ok,
  -- sem-plugin, erro) em `origem`, no máximo uma linha por aparelho por
  -- desfecho — cresce com INSTALAÇÕES, não com uso.
  evento     text not null check (evento in (
    'abriu_app', 'cadastro', 'viu_paywall', 'iniciou_checkout',
    'abriu_trilha', 'cadastrou_carro', 'atribuicao',
    'assinou', 'renovou', 'cancelou', 'expirou'
  )),

  anon_id    text,
  user_id    uuid,
  plataforma text,   -- ios | android | web
  versao     text,   -- versão do app que gerou o evento
  origem     text,   -- de onde veio: onboarding, home, exit10, revenuecat…
  extra      jsonb
);

alter table public.funil_eventos enable row level security;
revoke all on public.funil_eventos from anon, authenticated;

create index if not exists funil_eventos_evento_criado
  on public.funil_eventos (evento, criado_em);
-- Unicidade dos eventos que NAO podem contar duas vezes.
--
-- Ficam no banco, e nao num "confere antes de inserir", porque os dois
-- caminhos que gravam podem chegar no mesmo segundo: o webhook do Stripe e o
-- /api/stripe/sync gravam o mesmo `assinou`, e nenhuma verificacao no codigo
-- da conta de uma corrida assim. O segundo bate no indice e some.
--
-- `renovou` de proposito FICA DE FORA: renovar de novo e fato novo todo mes, e
-- travar isso apagaria receita da leitura.
create unique index if not exists funil_eventos_assinou_unico
  on public.funil_eventos (evento, (extra->>'sub'))
  where evento = 'assinou' and extra->>'sub' is not null;

-- Um cadastro por conta. E o que permite o app mandar o evento sem janela
-- apertada de tempo: manda, e o banco fica so com o primeiro.
create unique index if not exists funil_eventos_cadastro_unico
  on public.funil_eventos (evento, user_id)
  where evento = 'cadastro' and user_id is not null;

create index if not exists funil_eventos_anon
  on public.funil_eventos (anon_id) where anon_id is not null;

-- Resumo semanal pronto para os agentes e para o GET /api/funil.
-- security_invoker: a view NÃO fura o RLS — só a chave de serviço lê.
create or replace view public.funil_semana
  with (security_invoker = on) as
select
  date_trunc('week', criado_em)::date            as semana,
  count(*) filter (where evento = 'abriu_app')                                    as aberturas,
  count(distinct public.identidade(anon_id, user_id))
    filter (where evento = 'abriu_app')                                           as visitantes,
  count(*) filter (where evento = 'cadastro')                                     as cadastros,
  count(*) filter (where evento = 'viu_paywall')                                  as viram_paywall,
  count(*) filter (where evento = 'iniciou_checkout')                             as iniciaram_checkout,
  count(*) filter (where evento = 'assinou')                                      as assinaturas,
  count(*) filter (where evento = 'renovou')                                      as renovacoes,
  count(*) filter (where evento = 'cancelou')                                     as cancelamentos,
  count(*) filter (where evento = 'expirou')                                      as expirados
from public.funil_eventos
group by 1
order by 1 desc;

revoke all on public.funil_semana from anon, authenticated;
