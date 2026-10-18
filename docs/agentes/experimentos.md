# Caderno de experimentos

O ciclo que separa o CRO sênior do júnior: toda aposta vira uma linha AQUI,
com hipótese, métrica e um veredito que fica aberto até ser fechado com
dado. A rodada semanal do CRO COMEÇA fechando os vereditos vencidos e só
depois abre aposta nova.

## Como registrar

Cada experimento é uma seção com este formato:

    ## [id-do-experimento] Título curto
    - Estado: PROPOSTO | ABERTO | FECHADO
    - Tipo: mudanca-direta | teste-ab
    - Alvo no funil: qual passagem quer melhorar (ver "Onde o funil quebra"
      no painel; a maior quebra é o alvo natural)
    - Tese BeSci: o princípio, por que ele se aplica AQUI, e o que cada
      variante muda na jornada (A = atual, B = proposta), explicado para o
      dono decidir sem abrir código
    - Métrica: o número exato que deve se mover · Duração mínima de leitura
    - Aprovação: aguardando o dono | aprovada pelo dono em DATA
    - Início: data · Ler a partir de: data (mínimo 2 semanas depois)
    - Antes: o valor no início (ou "série curta, base qualitativa")
    - Veredito: (aberto) | FUNCIONOU | NAO FUNCIONOU | INCONCLUSIVO + o porquê

Regras:
- Uma aposta nova por rodada, no máximo. Duas mudanças na mesma tela ao
  mesmo tempo = aprendizado nenhum.
- **Teste A/B só liga com aprovação do dono** (decisão do Rodrigo,
  2026-08-23): o agente registra como PROPOSTO com a tese completa e leva a
  proposta no artifact; NÃO ativa no código. Quando o Rodrigo aprovar (em
  qualquer sessão), quem implementar registra a aprovação aqui e ativa em
  lib/app/experimentos.ts. Mudança direta de baixo risco (sem variantes)
  continua na alçada normal, sem aprovação prévia.
- Teste A/B usa a infra de variantes (lib/app/experimentos.ts): registrar o
  id do experimento igual ao do código. Leitura por variante na view
  experimentos_resultados (via /api/dados, painel ou SQL).
- Com pouco volume, o veredito honesto é INCONCLUSIVO, AGUARDANDO VOLUME;
  reabrir quando a mídia ligar. Nunca fechar no achismo.
- Veredito fechado vira aprendizado na skill besci.md quando ensina algo.

## Os três níveis de um número (15/09/2026)

Todo número que entra em "Antes" ou em "Veredito" é de um destes três níveis,
e o nível tem que estar dito. Eles não se substituem, e o de cima não prova o
de baixo.

1. **Atividade.** Quantas pessoas foram EXPOSTAS à mudança: viram a tela,
   receberam o e-mail, caíram na variante B. Não diz nada sobre ter
   funcionado. Diz se o experimento chegou a acontecer.
2. **Conversão observada.** Quantas, entre as expostas, fizeram a coisa.
   É associação, e só. "Assinou depois de receber" não é "assinou por causa
   de". A pessoa que ia assinar de qualquer jeito também aparece aqui.
3. **Incremento estimado.** A diferença contra o grupo comparável: a variante
   A do sorteio, ou o mesmo período antes da mudança. É o único nível que
   sustenta a palavra FUNCIONOU.

As regras que saem disso:

- **Veredito FUNCIONOU ou NAO FUNCIONOU exige nível 3.** Com nível 1 ou 2 o
  veredito honesto é INCONCLUSIVO, e o texto diz qual nível faltou.
- **Atividade zero não é veredito, é diagnóstico de exposição.** Foi o caso
  dos quatro experimentos da rotina do carro em 15/09: adoção zero porque
  estavam presos atrás da 2.6, que não saiu. Isso não é "não funcionou", é
  "ninguém viu". Fechar ali teria enterrado quatro apostas por engano.
- **Nunca atribuir receita inteira a um contato.** Assinatura que aconteceu
  depois de um e-mail não é "assinatura trazida pelo e-mail". Se quiser dizer
  que o e-mail trouxe, precisa do nível 3, e sem ele o número vai escrito
  como "assinou depois de", que é o que de fato se sabe.
- **Custo e receita separados.** Quando o custo não foi informado, a margem
  fica "não calculada", e não zero.

A régua veio do protótipo de oficina que o dono mandou em 15/09, seção 8, que
separa atividade de conversão observada de estimativa incremental e proíbe
chamar orçamento aprovado de "receita recuperada". O documento era de outro
produto; a disciplina serve para este.

Esta régua é convenção escrita, não tem conferência automática atrás dela. A
única coisa que a faz valer é quem escreve o veredito.

## Experimentos

## [conta-que-sabe-que-veio-do-carro] Quem toca em "Criar minha conta" não cai numa tela de "Entrar"
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: **a maior quebra real do produto hoje, e ela não está na lista
  de `quebraFunil` porque a folha que a causa não grava evento nenhum.** De
  quem cadastra o carro como convidado, quantos acabam com conta. Lido no banco
  em 16/10 às 11h08 UTC, por aparelho e por semana:

      semana 21/09   101 cadastraram carro sem conta    40 criaram conta em 2 min    45 em algum momento
      semana 28/09   104                                52                           56
      semana 05/10   165                                63                           68
      semana 12/10   159 (aberta, piso)                 60                           65

  São cerca de **100 aparelhos por semana que ganham carro e nunca ganham
  conta**. Para comparar: o paywall inteiro é visto por 37 aparelhos na semana.
  Esta é a quebra com mais gente dentro, e sem conta não existe assinatura,
  e-mail, aviso nem garagem em outro aparelho.
- **A JANELA É DE DOIS MINUTOS, E ISSO É O ACHADO QUE ABRE A APOSTA.** Das 372
  pessoas que cadastraram carro nas três semanas fechadas de 21/09 a 11/10:
  200 nunca criaram conta, 155 criaram em até 2 minutos, 14 entre 2 minutos e
  1 hora, e **ZERO depois de mais de uma hora**. Não é uma, é nenhuma. A
  decisão acontece em cima da folha "Salve sua garagem" e o momento não volta,
  porque o convite é consumido e não se repete.
