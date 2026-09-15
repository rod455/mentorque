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
| `utm_content` | de qual peça, quando houver mais de uma | `stories`, `reels`, `post-freio`, e nos guias: `barulho`, `nao-pega`, `injecao`, `gasolina` |

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

**Google Ads, campanha de busca** (o link que faltava nesta lista, e foi por
isso que ninguém viu que ele tinha ficado no `/app`):

```
https://www.mentorque.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=lancamento
```

As três etiquetas são exatamente as que já estão gravadas nos eventos desde
04/09. Não trocar nenhuma, senão a série parte em duas e a comparação com as
semanas anteriores morre.

**Onde colar no Google Ads, e isto evita o erro se repetir.** Em vez de
pendurar as etiquetas na URL final de cada anúncio, use o campo
**"Sufixo do URL final"** no nível da campanha:

```
URL final:            https://www.mentorque.com.br/
Sufixo do URL final:  utm_source=google&utm_medium=cpc&utm_campaign=lancamento
```

Assim a etiqueta acompanha qualquer troca de página no futuro, e a URL final
fica sendo só o destino. O `gclid` continua entrando sozinho pela marcação
automática do Google; é ele que permite devolver a conversão quando a venda
acontecer, então não desligar.

**Sempre com `www`.** O domínio sem `www` responde com um desvio, e desvio
entre origens já matou chamada nossa antes (a Biela, em 02/09).

**Por sintoma, se um dia separar os grupos de anúncio.** Os quatro guias
respondem a busca e têm os dois botões de loja, o que a home também tem. Não
foi medido ainda contra a home, então é teste, não recomendação:

```
https://www.mentorque.com.br/barulho-no-carro?utm_source=google&utm_medium=cpc&utm_campaign=lancamento&utm_content=barulho
https://www.mentorque.com.br/carro-nao-pega?utm_source=google&utm_medium=cpc&utm_campaign=lancamento&utm_content=nao-pega
https://www.mentorque.com.br/luz-da-injecao-acesa?utm_source=google&utm_medium=cpc&utm_campaign=lancamento&utm_content=injecao
https://www.mentorque.com.br/carro-gastando-muita-gasolina?utm_source=google&utm_medium=cpc&utm_campaign=lancamento&utm_content=gasolina
```

## O site não leva mais ao /app (12/09/2026)

Decisão do dono: "quero que exista o /app mas só consiga acessar se digitar
completamente. Tire todas as rotas que levam até lá, mas continua existindo a
rota." O link "use pelo navegador" saiu da home, e nenhuma página do site
aponta para o `/app`; a rota continua existindo, sem porteira, para quem
digita o endereço (e para os atalhos de venda, como `/ALE100`, e o botão do
e-mail de lançamento, que o dono manda na conversa). Conferido por `npm run
conferir:caminho`. Por algumas horas do mesmo dia houve uma porteira que
fechava o `/app` para quem não tinha conta; saiu por esta decisão.
Consequência para a medição: `comecou_onboarding` na web deve cair a quase
zero, e "quanto o anúncio trouxe" passa a ser lido na loja, onde a etiqueta
não atravessa (seção abaixo).

## Os e-mails da jornada (12/09/2026)

Todo link da jornada de recorrência (`docs/jornada.md`) leva
`utm_source=email&utm_medium=jornada&utm_campaign=jornada&utm_content=<chave>`,
com a chave do e-mail (`d2`, `vencida-oil`, `sumiu-14`). É a única exceção à
regra abaixo de apontar para a home: quem recebe já tem conta, e o link é
direto, como o do e-mail de lançamento.

## Para onde os links apontam, e por que NÃO é o /app

~~Todos apontam para a home~~, e isso é decisão medida, não gosto.

**CORRIGIDO EM 14/09/2026: o anúncio pago NUNCA voltou para a home.** A
decisão abaixo foi escrita em 03/09 e ficou só aqui; o console do Google Ads
continuou com a URL final no `/app`. A prova está no banco, nos últimos 7
dias: dos 144 `comecou_onboarding` da web, **138 carregam
`google / cpc / lancamento`**, e o site não tem nenhum link para o `/app`
(`conferir:caminho`), então eles só podem ter chegado lá pelo próprio
anúncio. O desfecho desses 138: 31 terminaram o onboarding, 8 cadastraram
carro e 7 criaram conta. Cinco por cento.

Isto também explica por que `comecou_onboarding` na web NÃO caiu depois de
12/09, quando os links do site saíram: tirar o link de dentro de casa não
muda para onde o anúncio aponta. Eram 20 por dia antes e continuaram 20 por
dia depois.

A lição, e ela vale para toda decisão de campanha: **decisão que mora num
console de terceiro não está feita quando é escrita aqui.** Ou ela vira
linha em `docs/agentes/acoes-do-dono.md`, com a idade contando, ou ela
envelhece calada enquanto o dinheiro continua indo para o lugar errado.

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
