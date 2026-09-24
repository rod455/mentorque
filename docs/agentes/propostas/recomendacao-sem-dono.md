# Proposta: recomendação sem dono é recomendação que morre

Escrita em 24/09/2026, a partir da rodada de QA e Produto de 23/09. Ela é uma
das melhores rodadas que este time produziu, e mesmo assim **as três
recomendações dela não alcançaram ninguém**. O problema não é da rodada, é do
processo.

## O que foi medido

| Recomendação | Dono declarado | Quem pode executar |
|---|---|---|
| 1. O retrato usar as colunas novas de coorte | "Fila do Analista de Dados, no n8n" | **ninguém** |
| 2. Separar o fundo do funil por plataforma | "Fila do Analista, com o CRO" | metade (o CRO existe) |
| 3. Decidir se o Android vai vender | "Precisa do Rodrigo" | ele, mas **não chegou na lista dele** |

Duas conferências de uma linha cada:

- `docs/agentes/ONDE-VER.md` lista as sessões fixas do time. **Não existe
  sessão de Analista de Dados.** O Analista é um fluxo do n8n, e fluxo não lê
  recomendação, não decide e não responde;
- `grep -c "Android" docs/agentes/acoes-do-dono.md` devolve **0**. A
  recomendação 3, que a própria rodada chama de "a pergunta de negócio por trás
  dos dois achados", não virou linha em lugar nenhum.

## Por que isso é pior do que parece

O relatório fica bom, o dono lê, concorda, e nada acontece. Na semana seguinte
o mesmo achado volta, agora com mais dias de idade, e o custo de ter medido
certo é pago duas vezes.

É o mesmo defeito que a lista do dono foi criada para resolver em 07/09, só que
um nível acima: lá o problema era o item parado envelhecer calado; aqui é o
item **nunca entrar na lista**.

## As duas mudanças propostas

**1. Toda recomendação nomeia um dono de uma lista fechada.** Os sete papéis do
time, ou o dono. "Fila do Analista" não é dono, porque o Analista não é agente.
Se a coisa mora no n8n e ninguém do time mexe no n8n por rotina, o dono é o
Rodrigo, e vale a regra 2.

**2. Recomendação cujo dono é o Rodrigo vira linha em `acoes-do-dono.md` NA
MESMA RODADA, pelo próprio agente que recomendou.** Não na segunda seguinte,
não pelo Diretor. Quem mediu escreve, porque é quem tem o porquê na mão.

E uma conferência que morde a regra 2: `conferir:acoes` passa a poder comparar
o artifact da rodada com a lista. Isso exige que o agente declare as
recomendações num formato lido por máquina, e essa parte ainda não está
desenhada. Sem ela, a regra 2 depende de lembrança, e regra que depende de
lembrança não é regra (a lição está em `ler-a-operacao`).

## O que já foi feito sem esperar aprovação

A recomendação 3 entrou na lista do dono em 24/09, com o número que a sustenta
(85% de quem vê o paywall está num app que não pode vender). Isso é conserto de
um caso, não mudança de processo.

## O que depende do dono

Aprovar as duas regras acima e a entrada delas nos sete manuais. Mexer em
manual é decisão dele, por regra do próprio manual do Diretor.
