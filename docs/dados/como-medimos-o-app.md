# Como medimos o app: o desenho inteiro, para repetir noutra empresa

Guia escrito em 11/10/2026, a partir do que está no código, no banco e nos
documentos do Mentorque. Diz **o que mapear**, **como gravar**, **como ler sem
se enganar** e **o que custou errar**. O inventário do que já é medido hoje
está em `docs/dados/o-que-medimos.md`; o método de análise, em
`docs/agentes/skills/analise-da-operacao.md`; as armadilhas de leitura, na
skill `.claude/skills/ler-a-operacao`. Este arquivo é o mapa que liga tudo.

Em uma frase: **o app emite eventos de comportamento com uma identidade de
aparelho; o servidor confirma os fatos financeiros com o processador; um
coletor traz as fontes de fora uma vez por dia; e um retrato diário junta
tudo com a janela e a régua escritas do lado de cada número.**

## 1. As três camadas, e de quem é cada número

| camada | quem escreve | o que grava | tabela |
|---|---|---|---|
| Comportamento | o app, pela rota `/api/funil` (fire-and-forget, nunca trava a tela) | abriu, começou onboarding, cadastrou carro, viu paywall, tentou assinar, usou um recurso | `funil_eventos` |
| Fato financeiro | só o servidor, nos webhooks do Stripe e do RevenueCat e no `/api/stripe/sync` | assinou, renovou, cancelou, expirou | `funil_eventos` (a rota do app RECUSA estes quatro) e `subscriptions` |
| Fontes de fora | o coletor do Analista (n8n, 5h30), pela rota `/api/metricas` | Google Ads, Meta, AppsFlyer, Search Console, App Store Connect, Play Console, RevenueCat, Stripe, AdMob, YouTube | `metricas_diarias`, uma linha por dia e por fonte |

A regra que atravessa as três: **ninguém fabrica conversão via fetch**. O app
nunca escreve "assinou". E quando existe uma tabela com o fato gravado
(contas em `auth.users`, assinaturas em `subscriptions`, carros no estado da
conta), **a tabela ganha do evento**: evento é para o que não deixa rastro em
lugar nenhum.

## 2. Quem é a pessoa: a identidade

- **`anon_id`**: um id criado no aparelho (localStorage) antes de qualquer
  login, carimbado em todo evento. É o que liga "abriu" a "cadastrou" na
  mesma pessoa sem exigir conta. Não identifica ninguém fora do app.
- **`user_id`**: a conta, quando existe. Desde 21/09/2026 ele viaja em TODO
  evento de quem está logado, não só nos quatro de venda. Sem isso, retenção
  era contada por armazenamento de navegador: quem usou na web e depois
  instalou o app contava como duas pessoas, e a segunda parecia alguém que
  nunca voltou.
- **Sem armazenamento** (modo privado, WebView que não guarda): o app grava
  o texto `sem-armazenamento` como `anon_id`, e a função `public.identidade`
  do banco DESCARTA esse prefixo. Antes dela, oito views tinham a expressão
  `coalesce(anon_id, user_id)` copiada, e todos os aparelhos sem
  armazenamento viravam UMA pessoa.
- **Uma função, uma régua**: `public.identidade(anon_id, user_id)` é a única
  definição de "quem conta como gente". Toda view e toda leitura passa por
  ela. Regra que mora em oito lugares não é regra.

## 3. O catálogo de eventos: como um evento nasce

Cada evento é uma pergunta de negócio que não tinha resposta. O arquivo
`lib/app/funil.ts` guarda, em comentário acima de cada um, **a data e a
pergunta que o fez nascer**. Isso é o que impede a lista de virar lixo.

O que cada evento carrega:

| campo | o que é | por quê |
|---|---|---|
| `anon_id`, `user_id` | a identidade (seção 2) | |
| `plataforma` | ios, android, web | o mesmo defeito tem cara diferente em cada uma |
| `versao` | a versão do app que emitiu | sem ela, "este aparelho está na versão nova?" não tem resposta; o número apodreceu por duas versões antes de entrar na conferência |
| `origem` | de onde veio o evento (a tela, o atalho, o id da aula, o motivo) | é o que transforma uma contagem em leitura: `clicou_atalho` sem `origem` seria decoração |
| `extra.utm` | a campanha de onde a pessoa chegou, com `gclid` do clique pago | capturada no layout raiz do site, em qualquer página, e carimbada até a assinatura |
| `extra.exp` | as variantes de experimento que o aparelho está vendo | a leitura A/B sai daqui, sem tabela nova |

