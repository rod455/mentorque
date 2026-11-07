Relatório de mídia gerado em 2026-11-07

# Mídia da semana

Janela principal: 30 de outubro a 5 de novembro, sete dias cheios, comparada com
23 a 29 de outubro. Os números da janela foram lidos em 06/11 entre 7h e 7h30 de
Brasília, e a parada do Google foi reconferida hoje, 07/11, na coleta das 5h30.

**O relatório da semana passada chegou.** Confirmado no registro do envio
(execução 9310, 30/10 às 10h05 de Brasília): corpo curto e o PDF anexado, para o
Rodrigo e para o Luiz. Quarta semana seguida.

**Este chegou no sábado, e a culpa é da minha rodada.** A tarefa disparou na
quinta 05/11 e a sessão foi reiniciada duas vezes no meio do trabalho, então o
relatório só ficou pronto hoje. O envio automático só tenta quinta e sexta, de
hora em hora, e nos dois dias ele encontrou na main o relatório de 30/10, que já
era velho: pela regra do fluxo, isso é silêncio, e foi silêncio. Este e-mail saiu
porque eu disparei o fluxo à mão, com o relatório de hoje. O atraso está dito
aqui porque ele é o segundo seguido e porque silêncio é pior que aviso.

## A manchete: o vídeo do Google parou sozinho em 31/10, e a semana sem ele foi a mais barata da série

A campanha de app do Google entregou pela última vez no dia 30/10. São oito dias
com zero impressão, zero clique e zero real gasto, de 31/10 até hoje: na coleta
de hoje a campanha nem aparece mais na lista de campanhas da janela, e o custo
dos últimos oito dias é zero. Não foi a janela que escondeu: a coleta traz o dia
a dia de cada campanha, com zero escrito em cada dia sem entrega, e o alarme de
campanha parada disparou.

| Medida | 30/10 a 05/11 | 23 a 29/10 |
|---|---|---|
| Gasto no Google | R$ 1,92 | R$ 163,39 |
| Gasto no Meta | R$ 221,12 | R$ 197,16 |
| Gasto total | R$ 223,04 | R$ 360,55 |
| Custo por clique, Meta | R$ 0,28 | R$ 0,28 |
| **Contas novas de fora** | **132** | **136** |
| **Custo por conta** | **R$ 1,69** | **R$ 2,65** |

Trinta e oito por cento menos dinheiro, três por cento menos contas. O custo por
conta caiu 36% e é o melhor da série. Os R$ 1,92 do Google são todos do dia 30.

## Por que ela parou: eu perguntei à fonte, e a fonte respondeu

Isto é o que mudou nesta rodada em relação a todas as anteriores. Em vez de
mandar você abrir o painel, eu fiz ao Google Ads as três perguntas que a nossa
coleta nunca fez, por uma leitura temporária e somente de leitura, em 06/11 às
7h15 de Brasília:

- **a campanha está apta a entregar?** O campo que o próprio Google usa para
  isso responde `ELIGIBLE`, e a lista de razões de bloqueio voltou VAZIA;
- **qual o orçamento?** R$ 20 por dia;
- **o que mudou na conta?** Uma única alteração em dezessete dias: no dia 24/10,
  ao meio-dia, o orçamento desta campanha caiu de R$ 30 para R$ 20 por dia, pelo
  seu login no painel. Nada no dia 30, nada no 31, nenhuma pausa, nenhuma
  mudança de lance, público ou região.

O anúncio também está certo: um anúncio ativo, revisado e APROVADO, o que
descarta a causa de 24/09, quando os anúncios foram reprovados.

**Então nenhuma mão parou essa campanha, e o Google diz que não há nada de
errado com ela.** A redução de 24/10 não explica o dia 31: a campanha seguiu
gastando uns R$ 22 por dia nos seis dias seguintes à redução, que é o
comportamento normal de um orçamento de R$ 20.

O que sobra é hipótese, e vai escrita como hipótese: campanha de app que não
consegue comprar instalação ao preço que a estratégia de lance aceita
simplesmente para de comprar, sem ficar inapta. O teste que separa isso de
qualquer outra coisa é a estratégia de lance e o alvo de custo por instalação.
Eu tentei ler esses dois campos hoje e a consulta foi recusada por nome de campo
inválido nesta versão da API; é uma linha para a fila, não um clique seu.

## Custo por desfecho medido, por campanha: a primeira semana cheia

A etiqueta de origem na conta nova, que ficou completa em 29/10, teve a sua
primeira janela de sete dias: **123 das 127 contas da janela carregam etiqueta,
97%**.

| Origem | Contas etiquetadas | Gasto na janela | Custo por conta medida |
|---|---|---|---|
| Meta, promoção de app | 89 | R$ 221,12 | **R$ 2,48** |
| Google, app por vídeo | 6 | R$ 1,92 | não tem leitura |
| Orgânico | 23 | zero | sem custo |
| Outras origens | 5 | zero | sem custo |

R$ 2,48 é o primeiro custo por conta por campanha que este relatório publica com
uma semana inteira e o instrumento completo. A linha do Google não tem leitura de
propósito: as seis contas são retorno de cliques comprados ANTES do dia 31, e
dividir R$ 1,92 por elas daria um número bonito que não mede nada.