- Tese BeSci: clareza do próximo passo, e é a TERCEIRA vez que esta casa acha o
  mesmo defeito, agora no degrau com mais gente. A folha diz "Salve sua
  garagem", o botão diz **"Criar minha conta"**, e a tela que abre é a de
  **"Entrar"**: o `AuthScreen` nasce em `mode = "in"`, com o campo de nome
  escondido, o botão escrito "Entrar", o atalho "Esqueci minha senha" na frente
  e o herói repetindo a MESMA frase que a folha acabou de dizer ("Salve sua
  garagem e cuide do seu carro de qualquer aparelho"). A pessoa apertou criar e
  recebeu entrar.
  - Os dois irmãos já conhecidos: o "+" da garagem cheia que levava ao paywall
    calado (11/09) e a tela de entrar que não sabia que a pessoa veio comprar
    (18/09). A regra da casa é a mesma nos três: **um controle diz o que vai
    acontecer, e a tela de destino continua a frase da tela de origem.**
  - A mudança: a folha deixa a marca de onde a pessoa veio (mesmo mecanismo do
    `mq-veio-assinar` de 18/09, que já atravessa a recarga do login social), e
    a tela de entrar abre em modo de CRIAR CONTA, com o herói dizendo que a
    conta é o passo que salva a garagem que ela acabou de montar, e que dá para
    fazer pelo Google ou por e-mail e senha.
  - UM PRINCÍPIO SÓ, de propósito: nada de aversão à perda, nada de número, nada
    de mexer no texto da folha. Se o número andar, foi a continuidade entre as
    duas telas.
  - O que NÃO muda: o "Já tem conta? Entrar" continua a um toque, os botões do
    Google e da Apple continuam onde estão, e dizer "Agora não" continua
    fechando a folha sem parede nenhuma (o app funciona como convidado por
    contrato, Termos seção 3). Sem preço, sem plano, sem passo legal.
- Métrica: de quem gravou `cadastrou_carro` com `user_id` nulo na semana,
  quantos gravaram `cadastro` em até 2 minutos. Hoje 63 de 165 na última semana
  fechada (05/10), e a série acima como linha de base ·
  Duração: 4 semanas, com leitura direcional em 2
- **Nível da régua: 2, e nunca 3.** É mudança direta, sem variante, então não
  existe braço comparável. A comparação é contra as quatro semanas anteriores,
  com a ressalva de que o denominador está crescendo rápido (101, 104, 165,
  159) e que o mix de plataforma muda junto. Com 165 por semana, 10 pessoas de
  diferença viram 6 pontos: **é direção, e vira conclusão só se a diferença
  passar de umas 15 pessoas por semana por duas semanas seguidas.**
- O que poderia fechar este veredito, escrito agora: numerador
  (`cadastro` em 2 min) e denominador (`cadastrou_carro` sem conta) existem
  nos dois no `funil_eventos` desde 23/08, por aparelho, com série semanal.
  Não é métrica de ausência e não depende de instrumento novo. **Esta aposta
  NÃO cai num ponto cego** (régua 13): o que é cego na folha é só o MOTIVO da
  recusa, e o veredito não precisa dele.
- Aprovação: não se aplica (texto, modo inicial da tela e ênfase; sem variantes,
  sem tocar em preço, plano ou cobrança)
- Início: 2026-10-16 na web; **no app desde 18/10, com a 3.2** (build 73,
  lido nas APIs das duas lojas) · Ler a partir de: **2026-11-01**
  (direcional) e **2026-11-15**, contadas da loja e não do commit (retorno do
  dono de 17/10). A leitura separa por `versao`: na 3.1 e antes a tela de
  entrar continua nascendo em "Entrar". Desde a 3.2 a folha grava
  `convite_conta`, `aceitou_convite_conta` e `recusou_convite_conta`, então o
  degrau passa a ter instrumento próprio além da reconstrução pelo carro.
- TOCA O DEGRAU DE OUTRA APOSTA, dito no dia (regra de 02/10): o
  `convite-do-carro-nao-queima-com-convidado` (ler em 23/10) vive no mesmo
  instante da jornada, logo depois de salvar o carro, e mede o convite de
  AVISO. São duas folhas diferentes no mesmo momento, e a ordem entre elas não
  muda aqui. O que pode contaminar: quem cria conta agora passa a poder ver o
  convite de aviso que antes queimava. Isso EMPURRA o número daquela aposta
  para cima, e por isso fica escrito hoje, não no veredito dela.
- Antes: 63 de 165 (05/10), 52 de 104 (28/09), 40 de 101 (21/09). A tela de
  entrar nasce em modo "Entrar" e repete a frase da folha.
- Veredito: (aberto)

## [primeiro-servico-com-ganho-nomeado] O "nenhum serviço registrado" vira o próximo passo
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: a passagem que virou a maior quebra real depois de o caminho
  até o carro ser consertado: **175 das 212 contas têm carro e só 21 têm
  serviço registrado**. De cada 100 contas com carro, 12 registram serviço.
- Tese BeSci: clareza do próximo passo, com o ganho nomeado. Na tela do carro,
  a linha do calendário mostra "Nenhum serviço registrado ainda", que é um
  aviso de ausência: ele descreve o vazio sem dizer o que fazer nem o que a
  pessoa ganha fazendo. Do lado cheio, a MESMA linha mostra "N registros ·
  R$ X em 12 meses", que é exatamente o ganho que os usuários nomeiam sozinhos
  nas avaliações ("controle dos gastos", "consegui economizar", "economizar na
  oficina por não ser enrolado", 4 das 12 avaliações). Ou seja: o app já sabe
  entregar o ganho, e só não o promete a quem ainda não começou.
  - A mudança: o estado vazio passa a dizer o próximo passo e o que ele
    destrava, em vez de constatar o vazio. Nada de número inventado: o que é
    prometido é o que a linha cheia faz de verdade, somar o gasto de 12 meses.
  - Por que é o momento: até setembro a quebra estava antes, em chegar ao
    carro, e ela foi de 7 para 34 de cada 100 em cinco semanas. O degrau
    seguinte agora é este, e ele é o que sustenta retorno mensal, porque gasto
    de carro é mensal e problema de carro é raro.
- Métrica: contas com serviço sobre contas com carro (hoje 21 de 175), e
  `registrou_servico` por semana · Duração: 4 semanas
- Aprovação: não se aplica (texto e ênfase, sem variantes, sem tocar em preço,
  plano ou cobrança)
- Início: 2026-10-09 · Ler a partir de: 2026-11-06
- Antes: 21 contas com serviço de 212 contas, 175 delas com carro. A linha
  vazia diz "Nenhum serviço registrado ainda".
- O que poderia fechar este veredito, escrito agora para não repetir o erro do
  `limite-de-carros-com-aviso`: a razão contas com serviço sobre contas com
  carro é medida e aparece no retrato (estadoDaBase), então existe numerador,
  denominador e série. Não é métrica de ausência.
- Veredito: (aberto)

## [inicio-pergunta-unica] O Início tem uma ação primária: a pergunta ao Biela, com ou sem carro
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: `perguntou_biela` por sessão com origem no Início; e os
  fechamentos do app na Home (retrato de 04/10: 7 em 4 aparelhos na home).
- Tese BeSci: uma ação por tela. O Início tinha dezesseis blocos e o herói
  mudava de promessa quando existia carro ("O que vamos cuidar hoje?" com o
  botão indo para a tela de sintomas). A = isso. B = a pergunta é a porta para
  todo mundo ("O que está acontecendo com o seu carro?", três atalhos que
  abrem o chat já preenchido, botão "Perguntar para o Biela"); o carro é o
  segundo bloco; "Registrar serviço" e "Aprender" são as secundárias; o card
  do Premium desce do topo para o fim da tela (continua ali e no Perfil); a
  grade de quatro ações rápidas sai (diagnosticar é o herói, plano de revisão
  mora no carro); o resto da tela desce inteiro, sem sumir. A arte da Biela
  na garagem fica.
- TOCA O DEGRAU DE OUTRAS APOSTAS, dito no dia (regra de 02/10): os cards
  de `caderno-de-gastos`, `datas-do-carro`, `resumo-mensal` e
  `modo-motorista-de-app` continuam no Início, mas descem um bloco (entra o
  par de secundárias acima deles). E o card do Premium saiu do topo, o que
  mexe em `viu_paywall:home`, degrau que `login-sabe-que-veio-comprar` lê.
  Está escrito aqui para o veredito dessas cinco não atribuir ao acaso o que
  foi esta mudança.
- Métrica: `perguntou_biela` por sessão com origem `sem-carro` e `com-carro`,
  separadas, e fechamentos na Home · Duração: 4 semanas; ~200 ativos por
  semana e 66 perguntas em 30 dias, então direção, não medida
- Aprovação: aprovada pelo dono em 2026-10-04 ("atualiza la para eu testar e
  ver como ficou"). Por decisão dele, abriu junto com `aba-biela`, que mede o
  mesmo degrau: a leitura das duas não separa uma da outra, e isso fica dito
  agora, não no veredito.
- Início: 2026-10-04 na web; NO APP DESDE 07/10, COM A 3.1 (build 71; a
  3.0 saiu da árvore 748fedf, 18h07 UTC de 04/10, e este commit, 28f13e1,
  entrou às 22h56; o dono abriu a 3.0 no iPhone em 06/10 e viu o Início
  antigo). Até a 3.1 publicar, quem está no app das lojas está em A, e
  a leitura separa por `plataforma`: web mede B, android e ios medem A.
  A VERSÃO B MUDOU EM 06/10 na web (limpeza visual, docs/design/
  limpeza-visual-nubank.md): o herói é o mesmo, mas o resto do Início virou
  oito blocos em linha (fila de atalhos, carro, uma pendência, gastos,
  Descubra mais, problemas comuns em linha). A leitura de 18/10 compara A
  com "B de 04 a 06/10" e "B desde 06/10" sem conseguir separá-las, e isso
  fica dito aqui, não no veredito · Ler a partir de: 2026-10-18 (direcional,
  só web) e 2026-11-01
- Antes: 66 `perguntou_biela` em 30 dias (16 com palavras da pessoa); 7
  fechamentos na Home em 4 aparelhos no retrato de 04/10
- Veredito: (aberto)

## [aba-biela] A aba "Problemas" vira "Biela"
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: `perguntou_biela` por usuário ativo na semana; guarda:
  `consultou_sintoma` não pode cair pela metade.
- Tese BeSci: o Biela é o uso real do produto e não tinha aba; a tela de
  sintomas tinha. A = aba "Problemas" abrindo os sintomas. B = aba "Biela"
  abrindo o chat; os sintomas (causas, urgência, faixa de preço, testes
  caseiros, anamnese) continuam inteiros, a um toque dentro do chat ("Ver
  sintomas comuns") e nos problemas comuns do Início. Nada foi apagado: a
  decisão de trocar sintomas por chat (aposta 8 de
  `docs/design/evolucao-simplificacao.md`) continua esperando número.
- Métrica: `perguntou_biela` por ativo na semana; `consultou_sintoma` por
  ativo na semana como guarda · Duração: 4 semanas, direcional em 2
- Aprovação: aprovada pelo dono em 2026-10-04, junto com `inicio-pergunta-unica`
- Início: 2026-10-04 na web; NO APP DESDE 07/10, COM A 3.1 (a 3.0 das lojas
  saiu sem o commit 28f13e1 e mostrava a aba "Problemas"). Até a 3.1, android e ios medem A; a leitura separa por
  `plataforma`. Em 06/10 o card do Biela saiu de Aprender e os "problemas
  comuns" do Início viraram duas linhas mais "ver todos" (limpeza visual).
  E NA NOITE DE 06/10 O DONO DECIDIU A DIREÇÃO CONTRÁRIA DA APOSTA: a aba
  "Biela" passa a abrir a tela de problemas (arte, busca, problemas comuns,
  sistemas) e o chat fica a um toque no botão "Falar com o Biela", logo
  abaixo da busca, para todo mundo. O rótulo da aba continua "Biela", e o
  chat continua sendo a porta do Início (herói e atalhos). Na web, a B
  valeu de 04/10 a 06/10; o que roda daqui em diante é "aba de problemas
  com rótulo Biela e chat a um toque", que é uma terceira variante, e a
  leitura de 18/10 não separa as três · Ler a partir de: 2026-10-18
  (direcional, só web)
- Antes: 66 `perguntou_biela` e 178 `consultou_sintoma` (desde 13/09) no
  funil; não li o recorte semanal de `consultou_sintoma` antes de abrir
- Veredito: (aberto)

## [quiz-no-dia-1] A resposta do onboarding deixa de consumir o dia, e a pergunta do dia 1 é oferecida
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: `abriu_quiz` por `origem` (pergunta contra ja-respondeu), e
  na `quiz_respostas`: de quem responde o onboarding, quantos respondem um
  quiz diário no mesmo dia e no dia seguinte.
- Tese BeSci: o dia 1 é o dia em que a pessoa está dentro do app por vontade
  própria, e era o único em que o quiz não rodava (achado do QA, 07/10). A =
  a resposta do onboarding carimbava o dia; a tela dizia "você já respondeu
  hoje" e o banco recusava a segunda resposta. B = a resposta do onboarding
  é estudo, não presença (`aoResponderOnboarding`): a pergunta do dia fica
  disponível, a folha ganha o botão "Responder a de hoje", o chip "Quiz"
  continua aceso, e a sequência nasce no primeiro quiz do dia. Índice do
  banco com a pergunta na chave.
- Decisão do dono em 08/10 ("vamos fazer o B. Implemente tudo"), entre os
  dois caminhos da proposta `o-quiz-do-dia-1-nunca-acontece.md`.
- Métrica: de quem responde o onboarding na semana, % que responde um quiz
  diário no mesmo dia ou no seguinte (`quiz_participacao` cruzada por
  `anon_id`); e `abriu_quiz` com `origem = ja-respondeu` no dia do
  onboarding tem de ir a zero · Duração: 4 semanas
- Aprovação: pedido do dono em 2026-10-08
- Início: 2026-10-08 na web (commit bd95618); **no app desde 18/10, com a
  3.2** (build 73) · Ler a partir de: **2026-11-01** (direcional) e
  **2026-11-15**, contadas da loja: as datas antigas (22/10 e 05/11) contavam
  da web, onde quase ninguém responde o quiz. A leitura separa por versão: na
  3.1 e antes o muro continua de pé.
- Antes (lido em 08/10 na `quiz_respostas`): de 332 aparelhos que
  responderam o onboarding, 0 responderam um quiz diário no mesmo dia (zero
  estrutural, escrito pelo índice), 4 no dia seguinte, 9 em qualquer dia
  depois. Nos últimos 30 dias: 316, 96 voltaram ao app, 5 fizeram o quiz.
- O índice antigo `(dia, anon_id)` caiu em 08/10 pelo clique do dono (lido
  no `pg_indexes` em seguida), e o ensaio em transação desfeita gravou as
  duas respostas da mesma pessoa no mesmo dia (onboarding e pergunta do dia)
  e recusou o segundo toque na mesma pergunta. As duas trancas estão
  abertas desde 08/10; a métrica da `quiz_respostas` vale a partir daí.
- Veredito: (aberto)

## [portao-unico-do-premium] Um portão só, que diz o que a pessoa ganha
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: `viu_paywall` → `iniciou_checkout`, por `ctx`; guarda:
  `perguntou_biela` por ativo na semana não pode cair.
- Tese BeSci: o app dizia "isso é pago" de seis jeitos (banner, card trancado,
  preview borrado, cadeado por item, card no fim do Início, caixa no chat) e
  nenhum dizia o que a pessoa ganharia. Perda sem nome não dói. A = isso. B =
  uma linha só em toda tela (`LinhaPremium`): rótulo "Premium", o título é o
  ganho, a linha de contexto é o que fica de fora no gratuito, a seta leva ao
  paywall com o mesmo `ctx` de antes. No Início, o card "Teste o Premium
  grátis" vira um bloco de três linhas (Biela sem limite, plano de revisão
  completo, histórico sem limite e relatório), cada uma com o seu `ctx`.
- Pedido do dono em 06/10: "dar mais destaque para o Premium, para o
  usuário entender o que está perdendo". Era a aposta 9 de
  docs/design/limpeza-visual-nubank.md, antecipada por decisão dele.
- TOCA O DEGRAU DE OUTRAS APOSTAS, dito no dia: `viu_paywall:home` passa a
  nascer de três linhas com `ctx` home, revisions e history, não de um card;
  `login-sabe-que-veio-comprar` lê esse degrau e a leitura dela separa por
  `ctx` a partir de hoje.
- Métrica: `viu_paywall` → `iniciou_checkout` por `ctx`, semana a semana;
  o `ctx` que converter muito acima dos outros diz onde o valor está ·
  Duração: 4 semanas
- Aprovação: pedido do dono em 2026-10-06
- Início: 2026-10-06 na web; no app desde 07/10, com a 3.1 (build 71) · Ler
  a partir de: 2026-10-20 (direcional) e 2026-11-03
- Antes: a ler no retrato de 07/10 (viu_paywall e iniciou_checkout por ctx
  nos 28 dias anteriores); não li antes de abrir, e fica dito
- MUDANÇA NO MEIO, anotada no dia (17/10/2026, Engenharia, decisão do dono):
  o limite grátis da Biela caiu de 5 para 3 perguntas por mês, no servidor,
  valendo para todas as versões. Mais gente chega ao Premium pela `origem`
  `biela` daqui em diante; a leitura de 20/10 separa antes e depois de 17/10.
  E o teste grátis passou a existir no Play no mesmo dia, o que muda o que
  acontece DEPOIS do toque em assinar.
- Veredito: (aberto)

## [landing-em-seis-blocos] A home tem uma promessa, o Biela em ação e a loja como único destino
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: o clique de loja na home (`clicou_baixar` com origem
  `home-topo:*` e `home-fim:*`). É o único degrau que a landing tem: o
  destino da página é a loja, por decisão do dono (12/09 e 04/10), e não há
  formulário.
- Tese BeSci: uma promessa só (a home tinha treze seções e um carrossel de
  três manchetes girando a cada cinco segundos; quem chega lê uma frase, não
  três em sequência) e prova pelo desfecho, não pelo recurso (lição 4 do CRO:
  as avaliações reais dizem "consegui economizar" e "tenho aprendido", e
  nenhuma elogia funcionalidade pelo nome). A = treze seções, carrossel, seis
  recursos, quatro passos, consultoria em três níveis, seis benefícios, FAQ de
  oito perguntas, três planos sem valor, e um celular desenhado mostrando
  "Trilha · Freios" que o app não tem mais. B = seis blocos: manchete única
  ("Saiba o que o carro tem antes de ir na oficina."), o Biela respondendo
  uma pergunta real na primeira dobra (como ele responde HOJE, em prosa),
  três ganhos, as duas avaliações da App Store com o texto inteiro e o nome,
  o preço uma vez (Grátis e Premium, com os valores em vigor), a chamada
  final com as lojas, rodapé. As animações ficam (cena da Biela no carro,
  aparecer das seções), por decisão do dono em 04/10; só o carrossel sai.
- INSTRUMENTO PRIMEIRO (régua 13): os selos de loja da home nunca gravaram
  evento no nosso funil. Os únicos `clicou_baixar` da base vinham do /baixar
  (4 na semana até 04/10: 2 `escolha`, 2 `play`). Entrou junto com a mudança
  o evento nos selos, com a origem dizendo de onde na página o clique saiu.
  Então o "antes" da home é ZERO por falta de instrumento, não por falta de
  clique; a primeira semana é o primeiro "antes" que existe, e a comparação
  honesta é entre semanas DEPOIS da mudança, por fonte de tráfego.
- O DENOMINADOR EXISTE, E É PEQUENO (corrigido em 04/10 à noite, depois de
  eu ter escrito que não existia). O painel de Analytics da Vercel está
  ligado e mostra, nos 7 dias até 04/10: 79 visitantes e 143 páginas vistas
  no site inteiro, e **28 visitantes na home (`/`)**; a maior fonte com nome
  é um site de portfólio de terceiro (10), depois Instagram (2) e Facebook
  (2). Lido do print do dono. A API (`count_pageviews`) responde "Web
  Analytics not found" para o mesmo projeto, e a hipótese, não provada, é
  que a leitura por API não vale no plano Hobby. ~~Enquanto for assim, o
  denominador se lê no painel.~~ DESFEITO na mesma noite: a hipótese do plano
  estava errada. A API responde ao token da credencial "Vercel" do n8n (30
  visitantes e 35 páginas na home em 7 dias, lidos às 17:46); o que não
  alcança é o token da integração do Claude. Desde 04/10 o denominador entra
  no retrato pela fonte `vercel_analytics` (fluxo "Analista de Dados: Vercel
  Web Analytics", 05:35), por caminho e, na home, por site de origem. Por
  `utm_source` a Vercel cobra (402 em 04/10: exige Enterprise ou o add-on
  Web Analytics Plus); a quebra por campanha desta aposta vem do funil, que
  carrega a etiqueta no `clicou_baixar`. Primeira coleta real, 04/10 às
  17:54: 28 visitantes e 31 páginas na home em 7 dias.
  Com 28 visitas por semana na home, qualquer taxa é direção: 3 cliques a
  mais mudam dez pontos. Para o tráfego pago há outro denominador: os
  cliques do Google Ads na campanha de busca, que voltou a veicular em 04/10
  apontando para a home com `utm_source=google`.
- TOCA O DEGRAU DE OUTRA COISA, dito no dia (regra de 02/10): a busca do
  Google voltou a veicular NO MESMO DIA, e manda tráfego novo para a home.
  Qualquer subida de clique na semana tem duas causas possíveis. A leitura
  separa por `utm_source` (o funil carrega a etiqueta): orgânico e direto de
  um lado, `google` do outro.
- Métrica: `clicou_baixar` com origem `home-*` por semana, cortado por
  `utm_source`, dividido pelos visitantes de `/` que o retrato traz na fonte
  `vercel_analytics` (`visitantesHome7d`) ·
  Duração: 4 semanas, e com a ressalva de que o volume é pequeno (28 visitas
  por semana na home, 4 cliques por semana no /baixar), então a leitura será
  direcional.
- Aprovação: aprovada pelo dono em 2026-10-04 ("Podemos fazer o que você
  sugeriu, daremos mais visibilidade ao biela")
- Início: 2026-10-04 · Ler a partir de: 2026-10-18 (direcional) e 2026-11-01
- Antes: home sem instrumento (zero por construção); /baixar 4 cliques na
  semana até 04/10; 28 visitantes na home em 7 dias (painel da Vercel)
- Veredito: (aberto)

## [convite-do-carro-nao-queima-com-convidado] O melhor momento do pedido para de ser gasto à toa
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: o portão de permissão de aviso, medido desde 19/09 pelos
  eventos `convite_aviso`, `aceitou_convite_aviso` e `permissao_aviso_concedida`.
- O NÚMERO QUE ABRIU ISTO, e ele responde a pergunta que ficou de 11/09: na
  janela medida, 28 aparelhos viram o convite, 7 aceitaram e 9 acabaram com
  permissão concedida, contra cerca de 367 que começaram o onboarding. Um em
  quatro aceita quando é convidado; o gargalo não é o convite, é quem chega a
  vê-lo.
- Tese BeSci: timing do pedido. O melhor instante para pedir a permissão é logo
  depois de cadastrar o carro, porque é o único em que a promessa é concreta e
  pessoal ("quando o SEU carro precisar de algo"). Esse pedido viaja numa marca
  de módulo que a garagem CONSOME ao montar, mas o convite só é desenhado para
  quem tem conta. Resultado: quem cadastra o carro como convidado queima a
  marca sem ver convite nenhum, e se criar a conta cinco minutos depois aquele
  momento já foi embora. E convidado é o caso comum: o app oferece "explorar
  sem cadastrar" e só pede a conta depois, com a folha "Salve sua garagem" em
  cima do mesmo cadastro de carro.
  - A mudança: a marca só é consumida quando existe conta para ver o convite.
    Sem conta, ela fica de pé e o convite aparece quando a conta chegar.
  - O que NÃO muda: as três travas do pedido continuam iguais (quatro dias
    entre convites, três na vida, nunca depois de um não do sistema), e o
    convidado continua sem receber dois pedidos ao mesmo tempo, porque sem
    conta nada é mostrado.
- Métrica: `convite_aviso` por semana, e a razão `aceitou_convite_aviso` sobre
  `convite_aviso`, que hoje é 7 de 28 · Duração: 4 semanas
- Aprovação: não se aplica (momento do pedido, sem variantes, sem tocar em
  preço, plano ou cobrança)
- Início: 2026-09-25 · Ler a partir de: 2026-10-23
- Antes: 28 convites, 7 aceites e 9 permissões concedidas na janela desde
  19/09. RESSALVA DE JANELA, na régua do critério 11: os quatro eventos subiram
  no código em 19/09 e só alcançaram as lojas com a 2.8, aprovada em 24/09.
  Então esses números vêm quase todos da web e de um dia de loja, e valem como
  PISO, não como retrato da base. Quem for ler o veredito confere antes quantos
  dias de loja a janela tem de verdade.
- Veredito: (aberto)

## [login-sabe-que-veio-comprar] Quem toca em assinar chega num login que explica
- Estado: FECHADO (inconclusivo por volume: 7 toques medidos, 3 contas)
- Tipo: mudanca-direta
- Alvo no funil: viu_paywall → iniciou_checkout. Na semana de 14/09: 11 viram o
  paywall e ZERO iniciaram checkout; na de 07/09, 25 e 2. Nos quatro grupos de
  variante dos dois testes de onboarding, `iniciou_checkout` não aparece
  nenhuma vez.
- O QUE FOI PROVADO NO NAVEGADOR (não é leitura de código): num aparelho sem
  conta, abrir o paywall pelo Início grava `viu_paywall:home`, e tocar em
  "Começar 7 dias grátis" leva à tela de entrar SEM gravar nada. A tela que
  recebe a pessoa diz "Salve sua garagem e cuide do seu carro de qualquer
  aparelho", que é a frase de quem está sendo convidado a criar conta, não a de
  quem acabou de pedir um teste grátis. Roteiro em
  `Subscribe.tsx`: seis caminhos de compra, todos com o mesmo
  `if (!user) { go auth }`.
- Tese BeSci: clareza do próximo passo, e é o mesmo princípio do "+" da garagem
  de 11/09. A pessoa disse sim para uma coisa e a tela seguinte fala de outra.
  Quem não entende por que está sendo parado desiste ali, e ninguém fica
  sabendo, porque esse passo não deixa rastro no funil. A mudança é a tela de
  entrar reconhecer de onde a pessoa veio: em vez da frase genérica, dizer que
  a conta é o passo que falta para começar o teste.
- Métrica: a honesta é indireta, e isto precisa estar dito. `iniciou_checkout`
  só nasce para quem JÁ tem conta, então esta mudança não move esse número por
  construção; o que ela pode mover é `cadastro` entre quem viu o paywall. É
  nível 1 e 2 na régua dos três níveis, nunca nível 3, porque não há variante
  comparável · Duração: 4 semanas
- Aprovação: não se aplica (texto, sem variantes, sem tocar em preço, plano ou
  cobrança)
- Início: 2026-09-18 · Ler a partir de: 2026-10-16
- Antes: 11 viram paywall e 0 iniciaram checkout na semana de 14/09; 57 e 9 na
  janela desde 22/08. Nenhum número separa "não quis" de "não tinha conta",
  e essa é a lacuna que fica registrada para quem for ler o veredito.
- **Veredito (2026-10-16): INCONCLUSIVO por volume, e agora com o número que
  faltava.** Instrumento: `funil_eventos` no banco do Mentorque, lido por
  consulta própria em 16/10 às 11h08 UTC. Segundo instrumento para o mesmo
  degrau: não existe, e isto fica declarado (o retrato publicado traz
  `viu_paywall` e `iniciou_checkout` somados, sem quebra por `origem` e sem o
  `tentou_assinar`).
  - **Nível 1, exposição: 7 aparelhos.** O `tentou_assinar`, que nasceu para
    contar exatamente quem é barrado pela conta, tem SETE eventos na vida, de 7
    aparelhos, o primeiro em 25/09 e o último em 15/10. Todos os 7 estão sem
    conta, o que é o desenho do evento. Todos vêm do app das lojas (5 Android,
    2 iPhone), nenhum da web, e todos em versão 2.8 ou acima, ou seja **100% da
    exposição medida é posterior à mudança**: não há braço "antes" nem haverá.
  - **Nível 2, desfecho: 3 dos 7 criaram a conta, os três no mesmo minuto do
    toque** (25/09 12h05, 27/09 21h45, 14/10 23h27). Os outros 4 nunca
    criaram conta, nem depois. Com sete pessoas, uma a mais ou a menos move
    isto de 43 para 57 ou 29 de cada 100: é anedota com denominador, não taxa.
  - **Nível 3: não existe, e já estava escrito no dia em que a aposta abriu.**
    Mudança direta, sem variante, e o `iniciou_checkout` não pode se mover por
    construção. O que o caderno previu, o dado confirmou.
  - O QUE O DADO ENTREGA DE GRAÇA, e não era a pergunta: **3 dos 7 toques têm
    `origem = oferta-exit25`**, a oferta de saída, e nenhum desses 3 criou
    conta. Os 4 toques vindos do paywall normal (`loja-annual`, `loja-monthly`)
    produziram 3 contas. Direção, com n de 3 e 4; fica registrado para quem
    mexer na oferta de saída, não como conclusão.
  - **O CUSTO DA RÉGUA 13, AGORA MEDIDO.** O retorno do dono de 18/09 disse que
    esta aposta abriu dentro de um ponto cego e que o instrumento devia ter ido
    primeiro. O preço exato: a aposta começou em 18/09, o `tentou_assinar`
    gravou o primeiro evento em 25/09, e quatro semanas de relógio renderam 7
    pessoas. Não foi a janela que faltou, foi o tamanho do degrau: 7 toques em
    três semanas não fecham veredito nenhum.
  - O que FICA: a tela de entrar continua dizendo do que a pessoa veio
    buscar, e isso se defende pelo argumento, como toda correção de clareza.
    A conferência de 18/09 em `scripts/navegador/venda.mjs` continua cobrando
    os dois lados da fronteira.
  - NÃO REABRE por janela. Só volta a poder dizer algo se o degrau crescer:
    com 7 toques em três semanas, esperar mais quatro semanas daria 10.
- Estado final: FECHADO em 2026-10-16.

## [cadastro-em-duas-etapas] O formulário do carro pede só marca, modelo e ano
- Estado: FECHADO (venceu B, promovida em 02/10/2026)
- Tipo: teste-ab
- Alvo no funil: abriu_cadastro_de_carro → cadastrou_carro. Na loja
  (Android e iPhone), de 04 a 12/09: 19 abriram, 3 cadastraram. É a maior
  quebra do produto depois do onboarding, e sem carro não existe calendário,
  saúde nem aviso.
- Tese BeSci: fricção e efeito de progresso (pedir o micro antes do macro).
  A = o formulário de sempre: tipo, busca de marca e modelo, ano, versão ou
  motor, km e foto, tudo numa tela. B = só tipo, marca, modelo e ano; o
  botão salva assim que os três existem, e km, motor e foto viram a barra
  "Diagnóstico do carro: n de 5" na tela do carro, que também pede data de
  compra e quiz de saúde, com o que cada dado destrava. A barra aparece
  para as duas variantes; o que muda é só o tamanho do formulário.
- Métrica: taxa abriu_cadastro_de_carro → cadastrou_carro por variante
  (view experimentos_resultados), no app das lojas · Duração: 2 semanas, ou
  até 40 aberturas por variante
- Aprovação: aprovada pelo dono em 2026-09-12 ("Vamos aplicar todos os
  testes propostos")
- Início: 2026-09-12 na web; nas lojas, com a 2.5 · Ler a partir de: 2 semanas
  depois de a 2.5 estar nas duas lojas
- Antes: 3 de 19 na loja (16%); 8 de 13 na web
- Nota de 12/09: o sorteio mudou no mesmo dia, horas depois de este teste
  entrar. O hash antigo dava a mesma variante deste teste e do
  `onboarding-curto` para 100% dos aparelhos (os dois seriam um só); a
  mistura final em `lib/app/sorteio.ts` corrige e `conferir:funil` mede.
  Quem foi sorteado na web nessas horas pode ter trocado de variante; é
  gente de menos para pesar, e a leitura de verdade começa com a 2.5.
- Leitura parcial de 2026-09-18, e NÃO é veredito: pela régua dos três níveis
  isto é nível 3 (há variante comparável), mas a amostra está em um quarto do
  alvo. Abriu o cadastro: 10 em A e 10 em B. Cadastrou: **3 em A, 5 em B**. A
  direção favorece B, e é só direção: duas pessoas de diferença com dez por
  braço viram qualquer porcentagem que se queira. O critério de parada do
  próprio experimento é 40 aberturas por variante, e a data de leitura é duas
  semanas depois de a 2.5 estar nas duas lojas, o que aconteceu por volta de
  15/09. Não fecha hoje, e fechar hoje seria o erro que o aviso de leitura
  abaixo existe para impedir.
- **Veredito (2026-10-02): FUNCIONOU.** É o primeiro FUNCIONOU do caderno, e
  ele tem o nível 3 que a régua exige.
  - Quem abriu o formulário: **173 em A e 173 em B**, denominador idêntico, o
    que já é sinal de que o sorteio dividiu direito. Quem cadastrou o carro:
    **78 em A (45 de cada 100) e 108 em B (62 de cada 100)**.
  - São 30 pessoas de diferença com 173 por braço. A diferença é de cerca de
    17 pontos com erro padrão de pouco mais de 5, ou seja, mais de três vezes
    o erro: não é ruído. E a amostra passou com folga o critério de parada do
    próprio experimento, que era 40 aberturas por variante.
  - RESSALVA HONESTA: a métrica pedia a leitura separada da loja, e o retrato
    entrega loja e web somadas. Isso não derruba a comparação, porque o
    sorteio é por aparelho e aleatório, então a mistura de plataforma cai nos
    dois braços igual (os denominadores iguais apoiam isso). O que fica sem
    resposta é ONDE funcionou melhor, não SE funcionou.
  - CONSEQUÊNCIA, feita na mesma rodada: a variante B virou o padrão e o
    experimento SAIU do código, como manda a regra. O formulário de cadastro
    pede marca, modelo e ano; o resto segue na barra "Diagnóstico do carro".
- Estado final: FECHADO, vencedora promovida em 02/10/2026.

> **AVISO DE LEITURA, posto em 15/09/2026.** As quatro apostas da rotina do
> carro (caderno de gastos, datas, resumo mensal, modo motorista) estão no ar
> NA WEB desde 13/09 e a adoção medida hoje é **zero em tudo**: 0 de 30 contas
> com abastecimento, 0 com data do carro, 0 com o modo motorista. Isso NÃO é
> veredito, é falta de exposição, e confundir os dois seria matar quatro
> apostas boas sem teste. Os motivos, nesta ordem: as quatro só chegam às
> lojas com a 2.6, que ainda não foi enviada, e é lá que estão as pessoas; e
> na web quem chega vem do anúncio, cai no /app e 95% não termina o
> onboarding (docs/utms.md). **O relógio de cada uma começa no dia em que a
> 2.6 for aprovada, não em 13/09.** Ao ler qualquer uma delas, primeiro
> conferir a data de aprovação da 2.6 e somar as semanas a partir dali.

## [caderno-de-gastos] O abastecimento em três toques, com custo por km na hora
- Estado: ABERTO
- Tipo: mudanca-direta
- Alvo no funil: a rotina. Hoje "voltou" é qualquer abertura, e 11 de 253
  voltaram algum dia. A régua nova é "pessoas com lançamento em duas
  semanas seguidas", que não existe ainda (zero, por construção).
- Tese BeSci: compromisso e consistência. O problema do carro é episódico;
  o dinheiro do carro é semanal. Um lançamento de três campos (valor,
  litros, km) devolve na hora custo por km, consumo e gasto do mês, e
  carimba o km, que é o dado que mais falta no calendário. Card "Custo do
  carro" no Início, abaixo do card do carro; folha de abastecimento;
  histórico com a etiqueta. Grátis (decisão do dono, 13/09). Onde cada
  coisa entra e por quê: docs/agentes/propostas/rotina-do-carro.md.
- Métrica: pessoas com abastecimento em duas semanas seguidas; idade média
  do km carimbado · Duração: 4 semanas
- Aprovação: aprovada pelo dono em 2026-09-13 ("vamos fazer o que você
  propôs")
- Início: 2026-09-13 na web; nas lojas, com a 2.6 · Ler a partir de:
  2026-10-11
- Antes: zero lançamentos (a peça não existia); km carimbado com mais de
  30 dias na maioria dos carros
- Veredito: (aberto)

## [datas-do-carro] IPVA, licenciamento, seguro e CNH no calendário, com aviso
- Estado: ABERTO (web desde 13/09; lojas com a 2.6)
- Tipo: mudanca-direta
- Alvo no funil: avisos ligados (3 de 28 contas) e retorno no mês de um
  vencimento.
- Tese BeSci: aversão à perda com honestidade (multa e juros são reais).
  As datas entram no calendário de revisões que já existe, no card
  "Diagnóstico do carro" como passo, no Início só a 30 dias do vencimento,
  e viram avisos locais em 30, 7 e 1 dia. Lugar e razão:
  docs/agentes/propostas/rotina-do-carro.md.
- Métrica: avisos ligados por origem `datas`; abertura no mês de
  vencimento contra os outros meses · Duração: um ciclo de IPVA (janeiro
  a março) para a leitura forte; 4 semanas para a fraca
- Aprovação: aprovada pelo dono em 2026-09-13
- Início: 2026-09-13 na web; nas lojas, com a 2.6 · Ler a partir de:
  2026-10-11
- Antes: nenhuma data cadastrável; avisos ligados em 3 de 28 contas
- Veredito: (aberto)

## [resumo-mensal] O mês do carro fechado, por e-mail, push e no Início
- Estado: ABERTO (web desde 13/09; o card do Início nas lojas com a 2.6)
- Tipo: mudanca-direta
- Alvo no funil: retorno nos três dias depois do envio.
- Tese BeSci: efeito de progresso (o mês fechado é um marco). Chave `mes`
  na jornada no dia 1, só para quem tem lançamento ou data; card no Início
  na primeira semana. Lugar e razão: docs/agentes/propostas/rotina-do-carro.md.
- Métrica: abertura nos 3 dias seguintes ao envio contra a média; saídas
  da jornada · Duração: 2 meses
- Aprovação: aprovada pelo dono em 2026-09-13
- Início: 2026-09-13 (primeiro envio possível em 01/10) · Ler a partir de: dois envios
- Antes: a jornada não tem resumo; o e-mail `km` é o mais perto disso
- Veredito: (não começou)

## [modo-motorista-de-app] Ganhou, custou, sobrou: a conta do dia de quem trabalha com o carro
- Estado: ABERTO (web desde 13/09, como modo; lojas com a 2.6; o público principal segue decisão do dono)
- Tipo: mudanca-direta
- Alvo no funil: uso diário de um público que a ficha já mira.
- Tese BeSci: clareza do próximo passo (a conta que decide se a corrida
  valeu). Interruptor no Perfil; o card "Custo do carro" vira "hoje:
  ganhou, custou, sobrou"; lucro por km no resumo mensal. Lugar e razão:
  docs/agentes/propostas/rotina-do-carro.md.
- Métrica: pessoas com o interruptor ligado e lançamento em cinco dias de
  uma semana · Duração: 4 semanas
- Aprovação: aprovada pelo dono em 2026-09-13; a decisão de público fica
  pendente
- Início: 2026-09-13 · Ler a partir de: 2026-10-11. Como ler: contas com
  `motoristaDeApp = true` no `user_state`, e dias distintos com evento
  `lancou_ganho` por semana; a régua é cinco em sete
- Antes: nenhum dado de ganho; custo por km só de serviços, no Premium
- Veredito: (não começou)

## [onboarding-curto] O onboarding tem três páginas, não cinco
- Estado: ABERTO
- Tipo: teste-ab
- Alvo no funil: comecou_onboarding → terminou_onboarding. Desde 04/09: web
  184 → 41 (22%), Android 45 → 28 (62%), iPhone 9 → 9. Na loja, 4 em 10
  desistem dentro das páginas de apresentação, antes de ver o produto.
- Tese BeSci: fricção (cinco páginas de promessa, nenhuma de entrega) e a
  prova social inventada que não convence (aprendizado de 04/09: prova
  pequena e conferível ganha da grande e inventada). A = as cinco páginas
  de sempre: três cards de apresentação, prova social e a última página.
  B = três páginas: um card com a dor ("Carro dá prejuízo em silêncio"),
  um com como resolve (calendário, preço justo, Biela) e a última página,
  que é a mesma da A (o carro no Android, o teste onde vende). A prova
  social fica de fora da B. Nada muda no que acontece depois do onboarding.
- Métrica: taxa comecou_onboarding → terminou_onboarding por variante (view
  experimentos_resultados), separando loja e web; e, como segunda leitura,
  comecou_onboarding → cadastrou_carro, porque um onboarding mais curto que
  entrega gente que não cadastra o carro não vale nada · Duração: 2 semanas,
  ou até 40 começos por variante na loja
- Aprovação: aprovada pelo dono em 2026-09-12 ("Vamos aplicar todos os
  testes propostos")
- Início: 2026-09-12 na web; nas lojas, com a 2.5 · Ler a partir de: 2 semanas
  depois de a 2.5 estar nas duas lojas
- Antes: Android 62%, iPhone 100% (9 pessoas), web 22%
- **Veredito (2026-10-02): INCONCLUSIVO, e ele continua rodando.** O degrau do
  meio favorece B, o degrau que decide está empatado, e é esse o desenho.
  - Terminar o onboarding: **181 de 302 em A (60 de cada 100) e 218 de 325 em
    B (67 de cada 100)**. Sete pontos de diferença com erro padrão de perto de
    4, ou seja, menos de duas vezes o erro. Direção a favor de B, sem força
    para fechar.
  - Cadastrar o carro, que é a segunda leitura e a que decide: **94 de 302 em A
    e 92 de 325 em B**. Empate. O texto desta aposta já dizia, quando foi
    escrita, que "um onboarding mais curto que entrega gente que não cadastra o
    carro não vale nada". Foi exatamente o que aconteceu: B passa mais gente
    pela apresentação e entrega o mesmo número de carros.
  - POR QUE NÃO FECHO E NÃO PROMOVO NINGUÉM: duas razões, e a segunda é do
    dono. A primeira é que inconclusivo com amostra crescendo é o caso em que
    esperar é a decisão certa. A segunda é que promover B apagaria a página de
    prova social do onboarding, que é a página que o dono decidiu MANTER em
    01/09; o veredito de um teste não é o lugar de desfazer uma decisão dele
    pela porta de trás. Qual das duas vira padrão é pergunta para ele, e está
    no artifact.
  - Ressalva que continua: o retrato soma loja e web, e o desenho pedia as
    duas separadas. A randomização protege a comparação; o que falta é saber
    onde.
- **NOTA DE 2026-10-16, e ela muda o PESO da escolha que está com o dono, não a
  escolha.** A segunda razão de 02/10 para não promover B era que B apaga a
  página de prova social, e aquela página tinha prova inventada que o dono
  havia decidido manter em 01/09. Desde 04/10 e 06/10 ela não tem mais nada
  inventado: nota 5,0 real, dois números com piso declarado e quatro
  depoimentos literais de avaliações públicas (ver
  `prova-social-de-verdade`). Ou seja, promover B agora apagaria uma página
  VERDADEIRA, e o aprendizado de 04/09 diz que prova pequena e conferível é a
  que funciona. A decisão continua sendo dele; o que mudou é que o lado A
  ficou mais defensável do que era em 02/10.
- Ler de novo a partir de: 2026-10-23



## [cta-teste-por-plano] O botão do teste diz o que o clique faz
- Estado: FECHADO
- Tipo: mudanca-direta
- Alvo no funil: cadastro → viu paywall → iniciou checkout
- Tese BeSci: o CTA da última página do onboarding dizia sempre
  "Continuar", fosse qual fosse o plano. Para quem escolheu o anual isso
  escondia o teste grátis que a pessoa acabou de montar; para quem escolheu
  o mensal escondia que o clique cobra na hora. Nomear o benefício exato no
  instante da decisão (especificidade + enquadramento de ganho) responde o
  medo de "o que acontece se eu apertar". Agora mostra "Começar teste
  grátis" no anual e "Assinar agora" no mensal.
- Métrica: taxa cadastro → iniciou_checkout · Duração: 4 semanas
- Aprovação: não se aplica (mudança direta, sem variantes)
- Início: 2026-08-23 · Ler a partir de: 2026-09-20
- Antes: série do funil nasceu em 23/08, sem base anterior. Leitura será
  contra as semanas seguintes, sem comparação retroativa.
- **Veredito (2026-09-25): INCONCLUSIVO, e não por falta de volume.** Este
  experimento nasceu sem como ser fechado, e isso é o aprendizado dele.
  - O número que existe: cadastro → iniciou_checkout está em 12 de 73 na janela
    desde 22/08. Não há "antes": a série do funil nasceu no mesmo dia da
    mudança, então não existe período comparável, e como é mudança direta
    também não existe variante. Pela régua dos três níveis isto é nível 2, e
    nível 2 nunca sustenta FUNCIONOU nem NAO FUNCIONOU.
  - Pior que isso: a tela onde ele vive mudou duas vezes desde então, por dois
    testes A/B aprovados em 12/09. O `onboarding-curto` tira páginas do mesmo
    fluxo e o `onboarding-termina-no-carro-android` TROCOU a última página no
    Android, que é exatamente onde este CTA estava. O efeito do CTA e o efeito
    dos dois testes estão somados e não têm como ser separados.
  - E o degrau de chegada subconta por construção: o `iniciou_checkout` só
    nasce para quem já tem conta (achado de 18/09). O `tentou_assinar` que
    conserta isso subiu em 18/09, quase um mês depois desta mudança.
  - O que FICA: a mudança continua no código e não há motivo para desfazer.
    Nomear o que o botão faz é correção de clareza, não aposta: "Começar teste
    grátis" no anual e "Assinar agora" no mensal descreve o que acontece, e
    isso se defende sem número.

## [fim-do-lembrete-falso] Promessa de aviso vira controle de cancelamento
- Estado: FECHADO (reabrir para leitura depois de 01/10)
- Tipo: mudanca-direta
- Alvo no funil: confiança no fundo do funil (checkout → assinou) e churn
- Tese BeSci: o interruptor "Lembrar antes do teste terminar" (onboarding e
  perfil) não agendava aviso nenhum, era estado morto; o projeto nem tem
  plugin de notificação. Prometer aviso e não avisar produz cobrança
  surpresa, pedido de reembolso e avaliação de uma estrela. O elemento
  existia para acalmar o medo de ser cobrado sem perceber, então passou a
  responder esse medo pelo lado do CONTROLE, que é verdadeiro: "Cancele
  quando quiser pelo Perfil, sem falar com ninguém".
- Métrica: avaliações citando cobrança e churn no primeiro ciclo
- Aprovação: não se aplica (correção de promessa falsa)
- Início: 2026-08-23 · Ler a partir de: 2026-09-20
- Antes: sem avaliações nas lojas ainda
- **Veredito (2026-09-25): INCONCLUSIVO, porque o risco que ele previne ainda
  não pôde acontecer.**
  - A métrica era avaliações citando cobrança e churn no primeiro ciclo. Hoje:
    12 avaliações, todas cinco estrelas, NENHUMA citando cobrança; zero
    cancelamentos; coortes de assinante 08/01 e 09/01 com 0 saídas.
  - Só que a primeira cobrança de verdade é 01/10. Nenhum assinante chegou ao
    fim do teste com dinheiro saindo, então "ninguém reclamou de cobrança
    surpresa" é a ausência do EVENTO, não a prova de que o conserto evitou
    alguma coisa. Pela régua dos três níveis, nível 1.
  - Reabrir para leitura depois de 01/10, quando as três cobranças de R$ 29,90
    tiverem acontecido. Aí a mesma métrica passa a poder dizer algo.
  - O que FICA: o interruptor que prometia aviso sem agendar nada saiu, e o
    texto de controle ("Cancele quando quiser pelo Perfil") continua no
    código e é verdadeiro. Como correção de promessa falsa, ela se sustenta
    sem número.
- **RELEITURA de 2026-10-02, a que ficou marcada para depois de 01/10, e a
  notícia é dura.** A primeira cobrança real passou em 01/10 (ciclo adiantado
  e status `active`, medido no banco pelo QA). E das TRÊS assinaturas pagantes
  que o produto teve, as três cancelaram: o retrato de hoje mostra 2 ativas
  com 2 cancelamentos agendados, e as coortes de assinante mostram 1 saída na
  de 01/09 e 2 na de 08/01.
  - O que o número NÃO diz, e é o mais importante: por que cancelaram. As três
    entraram com cupom de 100% do primeiro mês, então a primeira cobrança de
    verdade foi a primeira vez que o produto pediu dinheiro a elas. Cancelar
    quando o mês de graça acaba é o comportamento clássico de coorte de cupom,
    e não tem como ser separado do efeito desta aposta com n igual a 3.
  - A metade da métrica que ERA desta aposta: zero avaliações citando
    cobrança, zero reclamação de cobrança surpresa, nenhuma nota de uma
    estrela (são 12 avaliações, todas cinco). O medo que ela existia para
    evitar não apareceu. E o lado do controle funcionou no sentido literal:
    as três acharam o caminho de cancelar e usaram, sem precisar falar com
    ninguém, que era exatamente o que o texto prometia.
  - **Veredito final: INCONCLUSIVO para o efeito, com n igual a 3 e coorte de
    cupom.** Não reabre mais: três pessoas nunca vão fechar esta pergunta.
    Ela só volta se houver coorte pagante que não venha de cupom.
  - FICA REGISTRADO como fato de negócio, separado desta aposta: **100% da
    primeira coorte pagante cancelou na virada para dinheiro.** Isso é assunto
    do Diretor e do dono, não deste caderno, e é o número mais importante da
    semana.
- Acompanhamento 2026-08-28: o interruptor VOLTOU em 25/08 com plugin nativo
  de verdade atrás dele, e mesmo assim a promessa continuou falsa, por outro
  motivo (o plugin nunca carregava; ver lembrete-que-chega). Ou seja: entre
  23/08 e 28/08 o app esteve nos dois estados que este experimento queria
  evitar. A leitura de 20/09 só vale se a correção de hoje estiver num build
  publicado; antes disso, o "depois" ainda não existiu.

## [lembrete-que-chega] O lembrete que estava mudo passa a sair de verdade
- Estado: FECHADO (conserto confirmado, efeito inconclusivo)
- Tipo: mudanca-direta
- Alvo no funil: retorno da coorte (retenção, voltaram_d1_7) e, de tabela, a
  passagem iniciou_checkout → assinou, porque o aviso de fim de teste é o que
  evita a cobrança surpresa que vira reembolso e nota uma estrela.
- Tese BeSci: o app não tem push, então o ÚNICO caminho de volta que não
  depende da pessoa lembrar sozinha é o lembrete local (quiz do dia às 9h e
  fim do teste grátis). Esses dois avisos são a máquina de hábito inteira do
  Mentorque hoje, e nenhum deles saía: o carregamento do plugin ficava
  pendente para sempre, sem erro na tela. O efeito prático era pior que não
  ter lembrete, porque o app OFERECIA o aviso: o interruptor do Perfil não
  reagia ao toque e o convite depois do quiz nunca aparecia. Princípio em
  jogo: efeito de progresso (a sequência do quiz só puxa de volta se alguém
  lembrar dela) apoiado em clareza do próximo passo. Nada de copy mudou aqui;
  o que mudou é que a promessa passa a ser cumprida.
- Métrica: (1) erros `.then()` em app_erros voltam a zero; (2) existir
  aparelho com permissão concedida, que hoje é impossível por construção;
  (3) voltaram_d1_7 das coortes de cadastro a partir do build corrigido ·
  Duração: 4 semanas contadas do build publicado, não de hoje
- Aprovação: não se aplica (mudança direta, sem variantes)
- Início: 2026-08-28 · Ler a partir de: 2026-09-26, e só se a correção já
  estiver num build nas lojas (a 1.1 está em revisão; isto sai na 1.2 ou na
  seguinte). Sem build publicado, o veredito é INCONCLUSIVO por falta de
  "depois", não por falta de volume.
- Antes: zero avisos agendados em qualquer aparelho desde que o recurso
  nasceu; 5 erros em 7 dias em app_erros (3 iOS, 2 Android), todos
  `"LocalNotifications.then()" is not implemented`; uso.coortes vazio no
  retrato, então a régua de retenção também não tem linha para comparar.
- **Veredito (2026-10-02): a correção está CONFIRMADA, o efeito na retenção é
  INCONCLUSIVO, e as duas metades precisam ser ditas separadas.**
  - Métrica (1), erros `.then()` de volta a zero: CUMPRIDA. Não há uma única
    ocorrência nova; os relatos de erro de hoje são outros (app fechando na
    abertura e desistência de login).
  - Métrica (2), existir aparelho com permissão concedida: CUMPRIDA, e agora
    com número, porque a instrumentação do portão subiu em 19/09. São 10 e 11
    aparelhos com `permissao_aviso_concedida` nos dois braços medidos. Antes
    desta correção era impossível por construção, então aqui o conserto está
    provado: a máquina que estava muda passou a poder falar.
  - Métrica (3), retorno das coortes: INCONCLUSIVO. As coortes que poderiam
    mostrar isso estão marcadas como AINDA NAO DA PARA LER no retrato, e as
    duas fechadas que existem mostram 0 de 16 e 1 de 11. Não há braço
    comparável (é mudança direta), então nível 3 não existe para esta metade.
  - A pergunta de 04/09 sobre o app fechar no quiz NÃO se confirmou contra o
    plugin: os fechamentos de hoje são na abertura e na Home, e a investigação
    do QA seguiu outro caminho. Fica registrado que não se confirmou, não que
    foi descartado.
  - O que isso ensina, e é o aprendizado: aposta de CONSERTO fecha quando a
    máquina volta a funcionar, e aposta de EFEITO fecha com comparação. Juntar
    as duas numa só aposta produz um veredito que não cabe numa palavra.
- Estado final: FECHADO em 02/10/2026.
- Acompanhamento 2026-09-04: a condição de leitura foi CUMPRIDA. A correção de
  28/08 saiu na 1.5 (31/08) e na 1.6 (01/09), então o relógio das 4 semanas
  começou de verdade e a leitura passa a valer a partir de 28/09. Métrica (1)
  já responde: os erros `.then()` do retrato caíram de 12 (02/09) para 7
  (04/09) sem nenhuma ocorrência nova, que é o desenho de uma janela de 7 dias
  esvaziando. A rodada do QA de 02/09 conferiu a versão de cada um: todos da
  1.2.0, o último em 29/08, anterior ao conserto. Métricas (2) e (3) seguem sem
  resposta. E entrou uma pergunta nova que esta métrica não previa: em 02/09
  chegou relato de app FECHANDO ao responder o quiz no Android, e o suspeito
  sem prova é justamente o plugin de notificação, que só voltou a ser chamado
  de verdade por causa deste conserto. Se a suspeita se confirmar, o veredito
  desta aposta tem que contar os dois lados, não só o lembrete que passou a
  sair. Investigação em docs/qa/app-fecha-no-quiz.md.

## [limite-de-carros-com-aviso] O "+" da garagem diz que o próximo passo é o Premium
- Estado: FECHADO (inconclusivo, por exposição: 6 contas com dois carros ou mais em 09/10, nenhuma Premium, 0 assinaram; PISO)
- Nota de Engenharia (09/10, retorno do dono): o denominador existia em
  `user_state`, o mesmo instrumento do `estadoDaBase`. Lido em 09/10: de 201
  contas com estado, 6 têm dois carros ou mais e 1 tem três. Só essas 6 veem o
  aviso do "+". O veredito fica inconclusivo pelo critério 3 da régua
  (atividade zero lida como exposição), não por métrica de ausência.
- Tipo: mudanca-direta
- Alvo no funil: não é um degrau do funil de venda, é a confiança na tela de
  garagem. O que se espera mover é a volta de quem tem mais de um carro, e o
  que NÃO se quer é ganhar visita de paywall às custas de gente irritada.
- Tese BeSci: hoje, quem já tem os 2 carros do plano grátis toca no "+" da
  garagem esperando um formulário e cai direto no paywall, sem uma palavra de
  explicação. Isso é o oposto de clareza do próximo passo: o controle não diz o
  que faz, e a tela que aparece parece emboscada em vez de oferta. A regra da
  casa para copy vale para botão também: um controle diz exatamente o que vai
  acontecer. A mudança é dizer ANTES, na própria garagem, que o plano grátis
  guarda 2 carros e que adicionar outro passa pelo Premium. O destino continua
  o mesmo; o que muda é a pessoa saber onde está pisando.
  - Por que agora, e é a novidade da semana: 3 das 8 avaliações são de
    EMPRESA usando o app para frota ("controle de frota", "os carros aqui da
    clínica"). Esse é o perfil que bate nessa parede primeiro e é também o que
    tem mais motivo estrutural para voltar. Tratar mal a parede dele é caro.
  - O que NÃO muda, de propósito: o limite (2 carros, `LIMITS.freeCars`), o
    preço, o plano e o conteúdo do paywall. Preço e plano são do dono, e o
    paywall tem experimento aberto em outra área.
- Métrica: qualitativa e honesta, porque não existe evento nesta tela. O que se
  observa é avaliação ou mensagem de suporte reclamando de "achei que ia
  cadastrar e caiu na assinatura", que hoje é o desfecho previsível, e a
  ausência disso é o sinal · Duração: até a próxima leitura de avaliações
- Aprovação: não se aplica (texto e ênfase, sem variantes, sem tocar em plano)
- Início: 2026-09-11 · Ler a partir de: 2026-10-09
- Antes: nenhuma explicação em tela; o toque no "+" navega para o paywall com
  `ctx: "cars"`. O evento `viu_paywall` guarda a origem, então a quebra por
  `cars` EXISTE no banco, mas o retrato publicado não a mostra: o que ele traz
  é o total da semana (15 vistas, todas as origens juntas). Quem for fechar
  este veredito pede a quebra por origem em vez de repetir o total.
- **Veredito (2026-10-09): INCONCLUSIVO, e a culpa é de quem escreveu a
  métrica, ou seja, minha.** Ela era ausência de reclamação, e ausência não
  fecha veredito. É o mesmo erro que eu descrevi na skill em 02/10 ("aposta que
  nasce sem como ser fechada não é aposta, é correção"), cometido três semanas
  antes de eu nomear a regra.
  - O que o dado diz: 12 avaliações, todas cinco estrelas, nenhuma citando
    paywall, assinatura ou "achei que ia cadastrar". Zero reclamações.
  - Por que isso não vale como prova: não sei quantas pessoas chegaram a bater
    na parede. São 175 contas com carro em 212, mas o retrato não diz quantas
    têm DOIS carros, que é a condição para o aviso aparecer. Sem denominador,
    zero reclamação pode ser "a mudança funcionou" ou "ninguém passou por ali",
    e as duas coisas parecem idênticas.
  - O que FICA: a mudança continua no código e não há motivo para desfazer.
    Dizer antes do toque que o plano grátis guarda 2 carros é correção de
    clareza, e correção se defende pelo argumento. Ela também já tem
    conferência de navegador própria, feita na mesma rodada.
  - O que PODERIA fechar, se alguém quiser retomar: a quebra de `viu_paywall`
    por origem (`cars`) contra as outras origens, que existe no banco e não
    aparece no retrato. Com ela, dá para ver se a visita de paywall vinda da
    garagem cheia cresceu, caiu ou ficou igual.
- Estado final: FECHADO em 2026-10-09.

## [onboarding-termina-no-carro-android] A última página do onboarding é "Cadastrar meu primeiro carro"
- Estado: FECHADO (inconclusivo por falta de braço comparável)
- Tipo: mudanca-direta, só no Android
- Alvo no funil: a maior quebra que existe, `comecou_onboarding` para
  `cadastrou_carro`. Nos 28 dias até 10/09, por aparelho: Android 59 começaram
  e 4 cadastraram; iPhone 12 e 2; web 148 e 4. A queda é de mais de 90% nas
  três, e o Android é onde há volume para ler.
- Tese BeSci: o onboarding terminava numa página de plano (teste grátis)
  antes de a pessoa ter visto o produto, e o "Agora não" jogava na Home
  vazia. Duas quebras de clareza do próximo passo numa tela só: pedir
  compromisso antes de entregar valor, e não dizer o que fazer a seguir. A
  mudança (pedido do dono, 11/09): no Android a última página vira "Cadastre
  o seu primeiro carro", e o botão abre direto o formulário. A página de
  plano sai do onboarding; o paywall continua onde já estava (banner,
  recursos trancados, o "+" da garagem cheia).
  - Por que só no Android: foi o pedido, e vira a comparação. iPhone e web
    seguem com a página de plano, então a diferença entre plataformas na
    mesma janela é a leitura mais próxima de um A/B que a base permite.
  - O que NÃO muda: preço, plano, limite, o paywall em si.
- Métrica: por aparelho e por plataforma, na mesma janela,
  `abriu_cadastro_de_carro / comecou_onboarding` e
  `cadastrou_carro / comecou_onboarding`. Mais `terminou_onboarding` com
  origem `carro` (novo) contra `agora-nao`. Sem casa decimal · Duração mínima
  de leitura: 2 semanas depois de a 2.4 estar na Play
- Aprovação: pedido do dono em 2026-09-11
- Início: 2026-09-12 (2.4 aprovada na Play) · Ler a partir de: 2026-09-26
- Antes: Android, 28 dias até 10/09, 59 começaram, 4 cadastraram carro
  (aparelhos)
- **Veredito (2026-10-02): INCONCLUSIVO, e não por falta de tempo: a
  comparação que ele foi desenhado para permitir não existe mais.**
  - A ideia era comparar Android (sem página de plano) contra iPhone e web (com
    ela) na mesma janela. Só que a base virou Android quase pura: dos 284
    aparelhos ativos, **266 são Android, 10 são iPhone e 8 são web**. Dez
    aparelhos não formam braço de comparação para nada.
  - O degrau alvo MELHOROU muito, e isso é fato: `comecou_onboarding` para
    `cadastrou_carro` está em 197 de 871 na janela do funil, perto de 23 de
    cada 100, contra os 4 de 59 do Android no "antes" (7 de cada 100).
  - Só que esse ganho tem pelo menos quatro donos possíveis na mesma janela: a
    página de plano saindo do onboarding (esta aposta), o formulário curto
    (que tem A/B próprio e venceu), o `onboarding-curto`, e o conserto do
    certificado que fez o cadastro do Android funcionar em 10/09. Um deles tem
    prova isolada; esta aposta não tem.
  - Fica a lição de desenho: experimento que depende de uma plataforma servir
    de controle morre quando a distribuição da base muda. A distribuição não é
    nossa para controlar, então controle de plataforma não é controle.
- Estado final: FECHADO em 02/10/2026, sem crédito atribuído.

## [prova-social-de-verdade] As avaliações reais entram no lugar das inventadas
- Estado: FECHADO (aprovada e aplicada pelo dono em 04/10 e 06/10, fora de rodada)
- **DESFECHO, escrito em 2026-10-16, e eu carreguei esta proposta como
  "aguardando o dono" por 42 dias depois de ela já ter sido atendida.** Lido no
  fonte (`lib/app/content.ts`, bloco `onboarding.social`) e nos comentários
  datados que a própria mudança deixou:
  - Em **04/10 o dono decidiu sim** ("pode alterar tudo que sugeriu") e os três
    números inventados saíram: "4,8" virou **5,0 com a nota real das lojas**,
    "10.000+ diagnósticos" virou **170+** (178 `consultou_sintoma` gravados
    desde 13/09, piso declarado) e "5.000+ motoristas" virou **250+** (254
    aparelhos Android instalados em 25/09, pelo relatório do Play).
  - Dos depoimentos, ele decidiu diferente do que a proposta pedia, e melhor:
    em vez de reduzir de quatro para dois, mandou manter quatro e trocar os
    inventados por reais ("aproveitar somente 2, esses 2 reais, e o restante
    mantém"). Em **06/10 os quatro passaram a ser reais**: aminoru e munizluiz
    da App Store, Triplyze e Luana David do Google Play, trechos literais com
    o apelido público de quem escreveu.
  - A RESSALVA DA PROPOSTA FOI RESPEITADA SEM EU PEDIR: a avaliação
    `Moraes455`, que parece ser do próprio dono, não entrou em nenhuma das
    quatro.
  - O QUE SOBROU, e já está na lista do dono desde 16/10 por outra mão (a
    Engenharia, conferindo as fichas): **as capturas de tela das duas lojas
    ainda mostram 4,8, 10.000+ e 5.000+**, a Play com quatro depoimentos
    inventados com nome. A promessa sem lastro saiu do app e ficou na vitrine
    que recebe o tráfego pago. Não repito o pedido aqui, pela regra de 04/10:
    o instrumento já responde e a linha já existe.
  - LIÇÃO DE PROCESSO, e é minha: proposta minha atendida numa sessão de
    design não volta para o caderno sozinha. O caderno tem que ser lido contra
    o FONTE, não contra a memória do que eu pedi. Doze dias de "aguardando o
    dono" foram ficção.
- Estado anterior: PROPOSTO
- Tipo: mudanca-direta (não é A/B: não há dúvida honesta entre duas versões,
  há uma versão verdadeira e uma inventada)
- Alvo no funil: comecou_onboarding → terminou_onboarding, que é a MAIOR
  quebra do painel hoje (36 pessoas começaram, 17 terminaram, 19 perdidas em
  28 dias). A página 4 do onboarding é a de prova social e fica exatamente
  dentro desse trecho.
- Tese BeSci: prova social move mais que argumento, e por isso mesmo ela só
  funciona enquanto acreditam nela. Hoje a página 4 anuncia "Avaliações e
  histórias reais" e mostra quatro depoimentos com nomes que não existem, nota
  "4,8" com o rótulo "média das avaliações", "10.000+ diagnósticos feitos" e
  "5.000+ motoristas", tudo com um selo verde de verificado. Nada disso é
  verdade. Esta semana chegaram as TRÊS PRIMEIRAS avaliações reais, todas de
  cinco estrelas na App Store, e elas são melhores que as inventadas em tudo o
  que importa: são específicas, têm nome público conferível na loja e dizem o
  que a pessoa ganhou em vez de elogiar o app. "não sei muito de carros e o
  premium está me SALVANDO" vende mais que "O melhor app de carro que já usei",
  porque a primeira frase é de alguém e a segunda é de ninguém.
  - O que muda: os quatro depoimentos inventados saem e entram os reais; a
    nota "4,8" vira a nota real com o número de avaliações ao lado ("5,0, 3
    avaliações na App Store"); os dois números inventados de diagnósticos e de
    motoristas SAEM sem substituto, porque não existe número verdadeiro
    equivalente e inventar de novo seria o mesmo erro com outra roupa.
  - Número pequeno não é fraqueza aqui: "3 avaliações, todas 5 estrelas" é
    conferível na loja em dez segundos, e "5.000+ motoristas" não é. Quem
    duvida do segundo desconta o resto da página junto.
- RESSALVA HONESTA, e ela reduz o material de quatro para dois: a avaliação
  "Economia no bolso", do autor Moraes455, parece ser do próprio dono (o
  e-mail da conta é rodrigomoraessilva455). Usar a avaliação do dono como
  depoimento de cliente é fabricar prova social de novo, só que com um texto
  verdadeiro. Ela fica de fora até o Rodrigo dizer que não é dele. Sobram as
  de joserenatom e luana david, e duas reais valem mais que quatro falsas.
- Métrica: taxa comecou_onboarding → terminou_onboarding (hoje 47,2%) ·
  Duração: 4 semanas, e com a ressalva de que 36 pessoas em 28 dias não
  sustentam conclusão estatística; a leitura será direcional
- Aprovação: **aguardando o dono**. Em 01/09 ele decidiu, com o inventário
  completo na mão, que a prova social fabricada FICA por ora, e registrou que
  isso não deve ser reaberto como prioridade toda rodada. A mesma decisão
  nomeou o que abriria conversa nova: **avaliação real chegando**. Foi o que
  aconteceu nesta semana, então isto é a condição dele disparando, não a
  recomendação repetida. Se ele disser não, some do caderno e não volta.
- Início: (não começou) · Ler a partir de: 4 semanas depois da aprovação
- Antes: 36 → 17 no onboarding (47,2%) nos 28 dias até 04/09; 3 avaliações
  reais, média 5,0, todas na App Store BR (a Play ainda não é coletada, então
  o número real pode ser maior)
- Veredito: (não começou)