As famílias que valem mapear desde o primeiro dia, na ordem da jornada:

1. **Chegada**: `abriu_app` (uma vez por sessão, para quem estiver lá).
2. **Primeira sessão**: `comecou_onboarding`, `terminou_onboarding`,
   `abriu_cadastro_de_carro`, `cadastrou_carro`. Entre "abriu" e "cadastrou"
   não havia nada, e quem ia embora sumia sem deixar em que tela. Com anúncio
   pago no ar, essa pergunta vale dinheiro e tem dois consertos opostos
   (ninguém ACHA o formulário, ou acha e DESISTE).
3. **Conta**: `cadastro` (um por conta, trancado por índice único).
4. **Valor consumado**: `viu_aula`, `consultou_sintoma`, `registrou_servico`,
   `registrou_abastecimento`, `perguntou_biela`, `analisou_orcamento`,
   `lancou_ganho`. Abrir a tela não é usar; sem estes, "primeiro valor" não
   tem medida e nenhuma aposta de retenção tem leitura.
5. **Portões**: `convite_aviso`, `aceitou_convite_aviso`,
   `permissao_aviso_concedida` e `_negada`. Toda máquina de recorrência que
   depende de uma permissão do sistema precisa de um evento no portão, senão
   cinco máquinas podem estar mudas sem nada mudar de cor.
6. **Venda**: `viu_paywall`, `tentou_assinar` (ANTES do portão de conta, que
   é o que separa "viu e desistiu" de "quis e foi barrado"), `iniciou_checkout`,
   e os quatro financeiros só pelo servidor.
7. **O site como fonte**: `clicou_baixar` (a loja não conta de onde a pessoa
   veio; a página de download guarda a etiqueta, emite e só então manda para
   a loja) e `clicou_consultoria` (a única porta de "falar com gente" era
   cega: "ninguém quer" e "ninguém acha o botão" tinham a mesma cara).
8. **Técnico**: `atribuicao`, o desfecho da subida do SDK de atribuição. Não
   mede ninguém; mede se a nossa medição está viva no aparelho.

Três regras de nascimento:

- **Evento novo entra em quatro lugares no mesmo commit**: a régua
  (`lib/funilCorreto.ts`), a rota (`/api/funil`), o SQL e o banco (a
  restrição da tabela). Faltou um e o evento é recusado em silêncio, porque a
  rota responde ok de qualquer jeito.
- **Nasce com a pergunta e com a leitura**: uma fila de atalhos sem evento é
  decoração; um evento sem `origem` é uma contagem sem leitura.
- **Dedup onde o fato é único**: índices únicos no banco (um `cadastro` por
  conta, um `assinou` por assinatura, uma reentrega de webhook barrada pelo
  id do evento), não "confere antes de inserir", porque dois caminhos podem
  chegar no mesmo segundo. E `renovou` fica de fora de propósito: renovar de
  novo é fato novo todo mês.

## 4. O vocabulário que impede ler errado

Cada evento carrega, em `lib/funilCorreto.ts`, quatro etiquetas:

| etiqueta | valores | o erro que ela impede |
|---|---|---|
| **natureza** | `sessao` (repete toda vez), `ato` (uma vez na vida), `tecnico` | dividir ato por sessão produz um número que parece taxa e não é: `abriu_app` é estoque de todo mundo, `cadastrou_carro` é fluxo de novatos |
| **unidade** | `aparelho` ou `conta` | `assinou` vem do webhook, que não sabe de aparelho; `iniciou_checkout` nasce no aparelho. Quem assinou nunca aparece dentro de quem iniciou, e 1 dividido por 3 dá um 33% de ficção |
| **medido desde** | a data em que o evento passou a existir | zero antes da data é "sem medição", não 0%. Uma janela que começa antes de os dois eventos existirem não vira taxa |
| **ressalva** | uma frase com DATA | ressalva é afirmação sobre o mundo e envelhece: uma explicou um zero que já não existia por duas semanas, porque ninguém a datou nem lhe deu dono |

