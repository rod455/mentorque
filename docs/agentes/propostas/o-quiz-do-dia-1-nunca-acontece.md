# O quiz do dia 1 nunca acontece

Proposta do QA, varredura de 07/10/2026 (fluxo: quiz diário, o maior recurso do
app que nunca tinha passado por varredura dedicada).

**Decisão é do dono**, e está escrito aqui por quê: o conserto mexe em
uniqueness de tabela e no significado da sequência, que é o único ativo que o
quiz constrói. Nada disto foi aplicado.

## O achado, em uma linha

A pessoa responde a pergunta do quiz no onboarding, e isso consome o dia dela:
no mesmo dia, o quiz diário fica indisponível, com a tela dizendo que ela já
respondeu. **Em 314 aparelhos que responderam o onboarding, ZERO responderam um
quiz diário naquele mesmo dia.** MEDIDO em 07/10, no banco.

O dia 1 é o dia em que a pessoa está dentro do app, com atenção, por vontade
própria. É o melhor dia que o quiz vai ter com ela, e é o único em que ele não
roda.

## Como eu sei (fonte primária, e as três camadas)

São três coisas independentes empurrando na mesma direção. Qualquer uma
sozinha bastaria para bloquear.

**1. A tela decide pelo `ultimoDia`.** `PrimeiroQuiz.tsx:140` chama
`responderQuiz(...)`, que em `store.tsx` é `aoResponder(...)`, que carimba
`ultimoDia = hoje` e `sequencia = 1`. Em `Quiz.tsx:67`, a tela faz
`if (escolha === null && respondeuHoje(estado, hoje))` e cai no ramo
`JaRespondeu`, mostrando a pergunta DO ONBOARDING (buscada pelo id guardado no
histórico) com o selo de sequência. A pergunta daquela data nunca é oferecida.

`respondeuHoje` pergunta "respondeu ALGUMA COISA hoje?", e a tela precisa de
"respondeu A PERGUNTA DE HOJE?". São perguntas diferentes e a diferença é o
defeito.

**2. O banco recusaria de qualquer jeito.** O índice
`quiz_respostas_uma_por_dia` é único em `(dia, anon_id)`, **sem a pergunta**.
Ensaiei no banco em 07/10, numa transação desfeita: inserida a resposta do
onboarding, a resposta da pergunta do dia, da mesma pessoa no mesmo dia, é
recusada. A rota `/api/quiz` trata `23505` como sucesso (`repetida: true`), de
propósito e com boa razão, então o descarte é silencioso. Consertar só a tela
produziria uma resposta que a pessoa dá e o servidor joga fora.

**3. A estatística não enxerga o problema.** Das 373 linhas de
`quiz_respostas`, 314 são da `oleo-intervalo` (a do onboarding). Quem lê a
tabela sem separar conclui que o quiz tem 5 respostas por dia; o quiz diário
tem **59 respostas, de 23 aparelhos, em 34 dias: 1,7 por dia**. Eu mesmo
publiquei o 5 na primeira leitura desta rodada antes de separar.

## A ironia que fecha o assunto

A frase "62% acertaram hoje" é a razão de a tabela existir (está escrito no
cabeçalho de `supabase/quiz_respostas.sql`). Ela aparece a partir de 20
respostas no dia, piso bem argumentado: abaixo disso é ruído, e com 1 ou 2
respostas a porcentagem vaza a resposta alheia.

Em 42 dias, a frase apareceu em **UM**. E a única pergunta com respostas de
sobra para mostrá-la (314, contra o piso de 20) é a do onboarding, que é a
única tela que nunca pede o placar.

## O que eu recomendo, e os três detalhes que mordem

A direção: **a resposta do onboarding conta como estudo, não como presença.**
Esse vocabulário já existe neste código. `aoResponderPassado` tem exatamente
essa semântica e o comentário dela já diz o princípio: "a sequência mede
aparecer todo dia".

As três camadas, na ordem em que precisam ser mexidas:

1. **O índice.** `(dia, anon_id)` passa a `(dia, anon_id, pergunta_id)`. A
   razão original do índice continua intacta: ela existe para que a
   porcentagem signifique "das PESSOAS que responderam", e isso é por pergunta,
   que é justamente a unidade do `quiz_dia` e do GET. Hoje o índice protege
   mais do que precisa e, de quebra, bloqueia caso legítimo.
   **Isto não é aditivo e não é da minha alçada**: trocar uniqueness exige
   apagar o índice antigo, e index novo em tabela com 373 linhas é instantâneo
   mas é mudança de regra, não de leitura.

