# Diário do time de agentes

Registro cronológico das rodadas. Cada agente escreve aqui ao terminar:
data, papel, o que fez, o que encontrou, o que recomenda. O mais novo em cima.

## 2026-10-04 (tarde) · QA agendado: a primeira receita foi estornada, e a fatura só é paga uma hora depois da virada
- Verificação curta, agendada por mim em 01/10 para provar o conserto do
  `renovou` na cobrança de hoje. **A prova não existe, e isso já estava
  resolvido**: 02/10 registrou que os três assinantes saíram e que as
  renovações de 04/10 e 09/10 não vão acontecer. Confirmado na fonte: a
  `sub_1U9Phe…` terminou hoje às 13:20:18, com `status` canceled e `ended_at`
  igual ao `cancel_at`. Não houve virada, então nenhum `renovou` era esperado.
  Nada reprovou. A rotina agendada se encerra aqui.
- A integração do Stripe foi autorizada, então fui pagar as dívidas que ficaram
  das duas rodadas anteriores. Duas coisas que achei não estão em lugar nenhum.
- **A PRIMEIRA RECEITA REAL DO PRODUTO FOI ESTORNADA INTEGRALMENTE.** MEDIDO:
  nota de crédito `cn_1UM3tK…`, tipo `post_payment`, R$ 29,90 de R$ 29,90, com
  estorno `re_3ULujQ…` em `status: succeeded`, criado em 02/10 às 10:40:38, UM
  SEGUNDO depois de a `sub_1U8U8h…` ser cancelada na hora (não no fim do
  período). Bruto R$ 29,90; **líquido R$ 0,00**.
- ISSO RECONCILIA DUAS LINHAS NOSSAS QUE SE CONTRADIZEM. O diário de 02/10
  fechou a pergunta da primeira cobrança com "a receita 30d do Stripe passou de
  R$ 0,00 para R$ 29,90", e o retrato de hoje traz `receita30dCentavos: 0`. As
  duas estão certas: o coletor desconta estorno, e ninguém escreveu por que o
  número voltou a zero. Quem ler na segunda veria R$ 29,90 no diário e 0,00 no
  retrato sem jeito de casar os dois. **O produto continua com receita
  realizada líquida zero.** Não sei por que o estorno foi feito, e não é meu
  lugar supor.
- **A SAÍDA DE UM DOS TRÊS TEM MOTIVO DECLARADO NO STRIPE**, e é dado de
  cliente, não minha leitura: a `sub_1UBIBn…` (b62df1c8) traz
  `cancellation_details.feedback: "too_expensive"`. As outras duas vêm com
  `reason: "cancellation_requested"` e `feedback` nulo. Registro e paro aqui:
  preço e planos são do dono. Vale para o e-mail de quem cancela que subiu em
  02/10, porque este motivo não veio por ele, veio do próprio Stripe.
- **CORREÇÃO DE UMA COISA QUE EU ESCREVI EM 01/10**, riscada na entrada de lá.
  Eu deduzi que "o Stripe só adianta o ciclo quando a fatura é paga, então
  ciclo adiantado mais status `active` é fatura paga". É falso. A linha do
  tempo, medida na única renovação que existiu: ciclo vira 23:52:23, fatura
  criada como RASCUNHO 23:53:10, banco gravado 23:53:13, **fatura finalizada e
  paga 00:53:48**. Uma hora depois. A conclusão estava certa por sorte; o
  raciocínio, não.
- **E ISSO TEM CONSEQUÊNCIA PARA O CONSERTO DE 02/10, que é o achado técnico
  da rodada.** O `faturaDaVirada` busca a `latest_invoice` no instante da
  virada e só aceita `status: "paid"`, recusando `draft` e `open` com razão.
  Mas no instante da virada a fatura TEM 3 SEGUNDOS DE VIDA e está em `draft`:
  ela só finaliza uma hora depois. Então o `renovou` vai gravar `semValor` em
  toda renovação, sempre, e não por defeito de código: o código recusa
  corretamente uma fatura que ainda não foi paga. O que não existe é valor para
  ler naquele momento.
- O intervalo não é coincidência de um caso: nas DUAS faturas de ciclo que
  existem, a distância entre criar e finalizar é de **3638 segundos nas duas**,
  ao segundo (01/09 e 01/10). É o atraso padrão de finalização do Stripe, não
  variação de carga.
- CONSEQUÊNCIA PRÁTICA: o item que o dono fechou em 03/10 (marcar
  `invoice.paid` no painel) foi fechado com um argumento que os dados agora
  contradizem. A objeção de lá tinha duas partes: "a rota não tem `case
  invoice.paid`" (isso é código, não argumento) e "escreveria `renovou` duas
  vezes" (resolvível com dedup pelo id da fatura, exatamente como o
  `funil_eventos_rc_evento_unico` faz pelo id do evento). Com a fatura paga uma
  hora depois, **a entrega da fatura é o único jeito de o valor da renovação
  existir**. Não mexi em nada: é decisão de desenho mais um passo no painel do
  dono, e a medição de hoje é o que faltava para decidir com dado.
- O `valorDoCheckout` (primeira cobrança) NÃO é afetado: a sessão do checkout
  chega com `amount_total` e `payment_status` já resolvidos, porque ali o
  pagamento aconteceu antes do evento. A assimetria é real e vale escrever: na
  venda o dinheiro vem antes do evento, na renovação vem uma hora depois.
- ESTADO DE HOJE, para o relatório: 1 assinatura `active` no Stripe
  (`sub_1UBIBn…`, até 09/10 17:43), com `cancel_at_period_end`, e mais nenhuma.
  O retrato de hoje diz 2 porque foi tirado às 6h e a segunda terminou às
  13:20. Nenhum `past_due` e nenhuma cobrança falhada em nenhum momento: as
  três saídas foram cancelamento, não inadimplência.
- FONTE INDISPONÍVEL: a Supabase recusou permissão nesta sessão, então NÃO
  conferi `funil_eventos` e não sei se o `expirou` de hoje (13:20) foi gravado.
  O caminho está provado em produção pelas três saídas de 02/10, que o diário
  daquele dia registra como dois `cancelou` e um `expirou`; o de hoje fica sem
  conferência minha.

## 2026-10-03 (noite, 10) · A AppsFlyer e via de mao unica, e isso explica a noite inteira

- Pergunta do dono: "estamos sem acesso via api?". **Estamos, e conferi nas duas
  pontas antes de responder.**
- **No repositório**: não existe coletor de AppsFlyer. O que existe é o lado do
  SDK, em `lib/app/atribuicao.ts`, que MANDA a instalação para ela. As fontes de
  gasto do retrato são `google_ads` e `meta_ads`, e só.
- **No n8n**: 17 credenciais cadastradas, nenhuma da AppsFlyer. Há Bearer para
  Meta Marketing, Stripe, RevenueCat, Vercel, GitHub e Instagram; há OAuth para
  Google Ads, Google Sheets, Drive, Gmail, YouTube e AdMob; há JWT da App Store.
  AppsFlyer não está.
- **ENTÃO ELA É VIA DE MÃO ÚNICA: o app manda e ninguém lê de volta.** Toda
  leitura dela hoje é print de painel, feito à mão, e foi exatamente isso que
  custou a noite: cinco telas do Play Console e três da AppsFlyer para responder
  uma pergunta que uma chamada de API responderia toda semana sozinha.
- **O conserto é um token e um coletor**, e a metade do token é do dono porque é
  chave. Virou linha própria na lista, separada da ligação do Google Ads, pela
  regra que esta casa escreveu hoje mesmo para o papel de Segurança: achado com
  N itens vira N linhas, nunca uma linha com N dentro.
- **O QUE EU NÃO SEI DAQUI**: se o plano Zero libera a API agregada. A página de
  preço de terceiros não diz, e a AppsFlyer costuma separar Pull API de Raw Data
  API por plano. Fica escrito como pergunta a responder no console, não como
  premissa, para ninguém montar coletor contra uma porta fechada.
- **MEIA HORA DEPOIS, o print do dono respondeu metade**: o menu Export tem uma
  página **API Access**, e tem também Data Locker e Cost ETL. Então a porta
  existe no console; o que continua sem resposta é o que o plano libera. O
  caminho do token na linha da lista foi corrigido de "área de conta e
  segurança" (que era o meu palpite) para `Export > API Access`, que é o que o
  print mostra.

## 2026-10-04 (noite, 57) · A API de Analytics da Vercel responde, sim: era o token, não o plano

- Pergunta do dono: "precisamos entender como pegar via API. Não tem como?".
  Tem. A hipótese do plano Hobby, da entrada 56, estava errada.
- **Provado no instrumento**: um fluxo de teste no n8n, com a credencial
  "Vercel" que a casa já tinha (a mesma que lê os deploys), fez GET em
  `/v1/query/web-analytics/visits/aggregate` e recebeu 200 com os números:
  home 30 visitantes e 35 páginas em 7 dias, `/embed` 26 e 56,
  `/privacidade` 16, `/excluir-conta` 11, `/baixar` 4. Bate com o painel do
  dono (28 na home, janela um pouco diferente). O que não alcança essa API é
  o token da integração do Claude com a Vercel, que responde "Web Analytics
  not found" para o mesmo projeto. Causa do 404, agora com teste que separa:
  alcance do token, não plano.
- **Virou coletor diário**: fluxo "Analista de Dados: Vercel Web Analytics"
  (05:35, publicado), que grava a fonte nova `vercel_analytics` em
  `/api/metricas`: visitantes e páginas por caminho nos últimos 7 dias e
  visitantes da home por `utm_source`. A fonte entrou na lista da rota. O
  retrato imprime o pacote como imprime os outros.
- Por que fluxo separado e não um nó no coletor das 05:30: o editor por API
  do n8n recusa anexar a credencial `httpBearerAuth` a um nó de HTTP novo
  dentro de fluxo existente ("does not accept credential"), nas duas formas
  que tentei (no `addNode` e no `setNodeCredential`), e aceita na criação de
  fluxo por código com o id da credencial. Fica registrado para a próxima
  vez: credencial em nó novo, só criando fluxo.
- O primeiro teste do coletor rodou antes de a rota aceitar a fonte, então a
  gravação deve ter voltado 400; o segundo teste é depois do deploy.
- **Segundo teste, depois do deploy**: a linha `vercel_analytics` de 04/10
  chegou ao banco com 28 visitantes e 31 páginas na home em 7 dias, igual ao
  painel do dono. E um limite que só o instrumento contou: a quebra por
  `utm_source` voltou 402, "UTM dimensions require an Enterprise plan or the
  Web Analytics Plus add-on". Gasto é do dono, então não comprei nada: o nó
  passou a quebrar a home por site de origem (`referrerHostname`), que é
  gratuito, e a leitura por campanha fica com o funil, que carrega a etiqueta
  no `clicou_baixar`. O erro ficou gravado no pacote da primeira coleta, como
  texto, do jeito que a regra manda (erro nunca vira zero).
- Buraco de medição nº 7 de `docs/dados/o-que-medimos.md` fechado. A aposta
  `landing-em-seis-blocos` passa a ter denominador no retrato.

## 2026-10-04 (noite, 56) · Mandei o dono ligar o que já estava ligado, de novo, e a regra de hoje de manhã explica por quê

- Meia hora depois de a linha "ligar o Web Analytics" entrar na lista, o dono
  mandou o print do painel: Analytics LIGADO, 79 visitantes e 143 páginas
  vistas em 7 dias, 28 na home. "aqui já está mostrando, o que preciso
  ativar?". Nada. A linha saiu.
- A causa é a mesma das quatro de hoje de manhã, e eu escrevi a regra de
  manhã: a API (`count_pageviews`) respondeu "Web Analytics not found" e eu
  concluí "está desligado". **Ausência não é causa.** A API responde o QUE
  (ela não encontra), nunca o PORQUÊ. Testei de novo com e sem equipe, com
  id e com nome: 404 em todos. A hipótese que fica, NÃO provada, é que a
  leitura por API não vale no plano Hobby (o print mostra "Hobby" na equipe).
  O painel é o instrumento; a API não é.
- O que eu devia ter feito antes de escrever a linha: perguntar ao dono um
  print do painel, ou escrever "a API não enxerga; confira no painel" em vez
  de "está desligado". A regra de "antes de mandar o dono clicar" diz
  "conferir no instrumento que a casa já alcança"; aqui o instrumento que a
  casa alcança por API não alcançava, e eu não disse isso, inferi o oposto.
- Consequência boa: o denominador da aposta `landing-em-seis-blocos` existe
  e está no caderno agora: 28 visitantes por semana na home. É pouco, e
  isso muda a leitura: qualquer taxa é direção, 3 cliques mudam dez pontos.
  A maior fonte com nome é um portfólio de terceiro (10 visitantes), o que
  quer dizer que o tráfego orgânico da home é quase nada hoje; a busca do
  Google que voltou hoje vai ser a maior parte do que chegar.

## 2026-10-04 (noite, 55) · Aposta 1 no ar: a landing em seis blocos, com instrumento e sem carrossel

- O dono aprovou a ordem ("Podemos fazer o que você sugeriu, daremos mais
  visibilidade ao biela") e pediu para não tirar gifs e animações. Ficam
  todas: a cena da Biela dirigindo, as artes animadas em `public/biela/`, o
  carro saindo no onboarding, a abertura do app, o aparecer das seções. A
  única coisa de movimento que saiu é o carrossel de três manchetes, porque
  ele troca a promessa e a lição é uma promessa só.
- **O que mudou na home** (`app/page.tsx`): treze seções viraram seis. Saíram
  TrustBar, ProblemSolution, Features, HowItWorks, Consulting, Benefits e FAQ,
  e com elas o que o app não tem mais e a página ainda prometia: trilhas com
  certificado, comunidade e lives, consultoria em três níveis, "funciona no
  navegador" (que contrariava a decisão de lead só na loja). Entraram:
  manchete única, o Biela respondendo uma pergunta real na primeira dobra
  (`BielaDemo`, no lugar do celular com "Trilha · Freios"), três ganhos, as
  duas avaliações da App Store com texto inteiro e nome, o preço uma vez
  (Grátis e Premium com os valores em vigor; o contato de WhatsApp da
  consultoria continua ali, com o mesmo evento), chamada final, rodapé.
- **Instrumento primeiro**: os selos de loja da home nunca gravaram
  `clicou_baixar`; só o /baixar gravava (4 na semana). Agora o `StoreBadges`
  grava com a origem `home-topo:*` ou `home-fim:*`. ~~E o denominador não
  existe: o Web Analytics da Vercel está desligado.~~ ERRADO, corrigido na
  entrada 56 logo acima: o painel está ligado e mostra 28 visitantes na home
  em 7 dias; a API é que não enxerga.
- **Dito no dia**: a busca do Google voltou a veicular hoje apontando para a
  home. Toda leitura desta aposta separa por `utm_source`.
- **A demonstração do Biela mostra a resposta como ela sai HOJE** (prosa
  curta), não em três blocos. Três blocos é a aposta 3; mostrar na landing um
  formato que o app não entrega seria promessa falsa. Quando a 3 for ao ar,
  a demonstração muda junto (comentário em `strings.pt.ts`).
- Conferências: `npm run conferir` verde; suíte `site` verde (65). A
  conferência do trilho do carrossel virou a sua inversa: reprova se o
  carrossel voltar sem a medição voltar junto. Plantei o marcador de
  carrossel na manchete e ela reprovou nas quatro larguras; restaurei por
  cópia de segurança.
- ERRO MEU NO CAMINHO, para não repetir: subi um servidor de desenvolvimento
  à mão para tirar foto e rodei a suíte em cima dele; os dois brigaram pelo
  `.next` e tudo passou a abrir "SEM CSS", inclusive páginas que eu não
  toquei. O comentário da própria suíte já dizia isso (04/09). O certo:
  servidor à mão só para foto, derrubar antes da suíte, e a suíte sobe o
  dela.
- Fotos tiradas em 390px e 1280px, em português, depois de rolar a página
  (foto de página inteira sem rolar deixa os blocos de aparecer suave
  vazios, e isso é artefato da foto, não defeito).

## 2026-10-04 (noite, 54) · A proposta de simplificacao, lida contra o codigo e contra o caderno

- O dono trouxe o protótipo clicável (18 telas + landing) e a especificação
  da sessão com Behance, e pediu: "veja o que faz sentido, converse com CRO e
  me proponha uma evolução disso em relação ao que temos hoje". A resposta
  está em `docs/design/evolucao-simplificacao.md`.
- **O que a proposta acerta** fica: pergunta como porta, uma primária por
  tela, folha de três campos reaproveitando o FUNCIONOU, portões que dizem o
  que destravam, prova social depois da resposta, Biela em três blocos,
  landing em seis blocos.
- **O que o código desmente**, conferido linha a linha: o limite do grátis é
  5 por mês mesmo (`lib/biela/limite.ts:32`, não era pendência);
  `registrou_servico`, `viu_aula` e `clicou_baixar` já existem (a especificação
  os tratava como eventos novos); o polegar do Biela já grava em
  `/api/biela-voto`; o login já sabe que a pessoa veio assinar (`Auth.tsx:217`);
  o convite "Quer que a gente avise a próxima revisão do {carro}?" já existe
  (`ConviteDeAviso.tsx`). E os dois depoimentos foram ENCURTADOS no protótipo,
  o que a própria regra 4 da especificação proíbe: vai o texto literal com o
  nome.
- **O que o caderno congela**: o Início carrega quatro mudanças diretas
  abertas (gastos, datas, resumo, motorista); a primeira abertura está dentro
  do `onboarding-curto` até 23/10; paywall e login dentro do
  `login-sabe-que-veio-comprar`. A aposta número 1 da especificação (Início)
  é a tela com mais apostas abertas em cima.
- **Onde discordo**: Sintomas não viram atalho de chat sem medir antes
  `consultou_sintoma` → `viu_paywall` (a tela tem causas borradas e preço
  regional, que é promessa da ficha); quatro abas é a última coisa, não a
  primeira (a troca barata é Problemas virar Biela); Lora não é aposta, é
  decisão visual do dono.
- **A ordem que propus**, com denominador de hoje: 1 landing (área livre,
  `clicou_baixar` existe, mas a busca do Google voltou hoje e é tráfego novo na
  mesma semana: ler por fonte); 2 aba Biela; 3 três blocos (66 perguntas em
  30 dias, só direção); 4 Início (ou agora, declarando nas quatro apostas que
  toca o degrau); 5 registrar serviço; 6 primeira abertura, depois de 23/10;
  7 paywall, depois do veredito do login; 8 sintomas só com número.
- Não medi nesta sessão: `consultou_sintoma` → `viu_paywall`,
  `registrou_servico` por carro. Estão escritos como leitura a fazer antes
  das apostas 5 e 8, não como número.

## 2026-10-04 (tarde, 53) · Os cinco anuncios de busca estao "Em analise": a URL final virou a home com etiqueta

- O dono trocou a "URL final" dos cinco anuncios responsivos de pesquisa para
  `https://www.mentorque.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=lancamento`.
  Quatro foram para "Em analise" no primeiro salvar; o quinto (grupo
  "Perguntar/aprender") continuou "Reprovado" com a frase "O URL final para
  dispositivos moveis rastreado e diferente".
- O print das "Opcoes de URL do anuncio" mostrou tudo vazio (modelo de
  rastreamento, sufixo, parametro, caixa de URL movel desmarcada). Entao a
  frase era o resultado da revisao ANTIGA, feita quando a URL ainda era o
  `/baixar`, nao uma URL movel escondida. Minha primeira hipotese (campo movel
  preenchido) estava errada, e o print e que corrigiu. Depois de ajustar e
  salvar de novo, o quinto tambem foi para "Em analise" (dono, 04/10).
- Linha da lista apagada. O que falta nao depende do dono: na coleta de amanha
  (05:30) conferir no funil se voltou cadastro com `utm_source=google` e, no
  pacote do Google Ads, se a busca voltou a ter impressao e termo de busca. Se
  continuar reprovado amanha, a API responde em
  `ad_group_ad.policy_summary.approval_status`, sem pedir print.

## 2026-10-04 (tarde, 52) · A busca do Google esta REPROVADA desde que o /baixar virou desvio, e a linha da etiqueta tinha o remedio errado

- O dono abriu Campanhas > Anuncios para colar a etiqueta e o print mostrou os
  cinco anuncios de pesquisa da "Mentorque Lancamento" como **"Nao
  qualificada, Reprovado (Destino nao correspondente)"**, qualidade "Ruim". So
  o anuncio da campanha de app esta qualificado.
- **A causa esta no nosso codigo, com data**: em 19/09 (commit 79b23c2) o
  `/baixar` virou link inteligente, um desvio por JavaScript para a loja do
  aparelho (`lib/site/lojaDoAparelho.ts`). A politica do Google reprova URL
  final que leva a outro dominio. Entao a busca parou de veicular, e e ISSO que
  explica "zero cadastros com UTM ou gclid desde 19/09", que a linha de 24/09
  atribuiu a etiqueta que faltava. Dois instrumentos concordam: o funil (zero
  etiquetado desde 19/09) e o painel (reprovado), e a data do codigo bate.
- A linha de 24/09 pedia colar a etiqueta no `/baixar`. Colar a etiqueta num
  destino reprovado nao faria nada. Virou: URL final na home, com a etiqueta
  (a home tem os botoes das lojas e nao redireciona, entao nao contraria a
  decisao de lead so na loja), ou pausar a campanha de busca, que e 3,7% do
  gasto. Decisao do dono.
- Erro meu que fica: a linha de 24/09 nasceu de "nenhum clique chega com nome"
  e saltou para "falta etiqueta" sem perguntar se o anuncio estava no ar.
  Ausencia nao e causa, de novo. O painel respondia; a API tambem responderia
  (`ad_group_ad.policy_summary.approval_status`), e ninguem perguntou.

## 2026-10-04 (tarde, 51) · googleadwords_int APARECEU: o vinculo fechou no mesmo dia

- Coleta executada as 13:21 (horario de Brasilia): o pacote `appsflyer` traz
  **`googleadwords_int` com 1 instalacao** no Android, campanha "APP | Android |
  Instalacoes | BR", 4 sessoes, 1 leal, na janela de 27/09 a 04/10. E o
  **aviso "Google Ads nao aparece como fonte" sumiu sozinho** do pacote, porque
  ele e calculado da lista de fontes e nao de uma frase que alguem lembra de
  apagar. Era a prova que faltava desde 03/10, e veio em horas, nao em dias.
- Segundo instrumento, do lado do Google: a API ainda lista so a acao de
  origem GOOGLE_PLAY (416 em 30 dias). Nada de THIRD_PARTY_APP_ANALYTICS ainda,
  porque isso depende de importar a acao no painel. A linha da lista passou de
  "esperar" para "agora da", com o caminho de tela.
- O que o numero NAO diz: 1 instalacao em horas nao e taxa. A leitura de
  verdade e a semana que vem, com a ressalva de sempre (AppsFlyer conta por
  baixo, janela de visualizacao do Google e de 1 dia). Custo por instalacao do
  Google sai da escada quando houver mais de um dia.

## 2026-10-04 (tarde, 50) · Decisao do dono sobre o Google Ads: negativas e "criou conta" ficam para depois

- Dono: "nao vamos fazer 1 e 2 agora". Saem da lista as negativas (03/09, 31
  dias) e a conversao "criou conta" (07/09, 27 dias). **E sai tambem a
  importacao das 20 contas por GCLID** (19/09): ela existe para alimentar a
  acao "criou conta", e sem a acao nao ha onde importar. Decisao registrada
  como adiamento, nao como recusa: os dois voltam no dia em que ele quiser.
- Ficam no Google Ads: a etiqueta na URL final da busca, a verificacao do
  anunciante (prazo 30/10) e a importacao da instalacao da AppsFlyer quando o
  primeiro evento chegar. Lista: 5 itens em 3 paineis.

## 2026-10-04 (tarde, 49) · Os oito itens da lista passados pelo instrumento, um a um

- Pedido do dono depois de "inutil sua atuacao": "confira todos e veja se
  realmente falta alguma coisa". Cada item contra o instrumento, nao a tela.
- **Google Ads, negativas** (03/09): REAL. Termos de busca da API, 30 dias:
  seis termos com "curso" gastando R$ 14,43 e 9 cliques. Pequeno, porque busca
  e 3,7% do gasto. **UTM na URL final** (24/09): REAL. Funil: zero cadastros com
  UTM ou gclid desde 19/09, em 110 cadastros; antes chegavam 1 a 3 por dia
  etiquetados. **Conversao "criou conta"** (07/09): REAL, nao existe na API
  (so "Instalacoes (Google Play)" e "Visualizacao de pagina"); o dono adiou.
  **Importar 20 contas por GCLID** (19/09): depende da anterior. **Verificacao
  do anunciante** (04/10): REAL, faixa vista hoje, prazo 30/10. **Importar a
  instalacao da AppsFlyer** (04/10): espera a AppsFlyer mandar o primeiro
  evento; nada a clicar ate la, eu aviso.
- **App Store** (01/10): so depois da 3.0 publicar. Nada hoje.
- **Meta**: o webhook funciona (64 chamadas, zero erro). Rodei o fluxo
  `Instagram: conferir token e assinar a Pagina`: o token vale, a Pagina esta
  assinada com `feed`, as midias respondem, e a chamada de assinar a Pagina
  com campos de mensagem ainda responde **"(#3) Application does not have the
  capability"**, hoje, depois de todos os cliques. Entao a resposta no Direct
  continua sem prova, e a causa nao e permissao faltando no app (estao todas):
  a hipotese que sobra e o token do n8n ter nascido antes das permissoes, e
  token nao ganha permissao retroativa. Isso e o unico motivo para a linha do
  token continuar, e ela continua opcional ate o dono querer insights ou
  resposta no Direct.
- Resultado: dos oito, SEIS sao de verdade e dependem dele (cinco no Google
  Ads, um na Meta), DOIS esperam outra coisa (AppsFlyer, App Store) e nenhum
  pede algo que ja foi feito.

## 2026-10-04 (tarde, 48) · O webhook do Instagram ja recebe comentarios, e a linha de 10/09 pedia o que ja estava feito

- O dono foi fazendo os passos da linha da Meta e a cada tela dizia "ja temos
  isso". Em vez de insistir, fui ao instrumento: o fluxo `Instagram: comentario
  vira mensagem no Direct` tem **64 execucoes em modo webhook**, a ultima em
  04/10 as 10:30 UTC, todas com `field: comments` e assinatura da Meta. Os
  campos `comments`, `live_comments` e `mentions` estao assinados no app, com a
  URL verificada. **O diagnostico de 10/09 ("comments nao assinado, nada
  chega") envelheceu sem ninguem reler**, e a linha ficou 24 dias pedindo um
  clique que ja tinha sido dado.
- O que o instrumento NAO prova: a resposta no Direct. As tres execucoes que
  abri sao comentarios da propria @mentorqueapp, que o no "Extrair comentarios"
  filtra de proposito (sai vazio). O no que responde nunca rodou desde que o
  produto de mensagens entrou no app. A prova e um comentario de outra conta.
- A unica permissao que faltava era `instagram_manage_insights`, adicionada
  hoje. Token carrega as permissoes do momento em que nasce, entao o token do
  n8n precisa ser gerado de novo.
- As duas linhas da Meta viraram uma: gerar o token, colar, comentario de
  teste de outra conta. Erro meu que fica: linha de lista com diagnostico de
  tela precisa de data de validade; se o instrumento ja respondia, era para
  eu ter olhado antes de mandar o dono clicar.

## 2026-10-04 (tarde, 47) · Proposta de simplificacao do app e da LP, com o Biela na porta

- Pedido do dono: referencias de UI no Behance, tudo que o CRO ensinou sobre a
  experiencia, e uma sugestao de evolucao da LP e das telas do app, mais clean,
  com o Biela em destaque. **Behance e Dribbble nao respondem deste ambiente
  (HTTP 000, proxy)**, entao nao ha print de referencia; as referencias foram
  dadas por nome (apps de uma tarefa por tela) e a proposta foi DESENHADA, em
  pranchas: https://claude.ai/artifact/P7h7C33vTbziokaWcxGics (privado ate o
  dono compartilhar).
- Quatro pranchas: Inicio proposto (Biela como hero e unica acao primaria,
  carro como chip com a proxima revisao, duas acoes secundarias, quatro abas),
  Biela (resposta sempre em tres blocos: causas, urgencia, o que perguntar na
  oficina; polegar grava no toque; chips de continuacao), Primeira abertura
  (a pergunta e a porta, carro depois, conta so quando destrava algo) e a LP
  (seis blocos em vez de doze, uma manchete em vez de carrossel, Biela em acao,
  tres ganhos, dois depoimentos reais, preco uma vez, loja como unico destino).
- Cada prancha tem ao lado a nota com a licao do CRO que a sustenta: a porta de
  entrada de 28/09 (78,7% da web parava no onboarding), o formulario curto que
  venceu (108 contra 78), as 66 perguntas ao Biela em 30 dias e as avaliacoes
  que falam de desfecho, os fechamentos concentrados na Home, e a regra de
  medir antes de mexer (instrumento primeiro, uma aposta por vez, degrau
  declarado no dia).
- Nada disso entrou no codigo: e proposta para o dono decidir, e cada tela que
  ele aprovar vira uma aposta do caderno, uma por vez.

## 2026-10-04 (tarde, 46) · A 3.0 sobe hoje a noite: numeros medidos no onboarding, notas escritas, regime de release

- Dono: "pode alterar tudo que sugeriu, coloque no proximo build, vamos subir
  hoje a noite". A unica sugestao pendente que entra no binario era a dos
  numeros inventados da pagina "Amado por motoristas". Entraram medidos, como
  pisos, com a fonte no comentario: **5,0** (12 avaliacoes nas lojas, todas 5
  estrelas), **170+ diagnosticos** (178 `consultou_sintoma` no funil desde
  13/09, quando o evento nasceu) e **250+ motoristas** (254 aparelhos Android
  ativos em 25/09, relatorio do Play). Sao numeros pequenos perto dos
  inventados, e sao os nossos.
- **O que NAO entra, e por que, dito ao dono**: o `next` 14 para 16. E versao
  maior, entra no binario (o app embarca o export da web) e a Seguranca
  escreveu hoje que nao se decide num domingo. Release de loja com upgrade
  maior de framework na mesma noite e dois riscos no mesmo build.
- `docs/lojas/novidades-3.0.md` ganhou o corpo: seis itens no binario (quatro
  que a pessoa sente, dois de medicao), a nota das lojas em 343 caracteres, o
  roteiro de aparelho com cinco passos escrito ANTES do build, o que o build
  nao conserta (SDK da AppsFlyer, as duas dividas da 2.9, o vinculo do Google
  Ads que e painel) e a lista de antes de promover.
- Regime de release, nao o das duas velocidades, e os tres fecharam em 04/10:
  `npm run conferir` inteiro em 0; bateria completa de navegador em 0, **401
  conferencias verdes em 925 segundos**; `npm run build` local compilou. O que
  isso prova e o que a conferencia olha, nao o binario: sobre o build que vai
  sair hoje a noite, a frase e "sem sinal ainda" ate o roteiro de aparelho. Versoes:
  3.0 nos tres lugares, nao publicada, piso 70 acima do 69.

## 2026-10-04 (tarde, 45) · O webhook sem senha saiu, e o achado da Seguranca fecha inteiro

- Dono: "pode tirar ele, nao precisamos". O no "Sob demanda" (webhook
  `POST /webhook/blog-gerar`, sem autenticacao, de julho) foi removido do fluxo
  do blog do Vocaboost e a versao publicada: 6 nos, so o relogio de terca e
  sexta dispara. Com isso o achado da rodada 3 da Seguranca fecha inteiro no
  mesmo dia: chave no cofre, header em texto apagado, chave antiga revogada,
  porta publica fechada. Linha sai da lista.
- O que sobrou da rodada dela e nao e acao de hoje: o `next` 14.2.35 com duas
  criticas que nao nos alcancam (fixAvailable e 16.3.8, versao maior; nao se
  decide num domingo); o inventario de permissao pela metade em tres paineis
  que ela nao alcanca (Meta, Google, Codemagic), com a proxima data em 01/11; e
  a chave `service_role` do Supabase do Vocaboost em texto nos nos de codigo do
  mesmo fluxo, que aponta para projeto que nao resolve e que o dono vai
  restaurar um dia: quando restaurar, a chave nova entra como credencial, nao
  como texto no no. Fica dito aqui para esse dia.
- Veredito do dono no manual ganhou o ponto 4: linha para o dono e roteiro de
  cliques, nao decisao abstrata. Lista: 9 itens em 3 paineis.

## 2026-10-04 (tarde, 44) · A chave do blog esta no cofre, o header em texto sumiu, e a antiga foi apagada

- O dono criou a chave nova na Anthropic (escopo Organization; para funcionar
  tanto faz, muda so onde o custo aparece), a credencial Header Auth
  "Anthropic (blog)" no n8n, e trocou o no "IA (Claude)" para a credencial.
  Faltava apagar a linha `x-api-key` da lista de headers, que ainda carregava
  a chave antiga: apaguei eu, pela API (a primeira tentativa bateu no editor
  aberto dele), publiquei, e conferi na definicao: o no tem so
  `anthropic-version` e `content-type`, e a versao ativa e a publicada.
- A chave antiga do no era a "IA TUTOR" (25/06), identificada pelo prefixo no
  print da console; o dono a apagou. Nada ativo alem do blog a usava.
- O que sobra e o webhook `Sob demanda` sem senha. Pergunta unica ao dono: ele
  dispara por fora? Se nao, eu apago o no. A linha da lista virou essa
  pergunta.
- Duas chaves que apareceram no dump do fluxo (a service_role do Supabase do
  Vocaboost, que aponta para projeto que nao resolve, e a antiga da Anthropic,
  ja apagada) ficam registradas por LOCALIZACAO, nunca por valor.

## 2026-10-04 (tarde, 43) · O fluxo do blog fica ligado de proposito, e a chave vira quatro passos

- Dono: "sim, vai voltar, pode ignorar esse ponto". O banco do Vocaboost vai
  ser restaurado por ele; o fluxo continua ligado de proposito, e ninguem traz
  isso de novo. A linha "continua ligado?" saiu.
- Sobre a chave: "o que preciso fazer?". A linha virou um roteiro de quatro
  passos (criar chave nova, credencial Header Auth no n8n, trocar o no para a
  credencial e apagar o header em texto, revogar a antiga), mais o webhook com
  Header Auth ou apagado. O passo da credencial e dele porque o MCP nao anexa
  credencial a no HTTP.

## 2026-10-04 (tarde, 42) · Veredito do dono sobre a Seguranca (rodada 3), e uma correcao minha sobre os e-mails do blog

- Veredito escrito no manual `seguranca-dependencias.md`: tres coisas a manter
  (security_invoker feito por ela mesma e mordendo num defeito real; o achado
  lido na definicao do fluxo, com localizacao e sem valor; a vermelha de outro
  papel diagnosticada um caso de cada) e tres a melhorar (decisao do dono
  primeiro e relato do tamanho dela; duas linhas que o mesmo clique fecha dizem
  isso; exposicao se mede, e as execucoes guardadas sao quatro, todas de
  trigger, nenhuma de webhook).
- Os sete plantios originais da `conferir:publicacao` foram rodados de novo
  depois da troca que a Seguranca fez no criterio de pasta existente: os sete
  mordem. A troca e boa e fica.
- **Correcao minha, de (tarde, 39)**: eu disse ao dono que cada artigo gerado
  ia inteiro por e-mail para tres enderecos. Errado desde 15/09: o fluxo morre
  no no "Salvar & publicar", DOIS nos antes do e-mail, entao nenhum e-mail sai
  desde que o banco sumiu. O que existe dos artigos gerados e o texto dentro
  das execucoes que o n8n ainda guarda (quatro). A Seguranca leu certo e eu
  nao. Nao muda a decisao dele (o banco nao volta), mas muda o que esta
  recuperavel, e por isso esta dito.
- As duas linhas da Seguranca ficam na lista ate o dono decidir: o fluxo
  continua ligado?, e a chave da Anthropic daquele no, com prazo 11/10.

## 2026-10-04 (tarde, 41) · "Idioma: EN" nao era a ficha, era o binario

- O dono abriu App Store Connect > App Information: **Primary Language:
  Portuguese (Brazil)**. Entao a minha leitura de manha ("localizacao principal
  em ingles") estava errada no lugar: a ficha ja era pt-BR. O "Idioma: EN,
  Ingles" da pagina publica vem do BINARIO, das localizacoes que o app declara
  (`CFBundleLocalizations` / `CFBundleDevelopmentRegion` no `Info.plist`, e
  `knownRegions` no projeto do Xcode). O projeto so declarava `en`.
- **Conserto no codigo, vai na 3.0**: `CFBundleDevelopmentRegion` = `pt-BR`,
  `CFBundleLocalizations` = [`pt-BR`, `en`], `knownRegions` ganha `pt-BR`. Nao e
  plugin, e chave de plist; mesmo assim, o sinal so vem quando a 3.0 estiver na
  loja e a pagina disser "PT". A `conferir:versoes` passa a exigir as tres
  coisas, para a proxima versao nao voltar a ingles por um `npx cap sync`
  regenerando o projeto.
- A linha da Apple na lista do dono encolheu para a unica coisa que so a loja
  publicada responde: buscar `manutencao` sem acento depois da 3.0.
- Erro meu registrado: afirmei "localizacao principal errada" a partir de um
  campo da pagina publica sem saber o que o campo mede. E a regra de 03/10
  ("diga de qual instrumento veio e o que ele mede") outra vez, em miniatura.

## 2026-10-04 (tarde, 40) · Quatro linhas saem da lista por decisao do dono, e a da Apple vira duas conferencias

- **Sai: o banco do Vocaboost** ("nao faz sentido"). Desfecho: o blog fica como
  esta, com o fluxo gerando artigo sem onde gravar, por escolha dele. O
  diagnostico de (tarde, 39) continua valendo se um dia ele quiser voltar.
- **Sai: Vercel.** O dono garantiu que a retencao de 2 semanas foi aplicada ao
  projeto. Nao conferi por dentro (a API nao devolve o campo); fica dito por ele.
- **Saem: as duas linhas de avaliacoes das lojas.** Decisao: as 12 respostas
  prontas em `docs/lojas/respostas.md` NAO serao publicadas, e as chaves de
  resposta nao serao geradas. Os dois depoimentos reais entraram no app hoje,
  e e so isso que se aproveita das avaliacoes. O agente de ASO para de rascunhar
  resposta; a rodada seguinte dele precisa ler isto antes de propor de novo.
- **A linha da Apple foi reescrita em linguagem de tela**: uma conferencia
  agora (localizacao principal em App Store Connect, porque a pagina diz EN) e
  uma depois de publicar (buscar `manutencao` sem acento).
- Lista: 9 itens em 3 paineis (Google Ads 6, Meta 2, App Store 1).

## 2026-10-04 (tarde, 39) · "O que aconteceu com o blog do Vocaboost?": o banco sumiu, e a minha linha pedia o remedio errado

- O dono: "a gente estava publicando artigos todas as semanas e aumentando o
  awareness da marca". O blog em vocaboost.com.br/blog mostra "Em breve, novos
  conteudos por aqui". **Entao o Vocaboost nao esta desligado como produto, e a
  frase que eu li em 22/09 e repeti em 27/09 estava errada na intencao: o dono
  deixou justamente esse fluxo ligado porque ele importa.**
- **O que eu sei, e de que instrumento**: (1) o fluxo `Conteudo/SEO (Blog)`
  roda terca e sexta, a IA gera o artigo com sucesso e o no `Salvar & publicar`
  morre com `getaddrinfo ENOTFOUND ytskhrskvobfwrmslnkn.supabase.co`, em todas as
  execucoes que o n8n ainda guarda (22, 25, 29/09 e 02/10) e nas de 15 e 18/09
  vistas em 27/09; (2) o resolvedor deste ambiente tambem nao acha esse host, e
  acha o do Mentorque; (3) o projeto nao esta na org do Mentorque no Supabase
  (get_project: sem permissao). Dois resolvedores independentes, mesma resposta.
- **O que eu NAO sei**: se o projeto foi apagado ou pausado (host que nao
  resolve aponta para apagado, porque pausado continua resolvendo e responde
  erro; mas e a tela da conta dona que confirma), desde quando exatamente (a
  primeira falha visivel e 15/09; o blog pode ter esvaziado antes), e se o site
  le do mesmo projeto (quase certo, mas a pagina nao responde deste ambiente, e
  fica dito como inferencia).
- **O que nao esta perdido**: cada artigo gerado vai inteiro, em HTML, no e-mail
  "[Vocaboost] Novo artigo publicado" para tres enderecos. Recuperar e reler os
  e-mails de 15/09 para ca e gravar no banco restaurado ou novo.
- **A linha da lista mudou de "desligar o fluxo" para "abrir o painel do Supabase
  da conta dona e dizer se esta pausado ou apagado"**, com os dois caminhos. O
  erro meu que fica registrado: li a razao escrita de uma decisao e nao
  perguntei por que o dono tinha mantido ligado o unico fluxo que contradizia
  essa razao. Ausencia de resposta ("o banco nao resolve") virou "produto morto"
  na minha cabeca, e isso e a regra de 03/10 outra vez.

## 2026-10-04 (tarde, 38) · A Play esta no ar com o texto novo, e tres propostas fecham no mesmo dia

- Dono: "feito em ambos". Na Play, breve descricao (a de 01/10, com
  "economize") e descricao completa (2 carros, frase dos anuncios, sem a do
  navegador) estao no ar desde 04/10. Fecham, como APLICADAS: a proposta de
  15/09 (limite de carros) e a de 01/10 (breve descricao). A linha da Play sai
  da lista do dono.
- Como ler o efeito, e quando: duas rodadas depois de 04/10, origem "Pesquisa
  do Google Play" (so sobe de verdade se os TERMOS forem de categoria, nao de
  marca) e o bucket de instalacoes. E por excecao: nenhuma avaliacao nova com
  "gratis", "pago" ou "limite" dentro, que e o que a frase dos 2 carros existe
  para evitar.
- Lista do dono: 13 itens em 6 paineis.

## 2026-10-04 (tarde, 37) · "Essa parte do navegador e mentira, ne?"

- O dono pegou na descricao a frase "Tambem funciona no navegador, em
  www.mentorque.com.br", e lembrou a decisao: nenhum lead vai para a web, a
  loja e o destino. A frase estava nas duas descricoes da ficha (Play e Apple)
  e passou por mim duas vezes hoje. Saiu das duas; a ultima linha fica
  "Disponivel em portugues e ingles."
- A Apple ja foi colada com a frase; entra na versao seguinte, junto com os 2
  carros. Na Play o dono cola o texto sem ela agora.

## 2026-10-04 (tarde, 36) · A ficha da Play tambem dizia o proposto como publicado

- O print do console da Play mostrou: breve descricao no ar e "Cuide do seu
  carro: diagnostico, revisoes, historico e o mecanico de IA Biela", e a
  descricao completa e um texto antigo com travessao e emoji. A ficha dizia
  outra coisa como "hoje" nos dois campos. **Segunda vez no mesmo dia** (a
  Apple de manha), e a mesma causa: a ficha escreveu a proposta no lugar do
  lido, e ninguem conferiu contra a loja. A proposta de 01/10 da descricao
  curta foi feita contra a linha errada; o raciocinio dela (economizar nao
  esta em campo nenhum) continua valendo, e ate mais, porque a linha no ar nao
  tem barulho nem painel.
- Regra que fica, agora escrita na propria ficha nos dois campos: "no ar" so o
  que foi LIDO na loja, com a data e de onde. Para a Play o jeito barato de
  ler e o print do console, porque a pagina publica nao responde do ambiente
  remoto.
- Entregue ao dono, campo a campo, o que colar na Play: nome (fica), breve
  descricao (79) e descricao completa (com 2 carros e a frase dos anuncios).

## 2026-10-04 (tarde, 35) · A Apple sai como foi colada; as frases dos 2 carros ficam para a versao seguinte

- Dono: "vamos deixar assim mesmo, nao vou mudar, a proxima versao ja sai com a
  Apple atualizada". Ou seja, a versao em preparo leva subtitulo, palavras-chave
  e a descricao nova, com o bloco PRECO nas frases antigas. Registrado na ficha
  como "o que foi colado", separado de "o que a ficha propoe". A linha da lista
  da Apple encolheu para as duas conferencias que so a loja publicada responde.
- Na Play nao ha versao para esperar: a resposta ao dono traz o que colar agora,
  campo por campo, com o texto exato.

## 2026-10-04 (tarde, 34) · Decidido: o gratis fica com 2 carros, e o preco na descricao nao e escolha

- **Decisao do dono**: "vamos manter no maximo 2 carros no gratis". A proposta
  de 15/09 fecha como DECIDIDA; o app ja fazia isso (`freeCars: 2`), so o texto
  da loja dizia "cadastro de veiculos". Os dois blocos de descricao da ficha
  (Play e App Store) ganharam as frases propostas em 15/09, e a Play virou
  linha na lista do dono porque muda na hora. O dono disse "ja arrumei tudo"
  na Apple, entao o bloco PRECO dele ficou com a frase antiga: e uma frase para
  recolar, e esta dito na resposta.
- **"Precisamos mesmo colocar o preco?"** Sim, e nao e ASO: a Apple exige, para
  assinatura renovavel, que a descricao traga nome da assinatura, duracao,
  preco e os links de Termos de Uso e Privacidade (anexo 2 do contrato de apps
  pagos, item 3.8(b); e o motivo classico de rejeicao em revisao). A descricao
  no ar ja carrega tudo isso, entao tirar seria criar risco onde nao havia.
  Na busca, o preco nao pesa nem ajuda.

## 2026-10-04 (manha, 33) · O MES100 aponta para o cupom vivo, e a ficha da Apple dizia o proposto como se fosse o publicado

- **Decisao do dono: `/MES100` passa a apontar para `LANCAMENTO1MES`.** Feito
  em `next.config.mjs`. E entrou a conferencia que faltava: `conferir:cadastro`
  le os atalhos e exige que o MES100 aponte para `CUPOM_DA_CAMPANHA`, no
  plano mensal, e nunca para o PREMIUM1MES. Era o jeito de um link publico
  perder o desconto em silencio: a rota refaz a sessao sem cupom quando o
  Stripe recusa, entao ninguem ve erro.
- **O print da App Store corrigiu a ficha.** Nome no ar: `Mentorque:
  manutencao do carro` (conferido). **Subtitulo no ar: `Seu mentor de
  manutencao`**, e a ficha dizia `Entenda o carro e a oficina` como publicado;
  era o proposto. Isso muda a conta das palavras-chave: o subtitulo real
  repete `manutencao` e NAO carrega `oficina`, entao a lista proposta de 01/09
  so vale se o subtitulo tambem for trocado. A ficha agora traz as duas
  listas, uma para cada subtitulo, com a contagem de caracteres.
- **Mais duas coisas que a pagina publica mostrou**: "IDIOMA: EN, Ingles" (a
  localizacao principal do app no App Store Connect esta em ingles, e a pagina
  em portugues e tradução; pesa na busca BR) e a descricao com travessao em
  nove linhas, contra a regra do dono. Tudo campo de versao: entrou na mesma
  linha da lista, que agora pede subtitulo, palavras-chave, descricao sem
  travessao e a conferencia da localizacao principal no proximo envio.
- Regra que fica: ficha de loja so escreve "no ar" o que foi lido na loja, e
  diz de onde leu. O proposto fica em tabela, marcado como proposto.

## 2026-10-04 (manha, 32) · Tres respostas do dono: cupom apagado, dois depoimentos reais, e a Apple ja tem o nome

- **Stripe: o dono APAGOU o `PREMIUM1MES`** (a linha pedia desativar; apagar
  resolve o mesmo). Sai da lista, 31 dias depois de entrar. Desfecho no
  `docs/lancamento/email-lista-de-espera.md`. **Rabo que ficou, e e decisao
  dele**: o atalho `mentorque.com.br/MES100` (em `next.config.mjs`) aponta para
  `cupom=PREMIUM1MES`. Com o cupom apagado, quem abrir esse link cai no checkout
  SEM desconto (a rota refaz a sessao sem cupom quando o Stripe recusa, entao a
  compra nao morre, mas a promessa do link morre). Perguntado ao dono: apontar
  para `LANCAMENTO1MES` ou tirar o atalho. Nao mexi, porque e cupom e preco.
- **Depoimentos: "aproveitar somente 2, esses 2 reais, e o restante mantem.
  Tire 2 e coloque esses 2."** Os depoimentos do app eram INVENTADOS em dois
  lugares: quatro no onboarding (pagina "Amado por motoristas") e dois no
  paywall. Entraram os dois reais da App Store BR, trechos literais com o
  apelido de quem escreveu e "via App Store": aminoru (13/09, "Aprendizado") e
  munizluiz (04/09, "Bastante Util"). No onboarding substituiram os dois
  ultimos (Marina S. e Carlos E. ficam, como o dono pediu); no paywall
  substituiram os dois que havia. Trecho corta, nunca troca palavra; o
  "Manu tem os" do original (erro de digitacao de "manutencoes") ficou fora
  do corte em vez de ser corrigido. **O que eu NAO mexi e esta dito**: a mesma
  pagina do onboarding diz "4,8", "10.000+ diagnosticos" e "5.000+
  motoristas", e nenhum desses numeros e medido (a App Store tem 7 avaliacoes
  com 5,0; a base ativa do Android e 254 aparelhos). O dono mandou manter o
  restante; fica registrado que o restante inclui numero inventado. Vai para
  as lojas no build 3.0, nao e mudanca de web.
- **App Store: o dono diz que o nome ja foi trocado** para `Mentorque:
  manutencao do carro`. Nao consegui conferir (apps.apple.com e itunes.apple.com
  nao respondem do ambiente remoto, HTTP 000), entao a ficha diz "trocado pelo
  dono em 04/10, dito por ele". A linha da lista encolheu para o que falta: as
  palavras-chave no proximo envio, com o valor exato de 95 caracteres, e a
  conferencia barata depois (buscar `manutencao` sem acento).
- Lista: 13 itens em 6 paineis.

## 2026-10-04 (manha, 31) · Duas linhas saem da lista do dono, com desfecho, e uma encolhe

- **Sai: credencial da AppsFlyer nos dois nos do n8n** (entrou 03/10). Desfecho:
  o dono escolheu, e a coleta grava `appsflyer` com dado real desde 03/10
  (Facebook Ads 116, Organic 50 na janela de 27/09 a 04/10).
- **Sai: permissao da conta de servico no Play Console** (entrou 03/10).
  Desfecho: o bucket listou e baixou em 04/10; 336 instalacoes de 01 a 25/09
  e 254 aparelhos ativos, depois do conserto do app errado.
- **Encolhe: Vercel.** O dono configurou 2 semanas na politica da conta, e
  essa tela vale para projetos NOVOS. Fica so a confirmacao de que o projeto
  `mentorque` pegou a politica (caixa marcada, ou a aba do projeto), porque a
  API nao devolve esse campo e eu nao tenho como fechar sozinho.
- A lista fica com 14 itens em 8 paineis. O Google Ads continua sendo a sessao
  mais barata: 6 itens num console so.

## 2026-10-04 (manha, 30) · Os dois vinculos estao ATIVOS na conta que gasta

- Print do dono, tabela "Analise de aplicativos de terceiros" da conta
  Mentorque: **AppsFlyer / mentorque.app / Ativo** e **AppsFlyer / 6797291865
  (iPhone) / Ativo**. A linha do Adjust ficou como "Nao vinculada", para apagar.
  Na AppsFlyer, os dois apps com Activate partner ligado e o link ID de cada um.
- O que falta e um passo so, e e do dono: importar a instalacao da AppsFlyer
  como acao de conversao no Google Ads. Sem isso o vinculo existe mas o Google
  continua otimizando para a contagem dele (GOOGLE_PLAY), e a faixa amarela da
  AppsFlyer continua la.
- **Primeiro dia possivel de `googleadwords_int` na coleta: 05/10.** O relato
  de amanha diz de qual instrumento veio, e se nao vier, diz que nao veio.

## 2026-10-04 (manha, 29) · O vinculo do Android esta feito na conta certa, e a primeira tentativa saiu com o provedor errado

- O dono criou o link ID na conta Mentorque e colou na AppsFlyer. **A primeira
  tentativa saiu com "Adjust" no campo de provedor**, e eu vi no print antes de
  dar por feito: ID criado para o Adjust e colado na AppsFlyer nao liga nada,
  porque so o provedor dono do ID consegue reclama-lo. Linha "Adjust" ficou na
  tabela do Google Ads, para apagar.
- **A segunda saiu certa**: provedor AppsFlyer, app Mentorque Android, e o mesmo
  ID colado na AppsFlyer com "Activate partner" ligado. A tabela do Google Ads
  agora tem uma linha AppsFlyer e uma Adjust.
- **O que falta, e esta na linha do dono**: o iPhone (segundo link ID), a
  importacao da instalacao como acao de conversao quando o Status disser
  "Vinculado" (a faixa amarela da AppsFlyer "make sure to measure your app
  conversions in Google Ads" e exatamente isso), e apagar a linha do Adjust.
- **Como eu vou saber que fechou, e de qual instrumento**: `googleadwords_int`
  aparecer no pacote `appsflyer` da coleta das 05:30 (nao e retroativo, entao
  o primeiro dia possivel e 05/10), e a API do Google Ads passar a listar uma
  acao de conversao de origem THIRD_PARTY_APP_ANALYTICS no no
  `acoes de conversao`. Dois instrumentos, e os dois ja estao coletando.
- "Fiz certo agora": sim para o Android. O que eu tinha errado ontem nao era o
  diagnostico de hoje; era ter escrito "ligar" sem ter perguntado em qual
  conta. A pergunta ao instrumento custou um no e um clique.

## 2026-10-04 (manha, 28) · Fechou: a conta que gasta NAO tem analise de terceiros conectada

- O dono abriu a tela "Sobre o app" da conta Mentorque e ela diz, em letras:
  **"Voce nao tem analises de apps de terceiros conectados"**, com o botao
  "Conectar um produto de analise de apps de terceiros" ainda por clicar. A
  unica fonte de app e "mentorque.app (Android) pela Google Play Store".
- **Dois instrumentos, mesma resposta.** A API (acoes de conversao: 401, todas
  GOOGLE_PLAY, nenhuma THIRD_PARTY_APP_ANALYTICS) e o painel (nenhuma analise
  de terceiros conectada). Nao e inferencia de ausencia: e a tela que diz.
- **Entao as duas pontas que o dono conferiu nao eram desta conta.** O link ID
  existe em algum lugar (ele viu Android e iPhone "linkados"), mas nao na
  conta 672-430-8347, que e a que gasta. Vinculo em outra conta e vinculo em
  lugar nenhum, e a AppsFlyer nunca viu `googleadwords_int` por isso.
- **O que eu quase fiz de errado ontem, dito para nao repetir**: a primeira
  versao da linha dizia "ligar nos dois consoles", o dono respondeu "ja esta
  ligado", e eu tinha duas saidas: discutir ou perguntar ao instrumento. A
  pergunta certa custou um no no n8n e dois cliques dele, e separou em uma
  hora o que uma noite de hipoteses nao separou.
- A linha da lista agora diz o caminho exato: criar o link ID nesta conta (um
  por app), colar na AppsFlyer, importar a instalacao como acao de conversao.
  Nao e retroativo; a primeira instalacao atribuida aparece no dia seguinte.

## 2026-10-04 (manha, 27) · O Google conta 401 instalacoes em 30 dias, e TODAS vem do Google Play, nenhuma da AppsFlyer

- O dono clicou a credencial ("feito"), eu executei, e o no respondeu. **De qual
  instrumento**: API do Google Ads, conta Mentorque, acoes de conversao dos
  ultimos 30 dias (05/09 a 04/10), gravado em `metricas_diarias` / `google_ads`
  / `acoesDeConversao`.
- **A resposta**: duas acoes de conversao na conta. (1) "Instalacoes de
  Mentorque: manutencao do carro (Android)", criada em **19/09/2026 10:01**,
  categoria DOWNLOAD, origem **GOOGLE_PLAY**, **401 conversoes**. (2)
  "Visualizacao de pagina", origem WEBPAGE, 1. **Nao existe nenhuma acao de
  origem THIRD_PARTY_APP_ANALYTICS.** O Google nao recebe NADA da AppsFlyer
  nesta conta: ele conta a instalacao sozinho, pelo Play.
- **O que isso separa, e o que nao separa.** Mata a leitura "o vinculo esta
  alimentando o Google e e a AppsFlyer que perde para a Meta": se o vinculo
  estivesse completo nesta conta, a lista de conversoes teria os eventos da
  AppsFlyer importados. O que NAO separa sozinho: se o vinculo (link ID) foi
  criado em OUTRA conta Google Ads do dono, ou se foi criado nesta e so faltou o
  passo de importar os eventos (Conversoes > Nova acao > App > Analise de apps
  de terceiros). Os dois caminhos dao a mesma tela vazia. **A proxima pergunta e
  do painel, e e uma so**: nessa tela de importar, nesta conta, a AppsFlyer
  aparece como provedora com os eventos do Mentorque? Se aparece, falta
  importar; se nao aparece, o vinculo esta em outra conta.
- **Segundo instrumento para o 401**: o bucket do Play diz 336 instalacoes
  TOTAIS (todas as fontes) de 01 a 25/09, e a Meta reclama 116 a 133 por
  semana. O Google reclamando 401 em 30 dias, com visualizacao de video na
  conta (janela de 1 dia, YouTube e 96% do gasto), e um numero que so ele
  audita. E exatamente o buraco que o vinculo com a AppsFlyer existe para
  fechar, e e por isso que a linha nao sai da lista: ela muda de "ligar" para
  "importar, e conferir em qual conta".
- De passagem: o no `Google Ads: termos de busca` ja estava com credencial (50
  termos gravados na mesma coleta). A nota "ainda desligado" no `normaliza` so
  aparece quando a lista vem vazia, entao nao mente, mas o comentario do
  cabecalho envelheceu. Fica para a proxima passada nesse no.

## 2026-10-04 (manha, 26) · "Ja esta vinculado na AppsFlyer, o que ainda preciso fazer?", e a resposta honesta e: a pergunta que separa

- O dono: "mas falamos que ja esta vinculado na appsflyer, o que ainda preciso
  fazer?". Ele tem razao de cobrar: a linha da lista dizia "ligar nos dois
  consoles" e ele ja tinha conferido os dois. **Linha que pede ao dono o que ele
  ja fez e linha que ensina a ignorar a lista.**
- **O que eu sei e o que eu nao sei.** Sei o sintoma: o Google conta 30 a 42
  conversoes por dia (coletor proprio) e a AppsFlyer nao registra UMA instalacao
  de `googleadwords_int` em nenhuma coleta. Nao sei a causa, e nao vou inferir
  da ausencia (regra de 03/10). As hipoteses vivas: (a) o vinculo esta em outra
  conta Google Ads da mesma pessoa, nao na 672-430-8347 que gasta; (b) o vinculo
  esta vivo e a AppsFlyer perde a instalacao para a Meta no ultimo toque, com a
  janela de visualizacao de 1 dia do Google; (c) a AppsFlyer nao reclama a
  instalacao porque o parceiro nao esta ativo do lado dela.
- **A pergunta que separa, e a API que ja temos responde**: de qual ORIGEM sao
  as conversoes que o Google conta, `segments.external_conversion_source`.
  THIRD_PARTY_APP_ANALYTICS = o vinculo com a AppsFlyer esta vivo do lado do
  Google (mata a hipotese a, aponta b ou c); GOOGLE_PLAY ou FIREBASE = o Google
  conta sozinho e o vinculo nao alimenta ninguem (aponta a ou c). "Acesso nao e
  a mesma coisa que perguntar": a credencial do Google Ads esta no n8n desde
  agosto e essa pergunta nunca foi feita.
- **O que entrou**: no `Google Ads: acoes de conversao` no fluxo "Analista:
  metricas externas", 30 dias, por campanha, com nome, categoria e origem da
  acao de conversao; `Google Ads: normaliza` grava `acoesDeConversao` (ou
  `acoesErro`). Ligado em serie depois de `termos de busca`, com
  `continueRegularOutput`: erro nele nao derruba o custo. Publicado.
- **O que NAO entrou, e por que**: a credencial. O MCP do n8n recusa anexar
  credencial a no HTTP ("does not accept credential googleAdsOAuth2Api"), igual
  a ontem com a AppsFlyer e o Play. Dois cliques do dono, e a linha da lista
  agora pede isso, e so isso, mais o print do numero da conta no vinculo.
- A linha "ligar nos dois consoles" saiu da lista. A conclusao sobre o vinculo
  so sai depois da primeira execucao com credencial, e vai dizer de qual
  instrumento veio.

## 2026-10-04 (manha, 25) · O bucket do Play abriu, e a primeira leitura era o relatorio certo do app ERRADO

- **A permissao do dono funcionou.** A coleta das 05:30 listou o bucket e
  gravou `play_downloads` com `ok: true`. E o que gravou foi **zero instalacao
  em setembro**, do arquivo
  `installs_com.appfactory.minhanotafinanceira_202609_overview.csv`. **O bucket
  e da CONTA, nao do app**: a conta do dono tem outros apps, a listagem tinha
  prefixo `stats/installs/` e teto de 200 arquivos em ordem alfabetica, e os 200
  acabaram antes de chegar em `installs_mentorque.app_`. O seletor pegou "o mes
  mais novo" entre o que veio. Nada no numero denuncia: e um CSV valido, com
  datas validas, do app do vizinho. **E o sexto zero estrutural desta casa, e o
  primeiro com `ok: true`.**
- **Conserto em tres lugares, e os tres provados**: (1) o prefixo da listagem no
  n8n virou `stats/installs/installs_mentorque.app_`; (2) o no que escolhe o
  arquivo exige o pacote de novo, porque prefixo e parametro que alguem edita;
  (3) a ROTA recusa arquivo de outro app antes de ler uma linha (`arquivo de
  OUTRO app da conta`), porque no de codigo do n8n nao e conferido por nada.
  `arquivoMaisNovo` ganhou o pacote como parametro obrigatorio. Tres defeitos
  plantados (seletor sem pacote, `includes` do pacote cru que aceitaria
  `mentorque.appfactory`, rota sem a trava), tres mordidas. Publicado no n8n
  (versao `22810c9c`) e EXECUTADO: agora o arquivo e
  `installs_mentorque.app_202609_overview.csv`, **336 instalacoes de 01 a
  25/09**, com o salto de 1 por dia para 55 por dia no dia 20/09, que e quando a
  midia paga comecou.
- **E O CSV CERTO TINHA OUTRO ZERO ESTRUTURAL DENTRO.** Li o arquivo bruto, nao
  so o pacote gravado: `Daily Device Uninstalls`, `Daily Device Upgrades` e
  `Total User Installs` sao 0 em TODOS os 25 dias, enquanto `Daily User
  Uninstalls` tem 17 e `Uninstall events` 19 no dia 25/09, e `Active Device
  Installs` sobe de 4 para **254**. O Play parou de alimentar tres colunas e
  deixou-as no arquivo. O leitor tirava a desinstalacao da coluna morta e
  gravou 25 dias de "ninguem desinstala". Agora a desinstalacao sai de `Daily
  User Uninstalls` e o pacote carrega `ativosNoFim` (a base instalada e
  estoque, vale a do ultimo dia). Tres plantios, tres mordidas.
- **O que o numero diz, com os dois instrumentos lado a lado**: Play 20 a 25/09
  = 315 instalacoes por aparelho; AppsFlyer na janela 27/09 a 04/10 = 166 no
  Android (116 Facebook + 50 Organic). Janelas diferentes, entao nao e
  comparacao fechada, mas a direcao bate com a ressalva que ja viaja no pacote:
  a AppsFlyer conta por baixo, e o Google cai dentro de Organic.
- **LIMITE QUE FICA**: o arquivo de setembro termina em 25/09 e nao existe
  arquivo de outubro no bucket. O Play atualiza esses CSVs com atraso de dias e
  o relatorio do mes corrente aparece quando ele quer. A escada vai dizer "ate
  25/09" e esta certo que diga. A linha gravada hoje ainda tem a desinstalacao
  da coluna morta: a proxima execucao, depois do deploy desta rota, corrige.
- **Vercel**: o commit do `ignoreCommand` buildou (READY, 46e1dd3). O primeiro
  commit so de doc depois dele e o que prova o pulo; ate la, sem sinal.

## 2026-10-04 (madrugada, 24) · A Vercel deixa de buildar o que ela nem sobe, e apagar um por um nao e o caminho

- Pergunta do dono: "eu preciso apagar 1 por 1? dos deploy antigos". **Nao.** A
  Vercel tem a tela **Deployment Retention** (Settings), que apaga por prazo o
  que passou, guardando sempre os 3 de producao mais recentes e os 3 mais
  recentes de qualquer tipo. Ao salvar, ela marca para apagar em ate 48 horas,
  com 30 dias para desfazer. Fonte: vercel.com/docs/deployment-retention e o
  changelog "hobby projects now retain fewer deployments". **Nao conferi por
  dentro do painel** (acesso de leitura, e a tela e de conta): a linha do dono
  diz o caminho e diz "se a tela nao existir no plano, ai sim e na mao".
- **O QUE O DOCUMENTO DELA DIZ E QUE MUDA A URGENCIA**: acima de 10 GB a Vercel
  apaga sozinha os deployments nao protegidos e **pode bloquear publicacao nova**
  ate baixar. Nao e so custo: e risco de a proxima correcao nao subir.
- **O QUE ENTROU DO MEU LADO, e e a parte que para o crescimento**: um
  `ignoreCommand` em `vercel.json` que pula o build quando o commit so mexe em
  `docs/`, `.claude/` ou `supabase/`, pastas que o `.vercelignore` ja nao sobe.
  **Medido antes de escrever**: 17 dos ultimos 40 commits eram so dessas pastas,
  e cada um gerou um build inteiro identico ao anterior, guardado como novo. O
  retrato diario sozinho fez 40 commits em 30 dias, todos de doc.
- **A CONFERENCIA E `conferir:publicacao`, e ela EXECUTA o comando**, nao so o
  le: monta um repositorio de mentira com sete commits (so doc, so pastas
  internas, misto, so codigo, so `vercel.json`, so `public/`, pasta de nome
  parecido) e confere o codigo de saida de cada um. O motivo e que no
  `ignoreCommand` sair 0 e "nao builda" e sair 1 e "builda", ao contrario do que
  o nome sugere; codigo invertido passa em qualquer leitura e so cai executando.
  Mais duas travas: toda pasta que o comando ignora tem que estar no
  `.vercelignore` (pular build de pasta que a Vercel SERVE deixaria o site velho
  com cara de publicado), e nenhuma pasta do `.vercelignore` pode ser lida por
  `app/` ou `lib/` em tempo de execucao, lendo o fonte e nao o nome da pasta,
  que foi o quase-erro do `assets/` ontem.
- **A primeira versao da trava de leitura mentia**: `"android"` e plataforma em
  16 arquivos, `"tools"` e nome de icone, e comentario que cita `docs/x.md` nao
  le nada. Cinco falsos positivos. Ficou: linha que chama o sistema de arquivos
  E cita a pasta como caminho. Sete plantios, sete mordidas, inclusive o do
  `assets/`.
- **O QUE EU NAO ALCANCO**: o que a Vercel faz com o comando la dentro. A
  prova de verdade e a aba Deployments mostrar "Canceled" com motivo de build
  ignorado no proximo commit so de doc. Este commit NAO e esse caso (mexe em
  `vercel.json` e `scripts/`), entao o primeiro sinal real vem com o retrato
  diario de hoje.

## 2026-10-03 (noite, 23) · 75% dos 10 GB da Vercel no dia 3, e a causa principal sou eu

- A Vercel avisou que a conta chegou a **75% dos 10 GB de Deployment Storage**
  no dia 3 do mes. **O e-mail dela parabeniza pelo trafego, e esse nao e o
  numero**: Deployment Storage e o ACUMULADO dos builds guardados, e cresce com
  quantas vezes a casa PUBLICA, nao com quantas pessoas visitam. Ler o e-mail ao
  pe da letra levaria a otimizar a coisa errada.
- **MEDIDO ANTES DE MEXER**: 75 MB versionados. `public/` e 46,6 MB em 259
  arquivos, com `public/learn` sozinho em 22,5 MB; `assets/` 12,7 MB; `tools/`
  5,1 MB; `android` e `ios` juntos 644 KB.
- **E A LEITURA QUE SALVOU UM CONSERTO ERRADO**: `assets/` parece material de
  trabalho e eu ia excluir. O `app/api/pecas/route.tsx` le `assets/pecas` e
  `assets/fontes` em TEMPO DE EXECUCAO, entao excluir quebraria a peca do
  Telegram em silencio. Conferido no fonte, nao no nome da pasta.
- **O QUE ENTROU**: um `.vercelignore` tirando `tools/` (5,1 MB de fontes que
  nenhum arquivo de `app/` ou `lib/` referencia), `android/`, `ios/`, `native/`,
  `docs/`, `.claude/`, `pecas-geradas/` e `supabase/`. **Uns 8 MB por
  publicacao**, e e honesto dizer que e pouco.
- **A CAUSA PRINCIPAL E O RITMO DE PUBLICACAO, E ELE E MEU.** Foram 20 deploys
  em 7 dias segundo o proprio coletor da Vercel, e so na noite de 03/10 foram
  uns 12. A regra das duas velocidades manda "cada pedido vira UM commit
  pequeno, publicado na hora", o que e otimo para rastrear e caro para
  armazenar. **Nao estou propondo mudar a regra**: estou registrando que ela tem
  um custo que ninguem tinha medido, e que ele aparece no dia 3 do mes.
- **O QUE DEVOLVE ESPACO JA GASTO e apagar deployment antigo**, e isso e do dono
  porque e painel e e destrutivo. Virou linha na lista.
- **O LEVER DE TAMANHO QUE SOBRA, para outra rodada**: `public/learn` com 22,5
  MB, servido cru porque o `next.config` tem `images.unoptimized: true` desde a
  rodada de Seguranca de 27/09 (que desligou o otimizador para fechar a CVE de
  AVIF). Comprimir essas imagens cortaria armazenamento E banda, e e mudanca
  visual, entao pede cuidado e nao cabe numa noite.

## 2026-10-03 (noite, 22) · A coleta foi EXECUTADA, e a execucao achou o que nenhuma leitura de codigo acharia

- Em vez de dizer "roda amanha as 05:30", rodei. Duas execucoes do coletor, e as
  duas acharam coisa.
- **A APPSFLYER ESTA PROVADA, com dado real no banco** (`fonte: appsflyer`,
  dia 03/10): Android com **Facebook Ads 133 instalacoes, 432 sessoes e 47
  leais**, e **Organic 53 com 14 leais**; iPhone com 3 organicas. Total 189, com
  133 pagas. **Os tres avisos viajaram dentro do pacote**, inclusive o do Google
  Ads. Deixou de ser teoria em producao.
- **E A PRIMEIRA EXECUCAO FALHOU COM 500 `gravacao_falhou`, por uma SEGUNDA
  COPIA DA LISTA DE FONTES que ninguem lembrava.** A rota valida a fonte contra
  um `Set` em TypeScript; a tabela valida contra uma clausula `check` propria. O
  `appsflyer` entrou no codigo e nao no banco, a rota aceitou e o banco recusou.
  **Sem rodar, isso gravaria nada todo dia, em silencio**, e o pacote nunca
  apareceria. Nenhuma leitura de codigo acharia: o defeito mora entre dois
  arquivos que ninguem le junto.
  - Migracao aplicada (`metricas_diarias_aceita_appsflyer`), arquivo de esquema
    atualizado, e a `conferir:aquisicao` passou a comparar as duas listas nos
    dois sentidos, com plantio de cada lado. E a mesma forma da lista de
    destinos da `acoes-do-dono`, que ja tinha conferencia; faltava esta.
- **O CONSERTO DO `play_console` FUNCIONOU EM PRODUCAO, e ele respondeu a
  pergunta**: o pacote agora diz `crash: {estado: "sem-linha", motivo: "a
  resposta nao trouxe o campo rows"}` e carrega a frase **"NAO E ZERO MEDIDO"**.
  Ou seja, a API responde e NAO publica metrica. Nao e falta de permissao, e
  supressao por volume, como a hipotese dizia. Agora esta medido em vez de
  suposto.
- **O BUCKET DO PLAY AINDA NAO ABRE**: `Credentials not found` nos dois nos. O
  dono precisa escolher a credencial `Google Service Account account` neles.
  A falha degradou como projetada: gravou o pacote dizendo que nao leu.
  - **E ISSO EXPOS UM DEFEITO MEU**: a rota gravou `naoLi: "arquivo vazio"`
    quando a causa real estava no pacote, em `erroDaListagem`. O sintoma
    escondia a causa. Consertado: erro de listagem ganha na hora de explicar, e
    tem assercao.
- **E O MAIS IMPORTANTE: o `googleadwords_int` CONTINUA AUSENTE com o dia de
  HOJE dentro da janela.** Isso MATA a hipotese da janela, que era a mais barata
  das tres. Sobram duas: o vinculo estar numa conta do Google Ads que nao e a
  `Mentorque` (672-430-8347), ou o Google reivindicar e PERDER no ultimo toque
  para a Meta, que teve 685 cliques contra 484 dele.
- **LIMITE DE TRANSPORTE, registrado**: o nome da campanha chegou como
  "Lan?amento Mentorque". O acento se perde entre a Pull API e o n8n. Os numeros
  nao sao afetados (sao ASCII) e o nome e rotulo, nao chave, mas fica dito
  porque no dia em que alguem agrupar por nome de campanha, duas grafias viram
  duas linhas.

## 2026-10-03 (noite, 21) · O coletor de instalacao do Play existe, e a permissao que falta e de CONTA, nao de app

- O dono abriu "Fazer o download de relatorios > Estatisticas" e passou os
  enderecos do bucket. O que interessa:
  `gs://pubsite_prod_6201974234817249283/stats/installs/` e
  `.../stats/store_performance/`, que e onde mora a aquisicao por origem.
- **O COLETOR ESTA ESCRITO E PUBLICADO** (`8222d989`): quatro nos novos listam o
  bucket, escolhem o CSV do mes mais novo PELO NOME (o relatorio e mensal e a
  API do Cloud Storage nao promete ordem nenhuma), baixam como texto e entregam
  cru para `/api/metricas`, que le com `lib/playRelatorios.ts`.
- **DUAS ARMADILHAS DESTE FORMATO, e as duas quebram caladas**:
  1. **o arquivo e UTF-16.** Lido como UTF-8, o cabecalho vem com um byte nulo
     entre cada letra, nenhuma coluna e achada, e um leitor ingenuo devolve zero
     linha com cara de "mes sem instalacao";
  2. **o cabecalho vem no IDIOMA DA CONTA.** Procurar o nome exato em uma lingua
     so funciona hoje e some no dia em que alguem trocar o idioma.
- **E A REGRA DE SEMPRE: formato que eu nao reconheco NAO vira zero.** Vira
  `naoLi` com o cabecalho que chegou, para a proxima rodada ter o que ler.
- **SETE DEFEITOS PLANTADOS NO LEITOR, SETE MORDIDAS**, com verde antes e depois.
  Um plantio precisou ser refeito: ele quebrou a sintaxe do arquivo e o script
  morreu sem imprimir FALHA, que e conferencia que nao provou nada e so pareceu
  ter provado. E a licao de 03/10 de manha se repetindo, e ela foi pega.
- **A PERMISSAO QUE FALTA E DE CONTA, NAO DE APP, e isso e o achado util da
  tela.** A conta de servico do n8n e a
  `revenuecat@mentorque.iam.gserviceaccount.com` (o dono confirmou), e ela
  mostra **13 permissoes de APP** no Mentorque. Permissao de app NAO abre o
  bucket: o acesso aos relatorios em massa vive na aba "Permissoes da CONTA".
  Confirmar isso e o que falta, mais escolher a credencial nos dois nos novos.
- A casa vai a 58 conferencias, e a `conferir:aquisicao` acumula 16 plantios.

## 2026-10-03 (noite, 20) · O quinto zero estrutural estava numa fonte que "coleta todo dia sem erro" ha 35 dias

- Pergunta do dono: "preciso fazer alguma coisa? algum acesso ou ajuste para
  termos os dados corretos?". Fui conferir o estado de cada degrau antes de
  pedir qualquer coisa, e achei um defeito nosso no caminho.
- **O `play_console` coleta desde 22/08, sao 35 dias, e 33 dos 35 pacotes sao
  IDENTICOS e VAZIOS**: `{"anrPorDia": [], "crashPorDia": []}`. Zero dias com
  crash. A fonte aparece verde no frescor, responde todo dia, e nao entrega uma
  linha desde que nasceu.
- **A CAUSA ESTAVA NO NO DE NORMALIZACAO**: `dados.erro` so era preenchido
  quando as DUAS chamadas traziam `.error`. Resposta sem linha nenhuma virava
  `[]`, que o leitor le como "foi medido e deu zero". Tres coisas diferentes
  viravam a mesma:
  1. a API respondeu e o app teve zero crash;
  2. a API respondeu e NAO publicou metrica (o Play suprime vitals abaixo de um
     minimo de usuarios distintos, e o Mentorque e pequeno);
  3. a chamada falhou e o `onError: continueRegularOutput` deixou passar.
- **CONSERTADO E PUBLICADO** (`ee9081b5`, `versionId` e `activeVersionId`
  iguais): cada pacote passa a trazer `crash.estado` e `anr.estado` com `ok`,
  `sem-linha` ou `erro`, mais o motivo. E quando os dois dao `sem-linha`, o
  pacote carrega a frase inteira: **"NAO E ZERO MEDIDO"**, com o porque e com o
  endereco de quem responde a pergunta de verdade (a migalha propria,
  `app_erros`, que mede os nossos aparelhos).
- **E O ACHADO MAIOR, que e sobre o metodo**: este zero sobreviveu 35 dias
  porque a fonte NUNCA FALHOU. O frescor das fontes mede se o pacote chegou, nao
  se ele tem conteudo. Fonte que responde vazio todo dia e invisivel para toda
  vigilancia que esta casa tem.
- **O QUE FALTA DE ACESSO, e e so um**: a aquisicao do Play Console. O Android e
  98% da base e a instalacao total dele nao esta em coletor nenhum. A metrica
  nao vive na API de Reporting (que e so vitals): ela vive no bucket de
  relatorios do Google Cloud Storage. Precisa do dono dar leitura a conta de
  servico que ja existe no n8n e passar o id do bucket.
- O `app_store_downloads` esta coletando e e minusculo: 12 atualizacoes e ZERO
  downloads novos em 01/10. O iPhone nao e o problema de medicao.

## 2026-10-03 (noite, 19) · A escada da aquisicao: um dono por degrau, e o que nao se soma nao se soma

- Pedido do dono: "estamos mapeando errado AppsFlyer, Google Ads, Play Store e
  Apple. Temos acesso a TODAS. Precisamos medir direito."
- **O DIAGNOSTICO NAO E FALTA DE ACESSO: as quatro fontes respondem perguntas
  DIFERENTES e a casa vinha misturando as respostas.** Agora cada degrau tem um
  dono unico, escrito em `lib/aquisicao.ts`:

  | Degrau | Dono, e por que so ele |
  |---|---|
  | dinheiro | paineis de anuncio: so eles sabem quanto saiu da conta |
  | instalacao total | as lojas: so elas veem o aparelho que instalou e nunca abriu |
  | instalacao por fonte | AppsFlyer: arbitrar entre redes que reivindicam a mesma pessoa e oficio de MMP |
  | contas | nosso banco |
  | receita | Stripe e RevenueCat |

- **AS TRES RECUSAS, e elas viajam DENTRO do pacote, nao em comentario de
  codigo**, porque regra que mora longe do numero nao chega na hora em que o
  numero e lido:
  1. **somar painel com painel conta a mesma pessoa duas vezes.** Google 235
     mais Meta 194 da 429, e a Play inteira registrou uns 140 na semana;
  2. **`conversoes` do Google Ads nao e instalacao**, e a prova e aritmetica:
     33,6 por dia reivindicados contra 20 por dia que a Play inteira registra;
  3. **a AppsFlyer nao e total**: ela so ve o aparelho onde o SDK subiu, 77% dos
     Android em 03/10. Ela responde PROPORCAO.
- **E O DEGRAU QUE A CASA NAO TEM DIZ QUE NAO TEM.** A instalacao total devolve
  `null` com o motivo escrito, **mesmo com o lado da Apple lido**: dar o numero
  da Apple como total faria o Android, que e 98% da base, sumir. A aquisicao do
  Play Console nao esta em coletor nenhum, e isso agora e buraco declarado em
  vez de numero emprestado.
- **O CUSTO POR INSTALACAO SO EXISTE COM AS DUAS PONTAS DO DONO CERTO.** A Meta
  tem: R$ 132,11 do painel dela dividido por 124 instalacoes do MMP, R$ 1,07. O
  Google NAO tem, e esse e o ponto inteiro: usar as 235 conversoes do painel
  dele como denominador daria R$ 0,65, um numero lindo e inventado. No dia em
  que o `googleadwords_int` aparecer, ele entra sozinho na conta.
- **NOVE DEFEITOS PLANTADOS, NOVE MORDIDAS**, e cada plantio e um erro REAL
  desta noite: painel no lugar do MMP, total da loja dado pela Apple sozinha,
  fonte faltando virando zero (duas vezes), ressalva do SDK parando de viajar,
  recusa sem a aritmetica que a prova, denominador de qualquer fonte, e o
  retrato parando de publicar a escada.
- `conferir:aquisicao` nasceu com plantio e entrou na fila do Guardiao no
  estado "no nascimento (autor)". A casa vai a 58 conferencias.
- **O QUE ISSO NAO CONSERTA**: o julgamento. A escada impede a MISTURA de
  inventar numero; ela nao impede alguem de ler um numero certo e concluir
  errado. Para isso a regra foi para o `CLAUDE.md`, que carrega em toda sessao.

## 2026-10-03 (noite, 18) · "Se temos acesso, por que ainda trazemos informacao incorreta?" O inventario dos sete erros de uma noite

- Pergunta do dono, e ela e mais dura e melhor que a anterior. Acesso nunca foi
  o problema. **Em uma noite sairam sete afirmacoes erradas, e seis tem a mesma
  causa.**
- **O INVENTARIO, sem suavizar**:
  1. "o Google Ads nao esta ligado na AppsFlyer" **(a integracao estava ativa,
     com link ID nos dois apps)**. Inferi a causa a partir da AUSENCIA da linha;
  2. "o organico e no maximo 11%" **(o Play dizia 11%, a AppsFlyer dizia 31%)**.
     Publiquei precisao de um instrumento so;
  3. "1.400 conversoes pagas por mes, oito meses de pacote" **(o real e umas
     480, uns dois anos)**. Li um grafico do Play como instalacao diaria;
  4. "72% de quem instala nunca abre" **(contestado pela AppsFlyer, 124
     instalacoes com 397 sessoes)**. Dois numeros do Play que eu nunca conferi
     se eram comparaveis;
  5. "a atribuicao e saida cara, gasto novo" **(ja estava instalada, com numero
     no nosso proprio diario de 22/09)**;
  6. "o criterio 6 e inalcancavel por falta de etiqueta" **(e inaplicavel: 96%
     do dinheiro e video, e video nao tem termo de busca)**;
  7. "a tela de aquisicao do Play Console e a saida mais barata para dividir o
     gasto" **(o Play nao divide anunciante: a dimensao dele tem duas linhas)**.
     Essa virou prioridade do Diretor e item da lista do dono por dois dias.
- **A CAUSA COMUM DE SEIS DELES: conclusao tirada do primeiro numero encontrado,
  sem perguntar o que ele mede e sem procurar um segundo instrumento que meca a
  mesma coisa.** O setimo (a AppsFlyer como gasto novo) tem a causa que ja virou
  licao hoje: precificar uma saida sem conferir se ela ja existe.
- **E O PONTO QUE MAIS DOI: a disciplina existia e nao alcancava onde o erro
  aconteceu.** A regra "antes de publicar qualquer zero, pergunte quem escreve
  aquele numero" entrou hoje na regua do QA. Os sete erros desta noite nao
  aconteceram em rodada nenhuma: aconteceram na CONVERSA, ao vivo, respondendo
  o dono. Regra que mora em manual de papel semanal nao chega na terca a noite.
- **ENTAO A REGRA FOI PARA O `CLAUDE.md`**, que e o que carrega em toda sessao,
  e nao para DIRETRIZES, que e dos papeis. Tres linhas: diga de qual instrumento
  o numero veio e cite o segundo quando existir, ou declare que nao conferiu;
  ausencia nao e causa; e acesso nao e a mesma coisa que perguntar.
- **E O COLETOR FOI CONSERTADO NO MESMO MOVIMENTO**: a consulta do Google Ads
  ganhou `segments.ad_network_type` e `metrics.interactions`, e o pacote passa a
  trazer `porRede` e `fatiaDeBusca`. A credencial esta la desde agosto; o que
  faltava era a PERGUNTA. Publicado, `versionId` e `activeVersionId` iguais
  (`54843a49`). Da proxima vez a quebra por rede chega sozinha e ninguem precisa
  exportar CSV.

## 2026-10-03 (noite, 17) · 96% do dinheiro do Google esta em YouTube e Display, e ninguem aqui sabia

- O dono exportou os cards da visao geral do Google Ads (26/09 a 02/10). A
  quebra por REDE nunca tinha sido lida nesta casa.
- **YouTube R$ 120,14 (360 cliques), Display R$ 27,33 (111), Pesquisa do Google
  R$ 5,20 (6), parceiros R$ 0,49 (3). Ou seja: R$ 147,47 de R$ 153,16, 96%, em
  video e display.** A campanha de app e MULTI_CHANNEL e o Google escolheu onde
  servir; ele escolheu video.
- **ISSO CORRIGE TRES LEITURAS DESTE MES**:
  1. o criterio 6 da regua de Midia (desperdicio com nome) nao e inalcancavel
     por falta de etiqueta, e **inaplicavel por natureza do canal**: nao existe
     termo de busca em anuncio de video;
  2. as duas listas de negativa, que o dono aplicou hoje e que estao na lista
     dele desde 03/09, valem sobre **3,7% do dinheiro**. Continuam certas, e o
     tamanho delas precisa estar escrito do lado;
  3. `Interações` nao e clique: 4.516 contra 478 na mesma semana, nove para um,
     porque em video o Google conta visualizacao engajada.
- **E DA UMA HIPOTESE COM FUNDAMENTO PARA A ATRIBUICAO ZERO**: campanha de video
  produz muita reivindicacao view-through, e a janela de view-through da
  integracao do Google na AppsFlyer esta em **1 dia** contra 30 da de clique.
  Reivindicacao de video com mais de um dia e recusada por desenho. Explica um
  vao grande; **nao explica zero exato**, entao segue hipotese.
- **A CAMPANHA DE APP NAO PAROU**: R$ 18,45 a R$ 26,36 por dia, sem queda. Quem
  parou foi a de busca, agora com o grupo nomeado: `Sintomas` de R$ 68,41 para
  R$ 0,00 e `Perguntar/aprender (IA + trilhas)` de R$ 26,11 para R$ 0,00.
- **E A PROVA DE QUE AS NEGATIVAS NAO TEM NO QUE MORDER**: os dez termos de
  busca da semana somam R$ 0,00 e zero clique, e nenhum e de curso ou scanner.
  Sao todos relevantes. Era o que estava escrito como prova fraca em 03/10, e
  agora tem numero.
- Tudo em `midia-paga.md`, para a rodada de 09/10 abrir com isso em vez de
  repetir a conversa de palavra-chave.

## 2026-10-03 (noite, 16) · Eu inferi a causa da ausencia, o dono me corrigiu, e a evidencia aponta para outro lugar

- **O ERRO E MEU E E O DA CASA.** Eu vi que `googleadwords_int` nao aparecia no
  relatorio de parceiros e CONCLUI que a integracao nao estava ligada. O dono
  respondeu que nao mexeu em nada e mostrou a tela: parceiro **Active**, link ID
  preenchido, nos dois apps. **Eu inferi causa a partir de ausencia**, que e
  exatamente o erro que esta casa persegue desde agosto. Zero nao diz por que.
- **A EVIDENCIA NOVA, do pacote de `google_ads` de hoje**: a campanha
  `APP | Android | Instalações | BR` (id 24273898063) e `MULTI_CHANNEL`, que e o
  canal das campanhas de app, esta `ENABLED`, gastou **R$ 151,17** com **484
  cliques**, 13.383 impressoes e **235 conversoes** em 7 dias. A outra,
  `Mentorque Lançamento`, e SEARCH e gastou R$ 4,00 com 2 cliques.
- **ENTAO O GOOGLE ACHA QUE ESTA ENTREGANDO**, e a AppsFlyer atribui zero a ele.
  A contradicao e real e precisa de causa, nao de palpite.
- **AS HIPOTESES, e cada uma com o teste que a separa**:
  1. **link ID repetido entre os dois apps.** A documentacao da AppsFlyer e
     explicita: Android e iPhone precisam de link IDs SEPARADOS. O print que o
     dono mandou e do app do iPhone (`id6797291865`) com o ID `15D69FA...`. Se o
     Android estiver com o MESMO ID, o Google reivindica para um app so. **Teste:
     abrir a mesma tela no app Android e comparar as duas strings.** E a
     hipotese de cima porque e a unica que explica zero exato com integracao
     ativa;
  2. **link criado em outra conta do Google Ads.** Sao seis contas no seletor, e
     quem gasta e a `Mentorque` (672-430-8347), conferido no coletor. Teste: no
     Google Ads, Gerenciador de dados, ver em qual conta esta o vinculo;
  3. **janela anterior ao vinculo.** Teste: baixar o relatorio de parceiros so
     dos ultimos 2 dias.
- **E UMA QUARTA, que explica PARTE e nao o zero**: o Google conta instalacao
  quando a Play reporta, e a AppsFlyer so ve a instalacao quando o SDK sobe, ou
  seja no primeiro ABRIR. Com 23% que nunca sobem o SDK e o degrau de instalacao
  para primeiro acesso que o Play mostrou, e esperado o Google contar bem mais
  que a AppsFlyer. **Esperado contar mais; nao esperado contar zero.**
- Registrado antes de qualquer conserto, porque a rodada de Midia vai ter que
  ler estes dois numeros lado a lado e a diferenca entre "conta mais" e "conta
  zero" e o que separa limite de instrumento de defeito.

## 2026-10-03 (noite, 15) · O Google Ads na AppsFlyer nao e app: build novo nao resolve, e o vinculo nao e retroativo

- Pergunta do dono: "voce disse que o Ads nao chega. Precisamos fazer algo ou so
  rodar um build novo ja vamos resolver?". **O build NAO resolve**, e a pergunta
  e justa porque eu juntei dois problemas independentes na mesma frase.
- **O GOOGLE ADS AUSENTE E VINCULO DE CONSOLE, ZERO CODIGO.** Ele e rede
  autoatribuida: a AppsFlyer avisa o Google de uma instalacao e o Google
  responde se reivindica. Sem o vinculo nao ha a quem perguntar, e nenhuma
  versao do app muda isso.
- **E O LADO DO APARELHO JA ESTA PRONTO, conferido no fonte e nao no README**:
  o `build.gradle` do `appsflyer-capacitor-plugin` traz
  `com.android.installreferrer:installreferrer:2.2`, que e a biblioteca pela
  qual a atribuicao do Google chega no Android. Era a unica hipotese que faria o
  build ser necessario, e ela caiu na leitura.
- **O CAMINHO TEM DUAS PONTAS**, e saber disso evita uma segunda viagem: no
  Google Ads, Ferramentas e configuracoes > Gerenciador de dados > fonte
  "Analise de apps de terceiros" > criar um **link ID** com a AppsFlyer como
  provedora, com **IDs separados para Android e iPhone**; e na AppsFlyer,
  Collaborate > Partner Marketplace > Google Ads > "Activate partner" + o link
  ID. A fonte aparece como `googleadwords_int`.
- **E A PARTE QUE CUSTA DINHEIRO POR DIA: NAO E RETROATIVO.** Rede
  autoatribuida nao preenche o passado. Tudo instalado antes do vinculo fica
  dentro de `Organic` para sempre. Entao cada dia parado nao e um dia de atraso,
  e um dia que nunca vai ter resposta. Isso entrou na linha da lista e no manual
  da Midia, para voltar junto com a recomendacao toda vez.
- **O QUE O BUILD RESOLVE E OUTRA COISA**: os 23,1% de Android que nunca sobem o
  SDK. Vale para TODAS as fontes, inclusive a Meta, e sai na 3.0. Os dois
  consertos sao independentes: com o Google ligado e sem o build, a divisao ja
  funciona sobre os 77% que reportam, e como PROPORCAO ela e valida.

## 2026-10-03 (noite, 14) · 23% dos Android nunca sobem o SDK, e a casa nao sabia por que porque o catch jogava fora

- O dono ligou a credencial e perguntou duas coisas: se a visao dos downloads
  esta completa, e se o codigo do app precisa melhorar. As duas respostas sairam
  da mesma medicao.
- **O NUMERO, medido agora no banco: 407 aparelhos Android em 21 dias, 313
  subiram o SDK, 92 NUNCA subiram. 23,1%.** Em 22/09 eram 25%, com a 2.7.0. Por
  versao, 2.9.0 esta em 23% e 2.8.0 em 14%. **Duas versoes passaram e o numero
  nao andou.**
- **E UM FATO QUE MUDA A HIPOTESE: `sem-plugin` e ZERO.** O plugin esta no
  binario em todos os aparelhos. O que falha e o `initSDK`, de verdade, e nao a
  falta da biblioteca, que era o problema da 2.6.
- **POR QUE NINGUEM CONSERTOU EM DUAS VERSOES: o `catch` jogava o erro fora.**
  A casa sabia que 23% falhavam e nao tinha como saber por que, porque o
  diagnostico era descartado na linha seguinte a da falha. Nao ha o que
  investigar quando o instrumento nao guarda a causa.
- **DOIS CONSERTOS, e eles sao pequenos**:
  1. **O motivo viaja.** `motivoDaFalha` virou regra pura em
     `lib/app/motivoDaFalha.ts` (sem import nenhum, para a conferencia
     exercitar de verdade) e vira um slug `erro:<causa>` que cabe nos 32
     caracteres que a rota do funil aceita em `origem`. Nao e classificacao
     fina: e o bastante para a proxima rodada ver a DISTRIBUICAO e aí sim
     classificar com dado na mao.
  2. **Tres tentativas na mesma abertura**, com espera crescente. O desenho
     antigo tentava uma vez e deixava a proxima abertura tentar de novo, so que
     o aparelho medio abre 1,5 vez (medido pelo QA em 30/09): na pratica era
     uma tentativa na vida do aparelho.
- **E UM DETALHE QUE EVITA MEDIR A COISA ERRADA**: a falha so e registrada
  DEPOIS de todas as tentativas. Gravar a falha da primeira faria o aparelho que
  deu certo na terceira contar como falha, e a conta de 23% passaria a medir
  "tropecou" em vez de "nao subiu".
- **NOVE DEFEITOS PLANTADOS, NOVE MORDIDAS**, com verde antes e depois.
- **ISTO SO CHEGA AO USUARIO NUM BUILD NOVO**, e foi conferido no fonte antes de
  ser dito: `capacitor.config.ts` NAO tem `server.url`, o app roda inteiro de
  dentro do binario. Entao este conserto entra na 3.0 e nao vai ao ar hoje. A
  regra da casa manda conferir isso antes de afirmar que algo precisa de build,
  e desta vez precisa mesmo.
- **E A RESPOSTA SOBRE A VISAO COMPLETA E NAO**, com tres buracos nomeados: o
  Google Ads nao ligado no console da AppsFlyer (clique, ja na lista), os 23%
  que nao sobem o SDK (build), e o iPhone, que por decisao de 29/08 nao pede ATT
  e portanto so tem SKAdNetwork agregado, sem instalacao por campanha. O
  terceiro nao e defeito: e escolha registrada, e o preco dela e nao saber qual
  campanha trouxe iPhone.

## 2026-10-03 (noite, 13) · O coletor da AppsFlyer existe, e a leitura do CSV ficou onde da para conferir

- O dono gerou o token da Pull API e guardou no n8n como credencial Bearer
  `AppsFlyer`. Com isso a AppsFlyer deixa de ser via de mão única.
- **O DESENHO, e a decisão que importa: a LEITURA do CSV mora no repositório,
  não num nó de código do n8n.** O n8n faz o que ele faz bem (guarda o token,
  bate na Pull API duas vezes, uma por app, e entrega o texto); `lib/appsflyer.ts`
  lê. O motivo é simples: nó de código do n8n não é conferido por nada, e o que
  quebra calado num relatório de parceiros é exatamente a leitura.
- **E A LEITURA TEM QUATRO ARMADILHAS, todas com plantio**: vírgula dentro de
  campo entre aspas (`"Lançamento, Mentorque"`) desloca todas as colunas à
  direita e as instalações passam a vir da coluna errada com cara de número
  certo; `N/A` virando zero transforma "não sei o custo" em "foi de graça";
  texto de erro da API lido como tabela vazia vira "zero instalação", que é
  queda de coleta com cara de queda de campanha; e `every` sobre lista vazia
  diz "custo desligado" sem ter olhado uma linha.
- **O AVISO DO ZERO ESTRUTURAL É CAMPO DO PACOTE, não comentário de código.**
  Enquanto o Google Ads não estiver ligado no console, todo pacote gravado
  carrega a frase: "ZERO aqui significa NAO PERGUNTADO, nunca 'nao trouxe
  ninguem'". E ela **some sozinha** no dia em que o Google aparecer como fonte,
  porque é derivada do conteúdo e não uma frase que alguém precisa lembrar de
  apagar. O mesmo vale para o aviso de custo desligado.
- **A PORTA É A QUE JÁ EXISTE**, `/api/metricas`, e isso também é decisão: o nó
  do n8n que grava métrica já carrega a chave da casa, e uma rota separada
  significaria uma segunda cópia da mesma chave num segundo lugar. Chave
  copiada é chave que um dia gira pela metade.
- **DEZOITO DEFEITOS PLANTADOS, DEZOITO MORDIDAS**, com verde antes e depois de
  cada um: doze na leitura e cinco na ligação da rota, mais um que nasceu de um
  plantio que PASSOU VERDE (o `every` sobre lista vazia) e virou asserção nova.
  Esse é o valor do plantio: ele achou um caso que eu tinha protegido no código
  e não tinha provado.
- **O QUE FICOU FALTANDO, e é do dono: escolher a credencial nos dois nós.** O
  MCP do n8n que eu uso **recusa anexar credencial genérica a nó HTTP**, e isso
  foi testado com duas credenciais diferentes antes de eu desistir. Os nós estão
  publicados (`versionId` e `activeVersionId` iguais, `bf633fd9`) com a
  instrução escrita na nota de cada um. Virou linha na lista.
- **ENQUANTO NÃO FOR ESCOLHIDA**, a coleta das 05:30 grava o pacote com o aviso
  de relatório não lido, em vez de inventar zero. A falha aparece no dado, que é
  o jeito desta casa.
- **ISTO É TEORIA EM PRODUÇÃO**: nenhuma coleta passou por este código. A prova
  é a execução de amanhã às 05:30, depois da credencial escolhida, e o que ela
  tem que mostrar é `fonte: appsflyer` com 124 ou mais instalações do Facebook
  Ads e a lista de avisos com o do Google dentro.

## 2026-10-03 (noite, 12) · A Meta trouxe 124 instalacoes e o Google trouxe ZERO, e esse zero e estrutural

- O dono baixou o relatório de parceiros do app **Android**, janela de 26/09 a
  03/10 (o anterior era do iPhone, com 3 instalações, e o seletor de app era a
  causa). Duas linhas, e elas respondem a pergunta de duas semanas:

  | Fonte | Campanha | Instalações | Sessões | Leais | Leais/Inst. |
  |---|---|---|---|---|---|
  | Facebook Ads | Lançamento Mentorque | **124** | 397 | 42 | 33,87% |
  | Organic | - | **52** | 0 | 14 | 26,92% |

  São 176 instalações em 8 dias, 22 por dia, e a Meta responde por 70% delas.
- **E O GOOGLE ADS NÃO TEM LINHA. ZERO. E esse zero é ESTRUTURAL, não é
  resultado.** O Google Ads é rede autoatribuída: a AppsFlyer só enxerga
  instalação dele quando a integração está ligada no console, e ela não está.
  Então "zero" aqui significa **"não conectado"**, e NÃO "não trouxe ninguém".
  As instalações do Google estão quase certamente dentro das 52 orgânicas,
  misturadas com orgânico de verdade.
- **É A QUINTA VEZ QUE ESTA CASA TROPEÇA NO ZERO ESTRUTURAL**, e a primeira em
  que ele foi reconhecido ANTES de virar conclusão publicada. As quatro
  anteriores: `renovacoes 0`, `iniciou_checkout 0`, `funil_eventos` sem evento
  de RevenueCat, e a etiqueta da busca em 20/09. O passo do ritual que o retorno
  do QA ganhou hoje ("antes de publicar qualquer zero, pergunte quem ESCREVE
  aquele número") é o que pegou este.
- **ENTÃO A DIVISÃO DOS R$ 280,68 AINDA NÃO SAI, e agora sabemos exatamente por
  quê.** O que dá para dizer com o que existe:
  - **Meta: R$ 132,11 na semana contra 124 instalações em 8 dias, uns R$ 1,07
    por instalação.** Ordem de grandeza, porque as janelas estão deslocadas em um
    dia e o gasto é de 7 dias contra instalação de 8.
  - **Google: desconhecido**, escondido nas 52 orgânicas. R$ 151,83 sem
    denominador.
- **CRUZAMENTO QUE DÁ CONFIANÇA NA LEITURA**: o painel da Meta relatou 194
  instalações na semana e a AppsFlyer conta 124, ou seja 64%. Bate com a falha
  medida em 22/09, de 25% dos aparelhos Android nunca subirem o SDK, mais a
  diferença normal entre painel de plataforma e MMP. Os dois números discordam
  do jeito esperado, e não de um jeito que peça investigação.
- **ACHADO DE NEGÓCIO, e é bom: o tráfego da Meta NÃO é lixo.** 42 usuários
  leais em 124 instalações (33,87%) contra 14 em 52 orgânicas (26,92%). A
  campanha de instalação traz gente que volta MAIS que o orgânico. Era o medo
  natural de campanha de instalação e ele não se confirmou.
- **E UMA LEITURA MINHA DE HORAS ATRÁS FICA CONTESTADA**: eu li do Play que 561
  aquisições produziram 158 primeiros acessos e disse que 72% nunca abriam o
  app. Aqui, 124 instalações da Meta produziram **397 sessões**, 3,2 por
  instalação. Os dois não podem estar certos do mesmo jeito. Não resolvo isso
  hoje: fica escrito que a leitura de 72% está CONTESTADA por um segundo
  instrumento e precisa de uma terceira medida antes de virar prioridade. Era
  exatamente por isso que ela não tinha sido fechada como achado.
- **ESTRANHEZA DO ARQUIVO, registrada e não interpretada**: a linha orgânica traz
  0 sessões e 14 usuários leais ao mesmo tempo, o que é contraditório. Pode ser
  que o relatório não conte sessão para orgânico. Não tiro conclusão de sessão
  orgânica enquanto isso não for entendido.
- O item da lista continua: ligar o Google Ads no Collaborate é o que transforma
  as 52 orgânicas em duas linhas e fecha o critério 3 de verdade.
- **E A PERGUNTA DA API FOI RESPONDIDA PELO PRÓPRIO CONSOLE**: a página
  `Export > API Access` mostra a aba **Pull API** disponível, com Raw Data
  Report e Aggregated Report, e a instrução "peça a um usuário admin o token da
  Pull API". O dono É admin. Então a porta está aberta neste plano, e o coletor
  deixa de ser hipótese: falta o token, que é a metade dele porque é chave.

## 2026-10-03 (noite, 11) · O primeiro export veio com 3 instalacoes, e o motivo e o seletor de app

- O dono baixou os dois relatórios de parceiros, janela de 26/09 a 03/10. O
  `partners-report` tem **uma linha só**: `Organic`, **3 instalações**, nenhuma
  linha de Facebook Ads, custo `N/A`.
- **O DIAGNÓSTICO NÃO É "A ATRIBUIÇÃO QUEBROU", é o seletor.** O painel, na
  visão unificada dos DOIS apps, diz 162 atribuições e 111 não orgânicas na
  mesma semana. A tela de export tem um seletor `App` com um app só marcado, e
  três instalações em oito dias é a ordem de grandeza do iPhone, não do Android
  (a rodada de Mídia mediu 41 contas Android contra 2 de iPhone na semana de
  24 a 30/09). O arquivo está certo sobre o app que ele mediu.
- **E O CABEÇALHO DO CSV JÁ PROVA QUE O CAMINHO É ESTE**: as colunas são
  `Media Source (pid)`, `Campaign (c)`, `Installs`, `Total Cost`, `Average eCPI`.
  É exatamente o critério 3 da régua da Mídia, pronto, numa linha por campanha.
  O `Total Cost` vindo `N/A` é a mesma coisa que os cartões vazios do painel
  diziam: falta a integração de custo. Mas o gasto por plataforma a casa já tem
  dos painéis de anúncio, então instalações por fonte fecham a conta na mão.
- Próximo passo, de um clique: trocar o app no seletor para o Android e baixar o
  `Partners (media sources)` de novo.

## 2026-10-03 (noite, 9) · O painel da AppsFlyer derruba duas contas minhas do mesmo dia, e as duas eram estimativa lida de grafico

- O dono abriu o painel. Performance Analysis, visão unificada (os dois apps),
  janela de **26/09 a 02/10**: **162 atribuições, 111 não orgânicas, 51
  orgânicas**. E três cartões vazios: `Cost of installs`, `eCPI` e `ROAS D1`,
  todos com "No data found".
- **PRIMEIRA CORREÇÃO, do preço.** Eu escrevi, horas antes, que o volume era de
  umas 1.400 conversões pagas por mês e que o pacote gratuito de 12.000 cobriria
  uns oito meses. O medido são **111 não orgânicas por semana, umas 480 por
  mês**: o pacote cobre uns DOIS ANOS, e depois seria da ordem de US$ 34 por
  mês. Minha conta saía de um gráfico do Play que eu li como instalação diária e
  não era. **Estimativa tirada de gráfico cuja métrica não foi lida até o fim**,
  que é exatamente a doença que o retorno de hoje cobrou do papel de Mídia.
- **SEGUNDA CORREÇÃO, e é mais séria, do tamanho do orgânico.** Eu publiquei
  hoje, no manual do ASO e na ficha, que o orgânico era "no máximo uns 11%",
  tirado do `Não atribuído` do Play (6 de 54 em 29/09). A AppsFlyer, na mesma
  semana, diz **51 orgânicas em 162, que é 31%**. Os dois baldes não são a mesma
  coisa: o do Play junta anúncio com link direto, e o da AppsFlyer chama de
  orgânico tudo que não casou com rede paga. **O honesto é a faixa: entre um
  décimo e um terço.** Corrigido nos dois arquivos, com a regra de que qualquer
  frase sobre o tamanho do orgânico cita os dois números ou não cita nenhum.
- **O que NÃO muda**: a maioria da aquisição é paga pelos dois instrumentos, e a
  mudança de alvo do papel de ASO continua de pé. Era a direção que importava, e
  ela sobreviveu ao segundo instrumento. O que não sobreviveu foi a precisão
  falsa do "11%".
- **O QUE OS TRÊS CARTÕES VAZIOS DIZEM**: sem integração de CUSTO ligada, a
  AppsFlyer atribui instalação mas não sabe quanto ela custou. É por isso que
  `eCPI` está vazio, e `eCPI` por campanha é literalmente o critério 3 da régua
  da Mídia. Então a ligação que falta não é só a do Google Ads para atribuir: é
  a de custo, dos dois lados.
- Próximo passo, na lista do dono: ligar Google Ads e o custo da Meta no
  Partner Marketplace da AppsFlyer, e mandar a tabela por media source.

## 2026-10-03 (noite, 8) · "Tem custo o AppsFlyer?" derrubou metade da minha conclusao de dez minutos antes

- Pergunta do dono, depois de eu listar a atribuição como "saída cara, gasto
  novo, decisão sua". **A resposta é que ela já está instalada e já atribui.**
- **O QUE EU DEVIA TER CONFERIDO ANTES DE PRECIFICAR**: o plugin
  `appsflyer-capacitor-plugin` está no `package.json`, tem conferência própria
  (`conferir:appsflyer`) e um conserto no `postinstall`. E o diário de 22/09
  registra o painel dela medindo **13 instalações do Facebook Ads contra 10
  orgânicas**, de 18 a 20/09. Eu listei três saídas em ordem de custo sem olhar
  o estado da mais cara, e ela estava de pé, com número escrito nesta mesma
  casa.
- **É O MESMO ERRO QUE ESTE PAPEL COMETEU EM 22/09**, e o diário registra: ele
  afirmou que o OneLink estava parado com base num registro de 05/09, e o dono
  mostrou que já funcionava. **Prova velha usada como prova atual.** Hoje fui eu,
  com a prova nova escrita a dez linhas de distância do que eu estava lendo.
- **O QUE FALTA É LIGAÇÃO DE CONSOLE, NÃO COMPRA.** Naquele relatório de 22/09 o
  Google Ads não aparece como fonte de mídia; a explicação provável é que a
  integração de rede autoatribuída do Google nunca foi ligada no painel da
  AppsFlyer. Virou linha na lista do dono, com destino novo `appsflyer`
  (acrescentado no código e na documentação, que a `conferir:agentes` obriga a
  bater).
- **O PREÇO, para a decisão não ficar sem número**: plano Zero gratuito, pacote
  de 12.000 conversões no primeiro ano, depois uns US$ 0,07 por conversão
  atribuída a mídia paga (orgânica não conta). No ritmo que o Play mostrou, uns
  50 por dia, são umas 1.400 conversões pagas por mês: o pacote cobre uns oito
  meses e depois é da ordem de US$ 100 por mês, sobre uns R$ 1.200 de mídia
  mensal. Números de páginas de terceiro, NÃO da AppsFlyer: o plano e o saldo
  reais estão no console do dono, e isso está dito como está.
- **A RESSALVA QUE VIAJA JUNTO, medida em 22/09**: 25% dos aparelhos Android da
  2.7.0 nunca subiram o SDK. A AppsFlyer conta por baixo, então a divisão entre
  Google e Meta vale como PROPORÇÃO e não como total. Falta reconferir esse 25%
  na 2.9.
- **O QUE ISSO MUDA NA CONCLUSÃO DE DEZ MINUTOS ANTES**: a morte da tela do Play
  Console continua valendo (ela tem duas origens e não divide anunciante), mas
  a consequência que eu tirei dela estava errada. Não há escolha cara a fazer
  agora: há uma ligação de console a ligar, e uma decisão de preço que volta
  daqui a uns oito meses.
- A lista do dono vai de 11 para 12 itens, e ganhou um painel.

## 2026-10-03 (noite, 7) · A origem do trafego do Play tem DUAS linhas, e isso encerra um veredito e encarece uma decisao

- O dono foi até o fim das telas. A dimensão "Origem do tráfego", em
  Estatísticas, tem **exatamente duas origens**: `Pagas e diretas` e
  `Não atribuído`. Em 29/09, **48 contra 6**, total de 54 no dia. Não existe
  linha de Google Ads, de Meta nem de busca orgânica da loja.
- **OS DOIS ITENS DO PLAY CONSOLE SAEM DA LISTA, e os dois saem com resposta**,
  que é diferente de sair por desistência. A tela foi aberta, a dimensão foi
  trocada, os canais foram todos marcados, e a lista tem dois.
- **PARA O ASO: o veredito do título de 01/09 está ENCERRADO.** A leitura que
  ele esperava (aquisição pela origem "Pesquisa do Google Play") não existe
  neste painel e não vai existir. Pela regra escrita em 01/09, sem leitura o
  título FICA. Não volta como pendência em rodada nenhuma, e isso está no manual
  dele para ninguém reabrir.
- **E O ALVO DAQUELE PAPEL MUDOU, com três números apontando para o mesmo
  lugar**: três quartos das instalações não passam pela ficha, a origem orgânica
  é no máximo 11% do dia, e a conversão da ficha é 29,1%. **A loja hoje é quase
  inteiramente um destino de anúncio.** Enquanto a aquisição for ~90% paga, a
  alavanca da ficha é a CONVERSÃO de quem o anúncio manda (primeiras imagens,
  primeira frase, nota), não a caça a palavra-chave, que mexe num décimo. Toda
  proposta de ficha passa a declarar o tamanho do alcance dela, e existe gatilho
  escrito para o alvo voltar ao orgânico.
- **PARA A MÍDIA: a saída mais barata morreu, e isso encarece a decisão em vez
  de adiá-la.** O Play Console NÃO divide anunciante, então o custo por desfecho
  por campanha (critério 3) passa a depender de uma das duas saídas caras: o
  Install Referrer (nosso, precisa de versão nova do app) ou um medidor de
  atribuição (gasto novo). As duas são decisão do dono.
- **E ISSO COBRA A MINHA PRÓPRIA DEVOLUTIVA DE HOJE.** Eu escrevi para o papel
  de Mídia, horas atrás: "se ela voltar lida, o critério 3 volta a ser
  alcançável e você diz como; se em duas rodadas ela não voltar, proponha a
  reescrita". Ela voltou lida no mesmo dia e não serve. O retorno foi corrigido
  no manual com o desfecho, e a rodada de 09/10 deve a consequência: propor a
  escolha entre as duas saídas caras COM O PREÇO na mesma frase, ou propor a
  reescrita dos critérios 3 e 6. Declarar inalcançável e seguir deixou de ser
  opção, porque o instrumento agora está mapeado.
- **O QUE ESTA LEITURA NÃO ALCANÇA**: `Pagas e diretas` junta anúncio com link
  direto, então nem a fatia paga total é limpa; e `Não atribuído` é um balde,
  não um canal. Qualquer frase sobre "o orgânico" a partir daqui é teto, não
  medida.
- Lista do dono: de 13 para 11 itens. O Play Console sai inteiro da lista.

## 2026-10-03 (noite, 6) · Tres quartos das instalacoes nao passam pela ficha, e a conversao da loja finalmente tem numero

- O dono abriu o Play Console e mandou as telas. A metade da leitura que
  faltava desde 01/09 existe agora, e ela trouxe um achado que ninguem tinha
  procurado.
- **OS NÚMEROS, todos do Play Console**: taxa de conversão da ficha **29,1%** em
  28 dias (27,93% na janela de 90); 484 visitantes da ficha e **134 cliques de
  instalação** em 28 dias; **561 aquisições de dispositivos** e **158 primeiros
  acessos** em 28 dias; e, em Estatísticas, **403 aparelhos com o app instalado
  em 29/09, 98,51% no Brasil** (os outros são 2 no Irã, 1 no Chile, 1 na
  Alemanha, ou seja ruído).
- **O ACHADO: 561 aquisições contra 134 cliques de instalação a partir da
  ficha.** Cerca de três quartos das instalações NÃO passam pela página da
  loja, porque campanha de app instala direto do anúncio. As duas janelas de 28
  dias que o painel oferece estão deslocadas em uma semana, então isto é ordem
  de grandeza e não conta exata, e está escrito assim em `docs/lojas/ficha.md`.
- **O QUE ISSO MUDA, e não é pequeno**: título, descrição curta e palavras-chave
  mexem no quarto que chega na página. Toda proposta de ficha deste papel vinha
  sendo dimensionada como se mexesse no todo. Não derruba a proposta da
  descrição curta (continua barata, continua na direção certa), encolhe a
  expectativa dela, e isso passa a ter que estar escrito NA proposta.
- **E A SEGUNDA LEITURA, que precisa de cuidado antes de virar achado**: 561
  aquisições e 158 primeiros acessos na mesma janela. Se as duas medirem os
  mesmos aparelhos, 72% de quem instala nunca abre, e como o banco tem 139
  contas em 30 dias, quase todo mundo que ABRE cria conta. A escada ficaria
  1.870 impressões, 561 instalações, 158 primeiros acessos, 139 contas. NÃO
  tratei como achado fechado: falta confirmar que "primeiros acessos por
  dispositivo" cobre o mesmo conjunto de aparelhos das aquisições.
- **O que isso corrige, se confirmar**: a casa vinha dizendo "uma conta a cada
  oito instalações", número costurado somando a instalação que o Google conta
  com a que a Meta conta, que contam a mesma pessoa duas vezes. Esta leitura é
  de um instrumento só, sobre os mesmos aparelhos, e aponta o gargalo para
  outro lugar: entre instalar e abrir, não no cadastro.
- **A LINHA DE BASE DA DESCRIÇÃO CURTA PASSA A EXISTIR**: 29,1%. A condição de
  volta atrás escrita em 01/10 não tinha contra o que medir até hoje. Gravada
  em `docs/lojas/ficha.md` junto com o resto.
- **O QUE AINDA FALTA, e é uma tela**: a quebra por ORIGEM. O relatório de
  Estatísticas abre agrupado por País / região e a origem é outra escolha no
  mesmo seletor. Sem ela não há veredito do título de 01/09 nem divisão dos
  R$ 280,68 entre Google e Meta. Os dois itens do Play Console na lista do dono
  passam a ser a MESMA tela.

## 2026-10-03 (noite, 5) · Os dois itens de prazo saem da lista: um resolvido, um recusado, e o recusado NÃO VOLTA

- Decisão do dono em 03/10, nas palavras dele: **"Pode tirar da lista o bolão
  (não vou desativar, vamos ignorar sua sugestão) e estou resolvendo a parte da
  conta de pagamentos, não precisa me avisar. Coloque resolvido."**
- **Verificação da forma de pagamento do Play Console: RESOLVIDO por ele.** Sai
  da lista. Não há como esta casa conferir: o `play_console` do retrato traz só
  ANR e crash, e o aviso da página inicial não está em nenhum coletor. Fica como
  relato dele, que é a mesma marca que as negativas de scanner levaram hoje.
- **Pagamento externo do app do bolão: RECUSADO, e o assunto está encerrado.**
  O risco levantado em 03/10 continua escrito aqui (compra de conteúdo digital
  consumido dentro do app tem que passar pelo faturamento do Play, a punição é
  na CONTA e não no app, e a conta está sob revisão por causa da verificação).
  Ele leu, decidiu não agir, e a decisão é dele: é a conta dele, é o app dele e
  é o risco dele.
- **NÃO VOLTA, e isto é instrução para os papéis.** Vale a regra que o caderno
  do CRO já tinha e que serve para todo mundo: se o dono disser não, sai do
  caderno e não volta. Nenhuma rodada de ASO, de Segurança ou do Diretor levanta
  o pagamento externo do bolão de novo. Se o mundo mudar (notificação do Google
  sobre a conta, aviso de violação, o app voltando a vender), aí é fato novo e
  entra como fato novo, não como a mesma recomendação repetida.
- A lista do dono vai de 15 para 13 itens, e o bloco COM PRAZO fica vazio.

## 2026-10-03 (noite, 4) · O cupom tem as 25 vagas inteiras, e o `invoice.paid` que o dono ia marcar comprava menos do que o item prometia

- Pedido do dono: detalhar os dois itens do Stripe e fechar. Ele mandou o print
  do painel e liberou o conector.
- **O CUPOM, LIDO NO PAINEL: `0/25`.** Product catalog > Coupons, a linha de
  100% off once com teto 25. É o cupom `MENSAL-LANCAMENTO100-25`, criado em
  03/09 junto com o código `LANCAMENTO1MES`, os dois com teto 25, conferido em
  `docs/lancamento/email-lista-de-espera.md`. Os outros "1 mês grátis" do painel
  têm teto 10 e são os do lançamento: 1/10 e 2/10, três resgates somados, que
  são as três assinaturas pagantes de setembro. **As 25 vagas estão inteiras**,
  e o e-mail de 03/10 para 32 pessoas ainda não produziu resgate.
- **E O ZERO LIDO PRECISAVA DEIXAR DE PARECER O ZERO NÃO LIDO.** O
  `USOS_ANTES_DA_CONTAGEM` era uma constante em 0 cujo comentário precisava
  explicar que zero queria dizer "ninguém leu": dado medido e falta de dado no
  mesmo valor. Virou `LEITURA_DO_PAINEL`, que é `null` para "ninguém leu" e um
  objeto com data e número para "alguém leu". A linha do retrato passa a dizer
  de onde o número veio, com a data, e a frase do não lido continua no fonte
  para voltar sozinha se a leitura sair.
- **O `invoice.paid`: li a rota antes de mandar o dono marcar a caixa, e o item
  comprava menos do que prometia.** Três fatos: (1) a virada de ciclo já busca a
  fatura e carrega o valor desde 02/10, então a RENOVAÇÃO está medida sem o
  evento; (2) a rota não tem `case "invoice.paid"`, então a caixa marcada
  entregaria evento que o `switch` ignora, sem quebrar e sem ganhar; (3) um
  handler escrito sem dedup pelo id da fatura escreveria `renovou` duas vezes no
  mesmo mês, inflando receita. O que sobra para o evento é dinheiro que entra
  SEM virada de ciclo (rateio, troca de plano, retentativa), e o produto tem um
  plano só a R$ 29,90.
- **O BURACO DE VERDADE ERA OUTRO, E NÃO PRECISAVA DELE: o mês 1.** O
  `checkout.session.completed` escrevia `assinou` só com o id da assinatura, e
  em 13 assinaturas nenhum primeiro pagamento tem valor no funil. A sessão do
  checkout já chega com `amount_total`, `currency` e `payment_status`. A regra
  nova é `valorDoCheckout` em `lib/ciclo.ts`, sem rede, e a rota passou a
  carregar `pagoCentavos` no `assinou`. Nenhum painel, nenhuma entrega nova. O
  item saiu da lista do dono.
- **`no_payment_required` É ZERO MEDIDO**, e esse caso é o PRÓXIMO a acontecer,
  não um caso de laboratório: a campanha de 03/10 oferece cupom de 100%, e o
  checkout dela não cobra nada. Zero é resposta; ausente é "não deu para saber";
  juntar as duas faz receita sumir com cara de cortesia.
- **A CONFERÊNCIA PEGOU UM DEFEITO MEU ANTES DE SUBIR, e ele era o da própria
  lição.** Escrevi `Number(sessao.amount_total)`, e `Number(null)` é 0: campo
  AUSENTE virava zero medido. A asserção "valor ausente nao vira zero" reprovou
  na primeira execução. **E a mesma armadilha estava no código de 02/10**, no
  `faturaDaVirada`, lendo `Number(f.amount_paid)`: fatura paga sem valor viraria
  cortesia de R$ 0,00. Os dois agora exigem `typeof number`, e os dois têm
  plantio.
- **DOZE DEFEITOS PLANTADOS, DOZE MORDIDAS**, com verde antes e depois de cada
  um. Dois deles precisaram ser refeitos: o plantio trocava `"number"` por
  `"nunca"` e derrubava TODAS as asserções da seção, o que faz a conferência
  ficar vermelha sem provar a asserção que interessa. Refeitos com o defeito
  exato (o código de ontem), cada um derrubou só a sua.
- **DE PASSAGEM, UM NÚMERO QUE LIA AO CONTRÁRIO**: o doc de lançamento dizia que
  o código antigo `PREMIUM1MES` "continua ativo com 9 usos", que lê como nove
  GASTOS. O painel mostra o cupom dele em 1/10: são nove RESTANTES. Corrigido no
  doc, e a desativação dele, recomendada em 03/09 e nunca feita, virou linha na
  lista do dono com a data de origem, que é a obrigação 3 aplicada a um caso de
  um mês atrás.
- Lista do dono: de 16 para 15 itens, e o painel do Stripe ficou com um só.
- `npm run conferir` inteira verde. Sem suíte de navegador: a mudança é de rota
  de servidor e de regra pura.

## 2026-10-03 (noite, 3) · As negativas de scanner foram aplicadas, e a prova delas só vem se a busca voltar

- O dono aplicou as negativas de scanner no Google Ads (`scanner`, `obd2`,
  `bluetooth`, `elm327`) e avisou na conversa. A linha saiu da lista, pela regra
  do arquivo: concluiu, apaga a linha e escreve o desfecho aqui.
- **O QUE ESTÁ MEDIDO: nada ainda, e isso precisa estar dito.** O que a casa vê
  do Google Ads é termo de busca com gasto; a lista de negativas do painel não
  entra em nenhum coletor. Então o desfecho aqui é RELATO do dono, não medida
  nossa, e fica marcado como relato.
- **E A PROVA QUE VIRIA É FRACA POR OUTRO MOTIVO, que não é o relato dele**: a
  campanha de busca parou de entregar em 24/09 sem ser pausada, e os onze termos
  de scanner já estavam em R$ 0,00 na rodada de 02/10 por causa disso. Com a
  campanha parada, R$ 0,00 na semana que vem não distingue "negativa aplicada"
  de "campanha morta". A prova real é a primeira semana em que a busca voltar a
  entregar: se os termos de scanner continuarem em zero com a campanha gastando
  de novo, a negativa está de pé.
- Fica como pergunta da próxima rodada de Mídia, junto com a parcela de
  impressões perdida: a busca voltou? Se voltou, os termos de scanner somam
  quanto?
- A lista do dono passa de 17 para 16 itens, e o Google Ads de 5 para 4.

## 2026-10-03 (noite, 2) · Sete vereditos foram escritos no manual de cada papel, porque no diário eles não chegavam

- Pedido do dono: "vamos dar os feedbacks das melhorias em cada agente", depois
  de a pergunta anterior ("arrumamos tudo e demos feedback para todos essa
  semana?") ter sido medida e respondida com NÃO.
- **O NÚMERO QUE ABRIU ISTO: oito rodadas entre 27/09 e 03/10, e UM manual com
  retorno desta semana.** O do Guardião, que só tinha porque ele pediu hoje.
  Fora dele, as seções de retorno existentes eram de 18/09 (CRO) e 21/09
  (Diretor). Conteúdo, QA, ASO, Mídia e Segurança não tinham nenhuma.
- **E O CASO QUE EXPLICA O PORQUÊ: os seis vereditos que o Diretor escreveu em
  28/09 estavam todos no diário e nenhum no manual do papel julgado.** Seis
  vereditos corretos, nenhuma garantia de mudança, porque o agente abre a
  rodada lendo o MANUAL. É a frase do ASO virada contra o nosso trabalho de
  corrigir: a régua mede o que eu entrego, não se o que entreguei chegou a
  acontecer.
- **SETE RETORNOS ESCRITOS**, cada um no manual do papel, cada um com as duas
  metades (o que manter primeiro, e depois os pontos de melhora com o caso
  medido dentro): Diretor (28/09), Conteúdo & SEO (29/09), QA/Produto (01/10,
  cobrindo também 30/09), ASO & Lojas (01/10), Mídia paga (02/10), CRO (02/10)
  e Segurança (27/09). O do Guardião já estava escrito de manhã, então são oito
  de oito papéis do Claude.
- O que cada um levou, em uma linha: o Diretor, que veredito vai para o manual
  e que o cruzamento da semana nasceu de uma leitura que não foi a dele; o
  Conteúdo, que duas rodadas concluíram sobre o canal sem pedir a tela que
  decidiria (retenção e clique por impressão); o QA, que o primeiro dos dois
  pontos deixados para o dono nem precisava dele; o ASO, que a saída das 12
  respostas não é colagem, é a chave; a Mídia, que o relatório da semana não
  chegou ao leitor e a rodada não soube; o CRO, que dez aparelhos de iPhone não
  são braço de controle e o número estava lá no dia em que a aposta abriu; a
  Segurança, que o pedido mais valioso da rodada dela (exigir `security_invoker`
  explícito em toda view) segue sem dono seis dias depois, conferido hoje.
- **A OBRIGAÇÃO 5 DE DIRETRIZES**: o veredito de uma rodada é escrito no manual
  do papel, em seção datada, e o diário leva o resumo. O manual do Diretor
  ganhou o parágrafo que diz onde, substituindo "o veredito vai no DIARIO, em
  uma linha por papel".
- **A TRAVA, e ela foi desenhada para NÃO apodrecer**: a `conferir:agentes`
  compara a data da rodada mais nova de cada papel no diário com a data do
  retorno mais novo no manual dele, e reprova acima de dez dias. Ela não olha o
  relógio, de propósito: conferência que olha o relógio fica vermelha sozinha
  num domingo e ensina a afrouxar o número. Esta só fica vermelha quando alguém
  acrescenta uma rodada e não escreve o veredito, que é o momento em que ela
  deve gritar. A folga de dez dias é a cadência (rodada semanal, veredito na
  segunda), não cortesia.
- **SETE DEFEITOS PLANTADOS, SETE MORDIDAS**, com verde conferido ANTES e
  DEPOIS de cada um, que é a lição de 03/10 de manhã: retorno apagado de um
  manual, veredito 31 dias atrás da rodada, retorno sem a metade do "o que
  manter", retorno com um ponto só, obrigação 5 fora de DIRETRIZES, manual do
  Diretor sem o parágrafo do onde, e a frase "Cinco obrigações" anunciando
  número diferente da lista.
- **ACHADO DE PASSAGEM, do tipo que esta casa persegue**: a frase que apresenta
  as obrigações dizia "Duas obrigações saem disso" com QUATRO itens embaixo.
  Envelheceu nas duas vezes em que a lista cresceu, sem ninguém notar. Agora
  existe asserção que compara o número escrito com a contagem dos itens.
- **O QUE ISTO NÃO ALCANÇA, declarado no fonte**: se o veredito é JUSTO (é do
  dono) e se o agente mudou por causa dele (aparece na rodada seguinte). E duas
  cegueiras da conferência: rodada cujo título do diário não comece com
  `data · Papel` fica invisível para ela, e papel que parou de rodar não tem
  veredito a cobrar.
- `npm run conferir` inteira verde. Sem suíte de navegador e sem build: a
  mudança é de documentação e de um script de conferência.

## 2026-10-03 (noite) · A divida velha foi assumida, e o estado "nunca" deixou de existir
- Decisão do dono, lendo a rodada do Guardião: "as que têm mais de 15 dias, já
  foi. Vamos corrigir e garantir que estamos tendo uma visão clara a partir de
  agora."
- **CATORZE CONFERÊNCIAS VIRARAM DÍVIDA ASSUMIDA**, todas de 03 a 13/09:
  `agenda`, `appsflyer`, `aviso`, `campanha`, `gravacao`, `frota`, `guias`,
  `skills`, `pecas`, `precos`, `caminho`, `combustivel`, `datas`, `motorista`.
  Dito sem maquiagem no manual: elas podem estar verdes sobre defeito de pé
  neste momento e a casa não sabe. O gatilho para reabrir uma não é o
  calendário, é o mundo: no dia em que uma deixar passar um defeito, ela é
  provada naquele dia.
- **A DÉCIMA QUINTA FOI PROVADA EM VEZ DE ASSUMIDA.** A `conferir:convite` tinha
  seis dias, dentro do corte, então plantei: cinco de seis defeitos mordendo
  (convidado queimando a marca, marca não apagada, pedir que não marca,
  convidado virando o único convidado, consumir devolvendo sempre true). O sexto
  era alvo inalcançável e está dito: o `podeVer` tem valor padrão, mas o único
  chamador sempre passa o argumento.
- **O ESTADO `nunca` PASSOU A SER PROIBIDO, e a `conferir:fila` reprova.** Não é
  otimismo: as duas portas de entrada foram fechadas no mesmo dia. As velhas
  viraram dívida assumida por decisão do dono, e as novas nascem com defeito
  plantado, que já era prática e agora é regra conferida. Conferência nova sem
  plantio não tem o que escrever na tabela sem reprovar.
- **A FILA AGORA DIZ A VERDADE EM UMA LINHA**, impressa pelo comando e não
  contada a olho: 57 conferências, 17 provadas por quem não as escreveu, 26 só
  pelo autor no nascimento (a fila de verdade), 14 em dívida assumida, fora do
  rodízio. A régua do Guardião ganhou o critério 11: copiar essa linha, não
  contar.
- **DOIS ERROS MEUS NO CAMINHO, os dois no laço de plantio e não nas
  conferências.** O primeiro: o laço não distinguia "mordeu" de "já estava
  vermelha", e três MORDEU de um lote não valiam nada. O segundo, pior: ele
  presumia que falha se escreve `FALHA`, e a `conferir:convite` escreve `✗`;
  cinco mordidas foram lidas como "derrubou sem falha". O laço agora exige verde
  ANTES, verde DEPOIS, e reconhece o formato em vez de presumir. Virou o sexto
  jeito de passar verde na skill.
- **E UM ERRO DE EDIÇÃO, dito porque quase custou o arquivo:** uma expressão
  regular montada no shell ficou com escape a mais, casou vazio no começo do
  arquivo e jogou as catorze linhas dentro do título. O manual estava commitado
  e a única coisa não commitada nele era a minha corrupção, então restaurar do
  HEAD não perdeu nada. Refeito com python, sem passar pelo shell.

## 2026-10-03 · Guardião das conferências (rodada 2): o teto é conferido, o piso fica solto
- Artifact "Conferências da semana":
  https://claude.ai/artifact/GMjWrfwb2m5ZDRhLXenqcW
- **Sete provadas: a suíte de navegador `venda` mais as seis da fila** (`funil`,
  `revisoes`, `navegacao`, `frescor`, `migalha`, `venda`). Todas as sete
  morderam o primeiro defeito plantado, código de saída lido direto, sem cano.
  Foi varrendo as CONSTANTES que apareceu o buraco.
- **O ACHADO DA RODADA, e ele apareceu em quatro lugares de uma vez: o teto é
  conferido e o piso fica solto.** Toda conferência de número aqui prende o
  lado que incomoda (pendência eterna, migalha que acusa demais, rastro que
  cresce sem parar) e deixa livre o lado que só desaparece (a testemunha que
  emudece, o link que para de vender). Medido plantando o VALOR, não o código:
  - `JANELA_MS` da migalha, certo em 3 min, passava verde com 8s, 20s, 30s e 45s.
    Oito segundos reabre o buraco de 04/09, em que o aparelho reabriu o app
    vinte segundos depois do quiz e nada saiu em `app_erros`.
  - `PAUSA_COLADA_MS`, certo em 2000ms, passava com 0, 1, 50, 200, 1000 e 1499.
    Em zero, o app que morre com um último suspiro volta a calar, que é o
    defeito exato que a constante foi criada para fechar. E o requisito estava
    ESCRITO em cima dela desde sempre ("quem sair do app um segundo e meio
    depois de responder vira relato"), sem nunca ter sido cobrado.
  - `VALIDADE_MS` da venda, certo em 30 min, passava com 60s e 4 min. Um minuto
    não atravessa um login com dois fatores, e aí volta o relato de 02/09: a
    pessoa chega do Google sem pagamento e sem cupom.
  - `LIMITE_DE_RAIZES` da navegação, certo em 20, passava com 3, 7, 10 e 50.
- **Por que a navegação era cega de um jeito diferente, e isso é parente do
  caso `anonId` de 26/09**: a asserção era escrita em termos da própria
  constante (laço com `LIMITE * 3`, comparação com `LIMITE`), então os dois
  lados andavam junto e o valor nunca podia estar errado. Ela provava que o
  corte FUNCIONA e era incapaz de dizer que ele está no lugar certo. Consertada
  exigindo comportamento com número escrito à mão: oito abas visitadas, oito
  voltas antes de minimizar.
- **Os quatro consertos, provados mordendo e com zero falso positivo no código
  limpo**: 14 valores quebrados passaram a reprovar (JANELA 8/20/30/45s,
  PAUSA 0/50/1000/1499ms, VALIDADE 60s/4min, RAIZES 3/7, mais os dois extremos
  que já reprovavam). E cada piso foi escrito a partir do REQUISITO com folga,
  não do valor de hoje, para não virar uma segunda cópia da constante e começar
  a reprovar ajuste legítimo.
- **EU ERREI EM 26/09 e o erro custou um mês.** Declarei que a suíte de
  navegador custava build de produção e 11 minutos, e adiei por isso. Ela não
  custa build: o `scripts/navegador/todos.mjs` sobe o `npm run dev` sozinho, e
  a suíte `venda` levou **105 segundos** medidos. Setembro fechou sem nenhuma
  suíte provada por causa de um custo que eu nunca medi. Corrigido no manual.
- **A FILA ESTÁ CRESCENDO MAIS RÁPIDO DO QUE EU PROVO, e esse é o número que o
  Diretor precisa ver.** Em 26/09 havia 34 nunca provadas; provei 6, e entraram
  ONZE novas (`convite`, `renovacao`, `versoes-do-carro`, `porta`, `legivel`,
  `alarme`, `perguntas`, `loja`, `saida`, `midia`, `agentes`). Saldo: 39 nunca
  provadas, cinco MAIS que na semana passada. A seis por semana contra onze
  novas, esta fila nunca esvazia. A recomendação de 26/09, de acrescentar a
  linha no mesmo commit, não pegou, e repetir não vai resolver.
- **Contra a minha régua, dois critérios cumpridos pela metade, e eu digo quais:**
  (1) `funil` e `revisoes` levaram UM formato de defeito cada, enquanto
  `migalha`, `venda` e `navegacao` levaram a varredura inteira; a prova delas é
  mais fina que a das outras e elas voltam para a fila com essa ressalva. (2) As
  onze novas foram para o FIM das nunca, por ordem de espera, o que as deixa a
  umas cinco semanas de serem provadas; é a ordem certa pela regra do rodízio e
  é exposição real, porque conferência recém-escrita é a que ninguém nunca viu
  morder. Os outros sete critérios foram cumpridos.
- **O que esta rodada NÃO alcança**: a suíte de navegador roda em Chromium, e
  Chromium não tem plugin do Capacitor. Nada aqui prova lado nativo nem
  comportamento de aparelho; para isso continua valendo a migalha do último
  passo e o roteiro manual. E a própria `conferir:navegacao` existe porque o
  botão físico do Android não é apertável por navegador nenhum.
- **RECOMENDAÇÕES (3)**: (1) a fila do Guardião devia ser conferida por uma
  conferência, não por mim: um `conferir:fila` que reprova quando existe
  `conferir:X` sem linha na tabela resolveria de uma vez o que duas
  recomendações seguidas não resolveram, e é trabalho do QA, não meu; (2) ao
  escrever conferência de constante, escreva as DUAS pontas na hora, porque o
  piso é o lado que protege o usuário e é sempre o que falta; (3) as onze
  conferências novas de setembro para outubro não foram provadas por ninguém
  contra o defeito delas, e se o QA quiser antecipar isso vale mais que esperar
  o rodízio chegar nelas em novembro.

## 2026-10-03 · A venda perdida de 25/09 morreu numa parede que a casa já conhecia há 27 dias
- O dono abriu o painel do RevenueCat e mandou a foto. O webhook ESTÁ cadastrado
  e ativo, o que derruba a primeira hipótese. O que a foto mostrou foi outra
  coisa, no endereço: `https://mentorque.com.br/api/revenuecat/webhook`, **sem
  `www`**.
- MEDIDO, não deduzido: a API da Vercel diz que `mentorque.com.br` tem
  `redirect: www.mentorque.com.br` com `redirectStatusCode: 308`. A rota exige
  o header `Authorization` e devolve 401 sem ele. E `funil_eventos` tem **zero**
  eventos de origem `revenuecat`, de sempre: nenhuma entrega jamais foi aceita.
- DEDUZIDO, e são dois caminhos que dão no mesmo: robô de terceiro ou não segue
  redirecionamento (e aí 308 é falha de entrega), ou segue e derruba o
  `Authorization` no salto entre hosts, que aqui vira 401. Navegador segue e
  ninguém nota, que é o que torna isso invisível.
- **ISTO JÁ TINHA ACONTECIDO, E ESTAVA ESCRITO.** Em 29/08 o webhook do Stripe
  parou de entregar exatamente assim, a causa foi provada com um fetch e o
  endpoint virou `www`. A entrada daquele dia termina com uma pendência do dono:
  "conferir no painel do RevenueCat se o webhook de lá também aponta para o
  domínio sem www, porque a mesma parede vale para ele". **Ninguém conferiu.**
  Aquilo morou no DIARIO, que é lugar onde se EXPLICA, e nunca virou linha da
  lista do dono, que em 29/08 nem existia (ela nasceu em 07/09, por este mesmo
  motivo). Vinte e sete dias depois, uma compra de Play de US$ 4 se perdeu na
  mesma parede.
- **E O PIOR: o comentário da NOSSA rota mandava configurar no apex.** Quem
  cadastrou o webhook seguiu a nossa própria documentação. Corrigido hoje, com o
  caso escrito dentro.
- CONFERÊNCIA NOVA dentro de `conferir:loja`, com quatro defeitos plantados e os
  quatro mordendo: endereço de `/api` sem `www` escrito na rota, na lista do
  dono ou nos docs reprova. O apex sozinho (origem do app, lista de CORS, deep
  link) continua valendo, porque ali quem segue o redirecionamento é navegador.
  De quebra ela já pegou dois outros: o `curl` de teste em `docs/push.md` e a
  própria linha da lista do dono.
- CONTROLE, para não transformar isto em teoria geral: o webhook do Resend está
  entregando (829 eventos em 30 dias, o último hoje às 05h21). A parede não pega
  todo mundo; pega quem está registrado no apex.
- **O QUE DEPENDE DO DONO, e agora é um campo**: acrescentar `www` ao endereço no
  painel do RevenueCat, e na mesma tela olhar o histórico de entregas de 25/09 e
  reenviar o evento se o painel deixar. Mesmo endpoint, mesmo header, nada a
  mudar na Vercel.
- **RESOLVIDO NO MESMO DIA, e com prova.** O dono acrescentou o `www` no painel e
  mandou dois eventos de volta. Os dois entraram:
  - 10h12m50, evento `5ABC9190`: um `expirou` de teste de agosto. Primeira
    entrega do RevenueCat aceita na história do projeto.
  - 10h16m26, evento `5E586D5F`, que é a COMPRA DE 25/09: gravou `assinou` em
    `funil_eventos` e a assinatura do cliente virou `active`, mensal, até
    25/10 01h00, **escrita pelo webhook** e não mais pela minha mão. Sem linha em
    `app_erros`: a identidade veio válida.
  - O log da Vercel confirma os dois com 200. O painel do RevenueCat ainda
    mostrava "Failure" na linha de 25/09 depois do reenvio, e o banco é que
    manda: se ele tentar de novo, o índice de reentrega barra o evento repetido
    e o upsert não duplica nada.
- **DE QUEBRA, A PRIMEIRA PROVA REAL DA LEITURA DO PRODUTO DO GOOGLE.** O produto
  chegou como `annual100:monthly`: o nome da assinatura contém "annual" e o plano
  base é mensal. Farejar a string inteira teria gravado este cliente como anual.
  A regra de ler o que vem depois dos dois-pontos estava escrita desde o conserto
  do Google e nunca tinha sido exercitada por uma venda de verdade.
- O QUE CONTINUA VALENDO: as outras duas falhas de 24/08 ficam como estão. São
  compras de teste do aparelho do dono, e reenviar uma `INITIAL_PURCHASE` delas
  gravaria assinatura ATIVA com ciclo de agosto, fazendo o retrato gritar por
  dois motivos de uma vez (ciclo vencido ativo, e uma assinatura de loja a mais
  do que o RevenueCat tem).
- SOBRA UMA SUJEIRINHA, e é decisão do dono: o `expirou` de 10h12 é de um teste
  de agosto e conta como cancelamento no funil sem nunca ter sido cliente. Uma
  linha. Apagar ou deixar o histórico como aconteceu são as duas opções, e
  nenhuma é urgente.

## 2026-10-02 (noite) · A leitura das rodadas de 01 e 02/10: três erros diferentes com a mesma cara
- Pedido do dono: ler o que os agentes disseram ontem e hoje, dizer o que
  precisa evoluir, e arrumar. Quatro rodadas lidas (QA agendado e ASO em 01/10,
  CRO e Mídia em 02/10), mais as duas de engenharia de hoje.
- **O GARGALO NÃO É A QUALIDADE DAS RODADAS, É A FILA.** Treze itens parados na
  lista do dono, o mais velho há 29 dias, e a semana inteira de agentes travada
  neles. Agrupados por painel eram SEIS destinos, e CINCO dos treze estavam no
  mesmo console do Google Ads: uma sessão de vinte minutos fechava cinco. A fila
  não era grande, era mal apresentada. `npm run acoes` passa a agrupar por
  painel, com a coluna `Onde` etiquetada na tabela (não adivinhada no texto) e
  um bloco separado para o que passou de 21 dias.
- **O MESMO ERRO EM TRÊS PAPÉIS DIFERENTES, e nenhum veredito individual
  enxergaria**: o QA achou um `renovou` que nunca existiu, a Mídia leu gasto de
  oito datas como ritmo diário de uma campanha que já tinha parado, e o CRO usou
  dez aparelhos de iPhone como braço de controle. São três caras de **número que
  parece medida e é artefato do nosso instrumento**, que é a doença de setembro
  inteiro. O Diretor ganhou o CRUZAMENTO DA SEMANA no manual por causa disso.
- **A MELHOR FRASE DAS DUAS SEMANAS É DO ASO, SOBRE ELE MESMO**: "a régua mede o
  que eu entrego, não se o que entreguei chegou a acontecer". Duas rodadas
  corretas, 12 respostas prontas, zero publicadas em 29 dias. Virou obrigação de
  DIRETRIZES para os dez papéis, junto com a regra dos 21 dias e a de procurar
  no diário antes de "levantar" algo (a pergunta do Moraes455 foi levantada duas
  vezes, por dois papéis, sem uma saber da outra).
- **ACHADO NOVO DESTA LEITURA, e ninguém tinha visto: o relatório de mídia desta
  semana não chegou ao Luiz.** O e-mail disparava quinta às 10h e só aceitava
  relatório do dia; a rodada atrasou e gravou na sexta. O dono recebeu o aviso
  da trava, o Luiz não recebeu nada, e o relatório de 02/10 está no repositório
  sem ter sido enviado. Agora são duas tentativas (quinta e sexta, 16h), janela
  de dois dias, dedup pela data do relatório e aviso de falha só na última
  tentativa. Publicado e conferido: `versionId` e `activeVersionId` iguais
  (295238cb).
- **TRÊS CONFERÊNCIAS NOVAS OU APERTADAS, 34 defeitos plantados**, e quatro
  buracos achados pelos plantios, os quatro meus: `2026-02-31` passava verde
  porque o JavaScript lê como 03/03; linha cuja data virasse texto desaparecia
  da lista com o total continuando parecido com certo; a trava do "pelo menos
  sete rodadas do Claude" deixava mover um papel para o n8n e fugir da régua em
  silêncio; e a régua de parada de campanha, com os números REAIS de 24/09, não
  disparava (queda de 67% contra limiar de 70%), porque a média de três dias
  dilui o fim. Ganhou um segundo gatilho: o dinheiro secar nos dois últimos dias.
- **O QUE ESTA NOITE NÃO ALCANÇA**: o fluxo novo do e-mail não foi executado,
  porque executar mandaria o relatório de hoje para o Luiz, e mensagem para fora
  da operação é decisão do dono. A lógica está publicada; a prova é quinta 09/10,
  ou um disparo que ele mandar.
- **O QUE DEPENDE DELE, em ordem de dinheiro por dia**: uma sessão no Google Ads
  (5 itens, o mais antigo de 03/09), `invoice.paid` no endpoint do Stripe (uma
  caixa que troca uma tela por mês por nada), as duas chaves de resposta a
  avaliação (que trocam 12 colagens por um disparo), e a tela de aquisição do
  Play Console, que é o instrumento que duas rodadas diferentes pediram na mesma
  semana sem uma saber da outra.

## 2026-10-02 · O e-mail de quem cancelou: a casa sabia QUE saíram e não sabia POR QUÊ
- Pedido do dono: "um e-mail para comunicar quem cancelar a assinatura, com uma
  pesquisa de satisfação e perguntando os principais motivos, para a gente
  continuar evoluindo". O contexto que deu urgência: os três assinantes do
  Stripe saíram hoje, e `cancelou` não tem campo de motivo.
- **ARMADO, NÃO DISPARADO.** `app/api/email/saida` existe com as três travas da
  skill (chave dos dados, `disparar: true` explícito, e a marca por
  destinatário gravada DEPOIS DE CADA envio, não no fim do laço). Nenhum e-mail
  saiu para ninguém. Disparar é alçada do dono, e cada disparo é uma decisão
  dele, não uma permissão que ficou valendo.
- **A FORMA, e cada escolha tem motivo**: texto simples, sem botão e sem banner,
  porque peça gráfica vai para a aba Promoções e um e-mail de cancelamento que
  cai em Promoções não é lido; NENHUMA oferta, porque desconto na saída
  transforma pedido de opinião em negociação e aí a resposta deixa de ser
  verdade (e preço é do dono); a data do fim do acesso só aparece quando está no
  FUTURO, porque "até 04/10" para quem perdeu o acesso ontem é a pior forma de
  abrir um e-mail pedindo sinceridade.
- **A RESPOSTA É UM TOQUE**, e cada motivo é um link assinado COM o motivo
  dentro do HMAC. Sem isso, trocar `m=preco` por `m=problema` no endereço vira
  ruído, e ruído numa pesquisa de seis respostas é tudo.
- **O PREÇO DE GRAVAR EM GET, dito em vez de escondido**: clique de e-mail é
  GET, e servidor corporativo e antivírus abrem TODOS os links da mensagem. Em
  vez de adivinhar robô na gravação, a casa guarda tudo e reconhece a varredura
  NA LEITURA (`respostasLegiveis`): seis motivos diferentes da mesma pessoa em
  menos de 30 segundos não é opinião, é antivírus, e o descarte é CONTADO em vez
  de sumir. Era esse o erro de setembro, duas vezes: publicar número que media a
  própria instrumentação.
- **O CONSUMIDOR MUDOU, que é a regra da semana.** `linhaDeMotivos` existia e
  não chegava a lugar nenhum: o retrato agora publica `vendas.porQueCancelaram`,
  com o DENOMINADOR vindo da contagem da chave `saida-pesquisa` em
  `jornada_envios` (a mesma fonte que marca o envio, e não uma contagem
  paralela), e com o lugar do ranking ocupado pelo motivo enquanto houver menos
  de 10 respostas.
- `conferir:saida` com **19 defeitos plantados**. Um passou verde e o achado é
  meu: a conferência aceitava "ou o log, ou a falha na resposta" para o estado
  pior de todos, enviado-e-não-marcado. As duas servem a gente diferente (o log
  é o que a Vercel guarda, a falha é o que quem disparou vê na hora), então
  viraram duas afirmações, e as duas mordem. De passagem, dois buracos do mesmo
  tipo do `conferir:loja` de ontem foram tampados antes de existir: a
  conferência afirmava que a consulta de quem-já-recebeu EXISTE sem afirmar que
  alguém usa o resultado dela, e aceitava `const conhecido = MOTIVOS.some(...)`
  sem exigir que o `if` o usasse.
- **O QUE ESTA CONFERÊNCIA NÃO ALCANÇA**: nenhum e-mail foi entregue, aberto ou
  clicado. O que está provado é a FORMA. A entrega se prova com a cópia de prova
  no celular do dono, que é o primeiro passo do roteiro e ainda não aconteceu.

## 2026-10-02 · CRO (conversão): cinco vereditos fechados, e o primeiro FUNCIONOU
- Rodada semanal do CRO/BeSci, foco CONVERSÃO (a de 25/09 foi de retenção).
  Artifact "Conversão da semana":
  https://claude.ai/artifact/TQqZfKTE8wEZYjNtxPHNgx
- **O PRIMEIRO FUNCIONOU DO CADERNO: `cadastro-em-duas-etapas`.** De 173
  aparelhos que abriram o formulário em cada braço (denominador idêntico, o que
  já diz que o sorteio dividiu direito), **108 cadastraram o carro com o
  formulário curto contra 78 com o de sete campos**. São 17 pontos de diferença
  com erro padrão de pouco mais de 5, mais de três vezes o erro, e a amostra
  passou quatro vezes o critério de parada do próprio teste.
  - A vencedora FOI PROMOVIDA no mesmo dia e o experimento saiu do código, como
    manda a regra. O id fica anotado como encerrado em `experimentos.ts`,
    porque reaproveitar id encerrado misturaria exposição velha com nova.
  - Ressalva honesta: a métrica pedia loja e web separadas e o retrato entrega
    somadas. A randomização protege a comparação; o que fica sem resposta é
    ONDE funcionou melhor, não SE funcionou.
- **`onboarding-curto`: INCONCLUSIVO, e continua rodando.** Terminar o
  onboarding favorece B (218 de 325 contra 181 de 302), mas isso é menos de
  duas vezes o erro padrão. E o degrau que DECIDE está empatado: 92 carros
  cadastrados contra 94. O texto da aposta já avisava, quando foi escrita, que
  onboarding curto que não entrega carro não vale nada.
  - NÃO promovi ninguém, por duas razões, e a segunda é do dono: inconclusivo
    com amostra crescendo pede espera, e promover B apagaria a página de prova
    social do onboarding, que ele decidiu MANTER em 01/09. Veredito de teste
    não é lugar de desfazer decisão do dono pela porta de trás. A escolha está
    no artifact como pergunta para ele.
- **`onboarding-termina-no-carro-android`: INCONCLUSIVO por falta de braço.**
  Ele comparava Android contra iPhone e web, e hoje a base é 266 aparelhos
  Android, 10 iPhone e 8 web. Dez aparelhos não são controle de nada. O degrau
  alvo melhorou muito (7 para 23 de cada 100 de onboarding a carro
  cadastrado), mas quatro mudanças caíram na mesma janela e só uma tem prova
  isolada. Fechado sem crédito atribuído.
- **`lembrete-que-chega`: conserto CONFIRMADO, efeito INCONCLUSIVO.** As duas
  metades precisam ser ditas separadas. Erros `.then()` em zero e 10 a 11
  aparelhos com permissão concedida: a máquina que estava muda passou a poder
  falar, e isso está provado. Retorno das coortes: sem braço comparável e com
  as coortes marcadas AINDA NAO DA PARA LER. A suspeita de 04/09 contra o
  plugin no fechamento do quiz NÃO se confirmou (os fechamentos de hoje são na
  abertura e na Home); fica registrado que não se confirmou, não que foi
  descartado.
- **`fim-do-lembrete-falso`, releitura pós 01/10, e é o número mais importante
  da semana: das TRÊS assinaturas pagantes que o produto já teve, as três
  cancelaram.** Duas ativas com cancelamento agendado, e as coortes mostram 1
  saída na de 01/09 e 2 na de 08/01.
  - O que o número não diz é por quê. As três entraram com cupom de 100% do
    primeiro mês, então 01/10 foi a primeira vez que o produto pediu dinheiro
    a elas, e cancelar quando o mês de graça acaba é comportamento de coorte de
    cupom. Com n igual a 3 não separa de mais nada: INCONCLUSIVO, e não reabre.
  - A metade que era da aposta: zero avaliações citando cobrança, nenhuma nota
    de uma estrela, nenhum pedido de reembolso. O medo que ela existia para
    evitar não apareceu, e as três acharam o caminho de cancelar sem falar com
    ninguém, que era o que o texto prometia.
  - FICA SEPARADO como fato de negócio, para o Diretor e o dono: 100% da
    primeira coorte pagante cancelou na virada para dinheiro.
- CONFERÊNCIA NOVA na suíte `porta`, provada mordendo: o cadastro novo tem que
  pedir marca e modelo e NÃO pedir km nem foto. Pus o formulário longo de volta
  como padrão e ela reprovou; devolvi e passou. Ela também me corrigiu no
  caminho: eu tinha escrito que o campo de ano apareceria junto, e ele só
  aparece depois de escolher o modelo. A asserção foi ajustada ao que a tela
  faz, não ao que eu supunha.
- APRENDIZADOS em besci.md: tirar campo de formulário é a alavanca mais barata
  que existe; o mesmo encurtamento num formulário e numa apresentação dá
  resultados opostos, porque fricção tirada de passo que a pessoa atravessa
  rende e de passo que ela suporta só desloca a desistência; e controle de
  plataforma não é controle, porque a distribuição da base não é nossa.
- Bateria `conferir` inteira verde, tipos limpos, suítes `carro` e `porta`
  passando. Sem build local, que é o regime das duas velocidades.

## 2026-10-02 · Mídia paga (rodada 3): a busca parou de entregar no dia 24, e foi no dia em que eu propus consertar a etiqueta dela
- Artifact "Mídia da semana":
  https://claude.ai/artifact/TjDUdWwCHSiiCGzFgoFrc7
  Relatório e PDF em `docs/agentes/relatorios/`, datados de hoje.
- **CADÊNCIA**: o gatilho disparou quinta 01/10 às 11h03 e a rodada rodou sexta
  02/10 às 10h33. O e-mail de quinta às 10h saiu antes, com o arquivo de 24/09,
  então o dono recebeu o aviso de "rodada não gravou" em vez do relatório. A
  trava funcionou como projetada; quem atrasou foi a rodada.
- **A CONTA, janela de 24 a 30/09 contra 17 a 23/09**: gasto de R$ 280,68 contra
  R$ 356,45 (21% menos), **47 contas de fora contra 44**, **custo por conta de
  R$ 5,97 contra R$ 8,10**. Terceira queda seguida: R$ 21,14, R$ 8,10, R$ 5,97.
- **Por campanha** (coleta de 02/10): APP Android no Google R$ 151,83 com 502
  cliques e CPC R$ 0,30; instalação no Meta R$ 132,11 com 685 cliques e CPC
  R$ 0,19; **busca R$ 4,00 com 2 cliques**. A soma por campanha fecha com a soma
  por dia nas duas leituras, conferido.
- **O ACHADO: a busca parou de entregar em 24/09 sem ser pausada.** Status
  ENABLED, R$ 5,67 em oito dias contra uns R$ 20 por dia até o dia 23. As
  impressões caem antes do gasto e provam que não é dinheiro saindo devagar:
  1.958, 668, 98 e 70 em quatro leituras. Segunda prova independente: os grupos
  de termo ficaram congelados no mesmo centavo entre 24/09 e 02/10.
- **A causa é de painel e eu não invento**: orçamento cortado, lance baixo,
  negativas aplicadas de forma ampla, ou a campanha de instalação atendendo as
  mesmas buscas. Registro o que chama atenção sem chamar de prova: as impressões
  da campanha de instalação subiram de 6.779 para 11.984 no mesmo período. O
  número que resolveria é a parcela de impressões perdida por orçamento e por
  classificação, que existe no painel e a coleta não busca. Pedido na lista.
- **O MEU ERRO, e ele custou uma proposta inteira.** Em 24/09 eu disse que a
  busca gastava R$ 20 por dia e propus etiquetar a URL final dela com argumento
  de R$ 640 por mês. Ela tinha parado naquele mesmo dia: o `porCampanha` mostrava
  R$ 163,59 porque a janela dele são oito datas e o dinheiro estava nas
  primeiras. A aritmética que pegaria estava na minha frente: a conta gastou
  R$ 18,78 no dia 24 enquanto a campanha de instalação corria a R$ 21 por dia,
  o que já dava zero para a busca. Virou aprendizado no manual, com o passo a
  passo, e a ação foi CONDICIONADA em vez de repetida ("só vale se a busca voltar
  a entregar").
- **CORREÇÃO DE NÚMERO PUBLICADO**: a semana de 17 a 23/09 saiu como R$ 268,32
  no Google e hoje a mesma janela lê R$ 259,43. O Google revisa dia fechado para
  baixo (crédito de clique inválido), R$ 8,89 nesta. O custo por conta daquela
  semana passa de R$ 8,30 para R$ 8,10. Regra nova no manual: citar a data da
  leitura e RECALCULAR a semana anterior em vez de copiar o que foi publicado.
- **INSTALAÇÃO NÃO É CONTA, e agora tem número**: 195 instalações contadas pelo
  Google mais 194 pelo Meta, contra 47 contas no banco. Cerca de **uma conta a
  cada oito instalações**, lido como ordem de grandeza porque a soma mistura
  réguas de donos diferentes e pode contar a mesma pessoa duas vezes. Esse
  degrau é maior do que qualquer coisa que compra de mídia melhore. Das 47, são
  41 Android e 2 iPhone; **nenhuma na web**, que três semanas atrás era tudo.
- **O DESPERDÍCIO COM NOME NÃO ANDOU, e não é mérito**: R$ 0,00 nos grupos de
  curso, scanner e mecânico online, porque a campanha que gera termo parou. E a
  consequência estrutural: **98% do dinheiro foi para campanha de instalação, que
  não tem termo de busca nenhum**. O critério 6 da régua deixou de ser
  alcançável com os instrumentos de hoje, e isso está dito em vez de disfarçado.
- **PROPOSTA DA SEMANA, uma só, uma tela e custo zero**: o dono abrir o relatório
  de aquisição do Play Console agrupado por fonte de tráfego, que separa Google
  Ads, Facebook e orgânico. Divide os R$ 280,68 entre as duas campanhas de
  instalação e, de brinde, diz quanto da instalação é orgânica. É a mais barata
  das três saídas que o manual já listava; as outras são o Install Referrer
  (Engenharia, precisa de versão) e um medidor de atribuição (gasto novo).
- **ESTADO DA LISTA DO DONO**: as duas listas de negativa (curso desde 03/09,
  scanner desde 19/09) custaram R$ 0,00 nesta semana, e não por terem sido
  aplicadas: a campanha parou. Continuam na lista, porque se ela voltar as duas
  voltam a valer. A importação por gclid perdeu força pela segunda semana, pelo
  mesmo motivo.
- **A RÉGUA: cumpre 10 dos 12.** Falham o 3 (custo por desfecho medido por
  campanha, por falta de etiqueta, segunda semana) e o 6 (desperdício com nome,
  que só cobre 2% do dinheiro). Nos dois o limite é do instrumento.
- APRENDIZADOS em `midia-paga.md`: a janela de oito datas esconde parada recente,
  com a aritmética que pega; impressão cai antes do gasto; termo congelado é
  prova de campanha parada; número de plataforma tem data de leitura e dia
  fechado é revisado para baixo; e desperdício com nome só existe em campanha de
  busca, com o substituto mais barato nomeado.

## 2026-10-02 (tarde) · O `renovou` passou a dizer quanto entrou, e ciclo vencido deixou de passar calado
- O dono perguntou se dava para arrumar os dois pontos que ficaram abertos.
  Dava, e o primeiro nem precisava dele.
- **QUANTO ENTROU.** A nota de 01/10 dizia: "quem responde quanto entrou e a
  fatura, e para ela chegar o Rodrigo precisa acrescentar `invoice.paid` a
  lista do endpoint". A primeira metade (preco de plano nao e caixa) continua
  certa; a segunda era UMA saida, nao a unica. A assinatura que chega no evento
  carrega `latest_invoice`, e a fatura pode ser BUSCADA na hora da virada, com
  a chave que a casa ja tem. **Nada de painel, nada de evento novo.**
- O `renovou` passa a carregar `pagoCentavos`, `moeda` e o id da fatura, e so
  de fatura PAGA: `open` e `draft` sao promessa, `void` e fatura que deixou de
  existir. Zero continua sendo resposta legitima (cupom de 100%, o caso de
  01/09) e e DIFERENTE de ausente, que sai como `semValor`. Juntar os dois
  faria receita sumir com cara de cortesia. A busca nunca lanca.
- **A PROVA QUE DEIXOU DE EXISTIR.** As duas renovacoes que iam validar o
  conserto (04/10 e 09/10) foram canceladas em 02/10. Nao da para fabricar uma
  renovacao; da para garantir que a proxima nao passe calada.
- `cicloVencido` acusa assinatura que o banco acha ATIVA e cujo ciclo ja
  venceu. Numa renovacao o webhook empurraria o ciclo; numa falha de pagamento
  marcaria `past_due`. As duas passam pela MESMA entrega, entao ciclo vencido
  com status ativo significa que nenhuma chegou. Folga de um dia, porque alarme
  no minuto exato grita todo mes a toa. Publicado em `vendas.ciclosVencidos`,
  impresso no retrato e no Vigia.
- **A CONFERENCIA ANTIGA REPROVOU A MUDANCA e estava certa**: ela exigia que o
  `renovou` nao carimbasse valor NENHUM. O invariante nasceu certo e ficou pela
  metade, porque o proibido e o PRECO DO PLANO, nao o dinheiro da fatura. Agora
  ela nomeia o que nao pode entrar e cobra que o valor venha de
  `fatura.centavos` e que a ausencia seja dita.
- Oito defeitos plantados. UM passou verde e o achado e meu: fazer a busca da
  fatura voltar a lancar DERRUBOU o script, e script derrubado nao imprime
  FALHA nenhuma. Pareceu prova e nao era; a assercao passou a capturar o
  lancamento e ai mordeu. **E a segunda vez hoje que esse mesmo engano aparece.**
- O QUE CONTINUA SEM PROVA, com todas as letras: nenhuma renovacao passou por
  este codigo, e nao ha nenhuma marcada. O que mudou nao e a prova, e a rede:
  se falhar, a gente descobre no dia seguinte em vez de um mes depois.

## 2026-10-02 · A venda de Play de 25/09 virou Premium, e o Android vende desde a 2.7
- A pedido do dono, analise dos dois achados do QA (30/09 e 01/10). O print do
  painel do RevenueCat derrubou a hipotese da vespera: o `app_user_id` da compra
  perdida e `14e31832-c6ca-444b-aa3d-c86efc5686ff`, um UUID de verdade. **A
  compra saiu COM identidade**, entao o conserto do onboarding (feito em 01/10,
  e que era defeito real) NAO era a causa deste caso.
- **MEDIDO**: a conta existe; a pessoa fez 24 eventos em 25/09, das 00h50 as
  01h36 (11 sintomas, 5 aulas, 1 orcamento); estava no **Android 2.8.0**; chegou
  a `iniciou_checkout` com origem `loja-monthly`; o RevenueCat registra US$ 4
  gastos; `subscriptions` nao tinha linha nenhuma. **E ela nao abriu o app desde
  entao.**
- **O ACHADO QUE CONTRADIZ O QUE A CASA ACREDITAVA: o Android vende desde a
  2.7.** `funil_eventos` tem `iniciou_checkout` de loja vindo de android em
  23/09 (2.7.0) e 25/09 (2.8.0). Esse evento e emitido DEPOIS do
  `if (!pkg) return` do `buyNative`, e `pkg` so existe quando o plugin
  configurou com chave. A chave esta no build, o botao aparece, e uma compra de
  Play foi concluida.
- **A RESSALVA DO PAYWALL ESTAVA FALSA EM TRES LUGARES**, e fui eu que a
  escrevi em 28/09: `RESSALVAS.viu_paywall`, a linha do retrato e
  `docs/lojas/venda-no-android.md` diziam "no Android o paywall aparece e NAO
  tem botao de compra (modo leitor)". Nasceu certa, o mundo virou na 2.7,
  ninguem avisou, e ela passou a EXPLICAR um zero que ja nao existia. **Ressalva
  e afirmacao sobre o mundo e envelhece como qualquer outra**: sem data e sem um
  jeito de ser medida, vira a mentira mais dificil de achar, porque todo mundo
  repete achando que esta sendo cuidadoso. A `conferir:funil` exigia o texto
  antigo e reprovou a correcao, que e o trabalho dela; passou a cobrar a
  ausencia da afirmacao velha e a presenca do lugar onde o fato e medido.
- **A SUBTRACAO QUE FALTAVA, e era de graca.** De 25/09 a 02/10 o retrato
  imprimiu todo dia `revenuecat.active_subscriptions: 1` e assinaturas do banco
  todas do Stripe. Oito dias com os dois numeros lado a lado e ninguem subtraiu,
  porque subtrair era trabalho de quem le. Agora `/api/dados` publica
  `vendas.lojaConferida` e o Vigia manda e-mail por ela.
- CORRIGIDO e no ar, alem disso: o webhook do RevenueCat nao perde mais venda
  com identidade inutil (vira linha em `app_erros` com o `app_user_id` para
  recuperar), e o `upsertSubscription` nao apaga mais `cupom` e `gclid` quando
  a metadata nao os traz (achado do QA de 01/10).
- **PREMIUM LIGADO A MAO**, autorizado pelo dono nesta conversa: linha em
  `subscriptions` com `active`, mensal, ciclo ate 25/10 (um mes da compra). Nao
  cobra ninguem; so entrega o que ja foi pago. Se o webhook voltar, o RevenueCat
  corrige a linha; se nao voltar, o acesso cai em 25/10 e a conferencia nova
  volta a gritar, entao o erro nao fica escondido.
- **PROVA DO LACO INTEIRO**: antes da escrita o retrato saia com "A LOJA VENDEU
  E O BANCO NAO SABE: RevenueCat 1 e banco 0"; depois, rodando o mesmo fluxo,
  "Loja conferida: RevenueCat 1 e banco 1: batem". O alarme grita no problema
  real e se cala pelo motivo certo.
- `conferir:loja` com treze defeitos plantados. DOIS passaram verde e os dois
  achados sao meus: um plantio inalcancavel (replantado, mordeu) e um buraco
  real, em que a conferencia olhava uma linha vizinha em vez do argumento que
  decide o alarme.
- **O QUE CONTINUA ABERTO, e e a causa**: nao sabemos POR QUE a compra nao
  chegou. Webhook nao cadastrado, segredo errado ou erro de entrega, so o painel
  responde. Ficou na lista do dono.
- DE PASSAGEM, dois fatos que o retrato trouxe e ninguem foi buscar: a receita
  30d do Stripe passou de R$ 0,00 para **R$ 29,90**, o que responde a pergunta
  que o QA deixou aberta ontem sobre a primeira cobranca real; e **os tres
  assinantes do Stripe sairam hoje** (dois `cancelou` as 09h10 e 10h40, um
  `expirou` as 10h40, com 14 segundos entre os dois ultimos). Com isso o
  conserto do `renovou` de ontem perdeu a prova: as renovacoes de 04/10 e 09/10
  nao vao acontecer.

## 2026-10-01 · QA agendado: o primeiro dinheiro real entrou, e o funil não registrou
- Verificação agendada em 04/09 para o dia da PRIMEIRA COBRANÇA REAL. Não é
  rodada semanal: só a cobrança.
- **A COBRANÇA PASSOU.** MEDIDO no banco: a assinatura `sub_1U8U8h…` do cliente
  fcd41994 teve o `current_period_end` movido de 01/10 23:52:23 para 01/11
  23:52:23, gravado às 23:53:13, e o `status` seguiu `active`. Nada de
  `past_due` nem `unpaid`, nos três assinantes.
- ~~DEDUZIDO, e é o passo que sustenta a frase acima: o Stripe só adianta o
  ciclo de uma assinatura de cobrança automática quando a fatura do ciclo novo
  é paga; cartão recusado deixa a assinatura em `past_due` com o ciclo onde
  estava. Ciclo adiantado mais status `active` é fatura paga.~~
  **ERRADO, corrigido em 04/10 com a fatura na mão.** O ciclo é adiantado na
  VIRADA, uma hora antes de a fatura ser paga: período novo 23:52:23, fatura
  criada como rascunho 23:53:10, banco 23:53:13, fatura finalizada e paga
  **00:53:48**. A conclusão ("entrou dinheiro") estava certa; o raciocínio que
  a sustentava, não. Ciclo adiantado com status `active` é ciclo virado, e nada
  mais: se o cartão falhar, o `past_due` chega depois, e nessa hora o ciclo já
  andou. Quem quiser provar pagamento tem que olhar a fatura.
- **O VALOR NÃO ESTÁ MEDIDO, e essa é a parte que o Diretor queria.** A
  integração do Stripe não está autorizada nesta sessão, e o repositório não
  guarda valor pago em lugar nenhum: nem `subscriptions`, nem `funil_eventos`,
  nem o retrato. O MRR do painel é preço de plano multiplicado por assinante,
  que é número derivado e não prova fato financeiro (direcionamento 8). Uma
  fatura de R$ 0,00 adiantaria o ciclo exatamente do mesmo jeito, e foi o que
  aconteceu na virada de 01/09 com o cupom de 100%. Então: **o ciclo virou e a
  fatura foi paga; se foram R$ 29,90 ou R$ 0,00, não sei daqui.** Quem fecha
  isso é o painel do Stripe, em duas telas.
- **ACHADO, e é o motivo de esta verificação ter valido a pena: o funil não
  registrou a renovação, porque ele nunca soube registrar nenhuma.** O webhook
  do Stripe escrevia `assinou`, `cancelou` e `expirou`, e NUNCA escreveu
  `renovou`. O único `renovou` do projeto morava no gêmeo do RevenueCat, e a
  loja nunca vendeu. Em `funil_eventos` há três eventos financeiros no total,
  os três `assinou`, o mais novo de 02/09.
- O sintoma era o pior possível, porque não parecia sintoma: `renovacoes 0` no
  painel, com `funilCorreto.ts` declarando `renovou` mensurável desde 22/08.
  Zero que lê como "ninguém renovou" quando significa "ninguém mediu". É a
  quarta vez que esta casa tropeça no zero estrutural, e a primeira no
  dinheiro. A contradição estava escrita no nosso próprio código desde o
  começo (direcionamento 7).
- CORRIGIDO e publicado (`c7a20c3`), dentro da alçada pela flexibilização de
  02/09: tornar uma falha visível não é mexer em cobrança. Não muda quem é
  cobrado, quando, quanto, nem quem ganha acesso; muda se o fato aparece ou
  some. Quem escreve o `renovou` da web agora é a VIRADA DE CICLO, não a
  fatura, e isso é escolha de engenharia e não preferência: o endpoint do
  Stripe está cadastrado com QUATRO eventos (os três de subscription e o
  checkout), então um `case "invoice.paid"` nunca seria chamado. A virada chega
  na entrega que já funciona, e a prova de que funciona é que foi ela que
  atualizou o banco às 23:53:13.
- A dedup existe SEM índice novo: o ciclo gravado é lido ANTES do upsert, então
  na reentrega do webhook o banco já tem o ciclo novo, não há virada e não há
  evento. Reentrega, assinatura nova e correção de data para trás não viram
  receita inventada. Por isso a ordem (leitura antes da escrita) virou
  asserção: invertida, nenhuma renovação é registrada e o sintoma é silêncio.
- O evento da web NÃO carrega valor, de propósito. O que a rota tem em mãos é
  preço de plano, e um cupom de 100% produz esta mesma virada com fatura de
  R$ 0,00. Carimbar valor ali faria o funil afirmar dinheiro que ninguém
  confirmou.
- CONFERÊNCIA NOVA `conferir:renovacao`, sete defeitos plantados e os sete
  reprovando: `>` virando `!==`, folga do arredondamento removida, ciclo lido
  só do objeto ignorando o item, ordem da leitura e da escrita invertida,
  escrita do `renovou` apagada, valor carimbado no evento, e `renovou`
  encadeado com `cancelou`. A regra mora em `lib/ciclo.ts`, sem banco nem rede,
  para a conferência exercitá-la de verdade em vez de procurar texto no fonte.
- **ISTO É TEORIA EM PRODUÇÃO**, com todas as letras (direcionamento 12):
  nenhuma renovação passou por este código. As próximas são 04/10 e por volta
  de 09/10, e são elas que provam. Se em 04/10 não aparecer um `renovou` para
  `sub_1U9Phe…`, o conserto está errado e o diagnóstico também.
- PARA O RODRIGO, duas coisas no painel do Stripe e nenhuma delas é minha:
  (1) a fatura do ciclo de 01/10 desta assinatura, para saber se entrou
  R$ 29,90 ou R$ 0,00, que é o primeiro caixa real do produto; (2)
  acrescentar `invoice.paid` à lista de eventos do endpoint, que é o que
  permitiria o funil guardar o VALOR e não só a virada. Com isso feito, dá para
  acrescentar o evento da fatura depois, e aí "quanto entrou" passa a ser
  pergunta de banco.
- O de 04/10 (`0634d48f`) e o de ~09/10 (`b62df1c8`) seguem `active` com os
  ciclos onde deviam estar.
- DE PASSAGEM, sem investigar: `subscriptions.cupom` está nulo nas três
  assinaturas, e o diário de 02/09 registra os três códigos preenchidos na mão
  a partir do Stripe. O `upsertSubscription` é dono da coluna e escreve
  `null` quando a metadata não tem cupom, e as três assinaturas são anteriores
  ao carimbo na metadata. Ou seja: **preenchimento retroativo na mão em coluna
  que um upsert idempotente governa não sobrevive ao próximo webhook.** Não
  mexi: é dado de produção sobre fato passado, e a fonte do cupom é o Stripe.
- A assinatura de loja de 25/09 do achado de ontem continua sem contrapartida:
  as três ativas são todas do Stripe e `funil_eventos` segue sem nenhum evento
  de origem `revenuecat`.

## 2026-10-01 · ASO & Lojas: 12 avaliações 5 estrelas, nenhuma respondida, e o erro é meu
- Terceira rodada deste papel. Artifact "Lojas da quinzena":
  https://claude.ai/artifact/VPDqC2ct6Z5pv36hWm7h9b
- **A MANCHETE É UMA FALHA MINHA, não do dono.** Em 15/09 entreguei 7 rascunhos
  de resposta e escrevi que levar o nome novo para a Apple custava dois minutos
  na tela do envio. Duas semanas depois o banco diz: as **12** avaliações
  seguem com `respondido = false`, a mais antiga desde 02/09 (29 dias), e a App
  Store subiu 2.6, 2.7, 2.8 e 2.9, todas READY_FOR_SALE, nenhuma com o nome
  novo. Eu escrevi o pedido no diário e no artifact, que são lugares onde se
  EXPLICA, e existe `docs/agentes/acoes-do-dono.md`, criada em 07/09 justamente
  porque o que depende do dono envelhece calado. Não usei.
- **CORRIGIDO HOJE, e virou regra do manual:** toda recomendação que depende do
  dono termina a rodada como LINHA NA LISTA DELE. Entraram três, com o texto
  exato: (1) colar as 12 respostas e marcar `respondido`; (2) trocar nome e
  palavras-chave na próxima tela de envio à Apple; (3) abrir a tela de aquisição
  do Play Console e colar dois números. `npm run conferir:acoes` passou, 12 na
  lista.
- O caso que mede o tamanho do problema: a pergunta sobre a avaliação
  `Moraes455` ser do dono foi levantada pelo CRO em 04/09 e por mim em 15/09,
  sem que eu soubesse da primeira. Duas rodadas, mesma pergunta, zero resposta,
  porque nenhuma das duas virou linha de lista. Aprendizado gravado: antes de
  "levantar" algo, procurar no DIARIO se já foi levantado; se já foi, o trabalho
  não é repetir, é mudar o endereço.
- **4 avaliações novas, todas da App Store**, coletadas juntas em 17/09
  (versões 1.6, 1.7, 1.7 e 2.4): aminoru ("Aprendizado", cita resfriar o turbo
  antes de desligar o motor), Biiaes ("Consegui economizar na revisão"),
  munizluiz ("gerenciar revisões e troca de óleo") e matthewsmc0 ("muito bom").
  Rascunhos em `docs/lojas/respostas.md`. **Não reescrevi os 7 anteriores**:
  rascunho entregue não se rascunha de novo.
- **3 depoimentos novos liberados para a LP**, com texto exato e corte sugerido.
  O matthewsmc0 ficou de fora: elogio genérico na LP é o que faz depoimento
  verdadeiro parecer inventado.
- PRECISÃO SOBRE O TAMANHO DO SINAL: 12 avaliações, **10 autores**. `munizluiz`
  é quase certamente o mesmo Luiz Fernando Muniz Viana da Play, e `luana david`
  aparece nas duas lojas. Tirando o Moraes455, são 9 pessoas de fora.
- **VEREDITO DO TÍTULO, que vencia hoje: NÃO DEU PARA LER.** O combinado era a
  origem "Pesquisa do Google Play" no Play Console, e esse número não existe
  fora do console. Conferido no pacote bruto de hoje: `play_console` devolve
  `{"anrPorDia":[],"crashPorDia":[]}`, nada de aquisição; o `search_console` do
  retrato é da WEB. Pela regra escrita em 01/09 o desfecho é o mesmo nos dois
  casos: o título FICA e a proposta nova muda de assunto. A leitura virou linha
  na lista do dono.
- **CORREÇÃO DO QUE EU ESCREVI EM 15/09:** o feed da Apple não entrega "uma vez
  a cada muitas", entrega em RAJADA: duas vezes em 30 dias (3 avaliações em
  02/09, 4 em 17/09), sempre em lote. O que continua verdade, e agora com número:
  o lote vem com ~2 semanas de atraso (as de 17/09 citam 1.6 e 1.7, escritas no
  começo do mês). A recomendação de trocar o feed pela API do App Store Connect
  segue de pé, pelo motivo certo: responder três semanas depois não é atender.
- **NENHUM ALERTA PARA O QA, e quase mandei um errado.** O retrato traz 9
  relatos de "app fechou sozinho em: abriu o app" e a alta na 2.9 do Android.
  Fui à tabela "LEIA ISTO ANTES DE RECONFERIR" antes de escalar: as duas já
  estão fechadas (16/09 e 30/09), e a alta da 2.9 é instrumento novo medindo
  melhor, não regressão. Também não há nenhuma avaliação abaixo de 5 estrelas.
- **PROPOSTA DA QUINZENA: a palavra que os usuários mais repetem não está em
  campo forte nenhum.** Contei o vocabulário das 12: economia aparece em 4 (3 de
  fora), revisão e manutenção em 3, aprender em 2, mais de um carro em 2. Dos
  dois empatados, manutenção já está no TÍTULO desde 01/09; economia só aparece
  no meio da descrição completa. Proposta: a descrição curta da Play (80
  caracteres, segundo campo de maior peso, muda sem release) passa de
  `Entenda o barulho, a luz do painel e o orçamento antes de ir na oficina.`
  (72) para `Entenda o barulho, a luz do painel e o orçamento antes da oficina,
  e economize.` (79). É a linha de hoje inteira mais duas palavras: nenhum
  substantivo indexado sai. Risco, leitura (conversão da ficha, 14 dias antes
  contra 14 depois, contaminada pelo tráfego pago que vai para a loja desde
  20/09) e volta atrás estão em `docs/lojas/ficha.md`.
- A proposta de 15/09 (o limite de 2 carros no texto do grátis) continua ABERTA,
  sem sinal de ter sido aplicada. O prazo de volta atrás de 15/10 só conta do
  dia em que a frase entrar no ar.
- **AUTOEXAME CONTRA A RÉGUA:** cumpri 1 a 7; o 8 não se aplica (há avaliação
  coletada). A falha da rodada não está na régua, e é a mais importante: **a
  régua mede o que eu entrego, não se o que entreguei chegou a acontecer.** Duas
  rodadas de trabalho correto não produziram UMA resposta pública. Proponho uma
  linha nova para a régua deste papel, já gravada no manual: *toda recomendação
  que depende do dono saiu da rodada como linha na lista dele*.
- Recomendações: (1) vinte minutos colando as 12 respostas, o item mais barato e
  mais antigo; (2) nome e palavras-chave da Apple no próximo envio, já foram
  quatro; (3) uma tela do Play Console, sem a qual toda proposta de ficha é
  decidida no escuro e nenhuma pode ser julgada depois.


## 2026-09-30 · QA/Produto: existe uma assinatura de loja há seis dias que o banco não conhece
- Artifact "QA da semana":
  https://claude.ai/artifact/DQ5BgWtmmnha61jhqAQ8KA
- **PRECISA DO DONO, e é o único achado com alguém possivelmente prejudicado
  agora.** O RevenueCat saiu de zero para 1 assinatura ativa em 25/09 e segue
  assim. No banco, as 3 assinaturas ativas são TODAS do Stripe: nenhuma linha
  com identificador de loja, e `funil_eventos` continua sem um único evento de
  origem `revenuecat`. A `assinaturas_conferencia` dá 3 vereditos `ok` e nada
  fora, e isso não contradiz nada: ela compara o que chegou, e esta venda não
  existe de nenhum dos dois lados de cá. MEDIDO o descompasso; DEDUZIDO que,
  se for compra de gente de verdade, a pessoa pagou e está sem Premium há
  seis dias, porque quem libera o acesso é a tabela do banco. A favor de ser
  real: o pacote traz receita, não só assinatura em teste. Contra: só o iPhone
  vende hoje e o volume dele é pequeno.
- Em 02/09 este papel escreveu que o caminho da loja é o mais perigoso porque
  não tem segunda porta: se o webhook do RevenueCat falhar, não existe nada
  parecido com o `/api/stripe/sync` para salvar depois. Aquilo ficou como
  TEORIA por não haver venda de loja nenhuma. Agora há uma, e o sintoma é
  exatamente o previsto.
- **O que fecha isso não está no repositório**: RevenueCat, Integrations,
  Webhooks, e ver se o endpoint existe e o que ele respondeu nos últimos seis
  dias. Entregando com erro, o reenvio resolve. Nunca cadastrado, então
  nenhuma venda de loja jamais chegou aqui, e isso precisa estar resolvido
  ANTES de ligar a venda no Android.
- **ALARME DESARMADO, e eu quase reportei o contrário do que os dados dizem.**
  A 2.9 (Android, produção desde 28/09) parecia fechar sozinha três vezes
  mais: 8 fechamentos em 5 aparelhos em dois dias, um aparelho com quatro
  numa hora, e a taxa de aparelhos com fechamento saltando de 2,9% na 2.8
  para 8,3% na 2.9. O que segurou a conclusão: **a 2.9 ganhou um terceiro
  ouvinte na migalha de fechamento, o sinal nativo do Android, na mesma
  versão em que foi publicada.** A testemunha mudou junto com o app, e
  comparar as duas taxas vira comparar dois instrumentos.
- A saída foi achar uma medida que NÃO passa pela migalha: se o app morresse
  mais, a WebView recarregaria mais, e cada recarregamento emite abertura
  nova. Aberturas por aparelho no Android, 14 dias: 2.7 com 1,50 (122
  aparelhos), 2.8 com 1,55 (118), 2.9 com **1,47** (59). A 2.9 recarrega
  igual ou menos. Não há regressão, e o aparelho que abriu dez vezes numa
  hora é o mesmo fenômeno da 2.8, que teve um com dezoito. A 2.9 pode seguir
  para as lojas por este critério.
- CORRIGIDO no repositório: a migalha passou a registrar COMO concluiu
  (`sem-pausa` ou `pausa-colada`), e o coletor leva isso no rastro.
  Ouvinte novo mexe no segundo grupo e não no primeiro, então o primeiro
  continua comparável entre versões. Mexidos: `lib/app/ultimoPasso.ts`,
  `lib/app/erros.ts`, `scripts/verifica-migalha.ts`.
- **A conferência que eu escrevi e o erro que cometi nela.** Três asserções
  para o campo novo, três defeitos plantados. Duas morderam. A terceira passou
  verde com o defeito na frente pelo motivo mais clássico daqui: eu procurava
  o NOME do campo, e o nome continuava no arquivo, numa variável local. Em vez
  de apertar a regex, **apaguei a asserção**, porque o compilador já reprova
  esse caso sozinho. E antes disso quase registrei que nenhuma das três
  mordia: meu filtro procurava um símbolo que aquele script não imprime.
- SAÚDE: `npm run conferir` inteira passa, tipos limpos. Erros de 7 dias em
  3,3%. Avaliações 12, média 5.
- FONTES QUE FALTARAM, declaradas no artifact: o painel do RevenueCat não tem
  integração nesta sessão (não vi o webhook nem o cliente por trás da
  assinatura); a fatura do Stripe pede autorização, e a primeira cobrança real
  é amanhã, 01/10, com verificação já agendada; crash nativo de Android não é
  reproduzível daqui, porque as suítes rodam num Chromium sem Capacitor.
- Próxima varredura da fila: **quiz diário**, o maior recurso do app sem
  varredura dedicada. Mas se o webhook da loja se confirmar quebrado, a
  compra pelas lojas volta na frente, agora com dado na mão.

## 2026-09-29 · Conteúdo & SEO: aula de suspensão, e vídeo que não pegou não se recupera
- Artifact "Conteúdo da semana":
  https://claude.ai/artifact/VJkykmykButzE9eBG2yJWB
- ENTREGA DA RODADA (formato c, artigo do catálogo): aula
  `diag-suspensao-avisos`, "Suspensão: o que ela avisa antes de virar
  conta". Gratuita, trilha de Diagnóstico, PT+EN, formato estruturado.
- Ela é A METADE DE TEXTO DE UM PAR. O Short da Pauta 02 entrega só a ideia
  de que o amortecedor não amortece, porque lista de casos afunda em vídeo;
  a lista completa mora na aula, que é onde ela funciona. O recorte evita o
  que existe: `diag-vibracao` é vibração por VELOCIDADE e `diag-noises` é
  barulho por MOMENTO. Aqui o sinal é o COMPORTAMENTO do carro, que aparece
  antes do barulho: flutua depois de ondulação, mergulha ao frear, estala
  em buraco, um lado mais baixo, pneu gastando irregular.
- Abre com quatro linhas de quem faz o quê (mola sustenta, amortecedor
  freia a oscilação, buchas e bieletas seguram a geometria, batentes
  limitam o curso), porque é isso que deixa o orçamento conferível. E traz
  o que eu tinha tirado do Short por não caber: a troca aos pares no mesmo
  eixo, com o motivo.
- SEGUNDA LIÇÃO DO CANAL, e é mais dura que a primeira. Uma semana depois
  do lote de 19/09, os que pegaram continuaram crescendo e os que não
  pegaram morreram: "Esquentar o carro parado" 515 → 3169, "perde força na
  serra" 895 → 1770, "água de torneira" 742 → 1113, "a pergunta na oficina"
  553 → 963. Do outro lado, a semana inteira rendeu: "o número no pneu"
  122 → 123, "etanol ou gasolina" 99 → 108, "poça embaixo do carro"
  14 → 20, "desligar o turbo quente" 4 → 5.
- CONSEQUÊNCIA PRÁTICA: não existe "deixa rodar que ele aparece". A
  decisão que importa é a de ANTES de publicar (assunto e gancho); depois
  de subir, o vídeo já respondeu. A distância dentro do lote de 19/09 foi
  de 64 para cerca de 88 vezes sozinha, sem ninguém publicar nada.
- O QUE CONTINUA SEM PROVA: qual pedaço faz a diferença. Título, capa,
  primeiros segundos e assunto mudam juntos, e o coletor traz só views, sem
  retenção e sem CTR. Amostra pequena e distribuição irregular: direção,
  não lei, e está escrito assim nas pautas. Canal no acumulado: 7 inscritos
  e 5750 views.
- BUSCA: 28 dias, 0 cliques e 37 impressões (36 na semana passada). O total
  quase não mexeu, a composição sim: a família de "não pega" virou SETE
  consultas distintas somando 12 impressões, todas entre as posições 53 e
  80. Sete jeitos de escrever o mesmo problema é material de uma página só,
  e o `/carro-nao-pega` já é ela. Página 6 a 8 não é tráfego; a releitura
  marcada segue em 06/10.
- Recorte do catálogo: com a aula nova a suspensão vai de 2 para 3 em 109
  publicadas, e freio mais suspensão mais pneu vão a 10 de 109. Nas três
  semanas desde que esse recorte apareceu, as duas únicas aulas que
  entraram nesses sistemas foram as duas que este papel escreveu.
- AUTOAVALIAÇÃO CONTRA A RÉGUA: os seis critérios que valem para rodada de
  artigo foram cumpridos; os três de guia não se aplicam, pela regra por
  formato anotada em 22/09. O `conferir:catalogo` passou com as 109 aulas,
  sem promessa vazia e sem link morto, o que cobre as âncoras internas.
- Próximas: (1) guia, escolhido pela releitura de 06/10, que cai dentro da
  semana que vem e bate com o rodízio; (2) pauta, mas começando por
  perguntar se as duas já escritas continuam em pé, porque escrever roteiro
  para uma fila que não anda é produzir estoque.

## 2026-09-28 · Diretor: relatório da semana (21 a 27/09), agora com a retenção no centro
- Artifact "Semana Mentorque":
  https://claude.ai/artifact/SWRv7kFgwd33NyCunaagMB
- Banco conferido no começo, conforme o direcionamento de 31/08.
- **DIRECIONAMENTO NOVO DO DONO (21/09), gravado no manual com uma semana de
  atraso**: retenção é a métrica, assinatura sai da manchete. Eu prometi
  gravar na conversa e a conversa acabou antes; fica registrado que promessa
  feita em conversa tem que virar arquivo na mesma rodada.
- **O NÚMERO: 55 contas novas contra 17, a R$ 6,42 contra R$ 15,59.** Melhor
  semana de chegada da história. Gasto de R$ 353,18 contra R$ 265,11 (mesma
  régua, a linha de 7 dias do retrato na segunda).
- **E A RETENÇÃO, que agora é o que manda: a última coorte FECHADA voltou
  ZERO.** Coorte de 14/09, 16 pessoas, nenhuma voltou entre o 1º e o 7º dia.
  As anteriores: 1 de 11 (07/09) e 1 de 8 (31/08). O patamar é perto do chão
  desde o começo, não é piora recente. A régua emprestada pede 10 a 25%.
- SINAL A CONFERIR EM 05/10: a coorte de 21/09 tem 51 pessoas e já 6 voltando
  com a janela ABERTA. Seis é mais que todas as coortes fechadas somadas. Não
  é resultado e não tratei como tal; é a primeira vez que o absoluto sai de
  um e dois.
- **A RÉGUA POR PESSOA NASCEU**: o `user_id` do `abriu_app`, que eu levantei
  em 21/09 como nulo nos 471 registros, passou a ser preenchido em 21/09 às
  23h57. São 16 aberturas com pessoa, 13 pessoas distintas, 1 voltou em dois
  dias. Dois limites: só abertura de quem está logado carrega identidade (16
  de ~388 no período) e sete dias não respondem retorno de 30.
- **CORREÇÃO DO QUE EU ESCREVI EM 21/09**, e quem corrigiu foi o QA: o zero do
  `iniciou_checkout` é ESTRUTURAL. 28 dos 33 `viu_paywall` são Android, que
  roda em modo leitor por decisão de projeto e não tem botão de compra
  (política da Play). Eu tinha atribuído o zero só ao portão do convidado, que
  é a metade menor. 85% do denominador vem de onde o numerador não pode
  existir.
- PLACAR de 21/09: (1) contar a tentativa do convidado NÃO FEITA, e era menor
  do que eu disse; (2) não subir orçamento das campanhas de app ANDOU PARA
  TRÁS, o gasto subiu 33%, as de instalação levam 55% do dinheiro e a cegueira
  aumentou porque a busca também parou de etiquetar em 19/09 (zero de 34
  contas com etiqueta); (3) lista parada PARCIAL, Instagram entrou e quatro
  fluxos do n8n foram desligados, mas as negativas seguem paradas há 25 e 9
  dias.
- A FAVOR, sem eu cobrar: o retrato passou a calcular custo por conta usando a
  última semana FECHADA e a avisar que a corrente não serve de denominador. Era
  a armadilha que apontei em 21/09.
- ITEM NOVO PARA O QA: os fechamentos do Android voltaram e estão na versão
  NOVA. São 11 na semana, 9 deles na 2.8 (aprovada em 24/09, depois da rodada
  do QA de 23/09) e 2 na 2.7. Erros totais foram de 10 para 22.
- Prioridades: (1) fazer o convite de aviso chegar a quem entra, porque o
  gargalo da retenção está medido e é ele (28 de ~367 veem o convite, e 1 em 4
  aceita quando vê); (2) devolver a etiqueta à URL final da busca, um campo no
  painel; (3) segurar o orçamento onde está até uma coorte fechada voltar
  acima de zero, e aplicar as duas listas de negativas.
- NO TOPO DO RELATÓRIO, com data: 01/10 é a primeira cobrança real (R$ 29,90),
  três dias antes da minha próxima rodada. Verificação já agendada pelo QA.

### VEREDITOS DAS RODADAS DA SEMANA
Dito ANTES, corrigindo a falha que declarei em 21/09: o veredito é sobre o
REGISTRO no diário, não sobre o trabalho inteiro. Não abri os seis relatórios.
- **Mídia paga (24/09)**: cumpriu 11 dos 12 e DECLAROU a falha (critério 3,
  custo por campanha) com o motivo. Era exatamente o autoexame que eu cobrei
  na semana passada, e veio. Rodada mais bem feita da semana: assinatura limpa
  da quebra de etiqueta (hora, volume e tipo de página convergindo), prova
  final deixada como passo do dono, e a recusa explícita de dividir instalação
  por conta.
- **QA (23/09)**: cumpriu 1 a 6 e 9 a 11; o 8 com a metade do Stripe
  declarada. Semana sem defeito de código e a de maior efeito: provou pelo
  histórico do git que duas medidas do retrato não podem ser lidas como
  resultado, e consertou na fonte com colunas de maturidade. É o que tornou a
  seção de retenção deste relatório possível.
- **Guardião das conferências (26/09, rodada 1)**: cumpriu 1 a 9 com o limite
  da prova declarado. Três de seis conferências estavam cegas; a pior aprovava
  o defeito que a fez nascer, porque sorteava o id à mão em vez de chamar a
  função. Papel novo que já justificou a existência.
- **CRO (25/09)**: cumpriu 1 a 6, 8 e 10. Fechou os dois primeiros vereditos
  do caderno e chamou uma das apostas de correção, porque ela nasceu sem como
  ser fechada. Fechou o ciclo de 11/09 com número (28 de ~367 veem o convite).
  Escreveu a retenção sem enfeite, inclusive a parte que desmente o trabalho
  dele.
- **Segurança (27/09, rodada 2)**: cumpriu 1 a 5 e 7 a 9. Fechou as três
  recomendações da rodada 1 conferindo o ESTADO e não o commit, e transformou
  em prova o que antes era leitura de configuração. Achou o desfecho
  incompleto do próprio achado: o quinto fluxo segue pagando IA duas vezes por
  semana para gravar num banco que não existe mais.
- **Conteúdo e SEO (22/09)**: cumpriu 1 a 5 e 9. Primeiro dado de audiência do
  papel, com desenho de comparação que se defende sozinho (cinco vídeos no
  mesmo lote, minutos de diferença, 64x entre o primeiro e o último). Separou
  o que dá para concluir do que seria invenção e corrigiu a pauta anterior
  antes de gravar.

### A MINHA RODADA CONTRA A MINHA RÉGUA
- Cumpri 1 a 7 e 9. O 8 não se aplica: hoje é a última segunda de setembro; a
  proposta de manual do mês vale em 05/10.
- Corrigi a falha do critério 7 que declarei em 21/09: desta vez disse ANTES
  que o veredito é sobre o registro.
- Limite do critério 1: os dois gastos vêm da linha de 7 dias do retrato para
  serem da mesma régua, e essa janela não é a semana calendário exata; onde o
  agente de mídia mede outra janela, mostrei as duas.

## 2026-10-04 · Segurança (rodada 3): a conferência que eu tinha pedido para outro papel virou trabalho meu, e o quinto fluxo tem uma chave viva atrás de um webhook sem senha
- Artifact "Segurança da semana" (rodada 3):
  https://claude.ai/artifact/JJdYcrmYe1yBZMzSg7ukmA
- Semana de 88 commits.
- **O VEREDITO DO DONO SOBRE A RODADA 2, PONTO POR PONTO.**
  - **Ponto 1, o pedido que ficou sem dono: FEITO, e é a maior parte desta
    rodada.** Eu tinha pedido que a `verifica-banco.mjs` exigisse
    `security_invoker` explícito em toda view, e pedi para outro papel. Agora
    está escrito, por mim. A regra é **explícito**, não "sempre `on`", porque o
    `estado_da_base` é `off` de propósito desde 14/09 e exigir `on` apagaria uma
    decisão boa; exigir explícito só proíbe o silêncio.
    - **Ela reprovou num defeito REAL antes de qualquer plantio**: a
      `assinaturas_conferencia` sem cláusula. Consertei o arquivo
      (`funil_eventos.sql`) e apliquei no banco pela migração
      `assinaturas_conferencia_security_invoker`.
    - **Três plantios, com verde antes e verde depois**: tirar a cláusula de uma
      view que tem (mordeu), deixar a cláusula só no COMENTÁRIO (mordeu, que é a
      armadilha nº 2 desta casa) e valor inválido (mordeu).
    - **Estado do banco depois**: 13 views, **zero sem a cláusula**, 12 em `on` e
      a do `estado_da_base` em `off`. Nenhuma legível por `anon` nem por
      `authenticated`.
    - **E corrigi o comentário que causou o mal-entendido**: a ressalva que tira
      a view da regra do `pg_temp` continua lá, com razão, mas agora diz que a
      view tem a regra DELA logo abaixo, e por que a leitura de 27/09 deixou o
      pedido sete dias sem dono.
  - **Ponto 2, achado com N itens vira N linhas**: aceito, e já aplicado nesta
    rodada. O achado novo de hoje entrou como linha própria, com o id do fluxo,
    em vez de virar sub-item da linha de 27/09.
  - **Ponto 3, o inventário mensal precisa de data**: aceito. **A próxima é
    01/11/2026**, primeiro domingo de novembro, e está escrita no manual. Esta
    rodada é a primeira de outubro, então o inventário foi feito hoje.
- **ACHADO DA RODADA, e ele só apareceu porque eu li a DEFINIÇÃO do fluxo, e não
  só a execução.** O quinto fluxo (`mIsag1ifLfNWzCxh`) está **há 7 dias** na
  lista do dono e continua ativo. Lendo os nós dele:
  - o nó "IA (Claude)" carrega uma **chave da Anthropic em texto puro**, como
    valor de cabeçalho e não como credencial do n8n;
  - **essa chave funciona**: a execução de 25/09 voltou com resposta completa;
  - e o mesmo fluxo tem um webhook **`POST /webhook/blog-gerar` sem
    autenticação nenhuma**. Quem souber o endereço dispara a chamada paga quantas
    vezes quiser.
  - **Localização apenas. O valor não está no relatório, nem aqui, nem no
    artifact.**
- **E AQUI EU ESTAVA ERRADO, e a correção veio de outra sessão no mesmo dia.** A
  minha linha de 27/09 pedia **desligar** o fluxo. O commit 880badf desmontou o
  raciocínio: eu li "Vocaboost foi desligado como produto" e concluí "então
  desliga", **sem perguntar por que o dono tinha mantido justamente ESSE ligado**.
  Ele mantinha porque publicava artigo toda semana para awareness, e o blog
  mostra "em breve" porque o banco sumiu. A minha observação ("paga e joga fora")
  estava certa; a minha conclusão sobre a intenção estava errada. É exatamente a
  armadilha do CLAUDE.md de 03/10: conclusão tirada do primeiro número encontrado,
  sem procurar o que ele mede.
- **E O DONO DECIDIU HOJE, o que muda o estado de novo.** Ele disse que
  restaurar o banco do Vocaboost **"não faz sentido"**, e as duas linhas (a minha
  de desligar e a de restaurar) saíram da lista. Então o conserto saiu da mesa e o
  fluxo **continua ligado**: o que era "quebrado, vão consertar" passou a ser
  permanente. Isso não é a minha recomendação de 27/09 de volta: é uma pergunta
  nova que a decisão dele criou, e ela entrou como pergunta única ("continua
  ligado?"), com a saída explícita de "fica ligado de propósito e eu paro de
  trazer".
- **POR QUE A CHAVE NÃO É REABRIR A DECISÃO DE 22/09, E POR QUE NÃO É REPETIR O
  ARGUMENTO.** Em 22/09 o dono decidiu não girar as chaves do n8n, e a razão foi
  que os produtos estavam desligados e **ninguém alcançava** aquelas chaves. O
  fato novo não é "achei chave de novo", que o manual já diz que não é achado: é
  que **esta** tem um caminho de disparo aberto para qualquer pessoa, sem
  credencial. Mudou o alcance, não o produto. Virou UMA linha de decisão sobre
  UMA chave, com prazo de 11/10, e eu não repeti a recomendação geral. E ela fica
  de pé independente do fluxo ser desligado ou não, porque girar chave é decisão
  separada de desligar fluxo.
- **E O QUE CORTA PARA O OUTRO LADO, porque relatório que só junta o que reforça
  a própria tese é advocacia.** A chave de `service_role` do mesmo fluxo continua
  apontando para projeto apagado, como eu disse em 27/09. O caminho pago morre
  dois nós antes do e-mail, então **nenhuma mensagem sai** para os três endereços
  que o nó de e-mail lista. E o gasto por disparo é de poucos milhares de tokens.
  O problema é o caminho sem porta, não o tamanho da conta.
- **SEM PushNotification, e a decisão é consciente.** A regra de avisar na hora
  vale para segredo exposto NO REPOSITÓRIO; este está no n8n. Além disso o
  relógio não começou a correr esta semana: o webhook está assim desde julho, e o
  dono decidiu sobre chaves do n8n há 12 dias. Avisar na hora aqui seria eu
  passar por cima de uma decisão recente com informação adjacente. Se ele quiser
  outro limite, a linha está na lista dele para dizer isso.
- **ACHADO NOVO, e ele era um buraco na conferência que eu acabei de escrever.**
  A view **`contas_criadas` existia no banco e NÃO existia no repositório**. O
  `estado_da_base.sql` a mencionava num comentário, e o comando que a cria não
  estava em lugar nenhum. Ela lê `auth.users`.
  - **Não era buraco de permissão**: está em `security_invoker = on`, e a ACL no
    ar era `postgres` e `service_role`, mais ninguém. É a variante SEGURA do par
    que expôs a lista de e-mail em 19/09, onde o perigo era `SECURITY DEFINER`.
  - **Era buraco de leitura**, e isso importa para o meu ofício: conferência de
    texto só vê o que tem arquivo. Escrevi `supabase/contas_criadas.sql` como
    transcrição do que já estava no ar, lido com `pg_get_viewdef` e `reloptions`,
    e deixei a limitação escrita no comentário da própria conferência.
- **Dependências: o total ANDOU e a produção não.** São **24 falhas** agora
  contra 18 em 27/09, mas as de produção continuam **4** (1 crítica, 2 altas, 1
  média). Então **20 são só de desenvolvimento**, contra 14. E a `devDependencies`
  está **idêntica** à de 27/09, confirmado commit a commit: ou seja, **a nossa
  árvore não mudou, o conhecimento do mundo sobre ela mudou**. É a prova da regra
  do manual de release: "não mexemos em nada" nunca prova que nada mudou.
- O `next` segue em 14.2.35, e o que sobra são as duas críticas de sempre, que
  não alcançam a gente (Vercel é Linux; o otimizador está desligado, com prova no
  fonte em 27/09). O `fixAvailable` agora é `next` **16.3.8**, versão maior.
  Recomendação continua a de não decidir isso numa rodada de domingo.
- **Segredo escapando: nenhum nos 88 commits, e o zero foi provado** plantando as
  seis formas numa cópia do diff. O `.gitignore` não foi tocado e
  `.env.local.bak` continua ignorado.
- **Supabase: duas linhas novas, as duas de objeto que nasceu esta semana, e
  nenhuma é buraco.** A tabela `saida_motivos` entrou com RLS ligado, zero
  política e sem `select` para `anon` nem `authenticated`, que é o certo. A função
  `aparelhos_ativos` entrou sem `search_path` fixo, mas é `SECURITY INVOKER`, SQL
  simples sob RLS: não dá a ninguém o que ela já não tinha, igual às outras cinco.
- **Permissões, inventário de outubro.** Repositório: **um colaborador**, o dono,
  admin. n8n: **18 credenciais** (uma nova, `AppsFlyer`, que casa com o coletor
  desta semana), todas no projeto pessoal dele. **67 fluxos**, 9 ativos: oito do
  Mentorque e o de Vocaboost acima. **Fora do alcance desta sessão**, e por isso
  sem resposta: apps conectados na Meta e no Google, e credenciais do Codemagic.
  **Próximo inventário: 01/11/2026.**
- **O LIMITE DESTA VARREDURA.** Alcançou: a árvore do lock, a `devDependencies`
  comparada commit a commit, o diff de 7 dias, os advisors nos dois tipos, o
  estado de permissão de função, tabela e view no banco, e a definição E as
  execuções dos fluxos do n8n. **Não alcançou**: a rede até o nosso site (o proxy
  segue recusando `mentorque.com.br`), o otimizador de imagem da Vercel, os
  pacotes SPM do build nativo, o binário das lojas, o WebView do aparelho, e os
  três painéis de terceiro citados acima.
- **SAÍ DO MEU TERRITÓRIO UMA VEZ, e digo para o Guardião discordar.** O
  `npm run conferir` estava **VERMELHO na main**, para todo mundo, e não por
  minha causa: a `conferir:publicacao` reprovava em `native/` e em
  `pecas-geradas/`. Diagnostiquei antes de tocar, e é **um de cada**:
  - **`native/` é erro real, e a conferência estava certa.** Essa pasta
    **nunca existiu** neste repositório (`git log --all --diff-filter=A` não traz
    nada), então a linha do `.vercelignore` não excluía nada. A saída do build
    nativo se chama `.next-native` (next.config.mjs:70) e o git já a ignora.
    Tirei a linha morta, com o porquê escrito no próprio arquivo.
  - **`pecas-geradas/` é falso positivo, e a conferência estava errada.** Ela
    perguntava "existe no disco?", e essa pasta só NASCE quando alguém roda
    `scripts/pecas.mjs`. Em clone limpo ela não existe, então a bateria ficava
    vermelha sem nenhum defeito na frente dela. Troquei a pergunta para o que o
    repositório tem (`git ls-files`), que responde igual em clone novo e em
    máquina de trabalho, com a exceção nomeada uma por uma e o motivo do lado.
  - **Três plantios, verde antes e verde depois**: erro de digitação em pasta
    real (`docs` para `docsx`), pasta que nunca existiu (a própria `native/`) e
    pasta inventada com cara de saída de execução (`pecas-geradas-v2/`). As três
    mordem, então a exceção não engoliu os parecidos.
  - **Por que eu, e não o Guardião**: ele roda sábado, e a bateria vermelha
    bloqueia o regime de todos os papéis até lá. O critério que o dono me deu em
    03/10 é quanto tempo a coisa fica parada se ficar com o outro. Se ele preferir
    que eu tivesse só relatado, a decisão é dele e eu sigo.
- **UMA SEGUNDA VERMELHA QUE EU NÃO CONSERTEI, e é de propósito.** Depois do
  rebase, a `conferir:travessao` reprova em `docs/lojas/ficha.md:70`, linha que
  entrou hoje no commit 7e88d40 e que eu não toquei (zero diff meu nesse arquivo).
  O travessão está dentro de um título de loja CITADO como texto antigo que já foi
  publicado, e trocar o caractere ali apagaria o registro do que esteve no ar.
  Isso é decisão de quem cuida de ficha de loja, não minha, e é o mesmo caso em
  que eu mudei o MEU texto em 27/09 em vez de mexer na conferência. **Fica para o
  papel de ASO e Lojas**: ou a citação ganha uma forma que a conferência aceite,
  ou a conferência passa a tolerar citação marcada. Eu empurrei a minha parte com
  essa linha vermelha, dizendo em vez de esconder. **E fechou sozinho, do jeito
  certo**: o commit ac8a55a, de quem cuida da ficha, tirou o travessão citado
  minutos depois, e a bateria voltou a 0. É o desfecho que eu queria e não era meu
  para dar.
- **Contra a régua**: cumpri 1 a 5 e 7 a 9. O 6 se aplica pela primeira vez por
  outro caminho: eu não troquei dependência, mas mexi em código (conferência,
  `.sql` e uma migração), e passou pelo regime, com `npm run conferir` inteiro em
  0 e os plantios documentados. **O que ficou devendo**: nada que eu consiga
  nomear nesta rodada, e isso me deixa desconfortável o suficiente para dizer
  que a parte mais fraca é o inventário de permissão, que segue pela metade por
  falta de ferramenta em três painéis, com as datas e os nomes ditos.

## 2026-09-27 · Segurança (rodada 2): as três recomendações foram feitas, e o quinto fluxo que ficou ligado paga um artigo por semana para jogar fora
- Artifact "Segurança da semana" (rodada 2):
  https://claude.ai/artifact/UbAuWTsw1tVHzVpCJsWZws
- Semana grande: 37 commits.
- **TUDO da rodada 1 fechou desfecho, e conferido no estado, não no commit.**
  - `next` 14.2.5 para **14.2.35**: confirmado no `package.json` e no
    `package-lock.json`.
  - **O otimizador de imagem foi mais longe do que eu recomendei, e melhor.** Eu
    pedi para tirar `"image/avif"` do `formats`; entrou `unoptimized: true`, que
    desliga o otimizador inteiro. **E agora dá para provar o que semana passada
    era só leitura de config:** no fonte da versão instalada,
    `node_modules/next/dist/server/next-server.js:167`, o manipulador de imagem
    faz `render404` e RETORNA quando `imagesConfig.unoptimized` é verdadeiro,
    antes de validar parâmetro e antes de tocar no otimizador. O caminho até a
    crítica de AVIF deixou de existir no servidor Node. Fica de pé o limite
    honesto: esse é o caminho do servidor Node, e o otimizador da Vercel é
    infraestrutura dela, que eu não leio daqui.
  - **`pg_temp`**: as três funções `SECURITY DEFINER` agora têm
    `search_path=public, auth, pg_temp`, e `anon` e `authenticated` continuam sem
    executar nenhuma delas.
  - **A conferência de travessão passou a varrer `docs/`** (3537688), e ela
    morde: plantei travessão no `DIARIO.md` e ela reprovou apontando a linha 3.
    Semana passada o mesmo defeito passou verde. Desfeito por cópia de segurança.
- **O ACHADO DA RODADA, e ele é o desfecho incompleto de 20/09.** Eu tinha
  apontado CINCO fluxos ativos sem relação com o Mentorque. Quatro foram
  desligados (599c95c). O quinto, **"Conteúdo/SEO (Blog)" do Vocaboost**, continua
  **ativo** e continua **disparando**.
  - **O que ele faz, lido na execução e não na descrição**: dispara terça e sexta
    às 9h, monta o prompt, **a chamada de IA termina com SUCESSO** (39,8s, 797
    tokens de entrada e 3.963 de saída na rodada de 25/09) e o nó seguinte,
    `Salvar & publicar`, morre com `getaddrinfo ENOTFOUND` no Supabase do
    Vocaboost. **O endereço não resolve em DNS: aquele projeto não existe mais.**
  - **Então ele paga o artigo e joga fora, duas vezes por semana.** Quatro
    falhas seguidas visíveis: 15, 18, 22 e 25/09.
  - **O dinheiro é pequeno e eu não vou inflar isso.** São milhares de tokens por
    rodada, duas vezes por semana; não é o motivo para agir. O motivo é que um
    fluxo de produto morto está armado, falhando, e ninguém olha. Está na lista
    do dono. **Não desliguei**: desligar fluxo não é da minha alçada, e foi assim
    que os outros quatro saíram.
- **O FURO NA PREMISSA DA DECISÃO DAS CHAVES, e o que eu NÃO estou fazendo com
  ele.** O dono decidiu em 22/09 não girar as chaves em texto puro do n8n, e a
  razão escrita foi que "Vocaboost e Dermato foram desligados como produto, só o
  Mentorque está de pé, e sem outra operação viva não há de quem confundir".
  **Existe operação viva de Vocaboost**: é o fluxo acima. Isso é fato sobre a
  PREMISSA, e o manual é claro sobre o que reabre o assunto (chave usada por quem
  não devia, cobrança estranha, mais alguém com acesso ao n8n). Nada disso
  aconteceu, então **eu não estou reabrindo a decisão e não repito o argumento**.
  Registro o furo porque o dono decidiu com essa frase na mão, e ela tem um
  buraco. E registro também o que corta para o outro lado: o nó desse fluxo
  carrega uma chave `service_role` em texto puro que aponta para um projeto
  **que não existe mais**, então aquela chave específica hoje não abre nada.
  Localização apenas, sem valor em lugar nenhum, como manda a regra.
- **Sem PushNotification, e o motivo está escrito**: a regra de avisar na hora
  vale para segredo exposto NO REPOSITÓRIO. Este está no n8n, o dono já o
  conhece desde 22/09, e aponta para projeto apagado.
- **Dependências: o número não mudou e o conteúdo mudou.** Continuam 18 falhas,
  4 em produção (1 crítica, 2 altas, 1 média) e **14 só de desenvolvimento**. É
  armadilha de leitura: parece que nada andou, mas o `next` subiu 30 versões
  menores. O que sobra são exatamente as duas críticas que eu disse que 14.2.35
  não fecharia (RCE em servidor Windows e a de AVIF), e o `fixAvailable` agora
  aponta para **`next` 16.3.6, que é versão maior**. As duas continuam sem
  alcançar a gente: a Vercel roda Linux, e o otimizador está desligado com prova
  no fonte. `postcss`, `nanoid` e `qs` seguem sem caminho de entrada de estranho,
  como a regra 1 do manual já explicou.
- **Segredo escapando: nenhum nos 37 commits da semana, e o zero foi provado.**
  A varredura devolveu zero, então plantei as cinco formas (`sk_live`, `whsec_`,
  JWT, token da Meta e `SERVICE_ROLE` com valor) numa CÓPIA do diff e ela pegou
  as cinco. O `.gitignore` não foi tocado na semana e `git check-ignore` confirma
  que `.env.local.bak` continua ignorado.
- **Supabase: os avisos estão idênticos aos de 20/09**, nos dois tipos, e por isso
  não viram linha nova. Nada sumiu também.
- **ACHADO NOVO, do tamanho certo: a única view da casa sem
  `security_invoker = on`.** Com views novas entrando esta semana, olhei as 13 do
  `public`. Onze nascem com `security_invoker = on`. O `estado_da_base` tem `off`
  **de propósito e documentado** (migração `estado_da_base_como_dono`, 14/09). E
  **`assinaturas_conferencia`** (`supabase/funil_eventos.sql:161`) foi criada
  **sem cláusula nenhuma**, então herda `off` e roda como o dono, passando por
  cima do RLS de `subscriptions` e `funil_eventos`.
  - **Não é buraco hoje**, e conferi no estado: `anon` e `authenticated` não leem
    nenhuma das 13, e essa tem `grant select` só para `service_role`.
  - **É a mesma forma do erro de 19/09 ao contrário**: trinta linhas acima, no
    mesmo arquivo, um comentário diz "a view NÃO fura o RLS" sobre a view
    vizinha, que ganhou a opção. Esta não ganhou, e o comentário do arquivo passa
    a valer para ela também aos olhos de quem lê.
  - **O que ela carrega torna o futuro concreto**: `user_id`, `status`, `plan` e
    `current_period_end`. O dia em que alguém der `select` nela para
    `authenticated`, para um painel, todo mundo logado lê a assinatura de todo
    mundo.
  - **A metade que vale mais que o conserto**: nenhuma conferência olha isso. A
    `verifica-banco.mjs` confere `pg_temp` em função `SECURITY DEFINER` e para
    ali. O pedido é que ela passe a exigir `security_invoker` EXPLÍCITO em toda
    view, de modo que omissão reprove e um `off` deliberado tenha que ser escrito
    como `off`, com o motivo do lado, que é o caso do `estado_da_base`.
- **Permissões: não fiz o inventário completo, de propósito.** Ele é mensal e a
  primeira rodada do mês foi a de 20/09. O que conferi foi o desfecho dos fluxos,
  acima. Os nove fluxos ativos hoje são oito do Mentorque mais o de Vocaboost.
- **O LIMITE DESTA VARREDURA.** Alcançou: a árvore do `package-lock.json`, o
  fonte do `next` instalado, o diff de 7 dias, os advisors nos dois tipos, o
  estado de permissão de função E de view no banco, e os fluxos e execuções do
  n8n. **Não alcançou**: a rede até o nosso site (o proxy segue recusando
  `mentorque.com.br`), o otimizador de imagem da própria Vercel, os pacotes SPM
  do build nativo, o binário que está nas lojas, o WebView do aparelho, e os
  apps conectados na Meta, no Google e no Codemagic.
- **Contra a régua**: cumpri 1 a 5 e 7 a 9. O 6 não se aplica (nenhuma
  dependência trocada por mim). **O que ficou devendo**: no achado de AVIF eu
  fechei o buraco de leitura da semana passada para o servidor Node, mas o
  otimizador da Vercel continua sendo camada que eu não leio, e isso segue
  escrito como limite e não como prova.

## 2026-09-26 · Guardião das conferências (rodada 1): seis provadas, três estavam cegas
- Artifact "Conferências da semana":
  https://claude.ai/artifact/94SXJ5Ti2KJ96mhh5cDvpW
- **Seis conferências provadas com defeito plantado**, todas com o código de
  saída lido direto, sem cano. Morderam na primeira: `conferir:tipos` (saída 2,
  não 1), `conferir:estilo` (saída 1, em regra de erro) e `conferir:versoes`
  (saída 1 em três defeitos diferentes: um dos três lugares para trás, versão
  já publicada, banner apontando para a versão velha). **Três não morderam** e
  foram consertadas e provadas de novo.
- **A pior, e ela é a lição da rodada: `conferir:identidade` não pegava o
  defeito que a fez nascer.** Plantei de volta o `efemero = SEM_ARMAZENAMENTO`
  de 01/09, aquele que colava todo aparelho sem armazenamento numa pessoa só no
  relatório, e ela aprovou, saída 0. Ela não chamava `anonId()`: sorteava o id à
  mão e conferia o próprio sorteio. Cópia de regra não apodrece com o código,
  então fica verde para sempre. E a desculpa escrita nela ("window não existe
  aqui") era falsa: `window` faltando é o GATILHO do caminho de exceção, não o
  obstáculo. Agora chama a função de verdade e morde cinco defeitos, incluindo o
  de origem.
- **`conferir:catalogo` conferia um campo e a tela mostra dois.** O link
  `[[id|texto]]` do corpo era validado; o `related`, que vira os cards de
  "Continue por aqui", não. Terceira vez que aparece o mesmo padrão nesta casa,
  depois do travessão partido em `{a, b}`.
- **ACHADO DE PÉ, e era pequeno: `vid-padaria` apontava para `battery-care`,
  que não existe em lugar nenhum do repositório.** Não quebrava nada, porque
  `Content.tsx` filtra o id que não resolve; a pessoa via dois cards onde
  deveria ver três. Apontei para `diy-battery` ("Trocar a bateria"), que é a
  única aula de bateria e o destino óbvio de uma aula sobre percurso curto.
- **`conferir:regras` deixava a regra dos sete dias virar três.** Ela afirmava
  que o perdão do quiz não existe no dia 2 e existe no dia 7, e nada no meio.
  Medindo com o valor plantado, 3, 4, 5, 6 e 7 passavam todos. Entrou o par que
  prende o número: na véspera não, no dia sim.
- **A fila estava incompleta.** `conferir:banco`, `conferir:imagem` e
  `conferir:coorte` já rodavam na corrente do `conferir` e não estavam no
  rodízio. Conferência nova nasce fora da fila, porque quem escreve não vem
  acrescentar a linha. A tabela agora bate exatamente com o `package.json` (44
  linhas) e passou a ser ordenada com as "nunca" em cima, que é o que a regra do
  rodízio sempre mandou e a tabela contrariava.
- **A armadilha do ambiente, que quase virou uma rodada inteira errada**: o
  contêiner remoto veio sem `node_modules`, e a `conferir:tipos` deu saída 2 numa
  árvore limpa, com centenas de "Cannot find module 'next/server'". Isso não é
  repositório doente, é `npm ci` faltando. Virou primeiro passo do manual: rodar
  a conferência limpa e exigir 0 antes de plantar qualquer coisa.
- **Contra a minha régua, o critério que NÃO cumpri é o da suíte de navegador.**
  O manual pede uma suíte de navegador provada por mês, e setembro vai fechar
  sem nenhuma: ela custa build de produção e uns 11 minutos, e o tempo desta
  rodada foi para os três consertos. Fica como primeira tarefa de 03/10, antes
  das seis da fila. Os outros oito critérios foram cumpridos: árvore limpa antes
  de plantar, o defeito escrito antes de cada plantio, saída lida sem cano,
  desfeito por cópia com a árvore voltando limpa, conserto provado mordendo,
  medição antes de alargar (165 referências de `related`, 1 morta, 0 falso
  positivo), fila com a data de hoje e `npm run conferir` inteiro em 0 antes do
  push.
- **O que esta rodada NÃO alcança, e isso se diz**: nada aqui prova plugin
  nativo nem comportamento de aparelho. As conferências rodam em node e em
  Chromium, e Chromium não tem plugin do Capacitor. Sobre qualquer coisa que só
  aparece no celular, a resposta continua sendo o roteiro manual e a migalha do
  último passo, não o verde daqui.
- **RECOMENDAÇÕES (3)**: (1) quem escrever conferência nova acrescente a linha
  na fila do Guardião no mesmo commit, senão ela nunca é provada; (2) o padrão
  "confere um campo, a pessoa vê o todo" já apareceu três vezes, vale o QA
  procurá-lo de propósito nas conferências que ainda não passaram por aqui; (3)
  conferência que replica a regra em vez de chamar a função é candidata número
  um a estar cega, e o comentário que explica por que não chama costuma ser o
  lugar onde a premissa falsa está escrita.

## 2026-09-25 · CRO (retenção): o portão de permissão ganhou número, e dois vereditos fecharam
- Rodada semanal do CRO/BeSci, foco RETENÇÃO (a de 18/09 foi de conversão).
  Artifact "Conversão da semana":
  https://claude.ai/artifact/WqSbEVbYtPR8ht4XkiJ4yc
- **DOIS VEREDITOS FECHADOS**, os primeiros do caderno, e os dois INCONCLUSIVO
  por motivos diferentes que valem mais que o rótulo:
  - `cta-teste-por-plano`: inconclusivo e NÃO por falta de volume. Ele nasceu
    sem como ser fechado. Sem variante e sem "antes" (a série do funil nasceu
    no mesmo dia da mudança), nenhum número futuro poderia dizer FUNCIONOU. E a
    tela onde ele vivia foi mexida duas vezes desde então pelos dois testes A/B
    de 12/09, um deles trocando exatamente a última página no Android. O degrau
    de chegada ainda subconta por construção (o `iniciou_checkout` só nasce
    para quem tem conta). A mudança FICA no código: nomear o que o botão faz é
    correção de clareza, e correção se defende pelo argumento.
  - `fim-do-lembrete-falso`: inconclusivo porque o risco que ele previne ainda
    não pôde acontecer. São 12 avaliações, nenhuma citando cobrança, e zero
    cancelamentos, mas a primeira cobrança de verdade é 01/10. Ausência do
    evento não é prova de conserto. Marcado para reler depois de 01/10.
- **O CICLO DE 11/09 FECHOU, e é o achado da rodada.** Naquela semana registrei
  que as cinco máquinas de recorrência dependiam todas da mesma permissão e que
  ninguém a media. A instrumentação subiu em 19/09, e agora ela responde:
  cerca de 367 aparelhos começaram o onboarding, 28 viram o convite, 7
  aceitaram e 9 acabaram com permissão concedida.
  - O gargalo NÃO é o convite: um em quatro aceita quando é convidado. O
    gargalo é quem chega a vê-lo, 28 de ~367.
  - Concedidas (9) passam de aceites (7), então o interruptor do Perfil também
    funciona e é a única porta que não depende do momento certo.
  - RESSALVA DE JANELA, na régua do critério 11: os eventos subiram em 19/09 e
    só alcançaram as lojas com a 2.8, aprovada em 24/09. Os números vêm quase
    todos da web e de um dia de loja, então são PISO e não retrato da base.
- **APOSTA DA SEMANA, implementada**: [convite-do-carro-nao-queima-com-convidado].
  O convite depois do cadastro do carro é o melhor momento do pedido, e a marca
  que o leva do cadastro até a garagem era consumida ao montar a tela, sem
  olhar se havia conta. Como o convite só é desenhado para quem tem conta, quem
  cadastrava o carro como CONVIDADO queimava o momento sem ver convite nenhum.
  Agora a marca só é gasta quando existe quem a veja.
- **CONFERÊNCIA NOVA, `npm run conferir:convite`, provada mordendo**: sete
  conferências sobre as cinco regras da marca. Tirei a guarda e ela reprovou
  nos dois pontos certos; devolvi e voltou a passar. Para ela existir, as
  marcas saíram de `pedidoDeAviso.ts` para `lib/app/marcasDeConvite.ts`: são
  estado puro, sem dependência, e no arquivo antigo ficavam presas atrás do
  plugin de notificação, fora do alcance de conferência de linha de comando. O
  arquivo antigo reexporta, então nenhum chamador mudou.
- **RETENÇÃO SEM ENFEITE**: coorte de 14/09 fechada com 16 cadastrados e ZERO
  voltando em 1 a 7 dias. A de 21/09 tem 31 e 4, mas ainda enche, então não é
  resultado. Ativação caiu de 6 em 11 para 3 em 16 enquanto a aquisição dobrava
  e a mídia subia para R$ 371 na semana. Duas leituras cabem e nenhuma está
  provada (público pago mais frio, ou produto igual com gente diferente); o que
  NÃO cabe é dizer que o produto piorou, porque as coortes antigas também
  voltavam perto de zero.
- APRENDIZADOS em besci.md: aposta que nasce sem como ser fechada não é aposta,
  é correção, e o rótulo tem que dizer isso no dia do registro; e veredito não
  se lê antes de o risco poder acontecer.
- Bateria `conferir` inteira verde (a nova incluída), tipos limpos, suíte
  `carro` passando. Sem build local, que é o regime das duas velocidades.


## 2026-09-24 · Mídia paga (rodada 2): 44 contas a R$ 8,30, e a etiqueta parou de chegar no dia 19
- Artifact "Mídia da semana":
  https://claude.ai/artifact/H49EM3cYfvAdiTNn6YLBFU
  Relatório e PDF em `docs/agentes/relatorios/`, com a data de hoje na primeira
  linha, que é o que libera o e-mail das 10h para o Luiz.
- **A MANCHETE, janela de 17 a 23/09 contra 10 a 16/09**: gasto de R$ 365,33
  contra R$ 211,38 (mais 73%), **44 contas de fora contra 10** pela régua
  canônica, **custo por conta de R$ 8,30 contra R$ 21,14**. Três campanhas no
  ar: busca no Google (R$ 163,59, 107 cliques, CPC R$ 1,53), instalação Android
  no Google (R$ 105,52, 566 cliques, CPC R$ 0,19) e instalação no Meta
  (R$ 97,01, 368 cliques, CPC R$ 0,26). As duas de instalação nasceram no dia 19
  e já levam 55% do dinheiro.
- **O ACHADO: desde 19/09 nenhuma conta nova carrega etiqueta.** Zero em 34
  contas. Duas causas somadas: campanha de loja é cega por construção (previsto,
  está no manual), e **a busca também ficou cega, e essa não era para ficar**. A
  URL final do anúncio virou o `/baixar` limpo, exatamente o que `docs/utms.md`
  proíbe com todas as letras.
- **A assinatura da quebra, e ela é limpa:** `comecou_onboarding` com etiqueta
  cai de 21 (18/09) para 0 (20/09), e no MESMO dia aparecem 24 `clicou_baixar`
  sem nome, do tamanho dos cliques da campanha (uns 12 por dia). Foram 62 toques
  anônimos rumo à Play Store de 20 a 23/09. A evidência converge de três lados
  (hora da virada, volume e tipo de página), e mesmo assim a prova final é olhar
  o campo no painel, que é passo do dono.
- **O preço**: a busca gastou R$ 84,73 de 20 a 24/09 sem que dê para dizer se
  trouxe uma conta ou dez. Nos dias 17 e 18, os últimos em que a medição
  funcionava, ela estava em **R$ 15,24 por conta**, melhor que os R$ 21,43 da
  rodada 1. O número morreu no meio da melhora.
- **PROPOSTA DA SEMANA, uma só, e é um campo no painel**: colar a etiqueta na
  URL final da busca (`?utm_source=google&utm_medium=cpc&utm_campaign=lancamento`).
  Não mexe em lance, orçamento, público nem região. Devolve o custo por
  clique-para-a-loja por campanha, uns R$ 640 por mês que hoje não dá para
  separar do tráfego que chega sozinho. **NÃO devolve a conta**: quem instala
  pela loja cria conta dentro do app, e a etiqueta fica no navegador. Está na
  lista do dono.
- **O buraco maior, e o dono dele é a Engenharia**: instalação de loja não tem
  origem. O conserto conhecido é ler o Install Referrer dentro do app e mandar
  para o funil, e precisa de versão nova. Enquanto não existir, qualquer frase
  sobre qual campanha trouxe uma conta de celular é chute, e 55% do dinheiro
  está nesse escuro.
- **FECHOU: o link etiquetado do Instagram entrou no ar.** No dia 19 apareceram
  os primeiros `clicou_baixar` com `instagram / bio` da história do funil, seis
  até agora. Volume pequeno, instrumento funcionando.
- **FECHOU: quem pausou a busca em 19/09.** Decisão do dono, por gente
  desqualificada; voltou a rodar no dia 20. A pergunta que a rodada 1 deixou
  aberta está respondida.
- **CONTINUA PARADO, com o custo da espera**: negativas de scanner, 5 dias,
  mais R$ 2,86 (R$ 41,39 acumulados); negativas de curso, 21 dias, R$ 14,05
  desde que a linha entrou. Não repito as duas como recomendação nova.
- **A importação por gclid perdeu força, e é honesto dizer**: ela treinaria a
  busca, que agora manda para a loja, e os 20 cliques já têm três semanas.
  Continua na lista, com prioridade menor. Anotado na própria linha.
- **Meta, primeira semana com gasto de verdade, e a quebra por anúncio serviu**:
  um anúncio só ("Você liga o carro e espera parado") levou R$ 96,32 dos
  R$ 97,01 e 367 dos 368 cliques. A quebra entrou na coleta em 19/09, uma semana
  antes de existir gasto. A coleta lê `act_1071232758617319` e vê essa campanha;
  se as outras três que o dono mencionou estiverem em outra conta, continuamos
  cegos para elas, e essa linha NÃO está na lista do dono apesar de o manual
  dizer que está.
- **Instalação não é conta**: as plataformas contaram perto de 197 instalações
  na janela (97 pelo Google, 100 pelo Meta) enquanto nasceram 44 contas. Réguas
  diferentes, donos diferentes, não se dividem uma pela outra.
- **A RÉGUA DA RODADA: cumpre 11 dos 12.** O que falha é o critério 3, fechar o
  custo por desfecho medido POR CAMPANHA, e o motivo é o próprio achado. O que
  existe é o custo por conta do conjunto, que é canônico e está declarado como
  tal, não disfarçado de número do papel.
- APRENDIZADOS em `midia-paga.md`: `porDia` é o total da CONTA e não da campanha
  (com a conferência de que a soma de `porCampanha` tem que bater); a assinatura
  de etiqueta perdida (rastro com nome caindo e rastro sem nome do mesmo tamanho
  subindo no mesmo dia), que vira conferência semanal; campanha de instalação
  apaga o número deste papel e isso se declara em vez de substituir em silêncio;
  e a cobertura dos termos caiu de 23% para 21%, com a piora medida.

## 2026-09-23 · QA: dois números do retrato não podem ser lidos como resultado
- Artifact "QA da Semana":
  https://claude.ai/artifact/Bmps6hvr11WManGiPwRHBV
- Semana sem defeito de código. O que há são duas medidas que chegam ao
  relatório de segunda parecendo queda, e nenhuma das duas é queda.
- **ACHADO 1, a coorte da semana corrente ainda está ENCHENDO.** O retrato diz
  "ativação, coorte de 21/09: 0 de 15" e isso é uma coorte de dois dias. A
  prova não é raciocínio, é o histórico do próprio retrato no git: a coorte de
  14/09 foi lida como **2 de 8** no dia 19, **2 de 11** no dia 20, **3 de 16**
  no dia 21 e estabilizou aí. O denominador cresce enquanto a semana está
  aberta; o numerador, enquanto a janela de 7 dias de cada pessoa não fecha.
  Medida hoje, a coorte de 21/09 já tem 18 cadastrados, não 15.
- Das quatro coortes de ativação que o retrato exibe, só DUAS podem ser lidas.
  Na retenção é pior: a janela de 8 a 30 dias não fechou em nenhuma das
  quatro, e as quatro aparecem com zero. O retrato já tem esse aviso para o
  CAC ("a semana corrente ainda está aberta, não serve de denominador") e não
  tem para ativação nem retenção.
- **CORRIGIDO na fonte, dentro da alçada de view ADITIVA**: `ativacao_coortes`
  ganhou `semana_fechada` e `janela_fechada`; `retencao_coortes` ganhou
  `semana_fechada`, `d1_7_fechada` e `d8_30_fechada`. As contas: a semana
  fecha em coorte+7, a janela de 7 dias em coorte+14 (a última pessoa entra em
  coorte+6 e o filtro é `< cadastrado_em + 8 days`), a de 8 a 30 em coorte+37.
  Ensaiado antes de aplicar, colunas antigas conferidas uma a uma sem mudança
  de nome, ordem ou valor, e os dois arquivos de `supabase/` atualizados no
  mesmo commit.
- **ACHADO 2, o fundo do funil soma um app que não pode vender.** Dos 33
  `viu_paywall` dos últimos 9 dias, **28 são Android, 4 iOS e 1 web**. O
  Android roda em modo leitor por decisão de projeto: a tela de assinatura
  aparece e emite `viu_paywall`, mas não tem botão de compra, porque convite
  de compra por fora é o que a política do Play proíbe. Então
  `iniciou_checkout` zero é ESTRUTURAL, e uma taxa de paywall para checkout
  somando as três plataformas não mede nada: 85% do denominador vem de onde o
  numerador não pode existir.
- Não é defeito de código, é defeito de LEITURA, e a documentação ajudava a
  errar: `docs/android-local.md` dizia que o modo leitor é "sem paywall". A
  tela aparece; o que não existe é a compra. Frase corrigida, com os números
  do lado.
- **CONFERÊNCIA NOVA, `conferir:coorte`**: as colunas moram no banco e o
  registro delas em `supabase/`. Em 26/08 esta casa descobriu o arquivo do
  funil três eventos atrás do aplicado. Agora reprova se as views de coorte
  não declararem as colunas de maturidade. Provada mordendo com dois defeitos
  plantados, incluindo a armadilha da casa (deixar só o COMENTÁRIO citando a
  coluna e tirar o SQL). Limite declarado no cabeçalho: ela lê o ARQUIVO, não
  o banco.
- **Paradas obrigatórias**: a conta do dinheiro fecha (3 `ok` e 1 cortesia; a
  fatura do Stripe não foi aberta, integração pede autorização nesta sessão).
  Os zeros têm todos causa conhecida e nenhum é novo.
- **ITEM DO TOPO DA FILA, FECHADO E A FAVOR**: os fechamentos do iOS 2.1
  sumiram. Zero no iOS nos últimos 8 dias. Em 16/09 eu marquei isso como
  direção; agora é medido. Restam 2 fechamentos no Android 2.7 (22/09), pouco
  para investigar e o bastante para acompanhar.
- **Uma linha da tabela do topo estava velha e eu corrigi em vez de
  reinvestigar**: o "esqueci minha senha" foi consertado em 20/09 e a linha
  ainda dizia que o patch não tinha sido aplicado.

## 2026-09-22 · Conteúdo & SEO: o canal ensinou qual formato de Short o público segura
- Artifact "Conteúdo da semana":
  https://claude.ai/artifact/Ty23BSyicWq3NDZayCWxnP
- ENTREGA DA RODADA (formato b, pauta de gravação): Pauta 02, "O amortecedor
  não amortece", em docs/conteudo/pautas.md. Short 9:16 de 45 a 60s, com
  roteiro por trecho, o que precisa aparecer em cada plano, cuidados, texto
  do YouTube e o trecho pronto para o catálogo.
- ACHADO DA RODADA, e é o primeiro dado de audiência que este papel tem.
  Em 19/09, entre 13h26 e 13h29, CINCO vídeos subiram no mesmo lote. Views
  na coleta de 22/09: 895 (perde força na serra), 553 (a pergunta que muda
  a conversa na oficina), 122 (o número no pneu não é a pressão), 99
  (etanol ou gasolina, a conta dos 70%) e 14 (poça embaixo do carro, quando
  é normal e quando é vazamento). Mesmo canal, mesma base, minutos de
  diferença, **64 vezes entre o primeiro e o último**. Um segundo par
  confirma: em 03/09, com dois minutos de diferença, "Esquentar o carro
  parado" fez 515 e "Desligar o turbo quente" fez 4.
- O QUE DÁ PARA CONCLUIR: dentro de um lote tudo o mais está constante,
  então a diferença está no vídeo em si. O QUE SERIA INVENÇÃO: dizer qual
  pedaço. Título, capa, primeiros segundos e assunto mudam juntos, e o
  pacote do coletor traz só views, sem retenção, sem CTR e sem impressões.
  Dez vídeos é amostra pequena e distribuição de vídeo é irregular. É
  direção, não lei, e está escrito assim na pauta.
- O padrão, como hipótese: ganharam o fenômeno que a pessoa já SENTIU e
  nunca teve explicado, e UMA coisa concreta para fazer, em assunto de
  todo mundo. Perderam a estrutura de TRIAGEM ("quando é A, quando é B") e
  o assunto de nicho, que só serve a quem tem aquela peça.
- REGRA NOVA nas pautas: um Short entrega UMA ideia, sobre algo que a
  pessoa já sentiu no próprio carro. Lista de três casos é estrutura de
  artigo e de guia, não de Short: no texto funciona, porque quem lê está
  procurando o caso dele; no vídeo, pede que a pessoa espere a vez dela.
- CORREÇÃO DA PAUTA 01, feita antes de gravar e por isso de custo zero: o
  miolo dela são "três barulhos e o que cada um quer dizer", que é
  exatamente a forma do vídeo de 14 views. O gancho continua bom e não
  muda; o meio passa a entregar UMA ideia (a lingueta que chia de
  propósito) e o terceiro caso vai para a descrição e para a aula. O aviso
  está datado no topo da pauta e o roteiro original ficou inteiro, porque
  ele segue sendo a fonte do texto da aula.
- Por que suspensão na pauta nova: 108 aulas publicadas e a suspensão tem
  2, nenhuma sobre o que ela avisa. Freio mais suspensão mais pneu seguem
  em 9 de 108, contra 54 só de motor. O recorte não mudou desde 08/09.
- AUTOAVALIAÇÃO CONTRA A RÉGUA do manual: seis critérios se aplicam a uma
  rodada de pauta e os seis foram cumpridos. Três não se aplicam (registro
  e sitemap de guia, metadados de busca, âncoras e FAQ), porque não existem
  num roteiro de vídeo. Observação registrada no manual: a régua nasceu em
  19/09 escrita para a rodada de guia, e marcar quais linhas valem por
  formato evita que a próxima rodada de pauta finja ter passado em
  critério que ela nem podia tocar.
- Busca, para acompanhar: 28 dias, 0 cliques e 36 impressões, contra 24 na
  semana passada. A releitura marcada segue em 06/10.
- Próximas: (1) artigo do catálogo sobre suspensão, fechando o ciclo do
  Short com a lista completa, que é onde a lista funciona; (2) o próximo
  guia, escolhido pela releitura de 06/10 e não por gosto agora, para não
  repetir o erro de 15/09.

## 2026-09-22 · A URL do anúncio saiu do /app, e o aviso que segurava a decisão está velho

O dono decidiu e executou: a URL final do anúncio saiu do `/app` e passou a
mandar para as lojas e para a LP. A linha estava parada há 8 dias com um
aviso preso nela ("NÃO trocar antes de ler: em 18/09 a medição virou contra a
própria recomendação"), porque naquela data 10 das 14 contas novas nasciam na
web.

**Fui medir depois da decisão, e o aviso é que estava velho.** Contas novas
por plataforma, por dia:

| Janela | Web | App (Android e iOS) |
|---|---|---|
| 10 a 18/09, nove dias | **10** | 2 |
| 19 a 22/09, quatro dias | **1** | **21** |

A virada é do dia 19, que é exatamente quando as duas campanhas de instalação
entraram no ar. Só o dia 21 teve 10 contas no Android. E o volume dobrou: 22
contas em quatro dias contra 12 nos nove anteriores.

**A lição, e ela vale para toda a lista.** O aviso de 18/09 estava certo no dia
em que foi escrito e virou mentira quatro dias depois, sem ninguém mexer nele.
Aviso preso numa lista de espera envelhece junto com a espera, e quanto mais
tempo a linha fica parada, maior a chance de o motivo dela já não valer.

**Regra que fica:** linha da lista do dono que carrega um "não faça antes de
ler X" precisa da data de X ao lado. Quando a linha passar de duas semanas
parada, remedir o X antes de repetir a recomendação.

**Também fechado nesta rodada:** a leitura dos sete e-mails da jornada no
celular. O dono leu e disse que estão certos. Era o único item da lista sem
desfazer, porque os textos já saem para cliente todo dia às 9h.

## 2026-09-22 · A queda do Android vitals parou, e "parou" não é "consertamos"

O dono mandou o Android vitals e perguntou se já estava resolvido. A queda é
`com.getcapacitor.Bridge.getPermissionStates`, `NullPointerException`: **1
usuário, 3 eventos, última ocorrência por volta de 05/09**.

**O que prova que o caminho está de pé hoje.** O `getPermissionStates` é o que
roda quando o app pergunta o estado da permissão de aviso. Na 2.7.0 Android,
que é a da loja desde 17/09, com 61 aparelhos desde 18/09:

| Evento | Vezes | Último |
|---|---|---|
| `convite_aviso` | 17 | hoje |
| `permissao_aviso_concedida` | 6 | hoje |
| `aceitou_convite_aviso` | 4 | hoje |

O `permissao_aviso_concedida` só nasce DEPOIS que o pedido nativo volta. O
trecho exato que dava NullPointerException completou seis vezes hoje.

**O que NÃO dá para dizer, e é o ponto.** O commit mais provável de ter
arrumado isso é o `61c3493` ("A folha nativa do Google entra no binário do
Android"), que é o formato de defeito que esta casa conhece: plugin no
JavaScript e ausente no binário, ponte quebra ao perguntar permissão dele. Só
que ele entrou em **07/09** e a última queda foi em **05/09**. **O erro parou
dois dias ANTES de o conserto chegar.** Então ele parou sozinho, e o conserto
posterior só tornou improvável que volte.

A frase certa é "parou, e a versão da loja exercita o mesmo caminho sem cair",
não "achamos e consertamos".

**Ressalva de honestidade:** os eventos de permissão só existem desde a 2.4
(11/09). Eles provam que o caminho funciona HOJE; não provam que estava
quebrado antes, porque não havia medição na 1.7.

**Fechado com critério de reabrir escrito:** 1 usuário, 3 eventos, 17 dias sem
repetir, caminho conferido com volume real. Se voltar na 2.7 ou acima, é
informação nova e aí vale o stack trace.

## 2026-09-22 · O "erro de redirecionamento" do Search Console não é defeito

O dono exportou as listas e depois mandou a inspeção da URL, dizendo que
pediu indexação e o erro continuou. Medido pela Vercel, que é o caminho que o
proxy desta sessão não bloqueia:

| O que | Resposta |
|---|---|
| Domínios na Vercel | apex redireciona para `www` com 308, verificado; o `www` sem redirecionamento. Sem laço |
| `mentorque.com.br/barulho-no-carro` | 308, e o `location` MANTÉM o caminho |
| `www.mentorque.com.br/barulho-no-carro` | 200, HTML completo |
| Canonical da página | aponta para ela mesma, na versão `www` |
| Meta robots | nenhum |
| Sitemap | lista a versão `www`, não o apex |

**A conclusão, e ela muda a pergunta.** A URL inspecionada é a CÓPIA, não a
original. O Google não indexa URL que redireciona: ele segue e indexa o
destino. Pedir indexação de um endereço que responde 308 é pedir uma coisa
que não existe, e vai dar o mesmo resultado para sempre.

A prova de que é isso está no outro arquivo do próprio dono: o `/` do mesmo
domínio sem `www` foi classificado como "Página com redirecionamento", que é
o certo. O `/barulho-no-carro` caiu em "Erro de redirecionamento" na mesma
estrutura, mesmo domínio, mesmo 308, com rastreamento de 01/09. Duas
classificações para a mesma causa, e o painel ainda mostra "Sitemaps: erro
temporário de processamento". Cara de tropeço daquele dia, não de
configuração, porque a configuração foi lida e está correta.

**O que ficou para ele:** inspecionar `https://www.mentorque.com.br/barulho-no-carro`,
que é a URL do nosso sitemap e a que precisa estar indexada. E parar de
tentar validar os dois relatórios: os dois listam URLs do domínio sem `www`,
que existem para redirecionar, e nenhum vai passar nunca.

**A lição de método:** a linha estava na lista dele desde 07/09 pedindo "a
lista de URLs, que é o único dado que não dá para deduzir do código". Estava
certo pela metade. A lista era necessária e não era suficiente: o que
respondeu foi LER A CONFIGURAÇÃO DE DOMÍNIO e BUSCAR AS DUAS URLS. As duas
coisas estavam disponíveis o tempo todo pelo MCP da Vercel, e ninguém tentou
em quinze dias porque o proxy recusa `mentorque.com.br` e a gente parou na
primeira porta fechada. Quando um caminho de rede falha, procurar o segundo
caminho antes de mandar o trabalho para o dono.

## 2026-09-22 · Quatro fluxos desligados, e a atribuição da AppsFlyer está de pé

**Os fluxos.** O dono autorizou: desligar todos os cinco que não são do
Mentorque, menos o Conteúdo/SEO do Vocaboost. Feito, e conferido no estado
depois, não no comando:

| Fluxo | Estado |
|---|---|
| Vocaboost, Conteúdo Orgânico (IG/FB) | desligado |
| Dermato, Recepção WhatsApp (IA) | desligado |
| Dermato, QR ao vivo (pareamento) | desligado |
| TEMP, Página QR Evolution (reconnect 2) | desligado, depois de 72 dias no ar |
| Vocaboost, Conteúdo/SEO (Blog) | **continua ligado**, por decisão dele |

Dos 39 fluxos do Vocaboost, agora só o Conteúdo/SEO está ativo. Dos 3 do
Dermato, nenhum. `Inactive` no n8n não apaga nada e volta com um clique.

**O que o desligamento do Dermato para, e vale estar escrito:** aquele fluxo
respondia o WhatsApp do consultório da cliente. Se o número ainda recebe
mensagem, ninguém responde automaticamente a partir de agora. O dono
autorizou sabendo disso; fica aqui porque é efeito em terceiro.

**A ATRIBUIÇÃO ESTÁ FUNCIONANDO, e eu estava errado.** O dono mandou o painel
da AppsFlyer, janela de 18 a 20/09:

| Media source | Instalações |
|---|---|
| Facebook Ads | 13 |
| Organic | 10 |

Ou seja, a integração com a Meta reporta, e o item que estava na lista dele
como "OneLink parado há 16 dias" já estava feito. **Eu afirmei o contrário com
base num registro de 05/09**, escrito duas semanas antes de as campanhas
existirem, e sem medir nada. Prova velha usada como prova atual.

**O que continua de pé, e agora tem um número do lado.** A falha do SDK segue
real: na 2.7.0, que é a que está na loja, **15 de 61 aparelhos Android (25%)
nunca subiram o SDK**, com a última falha em 21/09. No iPhone, zero em 24.

E há um encaixe entre as duas coisas: o painel da Meta relatou **22
instalações** em 19 e 20/09, e a AppsFlyer conta **13** pelo Facebook Ads em 18
a 20. Painel de plataforma e MMP sempre discordam um pouco, mas 25% dos Android
nunca abrindo o SDK é uma explicação concreta para a AppsFlyer contar menos.
Isso é hipótese com aritmética do lado, não conclusão: falta ver os dois
painéis na mesma janela.

## 2026-09-22 · Decisão do dono: as chaves do n8n ficam como estão

- **Desfecho do item que estava na lista dele desde 07/09** (girar as chaves em
  texto puro nos fluxos do n8n: Anthropic, OpenAI, `service_role` do Supabase,
  token do bot). Ele decidiu **manter as chaves atuais** e a linha saiu da
  lista. A razão registrada: Vocaboost e Dermato foram desligados como produto,
  só o Mentorque está de pé, e sem outra operação viva não há confusão possível.
- A decisão foi tomada com o tamanho do estrago na mão. Antes dela ficou escrito
  que a `DADOS_CHAVE` não é só leitura: ela tranca dez portas, e três delas
  mandam mensagem para cliente (`/api/email/lancamento`, `/api/push/enviar`,
  `/api/cron/jornada`). Ele manteve mesmo assim, e está no manual do Segurança
  como direcionamento, com o que reabre e o que não reabre.
- **O que eu conferi antes de escrever, e não bate com a premissa.** Medido hoje
  na instância: os produtos podem estar desligados como negócio, mas **os
  fluxos continuam LIGADOS no n8n**. Os cinco que não são do Mentorque estavam
  ativos em 20/09 e continuam ativos em 22/09, sem nenhuma mudança de estado.
  Dois deles rodam sozinhos toda semana e têm cobrança de IA atrás.
- Isso não muda a decisão sobre as chaves, que é dele e está tomada. Muda o que
  a lista dele diz: o item dos cinco fluxos continua aberto e ganhou um dado
  novo, que é a data de hoje.

## 2026-09-21 · Diretor: relatório da semana (14 a 20/09) e o primeiro veredito das rodadas
- Artifact "Semana Mentorque":
  https://claude.ai/artifact/NNypGsQD1yxTGt5whCsgaa
- Banco conferido no começo, conforme o direcionamento de 31/08.
- **O NÚMERO: 17 contas novas, contra 11.** Maior número desde que o produto
  existe, e o custo por conta caiu de R$ 19,49 para R$ 15,27.
- **A VIRADA DO DIA 19, e é o achado da rodada.** Até 18/09 as contas vinham
  da web com `google / lancamento` (6 na semana). De 19/09 em diante, nenhuma:
  passaram a vir do Android SEM ETIQUETA (3 em 19/09, 3 em 20/09, e mais 7
  hoje). Causa provável, com quatro indícios e sem prova direta: a campanha de
  instalação da Meta entrou em 19/09 (R$ 28,18, 22 instalações relatadas) e a
  do Google, "APP | Android | Instalações | BR", apareceu em 20/09 (R$ 44,30,
  299 cliques); o RevenueCat foi de 175 para 220 aparelhos em três dias; e a
  App Store ficou em 1 a 2 downloads por dia, então não é iPhone. A prova
  direta não existe porque a atribuição de instalação nunca foi fechada.
- **FECHA A PERGUNTA DO MÍDIA PAGA (19/09):** ele procurou na conta da Meta as
  campanhas com "APP", "Android" e "Instalações" no nome e não achou. Estão no
  GOOGLE, com esse nome exato, e apareceram na coleta de hoje. Pode sair da
  lista do dono.
- Gasto R$ 259,56 (Google 231,38 + Meta 28,18) contra R$ 214,35. ZERO
  assinatura nova, pela terceira semana: o último assinante é de 02/09, são
  19 dias e 35 contas nesse período. Receita segue R$ 0,00; primeira cobrança
  real em 01/10, verificação já agendada.
- ARMADILHA REGISTRADA: o retrato mostra "CAC bruto 7d" de R$ 66,28, que
  divide 7 dias de gasto pelos cadastros da semana CORRENTE, e hoje a semana
  corrente tem só a segunda-feira. O número da semana fechada é R$ 15,27.
- CONFERI ANTES DE ESCREVER: `comecou_onboarding` deu 189 e
  `terminou_onboarding` deu 64 nas DUAS semanas, número idêntico, o que parece
  defeito de consulta. Conferido dia a dia: as distribuições são diferentes e
  as somas caem no mesmo lugar por coincidência. É real.
- PLACAR de 14/09, as três FEITAS com prova: (1) a perda de evento no funil
  parou, e agora dá para afirmar, uma única recusa em 7 dias e é a de 14/09
  13h30, antes do conserto (erros de execução da Vercel); (2) a rota destravou
  (teto para 60 s, retrato de hoje sem `error`, 11 fontes com zero dias
  parados); (3) banco reconectado. A leitura de 7 dias que a Engenharia deixou
  em aberto em 15/09 ("dez horas de silêncio não são prova") está fechada aqui.

### VEREDITOS DAS RODADAS DA SEMANA (papel de chefe, primeira vez)
Ressalva que vale para os seis: as réguas nasceram em 19/09, e quatro destas
rodadas são anteriores. Só Mídia paga e Segurança tinham a régua na mão.
- **Segurança (20/09)**: cumpriu 1 a 5 e 7 a 9; o 6 não se aplica. DECLAROU as
  próprias falhas (AVIF é leitura de configuração e não medição; inventário de
  permissões pela metade, com o que faltou nomeado). Achou a mitigação barata
  e não aplicou por estar fora da alçada, que é o certo. De brinde, achou que a
  `conferir:travessao` não varre `docs/`, e provou plantando o defeito. Nada a
  cobrar.
- **Mídia paga (19/09)**: cumpriu 1 a 10 e 12; o 11 eu conferi abrindo o
  relatório e ele se sustenta sozinho. Destaque: desmentiu o próprio estado
  escrito horas antes (a lista de termos é de 30 dias, não 7), derrubando por
  quatro a projeção que ele mesmo publicara. FALHOU o autoexame: a régua manda
  dizer qual critério não foi cumprido, e nem o relatório nem o diário trazem
  esse parágrafo. Atenuante: a régua nasceu no mesmo dia.
- **CRO (18/09)**: cumpriu 1 a 6, 8 e 10; o 9 não se aplica. Entregou o achado
  mais valioso da semana (o portão que apaga a tentativa do convidado) e
  cumpriu o critério 3 de forma exemplar. FALHOU o 7: não há registro de ter
  atualizado o mapa. Pode ter feito sem escrever; contra a régua vale o
  registro.
- **QA (16/09)**: cumpriu 1, 2, 4, 5, 10 e 11; o 7 e o 9 não se aplicam.
  DECLAROU duas falhas: publicou sem as etiquetas MEDIDO/DEDUZIDO/TEORIA e
  republicou, e fechou só metade da conta do dinheiro porque o Stripe pedia
  autorização. O critério 4 está impecável (5 relatos de aparelho e 1 de web,
  por versão, com o aviso de que 3 aparelhos são direção e nada mais).
- **ASO e Lojas (15/09)**: cumpriu 1 a 7; o 8 não se aplica. Sem falha
  identificada. Achado forte e barato de provar: o feed da Apple entregou uma
  vez em 15 dias, e a prova é a duração da execução (1,6 s quando grava contra
  0,2 s vazia). A proposta de ficha tem critério de volta atrás com data.
- **Conteúdo e SEO (15/09)**: cumpriu 1 a 4, 6, 7 e 9; nada a ressalvar no 5 e
  no 8. Mudou de ideia com número na mão (trocou a pauta da fila porque o
  critério do site é demanda de busca) e devolveu tempo ao dono ao registrar
  que rodava dois builds por cerimônia.
- PADRÃO QUE JÁ DÁ PARA VER, e que fica anotado para a proposta de manual da
  primeira segunda de outubro: dos dois papéis que tinham a régua, um declarou
  o autoexame e o outro não. O critério do autoexame é o que menos se cumpre
  sozinho, porque é o único que não produz entrega.

### A MINHA RODADA CONTRA A MINHA RÉGUA
- Cumpri 1 a 7 e 9. O 8 NÃO SE APLICA: hoje é a terceira segunda do mês.
- FALHEI no 7, e o motivo está no artifact: o veredito saiu do que está escrito
  no DIARIO e eu abri só UM dos seis relatórios (o de Mídia paga, porque tinha
  critério que só dava para julgar lá dentro). Nos outros cinco, critério que
  se cumpra dentro do artifact e não apareça no diário eu contei como não
  registrado, e isso pode ser injusto. Da próxima vez: ou abro os seis, ou digo
  antes que o veredito é sobre o registro.
- Imprecisão menor no 1: o gasto da semana anterior (R$ 214,35) é a janela de
  7 dias até 14/09, não a semana exata, porque o pacote do coletor só guarda
  8 dias.
- Prioridades: (1) contar a tentativa de compra de quem não tem conta, porque
  o degrau da venda não tem medição e são 19 dias sem assinante; (2) não subir
  orçamento das campanhas de app enquanto elas forem invisíveis, e fechar antes
  o OneLink (16 dias parado) e a conversão "criou conta" (14 dias); (3) vinte
  minutos na lista do dono, que tem 15 linhas e a mais velha parada há 18 dias.

## 2026-09-20 · Segurança (rodada 1): o Next tem três críticas, e a atualização que existe fecha uma
- Primeira rodada semanal do papel. Artifact "Segurança da semana":
  https://claude.ai/artifact/QFNNwtGWrqyFAeeSKWjHMC
- **O ACHADO DA RODADA, e o que ele tem de desconfortável.** O `next` está em
  **14.2.5** e carrega **três falhas críticas**. Subir para **14.2.35** (o
  remendo que o `npm audit` oferece, sem virar versão maior) **fecha uma**:
  - *Authorization Bypass in Middleware* (`<14.2.25`): **não alcança a gente**,
    e a prova está no `middleware.ts`. O nosso middleware só põe cabeçalho de
    CORS; quem passasse por cima dele perderia o cabeçalho, não ganharia
    permissão. Quem confere permissão é cada rota, pelo `Authorization`.
  - *RCE em servidor Windows* (`<15.5.24`): não alcança, a Vercel roda Linux.
    **E o remendo de 14.2.35 não cobre essa faixa.**
  - *RCE na API de otimização de imagem com AVIF* (`<15.5.24`): é a que
    incomoda. O `next.config.mjs` liga AVIF de propósito
    (`formats: ["image/avif", "image/webp"]`) e o endpoint `/_next/image`
    existe em qualquer build da Vercel. **Também não é coberta por 14.2.35.**
- **O que a atualização REALMENTE compra**, e isso sim vale: as altas da faixa
  14.2.x, entre elas envenenamento de cache (`<14.2.10`), um desvio de
  autorização (`<14.2.15`) e as negações de serviço por Server Components
  (`<14.2.34` e `<14.2.35`). Não é pouco. Só não é "resolvido".
- **A frase que NÃO se pode dizer depois de subir**: "atualizei o Next, está
  resolvido". Várias altas só têm conserto na linha 15.x (`<15.5.16`,
  `<15.5.21`, `<15.5.24`), e sair da 14 é mudança de versão maior, que é outro
  projeto, com outro custo.
- **Mitigação barata para a de AVIF, sem atualizar nada**: tirar `"image/avif"`
  do `formats`. Custa quase nada porque **`next/image` não é usado em lugar
  nenhum do repositório** (zero ocorrências), então nenhuma tela muda. NÃO fiz:
  está fora da alçada deste papel, que cobre cabeçalho de segurança e não
  entrega de imagem.
- **Os três baldes do `npm audit`**: 18 falhas no total. **4 chegam em produção**
  (1 crítica e 2 altas, todas do `next`/`postcss`; 1 média no `qs`) e **14 são
  só de desenvolvimento**, contadas e não listadas.
  - E o caminho até nós desmonta duas das quatro: o `postcss` 8.4.31 vem
    **preso dentro do `next`** e roda no build, sobre o NOSSO css, e os avisos
    dele são sobre `sourceMappingURL` em css de terceiro, que a gente não
    processa. O `nanoid` vem dentro desse mesmo `postcss`. O `qs` 6.15.3 vem
    dentro do SDK do `stripe`, que o usa para MONTAR o corpo do que a gente
    manda, e os avisos são sobre INTERPRETAR entrada de atacante.
- **DESFECHO FECHADO, o achado de 19/09 segurou.** As funções
  `cadastros_do_dia` e `cadastros_no_periodo` (`SECURITY DEFINER`, leem
  `auth.users`) foram conferidas **no estado, não no comando**, como o manual
  manda: `has_function_privilege('anon', ...)` devolve **false** nas duas, e em
  `contas_criadas_desde` também. A lista de e-mail de todo cadastrado não está
  mais ao alcance da chave pública.
- **A camada seguinte dessas mesmas funções, que ninguém tinha olhado.** As
  duas têm `search_path=public, auth`, **sem `pg_temp`**. No Postgres, quando
  `pg_temp` não é nomeado, ele é pesquisado PRIMEIRO. Numa função
  `SECURITY DEFINER` isso é a porta clássica de sequestro de nome. **Não é
  buraco hoje**: para explorar, a pessoa precisa criar objeto temporário E
  executar a função, e quem pode as duas coisas é `service_role`, que já manda
  em tudo. O `contas_criadas_desde` já nasceu com `pg_temp` no fim; as outras
  duas não. Conserto de uma linha cada, e a recomendação é que ele pegue carona
  na próxima migração que tocar nessas funções, não numa migração de domingo.
- **Os outros avisos do Supabase, traduzidos**: os 5 de `search_path` mutável
  (`identidade`, `funil_canonico`, `funil_etapas`, `anomalias_da_operacao`,
  `match_manual_chunks`) são todos `SECURITY INVOKER`, SQL simples, lendo
  tabelas sob RLS. Não dão nada a quem já não tinha: o aviso é higiene, não
  risco. O `vector` em `public` idem. E os **16 INFO de "RLS ligado e sem
  política" continuam sendo o contrário de buraco**, como o manual já fixou.
- **Senha vazada**: decidido pelo dono em 20/09, não volta. Registrado para
  ninguém trazer de novo.
- **Segredo escapando: nenhum.** A varredura dos 63 commits da semana bateu em
  3 linhas com forma de segredo e as 3 são modelo, não valor
  (`.env.example:8` e duas de documentação de skill de fora). Não cito valor
  nem de placeholder, por regra.
- **O `.gitignore` continua mordendo, e isso foi PROVADO, não lido.** Quatro
  commits da semana mexeram no arquivo (todos liberando `.claude/skills/`, longe
  do bloco de `.env`). `git check-ignore` confirma: `.env`, `.env.local`,
  **`.env.local.bak`** (o quase acidente de 05/09), `.env.production` e
  `.env.local.backup2` são ignorados, e só `.env.example` é rastreável.
- **Permissões, o inventário do mês.** Repositório: **um colaborador só**, o
  dono, como admin. n8n: **17 credenciais**, todas no projeto pessoal dele,
  ninguém de fora. Mas os **65 fluxos** contam outra história: a maioria é de
  **outro produto (Vocaboost) e de um cliente (Dermato)**, e **cinco estão
  ATIVOS** sem relação com o Mentorque, entre eles um chamado
  **"TEMP — Página QR Evolution (reconnect 2)"**, ativo desde 12/07, e um <!-- travessao-ok: nome do fluxo no n8n, copiado como está -->
  "Dermato — QR ao vivo" que, pela própria descrição, serve uma página pública <!-- travessao-ok: nome do fluxo no n8n, copiado como está -->
  de pareamento de WhatsApp protegida só por uma chave no endereço. Não confirmei
  o comportamento pela rede (ver limites). Virou pergunta na lista do dono, não
  diagnóstico, e **não desliguei nada**: fluxo do Dermato é o consultório de
  alguém.
- **Parado na lista do dono**: girar as chaves em texto puro dos fluxos do n8n
  do Vocaboost está **há 13 dias** (entrou em 07/09).
- **O LIMITE DESTA VARREDURA.** Ela alcançou: árvore do `package-lock.json`,
  diff dos últimos 7 dias, advisors do Supabase (os dois tipos), estado das
  permissões de função no banco, colaboradores do repositório e credenciais do
  n8n. Ela **não** alcançou: a rede até o nosso próprio site (o proxy desta
  sessão recusa `mentorque.com.br`, então o `/_next/image` não foi conferido ao
  vivo, só lido no config); os pacotes SPM do build nativo, que entram por faixa
  e não têm `Package.resolved` versionado; o binário que está nas lojas; o
  WebView do aparelho; e os apps conectados na Meta, no Google e no Codemagic,
  que não têm ferramenta nesta sessão e continuam por olhar.
- **Sobra da disciplina de plantar defeito, e é para o Guardião**: plantei
  travessão na prosa nova destes dois documentos e a `conferir:travessao`
  passou verde. Ela varre as frases das telas, do conteúdo e dos títulos de
  página, e **não varre `docs/`**. A regra do dono de escrever sem travessão
  vale também para docs, e ali não há ninguém conferindo. O defeito foi
  desfeito por cópia de segurança, como manda o CLAUDE.md.
- **Contra a própria régua**: cumpri 1 a 5 e 7 a 9. O 6 não se aplica (nenhuma
  dependência trocada). **O que ficou devendo**: o achado de AVIF diz o que a
  falha PERMITE, mas eu não consegui confirmar que o endpoint responde em
  produção, então ele é leitura de configuração e não medição, e está escrito
  assim. E o inventário de permissões ficou pela metade por falta de ferramenta,
  com as partes que faltam nomeadas.

## 2026-09-19 · Engenharia: o e-mail da jornada deixou de ser carta no escuro, e o webhook está armado (provado)
- **O buraco**: a jornada manda até 6 e-mails por pessoa em 30 dias e a gente
  sabia UMA coisa sobre eles, que saíram. Entregue, aberto, clicado, devolvido,
  spam: nada. Máquina de retenção sem medição pode estar caindo em caixa de spam
  há uma semana, e o sintoma (silêncio) é igual ao de "ninguém quis".
- **O que entrou**: o envio guarda o `id` do Resend em `jornada_envios.email_id`
  e leva a etiqueta da chave (`d2`, `vencida-oil`, `mes`); a rota
  `/api/email/eventos` recebe os eventos com assinatura Svix conferida; a tabela
  `email_eventos` guarda uma linha por (e-mail, tipo); o retrato publica
  `email30d` com taxa por chave.
- **Três decisões com nome**: o webhook FALHA FECHADO (sem segredo, recusa
  tudo); a taxa de clique é sobre ENVIADOS e não sobre abertos, porque abertura
  depende de imagem carregada e dividir clique por aberto infla a taxa justo nas
  listas que bloqueiam imagem; e nada de endereço nem de conteúdo é guardado.
- **PROVADO, e não suposto**: o dono criou o webhook e colou o
  `RESEND_WEBHOOK_SECRET` na Vercel. Variável nova só vale no deploy seguinte,
  então saiu um commit vazio; depois um POST sem assinatura recebeu **401
  `sem_assinatura`**, e não 501. Os dois códigos são a prova: 501 seria a função
  sem enxergar o segredo, 401 é a rota conferindo assinatura com o segredo no
  ar. A prova rodou por um fluxo temporário do n8n que gravou o veredito em
  `app_erros`; o fluxo foi arquivado e a linha apagada na sequência.
- Os primeiros eventos de verdade chegam com a jornada das 9h de amanhã.
- **O inventário do que dá para medir** virou `docs/dados/o-que-medimos.md`: o
  que já entra sozinho todo dia e os nove buracos em ordem de quanto doem, com
  custo e dono de cada um. O primeiro é de onde vem cada INSTALAÇÃO, que ficou
  urgente agora que as campanhas novas mandam o clique direto para a loja.

## 2026-09-19 · Engenharia: link inteligente de download, e três linhas saíram da lista do dono
- **O dono fez três coisas e elas saíram da lista**: ligou o Web Analytics da
  Vercel (o componente já estava no site desde 08/09, então a medição por
  página começa a contar nas próximas visitas), escolheu a credencial do Google
  no nó "Search Console: top páginas" do n8n, e a quarta linha caiu sozinha:
  **já existe token de push de iPhone** (1 iOS desde 17/09, contra 5 Android).
  A ação de 12/09 pedia exatamente isso e estava velha; foi conferida no banco
  antes de apagar.
- **O que ele perguntou, e virou código**: dá para ter um link que manda iPhone
  para a App Store e Android para o Google Play? Dá, e ele faz mais do que
  isso. A página `/baixar` lê o aparelho, manda para a loja certa, e ANTES de
  mandar guarda a etiqueta da campanha e emite `clicou_baixar`.
- **O buraco que isso fecha**: loja não conta de onde o clique veio. Em todos os
  eventos desde 23/08 as origens são google (563), atalho (14) e email (8), e
  `instagram` não aparece uma única vez. Link de bio indo direto para a ficha da
  loja funciona para a pessoa e é invisível para nós, então post que deu certo e
  post que não deu produzem o mesmo dado: nenhum.
- Evento novo `clicou_baixar` (aparelho, sessão, medido desde 19/09), com a
  restrição do banco recriada na migração `funil_clicou_baixar` e a lista
  fechada de `/api/funil` atualizada. Sem os três lugares, a rota recusa com 400
  e o clique some em silêncio.
- **NÃO substitui o OneLink da AppsFlyer**, que continua parado na lista: o
  OneLink liga o clique à INSTALAÇÃO, o `/baixar` liga o clique à ORIGEM.
- `conferir:baixar` nova, com os textos de navegador de verdade, inclusive os do
  navegador de dentro do Instagram (iOS e Android). Dois defeitos plantados: pôr
  o teste de iOS antes do de Android manda todo Android para a App Store (a
  conferência pega os dois casos), e tirar o evento do caminho deixa a página
  funcionando e muda (pega também).
- A `conferir:caminho` pegou um erro meu na primeira versão: eu tinha posto um
  link "abrir no navegador" para o `/app`, contra a decisão do dono de 12/09 de
  que nenhuma página do site leva até lá. Saiu.
- O link da bio em `docs/utms.md` passou a ser o `/baixar`, e a linha da lista do
  dono foi atualizada com o endereço pronto para colar.

## 2026-09-19 · Mídia paga (rodada 1): o desperdício mudou de assunto, e a lista de termos não era de 7 dias
- Primeira rodada do papel, criado hoje. Artifact "Mídia da semana":
  https://claude.ai/artifact/GEmSp1PXWcYNxB9ipcKd5Y
- **A CAMPANHA ESTÁ PAUSADA.** A leitura das 17h24, direto da conta, traz
  `status: PAUSED`; na coleta de 18/09 às 08h30 ainda era `ENABLED`, e o gasto
  de hoje parou em R$ 12,83 com 8 cliques contra os R$ 30 por dia das últimas
  duas semanas. Quem pausou e por quê só existe no console, então fica como
  pergunta para o dono, não como diagnóstico. Todos os números abaixo são de
  antes da pausa.
- **A conta da semana**, janela de 12 a 18/09 (7 dias cheios) contra 5 a 11/09:
  custo R$ 214,30 contra R$ 221,78; cliques 147 nos dois; CPC R$ 1,46 contra
  R$ 1,51; contas de fora 12 nos dois, sendo **10 com a etiqueta contra 8**.
  **Custo por desfecho medido: R$ 21,43, contra R$ 27,72**, 23% melhor. Amostra
  pequena: são duas contas de diferença, direção e não lei. Na vida inteira da
  campanha são R$ 575,10, 374 cliques e 20 contas etiquetadas, R$ 28,76 cada.
- **CORREÇÃO QUE MUDA A LEITURA, e ela desmente o estado que eu mesmo escrevi de
  manhã.** A lista `termos` da coleta não é de 7 dias: é de **30 dias e
  acumulada** (o nó pede `segments.date BETWEEN hoje menos 30 dias AND hoje`,
  LIMIT 50). Prova que não depende de ler o nó: os mesmos três termos aparecem
  com custo idêntico (R$ 3,23, R$ 2,00, R$ 1,99) em duas coletas separadas por
  sete dias, o que numa janela que anda é impossível. Consequência: a projeção
  "R$ 128 por mês em curso", escrita no manual hoje de manhã, está errada por um
  fator de quatro. O certo é uns R$ 27 por mês. As negativas continuam certas; o
  tamanho do prêmio é outro.
- **O ACHADO DA RODADA: o desperdício mudou de assunto.** Comparando a coleta de
  hoje com a de 12/09, o grupo de "scanner pelo celular" foi de R$ 22,38 para
  R$ 38,53 (mais R$ 16,15 na semana) e passou o de "curso", que andou R$ 4,66.
  Em 05/09 eram R$ 6,66 contra R$ 20,52, ou seja a ordem inverteu. A negativa
  que está parada há mais tempo na lista já não é a mais cara.
- **Fora desses dois grupos não apareceu nada que valha negativa nova**, e isso
  também é resposta: o grupo de intenção de oficina (tabela de preço de serviço,
  Mecânica 2000, HaynesPro) soma R$ 8,35 em 30 dias, pouco demais para pagar o
  risco de recortar a campanha. E "mecânico online" e "mecânico virtual"
  (R$ 18,49) NÃO são desperdício: é exatamente o que a Biela faz. Ficou escrito
  na ação do dono para ninguém cortar por engano.
- **UMA PROPOSTA, e ela é a metade retroativa de uma linha que já estava na
  lista.** Todo cadastro com a etiqueta do Google carrega o `gclid`: 10 de 10 na
  última semana, 8 de 8 na anterior, 20 de 20 desde 23/08. Dá para importar
  essas 20 contas como conversão offline (prazo de 90 dias, e o clique mais
  antigo é de 03/09). O Google não recebe sinal desde 04/09, então R$ 575,10
  foram gastos com o lance decidido às cegas enquanto o desfecho estava guardado
  aqui. Passo pronto no `acoes-do-dono.md`; a planilha eu monto quando pedirem,
  e de propósito NÃO commitei gclid de usuário no repositório.
- **MEXI NO COLETOR E DESFIZ NA MESMA HORA, com a prova do porquê.** Tentei
  subir o teto de termos de 50 para 200. O fluxo rodou VERDE e a linha de
  `google_ads` não foi gravada: a rota `/api/metricas` recusou com **413
  `pacote_grande`** (o `MAX_DADOS` é 20.000 bytes e o pacote de 50 termos já
  ocupa 15.310). O nó de gravação segue em frente no erro, as outras dez fontes
  gravaram normalmente e nada gritou. Voltei ao texto anterior, publiquei,
  conferi `versionId` igual a `activeVersionId` e rodei de novo: a linha voltou a
  gravar às 17h24, com os mesmos 50 termos e os mesmos 15.310 bytes. Saldo no
  coletor: zero, de propósito.
- **A lição de conferência**: execução verde do n8n não prova gravação. O que
  prova é o `coletado_em` da linha em `metricas_diarias`, comparado com o das
  outras fontes do mesmo dia. Foi exatamente assim que o 413 apareceu.
- O conserto para 120 termos existe e é barato, mas é do Analista: parar de
  guardar `termosSemConversao`, que é 100% derivável de `termos` e não tem
  leitor nenhum em código, libera 6.942 bytes.
- **Meta e Instagram, sem novidade e sem invenção**: Meta segue conectado, com
  gasto zero e lista de dias vazia (conta sem veiculação, não coleta quebrada),
  e a quebra por anúncio que entrou hoje já aparece na coleta, ainda vazia.
  Instagram continua com zero eventos: desde 23/08 as origens são google (563),
  atalho (14) e email (8).
- APRENDIZADOS gravados em `midia-paga.md`: as duas janelas do pacote de
  google_ads, o teto de 23% do dinheiro com nome, o gclid em todo cadastro
  etiquetado, e a regra de que termo não tem desfecho medido e sim intenção
  legível (o argumento de uma negativa é a intenção que o app não atende, nunca
  um zero que a medição não sabe produzir).

## 2026-09-18 · Engenharia: a porta da web é a que traz conta, e a recomendação de fechá-la estava errada
- O dono perguntou como ainda chega gente pela web. A resposta curta: **a URL
  final do anúncio do Google continua no `/app`**, e é a única porta possível,
  porque `conferir:caminho` prova que os 45 arquivos do site não linkam o
  `/app` desde 12/09. A ação está aberta na lista do dono desde 14/09.
- Medido em 18/09, janela de 7 dias, régua declarada. `comecou_onboarding` por
  aparelho: **145 na web contra 40 nas lojas**, e todos os dias da série têm 17
  a 28 aparelhos web carregando `google / lancamento`. Nada mudou desde 15/09.
- **A CORREÇÃO, e é ela que importa.** A recomendação de 14/09 era trocar a URL
  para a home, com o argumento de que a web converte mal. A medição de hoje
  desmente isso no número que decide: pela régua canônica
  (`contas_criadas_desde`), foram **14 contas de fora em 7 dias**, e o evento
  `cadastro` diz de onde: **10 da web pelo google, 2 do Android**. Trocar a URL
  fecharia a porta que traz a maioria das contas.
- O que continua verdade, e não é pouco: a web termina muito pior o onboarding
  (33 de 145, 23%, contra 26 de 40, 65%) e conta de web não recebe push, que é
  a alavanca de recorrência que acabou de ser construída.
- **A pergunta que ninguém mediu, e que decide:** quanto vale uma conta de web
  contra uma de loja depois de 30 dias. Sem isso, trocar a URL é trocar volume
  conhecido por qualidade suposta. A ação do dono foi reescrita de "trocar"
  para "decidir", com o contra-argumento na mesma linha.
- Lição de método: a recomendação de 14/09 saiu de uma leitura de conversão de
  onboarding ("só 7 viraram conta, 5%") e não da contagem de contas pela fonte
  canônica. Quatro dias depois, a mesma pergunta com a régua certa inverte a
  conclusão. É o caso exato da skill: antes de dizer um número, dizer qual
  tabela é a verdade dele.

## 2026-09-18 · CRO (conversão): o fundo do funil tem um portão que não deixa rastro
- Rodada semanal do CRO/BeSci, foco CONVERSÃO (a de 11/09 foi de retenção).
  Artifact "Conversão da semana":
  https://claude.ai/artifact/XQN24XQxia8EPcPftbR9iq
- VEREDITOS: nenhum vencido. cta-teste-por-plano e fim-do-lembrete-falso vencem
  em 20/09, depois de amanhã, e ficam para a rodada de 25/09; não antecipei
  dois dias para não repetir o erro de janela de 04/09. Os dois testes de
  onboarding se leem duas semanas depois da 2.5 nas duas lojas (por volta de
  15/09), então também não.
- LEITURA PARCIAL dos dois testes A/B, registrada no caderno como leitura e
  NÃO como veredito, seguindo a régua dos três níveis:
  - cadastro-em-duas-etapas: abriu o cadastro 10 em A e 10 em B; cadastrou 3 em
    A e 5 em B. Direção a favor de B, com duas pessoas de diferença e um quarto
    do alvo de amostra (40 aberturas por variante).
  - onboarding-curto: começaram 70 em A e 71 em B; terminaram 18 em A e 25 em
    B. Só que a segunda leitura, cadastrou_carro, está EMPATADA em 4 e 4, que é
    exatamente o risco que a métrica previu. E os números do retrato vêm com
    loja e web somadas, enquanto o desenho pede as duas separadas.
- ACHADO DA RODADA, PROVADO NO NAVEGADOR e não lido no código: num aparelho sem
  conta, abrir o paywall grava `viu_paywall:home` e tocar em "Começar 7 dias
  grátis" leva à tela de entrar SEM GRAVAR NADA. O `iniciou_checkout` nasce
  depois do `if (!user)`, então ele mede "quem já tinha conta começou a pagar",
  não "quem tentou comprar". São seis caminhos de compra no paywall, todos com
  o mesmo portão.
- O QUE ISSO CORRIGE NA LEITURA: a semana de 14/09 tem 11 paywall e 0 checkout,
  e nos quatro grupos de variante dos dois testes o `iniciou_checkout` não
  aparece uma vez sequer. Esse zero não separa "não quis" de "não tinha conta".
  `viu_paywall` conta APARELHOS e a base tem 34 contas, então a maior parte de
  quem vê o paywall é convidado, que é justamente quem o portão apaga.
- NÃO É DEFEITO DE COBRANÇA, e isso foi conferido antes de escrever: a suíte
  `venda` passa inteira, o link de venda leva ao login, guarda plano e cupom e
  atravessa a recarga do login social. O buraco é do caminho de DENTRO do app.
- APOSTA DA SEMANA, implementada: [login-sabe-que-veio-comprar]. A tela de
  entrar passou a reconhecer quem veio de um botão de assinar e a dizer que a
  conta é o passo que falta para o teste começar, no lugar do convite genérico
  de salvar a garagem. Marca de meia hora no aparelho, só para o TEXTO: não
  leva ninguém ao pagamento, não guarda plano nem cupom.
- CONFERÊNCIA PROVADA MORDENDO: a suíte `venda` ganhou quatro conferências
  novas (o texto certo vindo do paywall, o genérico fora, e a marca ausente
  antes e presente depois do toque). Plantei o defeito antigo de volta e ela
  reprovou em três pontos; restaurei e voltou a passar. Bateria `conferir`
  inteira verde, tipos limpos, sem build local.
  - Uma das conferências que escrevi primeiro passava SEM alcançar a tela de
    entrar, ou seja, passava à toa. Troquei por uma que mede o que dá para
    medir de verdade (a marca no armazenamento) em vez de fingir cobertura.
- RECOMENDADO, não feito, e os dois mexem em coisa que não é minha: contar a
  tentativa do convidado (hoje ela não existe em lugar nenhum, e criar evento
  novo mexe na restrição CHECK do funil) e devolver a pessoa ao pagamento
  depois do login, reusando o `guardaVenda` que o caminho do link já usa.
- INCONSISTÊNCIA REGISTRADA para quem cuidar disso: quem chega pelo LINK de
  venda também cai no login, e lá a frase continua a genérica, porque aquele
  caminho usa a compra pendente e não a marca nova.
- APRENDIZADOS em besci.md: passo sem evento é passo sem dono (ao ler zero num
  degrau, perguntar quem aquele evento é capaz de contar antes de interpretar);
  e prova de campo é barata quando existe suíte de navegador, que é a ordem
  certa depois do erro de 28/08.

## 2026-09-16 · QA: o "esqueci minha senha" não redefine senha nenhuma
- Artifact "QA da Semana":
  https://claude.ai/artifact/GHFAzoSBaMfznrWm15jfB6
- Fluxo varrido: **login e recuperação de conta**, que estava na fila e nunca
  tinha sido lido de ponta a ponta.
- **A TELA PROMETE O QUE O CÓDIGO NÃO TEM.** Ao tocar em "Esqueci minha
  senha", o app responde "Enviamos um link para redefinir sua senha". O link
  funciona, mas só cria sessão: a senha antiga continua valendo e **não existe
  nenhuma tela para digitar uma nova**. A prova é uma busca só no repositório
  inteiro: há exatamente um `updateUser`, em `lib/app/socialLogin.ts`, e ele
  grava o NOME no login social. Nada escuta `PASSWORD_RECOVERY`, nada trata
  `type=recovery`.
- **O estrago**: quem esqueceu a senha ganha um login temporário, não uma
  recuperação. Na próxima vez que precisar entrar, a senha que ela não sabe
  continua sendo a única válida, e ela pede o link de novo. Para sempre.
- **Agravante no app das lojas**: `emailRedirectUrl()` devolve o endereço da
  WEB mesmo dentro do app nativo, então o link abre o navegador, a sessão
  nasce lá e o app no celular continua deslogado. É o mesmo formato do defeito
  que já mordeu no login social, e o comentário daquele conserto segue em
  `lib/app/socialLogin.ts`.
- **NÃO consertei, e o motivo é a skill `concluir-com-prova`**: é
  funcionalidade nova em AUTENTICAÇÃO e o passo que importa (o clique no link
  do e-mail) não é reproduzível desta sessão. Conserto de login às cegas é
  aposta com nome de conserto. Patch com as três peças e a decisão que sobra
  para o dono em `docs/agentes/propostas/recuperar-senha-nao-recupera.md`.
- **DÍVIDA DE FONTE DA SEMANA PASSADA, PAGA, e ela me desmente.** O banco
  voltou. Dos 6 relatos de "app fechou sozinho" nos últimos 10 dias, **5 são
  de aparelho e 1 é da web**: iOS 2.1 com 3, iOS 2.4 com 1, Android 1.8 com 1,
  web 1.8 com 1. A leitura de 07/09 ("todos da web") valia para os relatos
  daquela época, não para estes. A concentração é no iOS 2.1, que tem 14
  aberturas de 4 identidades distintas na janela: 3 fechamentos ali não é
  ruído. Desde a 2.5 (13/09), zero fechamentos novos, o que é direção e não
  prova, porque a amostra é pequena.
- **O erro mais frequente está CONSERTADO E REPRESADO.** 10 dos 17 erros são a
  mesma mensagem, todos do Android 2.5: token de push pronto sem sessão. O
  conserto é de 15/09 (decisão do dono: o registro passa a pertencer ao
  aparelho quando não há conta) e está na 2.6. **A 2.6 não está publicada**, e
  a loja mais nova é a 2.5, que é justamente a que emite. Não é erro morto que
  a janela de 7 dias ainda mostra: é erro vivo com conserto pronto esperando
  publicação. Os 3 aparelhos Android já na 2.6 não emitiram nenhum, o que com
  3 aparelhos serve de direção e de nada mais.
- **Limite da fonte, e ele muda leitura**: `app_erros` não tem NENHUMA coluna
  de identidade. "10 ocorrências" pode ser uma pessoa insistindo ou dez
  pessoas, e as duas pedem reações opostas. Recomendado ao Analista.
- **NÃO reconferi** receita, cupom, webhook nem assinantes: fechadas na tabela
  e sem motivo novo. A verificação da primeira cobrança real segue agendada
  para 01/10.
- **Conta do dinheiro (parada obrigatória do manual)**: `assinaturas_conferencia`
  devolve 3 `ok` e 1 `cortesia, nao e venda`. Nada fora dessas duas, ou seja,
  nenhuma venda perdida pela medição e nenhuma em dobro. A segunda metade
  (abrir a fatura e olhar `amount_paid`) NÃO rodou: a integração do Stripe
  pede autorização nesta sessão. Como a primeira cobrança real é 01/10 e a
  verificação está agendada, isso não muda decisão desta semana.
- Saúde: bateria `conferir` inteira, build do site e `build:native`, todos
  verdes. Nenhuma linha de código mudou nesta rodada.
- **Correção de rota minha**: publiquei o artifact sem as etiquetas MEDIDO,
  DEDUZIDO e TEORIA do direcionamento 12, e sem a conta do dinheiro. Reli o
  manual, republiquei com as duas coisas. Fica a nota de que o preâmbulo novo
  do manual (as três perguntas) tem que ser lido ANTES de escrever, não
  depois.

## 2026-09-15 · ASO & Lojas: as 8 primeiras avaliações, e o feed da Apple que fala uma vez a cada muitas
- Segunda rodada deste papel. Artifact "Lojas da quinzena":
  https://claude.ai/artifact/CKg35yL9VaXnCKVxjrXAUz
- **Chegaram as primeiras avaliações: 8, todas 5 estrelas** (5 na Play, 3 na
  App Store), de 7 autores, porque Luana David aparece nas duas lojas. As 8
  estavam com `respondido = false` no banco, nenhuma respondida desde 02/09.
- **Os 7 rascunhos de resposta estão em `docs/lojas/respostas.md`**, medidos
  contra o limite de cada loja (a Play corta em 350; a maior das minhas tem
  302). Ao colar, marcar `respondido = true`, senão a próxima rodada escreve
  tudo de novo. A oitava não tem rascunho de propósito, pelo motivo abaixo.
- **PERGUNTA PARA O DONO, e é o único bloqueio desta rodada:** a avaliação
  "Economia no bolso" da App Store é de `Moraes455`. O nome bate com o
  sobrenome do dono e o número com o e-mail dele. Se for ele, a recomendação é
  apagar pela própria conta que escreveu: avaliação do desenvolvedor no
  próprio app é manipulação de avaliação nas regras das duas lojas. Não
  rascunhei resposta porque empresa respondendo à avaliação que ela mesma
  escreveu não se desfaz depois. Se for homônimo, escrevo na próxima rodada.
- **O conserto de 01/09 rendeu na manhã seguinte, com prova:** a primeira
  execução depois dele (8420, 02/09, 10h) gravou as 3 avaliações da App
  Store, que o parser antigo teria descartado em silêncio.
- **ACHADO DA RODADA: o feed público da Apple entregou UMA vez em 15 dias.**
  Em 02/09 veio com as 3; em todos os 13 dias seguintes, inclusive hoje
  (execução 8561), respondeu 200 com o envelope VAZIO, 409 bytes, sem
  `entry`, enquanto as 3 avaliações continuam publicadas na loja. Feed vazio
  da Apple não diz nada sobre a loja. Jeito rápido de ler 15 dias sem abrir
  execução por execução: a que gravou dura 1,6 s e as vazias duram 0,2 s,
  porque só a que tem avaliação faz o POST.
- Consequência prática: avaliação nova na App Store pode ficar semanas sem
  chegar até nós, e responder três semanas depois não é responder. RECOMENDO
  passar a coleta da Apple para a API do App Store Connect, que já tem
  credencial viva no workflow "Analista: metricas externas" (é ela que traz
  as versões todo dia). É obra do Analista, não deste papel, e por isso fica
  como recomendação e não como conserto.
- **A Play está saudável, e isso também foi provado:** o braço
  `Play: avaliacoes` rodou hoje às 8h30 (execução 8559) e devolveu vazio
  porque não houve avaliação nova nos últimos 7 dias, que é toda a janela que
  a API da Play oferece. Lá, avaliação não coletada na semana some para
  sempre. Correção ao relatório de 01/09, que dizia faltar a credencial da
  Play: ela existe e funciona, e está registrado no manual desde então.
- **4 depoimentos REAIS liberados para a LP**, com texto exato, nome e
  contexto, em `docs/lojas/respostas.md`. A seção `social.items` de
  `strings.pt.ts` e `.en.ts` está vazia de propósito desde agosto esperando
  exatamente isso. Ressalva registrada: o "economizei quase 40%" da Triplyze
  só pode aparecer como fala da pessoa, entre aspas e com nome; virar título
  de página transforma experiência de usuário em promessa da empresa.
- Varredura de prova social fabricada feita com `grep`, como manda o manual: o
  inventário continua o mesmo de 01/09 (onboarding, paywall e
  `LandingDownload.tsx`). NÃO reabri como prioridade, respeitando o
  direcionamento do dono. Registro só o fato novo: o "4,8" inventado com
  rótulo "média das avaliações" agora é menor que a média real, que é 5,0.
- **PROPOSTA DA QUINZENA: a ficha promete garagem ilimitada no grátis.** O
  bloco PREÇO diz "cadastro de veículos" e o app para em 2
  (`LIMITS.freeCars`, em `lib/app/premium.ts`). Ninguém tinha conferido o
  texto contra o código desde que a ficha nasceu. A prova de que confunde
  está numa avaliação desta quinzena: a Triplyze escreveu, elogiando, "bom
  que é grátis para 1 carro". Proposta em `docs/lojas/ficha.md`, com critério
  de volta atrás em 15/10.
- O argumento de por que agora: com 8 avaliações, UMA nota 1 leva a média de
  5,00 para 4,56 e duas levam para 4,20. Com amostra deste tamanho, evitar uma
  decepção vale mais que atrair dois downloads, e custa uma frase. A regra 2
  da própria ficha ("o que o app NÃO faz aparece") já mandava fazer isso.
- **JANELA ABERTA HOJE:** a metade da Apple da proposta de 01/09 (nome e
  palavras-chave) só muda junto com envio de versão. A 2.5 foi aprovada, a
  fila está livre e a 2.6 está pronta e ainda não foi enviada. São dois
  minutos na mesma tela do envio. Já passou batido em dois envios à Apple: a
  1.6 (aprovada em 01/09) e a 2.5 (aprovada hoje).
- Nada de tendência de reclamação para o QA nesta rodada: não existe nenhuma
  nota de 1 a 3 até hoje, nas duas lojas.
- Recomendações: (1) colar as 7 respostas, a mais antiga espera desde 02/09;
  (2) levar nome e palavras-chave da Apple junto com a 2.6; (3) trocar o feed
  público da Apple pela API do App Store Connect na coleta de avaliações.

## 2026-09-15 · Conteúdo & SEO: a busca virou família, e o 5º guia é de bateria
- Artifact "Conteúdo da semana":
  https://claude.ai/artifact/TaQ7svo2v52TzDYff65EFP
- ENTREGA DA RODADA (formato a, guia de palavra-chave):
  `/bateria-do-carro-descarregando`, irmão direto do `/carro-nao-pega`.
  O recorte é outro de propósito: o de partida responde "não liga AGORA",
  com a pessoa na garagem; este responde o que faz a pessoa voltar a
  procurar DEPOIS da chupeta, que é "por que ela vive arriando?".
- O método é o mesmo que funcionou no de barulho: estreitar em vez de
  listar peça. Aqui quem estreita é QUANDO ela arria, e isso separa quase
  sozinho os três suspeitos que se confundem (bateria no fim, alternador
  não recarregando, consumo parasita). Cinco blocos: dias parado, de um dia
  para o outro, só de manhã, luz acesa andando, e pega na chupeta e arria
  de novo. Trocar bateria quando era um dos outros dois é o erro mais caro
  do assunto, e só aparece quando a bateria nova arria também.
- O NÚMERO QUE DECIDIU, e é a releitura que o feedback mandou acompanhar.
  Search Console, janela de 28 dias: 01/09 tinha 2 impressões e 1 consulta
  (só marca); 08/09, 7 impressões e 1 consulta de categoria; hoje, **24
  impressões e 6 consultas de categoria**. Cliques seguem em 0 nas três.
- As 8 consultas listadas somam 15 das 24 impressões, então isto é o topo
  da lista e não a decomposição completa. Marca: `mentorque` 4 imp pos 1 e
  a variante com operadores 1 imp pos 1. Categoria: `carro da partida mas
  não pega` 4 imp pos 71, `nao pega` 2 imp pos 53, `carro não pega` 1 imp
  pos 42, `carro nao quer pegar` 1 imp pos 80, `luz do motor acesa` 1 imp
  pos 54, e `luz injeção vermelha` **1 imp pos 19**, que é a primeira
  consulta de categoria a chegar na página 2.
- Leitura: a família de partida é a maior (4 consultas, 8 impressões) e o
  `/carro-nao-pega`, de 04/09, é quem responde por ela. É o primeiro sinal
  concreto de que um guia atraiu busca de categoria.
- CONTINUA SEM RESPOSTA, e a ação não é deste papel: qual PÁGINA recebeu
  cada impressão. O campo `topPaginas` ainda não existe no pacote do
  coletor; o manual registrou em 08/09 que depende de credencial escolhida
  no nó do n8n, e está na lista do dono.
- CORREÇÃO DE RUMO, minha: a fila de 08/09 propunha
  `/carro-puxando-para-um-lado`, com o argumento de atravessar os três
  sistemas que o catálogo ignora. O argumento é verdadeiro e é o argumento
  ERRADO para esta superfície. Guia de site se escolhe por demanda de
  busca; equilíbrio de sistema é critério do catálogo do app, e foi lá que
  ele se aplicou certo (aula de freio, 08/09). O critério de releitura que
  eu mesmo escrevi previa "mais guias, um por rodada" se aparecessem novas
  consultas de categoria, e ele disparou três semanas antes de 06/10.
- ACHADO DE PROCESSO, e ele custa tempo do dono: rodei os DOIS builds (site
  e app) porque meu manual mandava, e isso virou cerimônia desnecessária. A
  `conferir:guias` já confere o SO_NO_SITE guia a guia (linha 230), que é
  exatamente o que o `build:native` pegaria. Manual corrigido para o regime
  do CLAUDE.md: `npm run conferir` e pronto, também em rodada de guia.
- Conferências: `npm run conferir` inteiro exit 0, com `npm ci` antes (a
  armadilha do node_modules velho que registrei em 08/09). O guia sai
  indexável, com canonical certo, no sitemap com `lastModified` e com
  `Article` nos dados estruturados, conferido no HTML gerado.
- Próximas: (1) pauta do amortecedor, aberta desde 08/09 e formato certo
  para a semana que vem; (2) artigo do catálogo sobre suspensão, fechando o
  mesmo ciclo do freio. O recorte do catálogo não mudou: 107 aulas
  publicadas, suspensão com 2 e nenhuma sobre o que ela avisa, e freio mais
  suspensão mais pneu em 9 de 107.

## 2026-09-15 · Engenharia: o retrato voltou inteiro, e o caso do /api/dados fecha
- Conferência agendada por mim ontem, cumprida hoje. O retrato das 6h
  (09:00:06 UTC) saiu COM DADOS pela primeira vez desde 11/09: zero
  ocorrências de `"error"` no JSON, `falhas: {}`, e o `estadoDaBase`
  preenchido (30 contas, 16 com carro, 4 com serviço, 9 ativas em 7 dias),
  que era nulo em todos os retratos desde 01/09.
- **Quanto levou, e qual consulta pesou: nenhuma.** 1.319 ms dentro da rota,
  dos quais 788 ms no bloco paralelo. A mais lenta foi `funil_semana` com
  532 ms. Não há consulta pesada para consertar; o que havia era a fila de
  conexões da API da Supabase estourando com 12 pedidos de uma vez, e três
  por vez resolveu. A suspeita de ontem sobre as views (`retencao_coortes`,
  `anomalias_da_operacao`) está descartada por medição: 14 ms e 5 ms no
  EXPLAIN, 179 ms e menos na rota.
- O Analista levou 6,4 s de ponta a ponta (execução 8560), contra 19 a 21 s
  nos dias quebrados. A Vercel registrou `GET /api/dados 200` às 09:00:02 e
  nenhum aviso de `dados: consulta lenta`, que só sai acima de 5 s.
- Sem ocorrência nova dos dois erros de produção desde os consertos: o
  estouro de teto parou em 14/09 10:30 e a perda de evento do funil em
  14/09 13:30. **Dez horas de silêncio não são prova**, porque a perda de
  evento acontecia umas duas vezes por dia; a leitura honesta vem no fim
  da semana.
- O que ainda não aconteceu: o Vigia roda 07:30 de Brasília (10:30 UTC) e
  hoje ainda não rodou quando esta conferência foi feita, às 09:16. As
  conferências novas dele (retrato do dia, erro dentro do JSON, `falhas`,
  tempo acima de 10 s) foram provadas à mão ontem nos dois sentidos, mas a
  primeira rodada AGENDADA delas é a de hoje. Check-in remarcado para
  depois dela.

## 2026-09-14 · Engenharia: a 2.6 preparada, e a 2.5 já tinha viajado sem ninguém anotar
- O dono perguntou se estava tudo certo para subir a versão nova. A primeira
  coisa que a pergunta encontrou não foi um defeito de código, foi uma
  **mentira da conferência**: `conferir:versoes` respondia "2.5, ainda não
  publicada", e a 2.5 estava na Apple em WAITING_FOR_REVIEW desde 13/09
  11:20 (Pacífico) e já rodando em Android (61 eventos de `2.5.0` entre 13
  e 14/09). A prova veio do banco (`metricas_diarias`, fonte
  `app_store_connect`, e `funil_eventos`), não da lembrança de ninguém.
  Um build gerado hoje teria morrido no fim do caminho, com a Apple
  recusando o nome repetido. É exatamente o estrago da 1.8, e a linha da
  ação do dono que mandava anotar estava aberta desde 07/09.
- **"2.5" entrou na lista `JA_PUBLICADAS`** com a prova junto, e a linha
  saiu de `acoes-do-dono.md` (11 na lista agora). A conferência foi provada
  nos dois sentidos: com a versão em 2.5 ela REPROVOU ("JÁ FOI PUBLICADA"),
  e depois de subir para 2.6 ela aprovou.
- **A versão subiu para 2.6 nos três lugares.** O motivo não é escolha, é
  aritmética: 28 arquivos de `lib/app` e `components/app` mudaram depois de
  as notas da 2.5 serem escritas (orçamento por foto, caderno de gastos,
  datas do carro, resumo do mês, modo motorista, calendário da placa).
  Mandar isso chamando de 2.5 cegaria `funil_eventos.versao` e
  `app_erros.versao` para a diferença entre os dois binários, que é o mesmo
  estrago da 1.8 em outra roupa.
- **Bateria completa, porque é release de loja** (a regra das duas
  velocidades manda): cadeia `conferir` inteira verde de ponta a ponta, 18
  suítes de navegador em 828 s sem reprovação, e build local limpo. A
  bateria pegou UMA regressão minha de hoje: `conferir:gravacao` reprovou
  na rota do funil, porque o `{ error }` tinha saído de perto do `insert`
  quando entrou o tentar de novo. Consertei o código em vez de afrouxar a
  regra, e a conferência do funil foi reapertada junto.
- Nada nativo mudou desde o build da 2.5: a última mexida em `ios/` foi o
  AppDelegate de 12/09, que já viajou. Então a 2.6 não acrescenta exigência
  de plugin, mas HERDA a que a 2.5 nunca cumpriu: o token de push do
  iPhone continua sem nenhum aparelho para provar. Isso está escrito no
  roteiro da 2.6, com a consulta ao banco que responde.
- **O que a conferência NÃO alcança, e por isso não digo que está tudo
  certo:** a câmera dentro do WebView, o token de push do iPhone, os avisos
  locais das datas, e as duas variantes dos testes A/B no app das lojas.
  Sobre o binário da 2.6: sem sinal ainda, porque ele nem existe.
- Decisão que é do dono: na Apple não cabem duas versões na fila. Ou espera
  a 2.5 ser aprovada, ou retira a 2.5 e manda a 2.6, que carrega tudo o que
  a 2.5 carrega. E fica a pergunta de se a 2.5 está na faixa de produção da
  Play, porque se estiver, o `/api/app/latest` está apontando para a 2.4 e
  ninguém está sendo avisado da versão nova.

## 2026-09-14 · Engenharia: as três prioridades do Diretor, com prova de cada
- **Placar da rodada de hoje, na ordem em que o Diretor pediu.**
- **P1, parar a perda de evento no funil: FEITA** (commit 077f9b9). A prova
  que faltava no relatório dele: o caso não parou em 13/09, teve mais um
  hoje às 13:30 UTC, com "Bad Gateway", em cima do deploy mais novo. São
  seis eventos de seis pessoas. O insert do `/api/funil` passou a tentar
  três vezes quando a ponte engasga, e a regra de o que é engasgo e o que é
  recusa do banco virou peça pura (`lib/transitorio.ts`), usada também pelo
  `/api/dados`. `conferir:funil` ganhou 15 casos e reprovou com três
  defeitos plantados.
- **P2, reconectar o banco na organização certa: FEITA pelo dono**, e
  conferida aqui: o projeto `ajaxhsvjvmqtiyzelgrd` responde a SQL, EXPLAIN
  e logs. Foi ela que destravou o diagnóstico de verdade das outras duas.
- **P3, a Sentinela vigiar retrato vazio e tempo de resposta: FEITA no Vigia
  de anomalias**, que é quem roda diariamente e já manda e-mail. E o motivo
  exato de ele ter ficado calado três dias apareceu: **ele conferia a rota
  às 7h30, e às 7h30 a rota estava boa**; quem quebrava era a coleta das
  6h. Porta aberta não é entrega feita, de novo. Agora ele lê o próprio
  `docs/dados/retrato.md` no GitHub e cobra a entrega do dia (não gerado
  hoje, ou gerado com `"error"` dentro), mais `falhas` e `tempos.total`
  acima de 10 s, que é o aviso ANTES de virar 504.
- Provado nos dois sentidos, com dado real: apontando o Vigia para o
  retrato íntegro de 11/09 ele acusou só a idade ("o último é de
  2026-09-11, 3 dias atrás") e não o erro; no retrato de hoje acusou só o
  erro e não a idade. E o primeiro ensaio pegou um alarme falso meu: o nó
  entrega o texto em `data`, não em `body`, e sem o ensaio o Vigia gritaria
  "não consegui ler o retrato" todo santo dia. Alarme falso diário é pior
  que silêncio, porque ensina o dono a ignorar.
- O que NÃO está coberto, e fica dito: se a requisição do app morrer antes
  de chegar ao nosso servidor, o evento continua se perdendo, porque o
  cliente é fire-and-forget e marca o aparelho antes de enviar. Não sei
  quantas vezes isso acontece (`apiPost` engole o erro sem contar), e "não
  sei" não é "não tem". O conserto seria uma fila no aparelho, que pede
  build; entra como candidato, não como feito.

## 2026-09-14 · Diretor: RODADA INTERROMPIDA, e a medição está fora do ar
- Artifact "Semana Mentorque" (incompleto, de propósito):
  https://claude.ai/code/artifact/71abe88f-ca04-4615-88cc-c5a960becc8a
- **A semana NÃO foi fechada**, pelo direcionamento do dono de 31/08: sem o
  banco respondendo, o Diretor para e avisa. Hoje valeu em dobro, porque o
  retrato também está quebrado. Fechar a semana com as duas fontes fora do ar
  seria inventar.
- **INCIDENTE 1, o mais grave, e estava de pé sem ninguém ver: o funil está
  PERDENDO EVENTO.** Erros de execução da Vercel, 7 dias: `[funil] insert
  recusado { evento: 'comecou_onboarding', motivo: 'Gateway Timeout' }`, 5
  ocorrências de 5 pessoas distintas, rota /api/funil, de 12/09 11:00 a 13/09
  13:15. Evento não gravado não volta.
- **INCIDENTE 2: /api/dados estoura o teto de 15s desde 12/09.** 4
  ocorrências, a última HOJE às 10:30. Consequência direta: o retrato saiu
  VAZIO em 12, 13 e 14/09. Conferido arquivo por arquivo no git: íntegro até
  11/09, com `"error": {"code": "504"}` dentro do JSON nos três seguintes.
- **O retrato de hoje afirma zero assinaturas, zero cadastros, zero de tudo.**
  Nada disso é verdade. Em 11/09 eram 4 assinaturas no banco, 3 no Stripe,
  MRR de tabela R$ 89,70, 45 usuários ativos e 11 fontes coletando. É o pior
  tipo de erro de medição: não parece erro, parece notícia.
- **NINGUÉM PERCEBEU.** 106 commits na semana, três deles depois do retrato
  começar a sair vazio, e nenhuma entrada do diário menciona o problema. A
  Sentinela não avisou porque ela confere se a rota RESPONDE, e ela responde;
  quem está mudo é a gravação e a agregação. Mesma lição do webhook do
  Stripe, em outra roupa.
- SUSPEITA, escrita como suspeita: nenhuma das duas rotas mudou de código. O
  que mudou foi volume e variedade (vários tipos de evento novos entraram esta
  semana, o tráfego pago continua, e em 07/09 já houve aperto de cota por uma
  coluna de embedding). A leitura provável é agregação lenta estourando o teto
  e escrita disputando espaço. Confirmar no banco: tamanho da tabela, índices
  únicos parciais de 27/08, e qual consulta está lenta.
- **INCIDENTE 3: o Supabase desta sessão aponta para OUTRA CONTA do dono.** O
  `list_projects` devolve Inglês20minutos e bolaonacopa; o projeto Mentorque
  (ajaxhsvjvmqtiyzelgrd) não aparece. Não é falta de permissão dentro do
  projeto, é organização errada autorizada. Stripe também pede autorização
  nova e não dá para autorizar de dentro de rotina.
- SINAL PARCIAL da semana (4 dos 7 dias, do retrato íntegro de 11/09, SEM
  conferência no banco, e por isso não é fechamento): 6 contas novas contra 8;
  gasto R$ 227,29 contra R$ 194,01; ZERO assinaturas novas contra 1;
  frequência 1,6 contra 2,5 aberturas por usuário; 12 erros contra 6.
- BOA NOTÍCIA, com o tamanho certo: apareceu o PRIMEIRO RETORNO de coorte da
  história. 1 das 6 contas novas voltou entre o 1º e o 7º dia, e 1 das 8 da
  semana anterior também. São duas pessoas, não é tendência, e foi na semana
  em que a jornada de e-mail foi ligada (18 e-mails em 12/09, 3 em 13/09).
- Prioridades: (1) parar a perda de evento no funil, que é a única com custo
  crescente por hora; (2) reconectar o banco na organização certa; (3) a
  Sentinela passar a vigiar retrato vazio e tempo de resposta da rota de
  dados, porque porta aberta não é entrega feita.

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
| O cadastro pelo app funciona? | **Nos dois, desde 10/09.** No Android nunca tinha funcionado (4 semanas, 160 eventos, zero com conta). A causa final, provada pela linha da 2.3: o certificado que assina o app no Play (SHA-1 `E5:1C...`) não estava cadastrado no Google Cloud. Cadastrado em 10/09 pela manhã, a mesma 2.3 logou às 10:19 UTC. | 10/09, Engenharia |
| O sitemap, os canonical e os redirecionamentos do site estão certos? | **Estão**, conferidos um a um em 07/09: 11 URLs no sitemap, todas `www` e 200; canonical de cada página apontando para ela mesma; apex 308 para `www` num pulo; atalhos de venda 307 num pulo para `/app`, que é noindex. O que faltava era link interno, não configuração. Em 13/09 o Search Console mostrava "erro de redirecionamento" em `mentorque.com.br/barulho-no-carro`: é rastreio de 01/09, nunca repetido; conferido em 13/09 pela Vercel, o apex responde 308 num pulo para a `www`, que responde 200 com canonical próprio. As 7 "detectadas, não indexadas" são as 7 páginas do sitemap que o Google ainda não rastreou (4 de 11 indexadas). Ação é do dono: "Validar correção" e "Solicitar indexação" no console. | 07/09 e 13/09, SEO |
| Por que o toggle de avisos não fazia nada? | Ele só levava aos ajustes quando o sistema já tinha negado DE VEZ; nos outros nãos o toque era mudo. E a preferência guardada podia discordar da permissão do sistema, estado em que todo agendamento desistia calado. Consertado em 07/09. | 07/09, Engenharia |
| Por que a migalha de fechamento não pega o crash do Android? | Porque ela só fala na ABERTURA SEGUINTE, e quem fecha e desiste não volta. Os seis relatos que ela deu eram todos da web, onde fechar o navegador produz a mesma evidência sem ser defeito. | 07/09, Engenharia |
| Quantos assinantes existem de verdade? | **3 pessoas.** A tabela tem 6 linhas: 2 `inactive` e 1 conta de revisão das lojas (válida até 2099) não são clientes. | 04/09 |
| Quando entra o primeiro dinheiro? | **Entrou em 02/10 às 00:53:48 e voltou em 02/10 às 10:40:38.** A fatura do ciclo de 01/10 da `sub_1U8U8h…` foi paga, R$ 29,90, sem desconto, e estornada integralmente 9h47m depois (nota `cn_1UM3tK…`, estorno `re_3ULujQ…` concluído), um segundo após a assinatura ser cancelada na hora. Bruto R$ 29,90, **líquido R$ 0,00**: o produto segue com receita realizada zero. ~~o ciclo seguiu `active`, o que no Stripe só acontece com a fatura do ciclo novo paga~~ esse raciocínio era falso, ver a linha de baixo. | 04/09, 01/10 e 04/10, QA agendado |
| Ciclo adiantado prova que a fatura foi paga? | **Não, e eu deduzi que sim em 01/10.** O ciclo é adiantado na VIRADA e a fatura só finaliza uma hora depois: período novo 23:52:23, fatura criada em `draft` 23:53:10, banco 23:53:13, paga 00:53:48. O intervalo é o atraso padrão do Stripe, 3638 segundos ao segundo nas duas faturas de ciclo que existem (01/09 e 01/10). Cartão recusado viraria `past_due` DEPOIS, com o ciclo já andado. Quem quer provar pagamento olha a fatura. | 04/10, QA agendado |
| O `renovou` consegue dizer quanto entrou? | **Não na virada, e não por defeito de código.** O `faturaDaVirada` (02/10) busca a `latest_invoice` e só aceita `status: "paid"`, recusando `draft` com razão; mas na virada a fatura tem 3 segundos e está em `draft` por mais uma hora. Então toda renovação grava `semValor`. A entrega da fatura (`invoice.paid`, mais dedup pelo id dela) é o único caminho para o valor, e o item foi fechado em 03/10 com um argumento que esta medição contradiz. O `valorDoCheckout` da primeira cobrança NÃO é afetado: lá o pagamento acontece antes do evento. | 04/10, QA agendado |
| O funil registra renovação? | **Não registrava nenhuma, em nenhum lugar, até 01/10.** O webhook do Stripe escrevia `assinou`, `cancelou` e `expirou`; o único `renovou` do projeto era o do RevenueCat, e a loja nunca vendeu. Então `renovacoes 0` significava "ninguém mediu", não "ninguém renovou", com `funilCorreto.ts` declarando o evento mensurável desde 22/08. Desde 01/10 quem escreve é a virada de ciclo em `/api/stripe/webhook` (o endpoint tem quatro eventos e não recebe `invoice.*`), sem valor no evento, com dedup pela leitura do ciclo antes do upsert. **CONTINUA TEORIA, e a prova deixou de existir**: os três assinantes saíram em 02/10, então as renovações de 04/10 e 09/10 não aconteceram (a de 04/10 confirmada na fonte: a assinatura terminou às 13:20:18 em vez de virar). A rede que sobrou é o `cicloVencido` de 02/10, que acusa ciclo vencido com status ativo. | 01/10 e 04/10, QA agendado |
| O webhook do Stripe está vivo? | Está. Duas viradas de teste gravadas em 37 segundos, 01/09 e 04/09. | 04/09, QA agendado |
| A captura de UTM está quebrada? | Não, nunca esteve. A consulta é que lia o caminho errado: é `extra->'utm'->>'utm_source'`. | 03/09 |
| Por que a AppsFlyer diz que tudo é orgânico? | Porque é. O SDK está vivo (54 instalações e 55 ativos chegaram lá). O que falta é o link: os botões de baixar apontam para a ficha crua da loja (`lib/stores.ts`), então o clique do anúncio morre no navegador. 100% das UTM do google/cpc estão em `plataforma = web`, zero no android e no iOS. O conserto é um OneLink, e ele nasce no console da AppsFlyer. | 05/09 |
| A campanha do Google traz cadastro de verdade? | **Traz.** Na semana de 31/08 a 06/09, 7 das 8 contas novas carregam `google / lancamento`. A atribuição só existe a partir de 04/09, porque a captura de etiqueta subiu para todas as páginas em 03/09. Custo por conta no pedaço medido: R$ 14,71. | 07/09, Diretor |
| Quantas pessoas o app teve de verdade numa semana? | Contar por `anon_id` NÃO responde isso (é armazenamento, infla a cada instalação). A régua é `auth.users`. Cruzar sempre com a porta de entrada: cliques pagos > anon_id > contas. | 01/09 e 07/09 |
| Por que o mesmo carro vira dois? | Porque a identidade do carro é o `id`, e ele nasce no APARELHO: dois cadastros nunca colidem, e toda a dedup do app é por id. Uma causa para os três caminhos. As telas passaram a avisar em 09/09; em 10/09 a folha de importação passou a PERGUNTAR o que fazer com o carro repetido (juntar num só, só o da conta, só o deste aparelho), por decisão do dono. Vai na 2.4. | 10/09, Engenharia |
| Por que o retrato diário de 12, 13 e 14/09 diz 0 assinaturas, "série de uso vazia" e funil sem dados? | Porque a camada de API da Supabase (PostgREST) respondia 504 a parte das 12 consultas que o `/api/dados` disparava de uma vez (fila de conexões pequena), a rota seguia com aquelas seções vazias e, quando a soma passava de 15 s, a Vercel derrubava a função inteira. O Postgres em si responde em milissegundos. Os três retratos são inválidos; `subscriptions` continua com os mesmos assinantes. Conserto de 14/09: 3 consultas por vez com nova tentativa em 504, campo `falhas` no JSON, teto de 60 s, e o Analista falha em vez de gravar zeros. **RESOLVIDO, conferido em 15/09:** o retrato das 6h saiu inteiro, `falhas: {}`, 1,3 s dentro da rota, nenhuma consulta pesada (a mais lenta, 532 ms). E `estadoDaBase` era nulo em TODOS os retratos desde 01/09 por falta de permissão em `auth.users` (migração `estado_da_base_como_dono`). | 14/09, Engenharia |
| Por que a foto do momento (ou do perfil) aparece quebrada? | O bucket `Avatars` do Storage estava privado e o app grava a URL pública: 400 em toda foto enviada logado. Ligado em 13/09 (`avatars_bucket_publico`); o retrato está em `supabase/storage_avatars.sql`. Se voltar a acontecer, conferir `select public from storage.buckets where id = 'Avatars'` antes de qualquer outra coisa. | 13/09, Engenharia |
| O retrato está vazio ou zerado, é queda de verdade? | **Conferir o JSON antes de acreditar.** Em 12, 13 e 14/09 o retrato saiu com tudo zerado porque `/api/dados` estourou o teto de 15s e o arquivo guardou `"error": {"code": "504"}` no lugar dos dados. Zero no retrato pode ser ausência de resposta, não medição. O jeito rápido: `git show <sha>:docs/dados/retrato.md \| grep '"error"'`. | 14/09, Diretor |
| O "esqueci minha senha" funciona? | ~~Não redefine nada, patch pronto e não aplicado.~~ **CONSERTADO em 20/09**, por ordem do dono, seguindo a proposta e as duas autocorreções dela: `lib/app/recuperacao.ts`, a tela `NovaSenha.tsx`, `definirSenha`/`trocarSenha` no auth e o `emailRedirectUrl()` voltando pela ponte no app nativo. De quebra, o "Trocar senha" do Perfil chamava o MESMO `resetPassword` e também não trocava nada. Falta a prova de aparelho: ninguém abriu o link num celular. | 16/09 achado (QA), 20/09 conserto, `docs/agentes/propostas/recuperar-senha-nao-recupera.md` |
| Os "app fechou sozinho" são da web? | **Não, os atuais são de aparelho**: 5 de 6 nos 10 dias até 16/09 (iOS 2.1 com 3, iOS 2.4 com 1, Android 1.8 com 1). A leitura de 07/09 valia para os relatos daquela época. Zero na 2.5 desde 13/09. | 16/09, QA |
| A lista de termos de busca do Google Ads é de quantos dias? | **De 30, e acumulada**, os 50 mais caros (`segments.date BETWEEN hoje menos 30 dias AND hoje`), enquanto `porDia`, `porCampanha` e `custo7d` são de 8 datas com a de hoje pela metade. Ler termo como "gasto da semana" superestima em umas quatro vezes; o gasto da semana num assunto é a diferença entre duas coletas. E os 50 termos cobrem só 23% do dinheiro: subir o teto esbarra no `MAX_DADOS` de 20.000 bytes da rota `/api/metricas` (413 `pacote_grande`, testado e desfeito). | 19/09, Mídia paga |
| Quantas pessoas voltaram ao app num dia posterior ao primeiro? | **21 de 253, 8,3%**, em 22/09. Separado: quem criou conta 6 de 50 (12,0%), convidado 15 de 203 (7,4%). Sequência mais longa: 7 dias com conta, 25 convidado. **O 253 é ARMAZENAMENTO DE NAVEGADOR, não gente** (a régua `identidade` cai no `anon_id` porque evento de uso não carrega pessoa), então 8,3% é PISO e a taxa real por pessoa é melhor. Mais 29 aberturas sem identidade nenhuma, declaradas. A view canônica `retencao_coortes` dá outro número (3 de 50 em D1-7) porque ancora em QUEM CRIOU CONTA e na data do CADASTRO, não no primeiro uso: perguntas diferentes, mesma ordem de grandeza. Só melhora com build novo, que leva o `user_id` nos eventos. | 22/09 |
| Quantos carros cadastrados existem? | **38 de usuário de verdade**, em 22/09, em 37 contas de fora (63% das 59). A tabela `user_state` tem 42 no total, e 4 são do TIME, em 2 contas nossas. Zero repetidos dentro da mesma conta (conferido). TRÊS armadilhas, e eu caí na terceira: (1) `estado_da_base` responde CONTAS COM CARRO, não carros; (2) o evento `cadastrou_carro` dá 67 APARELHOS, que é armazenamento de navegador, infla a cada instalação e é teto inflado, não contagem; (3) **o total cru inclui o time**, como o 62 de `auth.users` contra os 59 de `contas_criadas_desde`. Carro de convidado vive no aparelho e nunca chega ao banco. | 22/09, corrigida no mesmo dia |
| A alta de "app fechou sozinho" na 2.9 do Android é regressão? | **Não.** A 2.9 ganhou um TERCEIRO ouvinte na migalha de fechamento (o sinal nativo do Android) na mesma versão em que foi publicada: a taxa de 2,9% na 2.8 para 8,3% na 2.9 compara dois instrumentos, não duas versões. A medida que não passa pela migalha (aberturas por aparelho no Android, 14 dias, porque recarregamento de WebView emite abertura) diz o contrário: 2.7 com 1,50, 2.8 com 1,55, 2.9 com 1,47. Desde então a migalha carrega COMO concluiu, e `sem-pausa` continua comparável entre versões. | 30/09, QA |
| Existe venda pelas lojas chegando ao banco? | **Não, e em 25/09 apareceu uma que não chegou.** O RevenueCat tem 1 assinatura ativa desde 25/09; as 3 do banco são todas do Stripe e `funil_eventos` segue sem nenhum evento de origem `revenuecat`. A `assinaturas_conferencia` não acusa, porque compara o que chegou. O que fecha é o painel do RevenueCat (Integrations, Webhooks), fora do repositório. Enquanto isso não for respondido, índice, dedup e tratamento de erro do caminho da loja continuam TEORIA. | 30/09, QA |
| Quais manuais faltam para a Biela? | O primeiro lote subiu em 06/09: 112 manuais, 34.609 trechos, e os DEZ carros mais comuns do Brasil passaram a ter manual (era 3 de 10). Gol 2016 e Ka 2025, de usuários nossos, saíram de zero. Faltam Corsa/Classic e as marcas vazias (Suzuki, Mercedes-Benz, e o EcoSport). | 06/09, `docs/manuais-a-subir.md` |

**Como manter:** ao FECHAR uma pergunta que já custou investigação, acrescente a
linha aqui com a data. Ao descobrir que uma linha destas está errada, corrija-a
aqui e na entrada de origem, com o texto antigo riscado. Esta tabela não é fonte
de verdade sobre os números de hoje: ela diz o que já foi respondido e onde ler.

## 2026-09-14 · Engenharia: o Vigia ficou cego porque o /api/dados estourou o teto
- O dono mandou a foto do e-mail "Vigia Mentorque: 1 alerta": "o /api/dados
  nao respondeu como esperado: o vigia esta cego". Conferido em três
  lugares antes de concluir: o log da Vercel (`GET /api/dados 504, Task
  timed out after 15 seconds`, às 10:30 UTC), a execução do Vigia no n8n
  (o nó da rota levou 16,8 s e recebeu o 504) e o histórico do retrato no
  repositório: os retratos de 12, 13 e 14/09 (6h) trazem
  `"dados": {"error": {"code": "504"}}` e por isso dizem 0 assinaturas e
  funil vazio. Até 11/09 a rota respondia. O Vigia de 12 e 13/09 (7h30)
  passou: a rota respondeu em 8 s (medido na execução de 13/09) e
  reproduzida agora, 11:17 UTC, em 8 s de novo.
- Conclusão que a prova sustenta: a rota está COLADA no teto (8 s num dia
  normal contra 15 de limite) e qualquer manhã mais lenta do banco a
  derruba; é o que aconteceu às 6h por três dias seguidos. O que NÃO sei:
  qual das quinze consultas pesa, porque a integração do Supabase perdeu a
  permissão de rodar SQL nesta sessão (EXPLAIN negado). Suspeitas pela
  leitura: `retencao_coortes` (subconsultas correlacionadas sobre
  funil_eventos com função por linha) e `anomalias_da_operacao` (lateral
  por anon_id); as duas crescem com a tabela, que ganhou eventos novos em
  12/09. Suspeita, não conclusão.
- Feito: (1) o teto do `/api/dados` foi de 15 para 60 s; (2) a rota mede
  cada consulta e devolve `tempos` no JSON, e escreve no log da Vercel
  quando passa de 5 s, para o próximo conserto ter evidência; (3) o
  Analista (n8n, "Monta retrato") passou a falhar quando o /api/dados não
  traz dados, em vez de gravar zeros; o arquivo de ontem fica e o Vigia
  avisa. Os três retratos inválidos ficam no histórico do git com esta
  entrada como correção.
- Medido depois do deploy, com os `tempos` ligados: primeira chamada da
  versão nova 1,6 s (dentro da rota 1,0 s), chamada quente 1,3 s (0,7 s),
  chamada depois de 8 minutos parada 3,2 s (1,2 s; o resto é a função
  acordando). Cada consulta leva uns 600 ms em paralelo, nenhuma se
  destaca. Isto corrige a frase acima: "8 segundos num dia normal" eram
  duas medições (13/09 10:30 e hoje 11:16), e as três seguintes deram 1 a
  3 s. Os 8 s e os mais de 15 s são anomalia de horário, não o custo
  normal da rota, e a suspeita das views perde força. O que sobra:
  alguma coisa do lado do banco nessas horas (banco acordando depois da
  madrugada, manutenção da Supabase por volta das 6h). Suspeita, não
  conclusão.
- ~~O que a conferência não alcança: a hora lenta é às 6h.~~ Com o Supabase
  reconectado pelo dono, a causa apareceu nos logs, e não era hora nem
  banco. **As consultas levam milissegundos no Postgres** (EXPLAIN: a
  view mais pesada, 14 ms; a tabela de eventos tem 1.079 linhas). Quem
  falha é a camada de API (PostgREST): o log de borda mostra `504` para 8
  das 12 consultas disparadas de uma vez às 6h, 4 às 7h30, 6 às 11h17, e a
  rota SEGUIA com aquelas seções vazias, sem avisar. É o "Timed out
  acquiring connection from connection pool" do PostgREST: 12 pedidos
  simultâneos numa fila pequena. Os retratos de 12 e 13/09 com "série de
  uso vazia" e "funil sem dados" eram isso, não ausência de uso.
- Segundo defeito, deste desde 01/09: `estado_da_base` e
  `contas_criadas_desde` liam `auth.users` como service_role, que não tem
  SELECT nela, e respondiam 403 em toda chamada ("permission denied for
  table users" no log do Postgres, duas vezes por rodada). `estadoDaBase`
  foi nulo em TODOS os retratos desde que nasceu, e o cadastro do funil
  caía no evento, que subconta. Migração `estado_da_base_como_dono`: a view
  sem security_invoker e a função SECURITY DEFINER, as duas só para o
  service_role, devolvendo contagens.
- Conserto na rota: no máximo 3 consultas por vez, até 3 tentativas com
  pausa quando a API responde 503/504, e o campo `falhas` no JSON com o
  erro de cada consulta (seção com falha é buraco, não zero). Medido
  depois do deploy (21:55 UTC, primeira chamada da versão nova): 2,0 s de
  ponta a ponta, 1,2 s dentro da rota, `falhas` vazio, as 12 consultas
  inteiras, `estadoDaBase` com 30 contas (16 com carro, 4 com serviço, 9
  ativas em 7 dias) e o cadastro do funil em 22 pela `auth.users`, contra
  20 pelo evento. Amanhã às 6h15 a conferência agendada lê o retrato das
  6h e fecha o caso, ou reabre.

## 2026-09-13 · Engenharia e CRO: a rotina do carro, peça 1 no ar
- O dono perguntou como o app se sai nos três critérios (problema
  recorrente, mercado mensurável, monetização clara) e depois "como resolver
  dores mais recorrentes". A resposta: a recorrência não vem da mecânica,
  vem do dinheiro e das datas. Quatro peças aprovadas: caderno de gastos,
  datas do carro, resumo mensal, modo motorista de aplicativo. O CRO decidiu
  o lugar de cada uma em `docs/agentes/propostas/rotina-do-carro.md` e as
  quatro estão no caderno de experimentos como mudança direta, com a régua
  nova de rotina: pessoas com lançamento em duas semanas seguidas.
- Peça 1 construída: `Abastecimento` no store (sobe para a nuvem com o
  resto), `lib/app/combustivel.ts` puro (custo por km com dois pontos e o
  primeiro tanque de fora; consumo; semana e mês; km só para frente), a
  tela com a devolução na hora, o card "Custo do carro" no Início abaixo do
  carro, as linhas no histórico com a soma do mês grátis, combustível no
  relatório Premium, evento `registrou_abastecimento` (restrição do banco
  recriada). Registrar carimba o km e a data do km: quem abastece pelo app
  não recebe mais a pergunta mensal.
- Conferência: `conferir:combustivel` (28 casos) reprovou com o primeiro
  tanque contando; a suíte de navegador `combustivel` (17 casos) prova do
  card até apagar no histórico. Tropeço útil: a folha do primeiro quiz
  abre por cima do Início e engole o toque no card; a suíte semeia o quiz
  respondido, como a de km já fazia. O `.next` velho do build nativo
  derrubou o servidor de desenvolvimento de novo (`rm -rf .next`).
- Web no ar pelo push; lojas na 2.6. Sobre o app das lojas: sem sinal ainda.
- Peça 2 construída em seguida: `Vehicle.datas` (IPVA, licenciamento,
  seguro, CNH, com valor opcional), `lib/app/datasDoCarro.ts` puro (dias
  inteiros, três avisos por data só no futuro, ids fixos 8 a 19, o Início
  só a 30 dias ou vencida há até 60), `lembreteDatas.ts` sincronizado na
  abertura e a cada mudança de data, o card no calendário de revisões, o
  card no Início abaixo do custo do carro, o sexto passo do Diagnóstico.
  `conferir:datas` reprovou com as antecedências trocadas; a suíte `datas`
  (11 casos) prova do calendário ao Início. O gatilho da jornada por e-mail
  fica para a peça 3, que mexe na jornada de qualquer jeito. Sem rota no
  aviso: a lista de rotas é fechada e o toque cai no Início, onde o card
  está. Ligar avisos ao salvar a primeira data também ficou de fora nesta
  rodada (o convite tem momentos fixos); candidato para a próxima.
- Peça 3 construída: `lib/app/resumoDoMes.ts` puro (mês anterior, soma de
  combustível e serviços do mês fechado), o card do mês no Início na
  primeira semana (só com lançamento), e a jornada com duas chaves novas:
  `mes` (dias 1 a 3, família "resumo", só para quem tem lançamento ou data;
  o e-mail traz combustível, serviços, custo por km e o que vence em 30
  dias) e `vence:data` (30 dias antes, a cada 60, nunca depois de vencida,
  sem inventar valor de multa). Ordem: gatilho, resumo, cadência, sazonal.
  A cópia de prova (`POST teste`) aceita `vence:ipva` e `mes`.
  `conferir:jornada` reprovou com três defeitos plantados (janela 5 dias,
  vencida virando e-mail, resumo na frente do gatilho). Dois testes novos
  nasceram frouxos e foram apertados: um casava "R$ 1.200 ... multa" (o
  valor era do IPVA, legítimo) e outro datava o serviço em relação a hoje,
  não ao dia avaliado. Tropeço meu: um `git checkout` do arquivo, para
  desfazer um defeito plantado, apagou a mudança inteira antes do commit;
  recuperada do registro da sessão. Lição gravada: defeito plantado se
  desfaz com cópia de segurança, nunca com checkout de arquivo sujo.
- O primeiro `mes` possível sai em 01/10; o `vence` já sai amanhã para
  quem tiver data a 30 dias. Web no ar pelo push; o card, nas lojas com a
  2.6.
- Peça 4 construída como MODO (o público principal segue decisão do dono,
  e o interruptor não muda posicionamento): `Session.motoristaDeApp` e
  `ganhos` (dia de trabalho: recebido e km rodados, sem carimbar o
  odômetro), `lib/app/motorista.ts` puro (custo do dia = km × custo por km;
  custo por km = combustível dos abastecimentos + reserva de manutenção,
  que só entra com serviço com valor e 500 km registrados em 12 meses; sem
  dois abastecimentos NÃO há custo, e a conta diz que falta), o interruptor
  no Perfil abaixo dos avisos, o card do Início trocando "custo do carro"
  por "hoje: ganhou, custou, sobrou" com "Lançar o dia" e "Abasteci", a
  tela `Ganhos.tsx` com a devolução na hora, as linhas no histórico, o
  lucro por km no card e no e-mail do mês. Evento `lancou_ganho`
  (restrição do banco recriada: `funil_eventos_ganho`). `conferir:motorista`
  (37 casos, reprovou com a trava dos 500 km tirada e com custo inventado
  sem abastecimento) e a suíte `motorista` (17 casos, dois deles provando
  que sem abastecimento a conta não inventa custo). A leitura, em 11/10:
  contas com o interruptor ligado e cinco dias de lançamento por semana.
- O dono perguntou de onde vêm as datas de IPVA e seguro (resposta: só do
  que a pessoa digita) e mandou "fazer a automatização do IPVA e final da
  placa". Construído: `lib/app/calendarioDaPlaca.ts`, uma tabela por
  estado, tipo e ano com a fonte de cada calendário, e `sugestaoDeData`
  (exata quando o calendário do ano ainda tem a data à frente; estimada,
  projetando o dia do último calendário conhecido, quando já passou). A
  folha das datas pede estado e final da placa (o cadastro do carro nunca
  pediu placa, e a área é congelada pelo A/B), guarda os dois e sugere; a
  linha passa a oferecer a próxima data com "Usar". A estimativa é marcada
  no calendário, no Início, no aviso do aparelho e no e-mail da jornada,
  pedindo para conferir no Detran. Dados: IPVA de SP (exato, por final),
  MG (pares de finais em fevereiro), RS (data única 30/04) e SC (fim do
  mês do final); licenciamento de SP (julho a dezembro) e RJ (julho a
  setembro). RJ e PR ficaram de fora do IPVA: o proxy bloqueia os sites das
  Fazendas e as fontes legíveis discordam do dia por final; o agente de
  pesquisa que abri para os 27 estados caiu por limite da API. Pedido ao
  dono: a tabela de RJ e PR, ou liberar o domínio das Fazendas no proxy.
  `conferir:datas` ganhou 23 casos (a projeção, o dia do vencimento, a
  tabela completa por final, as ligações), reprovou com a projeção sem a
  marca de estimada e com um final faltando na tabela; a suíte `datas`
  ganhou 12 (de "Usar" à folha sem calendário).

## 2026-09-13 · Engenharia: a foto das memórias (e do perfil) quebrada era o bucket
- Relato do dono, com foto: o card "Primeira viagem" com o ícone de imagem
  quebrada no círculo, "igual estava acontecendo com a foto do perfil".
- Conferido no banco, não no chute: o bucket `Avatars` do Storage estava
  com `public = false`, e o app grava a URL PÚBLICA (getPublicUrl) na
  sessão. A rota `/object/public/` responde 400 para bucket privado, mesmo
  com a policy `avatars_public_read` existindo desde o início. O único
  objeto do bucket era a foto do momento do dono, subida às 16h03 de
  Brasília: o upload funcionava, a leitura não. Foto de perfil enviada pelo
  app passava pelo mesmo caminho, e por isso o Perfil já tinha o `onError`
  caindo para a inicial.
- Conserto: migração `avatars_bucket_publico` liga o interruptor (o desenho
  sempre foi leitura pública por URL não listável, com o UUID na pasta);
  `supabase/storage_avatars.sql` vira o retrato do que tem que existir. Na
  tela, o card do momento ganha `onError` para o emblema e `no-referrer`,
  como o Perfil. O que a rede daqui não alcança: abrir a URL para ver o 200
  (o proxy bloqueia o domínio do Supabase e o do site); a prova é o dono
  abrir Memórias de novo. A foto que ele já subiu não precisa ser
  reenviada: a URL guardada é a mesma, só passou a responder.

## 2026-09-13 · Engenharia: análise de orçamento por foto, no ar na web
- Prova em produção (19h23 UTC), pelo n8n, com o orçamento sintético em
  `public/provas/orcamento-prova.jpg`: 200, sete linhas lidas com os
  valores certos, oficina e total, faixa de Campinas/SP, "atenção" pedindo a
  marca da pastilha e a checagem dos discos, e nenhuma frase acusando a
  oficina. As linhas de prova em `app_erros` e em `orcamentos_analisados`
  foram apagadas. A rede deste ambiente passou a bloquear o domínio do site
  no meio do dia, e a prova foi feita pelo n8n por isso (fluxo "Mentorque:
  prova do orçamento por foto", não publicado).
- O que a prova ensinou e já mudou: o modelo marcou óleo, filtro e mão de
  obra com `oil`, e a comparação linha a linha dizia "abaixo da faixa" para
  cada uma, o que é mentira útil para ninguém: a faixa é do serviço inteiro.
  `compararComFaixas` passou a somar as linhas do mesmo serviço e a
  comparar a soma, com `somaDoServico` na tela ("Serviço completo: R$
  285"). `conferir:orcamento` ganhou o caso.
- O dono aprovou os quatro itens da proposta dos R$ 10 milhões
  (orçamento por foto, triagem por perguntas, relatório compartilhável,
  gastos por categoria) e decidiu: 2 análises por mês no gratuito; as
  perguntas da triagem ele revisa por id; relatório resumido grátis e
  completo no Premium; combustível grátis. O primeiro item saiu hoje.
- O que existe: `lib/orcamento/analise.ts` (puro: molde do pedido, leitura
  de resposta suja, comparação com as faixas, limite), `app/api/orcamento`
  (Bearer para o Premium pela tabela `subscriptions`, contagem em
  `orcamentos_analisados`, imagem ao modelo, registro sem a foto), a tela
  `Orcamento.tsx` e os três pontos de entrada (checklist do sintoma,
  serviço novo, Biela). Evento `analisou_orcamento` com origem; restrição
  do banco recriada (migração `funil_eventos_orcamento`).
- Conferência: `conferir:orcamento` (26 casos) reprovou com o limite
  trocado para 3 e com a comparação desligada; a suíte de navegador
  `orcamento` (16 casos) prova a tela com a rota simulada nos três
  desfechos, mais o salvar no histórico pré-preenchido.
- O que a conferência não alcança: a resposta do modelo de verdade (sem
  chave no ambiente de conferência) e a câmera no WebView das lojas. O
  primeiro se prova em produção com uma análise de engenharia; o segundo,
  no roteiro da 2.6 (`docs/lojas/novidades-2.6.md`).

## 2026-09-13 · Engenharia: primeira rodada automática da jornada
- Lembrete agendado disparou às 9h11 de Brasília. Em `jornada_envios`, dia
  13/09: 3 e-mails `d0` (contas novas de 12/09), só e-mail, sem push (nenhum
  token novo). `jornada_saidas`: 0. No log da Vercel, o cron rodou às 8h47
  de Brasília com 200. A jornada está viva sem mão humana; o resumo do dia
  foi para o FEEDBACK_TO. Zero em outras chaves é legítimo: quem recebeu em
  12/09 só volta a caber a partir de 15/09.
- Correção do dono: a 2.4 saiu com build 63, não 74. `/api/app/latest`
  ficou um dia em 74/74, e nesse dia todo aparelho na 2.4 viu o banner de
  versão nova apontando para nada. Agora 63/63. A lição já estava escrita
  no próprio arquivo: o número sai da loja, não da memória.

## 2026-09-12 · Engenharia: bateria completa da 2.5 antes do Codemagic
- O dono perguntou "está tudo certo para subirmos?". Regra das duas
  velocidades: release pede bateria completa e build local. `npm run
  conferir` verde; `conferir:navegador` (683 s) reprovou três casos da
  suíte `km` sem folha nenhuma aberta: o card de revisões do Início passou
  a dizer "Estimado. Confirme a última troca" e o detector da suíte
  (`/Confirme|km atual|Salvar km/`) casou com o card. Detector preso ao
  botão "Salvar km", que só a folha tem: sete de sete. A regra do km não
  mudou; a suíte media vocabulário, não a folha. `build:native` passou
  (native/app, 48 MB).
- Versões: 2.5 nos três lugares, ainda não publicada. Roteiro de aparelho
  e notas das lojas em `docs/lojas/novidades-2.5.md`. Universal links
  ficam para a 2.6 (precisam do SHA-256 do Play).
- O que a bateria não alcança e só o aparelho prova: token de push do
  iPhone (nunca funcionou; AppDelegate consertado hoje), saída para a App
  Store, três manhãs, e as duas variantes dos A/B no app das lojas. Sobre
  o binário: sem sinal ainda.

## 2026-09-12 · Engenharia: o iPhone do dono ligou avisos e nenhum token apareceu
- O dono desligou e ligou os avisos no iPhone às 19h de Brasília. Conferido:
  `push_tokens` continua com 1 linha, Android, de outra conta. Nos logs da
  Vercel das últimas 2h, nenhuma chamada a `/api/push/registrar` (só /app,
  /api/funil, /api/lessons e /api/app/latest). `app_erros` vazia nas 3h.
  O único evento iOS da hora é um `abriu_app` sem sessão às 19h08, mas isso
  não prova deslogado: o `abriu_app` sai antes de a sessão voltar (outro
  iPhone do dia mostra o mesmo, e 22 segundos depois um evento logado).
- O que dá para afirmar: o aparelho não chamou o servidor. O que NÃO dá:
  por quê. `lib/app/push.ts` calava em todas as saídas (sem sessão,
  permissão do sistema não concedida, Apple recusou o registro, register()
  lançou, servidor devolveu erro), de propósito, para embarcar antes das
  chaves. Perguntado ao dono se o Perfil do iPhone mostra a conta dele.
- Conserto: cada saída sem token vira `relatarPush` em app_erros (origem
  `push`, sem dado da pessoa). Ouvinte de `registrationError` lido no fonte
  do plugin. `conferir:aviso` confere as cinco saídas e reprovou com o
  ouvinte trocado. É binário (2.5); na 2.4 o silêncio continua.
- A CAUSA, achada em seguida, no fonte e não no chute: o dono repetiu o
  teste logado, com a permissão ligada no Perfil e nos Ajustes do iPhone, e
  de novo nada. `ios/App/App/AppDelegate.swift` era o modelo do Capacitor,
  sem `didRegisterForRemoteNotificationsWithDeviceToken`. O plugin de push
  só fica sabendo do token pela notificação
  `capacitorDidRegisterForRemoteNotifications` (addObserver em
  `PushNotificationsPlugin.swift`, linhas 40 a 48), e no Capacitor ninguém
  a publica (grep no fonte: só a definição em CAPNotifications.swift). Ou
  seja: `register()` resolvia, a Apple entregava o token ao AppDelegate, e
  ele morria ali. Nenhuma das cinco saídas do item anterior pegaria isso,
  porque não é erro: é um evento que nunca chega. Desde 28/08, nenhum
  iPhone gravou token; o push do iPhone da jornada nunca teve como sair.
- Segundo achado no caminho: o `Package.swift` do iPhone commitado estava
  sem o plugin de push e sem a AppsFlyer. O Codemagic roda `cap sync ios` e
  regenera (a AppsFlyer funciona no iPhone, então o build tinha o pacote
  certo), mas o arquivo no repositório mentia. Regenerado com
  `npx cap update ios` e commitado.
- Conserto: os dois métodos no AppDelegate (repasse do token e da recusa),
  como o README do plugin manda e o fonte confirma. `conferir:aviso`
  confere o AppDelegate e o Package.swift; reprovou com o AppDelegate
  antigo. Binário: a 2.5. Sobre o iPhone registrar token com a 2.5: sem
  sinal ainda, e é o primeiro item do roteiro de aparelho.

## 2026-09-12 · Engenharia: "Atualizar" no iPhone ficava carregando apps.apple.com
- Relato do dono, com foto: tocou em Atualizar no banner de versão nova e
  ficou numa tela branca com "apps.apple.com" carregando, dentro do app.
- Lido no fonte, não no README: toda saída do app passa pelo plugin Browser
  (`openExternal`), que no iPhone é o Safari embutido e só aceita http e
  https (`Browser.swift`, linha 19). A ficha da loja dentro de um Safari
  embutido não vira a App Store; fica a página. O que abre o app da App
  Store é o esquema `itms-apps://`, e o Capacitor entrega esse esquema ao
  sistema quando a WebView abre janela nova (`createWebViewWith` chama
  `UIApplication.shared.open`).
- Conserto: `lib/app/saidaDoApp.ts` (pura) decide como sair; no iPhone,
  endereço em apps.apple.com vai por `window.open` com `itms-apps://`, o
  resto continua pela aba (política de pagamentos). Vale também para
  "Avaliar o Mentorque". `conferir:navegacao` ganhou os casos e reprovou
  com o conserto desligado.
- O que a conferência não alcança: é binário (2.5). Na 2.4 o botão continua
  abrindo a página. Sobre o toque no aparelho com a 2.5: sem sinal ainda;
  entra no roteiro (Perfil, "Avaliar o Mentorque", tem que abrir a App
  Store). Por que ficou carregando para sempre, e não mostrou a página, eu
  não sei e não vou chutar; o conserto tira o Safari embutido do caminho.

## 2026-09-12 · Engenharia: os seis itens da revisão de retenção, aplicados
- O dono pediu a revisão ("usuário fica 1 dia e não volta"; o CRO entregou
  `docs/agentes/propostas/retencao-primeiro-dia.md`: 253 pessoas desde
  04/09, 11 voltaram) e mandou "aplicar todos os testes propostos". Seis
  commits pequenos, cada um com a sua conferência, na ordem da proposta:
  1. Eventos de conclusão `viu_aula`, `consultou_sintoma`,
     `registrou_servico` (com ou sem valor). "Primeiro valor" ganha régua.
  2. Convite de aviso ao terminar o onboarding no app das lojas, com o carro
     pelo nome quando há carro.
  3. O card de revisões do Início abre o calendário estimado (por km ou
     data de compra) em vez de mandar ao quiz; "estimado pelo km" escrito.
  4. Teste A/B `cadastro-em-duas-etapas`: metade vê o formulário do carro
     só com marca, modelo e ano; a barra "Diagnóstico do carro: n de 5" na
     tela do carro pede o resto e diz o que cada dado destrava.
  5. Teste A/B `onboarding-curto`: metade vê três páginas (a dor, como
     resolve, a última) em vez de cinco, sem a prova social inventada.
  6. O lembrete do quiz cobre três manhãs e ligar avisos confirma na tela.
- Na web tudo já roda; nas lojas, com a 2.5 (fila em
  `docs/lojas/novidades-2.5.md`). Os dois testes estão em
  `docs/agentes/experimentos.md` como ABERTO, leitura duas semanas depois
  de a 2.5 estar nas duas lojas.
- DEFEITO ACHADO ao ligar o segundo teste: o sorteio de variante (djb2 sem
  mistura final) dava a MESMA variante nos dois testes para 100% dos
  aparelhos; dois testes ao mesmo tempo eram um só e a leitura de cada um
  carregaria o efeito do outro. Corrigido com a mistura final do murmur3 em
  `lib/app/sorteio.ts`; `conferir:funil` passa a medir a concordância entre
  dois testes (perto de 50%) e reprovou com o hash antigo plantado (0%).
  Quem foi sorteado na web nas horas entre os dois commits pode ter trocado
  de variante; gente de menos para pesar.
- O que a conferência não alcança: o onboarding curto e o cadastro curto no
  app das lojas só existem depois do binário da 2.5, e o roteiro de aparelho
  precisa cobrir as duas variantes (forçar pelo `mq-anon-id` do aparelho).
- Prova de aparelho feita no navegador com dois ids: A mostra cinco páginas
  com a prova social; B mostra "Carro dá prejuízo em silêncio", "Aqui o
  carro tem calendário e preço justo" e "Monte seu teste".

## 2026-09-12 · Engenharia: a jornada de recorrência por e-mail e push, construída
- **Decisão do dono**: "vamos criar tudo que foi proposto de email. Já vamos
  deixar o push pronto também", sobre a proposta do mesmo dia
  (`docs/agentes/propostas/jornada-de-recorrencia.md`).
- **O mapa que desenhou a proposta**: 27 contas, todas com e-mail; 13 com
  carro; 4 com serviço; UMA pessoa com token de push (Android) e as chaves
  de push ausentes na Vercel; convidado não tem e-mail. Logo: e-mail é o
  canal das contas, o aviso local é o canal do aparelho, e o push do
  servidor fica pronto para o dia em que houver chave e token.
- **Construído**: decisão pura (`lib/jornada/decisao.ts`: saída, atividade
  hoje, um a cada três dias, gatilho > cadência > sazonal), textos com o
  carro da pessoa (`lib/jornada/emails.ts`, 21 variações), link de sair
  assinado, cron diário às 9h de Brasília, tabelas `jornada_envios` (índice
  único por pessoa e dia) e `jornada_saidas`, transporte de push extraído
  para `lib/push/transporte.ts`. Manual em `docs/jornada.md`.
- **Duas regras que a construção acrescentou**: a cadência só sai até três
  dias depois do marco (sem isso, ligar hoje mandaria cinco e-mails em
  rajada para cada conta antiga); e "vencida" exige serviço daquele tipo
  registrado (o teste de fumaça produziu "óleo vencido há 30 meses" a
  partir da data de compra de um carro sem registro nenhum).
- **Conferência**: `conferir:jornada`, dezenas de asserções sobre a decisão, 21 variações de texto e as ligações; três defeitos
  plantados (quem saiu recebendo; espaço de três dias zerado; cadência sem
  janela), os três reprovaram. `conferir:aviso` passou a ler a rota de push
  no transporte novo.
- **Ligada no mesmo dia, por ordem do dono**: "faça tudo que precisa e deixe
  funcionando". O padrão virou enviar; o freio é `JORNADA_PAUSADA=sim` na
  Vercel. A regra da casa pede cópia de prova ANTES do disparo, e de dentro
  deste ambiente não dá para mandá-la (sem chave, sem rede para o domínio);
  o que a substitui: na primeira vez que cada e-mail sai, o dono recebe a
  mesma cópia na mesma manhã, e todo dia com envio recebe o resumo (quem,
  chave, assunto, erros) em `FEEDBACK_TO`. Registrado como desvio
  consciente da regra, decidido pelo dono. Os endereços "ocultar meu e-mail"
  da Apple ficam de fora até o domínio entrar no relay
  (`JORNADA_APPLE_RELAY=sim` libera), para devolução não sujar o domínio.
  Sobre "funciona?": até a primeira manhã, sem sinal ainda; o primeiro sinal
  é o resumo chegando.
- **Ensaio contra as contas reais, fora do ar** (a decisão rodada em cima
  do `user_state` de hoje, sem enviar nada): 24 das 27 contas receberiam
  algo na primeira manhã: 7 `d5`, 2 `d0`, 4 `d9`, 4 `d2`, 1 `d14`, 4
  `sumiu-30`, 2 `sumiu-14`. Nenhum gatilho de revisão: as 4 contas com
  serviço não têm item vencido nem chegando. Dois ajustes saíram do ensaio:
  o `d0` só sai no dia ou no seguinte (uma conta de 3 dias recebia "sua
  conta está pronta"), e o manual da Biela passou a casar por marca e
  modelo sem o ano (a tabela guarda um ano por manual; Gol 2016 ficava
  "sem manual" com o de 2015 na prateleira).
- **Primeira rodada de verdade: 12/09, 17:33 UTC**, por ordem do dono
  ("vamos enviar o e-mail agora, não precisa esperar até amanhã"). Disparada
  pelo n8n (fluxo "Mentorque: jornada agora", que chama o cron com a chave
  de dados; a chave fica lá, nunca aqui). `jornada_envios` do dia: 18
  e-mails (7 `d5`, 4 `d2`, 3 `sumiu-14`, 1 `d0`, 1 `d9`, 1 `d14`, 1
  `sumiu-30`), e UM deles saiu também por push (Android): sinal de que a
  chave do FCM está na Vercel, ao contrário do que `docs/push.md` dizia; o
  iPhone segue sem sinal. Os 4 endereços Apple relay ficaram de fora. O
  cron amanhã às 9h não repete para ninguém desses (um a cada três dias).
- **O botão cai na tela certa** (pedido do dono no mesmo dia): cada link
  leva `ir=<tela>`; `app/app/page.tsx` guarda o destino no bolso do
  onboarding e `useDestinoDoOnboarding` navega para qualquer tela da lista
  fechada (`lib/app/destinoDoLink.ts`). Universal links, para o link abrir o
  app das lojas em vez do navegador, foram para a fila da 2.5 (binário).
- **Relay da Apple cadastrado pelo dono em 12/09**: `mentorque.com.br` e
  `contato@mentorque.com.br` em Sign in with Apple for Email Communication,
  SPF verificado nos dois; `JORNADA_APPLE_RELAY=sim` na Vercel com redeploy
  às 17h20. Rodada de confirmação às 17h23 de Brasília: as 4 contas com
  e-mail oculto receberam (2 `d2`, 2 `sumiu-30`), a Resend aceitou. Se a
  Apple devolver, aparece no painel da Resend como bounce.
- **As quatro chaves de push estão na Vercel** (tela do dono, 12/09), ao
  contrário do que `docs/push.md` dizia. O que falta para o iPhone é um
  token gravado: ninguém com iPhone ligou os avisos ainda.
- **Instagram, diagnóstico de 12/09 (17h37)**, feito pelo Graph com o token
  do dono, via n8n: a Página 1303827686140932 está assinada no app (campo
  `feed`), o Instagram 17841434740033242 tem 3 posts recentes e 5
  comentários hoje (entre eles "Quero a dica" e "Turbo"), e NENHUM chegou ao
  webhook: o campo `comments` não está assinado no app. A resposta privada,
  tentada direto para o comentário "Quero a dica", voltou "(#3) Application
  does not have the capability to make this API call": falta o produto
  Messenger com a API de mensagens do Instagram, e o token precisa de
  `instagram_manage_messages`. Passos na lista de ações. O post de hoje pede
  "comenta TURBO"; a regra ativa é "QUERO A DICA".
- **A 2.4 foi aprovada na Apple em 12/09** (dono). As duas lojas estão com a
  2.4; `"2.4"` já está em `JA_PUBLICADAS`.
- **Limites registrados**: abertura de e-mail não se mede; "mexeu no app
  hoje" lê o `updated_at` do estado e o dia do quiz, então quem abre e não
  muda nada não conta como ativo; quem usa o app das lojas e clica cai no
  navegador (sem universal link); as quatro contas Apple com e-mail
  escondido só recebem com o domínio no relay da Apple.

## 2026-09-12 · Engenharia: o site não leva mais ao /app (a porteira durou horas)
- **A pergunta que abriu isto**: "como eles estão acessando o app na web?
  deveria ser só pelas lojas". O app era uma página do site (`/app`), com o
  link "use pelo navegador" na home desde 03/09, e a maior porta em número:
  182 onboardings e 15 contas em 28 dias (Android 64 e 1; iPhone 14 e 2), e
  as três únicas vendas (Stripe). Três contas de 11/09, todas do anúncio e
  pela web, fizeram o onboarding, cadastraram o carro e nunca voltaram.
- **Primeira decisão do dono**: "vamos tirar o caminho da web. Usuário
  precisa baixar o app." Publicada como porteira: no domínio de produção,
  `/app` sem conta mostrava "baixe o app" com os selos das lojas.
- **Segunda decisão, no mesmo dia, que é a que vale**: "quero que exista o
  /app mas só consiga acessar se digitar completamente. Tire todas as rotas
  que levam até lá, mas continua existindo a rota." A porteira saiu inteira
  (tela, regra, textos, `conferir:porteira`); o `/app` abre como antes para
  quem digita, com ou sem conta. O que ficou: o link "use pelo navegador"
  fora da home, e nenhuma página do site apontando para o `/app`. Os atalhos
  de venda (`/ALE100`) e o botão do e-mail de lançamento continuam, porque
  não estão em página nenhuma: são links que o dono manda na conversa.
- **Conferência**: `conferir:caminho` varre o site (43 arquivos) atrás de
  qualquer destino `/app` e confere que a rota existe sem porteira; provado
  plantando dois defeitos (link no Hero; porteira na página), os dois
  reprovaram.
- **O que vai mudar nos números, para ninguém ler errado**: `comecou_onboarding`
  e `cadastro` na web caem, mas não a zero: quem digita o endereço, quem
  tem o link guardado e quem vem pelo atalho de venda continua entrando. A
  conta do anúncio passa a depender da loja, onde a etiqueta não atravessa
  (docs/utms.md).
- **Deixado de fora, de propósito**: nada de e-mail para as três de ontem
  sem o texto e o sim do dono (mensagem a cliente).

## 2026-09-12 · A 2.4 está na Play; a Apple analisa; o repositório vai para 2.5
- Dono: 2.4 enviada, aprovada na Play em 12/09, em análise na Apple. `"2.4"`
  entra em `JA_PUBLICADAS` no mesmo dia, o repositório sobe para 2.5 e a
  fila da 2.5 (lembrete do quiz em três manhãs, confirmação ao ligar) vira a
  versão aberta. O experimento `onboarding-termina-no-carro-android` ganha a
  data de início (12/09) e a de leitura (26/09).
- Roteiro de aparelho da 2.4 (14 passos) ainda não rodado; até um aparelho
  abrir, sobre o binário a resposta segue "sem sinal ainda". O
  `/api/app/latest` só sobe depois de a Apple aprovar e com o número do log
  do Codemagic (skill de release).

## 2026-09-12 · Engenharia: o lembrete do quiz que cala depois de um aviso (fila da 2.5)
- Relato do dono: dias sem o aviso do quiz no iPhone, com o interruptor
  ligado; desligar e ligar não mostrou nada. Banco: última resposta em
  09/09, avisos ligados, login hoje às 10:02. Não é defeito, é a regra de
  `lembreteQuiz.ts`: um aviso por vez, reagendado só na abertura ou na
  resposta. Quem some recebe um e depois silêncio, e quem some é quem mais
  precisava. O toque no interruptor com permissão já dada não abre nada, e
  o app não confirma em tela.
- Decisão do dono (12/09): fazer, mais para a frente. Fica na fila da 2.5
  (`docs/lojas/novidades-2.5.md`): três manhãs de aviso em vez de uma, e a
  linha de confirmação ao ligar. Não entra na 2.4, que está fechada.
- O que ainda pode estar somando no iPhone dele, e eu não vejo: Resumo
  Programado ou um Foco sem o Mentorque na lista. Teste honesto pedido:
  amanhã às 9h, sem abrir o app antes, o aviso tem de chegar.

## 2026-09-11 · Engenharia: o portão de permissão de aviso passa a ser medido (antes do build da 2.4)
- O achado do CRO de hoje era meu para fechar, e antes do build: cinco
  máquinas de recorrência atrás de uma permissão que ninguém media. Entram
  quatro eventos no funil (`convite_aviso`, `aceitou_convite_aviso`,
  `permissao_aviso_concedida`, `permissao_aviso_negada`), com a origem de
  onde o pedido nasceu (quiz, calendario, carro, perfil, trilha), declarados
  nos quatro lugares que a conferência do funil exige (tipo do app, rota,
  restrição do banco, regras de natureza) e a restrição recriada no banco.
  Natureza: o convite mostrado é de sessão; aceitar e o desfecho são atos.
  Medido desde 11/09, na regra da 1.6: a data é do instrumento.
- `conferir:aviso` cobra que os três lugares que pedem a permissão relatem o
  desfecho. A leitura que o CRO pediu passa a existir: convites mostrados,
  aceitos e permissões concedidas, por origem, por aparelho.
- Também escritas as notas das lojas da 2.4, só com o que a bateria alcança.

## 2026-09-11 · Engenharia: o aviso do Android ganha a marca no lugar do "i" genérico
- Foto do dono: o aviso do quiz na Samsung da Luana saía com o ícone de
  informação do sistema. Lido no fonte do plugin (LocalNotificationManager.kt,
  getDefaultSmallIcon): sem `smallIcon` no config, ou com nome sem drawable,
  ele cai em `android.R.drawable.ic_dialog_info`, em silêncio.
- Feito: a marca rasterizada em PNG nas cinco densidades (silhueta branca
  para a barra, que o Android pinta com `iconColor` âmbar; e a marca âmbar
  sobre grafite como ícone grande), `smallIcon` e `iconColor` no config do
  plugin, os três campos por aviso no `agendar`, e o `meta-data` do Firebase
  no manifesto para o push com o app fechado usar o mesmo ícone e cor.
  `conferir:aviso` cobra nome no config, nome no agendamento e arquivo em
  cada densidade, porque nada disso dá erro de compilação quando falta.
- Sobre a data "10/09/2026" no aviso da foto: o plugin não define o `when`,
  então o Android mostra a hora em que o aviso foi entregue. O do quiz saiu
  às 9h de 10/09 e ficou na bandeja até a manhã seguinte. Não é defeito.
- O que a conferência não alcança: o ícone renderizado no aparelho. Passo 14
  do roteiro da 2.4.

## 2026-09-11 · Engenharia: no Android, o onboarding termina no cadastro do carro
- Pedido do dono, com uma premissa a corrigir: "já que tiramos o paywall do
  Android". Ninguém tirou. O paywall do Android está ligado desde a 1.9 e
  nunca vendeu; ontem eu recomendei tirar a página de plano de DENTRO do
  onboarding, nas três plataformas, e deixei como decisão dele. A decisão
  veio hoje, para o Android: a última página vira "Cadastre o seu primeiro
  carro", o botão abre o formulário, e a página de plano sai do onboarding
  ali. iPhone e web seguem iguais, e viram a comparação.
- Feito: página nova no `OnboardingFlow` (só quando `nativePlatform()` é
  android), destino gravado no sessionStorage como o plano, gancho
  `useDestinoDoOnboarding` na abertura, `terminou_onboarding` ganha a origem
  `carro`. Conferido em `conferir:funil` (os três elos da ligação), provado
  plantando defeito. A suíte de navegador roda como web e não alcança isto;
  roteiro no passo 13 da 2.4.
- Experimento registrado no caderno do CRO
  (`onboarding-termina-no-carro-android`), com o "antes": Android, 28 dias
  até 10/09, 59 começaram e 4 cadastraram carro, por aparelho. Leitura duas
  semanas depois de a 2.4 estar na Play, por plataforma, sem casa decimal.

## 2026-09-11 · CRO (retenção): cinco máquinas novas atrás de um portão sem medida
- Rodada semanal do CRO/BeSci, foco RETENÇÃO (a de 04/09 foi de conversão).
  Artifact "Conversão da semana":
  https://claude.ai/code/artifact/fc1013e2-8ed2-4802-90e8-840efd381622
- AS TRÊS CORREÇÕES DO DONO sobre a rodada passada foram aplicadas já nesta, e
  estão escritas no mapa para valerem daqui em diante: janela real de cada
  degrau (o "28 dias" era de quatro), amostra pequena sem casa decimal ("17 de
  36", não 47,2%), e esgotar as dimensões que a tabela já tem antes de pedir
  instrumentação nova. A terceira é a que mais dói: `plataforma` estava na
  mesma consulta e respondia a pergunta que eu declarei impossível.
- VEREDITOS: nenhum vencido. cta-teste-por-plano e fim-do-lembrete-falso em
  20/09, lembrete-que-chega em 28/09. prova-social-de-verdade segue PROPOSTO,
  sem resposta; registrado aqui como pendência e NÃO reapresentado como
  recomendação, conforme o direcionamento de 01/09.
- OUVIR O USUÁRIO, e é o achado da semana: 8 avaliações, todas 5 estrelas,
  sendo 5 novas da Play. TRÊS são de conta com nome de EMPRESA, e duas
  descrevem o uso por extenso: "usamos para gerências as manutenções e dúvidas
  dos carros aqui da clínica" e "Ajuda a tomar decisões e ter controle de
  frota". Entrou no mapa como PERSONA 5, e ela é diferente das outras quatro:
  não é hipótese nossa, é gente que apareceu sozinha e escreveu. Nenhum campo
  do banco identifica esse perfil hoje, o que denunciou foi o nome do autor na
  loja e o texto livre.
- AUDITORIA DE RETENÇÃO, sem reauditar o que a engenharia acabou de construir:
  as cinco máquinas de recorrência da 2.4 dependem todas da MESMA permissão do
  sistema, e não existe evento de convite mostrado, convite aceito nem
  permissão concedida. É o modo de falha de 28/08 numa escala cinco vezes
  maior: podem estar todas mudas sem que nada no retrato mude de cor.
- O TETO QUE DÁ PARA CALCULAR SEM INSTRUMENTAÇÃO NOVA (a regra do dono
  aplicada): o convite só existe em três lugares, e o caminho do carro alcança
  no máximo quem tem carro, que são 10 contas. O número de aparelhos que hoje
  podem receber qualquer um dos cinco avisos é de UM DÍGITO. Não é motivo para
  não soltar, é motivo para não ler a coorte seguinte como veredito das cinco.
- ANOTADO PARA QUEM FOR LER A 2.4: a App Store está na 2.1. Nenhum dos cinco
  momentos chegou a usuário nenhum, então todo número de retenção desta semana
  é ANTERIOR a eles.
- REGISTRADO, sem mexer: a régua do portão (3 convites por aparelho na vida, 4
  dias entre eles) foi desenhada quando havia dois avisos e agora serve cinco.
  Com 1,6 abertura por usuário, a maioria dos aparelhos tem UMA chance na
  prática, e quem chega primeiro leva. Qual momento merece gastá-la é pergunta
  de CRO que hoje ninguém responde.
- APOSTA DA SEMANA, implementada: [limite-de-carros-com-aviso]. Quem já tem os
  2 carros do plano grátis tocava no "+" da garagem esperando um formulário e
  caía no paywall sem uma palavra. Agora a tela diz ANTES do toque que o plano
  grátis guarda 2 carros e que adicionar outro passa pelo Premium, e o rótulo
  do botão diz para onde leva. O destino continua o mesmo. Limite, preço,
  plano e conteúdo do paywall: nada mudou, é alçada do dono.
  - Por que esta e não uma sexta máquina de retenção: a engenharia acabou de
    construir cinco, e empilhar uma sexta na mesma semana não gera aprendizado
    nenhum. Esta é a parede que a persona 5 bate primeiro.
- CONFERÊNCIA PROVADA MORDENDO, como manda o CLAUDE.md: a suíte `carro` ganhou
  os dois lados da fronteira (garagem cheia avisa, garagem com vaga fica
  quieta). Plantei o defeito antigo de volta e ela reprovou nos dois pontos
  certos; restaurado, voltou a passar. Bateria `conferir` inteira verde e tipos
  limpos; sem build local, que é o regime das duas velocidades para mudança
  localizada.
- APRENDIZADOS em besci.md: botão que não diz o que faz transforma oferta em
  emboscada; e o usuário que aparece sozinho vale mais que a persona que a
  gente desenhou, porque segmento novo chega como palavra antes de chegar como
  número.

## 2026-09-10 · Engenharia: Instagram, comentou X e recebe a mensagem no Direct
- **Pedido do dono**: quem comenta "padaria" num post recebe a mensagem A no
  Direct, quem comenta "todos os dias" recebe a B. Confirmado que é
  Instagram (WhatsApp não tem comentário em post e o comentário não traz
  número).
- **O desenho, todo oficial**: resposta privada da Meta (uma por
  comentário, em até 7 dias). Fluxo `Instagram: comentario vira mensagem no
  Direct` no n8n (id `dY9UPGPghiPYrO0S`), publicado: GET faz a verificação
  da Meta (token `mq-ig-7f3a9c2e51`), POST recebe os comentários, um nó de
  código extrai e normaliza (sem acento, sem caixa), a tabela
  `instagram_regras` diz palavra, texto e post (`*` = todos), duas travas na
  tabela `instagram_enviados` (nunca duas respostas ao mesmo comentário,
  nunca duas à mesma pessoa no mesmo post), a resposta vai pela Graph API
  com token Bearer numa credencial que só o dono cria, e o resultado
  (enviado ou erro) fica registrado. Comentário da própria conta é ignorado.
- **Nada sai sem o dono**: as duas regras nasceram com `ativa` desligada e
  o texto prefixado "RASCUNHO". Mensagem a cliente é alçada dele; os links
  já levam `utm_source=instagram&utm_medium=direct&utm_campaign=...`.
- **Provado o que dava**: as duas entradas rodaram com dado fixado
  (execuções 8499 e 8500, sucesso); o acesso de fora ao n8n é bloqueado
  neste ambiente, então o aperto de mão real com a Meta só o console dela
  mostra. Limite honesto: para o público em geral, a Meta exige revisão do
  app nas permissões de mensagem; com contas que têm papel no app funciona
  na hora, e é assim que o teste sai.

## 2026-09-10 · Engenharia: os cinco momentos de recorrência entram na 2.4
- **O pedido do dono**: "como evoluir o app e garantir mais pessoas acessando
  com recorrência", com três ideias (push em momentos de dor, comparar
  regiões ao registrar serviço, curso de mecânica para clientes robustos,
  seção de limpeza e manutenção básica). A leitura dos números antes de
  propor (retrato de 10/09, `estado_da_base`): 23 contas, 10 com carro, 4
  com serviço, coortes de 31/08 e 07/09 com 1 em 8 voltando na primeira
  semana e 1 em 5 fazendo a primeira ação de valor; UM aparelho com token de
  push. Conclusão: o problema não é entrada, é a segunda visita, e push de
  servidor não é alavanca enquanto ninguém deu a permissão.
- **Os cinco, todos com aviso LOCAL** (dispara sem servidor, e é o que a
  base de um aparelho permite): (1) cadastrou o carro e sumiu, aviso dois
  dias depois, e a permissão pedida logo depois do cadastro; (2) registrou
  serviço com valor, o app responde a faixa da região e o valor vira dado em
  `precos_observados`, sem ninguém dentro; (3) revisão vencida vira aviso,
  um item por vez, 30 dias entre repetições; (4) trilha em ritmo, uma aula
  por dia às 9h, com a trilha "Mecânica de verdade"; (5) cuidados básicos,
  duas aulas em lista e a trilha "Cuidados básicos". Cinco commits, um por
  momento, cada um com a conferência provada plantando defeito (onze
  defeitos plantados, onze pegos). Roteiro de aparelho em
  `novidades-2.4.md`.
- **O que cada um vai medir**, no retrato que já existe: ativação em 7 dias
  (1), retenção 1 a 7 dias (1 e 3), contas com serviço (2), aulas vistas (4 e
  5). Com 5 a 8 cadastros por semana não há teste A/B: é soltar e ler a
  coorte seguinte.
- **Paywall do Android, pergunta do dono ("eliminar para o usuário entrar
  sem sensação de que precisa pagar")**: respondido com números, decisão é
  dele. Nos 28 dias: onboarding começado 59 no Android, 12 no iOS, 148 na
  web; carro cadastrado 4, 2 e 4 aparelhos. A queda antes do carro é de 93%
  em TODAS as plataformas, não é do Android. O paywall do Android já está
  ligado (14 vistas em 11 aparelhos) e nunca vendeu; o do iOS idem (0
  vendas, 2 checkouts); as 3 vendas são da web. Recomendação registrada na
  resposta: não tirar o paywall de uma plataforma só; tirar a página de
  plano de dentro do onboarding nas três (ela aparece antes de a pessoa ver
  o produto) e medir `cadastrou_carro / comecou_onboarding` por plataforma.
  Preço e plano são alçada do dono: nada mudou.

## 2026-09-10 · Engenharia: o Android logou; o carro repetido vira pergunta; vai para 2.4
- **Login do Google no Android FECHADO.** O dono cadastrou a SHA-1 `E5:1C...`
  no cliente Android do Google Cloud e a mesma 2.3 entrou: sessão no
  Supabase às 10:19 UTC, provider google, Android 8.1 (SM-G610M). Primeiro
  login nativo do Android desde que o app existe. Dois dias e quatro builds,
  e a lição está na regra do dono de 09/09: o dado que decidia (a SHA-1 que o
  aparelho enxerga) só apareceu quando o binário passou a relatar em vez de
  o app engolir. Sai da lista do dono; a linha do topo foi atualizada.
- **Carro repetido: o dono decidiu perguntar.** O QA de 09/09 tinha deixado
  a fusão duplicando de propósito, porque juntar ou apagar sozinho escolheria
  qual carro sobrevive. Em 10/09 o dono pediu que a pessoa escolha, "igual
  quando tem carros diferentes". Feito na folha de importação: o carro que a
  conta já tem deixa de ser caixa de marcar e vira três respostas (juntar num
  só, só o da conta, só o deste aparelho), com o que cada uma faz escrito
  embaixo. Regra pura em `lib/app/importacao.ts`: juntar reaponta histórico
  e lembretes para o carro da conta e preenche o que ela deixou em branco
  (km: o informado por último); trocar tira o carro da conta com o histórico
  dele; escolha órfã vira "levar", que não perde nada. `conferir:garagem`
  exercita cada resposta; plantei três defeitos (juntar sem reapontar,
  trocar sem apagar, folha mandando tudo como levar) e os três reprovaram.
  O que a conferência não alcança: a folha na tela, que a suíte de navegador
  não abre. Roteiro em `novidades-2.4.md`.
- **iPhone, os "fechou sozinho".** Três relatos na 2.1, todos "abriu o app":
  09/09 às 18:29 e 21:40 UTC (9s e 17s, dia da aprovação) e um novo em 10/09
  às 19:04 UTC, 75s depois de abrir. Nenhum erro de JavaScript do iOS no
  período. Não dá para separar crash de fechar o app à mão só com a migalha;
  se vier um quarto fora de dia de teste, a fonte é o App Store Connect
  (Crashes), que a nossa instrumentação não alcança.
- Repositório vai para 2.4; `"2.3"` entra em `JA_PUBLICADAS`.

## 2026-09-10 · Engenharia: a 2.3 falou, e o login mudo do Android é certificado não cadastrado
- Linha em `app_erros` às 10:10 UTC, versão 2.3.0: pacote `mentorque.app`,
  client id `1009695078013-eom7ist1...`, mensagem de baixo "activity is
  cancelled by the user.", e `signingSha1=E5:1C:71:4E:AF:82:E6:58:E7:6A:46:96:
  E0:81:3E:50:5C:91:71:CC`.
- **A causa, provada pela linha**: o app instalado no aparelho está assinado
  por um certificado que não está em nenhum dos dois clientes Android do
  Google Cloud (os cadastrados terminam em `17:DF` e `B4:4D:41`). Pacote e
  client id estavam certos desde a 2.0. Dois dias e quatro builds (2.0 a 2.3)
  para chegar aqui, porque o plugin devolvia uma frase fixa; a partir de agora
  a linha diz a SHA-1 na primeira tentativa.
- **Conserto**: cadastrar essa SHA-1 no Google Cloud (cliente Android, mesmo
  projeto, pacote `mentorque.app`). Sem build: a checagem é do Google, na hora
  de emitir o token. Passado ao dono em 10/09.
- Fica em aberto de onde veio a SHA-1 que o dono cadastrou como "do Play"
  (`A9:95...`). A que assina o app instalado é a `E5:1C...`, e é ela que o
  Play Console deveria mostrar como certificado da chave de assinatura do app.
- **Fechando o "em aberto por falta de fonte" do QA de 09/09** (os 7
  fechamentos), com a consulta que ele não pôde rodar, agrupada por
  plataforma e versão: 6 web 1.8.0 (05 e 06/09, os mesmos de 07/09), 1
  Android 1.8.0 em 07/09 às 20:13 UTC, e desde então 2 iOS 2.1.0 em 09/09
  (18:29 e 21:40 UTC), 9s e 17s depois de abrir. O Android e os dois iOS
  caem em cima de sessões de teste conhecidas (a Luana na 1.8 do Android em
  07/09 à noite; a 2.1 do iPhone no dia da aprovação), e fechar o app à mão
  para reinstalar deixa a migalha quente do mesmo jeito. Não é sinal de
  público: nenhum relato de aparelho fora dos dias de teste. Segue vigiado
  pelo retrato, sem ação.

## 2026-09-10 · Engenharia: a 2.2 trouxe a testemunha, e ela fala pouco; a 2.3 faz ela falar
- **O que o aparelho disse.** A 2.2 reprovou o login do Google igual à 2.0 e
  à 2.1 (caixinha, conta, Entrar, tela muda), mas pela primeira vez com linha
  em `app_erros`, às 00:04 UTC, versão 2.2.0: `login nativo google: Google
  Sign-In cancelled by user`. Não é "[28444] Developer console", nem "[16]
  Account reauth failed": o plugin testa essas duas frases ANTES e teria
  devolvido outra coisa. É `GetCredentialCancellationException`, e o plugin
  responde a ela com uma frase fixa.
- **O que a frase fixa esconde.** Lendo `GoogleProvider.java` (8.3.40, e o
  8.5.7 é igual nesse ponto): a mensagem que o Android mandou vai só para o
  Logcat, junto com o pacote, a SHA-1 do certificado que assinou o app
  instalado e o client id usado. São as quatro coisas que decidem esse caso.
  O relato público mais comum desse "activity is cancelled by the user" é
  client id do tipo Android no lugar do Web; o README do plugin diz que
  USER_CANCELLED depois de escolher a conta pode ser pacote, SHA-1 ou client
  id não batendo.
- **O que dá para descartar daqui.** Propagação do Google: os dois clientes
  Android foram criados em 07/09 às 21:23 UTC, dois dias antes do teste. O
  pacote: `applicationId` é `mentorque.app`, o mesmo dos dois clientes. As
  SHA-1 cadastradas são duas e diferentes. O client id que o dono recriou no
  Codemagic é o que o Supabase usa com segredo no login pelo navegador, e
  cliente com segredo é do tipo Web. O que sobra sem prova: a SHA-1 do app
  que está no aparelho e o valor que o build embutiu de fato.
- **O conserto é fazer a testemunha falar, não mais um chute.**
  `scripts/conserta-social-login.mjs`, no `postinstall` como o da AppsFlyer,
  troca a rejeição fixa do plugin pela mesma rejeição com a mensagem de baixo,
  o pacote, a SHA-1 e o começo do client id. Código de erro e tela não mudam.
  O Gradle compila o plugin direto de `node_modules`, então o `npm ci` do
  Codemagic aplica. `conferir:login` cobra o remendo; provado: antes de rodar o
  remendo, reprovou com as duas faltas; depois, passou; a sintaxe do Java foi
  conferida com um parser. O que não foi conferido: o Gradle compilando de
  verdade. Isso só o build diz.
- **Repositório vai para 2.3**, `"2.2"` entra em `JA_PUBLICADAS`. Roteiro de
  aparelho escrito em `docs/lojas/novidades-2.3.md`, com a leitura de cada
  desfecho possível da linha.

## 2026-09-09 · QA: o carro duplicado tinha uma causa só, e ela é a identidade
- Artifact "QA da Semana":
  https://claude.ai/code/artifact/75d78944-8df0-47a6-808a-afe2c4010fdb
- Fluxo varrido: **garagem e carro duplicado**, aberto desde 23/08 e que já
  tinha perdido três rodadas para achados mais urgentes.
- **A CAUSA, e ela é uma só para os três caminhos**: o app identifica carro
  pelo `id`, e esse id nasce no APARELHO na hora de salvar. Dois cadastros do
  mesmo carro recebem ids diferentes, sempre, então toda a deduplicação do
  app (que é por id) nunca teve como funcionar. `addVehicle` concatena sem
  olhar nada; `mergeById` casa por id, e no login o Gol da nuvem e o Gol do
  convidado sobrevivem os dois; `resolverImportacao` monta o "já tem" com ids
  que nunca batem com o carro equivalente. Consertar um caminho por vez
  jamais resolveria, e é por isso que o relato sobreviveu a três rodadas.
- **A PLACA é o que impede o conserto de ser pior que o defeito.** Juntar por
  marca, modelo e ano fundiria dois Gol 2016 de verdade, que existem (casal,
  pai e filho, frota pequena), escondendo o histórico de um deles. Regra em
  `lib/app/mesmoCarro.ts`: com placa nos dois, só é o mesmo carro se a placa
  for a mesma; sem placa, cai em tipo, marca, modelo e ano, tolerando caixa,
  espaço e acento.
- **A regra AVISA, nunca junta nem apaga.** O cadastro segura o primeiro
  toque, diz qual carro já existe e oferece "cadastrar assim mesmo"; a folha
  de importação marca o carro que a conta já tem. Quem confirma segue.
- **DEIXADO DE PÉ DE PROPÓSITO**: a fusão automática das garagens no login
  continua duplicando. Ali não existe ninguém para perguntar, e deduplicar
  sozinho seria escolher qual carro sobrevive levando junto o histórico do
  outro. É decisão, não esquecimento, e está escrito no cabeçalho da
  conferência para o próximo não "consertar" isso achando que é descuido.
- **A conferência nova quase virou enfeite, e o modo de errar vale mais que o
  acerto.** `conferir:garagem` passou verde; plantei cinco defeitos de volta e
  ela pegou quatro. O quinto era o mais provável numa refatoração distraída:
  o aviso continuar na tela e parar de INTERROMPER a gravação, ou seja, a
  pessoa vê a folha e o carro é salvo do mesmo jeito. Ela passou porque eu
  procurava o NOME da função, e o nome segue no arquivo, usado pelo botão de
  fechar a própria folha. Apertei para exigir a forma inteira (achou, guarda
  e SAI antes de gravar), replantei nas duas variantes e ela reprovou nas
  duas. A versão frouxa ficou escrita no arquivo, com o porquê.
- **EM ABERTO POR FALTA DE FONTE**: o retrato traz 7 relatos de "app fechou
  sozinho em: abriu o app". Em 07/09 concluiu-se que os seis de então eram
  todos da web. Um a mais é motivo novo para conferir se o novo também é da
  web ou se apareceu aparelho de verdade, e **o banco recusou consulta por
  permissão nesta sessão**. A pergunta que fecha é uma linha, agrupando por
  plataforma e versão. Primeira coisa da próxima rodada se a fonte voltar.
- **NÃO reconferi** receita, cupom, webhook nem contagem de assinantes: as
  cinco estão fechadas na tabela do topo e nenhuma teve motivo novo. A
  próxima data que importa continua sendo 01/10, já agendada.
- Saúde: bateria `conferir` inteira (29 conferências), os dois builds e a
  suíte de navegador do carro (35s), todas verdes, rodadas de novo depois do
  rebase sobre a 2.1.

## 2026-09-09 · Android: a caixinha abre, a conta é escolhida, e o token nunca chega ao app

- Vídeo do dono, no aparelho da Luana, na 2.0 (o funil registrou `abriu_app
  2.0.0` às 21:31Z): "Continuar com o Google" abre a caixinha do sistema
  ("Escolha uma conta para continuar no app Mentorque"), ela escolhe a conta,
  a caixinha fecha e a tela de login volta SEM mensagem nenhuma.
- **O que os dados provam:** nenhum pedido de login chegou ao Supabase na
  janela (o único registro de auth entre 21:20Z e 21:50Z é uma senha errada
  digitada no site, de outra pessoa), e a conta dela segue com último login em
  06/09. Ou seja, o `signInWithIdToken` nunca foi chamado: o plugin devolveu
  algo que o nosso `catch` leu como "cancelou" (`/cancel|1001|user.?closed|
  dismiss/`) e ficou quieto. Na 1.9 o erro dos scopes aparecia escrito porque
  não casava com esse padrão.
- **O que o fonte do plugin diz sobre isso** (`GoogleProvider.java`,
  `handleSignInError`): `GetCredentialCancellationException` vira "Google
  Sign-In cancelled by user"; erro de console do desenvolvedor (SHA-1,
  pacote, client id) vira uma mensagem longa que NÃO contém "cancel" e teria
  aparecido na tela. E o README avisa, na seção de Android: "USER_CANCELLED
  depois de escolher a conta ainda pode ser SHA-1 ou client id não batendo".
  Não dá para fechar a causa daqui: a mensagem exata morreu no `catch`.
- **Conserto que muda isso:** todo desfecho do login nativo que não é sessão
  vira linha em `app_erros`, com a mensagem do plugin ou do Supabase, inclusive
  o "cancelado". Origem `login nativo google`. A mensagem não carrega dado da
  pessoa. Precisa de build (2.2); no próximo teste o motivo chega sozinho.
- **O que o dono pode conferir sem build, e é a suspeita número um:** no Google
  Cloud, os dois clientes Android precisam ter SHA-1 DIFERENTES, um igual ao
  "certificado da chave de assinatura do app" e outro igual ao "certificado da
  chave de upload" do Play Console. Se os dois receberam o mesmo SHA-1 (o de
  upload apareceu primeiro na tela e é o mais fácil de copiar duas vezes), o
  build da Play, assinado pela outra chave, é recusado exatamente assim.
- O MCP do Supabase perdeu a permissão no meio da investigação e voltou
  quando o dono liberou; sem ele, a prova de "nenhum pedido chegou" não
  existiria.

## 2026-09-09 · Release: a 2.0 foi enviada, o repositório vai para 2.1

- O dono gerou e enviou a 2.0 no mesmo dia em que o "?" flutuante entrou. A
  2.0 foi acrescentada a `JA_PUBLICADAS` NA HORA, que é a única forma de esta
  lista não repetir a 1.8. O repositório subiu para 2.1 nos três lugares, e
  `docs/lojas/novidades-2.1.md` abre vazio, com a obrigação do roteiro antes
  do build escrita no topo.
- **Sem sinal ainda da 2.0.** Nenhum aparelho abriu; nada a dizer sobre o
  build. O que o dado vai mostrar quando abrir: `versao = 2.0.0` no funil e em
  `app_erros`, e uma conta Google nova pelo Android se a caixinha funcionar.
- As notas de loja da 2.0 foram escritas para o dono conferir, e falam só do
  que foi conferido: o "?", o ajuste de foto e entrar com o Google caindo
  logado. Não falam da foto do Google nem da caixinha, que nenhum aparelho
  provou. O texto cresce quando o roteiro passar.
- Dois números continuam sem chegar e travam o aviso de versão nova no app: o
  `versionCode` da 2.0 (e o da segunda 1.8), que só saem do Play Console ou do
  log do Codemagic.

## 2026-09-09 · Android: a caixinha do Google recusou por causa de dois scopes que o plugin já punha sozinho

- Primeiro teste da 1.9 no aparelho da Luana: "Continuar com o Google" caiu
  na mensagem de erro "You CANNOT use scopes without modifying the main
  activity. Please follow the docs!". O caminho por e-mail continuou
  funcionando; a queda para o navegador não acontece nesse caso porque o erro
  vem do `login`, não do `initialize`, e é assim de propósito.
- **Causa lida no fonte do plugin, não deduzida:** `GoogleProvider.java`
  (8.3.40), linha 476: `if (scopesArray != null)` e a activity não implementa
  `ModifiedMainActivityForSocialLoginPlugin` → recusa. Nas linhas logo acima
  ele adiciona `profile` e `email` por conta própria. A gente mandava
  `["profile", "email"]`: a lista só servia para ligar a trava.
- Conserto de uma linha: no Android o login do Google não manda `scopes`; no
  iPhone segue igual, porque lá funciona. A alternativa, modificar a
  MainActivity, só faz sentido para scopes além de perfil e e-mail, que não
  usamos.
- Conferência: `conferir:login` lê o ramo do Android das opções do login e
  reprova se ele carregar `scopes`. Provada com o código da 1.9 plantado de
  volta.
- **Precisa de build novo.** O de 08/09 tem a caixinha quebrada. Se a 1.9 não
  chegou a produção, dá para subir outro build com o mesmo nome; se chegou, a
  próxima é 1.10 e a 1.9 entra em `JA_PUBLICADAS`.

## 2026-09-08 · SEO: os oito pontos da avaliação, e os que só existiam no papel

- O dono pediu para olhar o que o SEO publicou e dizer o que faz sentido e o
  que pode melhorar; depois, "vamos evoluir todos os pontos". Lido tudo: os
  quatro guias, a `/sobre`, o renderizador, o mandato, as duas rodadas
  anteriores e o único dado de busca que a casa guarda.
- **O NÚMERO, com janela e régua:** Search Console, 28 dias até 07/09, 0
  cliques e 7 impressões. Cinco são a marca "mentorque" (posição 1). **Uma é
  "carro nao quer pegar", posição 80**, a primeira consulta de categoria da
  história do site, num guia que até 07/09 não tinha link a partir da home.
  Isso ainda não avalia texto: canonical quebrado até 25/08, três guias quase
  órfãos até 07/09, duas semanas de páginas.
- **O que faz sentido e ficou:** o ângulo do método (estreitar pelo momento,
  pelo som, pela luz fixa ou piscando, por medir antes de trocar), as regras de
  honestidade com conferência, a `/sobre` com "o que não faz".
- **O que foi feito, todos com conferência provada mordendo (11 defeitos
  plantados, 11 reprovações, e uma asserção que NÃO mordeu na primeira
  tentativa, a do sitemap, porque lia o arquivo com o comentário que eu mesmo
  tinha escrito citando `lastModified`; consertada para ler sem comentário e
  procurar a linha de código):**
  1. Datas nos guias (`publicadoEm`, `atualizadoEm`), visíveis na página, no
     sitemap e no `Article`. O de gasolina ganhou `relerEm` 10/01/2027 e a
     conferência reprova quando passar.
  2. Dado estruturado: `Article` + `BreadcrumbList` sobre o grafo compartilhado,
     e o `FAQPage` fica sem a expectativa errada: FAQ rich result não existe
     para sites como o nosso desde 2023.
  3. "Não quer pegar" entrou no `/carro-nao-pega`, que é a frase que a única
     busca real usou.
  4. Links no meio do texto (`[[/caminho#ancora|texto]]`), seis entre os
     quatro guias, com caminho e âncora conferidos.
  5. Medição: `@vercel/analytics` no site (fora do app), e `topPaginas` no
     coletor do Search Console do n8n. As duas metades dependem de um clique do
     dono cada (lista).
  6. O preço da `/sobre` passou a vir de `content.ts`.
  7. Cartão de compartilhamento por guia em `/og/<caminho>`, com as fontes da
     marca, pelo mesmo `next/og` das peças.
  8. Cadência: o próximo tema está no mandato, escolhido pela única consulta
     real (partida e bateria).
- **ACHADO NO CAMINHO, e não estava na avaliação:** `SO_NO_SITE` só tinha o
  primeiro guia. Os três seguintes viajaram DENTRO do binário do app como
  páginas mortas desde que nasceram. Nada deu erro; o app só ficou maior. Agora
  a lista tem os quatro e o `og`, e a conferência compara com o registro. O
  `og` é rota dinâmica com desenho: fora da lista, ele DERRUBA a exportação
  estática, então este erro passaria a ser barulhento a partir de hoje.
- **A ferramenta do n8n não atribui credencial do Google** a nó HTTP (só as
  genéricas). O nó de páginas entrou sem credencial e com erro tolerado; o
  `normaliza` devolve `topPaginas: []` e `erroPaginas` até alguém escolher
  "Google account" no nó. Está na lista com o clique exato.
- **ATUALIZAR O FLUXO NÃO PUBLICA O FLUXO (09/09).** O retrato das 06:00 de
  09/09 veio sem `topPaginas` e sem `erroPaginas`: a coleta rodou o
  `normaliza` antigo. O `update_workflow` do n8n grava um RASCUNHO
  (`versionId`) e a rotina agendada roda a versão ativa (`activeVersionId`),
  que continuava a de antes. Faltava o `publish_workflow`, feito em 09/09 de
  manhã. Regra para quem mexer em fluxo por ferramenta: depois de atualizar,
  conferir que `versionId` e `activeVersionId` são o mesmo, senão a mudança
  parece aplicada e não roda nunca.

## 2026-09-08 · Conteúdo & SEO: aula de freio, e o app pergunta o que não sabe ensinar
- Artifact "Conteúdo da semana":
  https://claude.ai/code/artifact/12bd9ce0-9d29-40fb-a323-9eb0d21f4137
- ENTREGA DA RODADA (formato c, artigo do catálogo): aula
  `diag-freio-avisos`, "Freio: os avisos que vêm antes do barulho".
  Gratuita, trilha de Diagnóstico, PT+EN, formato estruturado, sem
  travessão. Ângulo escolhido para não repetir o que existe (a
  `diag-noises` é barulho por momento, a `diag-vibracao` é vibração por
  velocidade): o freio avisa MUITO antes de fazer barulho, pelo pedal
  (altura, curso, firmeza) e pelo reservatório de fluido.
- A parte que quase ninguém conhece, e é o miolo da aula: conforme a
  pastilha afina, o pistão avança mais e o espaço extra é preenchido por
  fluido do reservatório. O nível baixa devagar SEM vazamento nenhum, e o
  reservatório vira medidor de desgaste. Daí sai a consequência prática:
  completar sem olhar a pastilha é apagar o aviso, e o fluido volta e
  transborda no dia da troca.
- Ligada nos dois sentidos: a `brake-pads` e a `diag-noises` não tinham
  campo `related` nenhum, e agora apontam para a aula nova. Quem abre a
  troca ainda pode estar decidindo SE precisa trocar, e essa decisão não
  pode morar atrás do paywall. Entrou também na trilha "O que o carro diz".
- O RECORTE INTEIRO, como o feedback de 01/09 pediu. São 104 aulas
  publicadas (106 no arquivo, 2 agendadas para estrear com vídeo): motor
  52 (50%), geral 37, elétrica 6, pneus 5, suspensão 2, freios 2. Freio,
  suspensão e pneu somados são 9 de 104, e um deles é a aula de hoje.
  Desde 01/09 o catálogo ganhou 3 aulas publicadas, duas de motor e esta,
  e as duas agendadas (10 e 17/09) também são de motor.
- ACHADO QUE VALE MAIS QUE A CONTAGEM: o diagnóstico por sintoma é
  EQUILIBRADO e o acervo não. São 19 sintomas (motor 6, elétrica 4, freios
  3, suspensão 3, pneus 3), ou seja 47% deles são dos três sistemas
  sentidos, contra 9% das aulas. **O app pergunta sobre freio, suspensão e
  pneu quase tanto quanto sobre motor, e não tem para onde mandar a pessoa
  aprender quando ela responde que sim.** Serve de critério de escolha para
  quem programar conteúdo novo, não só para este papel.
- RELEITURA MARCADA DA BUSCA (o feedback deixou o número de 01/09 para
  reler): era 0 clique e 2 impressões em 28 dias, única consulta
  `mentorque`. Hoje são 0 cliques e 7 impressões, e as consultas viraram
  três: `mentorque` (4 impressões, posição 1), a mesma marca com operadores
  de site (1, posição 1, e isso é ferramenta e não gente) e **`carro nao
  quer pegar`, 1 impressão na posição 80: a primeira consulta de CATEGORIA
  da história**. Posição 80 é página 8, não é tráfego, é reconhecimento. O
  termo bate com o guia `/carro-nao-pega`, que já existe; o pacote traz
  consulta e não página, então não dá para afirmar daqui que a impressão
  foi nele e não na home.
- PRÓXIMA RELEITURA MARCADA PARA 06/10, com o que se faz em cada desfecho
  escrito no artifact. Ressalva que vale para os três: a campanha do Google
  começou em 01/09 e campanha faz subir busca por MARCA, então crescer em
  `mentorque` não conta como resultado de conteúdo.
- CONFERÊNCIA DESTRAVADA: o proxy desta sessão segue recusando o site, mas
  a API da Vercel responde e diz que o deploy de produção está READY no
  commit de hoje. Ou seja, os quatro guias estão no ar. O caminho ficou no
  manual para as próximas rodadas não pararem no "bloqueado".
- ALARME FALSO QUE QUASE FOI REPORTADO: o `conferir:appsflyer` reprovou, e
  este relatório chegou a dizer que o portão estava quebrado na main. Não
  estava. Aquela conferência olha um remendo aplicado por `postinstall`
  dentro de `node_modules`, que não é versionado, e o `node_modules` desta
  sessão era anterior ao remendo. Rodei o `scripts/conserta-appsflyer.mjs`
  à mão e o `npm run conferir` passa inteiro, exit 0. No CI o remendo entra
  sozinho, porque lá roda `npm ci`.
- Próximas: (1) pauta sobre amortecedor (suspensão tem 2 aulas e nenhuma
  é "o que a suspensão avisa"); (2) guia `/carro-puxando-para-um-lado`,
  que SUBSTITUI a LP de luz de injeção que eu mesmo tinha proposto, por
  dois motivos: era motor de novo, e o guia `/luz-da-injecao-acesa` já foi
  escrito por outra rodada. Puxar para um lado atravessa os três sistemas
  sentidos de uma vez e o app já tem `brake-pull`, `tire-uneven-wear` e
  `steering-vibration` para sustentar o texto.

## 2026-09-07 · Android: a folha nativa do Google entra no binário ("vamos fazer na caixinha")

- Decisão do dono, depois de eu explicar em uma frase o que estava na lista
  dele: o login com Google no Android abre a caixinha do sistema com as contas,
  como no iPhone, em vez de sair para o Chrome. O caminho do Chrome continua
  existindo como queda (`conferir:login`), e é ele que funciona hoje.
- **O risco que eu tinha apontado não existia.** A configuração
  `plugins.SocialLogin.providers` parecia global, mas o gancho do plugin só
  edita o **podspec**, e o projeto do iPhone puxa o plugin por **SPM**
  (`ios/App/CapApp-SPM/Package.swift`), que não lê podspec. Então `facebook:
  false` deixa o SDK do Facebook fora do Android e não muda nada no iPhone. Foi
  isso que destravou a entrada: sem o Facebook, não há `facebook_app_id` para
  faltar e o app não fecha na abertura.
- Provado daqui, sem SDK do Android: `npm run build:native` e `npx cap sync
  android` rodaram o gancho (`capacitor:sync:before`), que imprimiu "Facebook:
  disabled" e escreveu `socialLogin.facebook.include=false` no
  gradle.properties do plugin; o plugin entrou em `capacitor.settings.gradle` e
  `capacitor.build.gradle`, que são versionados e vão no commit. O Codemagic
  faz o mesmo `cap sync android` antes de compilar.
- **O que o build NÃO resolve, e está na lista do dono:** o Google só abre a
  caixinha se reconhecer pacote + assinatura. Precisa de um cliente OAuth do
  tipo Android no mesmo projeto do cliente Web, com `mentorque.app` e os DOIS
  SHA-1 (chave de upload do Codemagic e chave do Play App Signing). Sem isso
  recusa com "Developer console is not set up correctly" e o app cai no
  Chrome, que é o de hoje. E se a tela de consentimento estiver em Testing, as
  contas de teste precisam estar na lista.
- O README do plugin foi a fonte disso tudo, e vale a pena: ele imprime no
  Logcat (filtro `GoogleProvider`) o SHA-1 e o pacote que o Google viu, para
  comparar com o console. Está no roteiro da 1.9.
- **Feito pelo dono no mesmo dia, guiado tela a tela:** os dois clientes OAuth
  do tipo Android existem no Google Cloud, no mesmo projeto do cliente Web
  (mesmo prefixo de client id), um com o SHA-1 da chave de assinatura do app e
  outro com o da chave de upload, os dois com o pacote `mentorque.app`. O
  caminho no Play Console mudou de lugar e vale registrar: Protegido com o
  Google Play → Proteção da Google Play Store → Assinatura de apps; o SHA-1
  certo é o da "Chave clássica", não o da pós-quântica (Beta). A ação saiu da
  lista. O Google avisa que pode levar de 5 minutos a algumas horas para valer.
- **A tela de consentimento estava em Testing, não em produção**, com zero test
  users: nesse estado a caixinha abre e recusa todo mundo. O dono achou que
  estava em produção; o retrato dizia o contrário. Branding preenchido com os
  três links do site (home, /privacidade, /termos), sem logo de propósito, que
  é o que dispara verificação; e "Publish app" confirmado. Com três domínios e
  só e-mail e perfil, não pede verificação. As duas ações (test users e
  Supabase) saíram da lista: o Supabase já tinha os dois client ids, o Web e o
  do iPhone. O do iPhone é de OUTRO projeto do Google Cloud (prefixo
  `43445984392`); funciona, porque o Supabase aceita qualquer id da lista, mas
  são dois projetos para manter.

## 2026-09-07 · Banco: a cota estourou de novo, e a causa era uma coluna que ninguém lia mais

- O dono trouxe o painel do Supabase: Database Size 0,527 de 0,5 GB (105%),
  "novamente". Fui olhar tabela por tabela em vez de chutar: `manual_chunks`
  tinha **475 MB dos 527**, e 422 MB eram TOAST, o armazenamento fora de
  linha. Tudo o mais (funil, usuários, erros) somava menos de 2 MB.
- **A causa:** a tabela guardava DUAS colunas de embedding. `embedding
  vector(1536)`, a da OpenAI abandonada em 05/09 quando a conta ficou sem
  crédito, com 167 MB em 28.426 linhas que nada mais lia; e
  `embedding_voyage vector(1024)`, a em uso, com 140 MB em 100% das 35.717
  linhas. O texto eram 45 MB. A diferença até 475 (~120 MB) eram versões
  mortas dos 28 mil UPDATEs do backfill da Voyage, que o autovacuum comum não
  devolve ao disco.
- Conferido antes de apagar, e não suposto: a `match_manual_chunks` viva no
  banco compara só em `embedding_voyage`; o código só escreve
  `embedding_voyage`; e não havia índice em nenhuma das duas colunas (o total de
  índices da tabela era 2,8 MB).
- Decisão do dono: apagar a coluna antiga e compactar. Migração
  `remove_embedding_openai_1536` e `VACUUM (FULL, ANALYZE)`. **Resultado: a
  tabela foi de 475 MB para 245 MB e o banco inteiro de 527 MB para 259 MB.**
  Metade da cota livre. O painel do Supabase pode levar até uma hora para
  mostrar.
- A ferramenta estourou os 60 segundos dela no meio do VACUUM FULL, e isso não
  diz nada sobre o banco: fui ver `pg_stat_activity` e
  `pg_stat_progress_cluster` (vazios) e o tamanho novo, em vez de supor que
  tinha terminado ou que tinha falhado.
- **A lição, registrada também em `supabase/embedding-voyage.sql`:** uma troca
  de provedor de embedding é uma coluna nova E uma coluna velha, e a velha
  precisa de data para sair. Sem isso ela fica, e 6 KB por trecho vezes trinta
  mil trechos é a cota inteira. O "novamente" do dono é exatamente isso: da
  primeira vez o banco cresceu com a ingestão dos 112 manuais em 06/09, e a
  coluna morta veio junto sem ninguém contar com ela.
- De passagem, a limpeza da cópia de `resizeImage` na Gamification, que eu
  tinha sugerido como tarefa separada e o dono mandou para esta sessão: a
  tela importa a função de `lib/app/image.ts` com o mesmo tamanho e qualidade
  de antes. Tipos, lint e a suíte `selo` verdes.

## 2026-09-07 · Produto: o ajuste de foto, como no WhatsApp, para o carro e o perfil

- Pedido do dono, na mesma rodada dos relatos do Android: "usuário escolhe a
  foto, se for grande, aparece um campo para selecionar qual parte da foto ele
  quer, da mesma forma que funciona no WhatsApp e no Facebook". Para a foto do
  carro e a do perfil.
- **As duas molduras são quadradas** (o carro aparece em caixas de h-12 a h-16
  com object-cover; o perfil é o círculo), então o recorte é 1:1 nos dois e o
  que sai é um quadrado. "Se for grande" virou regra: a foto passa pelo ajuste
  quando NÃO cabe do jeito que está, ou seja, proporção diferente da moldura ou
  maior do que o que é guardado. Foto já quadrada e pequena entra direto, como
  sempre entrou, sem tela a mais para não decidir nada.
- **A conta mora fora da tela**, em `lib/app/recorte.ts`, em funções puras, e é
  exercitada com números pela `conferir:recorte`. A tela
  (`components/app/AjusteDeFoto.tsx`) só mede a moldura, ouve os dedos e
  desenha. Dois jeitos de aproximar: a pinça, que é o gesto que a pessoa
  espera, e uma barra, para um dedo só, para o navegador de mesa, e para a
  conferência conseguir mexer no zoom, porque Playwright não faz pinça.
- **A CONFERÊNCIA MORDEU ANTES DE EU PLANTAR NADA.** A primeira versão da conta
  arredondava `x` para baixo e o tamanho para cima, cada um por conta própria,
  e no limite da borda `x + largura` passava da imagem em 1 pixel por erro de
  ponto flutuante. A varredura de gestos acusou cinco casos. Um pixel a mais
  pedido ao canvas é uma linha preta na borda da foto pronta, que é exatamente o
  que a regra da cobertura promete que não acontece, e nenhum teste de texto
  veria. Agora arredonda para o pixel mais próximo e PRENDE o retângulo dentro
  da imagem, tamanho primeiro e posição depois.
- E depois disso, dos cinco defeitos plantados, um não mordeu: a regra que
  ignorasse a proporção passava, porque o único caso 4:3 da conferência também
  era maior que o alvo, e o tamanho sozinho já dizia sim. Entrou o caso
  pequeno e 4:3, que só a proporção pega.
- **A ligação inteira roda no navegador**, em `conferir:navegador foto`: a foto
  gerada em PNG cru (800x600 para forçar o ajuste, 200x200 para dispensá-lo)
  entra pelo campo, a tela abre, a barra e o arrasto mexem na foto, usar
  recorta um JPEG 800x800 quadrado que vai para o carro e sobrevive à recarga;
  cancelar preserva a foto de antes. A suíte quebrou duas vezes antes de
  chegar lá, as duas na própria suíte e não no app: o item da lista de carros
  é `<div role="button">` (o seletor por tag não o vê), e a folha de escolha
  tem dois botões `close`, o fundo e o X, e o fundo fica coberto pelo painel.
- O que só o aparelho responde, e está no roteiro da 1.9: a pinça com dois
  dedos, e a moldura sem borda vazia durante o gesto.

## 2026-09-07 · Android: a foto do Google e o toque na câmera, os dois achados em aparelho de verdade

- O dono instalou a segunda 1.8 no Android da Luana. **O login funcionou**, que
  era o conserto principal daquele build. E apareceram dois defeitos que nenhuma
  suíte nossa alcança, porque os dois moram no WebView do Android.
- **A FOTO DO GOOGLE.** O dado estava certo, conferido no banco: as quatro
  contas Google têm `avatar_url` e `picture`, iguais entre si, com a URL
  completa do lh3 terminando em `=s96-c`. Quem falhava era o carregamento, e dá
  para saber disso pela tela: o desenho de quem não tem foto é a INICIAL do
  nome, e o que apareceu foi um círculo vazio, ou seja, o `<img>` estava lá e
  quebrou.
- A hipótese, e ela explica a assimetria: o Android serve a página de
  `https://localhost` (androidScheme "https"), então a busca da imagem sai com
  `Referer: https://localhost/`. No iPhone o esquema é `capacitor://`, que não é
  http, e o WebKit não manda Referer nenhum, que é exatamente onde a foto sempre
  funcionou. `referrerPolicy="no-referrer"` tira o cabeçalho da jogada.
- **ISSO NÃO FOI VISTO NUM APARELHO, e está escrito assim no código e no
  roteiro da 1.9.** Por isso o conserto vem em duas partes: a hipótese, que pode
  reprovar, e o `onError` caindo para a inicial do nome, que vale com causa ou
  sem causa. Falhar mostrando a inicial é honesto; falhar mostrando um buraco
  parece defeito de desenho e não conta nada a ninguém.
- **O TOQUE NA CÂMERA.** A causa está no Capacitor 8.5.0, lida no fonte
  (`BridgeWebChromeClient.onShowFileChooser`): ele lê o atributo `capture` do
  campo e escolhe UM caminho. Com `capture`, `ACTION_IMAGE_CAPTURE`, que é a
  câmera direta. Sem, `showFilePicker`, que é o seletor de documentos, e foi a
  tela de "Recentes" que o dono viu. **A ponte não tem o terceiro caminho**, que
  é oferecer os dois. Então a pergunta virou nossa, com dois campos por trás.
- Sem plugin novo e sem permissão nova, e isso foi conferido, não suposto: o
  Capacitor só pede `CAMERA` quando o app DECLARA a permissão no manifesto
  (`isMediaCaptureSupported`), e o nosso manifesto tem só INTERNET,
  ACCESS_NETWORK_STATE e AD_ID. O `@capacitor/camera` resolveria também, e
  custaria dependência nova, permissão na ficha da Play e strings de uso no
  Info.plist do iPhone, para um problema que o iPhone não tem.
- **A CONFERÊNCIA REPROVOU CÓDIGO CERTO, e foi o melhor que aconteceu hoje.** A
  asserção nova do `capture` falhava no código correto: a limpeza de comentários
  da `verifica-aviso.ts` trata qualquer `/*` como abertura de bloco, e o Perfil
  tem `accept="image/*"`. Aquele `/*` abria um comentário que só fechava num
  `*/` lá adiante, e TUDO no meio sumia da conferência, calado, desde antes de
  hoje. Agora o `/*` só abre bloco depois de espaço ou começo de linha.
- É a terceira vez que a limpeza de comentários dessa conferência ensina alguma
  coisa (03/09, 07/09 de manhã, e esta). O padrão comum: conferência que lê
  texto erra em silêncio, e só um defeito plantado ou uma reprovação estranha
  traz alguém olhar.

## 2026-09-07 · Release: a segunda 1.8 foi para a Play, e a conferência que pegaria isso estava calada

- O dono enviou um build do Android para a Play com os quatro consertos do dia.
  Fui conferir como o dado ia distinguir esse build do anterior e a resposta é
  que não ia: `android/app/build.gradle` seguia em `versionName "1.8"` e o
  `APP_VERSION` em `"1.8.0"`, os mesmos da versão publicada em 04/09.
- **O ESTRAGO É CEGUEIRA.** O `funil_eventos.versao` e o `app_erros.versao`
  carregam o `APP_VERSION`, então um aparelho COM os quatro consertos e um SEM
  eles respondem "1.8.0" os dois. Não há pergunta que separe. Nos Android vitals
  do Google continua separável, porque o `versionCode` sobe a cada envio e a
  Play guarda; a cegueira é só na nossa instrumentação, que é justamente a que a
  gente consulta.
- **A CONFERÊNCIA QUE PEGARIA ISSO JÁ EXISTIA.** A `conferir:versoes` reprova
  quando a versão do repositório já está em `JA_PUBLICADAS`. Ela aprovou porque
  a `1.8` nunca foi acrescentada à lista quando subiu, em 04/09.
- E o comentário do próprio arquivo dizia: "Esquecer é seguro (a conferência
  apenas deixa de avisar), enquanto o contrário, subir de novo uma versão já
  publicada, custa um build inteiro." **Estava incompleto, e agora dá para
  dizer por quê.** Esquecer não é seguro: quem esquece de listar a versão
  publicada também fica sem o aviso de que o repositório PAROU nela. É o mesmo
  esquecimento produzindo os dois lados do problema, e a lista escrita à mão é
  o que liga um ao outro.
- Decisão do dono: a entrega sai como está, e o repositório sobe para 1.9.
  Trocar agora custaria mais uma rodada de revisão do Google e atrasaria quatro
  consertos que estão prontos. A 1.8 entrou na lista com o episódio escrito ao
  lado dela, que é o que sobra para a próxima pessoa.
- **O que ficou aberto:** a lista continua dependendo de memória, e a 1.9 vai
  cair na mesma armadilha quando for publicada. O conserto que mata a classe é
  gravar o `versionCode` junto do nome nos eventos (o `@capacitor/app` está nos
  dois binários e o `getInfo()` devolve ele), porque ele sobe sozinho a cada
  envio e não depende de ninguém lembrar de nada. Mexe no esquema do funil, que
  é instrumentação delicada, então é decisão do dono e não foi feito nesta
  rodada.

## 2026-09-07 · SEO: três das quatro páginas de palavra-chave não tinham link a partir da home

- Rodada aberta pelo dono com um retrato do Search Console: três motivos de não
  indexação, "Erro de redirecionamento" e "Página com redirecionamento" (fonte
  Site) e "Detectada, mas não indexada" (fonte Google).
- **O QUE ESTÁ CERTO, e foi conferido um a um, para ninguém reabrir isto:** o
  sitemap tem as 11 URLs, todas em `www` e todas 200; o canonical de cada página
  indexável aponta para ela mesma em `www`; o apex responde 308 limpo para o
  `www`, um pulo só; os quatro atalhos de venda (`/ALE100` e irmãos) são 307 de
  um pulo para `/app`, que é `noindex, nofollow`; nenhuma cadeia, nenhum laço.
- **O DEFEITO REAL, e ele não aparece em nenhum dos três motivos com esse
  nome:** o rodapé da home tinha `/barulho-no-carro` ESCRITO À MÃO, de quando
  ele era o único guia. Os três seguintes subiram, entraram no sitemap por
  construção, abriram, funcionaram e ficaram sem NENHUM link a partir da home. O
  único caminho até eles era o bloco de irmãos no pé de outro guia. A `/sobre`,
  que é a segunda página de mais autoridade, tinha o mesmo caminho fixo no
  rodapé próprio dela.
- É o mesmo defeito que o registro `lib/site/guias` foi criado para matar, num
  lugar que ele não alcançava. O sitemap passou a ler do registro; o rodapé
  ficou de fora e continuou de lista escrita à mão. Nada deu erro: as páginas
  abrem, o sitemap está certo, e para site novo link interno é metade da chance
  de a página ser rastreada. O Search Console não diz "faltou link": diz
  "detectada, mas não indexada".
- Conserto: `lib/site/guias/links.ts`, lista leve de caminho e rótulo (o rodapé
  é componente de cliente e importar o registro arrastaria o corpo dos quatro
  guias para o pacote do navegador). A `conferir:guias` compara as duas listas
  nos dois sentidos e cobra que as duas portas leiam dela. Três defeitos
  plantados, três reprovações.
- **O QUE EU NÃO CONSIGO RESPONDER DAQUI, e não vale adivinhar:** quais URLs
  estão em "Erro de redirecionamento". A saída de rede para o domínio é
  bloqueada neste ambiente e o Search Console não tem porta para agente. Todas
  as formas de URL que dá para deduzir do código respondem certo. A lista sai em
  dois toques: no Search Console, tocar na linha do motivo, ou EXPORTAR.
- Achado de lado, que não é causa dos três motivos mas é sujeira: o projeto tem
  três domínios `.vercel.app` públicos servindo o site inteiro, e o
  `mentorque-ten.vercel.app` é ALIAS DE PRODUÇÃO, então não ganha o `noindex`
  automático que a Vercel dá aos previews. O canonical de lá aponta para o
  `www`, que é o que segura; some do índice como "página alternativa com tag
  canônica adequada", que é um motivo diferente dos três do retrato.

## 2026-09-07 · Engenharia: o espelho do interruptor seguia o aparelho demais, e desligar tinha virado impossível

- Rodada curta, e ela existe porque o conserto da rodada anterior, feito neste
  mesmo dia, TROUXE UM DEFEITO. O dono perguntou "você consegue ver se ele está
  ligado antes de mandar ligar?", e ir conferir a resposta é que descobriu.
- **O que eu quebrei:** o espelho forçava o interruptor a seguir a permissão do
  sistema nos DOIS sentidos. Com a permissão concedida, desligar virou
  impossível: o toque desligava, o efeito rodava de novo, via o sistema dizendo
  "concedida" e religava. O interruptor do Perfil é o jeito documentado de parar
  o lembrete do quiz, e ele tinha parado de parar.
- Os dois sentidos não são simétricos, e é isso que o conserto reconhece. SEM
  permissão, ligado é MENTIRA: nada é agendado, o estado não existe no aparelho.
  COM permissão, desligado é ESCOLHA, e o app não tem o que discutir. Sobram
  dois casos em que ligar sozinho é certo, e nos dois a pessoa pediu: a primeira
  olhada (a discordância é resto de estado velho) e a permissão que mudou no
  aparelho desde a última olhada (ela foi aos ajustes e ligou lá).
- A regra saiu da tela para `lib/app/espelhoDoAviso.ts` e a conferência a
  exercita DE VERDADE, com seis casos, em vez de ler o texto do componente.
  Nenhuma conferência de texto pegaria "o interruptor religa sozinho": era
  comportamento, não trecho ausente. O caso que teria pego o defeito no mesmo
  minuto é "com permissão, quem desliga no app CONTINUA desligado".
- **A resposta à pergunta dele é sim, e o botão que ele pediu já existia.** O
  `podeConvidar` pergunta ao sistema antes de mostrar qualquer coisa, então o
  convite nunca aparece para quem já tem a permissão. E o convite do pós-quiz
  está no ar desde antes: o que ele não viu foi o controle único de
  `lib/app/pedidoDeAviso.ts` segurando (um a cada 4 dias, três na vida do
  aparelho, nunca com a permissão já dada). A frase virou a dele, palavra por
  palavra: "Quer receber a pergunta de amanhã?".
- O convite tinha o MESMO beco sem saída do interruptor, e aqui é mais comum:
  o `podeConvidar` não distingue "nunca perguntei" de "já negaram de vez", de
  propósito, para não atravessar a ponte nativa no instante em que a pessoa
  responde o quiz (que é o caminho onde o app já fechou na mão de gente). Então
  o cartão aparece para quem o sistema já negou, o `pedirPermissao` devolve não
  sem abrir caixa nenhuma, e o cartão sumia sem nada acontecer. Agora vai para
  os ajustes, como o Perfil.
- **A lição, e ela é sobre mim:** o pedido do dono ("se estiver ligado, não pode
  mostrar desligado") descrevia um sentido, e eu implementei os dois. Ler o
  pedido como uma regra simétrica foi o erro, e ele custou o botão de desligar.

## 2026-09-07 · Engenharia: o interruptor de avisos mentia, e o portão do login nativo quase apagou o login do Android

- Rodada de relatos do dono, dois no mesmo minuto e com a mesma causa: "mudei o
  toggle para Ligado e não aconteceu nada, não levou para configurações" e "o
  toggle deve refletir as configurações do aparelho, se estiver ligado, não pode
  mostrar desligado".
- **O interruptor de avisos podia estar ligado com a permissão do sistema
  ausente, e nesse estado TODO agendamento desistia em silêncio**, porque o
  `sincronizarLembreteQuiz` sai fora sem permissão. Interruptor ligado, nenhum
  aviso agendado, e nada na tela dizendo isso. Agora a verdade é o sistema: o
  Perfil pergunta na montagem e reconfere ao voltar dos ajustes, porque liberar
  a permissão acontece fora do app e voltar de lá não remonta a tela.
- O caminho para os ajustes só existia quando o sistema já tinha negado de vez.
  Em todos os outros nãos o toque não fazia nada visível. Quem liga está pedindo
  para receber, então agora vai para os ajustes sempre que o pedido não termina
  em permissão, e a linha bloqueada inteira também abre os ajustes.
- **O QUASE-ACIDENTE, achado enquanto eu conferia o próximo passo do Android.**
  Ontem o portão do login nativo foi aberto para o Android, com a
  `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` como chave, e o dono já a configurou no
  Codemagic. Só que o `@capgo/capacitor-social-login` NÃO está no
  `android.includePlugins`: no Android o `import` resolve, o lado nativo não
  existe, o `initialize()` falha e o pedido morre. **Com a variável no build, o
  próximo APK teria ficado sem login do Google nenhum**, porque o portão abria
  para o nativo e o caminho do navegador, o único que o Android tem hoje, nem
  chegava a ser tentado. Um interruptor que devia somar um caminho apagava o
  outro.
- Conserto: o `auth.tsx` cai para o navegador quando o caminho nativo não
  existe, e só pelos dois motivos que nascem ANTES de a folha abrir. Depois da
  folha, desistência é desistência. A `npm run conferir:login` lê o `auth.tsx`,
  o `socialLogin.ts` e o `capacitor.config.ts` juntos, que é a distância por
  onde o defeito passou.
- **O motivo documentado para o social-login ficar fora do Android caducou.** O
  `docs/android-local.md` dizia que ele arrasta o SDK do Facebook, que derruba o
  app sem `facebook_app_id`. Verdade até a versão 8.3.40 do plugin, que aceita
  `plugins: { SocialLogin: { providers: { facebook: false } } }` e deixa o SDK
  de fora. O que ainda segura é que essa chave é global e mexeria também no
  binário do iPhone, que hoje funciona. Isso virou linha na lista do dono: é
  decisão de build das duas lojas, com teste em aparelho, não de repositório.
- Conferências provadas mordendo, uma por defeito plantado: três no Perfil e
  cinco no login. **Uma delas não mordeu na primeira tentativa** e o registro
  disso está no `mapa-do-codigo.md`: eu enumerei os motivos de queda no script e
  conferi contra o código, então um motivo A MAIS no código passava por fora da
  conferência inteira. Agora ela lê a lista do código e a minha vira só o mínimo
  exigido.
- **Recomendo, na ordem:** (1) decidir o social-login no Android, porque sem ele
  a variável já configurada não liga folha nativa nenhuma; (2) pôr o mesmo
  client id em "Authorized Client IDs" no provider Google do Supabase, senão a
  folha nativa morre no último passo com "invalid audience"; (3) gerar o build
  do Android, que é o que leva o conserto da tela de login (`81bec94`) e este
  para os aparelhos.

## 2026-09-07 · Engenharia: o Android nunca teve uma conta, e a testemunha do crash vigia a plataforma errada

- Rodada nascida da pergunta que o Diretor deixou ABERTA hoje: Android e iPhone
  terminam melhor o onboarding e geraram zero contas na semana. Fui separar as
  duas explicações dele e as plataformas se comportam diferente.
- **O NÚMERO: em quatro semanas e 160 eventos, NENHUM evento do Android
  carregou conta.** iPhone e web carregam desde 24/08. No iPhone a explicação
  inocente vale (6 eventos com conta, 2 contas: são usuários que já tinham).
  No Android não vale.
- Não é falha de instrumentação, e isso foi conferido: só três eventos carregam
  conta por desenho (`viu_paywall`, `iniciou_checkout`, `cadastro`). No iPhone o
  mesmo `viu_paywall` traz conta em 9 de 9; no Android, em 0 de 6. Os aparelhos
  do Android que viram o paywall estavam DESLOGADOS.
- **A CAUSA PROVÁVEL, no portão:** `canNative` em lib/app/auth.tsx exigia
  `nativePlatform() === "ios"`. O Android nunca alcançava o login nativo, mesmo
  com o caminho dele inteiro do outro lado (o plugin recebe `webClientId`, que é
  exatamente o que o Android pede). Sobrava só o caminho do navegador, e ele
  nunca produziu uma conta.
- Conserto: o portão agora separa por PROVEDOR (a folha da Apple é
  ASAuthorization e só existe no iPhone; a do Google existe nos dois). A guarda
  continua sendo o client id, então SEM a variável nada muda. Ligar o Android é
  decisão consciente, e o que ela exige está no `.env.example`.
- Assimetria que causou tudo, e vale como lição: o client id do iPhone tem valor
  de RESERVA no código, com o comentário ao lado explicando por quê ("subir um
  build sem a variável e descobrir no aparelho que o botão não faz nada"). O
  Android ficou sem a mesma proteção, e o modo de falha previsto aconteceu nele.
- **A TESTEMUNHA VIGIA A PLATAFORMA ERRADA.** A migalha de fechamento foi
  construída para pegar o app fechando no quiz do Android. Desde que subiu
  produziu SEIS relatos: seis na web, zero no Android. Na web a mesma evidência
  tem explicação inocente (fechar o navegador não deixa JavaScript rodar), e o
  ruído caía justamente na `app_erros`, que é onde o QA procura o crash. Agora
  ela só relata no app das lojas.
- **E ela é cega por construção para o defeito que caça:** só fala na ABERTURA
  SEGUINTE. Um fechamento ruim o bastante para a pessoa desistir a deixa muda
  para sempre. Foi o que houve: os três aparelhos Android na 1.8.0 que
  responderam o quiz entre 04 e 06/09 nunca mais produziram evento nenhum.
- Por isso entrou um vigia que não depende de ninguém voltar:
  `public.anomalias_da_operacao`, lida pelo retrato diário. Porta única, como o
  `funil_canonico`.
- **Ela contradisse a suspeita que a motivou**, e isso é o melhor que uma
  ferramenta dessas faz: "respondeu o quiz e sumiu" aparece no Android (5), no
  iPhone (4) e na web (2). Espalhado assim parece gente terminando o que veio
  fazer, não assinatura de crash. Fica como indício comparável, e está escrito
  assim no SQL.
- CORREÇÃO MINHA no meio da rodada: afirmei que a 1.8 não estava publicada e
  que por isso o Android não tinha a migalha. Errado. O dono corrigiu e o dado
  confirma: Android com 1.8.0 em 9 aparelhos desde 04/09 16:34. Eu inferi da
  frase "1.8 preparada" no relatório em vez de olhar a coluna `versao`, que
  estava a uma consulta de distância.
- Entrou também a lista `docs/agentes/acoes-do-dono.md`, com `npm run acoes`:
  há quantos dias cada coisa que só o dono faz está parada. O caso que motivou:
  as negativas do Google Ads estão escritas desde 03/09 e seguem sem aplicar,
  enquanto a campanha gasta uns R$ 35 por dia num público que o próprio
  relatório mediu como errado. O relatório é semanal e cobra a semana anterior,
  então quatro dias parados ainda não tinham chegado a nenhuma cobrança.
- Conferência nova (`conferir:anomalias` e `conferir:acoes`), com os defeitos
  plantados e gritando: guarda do nativo removida, função renomeada só no SQL,
  campo sumido do retrato, data no futuro e coluna faltando.

## 2026-09-07 · Diretor: relatório da semana (31/08 a 06/09)
- Artifact "Semana Mentorque":
  https://claude.ai/code/artifact/fc47b4e6-ac15-4c23-a9ec-fe5a8a743524
- Banco conferido no começo da rodada, conforme o direcionamento de 31/08.
- **O NÚMERO: 8 contas novas de gente de fora, contra 2 na semana anterior.**
  Sete carregam `google / lancamento`; a oitava (02/09) entrou sem etiqueta.
  É a primeira origem de aquisição que aparece nos dados do produto.
- CAUSA E EFEITO DATADO: a captura de etiqueta subiu para todas as páginas em
  03/09 e o primeiro cadastro atribuído é de 04/09. Antes disso a campanha já
  tinha gasto R$ 91,04 sem nada aparecer do nosso lado.
- CRUZAMENTO COM A PORTA DE ENTRADA (a conferência que faltou em 31/08, e que
  agora fecha): 114 cliques pagos > 53 anon_id > 8 contas. Ordem coerente. Na
  semana passada não fechava, e era esse o sinal de que o 17 media outra coisa.
  App Store: 0 downloads na semana (1 atualização em 05/09); as 8 contas são
  todas `plataforma = web`, o que casa com campanha de busca.
- **AS 8 CONTAS, CONFERIDAS UMA A UMA** (desta vez a frase é literal): 3
  salvaram carro, 1 registrou serviço (a que assinou), e NENHUMA voltou num
  segundo dia. Ressalva registrada: só 3 delas já tiveram janela de 3 a 5
  dias; as outras 5 nasceram em 05 e 06/09 e é cedo. Sinal ruim e ainda
  pequeno, não provado.
  - Tropeço meu no caminho, registrado no relatório: a primeira consulta
    procurou carros em `data->'cars'` e devolveu zero para todo mundo. A
    chave é `vehicles`. Conferi a estrutura antes de escrever.
- DINHEIRO: R$ 194,01 gastos (114 cliques, 3.344 impressões, CPC R$ 1,70),
  contra R$ 0,00 na semana anterior. No pedaço em que a etiqueta já grudava
  (04 a 06/09), R$ 102,97 compraram 7 contas: **R$ 14,71 por conta**,
  R$ 51,48 por conta que salvou carro, e nenhuma assinatura.
- Assinantes: 3 reais (2 `active`, 1 `trialing`), +1 na semana (asueyoshi,
  02/09, SEM etiqueta de campanha). Receita recebida R$ 0,00. MRR de tabela
  R$ 89,70; o coletor mostra R$ 59,80 porque não conta quem está em teste.
- OBSERVAÇÃO PARA O DONO OLHAR, não conclusão: as conversões que o Google
  registra (toque no botão de baixar) aconteceram em 02 e 03/09 e estão em
  ZERO todos os dias desde 04/09. A LP mudou em 03/09. Pode ser coincidência
  ou a ação de conversão ter parado de disparar; se for a segunda, o lance
  automático está sem sinal desde então.
- PERGUNTA ABERTA PARA O QA, não respondida aqui: Android (32 começaram, 21
  terminaram) e iPhone (7 e 6) terminam o onboarding muito melhor que a web
  (66 e 15) e geraram ZERO contas na semana. Ou quem está no app das lojas já
  tinha conta, ou o cadastro pelo app não está criando conta. São explicações
  muito diferentes.
- PLACAR de 31/08, as três FEITAS, com prova: (1) faturas conferidas, viradas
  de 01/09 23h52 e 04/09 13h20 com total zero; (2) 1.5 publicada em 31/08
  (código 51) e a 1.6 e a 1.7 também estão no ar; (3) retrato consertado, as
  11 fontes com zero dias parados hoje contra 8 dias paradas.
- PROMESSA QUE NÃO DEU PARA CUMPRIR COMO ESCRITA, e está dito no relatório:
  eu ia medir a passagem "abriu o app → criou conta" contra os 12% de 31/08.
  Aquele denominador era de anon_id, então a comparação produziria outro
  número errado. Trocada pela régua de contas: 2 → 8.
- Prioridades: (1) descobrir por que o app fecha no quiz do Android, porque a
  campanha está comprando gente para um app que trava logo no começo e os
  Android vitals da 1.7 ainda não foram olhados; (2) aplicar as negativas do
  Google Ads (curso, certificado, senai, apostila, presencial), que estão
  escritas desde 03/09 enquanto a campanha gasta uns R$ 35 por dia; (3)
  decidir o que a pessoa recebe no dia seguinte, com o push pronto e
  desligado desde 28/08, e segurar o orçamento até essa decisão sair.
- Sem prazo vencendo antes da próxima rodada. Em 09/09 termina o teste do
  terceiro cliente e a fatura sai zerada pelo cupom, o que já está previsto e
  não pede alarme.

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
  `Funil e banco (/api/funil):401` Uma falha de 22/08. O
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
  bem é pior que não alertar: oito e-mails de nada ensinam o dono a ignorar o
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