Daí saem as funções que decidem no lugar de quem lê: `podeComparar` recusa
degraus de natureza ou unidade diferentes, com motivo; `janelaValida` recusa
janela anterior ao instrumento; `degrau` só devolve taxa quando as duas
passam. E a única porta de número de funil é `public.funil_canonico(desde)`,
que devolve pessoas, aparelhos e contas lado a lado, para a fronteira
aparelho/conta aparecer em vez de se esconder. **Nunca escreva SQL de funil
à mão**: em três respostas seguidas saíram três números certos e nenhum
comparável, porque cada consulta escolheu a sua régua.

## 5. O que medir, por pergunta

O método faz quatro perguntas, nesta ordem, porque problema numa etapa quase
sempre nasce na anterior:

1. **Aquisição: gente nova está chegando?** Contas de fora por dia
   (`contas_criadas_desde`, que tira as do próprio time), cadastros por
   campanha (`extra.utm`, com o vocabulário fechado de `docs/utms.md`: tudo
   minúsculo, sem acento, porque UTM não valida nada e `instagram`,
   `Instagram` e `ig` viram três origens), instalações por campanha pela
   AppsFlyer (atribuição por clique no Android; agregada por SKAdNetwork no
   iPhone, sem pedir ATT), Search Console, gasto e cliques das plataformas de
   anúncio. Regra: custo por desfecho MEDIDO no nosso banco, nunca pela
   conversão que a plataforma conta sozinha.
2. **Ativação: quem chega experimenta de verdade?** A primeira ação de valor
   em 7 dias, por coorte semanal (`ativacao_coortes`). E a lição de 09/10:
   quando o produto muda a ORDEM dos passos (o carro passou a vir antes da
   conta), a métrica construída sobre a ordem antiga mede o contrário; o
   número piorou porque o produto melhorou. Antes de ler qualquer métrica de
   sequência, pergunte se a sequência que ela pressupõe é a que o app faz
   hoje. Para estado (quem TEM carro, quem TEM serviço), `estado_da_base`,
   nunca o evento.
3. **Retenção: quem experimentou volta?** Coortes por semana de cadastro, com
   duas janelas (1 a 7 dias, 8 a 30), e a janela só conta quando FECHOU
   (`retencao_coortes` diz `janela_fechada`). Até lá o número é PISO e só pode
   subir. É aqui que mora "estamos melhorando?": aquisição enche o balde,
   retenção diz se ele tem furo.
4. **Receita: quem volta paga e continua?** A verdade de quem tem Premium é
   `subscriptions` (assinante é `active` E `trialing`); dinheiro é o
   `amount_paid` da fatura no Stripe, nunca MRR (uma fatura de R$ 0,00 com
   cupom avança o período igual e três leituras disseram que o dinheiro
   tinha entrado); a loja é o RevenueCat, conferida contra o banco pela
   `assinaturas_conferencia` (uma venda de loja ficou seis dias sem chegar ao
   banco, e quem libera o acesso é o banco); o motivo de sair é
   `saida_motivos`, um clique por linha, porque sem ele toda conversa sobre
   churn é palpite.

## 6. Além do funil: o que mais o app conta de si

- **Erros de dentro** (`app_erros`, pela rota `/api/erros`): exceção de
  JavaScript e promessa rejeitada, com tela, plataforma, versão e aparelho.
  Crash nativo não passa por aqui (aparece nos vitais das lojas).
- **A migalha do último passo** (`lib/app/ultimoPasso.ts`): antes de cada
  passo que vale, o app grava "estou aqui, agora". Se a próxima abertura
  encontrar a migalha quente, a sessão anterior foi interrompida, e a
  migalha diz em cima de qual passo. Nasceu porque "o app fecha ao responder
  o quiz" não deixa exceção nenhuma: quando o processo morre, o JavaScript
  morre junto. A trava contra falso positivo é marcar a migalha como fria ao
  ir para segundo plano.
- **Alarme por aparelho, não por relato** (`aparelhos_ativos`): "22 erros em
  7 dias" eram dois aparelhos em loop entre 50 ativos. Todo alarme precisa
  do denominador do dia.
- **Anomalias da operação** (`anomalias_da_operacao`, cinco hoje): plataforma
  com gente e sem conta; a ação depois da qual a pessoa some mais que o
  normal; abriu o cadastro e sumiu; app fechou sozinho por versão; campanha
  que parou de aparecer. São RAZÕES com piso, nunca contagens soltas, e cada
  uma é provada contra a série histórica antes de entrar (gritaria em X,
  calada em Y, zero falso positivo).
