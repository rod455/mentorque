-- As anomalias que ninguém estava olhando.
--
-- Rode uma vez no painel do Supabase: SQL Editor → cole → Run.
--
-- POR QUE ISTO EXISTE (07/09/2026). Duas coisas graves ficaram semanas
-- invisíveis, e nenhuma das duas exigia dado novo: as duas estavam no banco o
-- tempo todo, esperando alguém fazer a pergunta certa.
--
--   1. O ANDROID NUNCA TEVE UMA CONTA. Em quatro semanas e 160 eventos, nenhum
--      evento do Android carregou `user_id`. iPhone e web carregam desde 24/08.
--      Ninguém percebeu porque o relatório olhava o total, e no total a web
--      cobre o buraco.
--
--   2. QUEM RESPONDE O QUIZ NO ANDROID SOME. Três aparelhos na 1.8.0
--      responderam a pergunta do dia entre 04 e 06/09, e nenhum produziu outro
--      evento depois. Em dois deles, responder foi a última coisa que aquele
--      aparelho fez.
--
-- A SEGUNDA IMPORTA MAIS DO QUE PARECE, e é por causa de um defeito de projeto
-- da nossa própria instrumentação: a migalha de lib/app/ultimoPasso.ts só
-- consegue acusar um fechamento NA ABERTURA SEGUINTE. Se o fechamento for ruim
-- o bastante para a pessoa desistir e não voltar, a testemunha nunca fala. Foi
-- exatamente o que aconteceu: a migalha produziu seis relatos desde que subiu,
-- todos na web e nenhum no Android, que é a plataforma que ela vigia.
--
-- Esta função não depende de ninguém voltar. Ela roda no servidor, sobre o que
-- já está gravado, e é lida pelo retrato diário.
--
-- O QUE ELA NÃO É: prova. "Respondeu e sumiu" também é o que faz quem terminou
-- o que veio fazer. O valor está em ser CONTÁVEL e comparável entre
-- plataformas: se o Android some e o iPhone não, a diferença é o achado.

create or replace function public.anomalias_da_operacao(p_dias int default 14)
returns table(
  anomalia   text,
  plataforma text,
  quantas    bigint,
  detalhe    text
)
language sql
stable
as $function$
  -- 1. Plataforma com gente e sem nenhuma conta, EM TODA A HISTÓRIA.
  --
  -- A janela não entra aqui de propósito: "nunca teve" é uma afirmação sobre
  -- tudo, e recortar por 14 dias transformaria um defeito antigo em novidade
  -- toda semana. O piso de 5 aparelhos evita gritar por causa de um aparelho
  -- de teste.
  select
    'plataforma sem nenhuma conta'::text,
    e.plataforma,
    count(distinct e.anon_id),
    'nenhum evento com user_id em toda a historia; iPhone e web tem'::text
  from public.funil_eventos e
  where e.plataforma is not null
  group by e.plataforma
  having count(e.user_id) = 0 and count(distinct e.anon_id) >= 5

  union all

  -- 2. Respondeu o quiz e nunca mais produziu evento.
  --
  -- É a impressão digital do app fechando na pergunta do dia, VISTA DE FORA,
  -- sem depender da migalha nem de a pessoa voltar. Indício, não prova: quem
  -- terminou o que veio fazer também some. Por isso sai por plataforma, que é
  -- onde a comparação vira achado.
  select
    'respondeu o quiz e sumiu'::text,
    coalesce(p.plataforma, 'desconhecida'),
    count(*),
    'sem nenhum evento depois da resposta; indicio, nao prova'::text
  from public.quiz_respostas q
  left join lateral (
    select f.plataforma
    from public.funil_eventos f
    where f.anon_id = q.anon_id
    order by f.criado_em desc
    limit 1
  ) p on true
  where q.criado_em >= now() - (p_dias || ' days')::interval
    and not exists (
      select 1 from public.funil_eventos f
      where f.anon_id = q.anon_id and f.criado_em > q.criado_em
    )
  group by coalesce(p.plataforma, 'desconhecida')

  order by 1, 3 desc
$function$;

comment on function public.anomalias_da_operacao(int) is
  'Anomalias da operação para o retrato diário. Não prova nada sozinha: conta padrões que valem investigação, e a comparação entre plataformas é onde eles viram achado.';
