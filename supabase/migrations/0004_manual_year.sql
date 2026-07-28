-- Tag manual chunks with the model year and make retrieval prefer the manual
-- matching the car's year (without ever excluding a model that has only other
-- years ingested). Run in the Supabase SQL editor.

alter table public.manual_chunks add column if not exists year int;
create index if not exists manual_chunks_year_idx on public.manual_chunks (make, model, year);

-- Replace the search function with a year-aware version. Chunks from the year
-- closest to the car come first; when no year is given (or stored) it degrades
-- to pure similarity, so single-year manuals behave exactly as before.
drop function if exists public.match_manual_chunks(vector, integer, text, text);
create or replace function public.match_manual_chunks(
  query_embedding vector(1536),
  match_count int default 8,
  f_make text default null,
  f_model text default null,
  f_year int default null
)
returns table (id bigint, content text, make text, model text, year int, similarity float)
language sql stable
as $$
  select c.id, c.content, c.make, c.model, c.year,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.manual_chunks c
  where (f_make is null or lower(regexp_replace(c.make, '[^a-zA-Z0-9]', '', 'g')) = lower(regexp_replace(f_make, '[^a-zA-Z0-9]', '', 'g')))
    and (f_model is null or c.model is null or lower(regexp_replace(c.model, '[^a-zA-Z0-9]', '', 'g')) = lower(regexp_replace(f_model, '[^a-zA-Z0-9]', '', 'g')))
  order by (case when f_year is null or c.year is null then 0 else abs(c.year - f_year) end),
           c.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_manual_chunks(vector, integer, text, text, integer) to service_role;
