-- QUEM RECEBEU 5 E-MAILS E NÃO ABRIU NENHUM SAI DO ENVIO (15/10/2026).
--
-- Decisão do dono em 15/10, depois da investigação da entrega: em 30 dias,
-- 68% dos envios foram para quem nunca abriu nada, e o Gmail decide para onde
-- mandar pelo engajamento de quem recebe. A abertura caiu de 13% para 3% em
-- quatro semanas. Escrever para quem não lê derruba a entrega de quem lê.
--
-- AS REGRAS:
--   * conta só envio COM id do Resend (desde 19/09): antes disso não há
--     evento, e "não abriu" seria falta de instrumento, não de leitor;
--   * clique também é engajamento: quem bloqueia imagem não gera abertura,
--     mas o clique aparece;
--   * o push não passa por aqui: a pessoa continua recebendo no celular.
--
-- Volta ao envio quem abrir ou clicar qualquer e-mail antigo depois (o evento
-- chega pelo webhook e ela sai desta lista sozinha).
create or replace view public.jornada_sem_engajamento
  with (security_invoker = on) as
with ev as (
  select id_externo, bool_or(tipo in ('opened', 'clicked')) as engajou
  from public.email_eventos
  group by id_externo
)
select je.user_id,
  count(*)::int as recebidos,
  (count(*) filter (where ev.engajou))::int as engajados
from public.jornada_envios je
left join ev on ev.id_externo = je.email_id
where je.email_id is not null
group by je.user_id
having count(*) >= 5 and count(*) filter (where ev.engajou) = 0;