- **Uso de cada recurso, com etiqueta na gravação**: perguntas ao assistente
  com tema e origem (palavras da pessoa separadas de atalho da tela, porque
  atalho mede a nossa tela e não a demanda), respostas do quiz (com a
  pergunta do onboarding separada da rotação diária: duas populações numa
  tabela só deram uma média quatro vezes maior), orçamentos analisados,
  preços observados pelos próprios usuários (a faixa de referência de
  verdade nasce daí quando um par tipo e estado tiver 30 observações).
- **Avaliações das lojas** (`lojas_avaliacoes`), coletadas todo dia: a fonte
  de depoimento real e de tendência de reclamação.
- **Experimentos** (`lib/app/experimentos.ts`): sorteio determinístico por
  `anon_id` mais id do experimento (com mistura, porque dois testes com o
  mesmo hash simples eram um só), exposição carimbada em todo evento, leitura
  em `experimentos_resultados`. Todo número de veredito diz o nível:
  atividade (quantos viram), conversão observada (quantos fizeram) ou
  incremento estimado (a diferença contra o grupo comparável). Só o terceiro
  sustenta a palavra "funcionou"; atividade zero é diagnóstico de exposição,
  não veredito.

## 7. A coleta de fora e o retrato diário

- **`metricas_diarias`**, uma linha por dia e por fonte, gravada pelo fluxo
  "Analista: metricas externas" do n8n às 5h30, pela rota `/api/metricas`.
  Cada pacote traz a nota de "o que isto não mede" junto com os números.
- **"Analista: retrato diário"** lê `/api/dados` e `/api/avaliacoes` e
  commita `docs/dados/retrato.md` às 9h. Cada linha vem marcada: PARCIAL
  (semana ainda enche), AINDA NAO DA PARA LER (janela aberta, hoje é PISO),
  FECHADA. Zero vem com a frase "NAO E ZERO MEDIDO" quando a fonte não trouxe
  linha, em vez de 0,00.
- **Frescor das fontes** (`lib/frescorDasFontes.ts`): a coleta morreu em
  23/08 e o retrato seguiu nove dias imprimindo pacotes velhos como atuais,
  até quase publicar "zero assinaturas" com dois clientes pagando. Hoje o
  retrato publica, por fonte, há quantos dias ela escreveu pela última vez, e
  um aviso quando alguma parou.
- **Auditoria das medidas** (`docs/dados/auditoria-das-medidas.md`): feita a
  pedido do dono em 28/09, linha por linha do retrato, dizendo o que dá para
  ler e o que não dá. Vale repetir a cada mês nos primeiros meses.

## 8. As regras de leitura que vieram de erro

Cada uma custou uma afirmação errada na cara do dono.

1. **Antes de publicar um número, diga de que instrumento veio e, se existe
   um segundo que mede a mesma coisa, cite os dois ou declare que não
   conferiu.** Faixa honesta vale mais que número preciso e errado.
2. **Ausência não é causa.** "A linha não apareceu" responde o QUE, nunca o
   PORQUÊ. Conclusão que começa com "então deve ser porque" é hipótese e
   precisa de um teste que a separe das outras.
3. **Antes de publicar qualquer zero, pergunte quem ESCREVE aquele número e
   vá ver se o escritor existe.** Quatro zeros estruturais foram lidos como
   comportamento; o quinto era escrito por um índice único e foi publicado
   como "0 de 314".
4. **Tabela que vira média tem uma população só.** Antes de dividir, pergunte
   se todas as linhas são a mesma coisa; o sinal de alarme é um máximo que
   não cabe na média.
5. **Aprendizado com janela nasce com a condição de validade escrita.** O
   "delta entre duas coletas de 30 dias é o gasto da semana" valeu enquanto a
   campanha era mais nova que a janela; no dia em que a ponta de trás andou,
   passou a medir o que entrou menos o que saiu.
6. **Quando o seu número discorda do retrato, compare as JANELAS antes de
   qualquer outra coisa.** "7 dias" contados de agora não são "7 dias"
   contados das 9h.
7. **Amostra pequena é direção, não lei.** Diga o absoluto junto com a taxa;
   com dez aparelhos, um a mais move dez pontos.
