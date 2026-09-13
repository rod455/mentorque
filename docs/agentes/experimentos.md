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

## Experimentos

## [cadastro-em-duas-etapas] O formulário do carro pede só marca, modelo e ano
- Estado: ABERTO
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
- Veredito: (aberto)

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
- Veredito: (aberto)


## [cta-teste-por-plano] O botão do teste diz o que o clique faz
- Estado: ABERTO
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
- Veredito: (aberto)

## [fim-do-lembrete-falso] Promessa de aviso vira controle de cancelamento
- Estado: ABERTO
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
- Veredito: (aberto)
- Acompanhamento 2026-08-28: o interruptor VOLTOU em 25/08 com plugin nativo
  de verdade atrás dele, e mesmo assim a promessa continuou falsa, por outro
  motivo (o plugin nunca carregava; ver lembrete-que-chega). Ou seja: entre
  23/08 e 28/08 o app esteve nos dois estados que este experimento queria
  evitar. A leitura de 20/09 só vale se a correção de hoje estiver num build
  publicado; antes disso, o "depois" ainda não existiu.

## [lembrete-que-chega] O lembrete que estava mudo passa a sair de verdade
- Estado: ABERTO
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
- Veredito: (aberto)
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
- Estado: ABERTO (2.4 na Play desde 12/09; iPhone segue com a página de plano)
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
- Veredito: (aberto)

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
