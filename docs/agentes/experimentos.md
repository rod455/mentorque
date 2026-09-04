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
