# Mídia paga: o plano, e onde ele está

Escrita em 03/09/2026 como proposta, e virou plano em execução no mesmo dia,
quando o dono mandou fazer tudo. O estado de cada item está marcado.

**A recomendação continua sendo não criar o
agente que DECIDE ainda**, e o motivo não é técnico: falta o sinal contra o
qual ele otimizaria. Os itens 1 a 3 existem para construir esse sinal.

| item | estado |
|---|---|
| 1. destino mensurável do clique | FEITO do nosso lado, falta 1 clique seu no Google Ads |
| 2. conversão que signifique dinheiro | metade feita: o `gclid` já viaja e fica guardado. Falta a devolução ao Google |
| 3. atribuição de instalação | não começado, depende de console |
| 4. agente que decide | não, e de propósito |
| vigia de leitura | FEITO, falta 1 clique seu no n8n |

## O que a campanha fez até agora

Campanha **"Mentorque Lançamento"**, canal **SEARCH**, ativa. Números da conta
6724308347, medidos em 03/09 pelo braço do Analista:

| | |
|---|---|
| custo | R$ 44,16 |
| impressões | 646 |
| cliques | 23 |
| CTR | 3,6% |
| CPC | R$ 1,92 |
| "conversões" | 3 |

Por dia: 01/09 só 15 impressões e nada mais; 02/09 foi o dia cheio (468
impressões, 16 cliques, R$ 30,84); 03/09 seguia rodando.

**O CTR e o CPC são saudáveis.** Não é a compra de mídia que está ruim.

## O problema, e ele é de medição, não de campanha

**Nenhum dos 23 cliques chegou a algo que a gente consiga ver.**

```sql
select * from cadastros_por_campanha;
-- (direto) | (sem campanha) | 2
```

Zero cadastros com campanha. Zero eventos de funil com UTM. E como o canal é
SEARCH, o clique cai numa página NOSSA: aqui zero não é limitação de
plataforma, é o rastro terminando.

E as "3 conversões" não são o que o nome sugere. A conversão configurada no
Google Ads é a do `marcarCliqueDownload` em `components/lp/Rastreio.tsx`:
**um toque no selo da loja**. Não é instalação, não é cadastro, não é venda. É
a pessoa saindo do nosso site em direção à loja, e é ali que o rastro morre,
porque a atribuição de instalação (AppsFlyer) nunca foi fechada.

Traduzindo o que a campanha comprou: R$ 44,16 por 3 pessoas que tocaram num
botão de download. **R$ 14,72 por toque**, sem saber quantas instalaram,
quantas criaram conta e quantas pagaram. Com assinatura de R$ 29,90 por mês, e
com a primeira cobrança adiada por cupom, esse número não fecha em lugar
nenhum.

## Por que um agente de otimização AGORA piora as coisas

Otimizar é escolher para onde empurrar. O único sinal disponível hoje é
"tocou no botão de download", e o lance automático do Google **já** otimiza
para ele. Um agente em cima disso não descobriria nada novo: ele ficaria bom em
comprar toques em botão, mais rápido e com mais convicção.

É o mesmo erro de unidade que já apareceu duas vezes neste projeto, em outras
roupas: no funil (dividir ato por sessão) e no painel (ler MRR como caixa). Um
número que não mede o que importa não fica melhor sendo otimizado; fica pior,
porque agora tem alguém trabalhando para maximizá-lo.

## A ordem certa

### 1. Dar um destino mensurável ao clique (dá para fazer hoje, custo zero)

A campanha é de SEARCH, então nós escolhemos a página de destino. Hoje ela cai
numa página cujo apelo principal é sair para a loja. Apontar para
`/app?utm_source=google&utm_campaign=lancamento` põe a pessoa dentro do produto
com a etiqueta colada, e daí para frente a gente mede tudo o que já existe:
`abriu_app`, `cadastro`, `viu_paywall`, `iniciou_checkout`, `assinou`.

O custo de manter como está é continuar pagando por um trecho de caminho que
termina numa parede sem janela.

### 2. Trocar a conversão do Google Ads por uma que signifique dinheiro

Enquanto a conversão for "tocou no botão", o lance automático vai perseguir
isso. O alvo certo é `assinou`, e ele nasce no SERVIDOR (é o webhook do Stripe
que confirma), então o caminho é importação de conversão offline ou envio
server-side com o id de clique. É trabalho de verdade, e é o que destrava tudo
o mais.

### 3. Fechar a atribuição de instalação, se a loja continuar sendo destino

O SDK do AppsFlyer já está no app desde a 1.4. O elo que falta é o
install-referrer ligado à campanha. Sem ele, todo clique que vai para a loja é
dinheiro gasto no escuro.

### 4. Só então, o agente que decide

## O que dá para criar JÁ, e que eu recomendo

**Um vigia de campanha, de leitura, dentro do braço que já existe.** Ele não
mexe em nada: lê, compara e grita. O que ele reportaria por dia:

- custo, cliques, CTR e CPC por campanha (já coletado desde 03/09);
- **o custo por desfecho MEDIDO**, que é a conta que ninguém está fazendo:
  custo dividido por cadastros com aquela campanha, não por conversão do
  Google;
- **os termos de busca** (`search_term_view` no GAQL). Numa campanha de SEARCH
  com 646 impressões já dá para ver por qual palavra a pessoa chegou, e é
  onde o desperdício aparece primeiro;