8. **Acesso não é a mesma coisa que perguntar.** A credencial do Google Ads
   estava na casa desde agosto e ninguém tinha pedido a quebra por rede nem
   o estado de aprovação do anúncio, que teria mostrado em 24/09 a busca
   reprovada. Quando um número surpreender, pergunte primeiro se a fonte já
   responde algo que nunca foi pedido.
9. **Isto já foi respondido?** A tabela "LEIA ISTO ANTES DE RECONFERIR
   QUALQUER NÚMERO" no diário existe porque reconferir o mesmo cupom três
   vezes é desperdício do tempo de quem decide. Reabrir só com motivo novo.
10. **Quando duas fontes discordam, não escolha a otimista nem passe o enigma
    adiante.** Diga qual é a verdade para aquela pergunta e cave até fechar.

## 9. As conferências que protegem a medição

Medição falha em silêncio, então ela tem conferência própria, e cada uma foi
provada plantando o defeito que deveria pegar (`npm run plantio`):

| conferência | o que impede |
|---|---|
| `conferir:funil` | taxa entre naturezas ou unidades diferentes, janela anterior ao instrumento, zero lido como 0%, `MEDIDO_DESDE` sem cobrir evento, e o sorteio de dois experimentos ficar acoplado |
| `conferir:identidade` | o app marcar `sem-armazenamento` e o banco contar como pessoa (abre o SQL de verdade) |
| `conferir:frescor` | coleta morta lida como atual, e o retrato deixar de publicar o aviso |
| `conferir:anomalias` | a função do banco e o retrato se desencontrarem |
| `conferir:quiz-populacao` | o id da pergunta do onboarding no SQL divergir do código, e as duas populações voltarem a ser somadas |
| `conferir:versoes` | a versão que o app grava nos eventos apodrecer em relação à das lojas |
| `conferir:banco` | o SQL do repositório e o banco de produção divergirem |

A regra de 10/10: **conferência que só olha a regra e não olha quem usa a
regra está cega**; cada uma acima aponta o elo no consumidor, não só a
função.

## 10. Checklist para a empresa nova: o que mapear no dia 1

- [ ] **Identidade**: `anon_id` no aparelho antes do login, `user_id` em todo
      evento de quem está logado, o caso sem armazenamento tratado numa
      função única no banco.
- [ ] **Os eventos da jornada**: chegada, os passos da primeira sessão,
      conta, a primeira ação de valor (defina o que é VALOR no seu produto,
      não o que é tela), os portões de permissão, e a venda com o evento no
      portão de conta.
- [ ] **Financeiro só no servidor**, confirmado pelo processador e pela loja,
      com índice único por assinatura e por id de evento de webhook.
- [ ] **Cada evento com**: plataforma, versão, origem, UTM capturada no
      layout raiz (vocabulário fechado), exposição de experimento.
- [ ] **As quatro etiquetas** (natureza, unidade, medido desde, ressalva com
      data) e uma função única que decide se dois degraus viram taxa.
- [ ] **Uma porta só para número de funil** (`funil_canonico`), uma para
      contas de fora, uma para estado da base.
- [ ] **Coortes semanais** de ativação e de retenção com janela fechada
      explícita; tudo o que está aberto é PISO.
- [ ] **A verdade de cada pergunta escrita**: quem tem direito (tabela de
      assinaturas), quanto entrou (fatura paga), quantas contas (auth), quanta
      gente chegou (eventos).
- [ ] **Erros de dentro mais a migalha do último passo**, e todo alarme com o
      denominador de aparelhos ativos.
- [ ] **Coletor diário das fontes de fora**, uma linha por dia e por fonte,
      com a nota de "o que isto não mede" dentro do pacote, e o frescor
      publicado.
- [ ] **Retrato diário** com PARCIAL, PISO, FECHADA e "não é zero medido", e
      uma auditoria linha a linha no primeiro mês.
- [ ] **Conferência para cada peça da medição**, provada com defeito plantado
      nos dois lados: a regra e quem usa a regra.
- [ ] **A tabela do que já foi respondido**, para ninguém reconferir o mesmo
      número três vezes.

O que NÃO vale medir no começo, e por quê, está na última seção de
`docs/dados/o-que-medimos.md`. A regra geral: instrumento novo só entra
quando existe uma decisão que ele mudaria.
