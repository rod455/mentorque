-- O ESTADO da base, que é o que "ativação" sempre quis dizer.
--
-- JÁ APLICADO no banco (migração estado_da_base_conferivel). Guardado aqui
-- como registro da fonte.
--
-- POR QUE EXISTE (01/09/2026): o funil respondia "quantos cadastraram carro"
-- com o evento `cadastrou_carro`, que dispara no INSTANTE do cadastro e nunca
-- mais. Quem já tinha carro antes de o instrumento existir é invisível para
-- sempre. Dividir isso por `abriu_app`, que dispara toda sessão para todo
-- mundo, é dividir fluxo de novatos por estoque de todos: sai um número
-- calculável que não quer dizer nada. Foi assim que o relatório de 31/08
-- publicou 17 → 8 → 2 → 2 → 2 como se fosse funil.
--
-- Aqui a pergunta é outra e a resposta é conferível uma a uma: de quem tem
-- conta, quantos TÊM carro hoje e quantos TÊM serviço registrado. É estado,
-- sai do user_state, e não depende de a pessoa ter feito a ação depois que a
-- gente ligou a medição.
--
-- O LIMITE HONESTO, e ele importa mais que o número: user_state só existe
-- para quem tem CONTA. Quem usa como convidado (que é a maioria, e é decisão
-- de produto registrada nos Termos) guarda o carro só no aparelho e não
-- aparece aqui. Esta view responde "entre as CONTAS", nunca "entre os
-- usuários". Escrever a segunda coisa é mentira, e a diferença tem nome.
--
-- A regra de o que pode ser dividido por o que mora em lib/funilCorreto.ts, é
-- pura, e `npm run conferir:funil` prova que ela recusa o caso real.

-- 14/09/2026 (migração estado_da_base_como_dono): security_invoker DESLIGADO.
-- Com ele ligado, a view rodava como service_role, que não lê auth.users, e
-- respondia 403 desde 01/09 ("permission denied for table users" no log do
-- Postgres); o retrato publicava estadoDaBase nulo. Roda como o dono
-- (postgres); só o service_role tem GRANT, e ela devolve contagens. A função
-- contas_criadas_desde(date) virou SECURITY DEFINER pelo mesmo motivo.
create or replace view public.estado_da_base
  with (security_invoker = off) as
select
  (select count(*) from auth.users)                                   as contas,
  count(*)                                                            as contas_com_estado,
  count(*) filter (
    where jsonb_typeof(data->'vehicles') = 'array'
      and jsonb_array_length(data->'vehicles') > 0
  )                                                                   as contas_com_carro,
  count(*) filter (
    where jsonb_typeof(data->'services') = 'array'
      and jsonb_array_length(data->'services') > 0
  )                                                                   as contas_com_servico,
  count(*) filter (where updated_at >= now() - interval '7 days')      as contas_ativas_7d,
  count(*) filter (where updated_at >= now() - interval '30 days')     as contas_ativas_30d
from public.user_state;

comment on view public.estado_da_base is
  'Estado (nao ato): de quem tem conta, quantos TEM carro e servico hoje. Responde ativacao sem depender de o evento ter existido na epoca. Nao cobre quem usa como convidado, que nao tem user_state.';

revoke all on public.estado_da_base from anon, authenticated;
grant select on public.estado_da_base to service_role;

-- Primeira leitura, em 01/09/2026: 10 contas, 10 com estado, 5 com carro,
-- 3 com serviço, 2 ativas em 7 dias e 8 em 30 dias. Compare com o que o
-- funil dizia no mesmo dia: 2 pessoas em `cadastrou_carro`. Não é
-- contradição, são perguntas diferentes: 5 TÊM carro, 2 CADASTRARAM na
-- janela em que o evento existia.

-- 2026-09-01, segunda leva: CADASTRO deixou de sair do evento.
--
-- O evento `cadastro` só dispara para conta criada há menos de 7 dias, e esse
-- buraco NENHUM build conserta: a conta de 08/08 continua velha demais, hoje e
-- sempre. Na janela de 22/08 o evento contava 1 e a tabela contava 2; no
-- total, 7 contas de fora contra 1 evento.
--
-- Entrou a view `contas_criadas` (por semana, separando as três contas do
-- próprio time) e a função `contas_criadas_desde(data)`, que o /api/dados usa
-- como degrau do funil no lugar do evento. O evento continua existindo porque
-- carrega o que a tabela não sabe: plataforma e a UTM da campanha.
--
-- A REGRA, que vale para além do funil: quando existe uma tabela com o fato
-- gravado, contar a tabela ganha do evento. Evento é para o que não deixa
-- rastro em lugar nenhum. Está declarada em FONTE_MELHOR, em
-- lib/funilCorreto.ts, e `npm run conferir:funil` reprova se alguém apagar a
-- declaração e voltar a contar pelo evento sem dizer.

-- 2026-09-20: A FUNÇÃO ABAIXO EXISTIA SÓ NO BANCO.
--
-- Ela é citada três vezes em comentário deste repositório desde 01/09, e a
-- definição dela não estava em lugar nenhum. Quem quisesse saber o que ela faz
-- tinha que abrir o painel.
--
-- É o mesmo defeito que custou duas rodadas nos modelos de e-mail do Supabase
-- na semana passada: conhecimento que mora onde nenhum script nosso lê é
-- conhecimento que a gente descobre errado depois. E aqui pesa mais, porque
-- esta função é `security definer` e lê `auth.users`, ou seja, a tabela com o
-- e-mail de todo mundo.
--
-- Achada por `npm run conferir:banco`, que na estreia cobriu duas funções e
-- não cobria esta, justamente porque ela não estava aqui.
--
-- O texto abaixo é o que está NO BANCO hoje, lido de `pg_get_functiondef`,
-- não reescrito de memória.
create or replace function public.contas_criadas_desde(p_desde date)
returns bigint
language sql
stable
security definer
-- `pg_temp` por último. Não nomeado, ele seria pesquisado PRIMEIRO, e numa
-- função que roda como o dono isso é sequestro de nome. Esta nasceu certa; as
-- duas de cadastros_do_dia.sql só ficaram em 20/09.
set search_path = public, auth, pg_temp
as $$
  select count(*) from auth.users
  where created_at >= p_desde
    and email not in (
      'mentorque.ar@gmail.com',
      'rodrigomoraessilva455@gmail.com',
      'revisor@mentorque.com.br'
    )
$$;

-- A mesma trava das outras: `from public` é o que importa, porque
-- `create function` dá EXECUTE ao papel PUBLIC sozinho, e tirar só de `anon` e
-- `authenticated` não tira nada. Foi exatamente esse engano que deixou a lista
-- de e-mail alcançável pela chave pública até 19/09/2026.
revoke all on function public.contas_criadas_desde(date) from public, anon, authenticated;
grant execute on function public.contas_criadas_desde(date) to service_role;
