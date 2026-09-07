-- A troca do provedor de embedding, de OpenAI para Voyage.
--
-- JÁ APLICADO no banco (migrações `embedding_voyage_coluna` e
-- `match_manual_chunks_voyage`, 05/09/2026). Guardado aqui como registro da
-- fonte, no mesmo formato de estado_da_base.sql e funil-canonico.sql. A
-- `npm run conferir:embedding` lê ESTE arquivo para conferir que a dimensão da
-- coluna bate com a que o código pede.
--
-- POR QUE. A conta da OpenAI ficou sem crédito. A primeira ideia foi usar o
-- Claude, que já é quem responde na `/api/biela`, e ela não vai de pé: a
-- Anthropic não tem API de embedding, em modelo nenhum. A Voyage é a que a
-- própria Anthropic indica, e foi a escolha do dono.
--
-- O QUE ISSO CUSTA. Vetor de um modelo não conversa com vetor de outro. Os
-- 28.426 trechos existentes foram feitos com `text-embedding-3-small`, em 1536
-- dimensões, e a Voyage devolve 1024. Não existe conversão: é refazer.
--
-- O QUE SALVOU A OPERAÇÃO foi o texto estar guardado. `manual_chunks.content`
-- tem cada pedaço como foi picado, então `scripts/reembeddar.mjs` refaz só a
-- vetorização, sem precisar dos PDFs originais, que na maioria já não estão na
-- mão de ninguém.
--
-- EM COLUNA NOVA, e não no lugar. Trocar o tipo da coluna apagaria a base
-- inteira antes de existir substituta. Com as duas lado a lado dá para
-- preencher aos poucos, comparar a qualidade da busca e voltar atrás. A coluna
-- velha sai num passo separado, depois de a nova estar completa.

-- 1. A coluna nova. Sem índice vetorial, de propósito, porque a velha também
--    não tem: o filtro de marca e modelo corta a tabela para algumas centenas
--    de linhas antes da comparação, e a varredura nesse tamanho é barata.
alter table public.manual_chunks
  add column if not exists embedding_voyage vector(1024);

comment on column public.manual_chunks.embedding_voyage is
  'Embedding da Voyage (voyage-4-lite, output_dimension 1024, input_type=document). Convive com a coluna embedding, da OpenAI, ate a migracao terminar.';

-- 2. A busca passa a comparar na coluna nova. Isto TEM que andar junto com
--    lib/rag.ts: a partir daqui chega um vetor de 1024, e comparar com a
--    coluna antiga, de 1536, é erro de tipo no Postgres.
--
--    `embedding_voyage is not null` é o que permite migrar aos poucos:
--    enquanto o reembeddar não terminar, a busca enxerga só a parte já
--    convertida. É pior que o ideal e melhor que o estado em que ela ficou
--    quando o crédito acabou, que era não enxergar nada.
create or replace function public.match_manual_chunks(
  query_embedding vector,
  match_count integer default 8,
  f_make text default null,
  f_model text default null,
  f_year integer default null
)
returns table(id bigint, content text, make text, model text, year integer, similarity double precision)
language sql
stable
as $function$
  select c.id, c.content, c.make, c.model, c.year,
         1 - (c.embedding_voyage <=> query_embedding) as similarity
  from public.manual_chunks c
  where c.embedding_voyage is not null
    and (f_make is null or lower(regexp_replace(c.make, '[^a-zA-Z0-9]', '', 'g')) = lower(regexp_replace(f_make, '[^a-zA-Z0-9]', '', 'g')))
    and (f_model is null or c.model is null or lower(regexp_replace(c.model, '[^a-zA-Z0-9]', '', 'g')) = lower(regexp_replace(f_model, '[^a-zA-Z0-9]', '', 'g')))
  order by (case when f_year is null or c.year is null then 0 else abs(c.year - f_year) end),
           c.embedding_voyage <=> query_embedding
  limit match_count;
$function$;

-- 3. O PASSO QUE AINDA NÃO FOI DADO, e não deve ser dado com pressa:
--
--    alter table public.manual_chunks drop column embedding;
--
--    Só depois de o reembeddar terminar, da busca estar respondendo bem por
--    alguns dias e de alguém ter comparado algumas respostas com as de antes.
--    Enquanto a coluna velha existir, voltar atrás é uma migração de dez linhas.

-- ────────────────────────────────────────────────────────────────────────────
-- A COLUNA ANTIGA FOI APAGADA (07/09/2026, migração `remove_embedding_openai_1536`).
--
-- Dois dias depois da troca, o banco passou da cota do plano gratuito: 527 MB
-- de 500. A tabela manual_chunks tinha 475 MB, e a conta fechava assim:
--
--   embedding (OpenAI, 1536)    167 MB   28.426 linhas, nada mais lia
--   embedding_voyage (1024)     140 MB   35.717 linhas, 100% preenchida
--   content                      45 MB
--   versões mortas do TOAST    ~120 MB   os 28 mil UPDATEs do backfill
--
-- A `match_manual_chunks` compara só em embedding_voyage, o código só escreve
-- embedding_voyage, e não havia índice em nenhuma das duas. A coluna antiga era
-- peso morto desde que a chave da OpenAI acabou. Decisão do dono: apagar e
-- compactar (VACUUM FULL), porque DROP COLUMN sozinho não devolve espaço em
-- disco, e é o disco que o Supabase mede.
--
-- O que fica de lição: uma troca de provedor de embedding é uma coluna nova E
-- uma coluna velha, e a velha precisa de data para sair. Sem isso ela fica, e
-- 6 KB por trecho vezes trinta mil trechos é a cota inteira.
--
--   alter table public.manual_chunks drop column if exists embedding;
--   vacuum (full, analyze) public.manual_chunks;
