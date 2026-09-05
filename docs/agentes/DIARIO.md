# Diário do time de agentes

Registro cronológico das rodadas. Cada agente escreve aqui ao terminar:
data, papel, o que fez, o que encontrou, o que recomenda. O mais novo em cima.

## LEIA ISTO ANTES DE RECONFERIR QUALQUER NÚMERO

Perguntas que JÁ FORAM investigadas e fechadas. Reabrir qualquer uma delas sem
motivo novo é gastar o tempo do dono para chegar na mesma resposta. Se um número
aqui parecer estranho, o caminho é ler a entrada citada, não refazer a
investigação do zero.

Isto existe porque o diário cresce e a resposta boa afunda. Em 04/09 o dono
cobrou, com razão: "toda vez você confere as mesmas coisas". A conferência que
ele viu pela terceira vez estava escrita duas vezes ali embaixo.

| Pergunta | Resposta, e desde quando | Onde está |
|---|---|---|
| Por que a receita é R$ 0,00 se há assinantes? | Cupom de 100% empilha com o teste grátis: 7 dias mais 1 mês. Não é defeito, o cupom faz o que promete. | 04/09, QA agendado |
| Os cupons vão continuar zerando a fatura? | Não. São `duration: once`, já foram gastos, e as assinaturas estão com `discounts: []`. | 04/09, QA agendado |
| Quantos assinantes existem de verdade? | **3 pessoas.** A tabela tem 6 linhas: 2 `inactive` e 1 conta de revisão das lojas (válida até 2099) não são clientes. | 04/09 |
| Quando entra o primeiro dinheiro? | 01/10, depois 04/10 e por volta de 09/10, R$ 29,90 cada. Verificação já agendada para o dia 01. | 04/09, QA agendado |
| O webhook do Stripe está vivo? | Está. Duas viradas de teste gravadas em 37 segundos, 01/09 e 04/09. | 04/09, QA agendado |
| A captura de UTM está quebrada? | Não, nunca esteve. A consulta é que lia o caminho errado: é `extra->'utm'->>'utm_source'`. | 03/09 |
| Por que a AppsFlyer diz que tudo é orgânico? | Porque é. O SDK está vivo (54 instalações e 55 ativos chegaram lá). O que falta é o link: os botões de baixar apontam para a ficha crua da loja (`lib/stores.ts`), então o clique do anúncio morre no navegador. 100% das UTM do google/cpc estão em `plataforma = web`, zero no android e no iOS. O conserto é um OneLink, e ele nasce no console da AppsFlyer. | 05/09 |
| Quais manuais faltam para a Biela? | O buraco é de MODELO, não de ano: a busca filtra marca e modelo no duro e só ordena por ano. 7 dos 10 carros mais comuns do Brasil não têm manual, e 4 dos 9 carros dos nossos usuários acham zero trecho. | 04/09, `docs/manuais-a-subir.md` |

**Como manter:** ao FECHAR uma pergunta que já custou investigação, acrescente a
linha aqui com a data. Ao descobrir que uma linha destas está errada, corrija-a
aqui e na entrada de origem, com o texto antigo riscado. Esta tabela não é fonte
de verdade sobre os números de hoje: ela diz o que já foi respondido e onde ler.

## 2026-09-04 · QA, verificação agendada: a virada deu certo e a receita é zero
- Não é rodada semanal, é a verificação de prazo que a rodada de 02/09
  agendou. Escopo pequeno de propósito.
- **A VIRADA ACONTECEU.** O segundo cliente (0634d48f) saiu do teste grátis
  às 13h20 e está `active`, com período até 04/10. A escrita no banco saiu 37
  segundos depois do fim do teste, o que é a segunda ocorrência do mesmo
  padrão da virada de 01/09 e fecha de vez a dúvida do webhook do Stripe: ele
  está VIVO. Ninguém abre o app 37 segundos depois do vencimento, duas vezes
  seguidas, de madrugada e no meio de uma sexta.
- **EU ESTAVA ERRADO sobre a receita, e o conserto da leitura é este.** Em
  02/09 escrevi que MRR 29,90 com receita 0,00 cheirava a defeito do coletor.
  Não é: o coletor está certo e a receita É zero. Com a integração do Stripe
  de volta, as faturas dizem o que aconteceu.
- **A CAUSA: cupom de 100% empilhado com o teste grátis.** Os três clientes
  entraram por convite de 100% (MENSAL-ALESSANDRO100 resgatado 2x,
  MENSAL-LANCAMENTO100 1x). Esses cupons são `duration: once`, e o `once`
  não foi gasto na fatura de criação, que já era R$ 0,00 por causa do teste
  grátis: ele foi gasto na PRIMEIRA fatura com valor, ou seja, na renovação.
  Resultado nas duas faturas de ciclo já emitidas (01/09 e 04/09):
  subtotal 2990, desconto 2990, `total` 0, `amount_paid` 0, status paid.
- **O que isso significa na prática**: teste grátis de 7 dias mais 1 mês de
  cupom dá 37 dias grátis, e o produto tem hoje 3 assinantes e R$ 0,00 de
  receita realizada. O MRR de 29,90 por cliente é preço de tabela, não
  caixa. O Diretor precisa disso antes de reportar MRR na segunda.
- **Não é defeito de cobrança, e não mexi em nada.** O cupom faz o que promete
  ("convite: 1 mês grátis"); o que ninguém tinha olhado é que ele empilha com
  o teste. Cupom e cobrança estão fora da alçada, então isto fica registrado,
  não consertado. Se a intenção era 1 mês grátis TOTAL, e não 37 dias, quem
  decide é o dono.
- **PRÓXIMA DATA, 01/10**: é a primeira fatura que cobra de verdade
  (fcd41994, R$ 29,90, cupom já gasto). Verificação agendada para o dia
  (trigger trig_01RDigHJNuudNTKFfZm6dXN1), conferindo se a fatura sai com
  valor e o que acontece se o cartão recusar, que é um caminho que nunca
  rodou. Depois vêm 04/10 e por volta de 09/10.
- **Terceiro cliente novo**, b62df1c8, assinou em 02/09 à tarde (depois da
  rodada daquela manhã), em teste até 09/09. A fatura dele em 09/09 também
  vai sair zerada, pelo mesmo cupom, e isso é esperado e não precisa de
  alarme.
- Nada corrigido nesta verificação porque nada estava quebrado no código: o
  achado é de leitura de negócio.

## 2026-09-04 · A 1.7 está no ar e fecha ao responder o quiz; 1.8 preparada

- **A 1.7 foi aprovada na Play em 03/09 e está na mão dos usuários.** Em 04/09
  um cliente pagante gravou a tela do Android fechando ao responder a pergunta
  do dia, nela. O funil confirma pela coluna `versao`: aparelho `70d10f37`,
  1.7.0, abriu 18:26:51, gravou a resposta 18:27:44, reabriu 18:28:04.
- **Duas correções minhas do mesmo dia**, registradas por inteiro em
  `docs/qa/app-fecha-no-quiz.md`: o aparelho não roda 1.6, e a linha de crash do
  Play Console (versão 52, 1.6, dois dias antes) NÃO é o rastro desta quebra.
- **O achado mais grave: a testemunha ficou muda.** O app reabriu 20 segundos
  depois, dentro da janela, numa versão que tem a migalha, e `app_erros` não
  ganhou linha. Um app que morre some da tela, e sumir da tela era lido pelo
  nosso código como "a pessoa saiu do app". A trava contra falso positivo
  engoliu o verdadeiro positivo.
- **O que a 1.8 leva:** a porta única de permissão (o quiz atravessava a ponte
  nativa duas vezes por resposta) e a migalha gravando a HORA da pausa, para
  pausa colada no passo continuar virando relato. Nenhum dos dois é o conserto
  do fechamento, e o texto das lojas diz isso sem prometer cura.
- **Versão subida para 1.8, versionCode 56**, e a 1.7 entrou na lista de já
  publicadas de `scripts/verifica-versoes.mjs`. Repetir o número agora reprova,
  e isso foi conferido com o defeito plantado.
- **Um verde mentiroso foi pego no caminho**, e vale para toda conferência
  daqui: os casos novos da `conferir:migalha` estavam DEPOIS do bloco que decide
  o código de saída. Imprimiam FALHA e o script terminava em zero. Só apareceu
  porque desta vez o código de saída foi conferido, em vez do texto na tela.
- **Recomendação, uma só:** amanhã, Play Console, Android vitals, filtrando pela
  1.7. Os dados de hoje estavam com atualização de quinta 06:00 e a quebra ainda
  não tinha entrado. É de lá que sai o stack trace, e com ele o conserto deixa
  de ser palpite.

## 2026-09-04 · Por que o ChatGPT e o Gemini não citam o Mentorque

- **A pergunta do dono:** pesquisou "aplicativo de carro" nos dois e nenhum
  mencionou a gente.
- **Como esses assistentes montam essa resposta:** eles buscam e citam, não
  respondem de memória sobre app novo. Para "melhor aplicativo para cuidar do
  carro" as fontes que voltam são listas de terceiros (blog da Nakata,
  Garagem360, Gazeta do Povo, Rodobens) e fichas de loja. Nunca o site do
  próprio app. Quem está nessas listas é citado.
- **O achado que ninguém esperava:** buscando "Mentorque aplicativo carro" não
  volta nada nosso, nem o site nem as fichas das lojas. O único "Mentorque" que
  aparece é `app.mentorquedu.com`, uma plataforma de educação que já ocupa o
  nome. Não somos encontráveis nem pelo nome próprio, e existe colisão de marca.
- **Ressalva de método:** isso NÃO prova que o Google não nos indexou. O
  operador `site:` não foi respeitado pela ferramenta de busca e o nosso domínio
  está bloqueado na saída de rede das sessões, então as páginas não puderam ser
  abertas daqui. Quem sabe da indexação é o Search Console, e ele é do dono.
- **A causa provável, e não é falta de preparo técnico:** o `robots.ts` libera
  17 robôs de IA nominalmente, o `llms.txt` é bom, o `/sobre` existe. O problema
  é tamanho: o site tinha 8 páginas e só 3 de conteúdo. As 105 aulas moram
  dentro do app, atrás de conta, onde robô nenhum entra. A decisão de manter o
  acervo fechado continua certa; o que não aconteceu foi publicar topo de funil,
  que existia em UMA página.
- **O que subiu:** três guias novos, escolhidos por demanda real de busca e não
  por gosto. `/luz-da-injecao-acesa` (o ângulo é fixa contra piscando, que quase
  ninguém explica), `/carro-nao-pega` (o recorte é o som da partida, e quem
  busca isso está parado na garagem agora) e `/carro-gastando-muita-gasolina` (o
  ângulo é medir antes de trocar peça). Os quatro guias passaram a dividir
  estrutura, o sitemap e a suíte `site` leem do mesmo registro, e eles agora
  linkam uns para os outros: antes cada um era uma ilha ligada só à home.
- **Um número que quase entrou errado:** os textos mais copiados sobre consumo
  afirmam que a gasolina passou a ter 35% de etanol. Está errado. Em 14/07/2026
  o CNPE aprovou de 30% para 32%, por 180 dias, e o E35 seguia em estudo.
  Copiar a lista dos outros teria publicado o erro deles com a nossa cara.
- **Recomendações, em ordem de força.** (1) Estar nas listas dos outros é o
  caminho mais curto para ser citado, e é alçada do dono, porque envolve falar
  com terceiro. (2) Conferir no Search Console se as páginas estão indexadas e
  pedir indexação das três novas. (3) Conferir se as fichas das lojas aparecem
  na busca, porque elas são ativo citável com autoridade que não é nossa.
- **Expectativa honesta:** mesmo com tudo bem feito, ser citado leva meses. A
  citação depende de terceiros publicarem e de os buscadores reindexarem.

## 2026-09-04 · O onboarding da web rodava sem ninguém olhando

- **Correção de uma conclusão minha de hoje de manhã.** Eu disse que o zero de
  conclusões do onboarding na web era "comportamento, não medição", e apoiei
  isso em `app_erros` estar vazia. A tabela estava vazia porque o
  `vigiarErros()` era chamado dentro do `useFunilDeAbertura`, montado pelo
  Shell, e o Shell só existe DEPOIS do onboarding. Ninguém estava olhando. A
  ausência de registro não era notícia nenhuma.
- **Os números certos, 14 dias:** web 16 começaram e **0 terminaram**; Android
  21 e 12; iOS 6 e 5. Nas lojas junto dá 17 de 27, ou 63%. Zero em 16 com essa
  taxa não é sorte, é sinal.
- **Quem são os 16:** todos deslogados, quase todos com `gclid` e
  `utm_source=google`, `utm_medium=cpc`. Gente do anúncio pago. Catorze deles
  não emitiram NADA além do `comecou_onboarding`, nem `abriu_app`. Dois pares
  têm o mesmo `gclid` com `anon_id` diferente, e um id veio no formato de
  aparelho sem armazenamento: navegador embutido de app, provavelmente.
- **O que foi conferido e NÃO é a causa:** o fluxo da web funciona ponta a
  ponta. Andei as cinco páginas num Chromium limpo, a 390x844 e a 1280x800, e
  o `terminou_onboarding:plano` sai nos dois. Também testei a hipótese de
  quem já terminou entrar no denominador de novo: não entra, a `SplashScreen`
  segura o tempo da hidratação.
- **O que subiu:** o coletor de erros liga no `AppBoundary`, o ponto mais alto
  do app, cobrindo o onboarding. E o `componentDidCatch` passou a RELATAR:
  erro dentro do render é capturado pelo boundary e por isso nunca chegava no
  `window.onerror`, então a quebra que mais importa era a única invisível.
  Suíte nova `conferir:navegador erros`, que planta um erro de verdade e exige
  o relato. Provada plantando o defeito: sem o conserto ela acusa `relatos=0`
  no onboarding e continua verde depois dele, que é exatamente a assimetria
  que escondeu isto por duas semanas.
- **Recomendação, uma só:** esperar 24h de dados com o coletor de pé antes de
  mexer em produto. Se aparecer erro de web em `app_erros`, o defeito é nosso e
  fica identificado com a tela. Se não aparecer nada, aí sim a hipótese vira
  produto, e a primeira pergunta passa a ser para onde o anúncio do Google
  aponta: quem cai direto no `/app` encontra cinco páginas e um paywall antes
  de saber o que o Mentorque faz.
- **Achado solto:** visitante cujo navegador não manda `pt-BR` recebe o app em
  inglês. Não afeta o funil (tráfego brasileiro manda), mas a régua do idioma é
  o cabeçalho do navegador, não o país.
- **Conversa com a rodada do CRO logo abaixo**, que subiu enquanto isto era
  investigado. Ele achou a mesma quebra por outro caminho (36 começaram, 17
  terminaram em 28 dias) e disse a coisa certa: sem evento por página, mudar
  copy é chute. Some a isso o que está aqui em cima. As 19 perdidas dele não
  estão espalhadas pelas cinco páginas, estão concentradas numa plataforma: nas
  lojas passam 63%, na web passa ninguém. Instrumentar por página continua
  valendo, e a pergunta anterior a ela é por que a web se comporta diferente.

## 2026-09-04 · CRO (conversão): metade some dentro do onboarding, e não dá para dizer onde
- Rodada semanal do CRO/BeSci, foco CONVERSÃO (a de 28/08 foi de retenção).
  Artifact "Conversão da semana":
  https://claude.ai/code/artifact/f054d04f-886a-49da-abfc-5bc4f3109493
- VEREDITOS: nenhum vencido. cta-teste-por-plano e fim-do-lembrete-falso se
  leem em 20/09; lembrete-que-chega em 28/09.
- ACOMPANHAMENTO de lembrete-que-chega, e a condição de leitura foi cumprida:
  a correção de 28/08 saiu na 1.5 (31/08) e na 1.6 (01/09), então o relógio
  começou. A métrica (1) já responde: os erros `.then()` caíram de 12 (02/09)
  para 7 (04/09) sem ocorrência nova, o desenho de uma janela de 7 dias
  esvaziando, e o QA já tinha conferido que todos são da 1.2.0. ANOTADO o
  outro lado, que a métrica não previa: o app fechando ao responder o quiz no
  Android tem como suspeito sem prova o plugin de notificação, que só voltou a
  ser chamado por causa deste conserto. Se confirmar, o veredito conta os dois.
