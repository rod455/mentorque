# Manuais a subir: a lista de compras

Levantado em 04/09/2026, respondendo à pergunta "quais os principais carros das
frotas de anos anteriores que precisamos subir?".

A resposta curta é que **a pergunta certa não é o ano, é o modelo**. Explicação
abaixo, porque isso muda o que vale a pena caçar.

## O que a busca faz de verdade com marca, modelo e ano

A função `match_manual_chunks` no Supabase (chamada por `lib/rag.ts`):

```sql
where (f_make  is null or normaliza(c.make)  = normaliza(f_make))
  and (f_model is null or c.model is null or normaliza(c.model) = normaliza(f_model))
order by (case when f_year is null or c.year is null then 0
               else abs(c.year - f_year) end),
         c.embedding <=> query_embedding
```

Marca e modelo são **filtro duro**. Ano é só **critério de ordenação**. E hoje
nenhum dos 28.426 trechos tem marca ou modelo nulo (1.891 estão sem ano).

Duas consequências que valem mais que a lista inteira:

1. **Modelo que não temos devolve zero.** Não existe "pegar um parecido". Um Gol
   2016 não cai no manual do Polo: ele cai em nada, e a Biela responde de
   cabeça, sem o manual, sem avisar ninguém.
2. **Modelo que temos devolve QUALQUER ano.** Um Polo 2016 (geração anterior,
   outro carro) recebe o manual do Polo 2024 como se fosse dele. Não existe
   limite de distância de ano. Isso é uma decisão em aberto, anotada no fim.

Ou seja: subir o manual 2018 de um modelo que já temos em 2024 melhora pouco.
Subir o primeiro manual de um modelo que não temos muda de zero para tudo.

## Onde estamos

85 manuais, 28.426 trechos, **12 marcas e 72 modelos**. O catálogo do "Adicionar
carro" oferece **24 marcas e 234 modelos**. Sobram 137 modelos cadastráveis sem
uma linha de manual.

## Fonte 1: os carros dos nossos usuários

Os nove veículos cadastrados hoje, com quantos trechos de manual cada um
encontra:

| Carro | Trechos | Manual que ele acha |
| --- | --- | --- |
| Ford Ka 2025 | **0** | nenhum (só temos Ranger na Ford) |
| Mercedes-Benz A200 2022 | **0** | nenhum (marca inteira sem manual) |
| Suzuki Vitara 2015 | **0** | nenhum (marca inteira sem manual) |
| Volkswagen Gol 2016 | **0** | nenhum (Gol não existe na base) |
| Nissan Grand Livina 2011 | 239 | Grand Livina, sem ano |
| Fiat Fastback 2025 | 318 | Fastback 2024 |
| Volkswagen Polo 2023 | 321 | Polo 2024 |
| Volkswagen Polo 2026 (dois) | 321 | Polo 2024 |

**Quatro dos nove não têm nada.** E repare que o mais velho de todos, o Grand
Livina 2011, é um dos que tem manual: idade não foi o que decidiu.

O Ka 2025 é o carro do assinante pagante que relatou o app fechando. Ele paga e
a Biela responde sobre o carro dele sem manual nenhum.

## Fonte 2: a frota brasileira

Os dez carros mais comuns nas ruas do Brasil (anuário Sincopeças, frota
circulante) e o que temos de cada um:

| # | Carro | Temos manual? |
| --- | --- | --- |
| 1 | Volkswagen Gol | **não** |
| 2 | Fiat Uno | **não** |
| 3 | Fiat Palio | **não** |
| 4 | Fiat Strada | sim (2022) |
| 5 | Chevrolet Onix | sim (sem ano) |
| 6 | Ford Fiesta | **não** |
| 7 | Chevrolet Celta | **não** |
| 8 | Volkswagen Fox | **não** |
| 9 | Hyundai HB20 | sim (2023) |
| 10 | Ford Ka | **não** |

**Sete dos dez carros mais comuns do Brasil não têm manual aqui.** Uno passa de
1,9 milhão de unidades em circulação e Palio de 1,7 milhão.

O ranking de usados mais vendidos (Fenauto, julho de 2026) conta a mesma
história, e ele importa mais que o de zero km, porque é quem acabou de comprar
carro e vai procurar app de manutenção:

| Posição | Carro | Transferências em julho | Temos? |
| --- | --- | --- | --- |
| 1 | Volkswagen Gol | 70.874 | **não** |
| 2 | Chevrolet Onix | 43.180 | sim |
| 3 | Hyundai HB20 | 42.312 | sim |
| 4 | Fiat Palio | 36.747 | **não** |
| 5 | Fiat Uno | 36.575 | **não** |
| leves | Fiat Strada | 43.193 | sim |
| leves | Volkswagen Saveiro | 25.280 | sim |

