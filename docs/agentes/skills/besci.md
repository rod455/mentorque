# Skill: BeSci aplicada ao Mentorque

A biblioteca de princípios comportamentais do time, traduzida para ESTE app
e ESTE público (dono de carro no Brasil, quer economizar e não ser enganado
na oficina). O CRO lê antes de toda rodada; os vereditos do caderno de
experimentos alimentam a seção final.

## Os princípios, na língua do Mentorque

- **Fricção**: cada campo, tela ou decisão a mais derruba gente. Perguntar
  só o que muda a experiência AGORA; o resto se pede depois, no contexto.
- **Prova social**: "outros como você" move mais que argumento. Depoimento
  real de loja > número de usuários > frase institucional. NUNCA inventar.
- **Aversão à perda**: mostrar o que a pessoa PERDE por não agir (dinheiro
  na oficina, garantia, vida útil) pesa mais que o que ganha. Usar com
  honestidade: perda real, nunca medo fabricado.
- **Efeito de progresso**: barra, checklist e "falta pouco" puxam conclusão.
  Trilha começada com progresso visível volta mais que lista fria.
- **Timing do pedido**: pedir avaliação, permissão ou upgrade logo APÓS um
  momento de valor percebido (resolveu um sintoma, completou uma trilha),
  nunca na chegada.
- **Enquadramento de preço**: âncora anual perto do custo de UMA visita à
  oficina; preço por dia; a comparação certa não é "grátis vs pago", é
  "app vs prejuízo".
- **Compromisso e consistência**: pequenas ações (cadastrar o carro, marcar
  a primeira aula) criam identidade de "cuido do meu carro"; a jornada deve
  pedir o micro antes do macro.
- **Clareza do próximo passo**: toda tela responde "e agora?". Tela sem
  próxima ação óbvia é onde a jornada morre.

## Regras de uso

- Um princípio por mudança; mudança com três princípios misturados não gera
  aprendizado nenhum quando o número se move.
- Copy honesta sempre: nada de urgência falsa, contador fake ou prova
  social inventada. Reputação de app de confiança É o produto.
- Medo tem teto: apontar risco real do carro sim, terrorismo mecânico não.

## Aprendizados com os nossos experimentos

- **2026-08-28, do achado que abriu lembrete-que-chega: elemento que a
  pessoa TOCA e que não responde é pior que elemento ausente.** O interruptor
  de avisos do Perfil não reagia ao toque e o convite depois do quiz nunca
  aparecia. Nenhuma tela vermelha, nenhuma reclamação, nada no funil: um
  recurso morto some sem fazer barulho. A regra que fica para as próximas
  rodadas: antes de escrever copy para um elemento que promete algo (aviso,
  lembrete, envio, agendamento), CONFERIR que a promessa tem como ser
  cumprida. Copy boa em cima de promessa que não sai é o jeito mais caro de
  perder confiança, porque a pessoa acredita primeiro.
- **2026-08-28: "sem erro" não é sinal de que funciona.** O caso de hoje não
  gerava erro na tela porque a espera simplesmente nunca terminava. Auditoria
  de jornada que se apoia só em app_erros e no funil não enxerga recurso
  parado: o funil mostra ausência, e ausência parece desinteresse do usuário.
  Quando uma etapa der zero absoluto, a primeira hipótese é máquina quebrada,
  não gente desinteressada.
- **2026-08-28 (correção, no mesmo dia): o inverso também vale, e derrubou
  metade do achado.** O padrão do `then` foi generalizado para o login social
  sem conferir o pacote, e o teste do dono em aparelho real provou que o
  login sempre funcionou: o pacote de login embrulha o proxy numa classe
  comum, sem `then`. Leitura de código é hipótese até passar por aparelho, e
  a diferença entre os dois casos era visível de antemão: os lembretes tinham
  prova de campo (erros nos aparelhos), o login não tinha nenhuma. Detalhe
  técnico que decide: a armadilha só existe em quem exporta o
  `registerPlugin` cru; classe que embrulha o proxy não a tem.
