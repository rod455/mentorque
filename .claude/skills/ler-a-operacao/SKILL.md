---
name: ler-a-operacao
description: Como ler os números do Mentorque sem tirar conclusão errada. Use SEMPRE que a pergunta envolver funil, cadastros, assinaturas, receita, MRR, churn, CAC, atribuição de campanha, UTM, retrato diário ou "como estamos". Também ao escrever qualquer relatório de agente que cite número, e antes de responder qualquer pergunta que comece com "quantos", "quanto" ou "como está". As armadilhas aqui já produziram conclusões erradas na cara do dono mais de uma vez.
---

# Ler a operação sem se enganar

Os números do Mentorque são fáceis de consultar e fáceis de ler errado. Todas
as armadilhas abaixo aconteceram de verdade, foram ditas ao dono com confiança,
e tiveram de ser corrigidas depois. Elas não são teoria.

O método longo (as quatro perguntas, definições de cada métrica, réguas,
limites conhecidos da série) está em **`docs/agentes/skills/analise-da-operacao.md`**.
Leia esse arquivo quando a tarefa for uma análise completa. O que está aqui é o
que evita errar, e vale mesmo numa resposta de uma linha.

## Antes de investigar: isto já foi respondido?

**Abra a tabela "LEIA ISTO ANTES DE RECONFERIR QUALQUER NÚMERO", no topo do
`docs/agentes/DIARIO.md`.** É o primeiro passo, não o último.

Esta skill toda empurra para desconfiar e conferir, e isso é certo na primeira
vez. Na terceira vez é desperdício do tempo do dono, com a agravante de que
chegar sozinho na mesma resposta parece trabalho e não é.

Em 04/09 o dono cortou: "toda vez você confere as mesmas coisas". Ele estava
certo. Eu tinha ido ao Stripe reconfirmar que o cupom era `duration: once` e
que a receita era zero. As duas coisas estavam escritas no diário, uma delas
por um agente nosso naquela mesma manhã.

Reabrir uma pergunta fechada só se houver **motivo novo**: um dado que
contradiz, uma data que passou, uma mudança que alguém fez. "Quero ter certeza"
não é motivo novo. E quando fechar uma pergunta que custou investigação,
acrescente a linha lá, senão o próximo repete.

## Número de funil: existe UMA porta, e escrever SQL na mão não é ela

**Nunca escreva consulta de funil à mão.** Chame a fonte canônica, sempre a
mesma, com a janela declarada:

| Pergunta | Chame |
|---|---|
| quantos passaram por cada etapa | `select * from public.funil_canonico('aaaa-mm-dd')` |
| quantas contas de FORA foram criadas | `select public.contas_criadas_desde('aaaa-mm-dd')` |
| quantos TÊM carro, serviço, estão ativos | `select * from public.estado_da_base` |
| essas duas etapas viram uma taxa? | `degrau()` de `lib/funilCorreto.ts`, nunca uma divisão sua |

Isto existe por causa de 05/09/2026, e a cobrança foi literal: "cada hora você
me traz um resultado do funil". Em três respostas seguidas eu disse 35 pessoas,
depois 7 contas, depois 1 cadastro de carro. As três consultas estavam certas e
nenhuma era comparável com a anterior, porque cada uma escolheu sozinha uma
régua: uma contou `anon_id`, outra `user_id`, outra recortou por coorte de
campanha.

A régua já existia (`public.identidade`, `funilCorreto.ts`, `estado_da_base`) e
não foi ela que falhou: falhei eu, escrevendo SQL na mão em vez de chamar o que
estava pronto. Regra que depende de lembrança não é regra.

Três consequências práticas:

1. **Diga sempre a janela e a régua junto com o número.** "6 cadastros desde
   01/09, por identidade" é uma frase completa. "6 cadastros" não é.
2. **Ato não se conta pelo evento quando existe tabela.** Quem tem carro sai de
   `estado_da_base`, não de `cadastrou_carro`. Quem criou conta sai de
   `contas_criadas_desde`, não do evento `cadastro`. A lista completa está em
   `FONTE_MELHOR`, em `lib/funilCorreto.ts`.
