-- Por que a pessoa cancelou, um clique por linha.
--
-- POR QUÊ (02/10/2026, pedido do dono: "um e-mail para comunicar quem cancelar
-- a assinatura, com uma pesquisa de satisfação e perguntando os principais
-- motivos, para a gente continuar evoluindo"). Em 02/10 os três assinantes do
-- Stripe saíram no mesmo dia, e `cancelou` não tem campo de motivo: a casa
-- sabia QUE saíram e não sabia POR QUÊ. Enquanto isso não existir, toda
-- conversa sobre churn é palpite.
--
-- GUARDA TODOS OS CLIQUES, inclusive os que não são de gente. A resposta chega
-- por um link dentro de um e-mail, e servidor corporativo e antivírus ABREM
-- todos os links da mensagem para conferir se levam a lugar perigoso. Tentar
-- adivinhar robô aqui, na gravação, seria descartar sem poder olhar o conjunto.
-- A varredura é reconhecida NA LEITURA (`respostasLegiveis`, em
-- lib/email/motivoDaSaida.ts): seis motivos diferentes da mesma pessoa em menos
-- de 30 segundos não é opinião, e o descarte é CONTADO em vez de sumir.
--
-- Por isso NÃO tem unicidade por pessoa: a segunda linha da mesma pessoa é
-- justamente o sinal que a leitura precisa para saber que foi varredura.
--
-- NÃO GUARDA TEXTO NENHUM. O motivo é um dos ids de `MOTIVOS`
-- (lib/email/saida.ts), e quem quiser contar mais responde o e-mail, que cai
-- numa caixa que o dono lê. O que não se guarda não vaza.

create table if not exists public.saida_motivos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  user_id uuid not null,
  motivo text not null
);

-- Os dois recortes que existem: por pessoa em ordem de tempo (é assim que a
-- leitura reconhece varredura) e a janela de 30 dias do retrato.
--
-- Os nomes são os que estão APLICADOS no banco, conferidos em 02/10 com
-- `pg_get_indexdef`. Arquivo com nome diferente do aplicado não é documentação,
-- é um terceiro índice esperando alguém rodar isto.
create index if not exists saida_motivos_user_idx
  on public.saida_motivos (user_id, criado_em);
create index if not exists saida_motivos_dia_idx
  on public.saida_motivos (criado_em desc);

-- Ninguém lê nem escreve isto pelo cliente: quem grava é o service_role na
-- rota /api/jornada/motivo, com a assinatura conferida, e quem lê é
-- /api/dados. RLS ligada SEM política nenhuma é a porta fechada.
alter table public.saida_motivos enable row level security;
