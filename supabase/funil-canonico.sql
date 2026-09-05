-- A ÚNICA leitura do funil. Quem quiser número de funil chama isto.
--
-- JÁ APLICADO no banco (migração funil_canonico, 05/09/2026). Guardado aqui
-- como registro da fonte, no mesmo formato de estado_da_base.sql.
--
-- POR QUE EXISTE. A régua já existia inteira: `public.identidade` decide quem
-- é quem, `lib/funilCorreto.ts` decide o que pode ser dividido por o que,
-- `estado_da_base` responde as perguntas de estado e `contas_criadas_desde`
-- conta contas já tirando as três do próprio time. Mesmo assim o número mudava
-- de uma resposta para a outra, e em 05/09 o dono cobrou: "cada hora você me
-- traz um resultado do funil".
--
-- Ele estava certo, e a causa não era a regra: era cada leitura escrever o
-- próprio SQL. Ora contando `anon_id`, ora `user_id`, ora recortando por
-- coorte de campanha. Três consultas honestas, três números diferentes, todos
-- defensáveis, nenhum comparável com o da véspera. Regra que mora só em
-- documento não se aplica sozinha; esta função existe para que não haja o que
-- escrever à mão.
--
-- AS TRÊS RÉGUAS VÊM LADO A LADO DE PROPÓSITO. A oficial é `pessoas`, que usa
-- `public.identidade` (anon_id do aparelho, com user_id de reserva). As outras
-- duas não são alternativa: são o aviso. Quando `contas` = 0 e `aparelhos` > 0,
-- aquele evento só existe antes do login. Quando `aparelhos` = 0 e `contas` > 0,
-- ele nasceu num webhook e não sabe de aparelho nenhum.
--
-- O caso real que isso denuncia, na janela de 01/09/2026:
--
--   iniciou_checkout   3 pessoas   3 aparelhos   3 contas
--   assinou            1 pessoa    0 aparelhos   1 conta
--
-- Os dois números existem e a divisão dá 33%. E é ficção: `assinou` vem do
-- webhook do Stripe e é contado por user_id, `iniciou_checkout` acontece no
-- aparelho e é contado por anon_id. Quem assinou não está, e nunca vai estar,
-- dentro da lista de quem iniciou. A trava que recusa essa divisão mora em
-- `UNIDADE`, em lib/funilCorreto.ts, e `npm run conferir:funil` prova que ela
-- recusa exatamente este par.

create or replace function public.funil_canonico(p_desde date)
returns table(
  evento text,
  pessoas bigint,
  aparelhos bigint,
  contas bigint,
  eventos bigint,
  primeiro date
)
language sql
stable
as $function$
  select
    e.evento,
    count(distinct public.identidade(e.anon_id, e.user_id)) as pessoas,
    count(distinct e.anon_id)                               as aparelhos,
    count(distinct e.user_id)                               as contas,
    count(*)                                                as eventos,
    min(e.criado_em)::date                                  as primeiro
  from public.funil_eventos e
  where e.criado_em >= p_desde
  group by e.evento
$function$;

comment on function public.funil_canonico(date) is
  'A unica leitura do funil. pessoas = regua oficial (public.identidade). aparelhos e contas vem junto para denunciar evento que vive em outro espaco de identidade: contas=0 significa que o evento so existe antes do login.';

revoke all on function public.funil_canonico(date) from anon, authenticated;
grant execute on function public.funil_canonico(date) to service_role;

-- Primeira leitura, janela de 01/09/2026 (pessoas · aparelhos · contas):
--
--   comecou_onboarding        75 · 75 · 0
--   abriu_app                 38 · 39 · 0     (o 39º é um aparelho sem
--                                              armazenamento, que a identidade
--                                              anula de propósito)
--   terminou_onboarding       31 · 31 · 0
--   viu_paywall               13 · 14 · 7
--   abriu_cadastro_de_carro   10 · 10 · 0
--   cadastro                   6 ·  6 · 6
--   iniciou_checkout           3 ·  3 · 3
--   cadastrou_carro            2 ·  2 · 0
--   assinou                    1 ·  0 · 1
