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
  que a leitura por API não vale no plano Hobby. Enquanto for assim, o
  denominador se lê no painel (Analytics > Pages > `/`), não no coletor.
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
  `utm_source`, dividido pelos visitantes de `/` lidos no painel da Vercel ·
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
- Estado: ABERTO
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
- Veredito: (aberto)

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
- Estado: ABERTO
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
- Veredito: (aberto)

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
- Estado: PROPOSTO
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
