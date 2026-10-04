-- A view `contas_criadas`: contas por semana, separando as do próprio time.
--
-- POR QUE ESTE ARQUIVO NASCEU TARDE (04/10/2026). A view existia no banco e
-- NÃO existia no repositório. O `estado_da_base.sql` já a mencionava num
-- comentário ("Entrou a view contas_criadas"), mas o comando que a cria não
-- estava em lugar nenhum. Quem lesse `supabase/` para saber o que existe e como
-- está protegido não a encontrava.
--
-- Isso é a mesma família do erro de 19/09: o repositório dizendo uma coisa e o
-- banco fazendo outra. Aqui não havia buraco de permissão (ver abaixo), mas
-- havia um objeto que LÊ `auth.users` fora do alcance de qualquer leitura de
-- código e de qualquer conferência de texto, inclusive da `conferir:banco`.
--
-- O conteúdo abaixo é transcrição do que já estava no ar em 04/10/2026, lido com
-- `pg_get_viewdef` e `reloptions`. Rodar de novo é no-op de propósito: este
-- arquivo documenta o estado, não muda ele.
--
-- security_invoker = on: a view NÃO fura o RLS. Como ela lê `auth.users`, o `on`
-- é a metade que importa aqui: quem chamar precisa ter privilégio na tabela de
-- origem, e `anon` e `authenticated` não têm. É a variante segura do par que
-- expôs a lista de e-mail em 19/09, onde o perigo era `SECURITY DEFINER`.

create or replace view public.contas_criadas
  with (security_invoker = on) as
select
  (date_trunc('week', created_at at time zone 'America/Sao_Paulo'))::date as semana,
  count(*)                                                                as contas,
  count(*) filter (
    where email::text <> all (array[
      'mentorque.ar@gmail.com',
      'rodrigomoraessilva455@gmail.com',
      'revisor@mentorque.com.br'
    ]::text[])
  )                                                                       as contas_de_fora
from auth.users
group by 1
order by 1 desc;

-- A mesma lista de três endereços do time está em `estado_da_base.sql`, na
-- função `contas_criadas_desde(date)`. Mudou um? Mude nos dois.

-- Só a chave de serviço lê. Confira no ESTADO, não aqui:
--   select has_table_privilege('anon', 'public.contas_criadas', 'SELECT');
-- Em 04/10/2026 a ACL no ar era `postgres` e `service_role`, e mais ninguém.
revoke all on public.contas_criadas from public, anon, authenticated;
grant select on public.contas_criadas to service_role;
