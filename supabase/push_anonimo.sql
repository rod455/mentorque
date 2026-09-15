-- O token de push passa a poder ser do APARELHO, não só da CONTA.
--
-- POR QUÊ (15/09/2026, decisão do dono). O Vigia acusou 10 ocorrências de
-- "token pronto, mas sem sessão". A causa, medida: no Android há 26 aparelhos
-- em 5 dias e NENHUM evento com `user_id`. Ninguém tem conta. Como a linha
-- desta tabela exigia `user_id`, o push não alcançava uma única pessoa no
-- Android: a tabela inteira tinha 1 token, de 11/09, e nenhum registro novo
-- desde então.
--
-- A partir daqui a linha é do token (que é do aparelho) e o dono dela pode ser
-- uma conta, um aparelho anônimo, ou os dois quando a pessoa cria conta depois.
-- O `token` continua sendo a chave: um aparelho, uma linha, sem duplicata.
--
-- O `anon_id` guardado junto com o `user_id` não é redundância: é o que liga o
-- aparelho de antes à conta de depois, e é o que faz a jornada de quem não tem
-- conta parar sozinha quando a conta nasce (ela lê só `user_id is null`).

alter table public.push_tokens alter column user_id drop not null;

alter table public.push_tokens add column if not exists anon_id text;

-- Linha sem dono nenhum não tem para quem mandar, e seria lixo silencioso.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'push_tokens_tem_dono'
  ) then
    alter table public.push_tokens
      add constraint push_tokens_tem_dono
      check (user_id is not null or anon_id is not null);
  end if;
end $$;

create index if not exists push_tokens_anon_idx
  on public.push_tokens (anon_id) where anon_id is not null;

-- A jornada do aparelho sem conta lê por aqui, e é sempre este recorte.
create index if not exists push_tokens_sem_conta_idx
  on public.push_tokens (updated_at) where user_id is null;