## A lista de compras, na ordem

Cada item é um modelo que hoje devolve **zero**. O ano entre parênteses é o que
cobre mais gente, não o único que serve.

**Primeiro time, para ontem** (os três primeiros somam mais de 144 mil
transferências em um mês):

1. **Volkswagen Gol** (G5/G6/G7, 2008 a 2023). O carro mais comum do Brasil e o
   usado mais vendido, com folga. Também é o carro de um usuário nosso.
2. **Fiat Uno** (2010 a 2021, a geração nova). Quase 2 milhões nas ruas.
3. **Fiat Palio** (2004 a 2017, incluindo Weekend e Siena, que compartilham
   quase tudo).
4. **Ford Ka** (2014 a 2021, a geração do Ka+). É o carro do nosso assinante
   pagante.
5. **Chevrolet Celta** (2006 a 2015) e **Corsa/Classic** (2002 a 2016). O
   Classic saiu de linha em 2016 e ainda é frota de aplicativo.
6. **Ford Fiesta** (2011 a 2019, o Fiesta hatch e sedan).
7. **Volkswagen Fox** (2010 a 2021, junto com CrossFox e SpaceFox).

**Segundo time, alto volume e nenhum manual:**

8. **Chevrolet Cruze, Prisma, Cobalt, Spin, Montana** (só Spin e Montana são
   recentes; Prisma e Cobalt são frota pura).
9. **Peugeot 208, 2008, 206, 207** e **Citroën C3**. Duas marcas inteiras sem um
   único manual, e as duas vendem bem no usado.
10. **Ford EcoSport** (2013 a 2021). SUV compacto mais comum da década passada.
11. **Hyundai Tucson, ix35, i30**.
12. **Toyota Etios Sedan, Yaris Sedan, RAV4, SW4**.
13. **Renault Oroch, Stepway, Clio**.
14. **Mitsubishi, Kia, Caoa Chery (fora o Tiggo 7), GWM, Suzuki, Mercedes-Benz,
    BMW, Audi, Volvo, Land Rover, Ram**: marcas inteiras sem nenhum manual.
    Suzuki e Mercedes-Benz já têm usuário nosso esperando.

**O que NÃO vale a pena caçar agora**: mais um ano de um modelo que já temos.
Um Argo 2020 ao lado do Argo 2018 e 2025 muda pouco, porque a busca já entrega
o mais próximo. A exceção é quando os anos que temos são de outra geração, e aí
o caso mais claro é o Polo: temos só o 2024, e o Polo de 2002 a 2015 é outro
carro inteiro.

## Como subir, quando os PDFs chegarem

Nomeie cada arquivo como `Marca_Modelo_Ano.pdf`, com a grafia **exata** do
catálogo (`lib/app/conteudo/veiculos.ts`), porque a busca compara texto:

```
Volkswagen_Gol_2016.pdf
Fiat_Uno_2015.pdf
Chevrolet_Celta_2010.pdf
Ford_Ka_2019.pdf
```

Modelo com espaço no nome aceita underscore duplo: `Fiat_Palio__Weekend_2012.pdf`.

```
node --env-file=.env.local scripts/ingest-folder.mjs --dry ./manuais   # confere sem gastar
node --env-file=.env.local scripts/ingest-folder.mjs ./manuais
```

Subir de novo o mesmo modelo e ano substitui os trechos, não duplica. Anos
diferentes do mesmo modelo convivem.

## O que ficou aberto (decisão do dono)

**A busca entrega manual de outra geração sem avisar.** Hoje, quem tem um Polo
2008 recebe trecho do manual do Polo 2024 com a mesma confiança de quem tem o
2024. O conserto seria um limite de distância de ano (por exemplo, ignorar
manual com mais de 5 anos de diferença), e ele tem um custo: em vez de resposta
possivelmente errada, a pessoa passa a receber resposta sem manual nenhum.

Não é uma escolha óbvia e não foi feita. Vale decidir junto com a lista de
compras acima, porque quanto mais gerações antigas subirem, menor o problema.

## Como refazer estas contas

Os números de manual saem de duas consultas no Supabase (projeto Mentorque):

```sql
-- cobertura por modelo
select make, model, min(year_from) de, max(year_to) ate, count(*) manuais
from public.manuals group by 1,2 order by 1,2;

-- o que os nossos usuários têm
select v->>'make' marca, v->>'model' modelo, (v->>'year')::int ano
from public.user_state us,
     jsonb_array_elements(coalesce(us.data->'vehicles','[]'::jsonb)) v
where v->>'make' is not null;
```

A parte do catálogo (quais modelos são cadastráveis) é conferida sozinha por
`npm run conferir:frota`, que reprova se um carro das listas de frota sair do
`veiculos.ts`.
