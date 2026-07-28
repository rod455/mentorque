-- Grant the server role (service_role) access to the manuals tables/function.
-- RLS stays enabled (no anon/authenticated access); the service-role key used
-- by the ingest script and by /api/biela bypasses RLS but still needs the
-- table-level GRANTs below, which aren't always applied automatically.

grant usage on schema public to service_role;

grant select, insert, update, delete on public.manuals       to service_role;
grant select, insert, update, delete on public.manual_chunks to service_role;

-- Identity column on manual_chunks + any sequences.
grant usage, select on all sequences in schema public to service_role;

-- RAG retrieval calls this via RPC with the service-role key.
grant execute on function public.match_manual_chunks(vector, integer, text, text) to service_role;