3. **Cuidado com a fronteira aparelho/conta.** `funil_canonico` traz `pessoas`,
   `aparelhos` e `contas` lado a lado justamente para denunciá-la: `contas` = 0
   quer dizer que o evento só existe antes do login, e ele não se divide por um
   evento de conta. `podeComparar()` recusa sozinho, com motivo.

## A regra que resolve metade dos erros

**Antes de dizer um número, diga a si mesmo qual tabela é a VERDADE daquele
número.** Se a resposta for "o funil", desconfie: o funil é medição, e medição
falha em silêncio.

| pergunta | verdade | não use |
|---|---|---|
| quem tem Premium | `subscriptions` | `funil_eventos` |
| quanto dinheiro entrou | Stripe, `amount_paid` | MRR, `subscriptions` |
| quantas contas existem | `auth.users` | evento `cadastro` |
| quanta gente chegou | `funil_eventos` | (aqui o funil é a verdade) |

Em 02/09 o painel dizia 2 assinaturas e havia 4 pessoas com Premium. A resposta
saiu do funil, que é medição, quando a pergunta era sobre quem tem o direito, que
é `subscriptions`. O dono percebeu antes de mim.

## As armadilhas, uma a uma

### Assinante é `active` E `trialing`

Em teste grátis o cartão já foi dado e a pessoa já tem Premium na mão. Contar
só `active` esconde metade da base. `lib/operacao.ts` já faz isso certo; copie
o filtro de lá em vez de escrever de novo.

### MRR é projeção, `amount_paid` é caixa

MRR é "quanto entraria se todo mundo renovasse pelo plano". Não é dinheiro.

O caso que ensinou: em 01/09 uma fatura avançou o período e três leituras
independentes (a minha, a do agente de QA e a do painel) disseram que R$ 29,90
tinham entrado. A fatura tinha subtotal 2990, desconto 2990 e **total 0**. Uma
fatura de R$ 0,00 é quitada na hora e avança o período igual. **"Período
avançou" prova que a cobrança foi emitida, não que o dinheiro chegou.**

Quando a resposta for sobre receita, abra a fatura e olhe `amount_paid`.

### A UTM mora um nível abaixo do que parece

O caminho certo é **`extra->'utm'->>'utm_source'`**, com o `utm` no meio. O
`lib/app/funil.ts` posta um objeto aninhado.

Em 03/09 eu consultei `extra->>'utm_source'`, recebi nulo em tudo, e concluí em
seguida que a captura de campanha estava quebrada, que o redirecionamento do
provedor de e-mail comia a query e que dois consertos eram necessários. Nada
disso era verdade: a etiqueta estava lá o tempo todo. **Consulta que devolve
nulo em 100% das linhas é suspeita de caminho errado antes de ser notícia.**

### Taxa só entre degraus da mesma natureza

Não divida um ato por um estoque. `abriu_app` dispara toda sessão, para todo
mundo; `comecou_onboarding` é uma vez por aparelho. Dividir um pelo outro
produz um número que parece taxa e não é. O `lib/funilCorreto.ts` classifica
cada evento como ato ou estoque, e a regra completa está lá.

### Amostra pequena é direção, não lei

Com dez aparelhos, um a mais muda a porcentagem em dez pontos. Diga o número
absoluto junto com a taxa, sempre, e diga que a amostra é pequena quando for.
Isso não é modéstia: é o que impede o dono de tomar decisão cara com base em
ruído.

## Antes de mandar a resposta

Três perguntas rápidas, e elas pegam quase tudo:

1. **Qual tabela é a verdade deste número?** Se for medição, diga que é.
2. **Se eu estiver errado, o que apareceria?** Se a resposta for "exatamente o
   que eu estou vendo", você não testou nada ainda.
3. **Isto é dinheiro ou é projeção?** Se falar em receita, prove com o pago.

## Quando duas fontes discordam

Não escolha a mais otimista, e não deixe a contradição para o próximo. Diga
qual é a verdade para aquela pergunta, diga por quê, e cave até fechar. Uma
rodada do agente de QA viu a contradição, escreveu ela com todas as letras,
escolheu o galho otimista e passou o enigma adiante. Duas fontes que discordam
são um achado, não um obstáculo.