- OUVIR O USUÁRIO, e é a primeira vez que dá para ouvir palavra: chegaram as
  TRÊS PRIMEIRAS avaliações do app, todas 5 estrelas na App Store. Nenhuma
  elogia recurso, todas contam desfecho: "economizar na oficina por não ser
  enrolado", "exatamente o que eu precisava", "não sei muito de carros e o
  premium está me SALVANDO. suporte muito rápido também". Entraram no mapa com
  autor e loja. RESSALVA registrada: a primeira parece ser do próprio dono
  (autor Moraes455, e-mail da conta rodrigomoraessilva455), então não vale como
  voz de cliente até ele confirmar.
- AUDITORIA DA SEMANA, com a instrumentação nova de 01/09 ~~(28 dias, pessoas)~~:
  36 começaram o onboarding e 17 terminaram ~~(47,2%,~~ 19 perdidas); dessas 17, 5
  abriram o cadastro de carro ~~(29,4%)~~; dessas 5, UMA cadastrou. A maior quebra
  do funil inteiro é a primeira, e das 36 que começam UMA chega a ter carro
  cadastrado, que é a porta de todo o resto do app.
  - **CORREÇÃO, 04/09 à tarde: a janela não era de 28 dias, era de QUATRO.** O
    `comecou_onboarding` só é gravado desde 01/09. E a taxa de 29,4% dividiu
    dois degraus com janelas diferentes: `abriu_cadastro_de_carro` existe desde
    03/09 (dois dias) e `terminou_onboarding` desde 01/09 (quatro dias). É o
    defeito que o `lib/funilCorreto.ts` e a função `funil_etapas(p_desde)`
    existem para impedir, e nenhum dos dois foi usado. As casas decimais também
    saem: com 36 pessoas elas sugerem precisão que o dado não tem.
- O PROBLEMA DE FUNDO: o onboarding tem 5 páginas e a medição só sabe quem
  entrou e quem saiu. ~~As 19 pessoas somem num trecho onde não dá para apontar
  a página.~~ Mudar copy agora é chute com nome de aposta. Instrumentar por
  página NÃO está na minha alçada: a lista de eventos válidos é uma restrição
  CHECK em funil_eventos, e banco além de tabela nova é do dono. Virou a
  recomendação 1.
  - **CORREÇÃO, 04/09 à tarde: dava para apontar bem mais do que isso, e sem
    depender do dono.** A coluna `plataforma` já estava na mesma consulta. Em 14
    dias: **web 16 começaram e 0 terminaram; Android 21 e 12; iOS 6 e 5.** As 19
    perdidas não estão espalhadas pelas cinco páginas, estão concentradas numa
    plataforma. O `terminou_onboarding` ainda carrega `origem` (`plano`,
    `assinou`, `agora-nao`, `sem-venda`), que diz COMO a pessoa saiu, e também
    não foi usado. A recomendação de instrumentar por página continua válida,
    mas deixou de ser a primeira coisa a fazer: ela custa uma semana de espera
    pelo dono, e o corte por plataforma custava um `group by`.
- NADA FOI IMPLEMENTADO NO CÓDIGO, e é decisão, não falta de assunto. As duas
  páginas onde eu mexeria estão fechadas: a 5 (montar o teste) tem o
  experimento cta-teste-por-plano com veredito em 20/09, e mexer nela apaga a
  única leitura que ele vai ter; a 4 (prova social) está sob decisão do dono de
  01/09. As páginas 1 a 3 estão livres, mas mexer nelas sem saber qual página
  perde gente é churn, e ainda embaralharia a leitura da proposta da semana.
- APOSTA DA SEMANA, registrada como PROPOSTO: [prova-social-de-verdade]. A
  página 4 do onboarding anuncia "Avaliações e histórias reais" e mostra quatro
  depoimentos com nomes que não existem, nota "4,8" como "média das
  avaliações", "10.000+ diagnósticos" e "5.000+ motoristas", com selo verde de
  verificado. As reais chegaram esta semana e são melhores em tudo o que
  importa: específicas, com nome conferível na loja, e falam do ganho.
  Proposta: os inventados saem, entram os reais, a nota vira "5,0, 3
  avaliações na App Store", e os dois números de diagnósticos e de motoristas
  saem SEM substituto, porque não existe número verdadeiro equivalente.
- POR QUE ISTO NÃO É REABRIR ASSUNTO ENCERRADO: em 01/09 o dono decidiu manter
  a prova social fabricada e pediu para não reabrir toda rodada, e na mesma
  decisão nomeou o que abriria conversa nova, "avaliação real chegando". Foi o
  que aconteceu. Levado UMA vez; se ele disser não, sai do caderno e não volta.
  A decisão dele foi copiada para os Direcionamentos do MEU manual, porque
  morava só no manual do ASO e as três superfícies são do CRO.
- CORREÇÃO NO MAPA, no lugar onde a mentira estava escrita: o passo 4 dizia
  que o login social do app estava travado. Está errado, o dono desmentiu em
  aparelho real em 28/08, e o texto agora está riscado com a correção embaixo.
  Deixar afirmação errada no mapa vivo é pior que não ter mapa, porque a
  próxima rodada trata como fato conferido.
- APRENDIZADOS gravados em besci.md: frase de usuário ganha de frase escrita
  por nós sobre o mesmo assunto; e prova social pequena e conferível ganha de
  prova social grande e inventada, porque o problema nunca é o número ser
  pequeno, é ele não ter como ser conferido.
- Só documentação mudou nesta rodada, então rodei as conferências que a tocam
  (travessão, skills, frescor), e não a bateria inteira.

## 2026-09-02 · QA: a compra pelas lojas contaria a mesma venda duas vezes
- Artifact "QA da Semana":
  https://claude.ai/code/artifact/b104e080-4490-4a88-a9e6-07a366deca63
- Fluxo varrido: **compra pelas lojas (RevenueCat)**, que era o topo da fila
  desde 27/08. Lido pelos dois lados, medição e experiência, como pede o
  direcionamento 6.
- **PRAZO NOVO, 04/09 às 13h20**: existe um SEGUNDO cliente real,
  0634d48f (sub_1U9Phe…, mensal R$ 29,90), em teste grátis terminando na
  sexta. Verificação AGENDADA para 04/09 15h UTC (trigger
  trig_01QwrDYMNSunEp3oJXKjVT4K), que confere a virada e escreve aqui
  sozinha. É o direcionamento 5 em prática: diário não dispara, lembrete sim.
- **Prazo de 01/09 fechado, e bem**: o primeiro cliente virou cobrança às
  23h52 do dia 1º, período até 01/10. ~~R$ 29,90 de MRR real.~~ A recomendação
  da rodada passada (segunda porta gravando o `assinou`) já se pagou: o
  evento do segundo cliente está gravado com origem `stripe-sync`, e sem ela
  essa venda seria invisível igual à primeira.
  > **CORRIGIDO em 02/09, com o Stripe liberado.** Não houve R$ 29,90 de
  > receita. A fatura de 01/09 saiu com subtotal R$ 29,90, desconto R$ 29,90
  > e **total R$ 0,00**: o cupom `MENSAL-LANCAMENTO100` (100%, `once`) foi
  > consumido exatamente nessa primeira cobrança pós-teste. O período avançou
  > porque a fatura foi QUITADA, e uma fatura de R$ 0,00 é quitada na hora.
  > "Período avançou" prova cobrança emitida, não dinheiro recebido.
- **Prova indireta sobre o webhook do Stripe** (direcionamento 3): a virada
  foi escrita no banco 10 segundos depois do fim do teste grátis, de
  madrugada. Ninguém abre o app nesse segundo exato, então quem escreveu foi
  o webhook. Ele está VIVO. Marcado como dedução, não como certeza: o log de
  entregas continua ilegível porque a integração do Stripe pede autorização.
- **CORRIGIDO, reentrega contando venda em dobro**: o índice
  `funil_eventos_assinou_unico` casa por `extra->>'sub'`, chave que só o
  Stripe escreve. A compra pela Apple ou pela Play caía fora dele, e o
  RevenueCat reenvia quando não recebe 2xx. Índice novo
  `funil_eventos_rc_evento_unico`, por id do EVENTO e não da assinatura: a
  reentrega repete o id e é barrada, a renovação do mês seguinte tem id
  próprio e passa (travar por assinatura apagaria receita, que é por isso que
  `renovou` fica fora do índice de cima). Aditivo, dentro da alçada de 27/08.
  Ensaiado antes de subir com as três condições cumpridas: reentrega barrada,
  renovação nova passando, e as linhas do ensaio desfeitas na mesma transação
  (conferido depois: 0 linhas de ensaio no banco).
- **CORRIGIDO, o mesmo defeito pela segunda vez em cinco dias**: o webhook do
  RevenueCat gravava o evento de funil sem olhar o `error`, igual à
  `/api/funil` de 26/08. Aqui era pior, porque o evento perdido é o
  FINANCEIRO e a rota responde 200 de qualquer jeito, então o RevenueCat
  considera entregue e nunca reenvia. Passou a usar o `eventoDeFunil`, que
  ganhou `plataforma` opcional: o escritor só sabia dizer "web", e evento de
  loja precisa dizer ios ou android, senão a leitura por plataforma jura que
  ninguém compra pelo aplicativo.
- **CONFERÊNCIA NOVA, `conferir:gravacao`**: achar o mesmo defeito duas vezes
  é sinal de que ele volta, e "procurar esse padrão" escrito num manual é
  torcida. Agora gravação em `funil_eventos` que não desestrutura `error`
  reprova a bateria, apontando arquivo e linha. Provada mordendo antes de
  entrar, como manda o CLAUDE.md: plantei o insert de volta no webhook, ela
  reprovou na linha certa, restaurei e ela voltou a passar.
- **RECOMENDADO, não aplicado** (encosta em cobrança): a compra pela loja
  pode terminar em silêncio. Se a loja confirma e o direito ainda não
  propagou, o código não libera, não avisa e não sai da tela: a pessoa foi
  cobrada e continua olhando o paywall. É o mesmo defeito que quase fez o
  cliente de 25/08 pagar duas vezes, consertado só do lado da web. Hoje
  ninguém comprou pela loja ainda, então é de graça. Patch pronto em
  `docs/agentes/propostas/compra-na-loja-silenciosa.md`.
- **Zeros, todos com causa** (direcionamentos 1 e 2, nenhum morreu em bullet):
  `abriu_trilha` e `abriu_cadastro_de_carro` têm instrumentação conferida
  ponta a ponta e tela alcançável, então é comportamento e não cano entupido;
  `renovou` porque nenhuma assinatura chegou ao segundo mês (o primeiro
  renova em 01/10); `cancelou` e `expirou` porque ninguém cancelou.
- **Erros do retrato, encerrados**: os 12 `LocalNotifications.then()` são
  todos da versão 1.2.0 e o último é de 29/08, anterior ao conserto da caixa.
  Zero ocorrência nova. A janela de 7 dias vai continuar mostrando eles até
  domingo, o que é ruído e não defeito.
- ~~**Fica para o Analista**: o retrato traz MRR 29,90 e receita 30d 0,00 no
  mesmo pacote. A assinatura está `active` com período até 01/10, e o Stripe
  só avança período com fatura paga, então a cobrança entrou. Cheira a
  defeito do coletor de receita, não de cobrança.~~ Não fechei: integração do
  Stripe indisponível nesta sessão.
  > **CORRIGIDO em 02/09.** Não havia defeito nenhum no coletor de receita: os
  > dois números estavam certos e diziam coisas diferentes. MRR é a PROJEÇÃO
  > do plano; receita 30d é o CAIXA. Com cupom de 100% no primeiro mês, os
  > dois divergem de propósito, e a divergência era a resposta, não o
  > problema. O erro de raciocínio está nomeado no manual do papel
  > (`qa-produto.md`, direcionamento 7): eu vi a contradição, escolhi o galho
  > otimista e passei o enigma adiante em vez de dizer "não sei".
- Saúde: bateria `conferir` inteira passando (12 conferências), build do site
  e `build:native` verdes.
## 2026-09-03 · O envio da 1.7 saiu vestido de 1.6, e a Play aceitou
- O build compilou (o conserto da AppsFlyer valeu) e morreu na publicação:
  `CFBundleShortVersionString [1.6] must contain a higher version than that of
  the previously approved version [1.6]`, mais `train version '1.6' is closed`.
- **A versão nunca tinha sido subida.** Falei em "binário 1.7" a tarde inteira,
  em quatro consertos diferentes, e não subi o número em lugar nenhum. Os três
  lugares seguiam em 1.6. Erro meu, e do tipo chato: o trabalho estava certo, só
  não estava rotulado.
- **A `conferir:versoes` aprovou, e estava certa pela regra que tinha.** Ela
  compara os três números ENTRE SI, e eles concordavam: todos em 1.6.
  Concordância prova consistência, não novidade. Foi um ponto cego de desenho,
  não uma falha de execução.
- **A Apple recusou e a Play ACEITOU, e o segundo é pior que o primeiro.** Foi
  publicado na faixa interna um binário com o conteúdo da 1.7 vestido de 1.6, e
  o versionCode 54 ficou gasto mesmo com o envio tendo falhado no meio. Por isso
  o piso do `gradle.properties` subiu para 55: se o contador do Codemagic
  devolver 54 de novo, a Play recusa.
- **A conferência ganhou a segunda pergunta**: além de "os três concordam?",
  agora ela pergunta "esta versão já foi publicada?", contra uma lista escrita à
  mão (`JA_PUBLICADAS`). Lista à mão tem manutenção, e o preço é aceito porque a
  assimetria é boa: esquecer de acrescentar só faz a conferência deixar de
  avisar, enquanto repetir uma versão custa um build inteiro. Provada com o
  defeito exato de hoje plantado, e o defeito antigo continua sendo pego.
- **O `/api/app/latest` NÃO foi mexido**, e é de propósito: ele aponta para o
  que está em PRODUÇÃO nas lojas, e a 1.7 ainda não está. Subir agora acenderia
  o aviso de "versão nova disponível" para todo mundo, apontando para uma
  versão que não existe para baixar.

## 2026-09-03 · O build 1.7 do iPhone caiu num bug de plugin, e o app nem usa Facebook
- Erro do Codemagic: `AppsFlyerPlugin.swift:665: cannot find 'FBSDKAppLinkUtility'
  in scope`. Passo `Compilar .ipa`, Xcode 26.4.1.
- **O defeito é do plugin da AppsFlyer, e são dois erros na mesma linha.** A
  guarda pergunta `#if canImport(FacebookCore)`, mas o símbolo usado
  (`FBSDKAppLinkUtility`) mora em `FBSDKCoreKit`, que é outro módulo. E o
  arquivo não importa nenhum dos dois: os imports dele são só Foundation,
  Capacitor e AppsFlyerLib. No dia em que aquela guarda abrir, o que está
  dentro não compila de jeito nenhum.
- **Por que abriu agora, se a 1.6 passou.** O `@capgo/capacitor-social-login`
  traz o SDK do Facebook para o build do iPhone. O alvo da AppsFlyer NÃO
  declara dependência do Facebook, mas o SwiftPM constrói tudo na mesma pasta e
  o `canImport` enxerga módulo que esteja no caminho de busca, declarado ou
  não. Ou seja: a guarda dependia de ORDEM DE BUILD, não de regra. Vinha dando
  não e passou a dar sim.
- **NÃO consegui provar qual peça virou a chave, e isso é a lição.** Três coisas
  se movem sozinhas entre um build e outro: o Codemagic usa `xcode: latest`, o
  `facebook-ios-sdk` entra por faixa (`upToNextMajor from 18.0.3`) e **não
  existe `Package.resolved` versionado**. O build nativo não é reproduzível, e
  foi por isso que uma tarde sem mexer em nada de iOS terminou com o iPhone sem
  compilar.
- **O conserto não depende de descobrir qual foi**: a guarda é fechada com uma
  bandeira que ninguém define (`MENTORQUE_APPLINKS_DO_FACEBOOK`), então o
  compilador nunca entra ali. O ramo `#else` do próprio plugin continua
  respondendo "Please install FBSDK First!" para quem chamar. É honesto para
  nós: o app não tem login com Facebook, e nunca chama essa função.
- **O remendo mora em `node_modules`, que não é versionado**, então ele ganhou
  as duas metades que isso exige: um `postinstall`
  (`scripts/conserta-appsflyer.mjs`), que roda no `npm ci` do Codemagic sem
  depender de alguém lembrar de um passo no yaml, e uma conferência
  (`conferir:appsflyer`) que reprova se o remendo sumir. Provado com `npm ci`
  limpo: o postinstall pegou o plugin recém-baixado.
- **A versão do plugin saiu do acento** (`^6.18.0` → `6.18.0`). O remendo
  aponta para um texto exato de um arquivo de terceiro; deixar a versão flutuar
  seria deixar o remendo apontar para o vazio um dia.