- **o alarme que importa**: custo subindo com desfecho medido em zero. É
  exatamente o estado de hoje, e ninguém foi avisado. O dono perguntou.

Isso cabe no manual do Analista e não precisa de alçada nova.

## E quando o agente de decisão existir, qual a alçada dele

Sugestão de linha, no mesmo espírito da que foi dada ao QA em 03/09:

- **PODE sozinho: palavra-chave negativa.** Ela só REDUZ gasto, nunca aumenta.
  Um termo de busca claramente fora do assunto pode ser cortado sem consultar
  ninguém, com o corte registrado no diário.
- **NÃO pode sozinho: orçamento, lance, pausar ou criar campanha, mudar
  público.** Tudo isso mexe em quanto sai da conta, e gasto novo é decisão do
  dono. Vira recomendação com o número do lado.

A assimetria é a mesma de sempre: o que só pode diminuir o dano é autonomia
barata; o que pode aumentar a conta é do dono.

---

# O que já está de pé (03/09/2026)

## Item 1: a etiqueta agora gruda em qualquer página

O vazamento era este: a captura de UTM morava dentro do componente da landing
de tráfego pago, então **só funcionava em `/landing`**. Clique pago que caísse
na home, numa página de conteúdo ou direto em `/app` perdia a campanha na
chegada, em silêncio. Foi por isso que 23 cliques não deixaram um único evento
etiquetado.

Agora ela mora em `lib/app/campanha.ts`, montada no layout raiz, e vale em toda
página do site (a do app inclusive). Conferida por `npm run conferir:campanha`,
que protege duas regras:

- chegada COM etiqueta gruda, e o `gclid` vem junto;
- **chegada SEM etiqueta não apaga a que já estava lá.** É a regra que quase
  ninguém lembra e a que mais destrói atribuição: quem clica no anúncio, fecha
  e volta depois digitando o endereço continua sendo daquela campanha. Sem
  isso, toda venda vira "direto" e a campanha nunca tem crédito de nada.

**O que falta, e é seu**: apontar o anúncio para uma página que a gente mede.

```
https://www.mentorque.com.br/app?utm_source=google&utm_medium=cpc&utm_campaign=lancamento
```

No Google Ads, é o campo "URL final" do anúncio. O `gclid` o Google acrescenta
sozinho. A partir daí, cada clique vira `abriu_app` etiquetado, e a corrente
até `assinou` fica visível na `cadastros_por_campanha` e no funil.

## Item 2: o clique do Google viaja até a venda (metade)

O `gclid` sai do aparelho no checkout, é carimbado na metadata da assinatura no
Stripe e cai na coluna `subscriptions.gclid`. Mesmo caminho do cupom.

Com isso, "quais vendas vieram do anúncio" virou uma consulta:

```sql
select cupom, gclid, status, current_period_end from subscriptions
where gclid is not null;
```

**O que falta**: devolver a conversão ao Google. Precisa de duas coisas, e a
primeira é sua:

1. **Criar a ação de conversão no Google Ads**, do tipo importação (offline),
   nome sugerido "Assinatura", moeda BRL, contagem uma por clique. Ela devolve
   um nome de recurso (`customers/6724308347/conversionActions/NNNN`), que é o
   que falta para o braço poder postar.
2. Com esse nome em mãos, eu faço o braço no n8n que lê as assinaturas com
   `gclid` e ainda não enviadas, posta a conversão com o valor em reais e marca
   como enviada.

Aí o lance automático passa a perseguir assinatura em vez de toque em botão, e
é isso que muda o resultado da campanha.

## O vigia: termos de busca, e o desperdício com nome

O braço do Analista ganhou a consulta de `search_term_view`: os 50 termos mais
caros dos últimos 30 dias, com custo, cliques e conversões, e uma lista
separada `termosSemConversao` com o gasto que não virou nada. É de onde sai
toda palavra-chave negativa.

**O que falta, e é um clique seu**: o nó `Google Ads: termos de busca` nasceu
**desligado**, porque o n8n não deixa colar credencial de Google Ads em nó HTTP
pela API (a mesma limitação que já apareceu com o developer-token). No n8n:

1. abrir o workflow "Analista: metricas externas";
2. no nó `Google Ads: termos de busca`, escolher a credencial "Google Ads
   account" no campo de credencial;
3. ligar o nó (tirar o "disabled") e publicar.

Enquanto ele estiver desligado, o braço continua funcionando normalmente e
grava `termosNota` dizendo exatamente isso. O nó de leitura é defensivo de
propósito: nó desligado no n8n deixa a entrada passar direto, e sem o filtro
por `searchTermView` a resposta de custo seria lida como se fosse de termos e
gravaria lixo com cara de dado.

## O que NÃO fiz, e por quê

**O agente que decide.** Enquanto a conversão que o Google enxerga for "tocou
no botão de download", pôr um agente para otimizar é contratar alguém para
maximizar o número errado, com mais velocidade e mais convicção. A ordem
importa: primeiro o sinal, depois quem persegue o sinal.

Quando o item 2 fechar, a alçada sugerida continua a mesma: palavra-chave
negativa ele faz sozinho (só reduz gasto), e orçamento, lance, pausar e criar
campanha continuam sendo do dono.