Duas notas de régua: as contas da tabela são 132 e os eventos são 127, ou seja o
evento conta 4% a menos, e é por isso que o total vem da tabela e só a REPARTIÇÃO
vem do evento. E a etiqueta vem da mesma atribuição da AppsFlyer que mede as
instalações, então as duas concordarem vale menos que concordarem com os
contadores das plataformas.

## O que a semana passada deixou aberto, respondido pelos fatos

Na sua lista desde 23/10 estava: mover um pedaço do orçamento do vídeo para o
Meta, e na semana passada eu pedi para decidir em 06/11, quando a régua de
conta completasse sete dias. O que aconteceu foi melhor e pior que isso: **o
vídeo saiu inteiro, sozinho, e a régua nova nunca teve o que medir do lado
dele.** Eu pedi uma semana de espera para um instrumento que morreu dois dias
depois de ficar pronto, do lado que importava.

O que a semana mediu, então, é o experimento que ninguém desenhou: o vídeo
deixou de gastar R$ 161,47 e o total de contas caiu de 136 para 132, enquanto o
Meta subiu R$ 23,96 por conta própria.

- **ponta alta**: se os R$ 23,96 extras do Meta não trouxeram conta nenhuma, o
  vídeo estava comprando 4 contas por semana a R$ 40 cada;
- **ponta baixa**: se esses R$ 23,96 compraram ao preço medido do Meta, umas 10
  contas, então o vídeo trazia umas 14 por semana, a R$ 11,80 cada.

Contra R$ 2,48 do Meta. Qualquer uma das duas pontas diz a mesma coisa, e é por
isso que a faixa serve mesmo sendo larga. Uma semana só, e com duas coisas
mudando ao mesmo tempo: isso está dito porque é o limite da conclusão, não uma
nota de pé.

## A proposta da semana

**Não religar o vídeo do Google até saber por que ele parou.**

O número do lado: religar sem saber compra de volta um canal que custava entre
R$ 11,80 e R$ 40 por conta, contra R$ 2,48 que o Meta entrega hoje. E a semana
sem ele foi a mais barata da série por conta, não só no total.

O que falta para a decisão ser definitiva, e não depende de você: ler a
estratégia de lance e o alvo de custo da campanha. Virou linha da fila, com a
consulta que já funcionou escrita lá, para a próxima rodada abrir com isso
respondido.

## O preço de subir verba, medido pela primeira vez

Desde setembro eu escrevo, em toda proposta de mover dinheiro, que eficiência
não sobrevive inteira a um aumento de verba. Esta semana isso virou número: o
Meta gastou 12% mais e ficou 3 a 4% mais caro em todas as réguas.

| Régua do Meta | 30/10 a 05/11 | 23 a 29/10 |
|---|---|---|
| Custo por instalação atribuída | R$ 0,82 | R$ 0,80 |
| Custo por usuário que volta | R$ 1,86 | R$ 1,79 |
| Custo por desfecho que a plataforma conta | R$ 0,46 | R$ 0,44 |

A instalação atribuída e o usuário que volta vêm da janela de oito datas da
AppsFlyer contra sete de gasto, viés igual nas duas semanas. Doze por cento de
verba a mais por 3 a 4% de preço a mais é um preço barato, e agora ele tem
tamanho em vez de ser só uma ressalva.

No Android, 15 das 304 instalações da janela chegaram sem anúncio, 4,9%, contra
5,0% na semana anterior. As instalações caíram 16% no total, o que é o vídeo
saindo: o Google foi de 97 para 20 e o Meta de 245 para 269.

## Desperdício com nome: não se aplica, pela terceira semana

A única campanha com relatório de termo de busca é a de busca, pausada desde
13/10. Nesta janela o Google gastou R$ 1,92 em um dia, e a quebra por rede desse
dia é R$ 1,76 no YouTube e R$ 0,16 no Display, com zero em busca e em parceiros
de busca. Não há termo para agrupar, e a ferramenta não está quebrada.

## O que este relatório não alcança

- **A causa da parada do vídeo**, que está em hipótese com o teste escrito.
- **Custo por conta do vídeo**, que nunca teve semana cheia com etiqueta.
- **Custo por instalação do Meta com janela exata**: sete datas de gasto contra
  oito de instalação. Continua na fila do Analista desde 23/10, em prioridade
  baixa.
- **A definição de usuário leal**, que é de console e segue não lida.
- **Instalação no iOS**, 2 na janela.

## Como esta rodada se mede

Dos doze critérios, onze cumpridos e um que não se aplica, o do desperdício com
nome. O critério da conta fechada por campanha saiu de parcial para cumprido no
lado do Meta, com semana cheia e 97% de cobertura, e segue sem leitura no lado
do Google por falta de gasto.

E a coisa que esta rodada fez diferente de todas as anteriores: em vez de pedir
um clique seu para saber por que a campanha parou, eu perguntei ao Google. A
credencial estava aqui desde agosto e a consulta era uma lista de perguntas que
alguém escreveu uma vez. Três perguntas novas responderam em quinze minutos o
que seria uma semana de espera na sua lista.