- **2026-09-04, a primeira voz de usuário do app, e o vocabulário que ela
  entrega.** Três avaliações reais, todas cinco estrelas, e nenhuma delas
  elogia recurso: elas contam desfecho. "economizar na oficina por não ser
  enrolado", "não sei muito de carros e o premium está me SALVANDO",
  "exatamente o que eu precisava". A copy do app fala o contrário disso, em
  nome de recurso ("garagem digital", "histórico completo", "cadastre seu
  carro"). Regra que fica: quando existir frase de usuário sobre um assunto,
  ela ganha da frase escrita por nós sobre o mesmo assunto, porque ela já
  provou que descreve o ganho na cabeça de quem paga. Guardar as frases no
  mapa vivo, com autor e loja, para não virar paráfrase inventada depois.
- **2026-09-04: prova social pequena e conferível ganha de prova social
  grande e inventada.** "3 avaliações, todas 5 estrelas" é verificável na loja
  em dez segundos; "5.000+ motoristas" não é, e quem duvida de um número
  desconta a página inteira junto. O erro não é o número ser pequeno, é ele
  não ter como ser conferido. Vale a mesma régua para selo de verificado, que
  afirma uma conferência: só existe se alguém realmente conferiu.
- **2026-09-11: botão que não diz o que faz transforma oferta em emboscada.**
  Na garagem cheia do plano grátis, o "+" navegava para o paywall sem uma
  palavra: a pessoa tocava esperando um formulário e recebia uma tela de venda.
  O destino não era o problema, a surpresa era. A regra: quando um controle
  leva a uma oferta, ele diz isso ANTES do toque, e o motivo aparece na tela
  onde a pessoa está, não na tela para onde ela vai. Vale para qualquer parede
  de plano: o que irrita não é o limite existir, é descobri-lo de repente.
- **2026-09-11: o usuário que aparece sozinho vale mais que a persona que a
  gente desenhou.** Quatro personas foram escritas por hipótese em 23/08.
  A quinta chegou sem ser convidada, escrita pelos próprios usuários em três
  avaliações de conta de empresa ("controle de frota", "os carros aqui da
  clínica"). Nenhum dado do banco apontava para ela, porque não existe campo
  que a identifique. Lição de método: ler texto livre de avaliação com a
  pergunta "quem é esta pessoa?", e não só "ela gostou?". O sinal de segmento
  novo costuma chegar como palavra antes de chegar como número.
- **2026-09-18: passo sem evento é passo sem dono.** O fundo do funil tinha um
  portão de conta que não gravava nada: quem tocava em "Começar 7 dias grátis"
  sem estar logado ia para o login e sumia da medição, porque o
  `iniciou_checkout` nasce depois do `if (!user)`. Semanas de "ninguém inicia
  checkout" conviviam com gente tentando comprar. A regra: ao ler zero num
  degrau, perguntar ANTES de interpretar quem exatamente aquele evento é capaz
  de contar, e onde ele nasce no código. Um degrau que só conta um tipo de
  pessoa faz o outro tipo desaparecer, e desaparecido parece desinteressado.
- **2026-09-18: prova de campo é barata quando existe suíte de navegador.** A
  diferença entre "o código sugere" e "eu vi acontecer" custou quinze minutos:
  abrir o app como convidado, tocar no botão e olhar o que sai na rede. Depois
  do erro de 28/08 (login social declarado quebrado por leitura), esta virou a
  ordem certa: hipótese pelo código, prova pelo navegador, e só então o
  relatório. O roteiro vira conferência no mesmo dia, para o achado não
  precisar ser redescoberto.
- **2026-09-25, dos dois primeiros vereditos fechados: aposta que nasce sem
  como ser fechada não é aposta, é correção, e o rótulo tem que dizer isso no
  dia em que ela é registrada.** O `cta-teste-por-plano` foi registrado com
  "leitura contra as semanas seguintes, sem comparação retroativa", o que já
  era admitir que não haveria nível 3: sem variante e sem antes, nenhum número
  futuro poderia dizer FUNCIONOU. Um mês depois, a tela onde ele vivia tinha
  sido mexida por dois testes A/B, e o degrau de chegada subcontava por
  construção. A regra: ao registrar, escrever a frase "o que poderia fechar
  este veredito é X"; se não existir X, marcar como CORREÇÃO e não gastar
  quatro semanas esperando um número que não vem. Correção boa se defende pelo
  argumento (nomear o que o botão faz, tirar promessa falsa), não pelo dado.
- **2026-09-25: veredito não se lê antes de o risco poder acontecer.** O
  `fim-do-lembrete-falso` protegia contra cobrança surpresa, e na data de
  leitura nenhum assinante tinha sido cobrado ainda (a primeira cobrança real
  é 01/10). Zero reclamação ali é ausência do evento, não prova de conserto.
  Ao marcar a data de leitura de qualquer aposta defensiva, marcar a data em
  que o risco passa a ser possível, e ler DEPOIS dela.
- **2026-10-02, do primeiro FUNCIONOU do caderno: tirar campo do formulário é
  a alavanca mais barata que existe.** O cadastro de carro passou a pedir só
  marca, modelo e ano, e o resto virou uma barra de progresso na tela do carro.
  De 173 aparelhos que abriram o formulário em cada braço, 108 cadastraram com
  a versão curta contra 78 com a de sete campos. Mais de três vezes o erro
  padrão, com a amostra quatro vezes acima do alvo. O princípio da fricção não
  é teoria: cada campo a mais tem preço, e aqui o preço foram 30 pessoas em 173
  que não ficaram com carro nenhum. Regra prática que fica: antes de escrever
  copy nova para uma tela que converte mal, contar os campos dela.
- **2026-10-02: o mesmo encurtamento que funciona num formulário pode não
  funcionar numa apresentação, e o motivo é o degrau que se mede.** O
  onboarding de três páginas passou mais gente pela apresentação (218 de 325
  contra 181 de 302) e entregou o MESMO número de carros cadastrados (92
  contra 94). Fricção retirada de um passo que a pessoa precisa atravessar
  rende; fricção retirada de um passo que ela só precisa suportar desloca a
  desistência para o passo seguinte. Ao desenhar o teste, a métrica tem que
  ser o desfecho, nunca a passagem.
- **2026-10-02: controle de plataforma não é controle.** O teste da última
  página do onboarding no Android usava iPhone e web como comparação. Quando o
  veredito venceu, a base era 266 aparelhos Android, 10 iPhone e 8 web: o braço
  de controle havia evaporado. A distribuição da base não é nossa para
  controlar, então nenhum desenho de experimento pode depender dela.
- **2026-10-09: métrica de ausência nunca fecha veredito, e eu levei três
  semanas para pagar essa conta.** O `limite-de-carros-com-aviso` foi
  registrado com "o sinal é a ausência de reclamação". Chegou a data e o dado
  era zero reclamações em 12 avaliações, que não distingue "funcionou" de
  "ninguém passou por ali", porque ninguém sabe quantas pessoas têm dois carros.
  A regra, agora com exemplo próprio: ao registrar a aposta, escrever a frase
  "o que poderia fechar este veredito é X" com numerador E denominador. Se X
  for uma ausência, a aposta é correção e se defende pelo argumento, não pelo
  dado.
- **2026-10-09: quando o produto muda a ORDEM dos passos, a métrica construída
  sobre a ordem antiga passa a medir o contrário.** A ativação por coorte conta
  a primeira ação de valor que acontece depois do cadastro da conta. Em 12/09 o
  onboarding do Android passou a pedir o CARRO antes da conta, de propósito e
  com bom resultado. Desde então a ativação lê perto de zero (3 de 51) enquanto
  83 de cada 100 contas têm carro. O número piorou porque o produto melhorou.
  Antes de ler qualquer métrica de sequência, perguntar se a sequência que ela
  pressupõe é a que o app faz hoje.
