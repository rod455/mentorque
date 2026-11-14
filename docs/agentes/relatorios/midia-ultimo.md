Relatório de mídia gerado em 2026-11-14

# Mídia da semana

Janela principal: 7 a 13 de novembro, sete dias cheios, comparada com 31 de
outubro a 6 de novembro. As duas janelas têm zero gasto no Google, então a
comparação é do Meta contra ele mesmo. Números lidos hoje, 14/11, entre 14h e
14h30 de Brasília.

**O relatório da semana passada chegou, e foi eu quem disparou.** Execução 9663,
07/11 às 9h03, com o PDF anexado, para o Rodrigo e para o Luiz. E esta semana
houve silêncio de novo: a rodada disparou na quinta 12/11, a sessão foi
reiniciada, e nos dois dias de envio automático a main tinha o relatório de
07/11, que pela regra do fluxo é velho. Este e-mail também saiu de um disparo à
mão. Terceira semana seguida com desvio de dia, segunda seguida sem envio
automático: isso virou linha da fila, porque já não é acidente.

## A manchete: a semana piorou em todas as réguas, e o motivo é um só degrau

| Medida | 7 a 13/11 | 31/10 a 6/11 |
|---|---|---|
| Gasto no Google | R$ 0,00 | R$ 0,00 |
| Gasto no Meta | R$ 205,17 | R$ 223,54 |
| Custo por mil impressões, Meta | R$ 5,32 | R$ 4,28 |
| Custo por clique, Meta | R$ 0,31 | R$ 0,28 |
| **Contas novas de fora** | **87** | **134** |
| **Custo por conta** | **R$ 2,36** | **R$ 1,67** |

Gastando 8% menos, a semana trouxe 35% menos contas, e o custo por conta subiu
41%. A corrente que liga uma coisa à outra está medida elo por elo:

- o preço da impressão subiu 24%;
- com quase o mesmo dinheiro, as impressões caíram 26%;
- as instalações caíram 29%;
- as contas caíram 35%.

Um elo só, propagando. Não é cadastro quebrado: eu conferi dia a dia e a queda é
ladeira, não degrau, sem nenhum dia em que o número cai e não volta.

## A mesma semana dentro da série de oito: é um passo atrás, não um regime novo

Esta é a leitura que muda o que fazer. O preço da impressão vinha caindo havia
sete semanas:

| Coleta | Custo por mil impressões | Instalação por clique |
|---|---|---|
| 24/09 | R$ 11,06 | 27,2% |
| 01/10 | R$ 10,93 | 28,5% |
| 08/10 | R$ 10,06 | 31,1% |
| 15/10 | R$ 7,16 | 39,5% |
| 22/10 | R$ 4,75 | 55,1% |
| 30/10 | R$ 4,57 | 63,2% |
| 07/11 | R$ 4,28 | 64,4% |
| **14/11** | **R$ 5,32** | **55,5%** |

O nível de hoje é o de 22 de outubro, três semanas atrás, e segue menos da metade
do de setembro. **Então a semana ruim é um passo atrás dentro de uma escada que
subiu sete vezes, e não o começo de uma queda.** O meu próprio manual já tinha a
lição na direção contrária, de quando eu publiquei uma vantagem que virou de lado
em uma semana: uma semana é uma leitura, para o bem e para o mal.

## Custo por desfecho medido, por campanha

Segunda semana cheia com a etiqueta de origem: 72 das 76 contas do evento
carregam etiqueta, 95%.

| Origem | Contas etiquetadas | Gasto | Custo por conta medida | Semana anterior |
|---|---|---|---|---|
| Meta, promoção de app | 55 | R$ 205,17 | **R$ 3,73** | R$ 2,26 |
| Google, app por vídeo | 1 | R$ 0,00 | sem leitura | sem leitura |
| Orgânico | 11 | zero | sem custo | sem custo |
| Outras origens | 5 | zero | sem custo | sem custo |

Sessenta e cinco por cento mais caro por conta medida. E as outras duas réguas
concordam, cada uma medindo outra coisa:

| Régua do Meta | 7 a 13/11 | 31/10 a 6/11 |
|---|---|---|
| Custo por instalação atribuída, AppsFlyer | R$ 1,05 | R$ 0,80 |
| Custo por usuário que volta, AppsFlyer | R$ 3,31 | R$ 1,80 |
| Custo por desfecho que a plataforma conta | R$ 0,56 | R$ 0,43 |

As três pioraram, e pioram mais quanto mais perto do desfecho: 30% na
instalação, 65% na conta, 84% no usuário que volta. A taxa de usuário que volta
caiu de 44% para 32%.

Duas notas de régua: a tabela de contas diz 87 e o evento diz 76, ou seja o
evento conta 13% a menos nesta janela, contra 4% na passada, então só a
repartição vem do evento. E o custo por instalação do Meta divide sete datas de
gasto por oito de instalação, viés igual nas duas semanas.

