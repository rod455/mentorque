-- Quantos aparelhos estiveram ativos na janela, por plataforma.
--
-- Rode uma vez no painel do Supabase: SQL Editor → cole → Run.
--
-- POR QUE ISTO EXISTE (28/09/2026). O Vigia mandou "Erros no app dispararam:
-- 22 em 7 dias (mais comum: 11x em 6 aparelhos)". Os dois números estavam
-- certos e o alarme estava errado, porque faltava o de baixo: naquele dia
-- havia 50 aparelhos Android ativos, e os 11 relatos eram DOIS aparelhos em
-- loop. Por aparelho, nada tinha disparado: 2 de 50 em 27/09, 2 de 48 em
-- 26/09 e 2 de 41 em 22/09, sempre perto de 4%.
--
-- Alarme que grita todo dia sobre coisa que não é defeito ensina o dono a
-- ignorar o vigia, e aí o dia em que vinte aparelhos caírem passa batido. A
-- mesma frase já está escrita em scripts/verifica-anomalias.ts desde 19/09,
-- sobre outro caso, e em supabase/anomalias-da-operacao.sql desde 27/09.
--
-- POR QUE NÃO DEU PARA USAR A `uso_diario`, que já existe: ela conta por DIA e
-- não por plataforma. Somar sete dias conta a mesma pessoa até sete vezes, e
-- um denominador inflado é tão mentiroso quanto nenhum.
--
-- A REGRA QUE ISTO SERVE, e ela vale para todo alarme desta casa: **alarme é
-- sempre uma razão, nunca uma contagem.** Ver lib/funilCorreto.ts, onde a
-- mesma lição virou régua para as taxas do funil.

create or replace function public.aparelhos_ativos(p_dias int default 7)
returns table(
  plataforma text,
  aparelhos  bigint
)
language sql
stable
as $function$
  -- DISTINCT na janela inteira, e não a soma dos dias: quem abriu o app em
  -- cinco dos sete conta UMA vez, que é o que faz dele um denominador.
  select
    coalesce(f.plataforma, 'desconhecida')::text,
    count(distinct f.anon_id)
  from public.funil_eventos f
  where f.criado_em >= now() - (p_dias || ' days')::interval
    and f.anon_id is not null
  group by coalesce(f.plataforma, 'desconhecida')
  order by 2 desc
$function$;

comment on function public.aparelhos_ativos(int) is
  'Aparelhos distintos ativos na janela, por plataforma. E o DENOMINADOR dos alarmes: sem ele, "6 aparelhos com erro" nao diz se e 6 de 50 ou 6 de 6 (28/09/2026).';
