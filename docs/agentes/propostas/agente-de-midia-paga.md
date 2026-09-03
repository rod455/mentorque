# PROPOSTA: um agente para otimizar a campanha

Escrita em 03/09/2026, a pedido do dono. **A recomendação é não criar o agente
de otimização ainda**, e o motivo não é técnico: falta o sinal contra o qual
ele otimizaria. O que dá para fazer hoje, e vale, é um vigia de leitura.

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
