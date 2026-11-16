-- As respostas da pesquisa curta do app (16/11/2026, plano de receita).
--
-- QUEM ESCREVE AQUI: só o servidor, pela rota /api/pesquisa, com a chave de
-- serviço. O app nunca fala com esta tabela direto. Por isso o RLS fica
-- ligado e SEM política nenhuma, como em `biela_votos`: o campo livre pode
-- trazer nome, telefone ou placa sem ninguém pedir.
--
-- O que cada resposta quer dizer está em lib/pesquisa/perguntas.ts, que é a
-- mesma lista que a rota usa para recusar valor inventado.

create table if not exists public.pesquisa_respostas (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  pesquisa    text not null,
  anon_id     text,
  sentir      text check (sentir in ('muito', 'pouco', 'nada')),
  gasto       text check (gasto in ('nada', 'ate500', 'ate2000', 'mais')),
  seguro      text check (seguro in ('sim', 'nao', 'naosei')),
  preco       text check (preco in ('nada', 'ate5', 'ate10', 'ate20', 'mais')),
  livre       text,
  plataforma  text,
  versao      text
);

-- Uma resposta por aparelho e pesquisa: quem tocar duas vezes em enviar não
-- vira dois votos. Índice COMPLETO, e não parcial (`where anon_id is not
-- null`): o `upsert` do supabase-js não consegue apontar para índice parcial
-- e falharia em toda gravação. Sem aparelho, `null` não colide com `null`
-- (nulls distintos), então o efeito é o mesmo. Corrigido no mesmo dia, pela
-- migração pesquisa_respostas_indice_completo.
create unique index if not exists pesquisa_respostas_uma_por_aparelho
  on public.pesquisa_respostas (pesquisa, anon_id);

alter table public.pesquisa_respostas enable row level security;
revoke all on public.pesquisa_respostas from anon, authenticated;