## O vídeo do Google: sete causas eliminadas, e a minha hipótese caiu

Catorze dias sem entregar nada. A coleta passou a escrever isso sozinha, com a
frase "sem atividade na conta nos últimos 7 dias", e eu voltei à API hoje com
mais perguntas, numa leitura temporária criada e arquivada no mesmo dia.

O que está ELIMINADO, com o campo que eliminou:

- **campanha pausada**: não, `status` é `ENABLED`, lido em 06/11 e de novo hoje;
- **orçamento zerado**: não, são R$ 20 por dia, e o histórico da conta tem UMA
  única alteração em dezessete dias (24/10, de R$ 30 para R$ 20);
- **anúncio reprovado**: não, está ativo, revisado e aprovado;
- **inaptidão**: não, `primary_status` é `ELIGIBLE` com a lista de razões vazia,
  nas duas leituras;
- **conta suspensa ou problema de cobrança**: não, o `status` do cliente é
  `ENABLED`;
- **campanha com data de fim vencida**: não, `ELIGIBLE` e `ENDED` são valores
  diferentes do mesmo campo;
- **sinal de conversão morto**: não, a ação de instalação do Play continua
  registrando, 680 nos últimos 30 dias.

**E a hipótese que eu publiquei em 07/11 está refutada.** Eu escrevi que
provavelmente era lance apertado, campanha que não consegue comprar ao preço que
a estratégia aceita. A estratégia é `MAXIMIZE_CONVERSIONS` **sem alvo de custo**,
ou seja, não existe teto para ela recusar. A hipótese era razoável e estava
errada, e quem a derrubou foi um campo que eu podia ter lido na semana passada.

O que sobra sem leitura é o bloco de configuração de app da campanha, que a API
recusa pelos nomes que eu tentei. É a terceira coisa na mesma linha da fila, que
está lá há oito dias.

## Desperdício com nome: sem instrumento esta semana

Duas coisas diferentes, e elas não se confundem:

- **não se aplica**: a única campanha que tem termo de busca é a de busca, e ela
  está pausada desde 13/10;
- **e agora também não dá para medir**: a coleta passou a avisar que o nó de
  termos de busca está DESLIGADO, esperando uma credencial no n8n. Enquanto isso
  valer, eu não tenho a lista de termos nem para conferir o passado.

Registro como fonte indisponível, com a data: 14/11. Virou linha da fila junto
com o resto, porque pelo histórico desta casa esse tipo de nó se religa por um
fluxo novo, sem clique seu.

## A proposta da semana

**Antes de qualquer decisão de orçamento, medir a conversão da página da loja.**

A instalação por clique caiu 8,9 pontos nesta semana, de 64,4% para 55,5%. Sobre
os 656 cliques da janela, isso são 59 instalações que o mesmo dinheiro deixou de
trazer, uns R$ 62 dos R$ 205 que não compraram nada.

Eu não sei se a causa é a loja, e não vou dizer que é. Sei que **a página da
Play é o único degrau entre o meu clique e a minha instalação que ninguém desta
casa mede**, e que o degrau moveu 8,9 pontos. O arquivo que responde já está ao
alcance: a conversão por origem de tráfego, nos relatórios da Play que o coletor
já lê, e que está num pedido da Engenharia para o ASO desde 16/10.

E duas coisas que já estão na sua lista moram exatamente nesse degrau, então elas
voltam aqui com o custo de hoje em vez de voltarem como recomendação repetida:

- a captura com a prova social antiga nas duas lojas, **29 dias** na lista, que
  promete 4,8 e 10.000+ enquanto o app mostra 5,0 e 170+;
- a reordenação das capturas da Play, **13 dias** na lista.

Todo clique pago desta semana, os 656, passou por essa página antes de virar
instalação ou de virar nada.

## O que este relatório não alcança

- **A causa da parada do vídeo.** Sete causas eliminadas, nenhuma encontrada, e o
  campo que falta a API recusa pelos nomes que eu conheço.
- **A lista de termos de busca**, desligada na coleta desde esta semana.
- **Frequência e alcance do Meta**, que separariam "o público saturou" de "o
  leilão ficou caro". A coleta do Meta não traz nenhum dos dois.
- **A conversão da página da loja**, que é a proposta acima.
- **A definição de usuário leal**, que é de console e segue não lida.

## Como esta rodada se mede

Dos doze critérios, onze cumpridos e um sem instrumento, o do desperdício com
nome, pelos dois motivos acima. Nada foi escrito em conta de anúncio: as
leituras de hoje são consultas, e a leitura temporária que as fez foi arquivada.

Uma coisa que eu devo dizer de mim mesmo: a hipótese do lance, que eu publiquei
na semana passada como a mais provável, caiu com uma consulta de quinze segundos
que eu não fiz na semana passada. Eu tinha a credencial, tinha o caminho, e paguei
uma semana por não ter perguntado tudo de uma vez.
