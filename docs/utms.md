# As etiquetas de origem (UTM)

Onde colar cada link e como nomear os próximos. Uma página, para ninguém
inventar um nome novo para uma origem que já tem nome.

**Por que a convenção importa mais do que parece.** UTM não valida nada: se um
link disser `instagram`, outro `Instagram` e um terceiro `ig`, o banco vai
guardar os três, obedientemente, como três origens diferentes. Ninguém percebe
até o dia em que a pergunta "quanto o Instagram trouxe?" tem três respostas
parciais e nenhuma certa. Por isso o vocabulário abaixo é fechado.

Nada disso precisa de código. A captura já lê `utm_source`, `utm_medium`,
`utm_campaign`, `utm_content` e `utm_term` em qualquer página do site
(`lib/app/campanha.ts`, montada no layout raiz), e carimba a etiqueta em todo
evento de funil daquele aparelho, até a assinatura.

## O vocabulário

Tudo em minúsculas, sem acento e sem espaço. Sempre.

| campo | o que responde | valores que usamos |
| --- | --- | --- |
| `utm_source` | de onde veio | `instagram`, `youtube`, `google`, `email` |
| `utm_medium` | de que natureza | `social` (orgânico), `cpc` (pago), vazio no e-mail |
| `utm_campaign` | de qual esforço | `bio`, `lancamento`, `lista-espera` |
| `utm_content` | de qual peça, quando houver mais de uma | `stories`, `reels`, `post-freio` |

A distinção que mais vale é `social` contra `cpc`: é ela que separa o que a
gente ganhou do que a gente comprou, e sem isso o CAC vira ficção.

## Os links prontos

**Instagram, link da bio** (o principal, cole no perfil):

```
https://www.mentorque.com.br/?utm_source=instagram&utm_medium=social&utm_campaign=bio
```

Se um dia houver mais de um lugar no Instagram, acrescente `utm_content` para
separá-los sem criar campanha nova:

```
...&utm_campaign=bio&utm_content=stories
...&utm_campaign=bio&utm_content=reels
```

**YouTube, descrição dos vídeos** (mesmo raciocínio, quando quiser medir):

```
https://www.mentorque.com.br/?utm_source=youtube&utm_medium=social&utm_campaign=canal
```

## Para onde os links apontam, e por que NÃO é o /app

Todos apontam para a home, e isso é decisão medida, não gosto.

Em 03/09/2026 o anúncio de busca passou a apontar para `/app` com etiqueta, e o
resultado do primeiro dia foi: **10 aparelhos começaram o onboarding na web e
nenhum terminou**. No app das lojas, no mesmo período, 5 de 7 terminaram. Não é
erro de medição (o evento sai de um portão único, igual nas duas plataformas) e
não é o app quebrando (nenhum erro registrado).

A leitura é que cair direto num carrossel de apresentação, vindo de um anúncio
sobre problema de carro, não dá à pessoa motivo nenhum para continuar. A home
faz o trabalho que falta: diz o que o produto é e oferece os selos das duas
lojas.

A amostra é pequena, dez aparelhos, então isto é direção e não lei. Mas
enquanto o número não mudar, link novo vai para a home.

## O que a etiqueta NÃO atravessa

Quem clica no selo da loja e instala o app **perde a etiqueta**: a loja não
repassa UTM. Essa ponte é outra, e depende dos passos do AppsFlyer que estão em
`docs/atribuicao.md`. Então o Instagram vai medir bem quem usa pelo navegador,
e vai subestimar quem baixa o app.

## Como ler o resultado

```sql
select
  extra->'utm'->>'utm_source'   as origem,
  extra->'utm'->>'utm_medium'   as meio,
  extra->'utm'->>'utm_campaign' as campanha,
  count(distinct anon_id) as aparelhos,
  count(*) filter (where evento = 'cadastro') as contas,
  count(*) filter (where evento = 'assinou')  as assinaturas
from funil_eventos
where criado_em > now() - interval '30 days'
group by 1, 2, 3
order by aparelhos desc;
```

**O caminho é `extra->'utm'->>'utm_source'`, com o `utm` no meio.** Fica escrito
porque eu mesmo errei isso em 03/09: consultei `extra->>'utm_source'`, recebi
nulo em tudo, e conclui que a captura não estava funcionando. Estava. A
consulta é que procurava um nível acima.