2. **A tela.** `respondeuHoje` deixa de responder "respondeu alguma coisa hoje"
   e passa a responder "já respondeu a pergunta DE HOJE", comparando o
   `perguntaId` do registro do dia com o que a rotação devolve para a data.
   `aoResponder` usa a mesma função para ser idempotente, e continua sendo:
   depois de responder a pergunta do dia, o registro casa e o segundo toque não
   conta.

3. **O que a sequência passa a significar.** Hoje a pessoa sai do onboarding
   com "1 dia seguido". Com o conserto, ela sai com o mesmo 1 (o `aoResponder`
   do onboarding continua carimbando), e PODE fazer o quiz do dia em seguida;
   nesse segundo toque `diasEntre(hoje, hoje)` é 0, cai no `else` e a sequência
   fica em 1. Não infla. Confirmei lendo `aoResponder` linha a linha.

**O detalhe que eu quase deixei passar, e é o único que exige código novo:** as
duas respostas no mesmo dia somam `respostas + 1` cada uma, mas o histórico
guarda UM registro por dia (`comHistorico` filtra o dia repetido). O total
passa a 2 com um registro só, e `mesclarQuiz` usa
`Math.max(..., historico.length)`, então o 2 fica. É inflação pequena e é do
tipo que esta casa odeia: número que não casa com o que a tela mostra ao lado.
O conserto é `aoResponder` não incrementar `respostas` quando já existe
registro para aquele dia (substituir não é responder de novo).

## O que NÃO recomendo

Baixar o piso de 20. Ele não é conservadorismo: com 1 ou 2 respostas a
porcentagem conta a resposta da outra pessoa. O problema não é o piso, é o
numerador.

Também não recomendo tirar a pergunta do onboarding da tabela. Ela é um fato
real e o acerto dela é informação boa sobre quem chega. Separar (como a view
`quiz_participacao`, aplicada nesta rodada) resolve a leitura sem perder dado.

## O que eu já fiz nesta rodada, dentro da alçada

- A view aditiva `public.quiz_participacao`, que separa `onboarding` de
  `diario` com as duas etiquetas nomeadas, ensaiada no banco e com o arquivo
  `supabase/quiz_respostas.sql` atualizado no mesmo commit.
- `npm run conferir:quiz-populacao`, que guarda o acoplamento frágil da view
  (o id escrito à mão no SQL contra `perguntaDoOnboarding`) e cobra que a
  pergunta do onboarding siga fora da rotação diária. Cinco defeitos plantados,
  os cinco reprovaram.
- O aviso no cabeçalho da tabela, para o próximo que for somar aquelas linhas.

## A conferência que vem com o conserto

Quando o conserto subir, ele pede três asserções, e nenhuma delas existe hoje:

1. com só a resposta do onboarding gravada no dia, a pergunta DO DIA ainda é
   oferecida (é o defeito desta proposta, e a asserção tem que reprovar sobre
   o código de hoje);
2. respondida a pergunta do dia, o segundo toque não conta duas vezes (a
   idempotência que não pode ser perdida no caminho);
3. `respostas` nunca passa do tamanho do histórico mais as respostas de dias
   passados (a inflação do detalhe acima).

A primeira é a que importa: ela é a única que olha QUEM USA a regra, e foi
exatamente essa família que deixou cinco conferências desta casa verdes com o
defeito de pé em 03/10.

## Leitura de Engenharia (08/10/2026), para o dono decidir

Conferido no código e no banco em 08/10, de madrugada (UTC). As três camadas
estão como a proposta descreve: `PrimeiroQuiz.tsx:140` chama `responderQuiz`,
que é `aoResponder` e carimba `ultimoDia`; `Quiz.tsx:67` decide por
`respondeuHoje` e mostra a pergunta do onboarding como "a de hoje"; o índice
`quiz_respostas_uma_por_dia` é `(dia, anon_id)` no `pg_indexes`.

### O número que mede o estrago (não é o zero)

O "0 de 314" é escrito pelo índice: com unicidade em `(dia, anon_id)` não
existe outro valor possível. O que a tabela mede de verdade, lido em 08/10:

