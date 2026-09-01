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

create or replace view public.estado_da_base
  with (security_invoker = on) as
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
