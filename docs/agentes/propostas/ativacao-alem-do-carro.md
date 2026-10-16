# A ativação passa a medir "algo de valor ALÉM do carro"

Resposta do CRO ao pedido da Engenharia que entrou na fila em 09/10/2026, para
esta rodada (16/10). Quem define o sentido da métrica é o CRO; quem aplica a
view é a Engenharia. Tudo abaixo foi medido no banco do Mentorque em
**16/10/2026 às 11h20 UTC**, por consulta própria, com a view atual na mão
(`supabase/vendas_e_ativacao.sql`).

## O problema, em uma frase

A `ativacao_coortes` conta a primeira ação de valor que acontece **em ou depois
do evento `cadastro`**, e a lista de ações de valor é `('abriu_trilha',
'cadastrou_carro')`. Desde 12/09 o Android pede o CARRO antes da conta, de
propósito e com bom resultado, então a ação que a view procura acontece quase
sempre ANTES do marco que ela usa como largada.

Medido em 09/10 e confirmado hoje: na coorte de 21/09, 45 das 51 pessoas têm o
`cadastrou_carro` antes do `cadastro`. A view lê **3 de 51**. E o conserto
óbvio não serve: começando a janela um dia antes da conta, ela lê **47 de 51** e
**56 de 57**, ou seja vira teto por construção, porque no Android a conta só
nasce depois do carro. **A métrica perdeu o sentido, não a janela.**

## A definição nova

> **Ativação da coorte** = das pessoas que criaram conta na semana, quantas
> fizeram **ao menos uma ação de valor que não é cadastrar o carro**, dentro da
> janela de 7 dias de cada pessoa.

Numerador e denominador, escritos para não haver dúvida depois:

- **Denominador**: pessoas com evento `cadastro` na semana, pela identidade de
  sempre (`public.identidade(anon_id, user_id)`). É o mesmo de hoje, e não muda.
- **Numerador**: dessas, as que têm ao menos um evento em
  `('perguntou_biela', 'consultou_sintoma', 'registrou_servico',
  'registrou_abastecimento', 'abriu_trilha', 'viu_aula', 'analisou_orcamento',
  'lancou_ganho')` com `criado_em >= cadastrado_em - interval '1 day'` e
  `criado_em < cadastrado_em + interval '8 days'`.

### Por que o carro sai da lista

Porque ele deixou de separar nada. Hoje **263 das 289 contas com estado têm
carro** (`estadoDaBase`, 16/10), ou seja 91 de cada 100: uma métrica que todo
mundo cumpre não mede ativação, mede existir. O carro é o degrau anterior, e
ele já tem leitura própria e boa no funil (`abriu_cadastro_de_carro` para
`cadastrou_carro`, 61 de cada 100).

O que a ativação precisa responder é outra coisa: a pessoa voltou a usar o app
para ALGO, ou ela cadastrou o carro e foi embora. Essa pergunta tem valor e
hoje ninguém a responde.

### Por que a janela começa um dia ANTES da conta

Não é para inflar o número: a diferença é de 2 a 4 pessoas por coorte, medida
nas duas formas abaixo. É para a métrica não quebrar de novo no dia em que a
ordem dos passos mudar. O produto deliberadamente coloca valor antes da conta
no Android, e uma métrica cuja largada é a conta vai mentir sempre que isso
acontecer. A lição está em `skills/besci.md`, 09/10: antes de ler qualquer
métrica de sequência, perguntar se a sequência que ela pressupõe é a que o app
faz hoje.

### Por que `abriu_quiz` e `clicou_atalho` ficam de fora

`abriu_quiz` é abrir, não responder, e a resposta mora em `quiz_respostas`, que
não é o funil. `clicou_atalho` mede a nossa fila de botões do Início, não a
demanda da pessoa (é a mesma razão pela qual as perguntas de atalho do Biela são
contadas separadas no retrato). Entrar com os dois faria o número subir sem a
pessoa ter feito nada por ela.

## O que a definição nova entrega, lado a lado com a atual