| Quem respondeu o onboarding | Aparelhos |
| --- | --- |
| Total | 332 |
| Fez o quiz do dia seguinte | 4 |
| Fez algum quiz diário, qualquer dia depois | 9 |
| Nos últimos 30 dias: respondeu o onboarding | 316 |
| ... e voltou ao app em outro dia (`abriu_app`) | 96 |
| ... e fez algum quiz diário | 5 |

Três em cada dez voltam ao app; um em cada sessenta faz o quiz. O muro do dia
1 é a primeira hipótese e não está medida: não há evento de funil ao abrir a
tela do quiz, então não se sabe quantos bateram no "você já respondeu". Se o
conserto subir, vale nascer junto um `abriu_quiz` (com `origem` dizendo se
caiu na pergunta ou no "já respondeu"), senão a aposta não tem leitura.

### Dois caminhos, e o que cada um muda

**A. O da proposta: a sequência nasce no onboarding.** O onboarding continua
carimbando `ultimoDia` e `sequencia = 1`; `respondeuHoje` passa a comparar o
`perguntaId` do registro do dia com a pergunta que a rotação devolve, e para
isso recebe a lista de perguntas. Mexe em seis consumidores (`Quiz.tsx`,
`QuizNoTopo.tsx`, `aoResponder`, `lembreteQuiz.ts`, `manhasDoQuiz.ts`, e a
idempotência) e no incremento de `respostas`. A pessoa sai do onboarding com
"1 dia seguido" e o chip ainda chama para a pergunta do dia.

**B. O mais curto, e o que as palavras da proposta descrevem: o onboarding é
estudo.** O onboarding entra por uma função irmã de `aoResponderPassado`:
soma em `respostas` e `acertos`, guarda a resposta, e NÃO encosta em
`ultimoDia`, `sequencia` nem no histórico por dia. `respondeuHoje` continua
o que é, e os seis consumidores ficam como estão. O `PrimeiroQuiz` deixa de
olhar `ultimoDia` para saber se já apareceu (passa a olhar a resposta
guardada). A pessoa sai do onboarding com o chip "Quiz" ainda aceso, e a
sequência nasce no primeiro quiz do dia. Muda a frase de fecho do onboarding,
que hoje diz "Sua sequência começou hoje": passa a dizer que a pergunta de
hoje está esperando.

Nos dois caminhos o índice vira `(dia, anon_id, pergunta_id)`, e isso é
compatível com o app antigo nas lojas: toque duplo na mesma pergunta continua
batendo em `23505`, e o app antigo nunca manda duas perguntas no mesmo dia.
A migração pode subir antes do app. O código do app (`lib/app/**`,
`components/app/**`) só chega às lojas com a 3.2.

**Recomendação de Engenharia: B.** É o que a proposta diz com palavras, toca
dois arquivos em vez de seis, e deixa o chip chamando para o quiz no dia em
que a pessoa mais está dentro do app. O custo é uma frase de conteúdo e a
decisão de produto de que a sequência começa no primeiro quiz do dia, não no
onboarding. As três asserções da proposta valem para os dois caminhos, e a
primeira tem que reprovar sobre o código de hoje antes do conserto.

## Decisão do dono (08/10/2026): caminho B, aplicado

"vamos fazer o B. Implemente tudo." Aplicado em 08/10, commit bd95618:

- `aoResponderOnboarding` em `lib/app/quiz/sequencia.ts` (estudo, não
  presença; guarda em `quiz.onboarding`; não encosta em `ultimoDia`,
  `sequencia`, `perdaoEm` nem no histórico por dia); `jaRespondeuOnboarding`
  cobre quem respondeu antes de hoje; `mesclarQuiz` carrega o onboarding;
- a folha do primeiro quiz entra por esse caminho, ganha o botão "Responder
  a de hoje" e a frase de fecho deixa de dizer que a sequência começou;
- o índice novo `(dia, anon_id, pergunta_id)` criado no banco (migração
  `quiz_respostas_uma_por_dia_e_pergunta`); o `drop` do antigo está na lista
  do dono, porque a ferramenta desta sessão segura comando destrutivo;
- `abriu_quiz` no funil, com `origem` "pergunta" ou "ja-respondeu";
- as três asserções em `scripts/verifica-quiz.ts` (a primeira reprovou sobre
  o código de 07/10 antes do conserto) e a suíte `primeiro-quiz` tocando o
  botão novo e provando que a pergunta do dia é oferecida.

Ficha da aposta: `quiz-no-dia-1` em `docs/agentes/experimentos.md`.