- **Fica recomendado, e é chamada do dono**: pinar o Xcode no codemagic.yaml e
  versionar o `Package.resolved`. Não fiz junto porque misturar três mudanças de
  ambiente com o conserto tornaria o próximo build impossível de ler se ele
  falhar de novo.

## 2026-09-03 · O aviso trazia a pessoa de volta e a largava na porta
- Relato do dono: tocar no aviso do quiz das 9h abre o app **no Início**, e não
  na pergunta. Ela precisa achar o chip do quiz no topo e tocar de novo.
- **A causa era uma ausência completa, não um destino errado**: não havia
  ouvinte de toque em lugar nenhum do app, nem para o aviso local nem para o
  push, e os avisos também não carregavam destino. Eram título e corpo. O
  sistema abria o app, e abrir o app era literalmente tudo o que acontecia.
- **É o pior lugar para perder uma pessoa.** O aviso já tinha feito a parte
  difícil, que é convencer alguém a voltar; o que se perdia era o último passo,
  o mais barato de todos.
- **A rota viaja no aviso e é anotada na memória, não no disco**
  (`lib/app/rotaPendente.ts`). A comparação com a compra pendente é o que
  explica: lá o estado precisava atravessar um recarregamento de página inteiro
  (login social sai do domínio e volta), aqui não atravessa nada, porque o
  evento de toque só chega depois de o nosso ouvinte existir. E rota no disco
  teria um efeito feio: abertura sequestrada dias depois, por causa de um aviso
  tocado na semana passada.
- **O que faz funcionar com o app FECHADO**, que é o caso normal: o Capacitor
  retém `localNotificationActionPerformed` e `pushNotificationActionPerformed`
  até alguém assinar. Registrar o ouvinte tarde não perde o toque; por isso o
  módulo GUARDA a rota em vez de só anunciá-la, e quem assina consome o que já
  estava lá.
- **O push do servidor aprendeu a mandar destino** (`"rota": "quiz"` no POST de
  `/api/push/enviar`): `data` no FCM, ao lado do `aps` no APNs. A lista de
  rotas aceitas é fechada nos dois lados, porque o payload de um push é texto
  que viaja pelo Google e pela Apple e não deve poder empurrar o app para
  qualquer tela.
- **A conferência nova (`conferir:aviso`) deixou passar o defeito na primeira
  tentativa, e a lição é geral.** Ela procurava `rota: "quiz"` no
  `lembreteQuiz.ts`; tirei a linha de propósito e ela aprovou, porque o
  COMENTÁRIO acima explica o conserto citando o mesmo trecho. Estava conferindo
  a documentação do conserto. Agora ela limpa comentários antes de procurar, e
  isso valeu virar regra no mapa do código: aqui todo comentário cita código,
  então conferência de texto sem essa limpeza aprova qualquer coisa. Cinco
  defeitos plantados depois (aviso sem rota, ouvinte de push trocado, gancho
  não montado, `esqueceRota` depois do `go`, envio sem `data`) ela grita nos
  cinco.
- **Precisa de binário 1.7**, e agora são quatro consertos esperando: a migalha
  do quiz, o renderizador da WebView no `MainActivity`, a confirmação da compra
  pelas lojas e este.

## 2026-09-03 · O app ganhou agendamento, e as aulas estreiam junto com o vídeo
- Pedido do dono: os vídeos do canal são agendados no YouTube (03/09, 10/09 e
  17/09), e ele quis a aula do app aparecendo junto.
- **Não existia agendamento.** `addedAt` só controlava o selo "Novo": tudo que
  entrava no arquivo aparecia no deploy seguinte. Publicar hoje a aula do vídeo
  de 10/09 mostraria um card cujo player diz "vídeo indisponível", que é pior
  que não ter card, porque ensina a pessoa que o app promete o que não tem.
- **A data virou trava, e num campo só.** Aula com `addedAt` no futuro fica
  escrita no repositório e não sai. Não criei um `publicaEm` ao lado de
  propósito: duas datas por aula são duas chances de discordarem, e "qual delas
  manda?" não tem resposta boa.
- **A trava vive em DOIS lugares, e nenhum é redundante.** No servidor
  (`/api/lessons`), que é quem sabe a data de verdade e simplesmente não manda
  a aula, então o texto nem viaja pela rede antes da hora. E no cliente, porque
  o app da loja carrega um catálogo EMBUTIDO no binário, que não passa por
  servidor nenhum: se um build sair entre a escrita e a data, só o filtro do
  cliente segura.
- **A armadilha do "Novo"**, que teria passado: a conta de novidade é
  `agora - data`, que fica NEGATIVA no futuro, e negativo é menor que sete
  dias. Sem trava, a aula agendada seria a MAIS nova de todas e subiria para o
  topo da Home antes de existir.
- Quatro aulas novas, amarradas às estreias: `vid-esquentar-parado` e
  `vid-turbo-desligar-quente` (03/09), `vid-padaria` (10/09) e
  `vid-agua-torneira-radiador` (17/09).
- `conferir:agenda` entrou na bateria e guarda as quatro datas: se alguém mudar
  uma sem mudar o agendamento do YouTube, ela reprova. Provada com três
  defeitos plantados, incluindo o da data trocada.
- **E nada disso precisa de build de loja**: o catálogo é remoto
  (`REMOTO_LIGADO`), então o push para a main já leva as aulas ao app.

## 2026-09-03 · Os termos de busca responderam: a campanha está vendendo CURSO
- O dono ligou o nó e a primeira leitura já respondeu, e não era sobre lance.
- **Três quartos do dinheiro com nome foram para quem procura CURSO de
  mecânica** (R$ 11,89 de R$ 15,78), metade buscando "grátis", "gratuito" ou
  "certificado". Um dos termos era "curso de mecânico automotivo rj", ou seja,
  aula presencial no Rio.