Lido em 16/10 às 11h20 UTC:

| coorte | contas | view ATUAL | nova, desde a conta | nova, com 1 dia antes | janela fechada |
|---|---|---|---|---|---|
| 2026-09-21 | 51 | 3 | 23 | 25 | sim |
| 2026-09-28 | 57 | 0 | 26 | 28 | sim |
| 2026-10-05 | 69 | 4 (piso) | 24 (piso) | 28 (piso) | não |
| 2026-10-12 | 64 | 1 (piso) | 24 (piso) | 27 (piso) | não |

**A coorte de 28/09 é a primeira comparável, e isto precisa estar escrito na
view ou ao lado dela.** O `perguntou_biela` só existe desde 28/09 e o
`analisou_orcamento` desde 25/09, então a coorte de 21/09 é subcontada pela
falta de instrumento, não por comportamento. Série honesta começa em 28/09:
**28 de 57, perto de 49 de cada 100.**

O número fica entre os dois absurdos que a métrica antiga produzia (0 de 57 por
um lado, 56 de 57 pelo outro), e é isso que faz dele uma métrica: ele
DISCRIMINA. Metade das contas novas faz algo além do carro na primeira semana,
e metade não.

## O SQL, para a Engenharia aplicar

As colunas antigas não mudam de nome nem de ordem, pela mesma regra aditiva de
23/09: quem já lia continua lendo. O que muda é o VALOR de `ativados_7d`, e
isso é o ponto, então a mudança tem de ser anunciada no diário no dia em que
entrar, senão a série do retrato dá um salto que ninguém explica.

```sql
create or replace view public.ativacao_coortes
  with (security_invoker = on) as
with cadastros as (
  select public.identidade(anon_id, user_id) as pessoa, min(criado_em) as cadastrado_em
  from public.funil_eventos
  where evento = 'cadastro' and public.identidade(anon_id, user_id) is not null
  group by 1
)
select
  date_trunc('week', c.cadastrado_em at time zone 'America/Sao_Paulo')::date as coorte,
  count(*) as cadastrados,
  count(*) filter (where exists (
    select 1 from public.funil_eventos e
    where e.evento in (
            'perguntou_biela', 'consultou_sintoma', 'registrou_servico',
            'registrou_abastecimento', 'abriu_trilha', 'viu_aula',
            'analisou_orcamento', 'lancou_ganho')
      and public.identidade(e.anon_id, e.user_id) = c.pessoa
      and e.criado_em >= c.cadastrado_em - interval '1 day'
      and e.criado_em <  c.cadastrado_em + interval '8 days'
  )) as ativados_7d,
  (date_trunc('week', c.cadastrado_em at time zone 'America/Sao_Paulo')::date + 7)
    <= (now() at time zone 'America/Sao_Paulo')::date as semana_fechada,
  max(c.cadastrado_em) + interval '8 days' <= now() as janela_fechada
from cadastros c
group by 1
order by 1 desc;
```

A regra de 06/10 das DIRETRIZES continua respeitada: `janela_fechada` se prova
pelo ÚLTIMO membro da coorte (`max(cadastrado_em) + 8 dias <= now()`), não pela
data de início dela.

## O que esta definição NÃO alcança, dito antes de alguém perguntar

- **Ela não mede qualidade do uso.** Uma consulta de sintoma e trinta aulas
  contam igual. É de propósito: ativação é o degrau de "voltou para algo", e
  intensidade é outra pergunta.
- **Ela depende de evento, e evento chega com build.** `perguntou_biela` nasceu
  em 28/09; qualquer ação de valor nova precisa entrar nesta lista no dia em
  que o evento nascer, ou a ativação cai sem motivo. Vale escrever isso no
  comentário da view.
- **Ela não separa plataforma**, e a base é 452 Android contra 6 iPhone e 20 web
  (retrato de 16/10). Quando a separação importar, ela existe no dado
  (`plataforma`), e esta é a terceira rodada em que a mesma ressalva aparece.
