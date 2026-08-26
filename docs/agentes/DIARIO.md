# Diário do time de agentes

Registro cronológico das rodadas. Cada agente escreve aqui ao terminar:
data, papel, o que fez, o que encontrou, o que recomenda. O mais novo em cima.

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
