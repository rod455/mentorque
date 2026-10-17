# O que tirar do grátis para vender mais Premium

Pedido do dono em 17/10/2026: "quero uma proposta do que podemos tirar do free
e colocar no premium para garantir mais assinaturas". Escrito pela
Engenharia. Plano e preço são decisão do dono; isto é a proposta, com o número
de pessoas que cada mudança alcança.

Todos os números são de 15/09 a 17/10, lidos em 17/10 por volta das 12h UTC.

## A regra que decide tudo abaixo

Tirar do grátis só vende se a pessoa **chega** no limite. E a maioria não
chega: das pessoas que começam o onboarding, 16% voltam depois do primeiro dia
(diagnóstico de hoje, `por-que-quase-ninguem-assina.md`). Então:

- **Trancar o que a pessoa usa no primeiro dia** derruba a volta, e com ela
  todas as vendas futuras. É o contrário do que se quer.
- **Trancar o que ninguém alcança** não muda nada.
- **O que funciona é o limite no momento de maior vontade**, depois de a
  pessoa já ter visto o valor uma vez.

## O uso de cada coisa, por aparelho

Funil (`funil_eventos`), por aparelho:

| função | aparelhos | por aparelho | voltaram a usar no 2º dia ou depois | limite grátis hoje |
|---|---|---|---|---|
| aulas | 203 | 2,2 | 39 | 16 das 123 aulas trancadas |
| sintomas | 172 | 1,7 | 23 | 2 primeiras causas, 3 itens do checklist |
| Biela | 69 pelo funil (90 pessoas-mês pela tabela, abaixo) | | 11 | 5 perguntas por mês |
| serviço registrado | 36 | 1,4 | 4 | 20 serviços |
| abastecimento | 15 | 1,2 | 7 | sem limite |
| orçamento por foto | 5 | 1,0 | 0 | 2 por mês |

## A proposta, em três grupos

### Tirar já: Biela de 5 para 3 perguntas por mês

É a única mudança com gente de verdade batendo no limite, e a única que não
precisa de versão nova (quem conta é o servidor, `lib/biela/limite.ts`).

Pela tabela `biela_perguntas`, que é a verdade (o funil conta menos, porque o
evento sai uma vez por sessão), entre as contas sem Premium:

| perguntas no mês | pessoas-mês |
|---|---|
| 1 | 51 |
| 2 | 14 |
| 3 | 7 |
| 4 | 6 |
| 5 (bateram no limite) | 12 |

- **Com 5, como é hoje:** 12 pessoas-mês bateram no limite.
- **Com 3:** 25 bateriam (as 7 de 3, as 6 de 4 e as 12 de 5). O dobro de
  gente no Premium, no momento em que a pessoa está com uma dúvida sobre o
  próprio carro.
- **Com 2:** 39. Agressivo demais: pega quem fez só uma pergunta de seguimento.
- **E economiza:** cada pergunta é uma chamada paga ao modelo.

O dado contra, dito antes de decidir: as 12 que bateram no limite até hoje não
assinaram nenhuma. Só que o Android cobrava na hora, sem o teste prometido, até
hoje de manhã. Com o teste no ar, este é o primeiro limite a medir.

### Tirar na 3.2: a segunda consulta de sintoma

O sintoma é a segunda coisa mais usada e a porta de quem tem um problema
agora. Proposta:

- **A primeira consulta fica inteira e grátis**: todas as causas, o checklist
  todo. É ali que a pessoa entende o valor.
- **Da segunda em diante**, o grátis mostra a causa mais provável, e as outras
  pedem Premium.

Alcance: 57 aparelhos consultaram dois sintomas ou mais no período (32 dois,
18 de três a quatro, 7 cinco ou mais). Hoje todos eles veem 2 causas sempre.

Isto mexe na tela, então só vale com a 3.2.

### Tirar na 3.2, pequeno: o relatório do caderno de gastos

Registrar abastecimento continua grátis. O que vira Premium é a conta pronta:
custo por km, consumo médio, gasto do mês. São só 15 aparelhos, mas **7 deles
voltaram em outro dia**, a maior taxa de volta de todas as funções. É o
público que usa o app como hábito, que é quem assina.

Antes de fazer, a Engenharia confere no código o que o caderno já mostra hoje.

## O que NÃO tirar, e por quê

- **As aulas.** São 203 aparelhos e 39 que voltam: é o motor da volta. Os
  vídeos estão abertos no YouTube, então trancar no app não protege nada e
  ainda tira a vitrine. As 16 aulas Premium continuam como estão.
- **O registro de serviço.** O limite de 20 ninguém alcança (1,4 por
  aparelho), e baixar para 5 também não pegaria ninguém. E o histórico é o que
  alimenta o relatório de gastos, que já é Premium.
- **Os lembretes de revisão.** São o que traz a pessoa de volta. Trancar o
  lembrete é trancar a volta.
- **O primeiro carro e o primeiro uso de qualquer coisa.** O app funciona
  como convidado por contrato (Termos, seção 3), e o valor tem de aparecer
  antes da conta e do Premium.
- **O segundo carro (hoje grátis até 2).** Só 6 contas têm dois carros ou mais.
  Baixar para 1 irrita mais do que vende.

## O que muda junto, para não quebrar promessa

- A tabela "Conheça o Mentorque Premium" passa a dizer o limite novo de cada
  coisa, e as duas linhas erradas de hoje são corrigidas (Biela não é
  "trancado", é limitado; o plano de revisão existe no grátis).
- **Nada que a pessoa já guardou fica trancado.** Serviço, carro e
  abastecimento registrados continuam visíveis.

## Quanto isto pode render, com honestidade

A conta que dá para fazer é a de **exposição**, não a de venda. Somando a Biela
(13 pessoas-mês a mais no limite) e o sintoma (até 57 aparelhos a mais vendo a
oferta), o Premium passaria a ser visto por umas 70 pessoas a mais por mês,
contra 174 hoje.

Quantas assinam depois disso ninguém sabe ainda, porque até hoje de manhã o
Android cobrava na hora. O teste grátis entrou hoje, e as duas primeiras
semanas dele dizem quanto vira assinatura. Com uma compra por mês, nenhuma
mudança destas se lê em menos de semanas, e por isso a ordem importa: uma de
cada vez.

## A ordem sugerida

1. **Agora**: Biela de 5 para 3, só no servidor, e anotar a data. Volta atrás
   em um commit.
2. **Na 3.2**: o sintoma, o relatório do caderno e a tabela do Premium.
3. **Daqui a duas semanas**: ler quantos bateram em cada limite, quantos
   começaram o teste a partir de cada um, e só então decidir o próximo passo.

Uma aposta do CRO lê a porta do Premium em 20/10 (`portao-unico-do-premium`).
Mexer na Biela muda quantas pessoas chegam ao Premium por ela, e isso fica
anotado na aposta no dia em que a mudança entrar.