- **O público certo mal aparece**: 42 termos de gente com problema no carro
  ("carro nao da partida", "carro esquentando o que pode ser", "barulho na
  direção hidráulica") somaram 66 impressões e 2 cliques. E os dois termos que
  descrevem literalmente o produto ("aplicativo manutenção carro", "app scanner
  automotivo gratuito") tiveram 6 impressões e ZERO cliques.
- **O detalhe que fecha o argumento contra otimizar agora**: as duas conversões
  vieram justamente dos termos de curso. O lance automático está sendo
  alimentado pelo público errado, então pedir para ele otimizar é pedir para
  comprar MAIS "curso de mecânica grátis", porque foi ali que ele viu conversão.
  Não é o lance que está errado; é a campanha estar posicionada como curso.
- Negativas sugeridas: `curso`, `certificado`, `senai`, `apostila`,
  `presencial`. **Não negativar "grátis" nem "gratuito" sozinhos**: "app scanner
  automotivo gratuito" é público bom e seria cortado junto. A palavra que separa
  os dois públicos é `curso`, não `grátis`.
- **Ressalva registrada de propósito**: os termos somam R$ 15,78 e a campanha
  gastou R$ 44,16. A diferença não é erro de coleta, é o Google omitindo termos
  de baixo volume por privacidade. A leitura vale para o dinheiro que TEM nome,
  e é sobre esse pedaço que dá para agir; o resto é invisível por decisão da
  plataforma. Dizer isso é melhor que fingir que a conta fecha.

## 2026-09-03 · Mídia paga: a etiqueta gruda, e o clique do Google chega na venda
- O dono mandou fazer tudo o que estava proposto. Feito o que é nosso; o que
  depende de console ficou com o passo escrito.
- **Item 1, a etiqueta.** O vazamento era pequeno de escrever e caro de ter: a
  captura de UTM morava dentro do componente da landing de tráfego pago, então
  só funcionava em `/landing`. Clique pago que caísse na home ou direto no app
  perdia a campanha na chegada. Subiu para o layout raiz (`lib/app/campanha.ts`
  + `CapturaDeCampanha`) e vale em toda página.
  - A conferência protege a regra que quase ninguém lembra: **chegada SEM
    etiqueta não pode apagar a que já estava lá.** Quem clica no anúncio, fecha
    e volta digitando o endereço continua sendo daquela campanha; sem isso toda
    venda vira "direto" e a campanha nunca tem crédito. Plantei três defeitos
    (chegada limpa apagando, gclid fora da lista, guardar a query inteira) e ela
    reprovou nos três.
- **Item 2, metade.** O `gclid` viaja do aparelho até a coluna
  `subscriptions.gclid`, pelo mesmo caminho do cupom (metadata da assinatura no
  Stripe). Falta a ação de conversão no Google Ads, que é console do dono, e aí
  o braço que devolve a venda para lá é uma consulta.
- **O vigia.** O braço do Analista ganhou `search_term_view`: os 50 termos mais
  caros de 30 dias, com uma lista `termosSemConversao` separada, que é de onde
  sai toda palavra-chave negativa. Custo por campanha diz QUANTO; o termo diz
  NO QUÊ.
  - O nó nasceu DESLIGADO porque o n8n recusa colar credencial de Google Ads em
    nó HTTP pela API (mesma limitação do developer-token). Deixar desligado foi
    escolha: nó novo sem credencial no meio de um braço que funciona quebraria
    o braço inteiro.
  - E a leitura ficou defensiva por causa disso: nó desligado no n8n deixa a
    entrada PASSAR DIRETO, então sem filtrar por `searchTermView` a resposta de
    custo seria lida como se fosse de termos e gravaria lixo com cara de dado.
    Simulei os três casos (desligado, ligado, erro) antes de subir.
- **Não fiz o agente que decide, e é de propósito.** Enquanto a conversão que o
  Google enxerga for "tocou no botão de download", pôr um agente para otimizar
  é contratar alguém para maximizar o número errado com mais velocidade.
  Primeiro o sinal, depois quem persegue o sinal.
- Estado e passos em `docs/agentes/propostas/agente-de-midia-paga.md`.

## 2026-09-03 · A campanha entregou, e o rastro morre no primeiro clique
- Pedido do dono: avaliar os resultados do Google Ads e se dá para pôr um
  agente para otimizar.
- **A campanha rodou**: "Mentorque Lançamento", canal SEARCH, ativa. R$ 44,16,
  646 impressões, 23 cliques, CTR 3,6%, CPC R$ 1,92. A compra de mídia está
  saudável; o problema é outro.
- **Nenhum dos 23 cliques chegou a algo que a gente veja.** Zero cadastros com
  campanha, zero eventos de funil com UTM. E como o canal é SEARCH, o clique
  cai numa página NOSSA: aqui zero não é limitação de plataforma, é o rastro
  terminando.
- **As "3 conversões" não são o que o nome diz.** A conversão configurada no
  Google Ads é o `marcarCliqueDownload`: um toque no selo da loja. Não é
  instalação, não é cadastro, não é venda. R$ 14,72 por toque em botão, sem
  saber o que veio depois, porque a atribuição de instalação nunca foi fechada.
- **Consulta do braço levada para o nível de CAMPANHA.** Era `FROM customer` e
  devolvia só o total do dia: dava para saber que gastou, nunca no quê. Agora
  vem nome, status e TIPO DE CANAL, e é o tipo que muda a leitura inteira,
  porque campanha de APP manda para a loja (zero de UTM é esperado) e SEARCH
  manda para uma página nossa (zero de UTM é vazamento). Sem esse campo eu não
  teria como distinguir as duas, e a resposta seria chute.
- **Recomendação: não criar o agente de otimização ainda.** O único sinal
  disponível é "tocou no botão de download", e o lance automático do Google já
  otimiza para ele; um agente em cima disso só ficaria bom em comprar toques em
  botão, mais rápido. É o mesmo erro de unidade do funil e do MRR, em outra
  roupa: número que não mede o que importa não melhora sendo otimizado, piora,
  porque passa a ter alguém trabalhando para maximizá-lo.
- Proposta escrita em `docs/agentes/propostas/agente-de-midia-paga.md`, com a
  ordem certa (destino mensurável, conversão que signifique dinheiro,
  atribuição de instalação, e só então o agente), o vigia de leitura que dá
  para criar já, e a alçada sugerida para quando o agente existir: palavra
  negativa sozinho, porque só reduz gasto; orçamento e lance com o dono.

## 2026-09-03 · A LP virou página de app publicado, e o cupom teve que renascer
- **Cupom: "subir para 25" não existe no Stripe.** `max_redemptions` não é
  editável, nem no cupom nem no código promocional; a própria documentação da
  rota de atualização diz que os detalhes do cupom são, por desenho, não
  editáveis. O caminho é substituir. Criados `MENSAL-LANCAMENTO100-25` (100%,
  `once`, teto 25) e o código `LANCAMENTO1MES` (teto 25), presos ao produto
  mensal via `applies_to`, que só pode ser definido na CRIAÇÃO e não volta na
  leitura. O `PREMIUM1MES` antigo segue ativo com 9 usos porque o MCP do Stripe
  não expõe a operação que desativa código promocional; convém desativar no
  painel para não haver dois códigos vivos para a mesma coisa.
- **A LP foi liberada, e os interruptores viraram junto com o texto.** Essa
  amarração está escrita em `lib/stores.ts` como regra: virar
  `APP_STORE_PUBLICADO` sem reescrever a página faria ela anunciar download no
  meio de "acesso antecipado" e "antes de chegar às lojas".
  - o formulário de lista de espera saiu do topo e do rodapé, e no lugar dele
    ficaram os selos das lojas mais um link discreto de usar pelo navegador;
  - **a barra de "vagas do lote de fundadores" saiu.** Ela estava cheia em 82%,
    com número inventado, e a frase "encerra no lançamento" virou FALSA quando o
    lançamento aconteceu. Escassez que a própria página desmente não pressiona
    ninguém, só ensina o leitor a não acreditar no resto. Isto é coisa
    diferente dos depoimentos, que o dono decidiu manter em 01/09;
  - as vantagens de fundador viraram o que o plano gratuito faz de verdade,
    tirado da tabela de planos do app, e não do que soaria bem;
  - as duas perguntas do FAQ sobre entrar na lista e sobre quando o app fica
    disponível viraram "como faço para começar" e "o app já está disponível".
- **Terceiro buraco na mesma regra, no mesmo dia.** Ontem `lib/email` entrou na
  conferência do travessão; hoje foi `lib/i18n`, e eram 24 ocorrências nos dois
  idiomas. É a LANDING, a página que o CLAUDE.md cita por extenso na regra e a
  que recebe o anúncio pago. A conferência cobria as telas do app e não cobria
  a porta de entrada. Cada travessão foi trocado pelo que o papel dele pedia
  (dois pontos em título, vírgula em aposto, parênteses quando era par), não
  por regra cega. Provada mordendo.

## 2026-09-03 · Devolução ao QA e seniorização do papel
- As duas afirmações erradas da rodada de 02/09 foram corrigidas NO LUGAR onde
  foram escritas (com o texto original riscado e a correção embaixo), e não só
  numa entrada nova. Diário é memória compartilhada: linha errada que fica
  intacta volta a ser lida como verdade daqui a um mês.
- O manual do papel ganhou seis direcionamentos novos, todos tirados do mesmo
  dia, e nenhum é sobre procurar melhor. São sobre CONCLUIR melhor:
  7. contradição que você mesmo escreveu é achado, não pendência para outro
     agente. Sai resolvida ou explicitamente não resolvida, nunca resolvida
     para o lado bom;
  8. número derivado não prova fato financeiro. "Período avançou" prova fatura
     emitida, não dinheiro recebido, porque fatura de R$ 0,00 é quitada na
     hora. Só `amount_paid` fecha afirmação sobre receita;
  9. conferência nova mira onde o padrão DÓI mais, não onde ele foi visto
     primeiro. Listar todos os lugares onde ele cabe e ordenar por
     consequência;
  10. ao terminar de mexer num arquivo, reler o arquivo inteiro com o defeito
      recém-consertado na cabeça. O irmão de um defeito mora ao lado dele;
  11. proteção que depende de campo opcional não é proteção. Toda trava precisa
      responder "como eu descubro que ela parou de valer?";
  12. conserto que nunca rodou em produção é TEORIA e leva etiqueta. Cada
      achado sai como MEDIDO, DEDUZIDO ou TEORIA. Misturar os três no mesmo
      tom de voz foi o que fez o erro do MRR passar despercebido.
- **Alçada ampliada, segunda flexibilização**: tratar erro não é mexer em
  cobrança. Fazer uma escrita olhar o `error`, registrar a falha e responder o
  código que faz o provedor reenviar passa a estar na alçada, desde que a
  operação seja idempotente e o DIARIO diga por quê. Mudar o que é cobrado,
  quando, quanto, ou o que a tela diz para quem pagou, continua recomendação.
  A regra por trás: tornar falha visível é sempre menos arriscado que deixá-la
  calada, e 02/09 é a prova pelo custo.
- A rotina ganhou uma parada obrigatória: fechar a conta do dinheiro
  (`assinaturas_conferencia` mais a fatura no Stripe) antes de escrever
  qualquer coisa sobre vendas.
- Fila: a compra pelas lojas foi REABERTA. Ela foi varrida, mas não tem uma
  única linha em produção, então tudo o que foi consertado lá é teoria até a
  primeira venda de loja acontecer.

## 2026-09-02 · A receita recebida é ZERO, e as três vendas foram com cupom
- Com o Stripe liberado, a conta fechou. E ela corrige duas coisas que EU e o
  agente de QA dissemos hoje, as duas na mesma direção: otimistas demais.
- **As 3 vendas usaram cupom de 100% do primeiro mês.** `MENSAL-ALESSANDRO100`
  duas vezes (asueyoshi26, eng.avilanova) e `MENSAL-LANCAMENTO100` uma
  (luizfmviana). Todos `duration: once`.
- **Ninguém pagou nada ainda. R$ 0,00 de caixa.** Eu escrevi que o luizfmviana
  tinha pagado R$ 29,90, e o agente de QA escreveu "R$ 29,90 de MRR real, a
  cobrança entrou". Os dois errados: a fatura dele de 01/09 saiu com subtotal
  R$ 29,90, desconto R$ 29,90 e **total R$ 0,00**. O cupom foi consumido
  exatamente nessa primeira cobrança pós-teste.
- Quem estava certo era o número que os dois ignoraram: `receita 30d = 0,00`.
  MRR é PROJEÇÃO do plano; recebido é caixa. Ler um pelo outro é o erro, e ele
  aconteceu duas vezes no mesmo dia, por duas leituras independentes. Por isso
  o painel agora diz "projeção do plano, não recebido" embaixo do MRR e mostra
  "Recebido 30d" ao lado.
- **As datas do primeiro dinheiro de verdade**: 01/10 (luizfmviana, R$ 29,90),
  04/10 (eng.avilanova) e 09/10 (asueyoshi26). Antes disso, 04/09 e 09/09 são
  só a virada do teste para o mês de cortesia, e vão sair R$ 0,00.
- Feito no código, com o dono liberando o caminho de cobrança:
  - **cupom gravado**: coluna `subscriptions.cupom`, carimbada na metadata da
    assinatura pela `/api/stripe/checkout` e copiada pelo `upsertSubscription`.
    As três vendas existentes foram preenchidas na mão a partir do Stripe. O
    painel ganhou "Vendas com cupom", com a quebra por código.
  - **escrita de assinatura parou de engolir erro**: `upsertSubscription` lança
    e o webhook do RevenueCat responde 500. É o 500 que faz o provedor
    REENVIAR, e o upsert é idempotente, então reenviar é grátis. Antes, um erro
    de banco de um segundo virava um cliente pagante sem Premium, calado, para
    sempre. Do lado da loja isso é pior porque não há segunda porta.
  - **compra da loja não termina mais em silêncio**: quando a loja volta sem
    erro e sem o direito propagado, abre a confirmação em vez de deixar a
    pessoa olhando o paywall que ela acabou de pagar. Desistência continua
    saindo calada (`compraCancelada`).
  - **`conferir:gravacao` passou a mirar `subscriptions` também.** A versão da
    manhã mirava só `funil_eventos`, e no MESMO arquivo que ela foi escrita
    para consertar havia três `upsert` engolindo erro três linhas acima.
    Conferência que nasce de um padrão precisa mirar onde ele dói mais.

## 2026-09-02 · As duas fontes de "quem assinou" não batiam, e ninguém comparava
- Pergunta do dono: "como que não está considerando? tivemos várias compras
  com cupom e todos receberam Premium". Ele estava certo, e o erro era meu: eu
  respondi olhando o FUNIL, que é a medição, e não `subscriptions`, que é a
  fonte da verdade sobre quem tem Premium.
- O que estava desencontrado, em três lugares:
  1. **O painel contava 2 assinaturas e havia 4 contas com Premium.**
     `lib/operacao.ts` filtrava `status === 'active'`, enquanto o app
     (`store.tsx`) e o `/api/stripe/sync` contam `active` E `trialing`. Duas
     definições de assinante no mesmo produto, e a mais estreita alimentava o
     painel. Mesmo erro de unidade do funil, em outro lugar.
  2. **Faltava o `assinou` do único cliente que já pagou de verdade**
     (luizfmviana, R$ 29,90, ativo até 01/10). Ele assinou em 25/08 23:52,
     ANTES de a segunda porta (`/api/stripe/sync`) existir. O evento nunca foi
     gravado e ninguém voltou para gravar. O funil dizia 2 vendas; foram 3.
  3. **A cortesia do revisor das lojas** (`active`, anual até 2099, sem
     Stripe) entrava na mesma linha que venda.
- Consertado: `operacao.ts` passou a usar a definição do app e a quebrar o
  número em pagantes, em teste e cortesias; o evento de 25/08 foi gravado com
  origem `stripe-retroativo` e o carimbo de tempo REAL da venda, não o do dia
  em que foi gravado.
- **A peça que faltava, e é o pedido de verdade**: a view
  `assinaturas_conferencia` compara as duas fontes linha a linha e dá um
  veredito por conta (ok, cortesia, FALTA o evento, DUPLICADO). O painel mostra
  "Vendas sem evento" só quando o número é maior que zero. Antes disso, a única
  forma de descobrir uma divergência era alguém perguntar na mão.
- **Lacuna aberta, e é a pergunta que ainda não tem resposta nossa**: o CUPOM
  não é gravado em lugar nenhum. Nem em `iniciou_checkout`, nem em `assinou`,
  nem em `subscriptions`. "Quantas vendas vieram com cupom" hoje só o Stripe
  responde. Proposta com o dono.

## 2026-09-02 · O link de venda não vendia depois do login social
- Relato do dono: clicou em mentorque.com.br/ALE100, caiu na tela de entrar,
  entrou com o Google e foi parar na tela inicial. Sem pagamento e sem cupom.
- A causa vale ficar guardada porque volta em qualquer coisa que dependa de
  estado atravessando um login social: o plano e o cupom saíam da URL na
  abertura e viviam em `useState`/`useRef`, ou seja, na MEMÓRIA DA PÁGINA. Só
  que login social na web não é uma tela do app: o navegador sai do nosso
  domínio, vai ao provedor e volta, e a página inteira recarrega. Pior, os
  parâmetros já tinham sido apagados da URL logo na abertura (de propósito),
  então nem a URL de volta lembrava.
- No app das lojas isso nunca apareceu porque lá o login é nativo e a página
  não recarrega. Era um defeito que só existia na web, que é justamente onde os
  links de venda são clicados.
- A compra pendente passou a morar no armazenamento (`lib/app/vendaPendente.ts`),
  com validade de 30 minutos e esquecimento na chegada, para consertar sem
  criar o defeito oposto: pendência eterna despejaria a pessoa num pagamento
  que ela não pediu, dias depois.
- A suíte `venda` estava VERDE e conferia só a ida. Ganhou o caso da travessia:
  atalho com cupom, recarga, e a compra tem que continuar lá. Plantei o defeito
  antigo e a suíte reprovou em 7 pontos.
- "Entrar com a Apple" no site continua desligado, e agora com o caminho
  escrito: `docs/login-apple-web.md`. Falta um Services ID na conta da Apple, e
  a armadilha é o domínio, que é o do Supabase e não o nosso.

## 2026-09-02 · O app fecha ao responder o quiz no Android, e o funil confirma
- Relato de usuário. O nosso próprio funil registrou o mesmo no mesmo dia: um
  Android na 1.6.0 abriu às 12:32:34, respondeu o quiz às 12:32:41 e disparou
  `abriu_app` DE NOVO às 12:32:48. Esse evento deduplica em memória, então sair
  duas vezes só é possível se o JavaScript tiver morrido e renascido no meio.
- Descartados com evidência: erro de JavaScript (nenhuma linha em `app_erros`
  desde 28/08, com o coletor vivo), a rota do quiz (gravou a resposta antes da
  queda), a tela (a suíte de navegador percorre o caminho inteiro limpa).
- Suspeito, sem prova: o plugin de notificação local, que é o único código
  nativo no instante da resposta e que só voltou a ser chamado de verdade em
  28/08, quando o defeito do `.then()` foi corrigido.
- Feito, e nenhum dos três é o conserto: uma migalha do último passo que
  transforma "o app sumiu" numa linha em `app_erros` (`lib/app/ultimoPasso.ts`,
  conferida por `npm run conferir:migalha`, com três defeitos plantados e
  acusados); o tratamento de renderizador morto no `MainActivity`, para o app
  recarregar em vez de desaparecer; e a retirada das duas chamadas nativas
  desnecessárias do caminho da resposta.
- Tudo isso só vale com binário novo. Investigação completa em
  `docs/qa/app-fecha-no-quiz.md`, incluindo o que falta perguntar ao usuário.

## 2026-09-01 · Não era falta de localStorage, era o `crypto.randomUUID` do Android
- As primeiras horas da 1.6 em produção mostraram o formato dos ids novos:
  todo evento vindo de Android traz id no formato do sorteio de reserva
  (`mtivmchs-pxlw`, tempo em base36 mais aleatório) e o do iPhone veio como
  UUID de verdade. Conclusão: `crypto.randomUUID` NÃO existe na WebView do
  Android aqui.
- Isso CORRIGE o diagnóstico que eu mesmo escrevi de manhã. Eu disse que
  `sem-armazenamento` era aparelho sem localStorage. Na 1.5, o
  `crypto.randomUUID()` ficava dentro do MESMO try do localStorage: ele
  lançava, o catch engolia e todo Android caía no texto fixo. Não era
  armazenamento faltando, era o sorteio falhando.
- Também explica a linha com 20 eventos em 9 dias e 4 versões do app: não era
  um aparelho esquisito, era o Android inteiro colado num id só.
- A 1.6 conserta por tabela, porque `sorteia()` ganhou try/catch próprio. A
  lição ficou escrita em `lib/app/anon.ts`: catch que cobre duas operações
  diferentes transforma dois defeitos em um sintoma, e o sintoma aponta para
  o lado errado.

## 2026-09-01 · Google Ads: a janela do custo não enxergava hoje
- O nó "Google Ads: custo 7 dias" usava `DURING LAST_7_DAYS`, e essa janela
  do GAQL EXCLUI o dia de hoje. Ou seja, gasto do mesmo dia nunca poderia
  aparecer no retrato, e a primeira pergunta sobre a campanha nova cairia
  justamente nesse buraco.
- Trocado por `segments.date BETWEEN` com datas calculadas, workflow
  publicado (a versão ativa é a publicada, não o rascunho) e rodado em
  produção. Continua vazio, o que agora é informação de verdade: a conta
  6724308347 não teve entrega nenhuma, não é a janela escondendo.

## 2026-09-01 · 1.6 aprovada nas duas lojas, e o aviso de versão apontando para ela
- Aprovada na Play e na App Store no mesmo dia do envio. `/api/app/latest`
  foi para 52/52: quem está na 1.5 passa a ver o banner de versão nova.
- **Android 52 é fato**, da linha `versionCode deste envio: 52` no log do
  Codemagic. **iOS 52 é dedução**, e o arquivo diz de onde ela vem: o passo
  incremental do iOS usa o mesmo `PROJECT_BUILD_NUMBER + 1`, e a 1.5 saiu com
  51 quando o piso do gradle era 13, o que prova que aquele 51 veio do
  CONTADOR e não do piso. Marcado como dedução de propósito; se a App Store
  mostrar outro número, o conserto é uma linha.
- **Falso alarme meu, o segundo com o mesmo número.** Tratei o "Index: 12" da
  tela do Codemagic como se fosse o PROJECT_BUILD_NUMBER, concluí que o envio
  sairia com versionCode 14 e seria recusado pela Play, e pedi para cancelar
  a build. O contador é do PROJETO e já estava perto de 51. Eu tinha visto a
  contradição entre "índice 12" e "1.5 saiu com 51", escrevi que não sabia
  qual leitura valia, e mesmo assim agi como se a ruim fosse a provável.
  A regra que fecha isso, agora escrita no gradle.properties e no
  /api/app/latest: a ÚNICA resposta é a linha `versionCode deste envio: N` do
  log. O Index da tela não é, e o número do gradle.properties também não é.
- A partir de agora a cadeia da primeira sessão começa a encher. Antes de ler
  qualquer taxa dela, lembrar que ela é SEM MEDIÇÃO para tudo que veio antes
  de 01/09, e o /api/dados diz isso sozinho.

## 2026-09-01 · 1.6: a primeira sessão deixa de ser caixa preta
- **Decisão do dono**: subir versão nova em vez de esperar, porque continuar
  sem os eventos da primeira sessão é gastar em anúncio sem saber onde a
  pessoa para.
- **Três eventos novos**: `comecou_onboarding`, `terminou_onboarding` e
  `abriu_cadastro_de_carro`. Entre abrir o app e cadastrar o carro não havia
  degrau nenhum, e os dois consertos possíveis são OPOSTOS: ninguém acha o
  formulário, ou acha e desiste no meio. Sem o degrau do meio, escolher entre
  eles era chute.
- Os três são ATOS, um por aparelho: dedup em localStorage no app
  (`umaVezPorAparelho`) e índice único no banco como piso. Se fossem por
  sessão, a etapa só cresceria e a taxa viraria ficção. A saída do onboarding
  passou a ter um portão único, `sair(origem)`, porque `finishOnboarding` era
  chamado de cinco lugares e instrumentar os cinco é pedir para um ficar de
  fora na próxima mexida.
- **A armadilha das quatro listas** virou conferência. Evento novo precisa
  estar no tipo do app, no `EVENTOS_DO_APP` da rota, no `check` da tabela e na
  `NATUREZA` do funil. Esquecer na rota devolve 400 e a métrica some em
  silêncio; esquecer no banco recusa o insert. `conferir:funil` lê os quatro
  arquivos e reprova se divergirem, provado plantando o esquecimento em cada
  um dos três primeiros.
- Vão junto no build: o conserto do `anon_id` na origem (que de quebra
  destrava o quiz para aparelho sem armazenamento) e os cinco travessões em
  texto de tela.
- Textos de loja e o teste de aparelho em `docs/lojas/novidades-1.6.md`. O
  teste tem um desenho de propósito: passar o onboarding, abrir o cadastro de
  carro e SAIR sem salvar, para provar que o degrau novo separa "desistiu no
  formulário" de "nem chegou lá".

## 2026-09-01 · Os dois consertos que o dono mandou fazer: identidade no banco e as aulas sem vídeo
- **Identidade.** `sem-armazenamento` era um texto fixo que virava UMA pessoa
  para todos os aparelhos sem localStorage. Agora existe
  `public.identidade(anon_id, user_id)`, uma função só, usada por todas as
  views, e sem armazenamento não é identidade. As views expõem
  `aberturas_sem_identidade` para o ponto cego não sumir. A semana de 24/08
  saiu de 17 para 16 e declara 11 aberturas de 84 sem identidade possível. Na
  origem, cada sessão sem armazenamento sorteia o seu id (mantendo o prefixo),
  o que de quebra conserta o quiz, que tem índice único por (dia, anon_id) e
  deixava o primeiro aparelho sem armazenamento bloquear todos os outros.
- **As 7 aulas que prometiam vídeo** viraram artigo com explicação completa:
  quando fazer, como saber que passou da hora, o que custa adiar, e quando
  vale levar na oficina. O passo a passo por nível continua intacto embaixo.
  Direcionamento do dono: quando o vídeo for gravado, ele volta como REFORÇO
  e o `body` não se apaga. Lista priorizada em
  `docs/conteudo/videos-a-gravar.md`, com o caminho de volta em duas linhas.
- **Três conferências novas**, todas provadas com o defeito plantado antes de
  entrarem: `conferir:travessao` (o título da home tinha ido para o ar com
  travessão, contra regra do dono), `conferir:identidade` (o texto fixo
  voltando a contar como gente, e o prefixo divergindo do banco) e
  `conferir:catalogo` (aula dizendo vídeo sem ter vídeo, e link `[[id]]`
  morto). Foi a contagem à mão do agente de Conteúdo que achou as sete;
  contagem à mão acha uma vez, conferência acha todo dia.
- Fechados por conferência, sem mudança: a LP `/barulho-no-carro` está no ar,
  indexável e com canonical certo (peguei pela API da Vercel, que era a rota
  que o agente não tentou); e o erro `LocalNotifications.then()` do retrato
  morreu em 29/08, com o commit b28e577 e a 1.3.

## 2026-09-01 · Ações do dono, e o manual do ASO reescrito com o que a rodada expôs
- **Título da Play trocado** para `Mentorque: manutenção do carro` (era
  `Mentorque: cuidar do carro`). Aplicado pelo dono no console; não depende de
  versão nova. A metade da Apple (nome, subtítulo e palavras-chave) espera o
  próximo envio, porque a 1.5 já subiu em 31/08. Data para reler e o que fazer
  em cada desfecho: `docs/lojas/ficha.md`, seção "Propostas aplicadas".
- **Anúncios do Google Ads começaram hoje.** Toda leitura de aquisição a
  partir daqui tem tráfego pago misturado, e campanha faz subir busca por
  MARCA, que cai na mesma linha de "Pesquisa do Google Play" que a busca por
  categoria.
- **Prova social fabricada: o dono decidiu não mexer agora**, com o inventário
  completo e o risco de política das lojas na mão. Registrado em
  Direcionamentos: não reabrir como prioridade em toda rodada.
- **Coleta de métricas e Vigia de anomalias ativados**; as 11 fontes fechando,
  inclusive o braço de avaliações da Play, que era ponto cego.
- **Manual do ASO & Lojas reescrito, não acrescentado.** A rodada de hoje
  acertou o raciocínio e errou quatro fatos conferíveis em menos de um minuto
  cada, e o motivo era estrutural: as regras estavam no rodapé como
  "aprendizados" e a rotina no topo. Agora cada conferência é parte do passo
  que a exige, existe um pré-voo de sete perguntas antes de publicar, uma
  tabela de "o que cada fonte prova" e um formato obrigatório de proposta com
  condição de volta atrás. Os `grep` de prova social do manual foram rodados
  para provar que mordem: acham os 9 depoimentos nos 3 arquivos e os 3 números
  inventados.

## 2026-09-01 · Conteúdo & SEO: pauta do freio, e o catálogo não tem freio
- Artifact "Conteúdo da semana":
  https://claude.ai/code/artifact/80d35894-28cc-4e20-9fbf-d05d012b50d2
- ENTREGA DA RODADA (formato b, pauta de gravação), em
  docs/conteudo/pautas.md, arquivo novo que vai crescer a cada rodada de
  pauta: "O barulho que o freio faz de propósito". Short 9:16 de 50 a 70s,
  com roteiro falado por trecho, o que precisa aparecer em cada plano,
  título, descrição e tags do YouTube, e o trecho de código pronto para
  colar no catálogo faltando só o id do vídeo.
- Gancho: o chiado não é o freio quebrando, é uma lingueta de metal fazendo
  o que foi feita para fazer. E o vídeo não para no "é normal", que seria
  irresponsável em freio: ele separa TRÊS barulhos (aviso, aviso que já
  passou, alarme falso), que é a informação que a pessoa não tem.
- ACHADO QUE ESCOLHEU A PAUTA, contado no próprio código, não por intuição:
  o catálogo tem 43 Shorts publicados e NENHUM sobre freio (estão todos em
  fundamentos, cultura, esportivos e economia). Pior: o catálogo inteiro tem
  UMA aula com system "brakes", a brake-pads, que é premium, é passo a passo
  de troca e está marcada como vídeo sem ter vídeo. Quem chega com medo do
  barulho não tem para onde ir de graça.
- Também contado: 7 aulas estão marcadas como type "video" sem media
  (oil-change, brake-pads, obd2-scan, diy-battery, diy-airfilter,
  diy-wipers, cult-history). As seis primeiras são as de mão, justamente as
  que a pessoa abre em pé do lado do carro. A tela degrada bem (mostra a
  arte de "vídeo ainda não publicado"), então não é defeito, é buraco.
- DECISÃO registrada na pauta: quando gravado, o vídeo entra como aula NOVA
  e GRATUITA da trilha de diagnóstico, não dentro de brake-pads. Prender um
  gancho de diagnóstico atrás do paywall desperdiça o gancho.
- Fila anterior corrigida: o item #2 ("reescrever diag-noises") JÁ FOI FEITO
  na rodada de IA de 25/08. Fila reescrita, ver abaixo.
- LP da rodada passada: código íntegro na main, conferido no HTML gerado
  desta rodada (indexável, canonical no domínio certo, no sitemap). NÃO deu
  para confirmar que está no ar: o proxy desta sessão recusa conexão com
  www.mentorque.com.br (403 no CONNECT). Fica para quem tem navegador.
- Busca segue 0 clique e 0 impressão, esperado para página de uma semana, e
  com a ressalva de que o dado do retrato é de 23/08, anterior à própria LP.
- CONTINUA DE PÉ, e não é deste papel fazer: pedir indexação da home e da
  /barulho-no-carro no Search Console, já que o canonical das duas mudou.
- Próximas: (1) artigo novo e gratuito sobre freio, formato estruturado
  PT+EN, para preencher o buraco contado acima; (2) LP /luz-de-injecao,
  que nasce apoiada em 3 Shorts que já existem e no sintoma cel.

## 2026-09-01 · ASO & Lojas: o coletor de avaliações estava cego, e o paywall tem depoimento inventado
- Primeira rodada deste papel (dias 1 e 15). Artifact "Lojas da quinzena":
  https://claude.ai/code/artifact/8ada176f-b6a6-4600-a8d2-db39e698abda
- ACHADO DA RODADA, e é o que trava o papel inteiro: o workflow "Analista:
  avaliações das lojas" (n8n, id alUhElmOXhTjGJTj) rodava todo dia, marcava
  SUCESSO e devolvia 0 avaliações mesmo que houvesse avaliação no feed. O node
  HTTP com `fullResponse` entrega o corpo em `data`, e o código lia
  `resp.body`, que nunca existiu. Caía no fallback `?? resp`, procurava `feed`
  dentro do envelope da resposta, não achava, e devolvia lista vazia SEMPRE.
- Prova, não suspeita: a execução 8397 (01/09 10h00) guarda a resposta crua.
  Replicando o código dela fora do n8n, com o mesmo envelope, o de produção
  devolve 0 nos dois casos (feed vazio e feed com uma avaliação de 5
  estrelas) e o corrigido devolve 0 e 1. O defeito é o parser, não a Apple.
- CORRIGIDO no n8n e publicado (nova versão ativa d05e05b9): o node passou a
  ler `resp.data ?? resp.body`. Execução de conferência 8398, sucesso, 0
  avaliações, que agora é um zero de verdade. Nada foi gravado no banco
  porque o fluxo só faz POST quando há avaliação.
- Nenhuma avaliação foi perdida: o feed de hoje veio genuinamente vazio (408
  bytes, sem `entry`). O defeito nunca engoliu avaliação existente, mas teria
  engolido a primeira que chegasse, em silêncio e com carimbo de sucesso.
- PONTO CEGO QUE CONTINUA: Google Play não é coletado. O coletor lê só o feed
  público da Apple, loja BR. O workflow diz que a Play entra quando a
  credencial da conta de serviço for colada no n8n. Enquanto isso, "zero
  avaliações" significa "zero na App Store BR", e avaliação na Play não
  aparece para ninguém do time.
- Avaliações nesta rodada: nenhuma para responder e nenhuma para virar
  depoimento da LP. Nada rascunhado, nada marcado.
- ALERTA PARA O QA, e não é sobre erro de código: o paywall do app mostra dois
  depoimentos INVENTADOS, com cinco estrelas douradas e nome de pessoa
  ("Pedro S." e "Juliana M."), em `lib/app/content.ts:1554`, renderizados em
  `components/app/screens/Subscribe.tsx:627`. A LP já tinha esvaziado os dela
  de propósito, com comentário explicando que a seção volta sozinha quando
  houver depoimento real (`lib/i18n/strings.en.ts:142`). A limpeza não chegou
  ao app, que é justamente o que vai para as lojas. Com 0 avaliações e 2
  assinantes, aquilo é prova social fabricada na tela onde a pessoa paga.
- NÃO MEXI de propósito, e o motivo importa: o paywall é superfície do CRO,
  tem experimento aberto com veredito marcado para 20/09, e o dono decidiu em
  23/08 que mudança de paywall passa por aprovação dele. Tirar o bloco agora
  contamina a leitura do experimento. A decisão é do Rodrigo, e a recomendação
  é tirar, não esperar ficar confortável.
- POR QUE NINGUÉM AVALIA, com número: o app tem uma máquina de pedir nota bem
  construída (`lib/app/feedbackPrompt.ts`), neutra, com três bons momentos
  (primeiro serviço, três aulas, resposta útil da Biela) e carência de 3 dias
  de uso. Ela está correta e ligada nos três lugares. Só que das 17 pessoas da
  semana passada sobraram 2 ativas nesta, e a coorte de 24/08 tem 0 voltando
  em 1 a 7 dias. O conjunto de gente que pode ser convidada a avaliar tem no
  máximo 2 pessoas. Avaliação aqui é consequência de retenção, não de ASO.
- PROPOSTA DE FICHA DA QUINZENA (registrada em docs/lojas/ficha.md, seção
  "Propostas abertas", para o Rodrigo colar nos consoles): trocar o título de
  `Mentorque: cuidar do carro` (26 de 30) por `Mentorque: manutenção do carro`
  (30 de 30). O título é o campo de maior peso na busca da Play e hoje gasta
  esse peso em `cuidar`, verbo que ninguém digita. Na Apple a mesma troca
  libera `manutencao` e `oficina` do campo de palavras-chave (`oficina` já era
  desperdício, está no subtítulo), abrindo espaço para `oleo`, `bateria` e
  `suspensao`: de 12 para 13 termos, 95 de 100 caracteres.
- Detalhe prático da proposta: na Play o título muda na hora, sem release. Na
  Apple, nome, subtítulo e palavras-chave só mudam junto com o envio de uma
  versão, e a 1.5 JÁ SUBIU em 31/08 (build 51), então essa metade espera o
  próximo envio. Escrevi primeiro que pegaria carona na 1.5 e a rodada do
  Diretor de hoje, lida no rebase, desmentiu: corrigido aqui, na ficha e no
  artifact. Vale como aviso: o retrato que li às 9h ainda dizia "iOS 1.1
  aguardando revisão", nove dias atrasado, e por isso não serve para saber o
  que está publicado.
- O retrato continua dizendo "iOS 1.1 WAITING_FOR_REVIEW" com a 1.4 em
  produção, porque as fontes externas pararam em 23/08 (nono dia). Sem elas
  não há downloads, nem conversão da ficha, nem Android vitals: a proposta de
  título terá que ser lida no Play Console à mão até essa coleta voltar.
- Recomendações: (1) tirar os dois depoimentos inventados do paywall antes de
  qualquer campanha, decisão do Rodrigo com o CRO; (2) colar a credencial da
  conta de serviço da Play no n8n, senão metade das avaliações segue invisível;
  (3) aplicar a troca de título na Play hoje e a da Apple junto com a 1.5.

## 2026-09-01 · Placar das prioridades do Diretor: as três fechadas

- PRIORIDADE 1 (conferir as faturas antes de cobrarem alguém): CONFERIDA e
  ENCERRADA, com prova nas duas assinaturas. A fatura de R$ 0,00 que abre o
  teste NÃO consome o cupom de 100%. A Upcoming invoice de cada uma mostra
  subtotal R$ 29,90, o desconto e total R$ 0,00: luizfmviana em 01/09 (cupom
  "1 mês grátis (lançamento)") e eng.avilanova em 04/09 (cupom do
  Alessandro). Ninguém foi cobrado errado, e a primeira receita real segue
  prevista para outubro. O fato virou aprendizado permanente na skill.
- Susto no caminho, que vale como aprendizado: o painel do Stripe abre no
  filtro "Active", e assinatura em teste tem status `trialing`. Por um
  momento pareceu que as duas assinaturas tinham sumido. Elas estavam no
  filtro "All" o tempo todo.
- PRIORIDADE 2 (publicar a 1.5): FEITA pelo dono. 1.5 em produção nas duas
  lojas desde 31/08, código de versão 51 na Play e build 51 na App Store.
  Ela leva o convite "salve sua garagem", que é a aposta contra a passagem
  de 12%. A medição dessa passagem é da próxima rodada.
- PRIORIDADE 3 (consertar o retrato): FEITA, e o diagnóstico era pior que o
  relatado. O banco mostra que a coleta de fontes externas morreu em 23/08 às
  21h43: as onze fontes escreveram uma vez e nunca mais. A causa está fora do
  código (o workflow "Métricas externas" do n8n é desligado por decisão,
  esperando as chaves, e o Vigia de anomalias, que avisaria de coleta parada,
  também está desligado).
- O que ERA nosso foi consertado: /api/dados passou a devolver
  `frescorDasFontes` (dias parados por fonte) e `avisoDeColeta`. E havia uma
  segunda armadilha ainda não disparada: a consulta filtrava 10 dias, então
  em 03/09 o bloco INTEIRO sumiria sozinho, sem distinguir "não há o que
  coletar" de "a coleta morreu". Commit 437f774.
- Achado de operação que virou regra no manual do Diretor: relatório semanal
  é o veículo errado para prazo que vence antes da próxima rodada. A
  prioridade 1 vencia no dia seguinte ao relatório e só foi conferida porque
  o dono perguntou por acaso.
- Também corrigido: o /api/app/latest apontava para a 1.2 e depois para um
  número tirado do gradle.properties (12), que o CI ignora como valor. O
  versionCode real vem do contador do Codemagic. Agora aponta para 51 nas
  duas lojas (commit 42470ac).

## 2026-08-31 · Diretor: relatório da semana (24 a 30/08)
- Artifact "Semana Mentorque":
  https://claude.ai/code/artifact/1f36cdce-15be-4417-bf40-0e4ca3ab40f7
- O app saiu do zero: 17 pessoas e 84 aberturas na semana, contra 2 e 4 na
  anterior, com 4,9 aberturas por pessoa (a régua emprestada pede acima de
  2). Não veio de canal nenhum: 0 clique na busca, sem campanha, o único
  cadastro marcado como acesso direto. É amostra que chegou pela mão do
  dono, e o relatório diz isso.
- ACHADO DA RODADA, e é o que muda planejamento: as DUAS assinaturas reais
  do Stripe carregam cupom de 100% ("1 mês grátis"), MENSAL-LANCAMENTO100 e
  MENSAL-ALESSANDRO100, os dois `duration: once`. Somando 7 dias de teste
  mais um mês por conta da casa, a primeira cobrança de verdade cai em
  OUTUBRO (01/10 e 04/10), não em setembro. Todas as faturas emitidas até
  hoje somam R$ 0,00 e a conta recebeu R$ 0,00.
- DÚVIDA REGISTRADA, não fechada: o cupom vale por uma fatura e a fatura de
  abertura do teste já saiu zerada. Se o Stripe considerar o cupom gasto
  ali, a fatura de 01/09 20h52 cobra R$ 29,90 de quem ouviu "1 mês grátis".
  Indício de que não: o desconto continua pendurado nas duas assinaturas.
  Indício não é prova, então virou a prioridade 1 com data e hora.
- Segunda assinatura real é NOVA da semana: 28/08 10h20, cupom do
  Alessandro. A de 25/08 é a que o webhook perdeu; o conserto de 26/08 fez a
  de 28/08 nascer no funil. Por isso funil diz 1 e Stripe diz 2, e a
  diferença está explicada.
- O GARGALO agora tem denominador: 15 das 17 pessoas usaram o app sem criar
  conta (12% de passagem). E a mídia paga começa nesta segunda, então pagar
  por instalação com essa passagem é encher balde furado.
- CORREÇÃO FEITA NA PRÓPRIA RODADA: o relatório saiu primeiro com 1 cadastro
  e 6% de passagem, copiando o funil. O dono reconectou o banco no meio da
  rodada e a conferência mostrou 2 CONTAS criadas na semana (25/08 e 28/08),
  não 1. O funil perdeu a de 25/08 pela janela de 15 minutos, corrigida em
  26/08, exatamente o mesmo motivo do `assinou` perdido no mesmo dia. Os
  dois consertos funcionaram; a diferença é passado conhecido.
- Fato pequeno e bom que só apareceu com o banco: as DUAS pessoas que
  criaram conta na semana são as duas que assinaram. Duas pessoas não são
  taxa de conversão, e o relatório diz isso, mas combina com o resto: quem
  passa da porta vai longe, e a porta é que está estreita.
- Os erros de lembrete PARARAM: aconteceram em 27, 28 e 29/08 e nenhum
  desde então, o que já é sinal de que o conserto chegou aos aparelhos.
- Onde a pessoa vê o paywall hoje (12 eventos, 8 pessoas): Home 4 pessoas,
  Biela 2, onboarding anual 2, direto 1, busca 1, sintoma 1. O convite mais
  visto não é o do onboarding, é o da Home.
- ACHADO DE MEDIÇÃO: o bloco "onde o funil quebra" do /painel mostra 200% e
  400% nas passagens cadastro→ativação e ativação→paywall. Não é erro de
  conta: no nosso app a pessoa usa e vê o paywall ANTES de ter conta, então
  aquilo não é uma sequência. Enquanto ficar assim, aponta para o lugar
  errado. No relatório o funil foi desenhado na ordem real, com o cadastro
  fora da fila.
- PLACAR das prioridades de 24/08: build às lojas FEITO (saíram 1.2, 1.3 e
  1.4, e a 1.5 está pronta); YouTube MEIO (8 vídeos do canal viraram aulas
  em 29/08, mas não dá para confirmar audiência); conta do revisor NÃO
  FEITA (o retrato ainda diz "ativas: 1, anuais 1, mensais 0", contando o
  revisor e ignorando os dois clientes em teste).
- Erros do app: 0 → 12, todos `LocalNotifications.then()` (9 iOS, 3
  Android). É o defeito que o CRO achou e consertou. PREVISÃO VERIFICÁVEL
  para 07/09: esses erros vão a zero; se não forem, o conserto não chegou
  aos aparelhos.
- Prioridades: (1) conferir as faturas de 01/09 20h52 e 04/09 10h20 antes
  que cobrem alguém; (2) publicar a 1.5 (que leva o convite "salve sua
  garagem") antes de subir orçamento de campanha, e medir a passagem contra
  os 6% de hoje; (3) consertar o retrato, cujas fontes externas pararam em
  23/08 e que hoje afirma "Stripe: 0 assinaturas" e "iOS 1.1 aguardando
  revisão" com a 1.4 em produção.
- Fontes nesta rodada: Stripe AUTORIZADO pela primeira vez e foi a
  diferença da rodada; banco (Supabase) começou recusando por falta de
  permissão e foi reconectado pelo dono no meio da rodada; /api/funil segue
  bloqueada; fontes externas do retrato paradas há 8 dias; Web Analytics da
  Vercel segue desativado.
- DIRECIONAMENTO DO DONO (31/08), gravado no manual: nunca entregar análise
  sem o banco respondendo. Se ele não responder, parar e avisar, em vez de
  analisar só com o retrato.

## 2026-08-29 · O "Fale com a gente" mandava para um endereço que nunca existiu
- Achado pelo dono ao configurar e-mail corporativo, e a bronca dele procede.
  O formulário de suporte do app envia pelo Resend para FEEDBACK_TO ou, sem a
  env, para contato@mentorque.com.br. A env NUNCA existiu na Vercel, e o
  domínio nunca teve MX até 28/08: toda mensagem de suporte foi aceita pelo
  Resend, quicou depois em silêncio, e o app disse "enviado" para a pessoa.
- Por que nenhuma conferência pegou: a rota confere `res.ok` do Resend, mas o
  Resend aceita o envio NA HORA e o bounce é assíncrono. "O carteiro aceitou"
  foi tratado como "chegou". Nenhuma rodada provou que ESTE cano mordia
  (mandar um feedback de teste e ver cair numa caixa real).
- Recuperação: o painel do Resend guarda os envios com corpo completo (nome,
  e-mail e mensagem da pessoa). Emails → filtro Bounced = as mensagens
  perdidas, respondíveis uma a uma. O dono foi orientado a olhar.
- Correção de causa: o dono está criando os apelidos contato@ e suporte@ no
  redirecionamento do domínio (ImprovMX → Gmail), o que dá vida ao endereço
  padrão com ou sem env.
- PREVENÇÃO DA CLASSE (para a próxima manutenção da Sentinela, junto com o
  POST no webhook do Stripe): (1) checar por DNS que o MX da raiz existe e
  aponta para onde esperamos; (2) uma vez por mês, enviar um feedback de
  teste pelo formulário e conferir que ele CHEGA na caixa. A regra geral:
  destino padrão de qualquer canal precisa de prova de vida periódica;
  aceito pelo transportador não é entregue.

## 2026-08-29 · Webhook do Stripe morria num redirect que só máquina vê
- E-mail do Stripe ao dono: "trouble sending requests" para
  https://mentorque.com.br/api/stripe/webhook. Causa provada com um fetch: o
  domínio SEM www responde 308 Permanent Redirect para o COM www. Navegador
  segue e ninguém nota; o Stripe, de propósito, NÃO segue redirect em
  webhook, então toda entrega morria na porta. É a explicação do assinou
  perdido de 25/08 23:52: nunca foi um evento atrasado, era o cano entupido.
- CORRIGIDO no próprio Stripe: a URL do endpoint (we_1TzkccCOmPpbUXBI...)
  virou https://www.mentorque.com.br/api/stripe/webhook. Mesmo endpoint,
  mesma chave de assinatura, nada a mudar na Vercel. Conferido: o www
  responde a rota direto (405 em GET, que é o esperado), sem redirect.
- PENDÊNCIAS DO DONO: (1) reenviar pelo painel do Stripe os eventos que
  falharam há mais de 3 dias (o retry automático desiste; o de 25/08 23:52 é
  o que importa, reenviar grava o assinou e sincroniza a assinatura pelo cano
  normal); (2) conferir no painel do RevenueCat se o webhook de lá também
  aponta para o domínio sem www, porque a mesma parede vale para ele.
- LIÇÃO PARA A SENTINELA: o verde dela não cobre isso, porque monitor de
  uptime segue redirect como navegador. Entra na próxima manutenção: um POST
  sem assinatura no webhook, esperando 400 bad_signature; qualquer 3xx/404/5xx
  ali é o cano entupido de novo. A regra geral: URL registrada em serviço de
  terceiro usa SEMPRE o domínio primário (www), porque robô não segue
  redirect.

## 2026-08-28 · Correção ao achado do CRO: o login social NUNCA esteve travado
- O dono testou no aparelho (iPhone, app 1.2 da loja): deslogou e entrou com o
  Google normalmente. A 1.2 foi buildada em 27/08 17:06 UTC e o conserto só
  entrou na main em 28/08 11:34, então o teste rodou o código SEM o conserto.
  Se o defeito existisse ali, o toque ficaria sem resposta.
- A explicação está no pacote: o @capgo/capacitor-social-login NÃO exporta o
  proxy cru do Capacitor. `SocialLogin` é `new SocialLoginClient()`, uma
  classe comum que embrulha o proxy (rawSocialLogin) por dentro. Classe comum
  não tem `then`, então devolvê-la de função async não arma a armadilha.
- O achado das NOTIFICAÇÕES continua verdadeiro e provado duas vezes:
  @capacitor/local-notifications exporta o proxy cru (registerPlugin direto),
  e os 5 erros `LocalNotifications.then()` em app_erros são a prova de campo.
  A 1.2 publicada está com os lembretes mudos; o conserto sai no próximo build.
- O commit b28e577 fica como está: a caixa no socialLogin.ts é inofensiva
  (embrulhar o que não é thenable não muda comportamento) e a parte de
  notificacoes.ts é o conserto real.
- Lição para as rodadas: prova por leitura de código vale como hipótese, e o
  próprio CRO pediu o teste em aparelho que a derrubou pela metade. Antes de
  declarar um caminho quebrado, conferir COMO o pacote exporta o objeto
  (proxy cru ou classe embrulhada), porque a armadilha do `then` só existe no
  proxy cru. E não deixar a metade errada virar urgência: "login travado
  custa cadastro por dia" quase virou o motivo de uma release às pressas.

## 2026-08-28 · CRO (retenção): a máquina de trazer de volta estava desligada
- Rodada semanal do CRO/BeSci, foco RETENÇÃO (a anterior, de 23/08, foi a
  especial de conversão e jornada). Artifact "Conversão da semana":
  https://claude.ai/code/artifact/a2161771-1ea5-4a0c-b023-79168e7b6729
- VEREDITOS: nenhum vencido. Os dois experimentos abertos (cta-teste-por-plano
  e fim-do-lembrete-falso) só se leem a partir de 20/09. Fechar hoje seria
  achismo. O que entrou foi um acompanhamento honesto em fim-do-lembrete-falso:
  o interruptor voltou em 25/08 com plugin de verdade e a promessa continuou
  falsa por outro motivo, então o "depois" dele ainda não existiu.
- OUVIR O USUÁRIO: zero avaliações nas duas lojas, zero feedback no app. A
  única voz do usuário nesta semana foi app_erros, e ela disse muita coisa.
- ACHADO DA RODADA, e é o motor de retenção inteiro: nenhum lembrete local
  jamais saiu de nenhum aparelho. Causa provada no código do Capacitor 8.5
  (node_modules/@capacitor/core, createPluginMethodWrapper): o objeto do
  plugin responde a QUALQUER propriedade com uma chamada nativa, inclusive
  `then`. Objeto com `then` é promessa para o JavaScript, então devolver o
  plugin de dentro de uma função `async` faz o motor chamar
  `plugin.then(resolver, rejeitar)`; o aparelho responde que não conhece o
  método, e ninguém chama `resolver` nem `rejeitar`. A promessa da carga fica
  PENDENTE PARA SEMPRE.
- O estrago, que é silencioso e por isso durou: o interruptor de avisos do
  Perfil não reagia ao toque (a espera nunca terminava), o convite depois do
  quiz nunca aparecia, e nem o aviso do quiz das 9h nem o de fim do teste
  grátis eram agendados. Sem tela vermelha, sem reclamação. A prova estava em
  app_erros: 5 erros em 7 dias, 3 iOS e 2 Android, todos `.then()`.
- CORRIGIDO em lib/app/notificacoes.ts: o plugin passa a viajar dentro de uma
  caixa (`{ plugin }`), que não parece promessa, então nada chama `then` nele.
  De quebra, o canal do Android só é criado no Android. Tipos, build do site e
  build:native passando.
- MESMO DEFEITO ACHADO E CORRIGIDO em lib/app/socialLogin.ts, e este é de
  CONVERSÃO, não de retenção: `nativeSocialLogin` esperava por `loadPlugin()`,
  que nunca respondia. Quem tocasse em entrar com Google ou com a Apple dentro
  do app das lojas ficava esperando sem resposta e sem erro. Vale só para o
  app das lojas (no navegador o caminho é outro). Varredura feita nos demais
  plugins (App, Browser, AdMob, Purchases): todos são acessados de função
  síncrona e nenhum atravessa promessa, então o padrão não se repete.
  PARA O QA: isto precisa de conferência em aparelho real quando sair o build;
  aqui só deu para provar por leitura do código do Capacitor.
- APOSTA DA SEMANA registrada no caderno: [lembrete-que-chega]. Métrica em
  três partes (erros `.then()` de volta a zero, existir aparelho com permissão
  concedida, e voltaram_d1_7 das coortes), com leitura contada do BUILD
  PUBLICADO e não de hoje. A 1.1 ainda está em revisão na Apple.
- SEM TESTE A/B nesta rodada, de propósito, e seguindo o direcionamento do
  dono de 23/08. A maior quebra do painel é abriu_app → cadastro (11 pessoas
  viraram 0), mas o evento de cadastro só voltou a funcionar em 27/08: seria
  testar em cima de régua quebrada. `uso.coortes` está vazio pelo mesmo
  motivo, então a pergunta "quem experimentou volta?" não tem resposta
  legível esta semana. Duas semanas de medição consertada vêm primeiro.
- MAPA atualizado (v2): seção nova "O que traz a pessoa de volta", com as
  superfícies de retorno auditadas, e o registro dos dois consertos nos
  passos 4 e 5 da jornada.
- APRENDIZADOS gravados: em besci.md, que elemento tocável que não responde é
  pior que elemento ausente, e que "sem erro" não é sinal de que funciona; em
  analise-da-operacao.md, que coorte vazia hoje é régua nova, não abandono.

## 2026-08-27 · Sentinela mandava "voltou ao normal" a cada 12 horas
- Relato do dono, com print: oito e-mails "[Sentinela] Mentorque voltou ao
  normal" seguidos, com tudo funcionando. "Se está tudo funcionando, não
  deveria ficar avisando."
- CAUSA, confirmada na execução 8366: `suspeita: false` (tudo passou) e
  `avisar: true` ao mesmo tempo, com a assinatura guardada
  `Funil e banco (/api/funil):401` — uma falha de 22/08. O
  `delete sd.assinatura` nunca persistiu.
- O n8n só persiste a memória do workflow quando enxerga uma ATRIBUIÇÃO.
  `delete` apaga a chave dentro da execução e ela volta intacta na rodada
  seguinte. A prova estava no próprio histórico: a gravação da falha durou
  quatro dias, a limpeza nunca durou uma rodada.
- CORRIGIDO (v3 do workflow): limpeza por atribuição (`sd.assinatura = ""`),
  e o carimbo do problema passa a EXPIRAR em 24h. A Sentinela roda a cada 12h
  e refaz o carimbo a cada rodada durante uma queda real, então carimbo com
  mais de um dia é lixo preso, não queda em curso: some em silêncio, sem
  e-mail. É o que faz o defeito não voltar nem se a persistência falhar de
  novo por outro motivo.
- CONFERIDO: duas execuções seguidas depois do conserto pararam no "Recuperou?"
  com `avisar: false`, sem chegar ao nó de e-mail. O estado travado foi
  limpo sem gerar mais um aviso.
- APRENDIZADO que vale para todo agente com estado entre execuções: estado
  guardado precisa de prazo de validade. E alerta que chega quando está tudo
  bem é pior que não alertar — oito e-mails de nada ensinam o dono a ignorar o
  remetente, e o próximo aviso REAL compete com essa memória.

## 2026-08-27 · Recomendações do QA aplicadas, e feedback para o papel
- Pedido do dono: conferir a rodada de QA de 26/08 e aplicar o que faz
  sentido. Os achados foram verificados um a um contra o banco e o Stripe, e
  todos se confirmaram.
- APLICADO: o `assinou` passa a nascer TAMBÉM no `/api/stripe/sync`, não só no
  webhook. Em 25/08 uma assinatura real entrou no banco por ali e o funil
  ficou em zero. Não fere "o app não fabrica conversão": quem confirma é o
  servidor lendo o Stripe com a chave secreta. `trialing` conta, porque o
  cartão foi dado e a cobrança está agendada.
- APLICADO: índices únicos parciais em `funil_eventos` para `assinou` (por
  assinatura) e `cadastro` (por conta). A trava contra contagem dobrada ficou
  no BANCO e não no código, porque as duas portas podem chegar no mesmo
  segundo. `renovou` fica de fora de propósito: renovar de novo é fato novo.
  Ensaiado no banco, linhas de teste apagadas.
- APLICADO: `funil_semana` com as etapas em PESSOAS ao lado das que já
  existiam (a proposta que o QA deixou pronta). Primeiro número: os 4 eventos
  de paywall da semana de 24/08 são 2 pessoas, e os 3 de checkout são UMA. A
  taxa de passagem de 75% não existia.
- ACHADO NOVO, que o QA não pegou: o `cadastro` nunca nascia porque a janela
  era de 15 MINUTOS entre criar a conta e abrir o app. Nove contas em agosto,
  zero eventos. O cliente que assinou criou a conta às 21:18 e abriu o app às
  23:53. E o marcador local era gravado mesmo quando o evento NÃO saía, então
  um aparelho que perdesse a janela ficava mudo para sempre. Agora são 7 dias,
  o marcador só é escrito quando o evento sai, e a unicidade está no banco.
- SEGUE ABERTO, e é do dono: se as entregas do webhook de 25/08 saíram 2xx.
  A API do Stripe aqui não expõe o log de entregas e a Vercel no Hobby guarda
  1 hora. A urgência caiu (assinatura nova já é registrada pelo sync), mas
  `renovou`, `cancelou` e `expirou` ainda dependem só do webhook — e 01/09 é a
  virada de teste para cobrança do primeiro cliente.
- NÃO FEITO, de propósito: inserir retroativamente o `assinou` daquele
  cliente. A assinatura é real e o horário é conhecido, mas escrever em dados
  de produção sobre um fato passado é decisão do dono, não minha.
- FEEDBACK escrito no manual do QA (seção "Direcionamentos do dono"): o que
  manter (cruzar duas fontes que deveriam concordar; achar a armadilha e não
  só o defeito; recomendação como arquivo pronto) e o que mudar (zero suspeito
  vira tarefa e não nota de rodapé; vários zeros raramente têm uma causa só;
  esgotar a prova indireta antes de declarar aberto; conserto de medição se
  prova com número e não com build verde; achado com data vira lembrete).
- ALÇADA AMPLIADA: view e índice ADITIVOS passam a estar na alçada do QA, com
  ensaio no banco, arquivo em `supabase/` atualizado no mesmo commit e
  registro no diário. Foi o que faltou para a proposta da view render na
  própria rodada em que foi escrita.

## 2026-08-26 · QA: a primeira assinatura real existe e o funil diz que não
- Artifact "QA da Semana":
  https://claude.ai/code/artifact/eacadd3f-193d-41e4-bb7d-3cb4cfa73a0a
  (primeira rodada deste papel; não havia registro de QA anterior no diário,
  então nada foi repetido).
- ACHADO PRINCIPAL, e é notícia boa escondida atrás de um defeito: existe
  UMA ASSINATURA REAL, paga, no Stripe live. `sub_1U8U8h…`, R$ 29,90 no
  plano Mensal, criada em 25/08 às 23:52:23, em teste grátis até 01/09,
  cartão na mão, `user_id` fcd41994 no metadata. É o mesmo cliente do
  incidente do "quase pagou duas vezes" que já estava comentado no código.
  Não é a conta do revisor (essa é a anual de 2099, outro usuário).
- O DEFEITO: `funil_eventos` NUNCA registrou um `assinou` sequer, nem
  `cadastro`, `renovou`, `cancelou` ou `expirou`. A tabela inteira tem três
  tipos de evento: abriu_app (15), viu_paywall (4), iniciou_checkout (3).
  Então o funil da semana mostra `assinaturas 0` com dinheiro real entrando,
  e o retrato mostra "Assinaturas ativas (banco): 1" contando só o revisor,
  porque o cliente novo está `trialing` e a contagem filtra `active`.
- CAUSA PROVÁVEL, não fechada: quem gravou a assinatura no banco foi o
  `/api/stripe/sync` (chamado pelo app na volta do checkout, 23:52:28), não
  o webhook. O `assinou` só nasce no webhook. O endpoint ESTÁ cadastrado e
  habilitado no Stripe (mentorque.com.br/api/stripe/webhook, com os 4
  eventos certos), então sobra secret errado/ausente na Vercel
  (`STRIPE_WEBHOOK_SECRET` faltando faz a rota devolver 501) ou entrega
  falhando. Não deu para ler o log de entregas: a integração do Stripe caiu
  no meio da sessão e a operação de listar eventos não estava disponível.
  PARA O RODRIGO: abrir Stripe → Developers → Webhooks → o endpoint → aba de
  entregas e ver se as de 25/08 saíram 2xx. É o que fecha o diagnóstico.
- RISCO CONCRETO COM DATA: 01/09 o teste grátis acaba e vira cobrança. Se o
  webhook está mudo, nem a conversão nem uma falha de cartão chegam ao
  banco, e a tabela vai continuar dizendo `trialing` para sempre. Se o
  cliente cancelar, ninguém fica sabendo. Faltam 6 dias.
- CORRIGIDO (build e tipos passando): `viu_paywall` contava a mesma pessoa
  várias vezes na mesma sessão. A dedup era por `evento:origem` e a origem
  ali é o contexto de ENTRADA da mesma tela, então entrar pelo onboarding e
  voltar pela Biela virava duas pessoas no funil. Gravava até FORA DE ORDEM:
  ao voltar do checkout a tela remonta sem ctx e escrevia um `viu_paywall`
  às 23:52:44, depois do `iniciou_checkout` das 23:52:37. Os 4 eventos de
  paywall da semana são 2 pessoas. Agora vale a primeira entrada da sessão.
- CORRIGIDO: `/api/funil` fazia `await insert(...)` sem olhar o `error` e
  respondia `ok` de qualquer jeito. Evento recusado pelo banco sumia sem
  rastro e a etapa ficava em zero parecendo desinteresse do usuário. Agora
  loga e devolve 500 (o cliente é fire-and-forget, então nada muda no app).
- CORRIGIDO: `supabase/funil_eventos.sql` estava três eventos atrás do banco
  (faltavam `abriu_trilha` e `cadastrou_carro` na restrição). Rodar aquele
  arquivo como estava recriaria a restrição sem os dois e mataria a ativação
  em silêncio, justamente pela rota que não conferia erro.
- RECOMENDADO, não aplicado (mexer em view existente está fora da alçada):
  `funil_semana` mistura unidades na mesma linha. `visitantes` é gente
  distinta, `viram_paywall` e `iniciaram_checkout` são eventos. Quem lê o
  retrato entende funil de pessoas e não é. Pior, a `funil_etapas_28d` que
  alimenta o /painel já conta pessoas, então as duas views discordam sobre a
  mesma semana. SQL pronto em `supabase/funil_semana_pessoas.sql`, só somando
  colunas `_pessoas` sem remover nada.
- Saúde do código: tipos limpos, build do site e `build:native` passando,
  lint só com os avisos de `<img>` de sempre (que no export estático são
  corretos, `next/image` não otimiza lá). 0 erro real em app_erros nos 7d.
- Fila da próxima rodada anotada no manual; o carro duplicado de 23/08
  segue aberto e é o candidato natural.

## 2026-08-25 · Site preparado para ser citado por IA (pedido do dono)
- Objetivo do dono: que outras IAs encontrem o Mentorque e o ofereçam a quem
  procura solução para o carro. O trabalho é diferente de SEO: buscador
  manda tráfego, modelo manda RESPOSTA, e resposta errada vira o que muita
  gente lê sem nunca visitar o site.
- robots.txt: os robôs de IA passam a ser NOMEADOS um a um (OpenAI,
  Anthropic, Perplexity, Google-Extended, Applebot-Extended, Bing, Meta,
  Amazon, DuckDuckGo, Mistral, CCBot). Tecnicamente redundante, porque sem
  regra o padrão já é "pode"; nomeados, a decisão fica explícita e não cai
  junto na próxima edição do bloco "*".
- /llms.txt: descrição do produto em texto puro, com preço, plataformas,
  idiomas, o que faz e o que NÃO faz, e uma seção dizendo como citar o app
  honestamente. Arquivo estático de propósito, não rota: não gasta função na
  Vercel e não quebra o build do app.
- /sobre: a página de referência do produto, escrita para ser citada e não
  para vender. Afirmação antes de adjetivo, bloco "o que não faz" tão
  detalhado quanto o "o que faz" (é o que impede uma IA de recomendar o app
  para o que ele não resolve) e 8 perguntas frequentes.
- JSON-LD compartilhado em lib/jsonLd.ts: MobileApplication, Organization e
  WebSite com o MESMO @id na home e na /sobre, para as duas declararem a
  mesma entidade em vez de dois apps parecidos. Sem aggregateRating, porque
  não existe avaliação nas lojas e nota inventada é penalidade além de
  mentira.
- ACHADO: a home era a ÚNICA página de conteúdo sem canonical. A rodada de
  hoje corrigiu o domínio errado que saía na etiqueta, mas a home não
  emitia etiqueta nenhuma, então passou batida. Justamente a página que mais
  recebe endereço variado, com etiqueta de campanha (utm). Corrigido.
- ACHADO: o texto de compartilhamento do site ainda dizia "entre na lista de
  espera" com o app publicado nas duas lojas. É o texto que um modelo lê
  para responder "esse app já existe?". Reescrito.
- Aula diag-noises reescrita no formato estruturado PT+EN, agrupada pelo
  momento em que o barulho aparece, casando com a LP de hoje (era a fila #2
  do agente de Conteúdo).
- docs/lojas/ficha.md: texto de ficha para as duas lojas escrito para
  extração por modelo (primeira frase define, sem metáfora), incluindo o que
  o app não faz. O Rodrigo cola nas lojas.
- EM ABERTO, decisão do dono: o acervo (61 aulas e as trilhas) só existe
  DENTRO do app. Para IA, o que não está na web não existe. Publicar parte
  dele como conteúdo aberto é a maior alavanca de descoberta que resta, e
  também é dar de graça o que hoje é produto. Não decidido.

## 2026-08-25 · Conteúdo & SEO: primeira LP de busca (e o canonical quebrado)
- Artifact "Conteúdo da semana":
  https://claude.ai/code/artifact/6b286979-93fe-44ad-afb0-b5219c4e8ce9
- ENTREGA DA RODADA (formato a, LP de palavra-chave): /barulho-no-carro.
  Estrutura visual da /landing, e o oposto dela no que importa: indexável,
  com link interno, escrita para ganhar a posição sendo útil de graça. O
  ângulo é o MÉTODO, não o catálogo de peças: agrupa o barulho pelo momento
  em que ele aparece (freando, em buraco, virando, acelerando, parado,
  aumentando com a velocidade). As causas conversam de propósito com o
  diagnóstico por sintoma do app, para página e app não se contradizerem.
- Escolha da palavra: cai em cima do que o app já faz bem, tem cauda longa
  por baixo para as próximas páginas, é menos disputada que "luz de injeção"
  (que exige autoridade que um site novo não tem), e é a única alavanca de
  topo de funil de custo zero que este papel controla sozinho.
- ACHADO GRAVE, corrigido: o `canonical` de TODAS as páginas do site
  apontava para https://mentorque.app, domínio que não resolve. O padrão
  estava escrito no app/layout.tsx e, como NEXT_PUBLIC_SITE_URL não está
  definida na Vercel, era ele que valia. Canonical para fora do domínio é o
  jeito mais eficiente de pedir para não ser indexado. Ajuda a explicar o
  zero clique na busca além da propriedade ser nova. O mesmo tropeço já
  estava documentado em lib/email/waitlist.ts; o layout ficou para trás.
  Conferido no HTML gerado antes e depois.
- Encanamento que não existia: /sitemap.xml e /robots.txt (nenhum dos dois
  existia). Sitemap com as 7 páginas indexáveis; robots aponta para ele e
  bloqueia /api, /painel, /auth-bridge e /embed. A /landing NÃO é bloqueada
  no robots de propósito: ela sai do índice pelo noindex dela, e bloquear
  impediria o robô de ler esse noindex.
- Link interno da home para a LP no rodapé (só em PT), que é por onde o robô
  chega até ela a partir da página com mais autoridade do site.
- A LP entrou na lista SO_NO_SITE do build:native. Os dois builds rodados e
  passando (site e app), tipos limpos.
- PARA O RODRIGO (não é deste papel fazer): pedir indexação da home e da
  /barulho-no-carro no Search Console, já que o canonical das duas mudou.
- Próximas: (1) pauta de gravação "o barulho que o freio faz de propósito",
  casada com esta LP e com a aula de pastilha; (2) reescrever a aula
  diag-noises ("Que barulho é esse?"), hoje com dois parágrafos, no formato
  estruturado PT+EN.

## 2026-08-24 · Diretor: primeiro relatório semanal (17 a 23/08)
- Artifact "Semana Mentorque":
  https://claude.ai/code/artifact/0d77de71-0a02-40d3-9807-9c6752eb8d64
- Número da semana: ZERO cadastros, contra 4 na semana de 10 a 16 (dias 11,
  13, 14 e 16, duas por login da Apple no iPhone). São 8 dias seguidos sem
  ninguém novo. Total acumulado desde 01/08: 8 contas reais.
- Sem defeito por trás: 0 erro no app, 0 avaliação nas lojas, 20 deploys
  verdes. O que falta é topo de funil: 0 clique na busca, R$0 de mídia, e os
  10 vídeos do YouTube seguem privados desde 10/08.
- Funil 17 a 23 (medido só a partir de 23/08): 4 aberturas, 2 pessoas,
  0 cadastros, 0 paywall, 0 checkout, 0 assinatura. Sem semana anterior com
  que comparar. Em 24/08, já fora da semana, apareceu o PRIMEIRO
  viu_paywall da história do funil.
- DÚVIDA DE 23/08 FECHADA: a "1 assinatura anual ativa" do banco é
  revisor@mentorque.com.br, criada em 02/08, validade 2099-12-31, sem
  nenhum id de Stripe. É a conta de revisão das lojas, não é receita. E o
  zero do Stripe é confiável justamente porque a consulta é da conta
  inteira do dono: zero no superconjunto prova zero aqui.
- Prioridades entregues: (1) mandar build novo às lojas, porque 1.0 e 1.1
  são anteriores ao funil e todo usuário de loja é invisível; (2) tornar os
  10 vídeos do YouTube públicos, único canal pronto e de custo zero, com
  UTM para medir; (3) marcar a conta do revisor como interna nas contagens
  (marcar, não apagar).
- Fontes que falharam nesta rodada, registradas no relatório: /api/funil
  bloqueada pelo proxy da sessão (usado o fallback do retrato + banco);
  integração do Stripe não autorizada na sessão (usado o pacote do n8n de
  23/08); Vercel Web Analytics NÃO está ativado no projeto mentorque, então
  não existe medição de tráfego do site hoje.

## 2026-08-23 · Anúncios: tudo configurado e conferido, e DESLIGADOS
- Decisão do dono depois da auditoria: configurar tudo, não ligar agora.
  Enquanto o app é novo e o foco é conversão para Premium, anúncio atrapalha
  a primeira impressão.
- Interruptor: NEXT_PUBLIC_ADS, desligado por padrão. Com ele desligado NADA
  de anúncio acontece: sem SDK, sem pedido de consentimento na abertura, e
  nem o anúncio interno do Premium interrompe alguém. Para ligar, é a
  variável no ambiente do build MAIS um build novo, porque o valor entra
  embutido no binário.
- Agora são dois interruptores desse tipo, os dois documentados no
  .env.example: NEXT_PUBLIC_ADS e NEXT_PUBLIC_APPLE_WEB.
- Estado do AdMob confirmado pelo painel do dono, igual ao que a API disse:
  exatamente 2 blocos, "Intersticial" (6890695608) e "Intersticial premiado"
  (3313432733), com os mesmos códigos que estão no código. Nada a mexer no
  painel quando for ligar.

## 2026-08-23 · Auditoria dos anúncios: o caminho em uso está certo, o outro não
- Pedido do dono: zero é esperado (app novo, sem gente), o que interessa é
  se o anúncio FUNCIONARIA. Conferido contra a API do AdMob, não por leitura
  de código.
- O que está certo: o app "Mentorque" existe no AdMob, plataforma ANDROID,
  estado APPROVED e VINCULADO à ficha da Play (mentorque.app). O id do
  AndroidManifest bate com o do painel. O bloco 6890695608 existe, é
  INTERSTITIAL, pertence ao app, e é exatamente o que o código pede. Sem
  variável de aparelho de teste no CI, então o build sai em modo real.
- BUG ENCONTRADO: o bloco premiado 3313432733 é REWARDED_INTERSTITIAL no
  painel, mas o código pedia vídeo premiado (prepareRewardVideoAd). São
  objetos diferentes no SDK; pedir o formato errado devolve erro e o app cai
  no house ad em silêncio. Corrigido para prepareRewardInterstitialAd.
- Impacto hoje: NENHUM, porque nada no app renderiza o premiado desde que os
  anúncios saíram do caminho crítico do primeiro uso. Era uma armadilha para
  o dia em que voltasse a ser usado.
- Aprendizado: bloco de anúncio tem FORMATO, e o formato do painel precisa
  casar com o método do SDK. Conferir na API (adUnits → adFormat) antes de
  ligar qualquer formato novo, em vez de confiar no nome que o bloco recebeu.

## 2026-08-23 · A receita de anúncio do Mentorque não era do Mentorque
- O dono desconfiou dos números do AdMob e estava certo. A conta é
  compartilhada com os outros apps dele e o coletor pedia o relatório da
  conta inteira, sem filtro de app.
- Provado sem margem: rodando sem filtro, a conta devolve exatamente 2 apps
  com movimento nos últimos 8 dias, "Concurseiro: Concurso Público"
  (US$ 0,91 / 328 impressões) e "Bolão na Copa" (US$ 0,74 / 81 impressões).
  A soma bate com o US$ 1,64 que estava sendo atribuído ao Mentorque.
- **Número real do Mentorque: zero impressão e zero ganho.** O app existe
  com anúncio no código, mas ninguém viu anúncio nenhum em 8 dias.
- Corrigido com filtro por app no pedido e conferência no normalizador (ele
  descarta e conta linha de outro app em vez de somar calado).
- Cuidado registrado na skill: filtro que não casa com nada é idêntico a
  "não teve movimento". Só dá para afirmar zero depois de rodar uma vez sem
  filtro e conferir que o formato do identificador bate.
- FICA EM ABERTO: Stripe e YouTube são chamados da conta inteira também.
  Mesma classe de risco, ainda não auditados.

## 2026-08-23 · O build do app estava quebrado e ninguém sabia
- Ao preparar o envio das lojas, `npm run build:native` falhou. Causa:
  export estático exige página renderizável sem servidor, e /landing (lê
  searchParams no servidor) e /painel (force-dynamic) entraram no site
  depois do último envio. Quebrado desde 22/08, invisível porque o build da
  Vercel continuou passando e ninguém rodou o do app nesse meio-tempo.
- Consertado generalizando o que já existia para o app/api: agora é uma
  lista (api, landing, painel) que sai do caminho na hora de exportar e
  volta depois, com o nome do que saiu no log. Rota nova que só exista no
  site entra nessa lista.
- APRENDIZADO PARA O QA: build verde na Vercel não diz nada sobre o build do
  app. São dois alvos diferentes do mesmo código. Vale rodar `build:native`
  na varredura semanal, senão a quebra só aparece na véspera do envio.

## 2026-08-23 · Funil provado vivo + botão da Apple escondido fora do iPhone
- O funil GRAVOU pela primeira vez desde que foi criado: dois abriu_app pelo
  Safari do dono. A permissão estava certa; o zero anterior era porque os
  binários das lojas (1.0 de 02/08 e 1.1 de 21/08) são ANTERIORES ao código
  do funil, de 22/08. Consequência: todo usuário de loja é invisível até o
  próximo envio. Isso sozinho já justifica o build.
- Bug real encontrado pelo dono: "Entrar com a Apple" quebra fora do iPhone.
  O fluxo web da Apple exige um Services ID próprio (domínio verificado +
  URL de retorno do Supabase), que não existe. Os registros confirmam:
  Supabase redireciona para a Apple e nunca recebe retorno, então o app nem
  consegue mostrar erro. O botão agora só aparece no app da Apple, onde o
  login é nativo. Religa com NEXT_PUBLIC_APPLE_WEB=1 depois de configurar.
- Carros de convidado entrando na conta ao logar era proposital, mas o dono
  decidiu que o app não escolhe por ele: agora PERGUNTA. Ao entrar numa
  conta que já tem garagem, os carros feitos sem login não sobem sozinhos;
  aparece uma tela com a lista, tudo desmarcado, e o dono marca os que são
  dele. Nada marcado = a conta fica como estava. A tela não fecha sem
  botão, porque descartar trabalho não pode ser toque errado. Conta nova
  (sem nada na nuvem) continua levando tudo sem perguntar, que ali não há
  ambiguidade. Serviços e lembretes seguem o carro escolhido.
- Efeito colateral bom: num aparelho emprestado, o carro de quem mexeu
  antes deixa de entrar na conta de quem logou depois.
- Continua em aberto: duplicata. O mesmo carro cadastrado duas vezes ainda
  vira dois carros, agora só que com o dono tendo aprovado. Fica para o QA.

## 2026-08-23 · Gargalo do push resolvido: cada agente ganhou sessão fixa
- Causa raiz confirmada com teste isolado: sessão criada na hora pela
  rotina nasce sem destino de escrita, então o agente trabalha, tenta
  pushar e falha no fim. Uma sessão criada com destino de escrita pushou
  de primeira (commit de teste, depois revertido).
- Conserto: os cinco agentes agora têm sessão de trabalho fixa e nomeada,
  e as rotinas do calendário acordam essa sessão em vez de abrir uma nova.
  Efeito colateral bom: o agente lembra da rodada anterior, então o CRO
  fecha o veredito da aposta que ele mesmo registrou, o Conteúdo alterna o
  formato certo e o ASO não repete resposta já rascunhada.
- Onde o dono vê o trabalho de cada um está escrito em ONDE-VER.md, com os
  ids das sessões e o que checar quando um agente parar de entregar.
- Notificação: só o Diretor avisa, na segunda. Como rotina ligada a sessão
  fixa não carrega notificação própria, o próprio Diretor passou a mandar o
  aviso no fim da rodada, com a manchete e o que precisa de decisão.

## 2026-08-23 · Mapa do app (rodada especial do CRO) e o gargalo do push
- Rodada especial pedida pelo dono, só análise: mapa completo da jornada do
  anúncio ao premium, veredito sobre banner de premium, onde caberiam
  ebooks e framework de personas. Tudo escrito em mapa-experiencia.md.
- Achados que valem decisão do dono: (1) o pedido de premium aparece 2x
  antes de qualquer valor sentido, e o banner da Home para quem não tem
  carro é o candidato natural a sair; (2) três pontos naturais para ebook
  (trilha concluída, sintoma resolvido, código OBD2), nenhum ocupado hoje;
  (3) a campanha não atravessa da loja para o app instalado (sem install
  referrer nem deep link), então CAC por campanha mede bem só a web.
- Achado técnico: abriu_trilha mede ABRIR uma categoria, não concluir nada.
  Falta evento de conclusão (trilha, aula, serviço, sintoma) para medir
  valor consumado. Próximo buraco de instrumentação.
- Duas mudanças diretas foram para a main (CTA do teste por plano e fim do
  lembrete falso), ambas registradas no caderno de experimentos com
  veredito aberto para 20/09.
- GARGALO ESTRUTURAL: pela segunda vez a sessão de rotina não conseguiu
  pushar (sem permissão de escrita no repositório), e o trabalho precisou
  ser reaplicado à mão por uma sessão do dono. Enquanto isso não for
  resolvido no ambiente das rotinas, a memória do time depende de alguém
  reaplicar. Proposta: liberar acesso de escrita ao repositório no ambiente
  das rotinas, ou fazer os agentes gravarem via API do GitHub como o n8n.

## 2026-08-23 · Quebra do funil visível + A/B com aprovação do dono
- Painel ganhou a seção "Onde o funil quebra" (28 dias, pessoas distintas
  por etapa, pior passagem destacada): é o mapa de prioridade dos testes.
- Fluxo de A/B mudou por decisão do dono: o CRO PROPÕE (estado PROPOSTO no
  caderno, com a tese BeSci explicada para leigos) e SÓ ativa com aprovação
  do Rodrigo. Manual, caderno e rotina das sextas atualizados.
- Incidente e conserto: ao trancar as rotas de agregados, a Sentinela levou
  401 no /api/funil e alertou CERTO (dupla homologação funcionou de ponta a
  ponta). Ela aprendeu a chave, foi republicada e mandou o "voltou ao
  normal". Aprendizado: toda rota nova trancada exige atualizar os vigias.

## 2026-08-23 · Painel /painel + agregados trancados por chave
- Painel da operação em www.mentorque.com.br/painel (renderizado no
  servidor, portão por ?chave=): blocos Marketing, Engajamento e Vendas,
  série diária de cadastros, usuários e receita de anúncio, coortes,
  fundo do funil e frescor das fontes.
- Decisão do dono: agregados não ficam abertos. Rotas de leitura e POSTs
  dos coletores exigem a chave DADOS_CHAVE (header x-mq-chave); POSTs do
  app (eventos e erros) seguem abertos. Os 4 workflows do n8n que falam
  com as rotas já apresentam a chave.

## 2026-08-23 · Downloads reais da Apple no ar (e um insight)
- Braço app_store_downloads pronto e testado: relatório diário de vendas
  da Apple (Vendor 94182924), que EXCLUI TestFlight, baixado, descompactado
  e interpretado. Chave única PS9LWJKWK6 (Developer + Sales + Access to
  Reports; aprendizado: a Apple combina papéis numa chave só).
- Primeiro dado: 21/08 teve 0 downloads orgânicos na App Store. Confirma
  que os 22 "usuários ativos" do RevenueCat são aparelhos de teste. A
  aquisição de verdade começa do zero, e agora é medida do jeito certo.
- Play downloads: aguardando o console gerar os primeiros relatórios.
- Aprendizado técnico: onError não sobrevive ao addNode da API do n8n;
  reaplicar com setNodeSettings depois de adicionar nós.

## 2026-08-23 · Visão de empresa completa + vigia de anomalias
- Eventos de primeira ação de valor no app (abriu_trilha, cadastrou_carro):
  ativação real passa a ser medida; web desde já, lojas no próximo build.
- Views novas: ativacao_coortes, assinaturas_coortes (renovou/saiu por
  coorte mensal de assinante) e cadastros_por_campanha (a ponta nossa do
  CAC). /api/dados ganhou uso.ativacao, vendas e marketing.
- Retrato reorganizado como EMPRESA: blocos MARKETING (com CAC calculado
  quando houver gasto), ENGAJAMENTO e VENDAS, com o método na skill.
- Skill ganhou "O painel da empresa" e as métricas de crescimento saudável
  (retenção que estabiliza, coortes melhorando, stickiness, quick ratio,
  LTV/CAC, payback, churn, MRR) com régua por estágio.
- Vigia de anomalias criado no n8n (DESLIGADO): diário 7h30, e-mail só
  quando algo foge do padrão; testado num dia normal, silêncio como
  esperado. Gmail anexado por API (o bug de anexar credencial é só nos
  nós HTTP Request).
- Downloads reais das lojas: pendente de Vendor Number (Apple) e URI do
  Cloud Storage (Play), anotado no manual do Analista.

## 2026-08-23 · Régua de uso + skill de análise (e um bug grave achado)
- ACHADO GRAVE no caminho: funil_eventos NUNCA tinha aceitado um evento
  (mesmo bug de permissão do dia anterior, presente desde a criação).
  Varredura completa achou 6 objetos sem acesso do papel de serviço
  (funil_eventos, funil_semana, content_events, price_reports, user_state,
  waitlist); user_state e waitlist funcionavam por outros caminhos, o resto
  estava mudo. Tudo corrigido + default privileges para tabelas futuras.
  A série do funil COMEÇA em 2026-08-23; web emite já, apps das lojas só a
  partir do próximo build.
- Régua de uso criada: views uso_diario, uso_semanal e retencao_coortes
  (pessoas distintas, frequência, retenção por coorte de cadastro), no
  /api/dados (campo uso) e no retrato (seção "Uso do app").
- Skill escrita em docs/agentes/skills/analise-da-operacao.md: as quatro
  perguntas (aquisição, ativação, retenção, receita), definições, regras de
  honestidade com amostra pequena, roteiro de diagnóstico e réguas
  emprestadas. Diretor e CRO agora leem antes de analisar (manuais
  atualizados).

## 2026-08-23 · Nove de dez fontes conectadas
- YouTube (cliente OAuth novo "Mentorque N8N", projeto Mentorque, app
  publicado em produção): coleta os 10 últimos vídeos; views zeradas
  enquanto os vídeos estiverem privados.
- AdMob: receita real de anúncio medida, em USD, cerca de US$ 1,64 nos
  últimos 7 dias com 30 a 78 impressões por dia.
- App Store Connect: chave .p8 conectada; primeira coleta mostrou a 1.1
  WAITING_FOR_REVIEW e a 1.0 READY_FOR_SALE. Aprendizado técnico: o nó JWT
  do n8n exige claims em modo JSON (iss, iat, exp, aud); os campos
  estruturados do nó não convertem para os nomes padrão.
- Falta só o Google Ads (developer token em processo, entra com as
  campanhas). Workflow de métricas segue DESLIGADO por decisão do dono.

## 2026-08-23 · Sete de dez fontes conectadas
- Search Console verificado (propriedade sc-domain:mentorque.com.br) e
  coletando; série nasce zerada porque a propriedade é nova.
- Rodrigo colou as chaves de Stripe, RevenueCat, Vercel e o JSON do Play;
  as quatro testadas no mesmo dia. Primeiros dados reais: RevenueCat com 22
  usuários ativos e 0 assinaturas; Vercel com 20 deploys sadios na semana;
  Play sem reviews e sem vitals ainda (app recém-chegado às lojas).
- Ajuste no braço de vitals: a API do Play publica com uns 3 dias de
  atraso, janela mudou para 12 a 4 dias atrás.
- Discrepância aberta: Stripe live mostra 0 assinaturas ativas, banco
  mostra 1 anual ativa (provável teste). Esclarecer antes do Diretor tratar
  como receita.
- Faltam: YouTube, AdMob, App Store Connect (.p8) e Google Ads (token em
  processo). Workflow segue desligado.

## 2026-08-22 · Meta conectada e um bug de permissão corrigido no banco
- Token da Marketing API da Meta (usuário do sistema "Analista Mentorque",
  criado pelo Luiz) colado no n8n e testado: enxerga a conta "Mentorque Ads"
  (BRL); gasto zerado porque ainda não há campanha. Pendência: trocar por
  token só de leitura (ads_read), o atual também edita.
- Teste de ponta a ponta do workflow de métricas revelou que tabelas criadas
  via integração não herdam permissão de escrita para o papel de serviço:
  app_erros, lojas_avaliacoes e metricas_diarias estavam com a rota travada
  em "permission denied" (latente nas duas primeiras, que só tinham recebido
  listas vazias). Grant aplicado nas três; segunda execução gravou as 10
  fontes na mesa, Meta com dado real e as demais registrando o próprio erro,
  provando a blindagem por braço.
- Descoberta no braço do Search Console: a conta Google conectada só tem a
  propriedade do vocaboost; falta cadastrar www.mentorque.com.br no Search
  Console (verificação por TXT no Registro.br).

## 2026-08-22 · Coleta total preparada (metricas externas, desligada)
- Mesa de pouso única no banco: tabela metricas_diarias (dia + fonte, jsonb)
  e rota /api/metricas; /api/dados passou a devolver fontesExternas e o
  retrato diário ganhou a seção "Fontes externas" (workflow republicado).
- Workflow novo "Analista: metricas externas" no n8n, com 11 braços
  independentes (Search Console, Stripe, YouTube, Meta Ads, Google Ads,
  RevenueCat, Vercel, AdMob, App Store Connect, Play vitals e avaliações do
  Play). Fica DESLIGADO até as credenciais serem coladas; braço sem
  credencial só registra o próprio erro, não derruba os demais.
- Checklist de chaves e de cliques (selecionar credencial nos nós) está no
  manual analista-dados.md. Decisão do dono: tudo num workflow só, blindado
  por braço, e tudo preparado antes de ligar.

## 2026-08-22 · O time completo entra em campo
- UTM ligada ao funil: eventos da web carregam a etiqueta de campanha que a
  LP guarda; mídia paga nasce mensurável.
- Ponte de dados criada no n8n (retrato diário → docs/dados/retrato.md via
  API do GitHub); aguarda o PAT "GitHub Analista" para ativar.
- Rotinas agendadas: Diretor (seg), Conteúdo & SEO (ter), QA/Produto (qua),
  CRO/BeSci (sex), ASO & Lojas (dias 1 e 15). Especialistas em silêncio;
  só o Diretor notifica.

## 2026-08-22 · Analista de Dados nasce (avaliações das lojas)
- Tabela lojas_avaliacoes + rota /api/avaliacoes (POST coleta, GET resumo).
- Workflow diário no n8n coletando o feed público da App Store; rodou limpo,
  tabela vazia porque o app ainda não tem avaliações (esperado).
- Destino: resumo do Diretor, respostas do ASO e troca dos depoimentos da LP
  por citações reais "via App Store" quando existirem.

## 2026-08-22 · Sentinela v2 (direcionamento do dono)
- Cadência reduzida para 2x por dia (12h em 12h).
- Dupla homologação: falha na primeira olhada espera 1 minuto e é reconferida;
  só alerta problema CONFIRMADO. Testada nos dois cenários (transitório e
  confirmado), ativada; a v1 horária foi arquivada.
- Registrado o limite do papel: a Sentinela não enxerga dentro dos apps
  instalados; crashes e telas quebradas são visíveis nos Android vitals, no
  App Store Connect e nas avaliações (papel do QA e do ASO & Lojas).

## 2026-08-22 · fundação
- Funil da operação instrumentado (8 eventos, /api/funil, view semanal).
- Sentinela criada no n8n (checagem horária + alerta por Gmail) e ATIVADA;
  primeira execução real passou com as quatro checagens saudáveis.
  Incidente de setup: o secret do client OAuth não é copiável do n8n nem do
  console; a solução é criar um secret ADICIONAL no client (sem apagar o
  antigo). Fica de lição para futuras credenciais.
- Estrutura de memória criada (DIRETRIZES, manuais, este diário).
