-- Mentorque — manuals knowledge base for the Biela RAG.
-- Run this in the Supabase SQL editor of the Mentorque project.
--
-- Stores manufacturer manuals split into embedded chunks so /api/biela can
-- retrieve the passages relevant to a user's make/model and ground its answers.

-- pgvector for similarity search.
create extension if not exists vector;

-- One row per manual (a make/model, optionally a year range).
create table if not exists public.manuals (
  id          uuid primary key default gen_random_uuid(),
  make        text not null,
  model       text,
  year_from   int,
  year_to     int,
  title       text,
  source_url  text,
  created_at  timestamptz not null default now()
);

-- Embedded chunks. 1536 dims = OpenAI text-embedding-3-small.
create table if not exists public.manual_chunks (
  id          bigint generated always as identity primary key,
  manual_id   uuid references public.manuals(id) on delete cascade,
  make        text not null,
  model       text,
  content     text not null,
  embedding   vector(1536),
  created_at  timestamptz not null default now()
);

create index if not exists manual_chunks_embedding_idx
  on public.manual_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists manual_chunks_make_model_idx
  on public.manual_chunks (make, model);

-- Cosine-similarity search, optionally filtered by make/model. A null model on
-- the chunk means "applies to the whole make", so it always stays eligible.
create or replace function public.match_manual_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  f_make text default null,
  f_model text default null
)
returns table (id bigint, content text, make text, model text, similarity float)
language sql stable
as $$
  select c.id, c.content, c.make, c.model,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.manual_chunks c
  where (f_make is null or c.make = f_make)
    and (f_model is null or c.model is null or c.model = f_model)
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- RLS on: the public (anon/publishable) key gets no access. Retrieval runs
-- server-side with the service-role key, which bypasses RLS.
alter table public.manuals       enable row level security;
alter table public.manual_chunks enable row level security;
