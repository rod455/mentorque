-- Quem conta como gente no funil, num lugar só.
--
-- JÁ APLICADO no banco (migração identidade_unica_e_sem_armazenamento).
-- Guardado aqui como registro da fonte.
--
-- POR QUE EXISTE (01/09/2026): a expressão `coalesce(anon_id, user_id::text)`
-- estava copiada em oito views, e nenhuma delas sabia que o app grava o texto
-- literal 'sem-armazenamento' como anon_id quando o localStorage não responde.
-- Resultado: TODOS os aparelhos sem armazenamento viravam UMA pessoa, com os
-- eventos colados uns nos outros. O banco tinha uma linha com 20 eventos, de
-- 23/08 a 01/09, em quatro versões diferentes do app. Não era uma pessoa.
--
-- Esse número foi parar no título do relatório do Diretor de 31/08
-- ("Dezessete pessoas usando"), e o dono pegou com uma pergunta de uma linha:
-- se não teve download, como essas pessoas entraram?
--
-- A REGRA: sem armazenamento não é identidade. O evento continua gravado e
-- continua contando em ABERTURAS; ele só não entra em contagem de gente. E as
-- views expõem `aberturas_sem_identidade` para o tamanho desse ponto cego ser
-- visível, em vez de sumir. Zero e sem medição não podem chegar iguais.
--
-- O GÊMEO DESTA REGRA mora no app, em lib/app/anon.ts, na constante
-- SEM_ARMAZENAMENTO. Os dois lados combinam pelo PREFIXO. Mudar um sem o
-- outro faz aparelho sem identidade voltar a contar como pessoa, e
-- `npm run conferir:identidade` reprova exatamente esse caso.

create or replace function public.identidade(p_anon text, p_user uuid)
returns text
language sql
immutable
parallel safe
as $$
  select coalesce(
    case
      when p_anon is null then null
      when btrim(p_anon) = '' then null
      -- O marcador de "não deu para guardar id", com ou sem sufixo de sessão.
      when p_anon like 'sem-armazenamento%' then null
      else p_anon
    end,
    p_user::text
  )
$$;

comment on function public.identidade(text, uuid) is
  'A identidade de um evento do funil: anon_id do aparelho, com user_id de reserva. Devolve NULL quando nao ha identidade possivel (aparelho sem armazenamento). Unica fonte da regra: nao repetir coalesce(anon_id, user_id) em view nenhuma.';

revoke all on function public.identidade(text, uuid) from anon, authenticated;
grant execute on function public.identidade(text, uuid) to service_role;

-- O QUE MUDOU NOS NÚMEROS, medido no dia da troca:
--
--   semana      visitantes antes  →  depois   aberturas_sem_identidade
--   2026-08-31         3                2               3
--   2026-08-24        17               16              11
--   2026-08-17         2                1               2
--
-- Onze das 84 aberturas da semana de 24/08 não têm identidade possível. Antes
-- elas eram uma pessoa inventada; agora são um ponto cego declarado.
