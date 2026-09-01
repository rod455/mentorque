# Analista de Dados — manual do papel

O coletor do time. Trabalho mecânico e diário no n8n: buscar dados nas
fontes, normalizar e gravar onde os agentes pensantes (Diretor, CRO, ASO)
leem. Não analisa, não opina, não notifica o Rodrigo; entrega matéria-prima.

## Workflows ativos

1. **Avaliações das lojas** (diário, 7h)
   https://n8n.vocaboost.com.br/workflow/alUhElmOXhTjGJTj
   Feed público de avaliações da App Store (app id 6797291865, loja BR) →
   POST /api/avaliacoes → tabela lojas_avaliacoes (dedup pelo id da loja).
   Google Play: pendente de credencial (a conta de serviço revenuecat@ já tem
   permissão; falta colar o JSON no n8n). A API do Play devolve só os últimos
   7 dias, por isso a coleta diária importa.

2. **Retrato diário** (diário, 6h)
   https://n8n.vocaboost.com.br/workflow/3iP9vS2KQJ6E9cHD
   GET /api/dados + GET /api/avaliacoes → monta docs/dados/retrato.md e
   commita na main via API do GitHub (credencial Bearer, PAT restrito a
   Contents deste repositório). É a fonte primária do Diretor, do CRO e do
   ASO. Primeiro commit real: ed50a29.

## Workflow ligado desde 01/09/2026 (coleta diária às 5h30)

ATENÇÃO A QUEM LER ESTA SEÇÃO: o título antigo aqui era "esperando as
chaves" e ficou parado no tempo. Em 01/09 eu repeti essa frase para o
Rodrigo copiando o título, sem conferir, e ela já estava errada havia dias.
O quadro real, provado na execução 8352 (23/08) e nas de 01/09:

- As onze fontes gravam dado real. Nenhuma chave falta.
- O workflow ficou parado desde 23/08 por estar desligado, não por
  credencial nenhuma. Ativado pelo dono em 01/09/2026, e as onze fontes
  fecharam no mesmo dia.

Antes de escrever "falta a credencial X" em qualquer lugar, abrir a última
execução no n8n e olhar a resposta. Foi assim que os dois defeitos de 01/09
apareceram, e nenhum dos dois era chave.

3. **Métricas externas** (diário, 5h30 quando ligar)
   https://n8n.vocaboost.com.br/workflow/8HswG6ZPdzBSnlPv
   Um braço por fonte, todos independentes: braço sem credencial ou com erro
   grava o próprio erro e não derruba os demais. Cada braço grava um pacote
   por dia na mesa única POST /api/metricas (tabela metricas_diarias), que o
   /api/dados devolve em fontesExternas e o retrato diário resume na seção
   "Fontes externas".

   AO ESCREVER ESSA SEÇÃO, A IDADE VEM ANTES DO VALOR. O /api/dados devolve
   `frescorDasFontes` (dias parados por fonte) e `avisoDeColeta` (uma frase,
   ou null quando está tudo em dia). Regra: se `avisoDeColeta` não for null,
   ele é a PRIMEIRA linha da seção; e toda fonte com `parada: true` sai como
   "PARADO há N dias (último: dd/mm)" ANTES do valor, nunca só o valor.
   Motivo, com data: entre 23/08 e 01/09/2026 a coleta ficou morta e o
   retrato imprimiu aqueles pacotes como se fossem do dia. O relatório do
   Diretor quase publicou "Stripe: 0 assinaturas" com dois clientes reais
   pagando. Dado velho sem idade é pior que dado ausente: o ausente faz
   perguntar, o velho faz decidir errado. Exceção: o braço de avaliações do Play grava em
   /api/avaliacoes, junto com as da Apple.

   Braços e o que cada um coleta:
   - search_console: cliques e impressões por dia (28d) + top 20 consultas
   - stripe: assinaturas ativas, MRR estimado, receita 30d
   - youtube: inscritos, views totais, views dos últimos 10 vídeos
   - meta_ads: gasto, impressões, cliques e instalações por dia (7d)
   - google_ads: custo, cliques, impressões e conversões por dia (7d)
   - revenuecat: visão geral do projeto (assinaturas, MRR, trials)
   - vercel: deploys da semana e estado do último deploy
   - admob: ganhos e impressões de anúncio por dia (7d)
   - app_store_connect: estado das versões do app (acompanha aprovação)
   - play_console: taxa de crash e ANR por dia (vitals)
   - avaliações do Google Play (últimos 7 dias da API, por isso é diário)

4. **Vigia de anomalias** (diário, 7h30; LIGADO desde 01/09/2026)
   https://n8n.vocaboost.com.br/workflow/ljWzGCZ8J0nmlYRf
   Lê /api/dados e o frescor da mesa de métricas depois da coleta e SÓ
   manda e-mail (para os dois endereços do Rodrigo) quando algo foge do
   padrão: erros disparando, uso caindo forte, cancelamentos, crash acima
   de 2%, deploy quebrado, fonte muda há 2+ dias ou coleta parada. Dia
   normal é silêncio. Testado em 2026-08-23 (dia normal, nenhum e-mail).

## Downloads reais das lojas (metade construída)

Para fechar o primeiro degrau do funil (instalação → abertura → cadastro):
- Apple: PRONTO e testado em 2026-08-23 (fonte app_store_downloads,
  Vendor Number 94182924, relatório diário SUMMARY que exclui TestFlight).
  Chave única PS9LWJKWK6 com papéis Developer + Sales + Access to Reports
  (a Apple permite combinar papéis numa chave; não precisa de Admin).
  Primeiro dado: 0 downloads orgânicos em 21/08, ou seja, os usuários
  ativos até aqui são todos de teste. Pendência de higiene: revogar a
  chave Developer antiga (U25N5Y86SS) no App Store Connect.
  CONSERTO DE 01/09, e o número que ele destravou: este braço estava
  gravando "This operation expects the node's input data to contain a binary
  file" em vez de dado. A causa não era a Apple nem a chave: o nó de
  descompactar do n8n descobre o formato pela EXTENSÃO do arquivo, e a Apple
  manda o relatório como `application/a-gzip` SEM nome. Entrou um nó "App
  Store: nomeia o arquivo" que batiza o binário de `vendas.gz` quando ele vem
  sem nome. Na primeira rodada depois do conserto, o relatório de 30/08 disse
  **2 downloads e 2 atualizações**: os primeiros downloads reais fora de
  teste, que o defeito estava escondendo. É a prova prática de por que erro
  de coleta não pode ser tratado como paisagem.
  O nó de normalizar também passou a separar os três casos pelo código HTTP:
  404 é ZERO transação de verdade, 200 é relatório para ler, e qualquer outro
  (401, 403, 429) é ESTAMOS CEGOS e vira erro. Zero e sem medição não podem
  chegar iguais no retrato.
- Google: aguardando o Play Console gerar os primeiros relatórios
  estatísticos do app (em 23/08 ainda mostrava "Não há relatórios
  mensais disponíveis"); quando existirem, copiar o URI do Cloud Storage
  na tela Fazer download de relatórios → Estatísticas.

## Checklist para ligar (credenciais no n8n, uma por linha)

Criar em https://n8n.vocaboost.com.br/home/credentials e depois selecionar
nos nós do braço correspondente (a API não permite anexar por fora):

- [x] Meta Ads: credencial Bearer criada e testada em 2026-08-22 (enxergou a
      conta "Mentorque Ads"; gasto zerado porque ainda não há campanha).
      Pendência de segurança: o token atual tem acesso de leitura E edição;
      trocar por um só de leitura (ads_read) quando der.
- [x] Search Console: pronto e testado em 2026-08-23. Propriedade
      sc-domain:mentorque.com.br verificada por TXT no Registro.br, conta
      appfactory.rlm como proprietária; coleta veio zerada porque a
      propriedade é nova e o Google acumula a partir de agora.
- [x] Google Play (vitals + avaliações): pronto e testado em 2026-08-23,
      com o JSON da conta revenuecat@. Avaliações respondem vazio (loja sem
      reviews ainda) e vitals respondem vazio (app quase sem uso). A API de
      vitals publica com uns 3 dias de atraso, por isso a janela consulta de
      12 a 4 dias atrás.
- [x] Stripe: pronto e testado em 2026-08-23 com chave restrita de leitura.
      ATENÇÃO: o modo live mostra 0 assinaturas ativas, mas a tabela
      subscriptions do banco mostra 1 anual ativa; provável assinatura de
      teste no banco. Esclarecer com o Rodrigo.
- [x] YouTube: pronto e testado em 2026-08-23. Cliente OAuth novo
      "Mentorque N8N" (projeto Mentorque, app publicado em produção),
      conta mentorque.ar. Coleta os 10 últimos vídeos; views zeradas
      porque os vídeos ainda estão privados/não listados.
- [x] RevenueCat: pronto e testado em 2026-08-23 (chave secreta v2). Dado
      real: 22 usuários ativos, 22 clientes novos, 0 assinaturas ativas.
- [x] Vercel: pronto e testado em 2026-08-23 (token de acesso). Dado real:
      20 deploys nos últimos 7 dias, todos prontos, produção saudável.
- [x] Google Ads: pronto e conferido em 2026-09-01, depois de TRÊS problemas
      empilhados. Vale ler inteiro antes de mexer neste braço.
      **1. A versão da API.** A URL usava a v20, que o Google aposentou. O
      erro guardado dizia só "The resource you are requesting could not be
      found", mas o corpo na execução 8352 era a página 404 em HTML do
      Google: `The requested URL /v20/customers:listAccessibleCustomers was
      not found on this server`. Hoje está em **v25**.
      Para escolher a versão quando ela morrer de novo: NÃO confie em bater
      sem autenticação. A v26 responde 401 sem token (parece viva) e `404
      Method not found` com token de verdade. Só a execução real prova.
      **2. O developer token NÃO VAI NA CREDENCIAL, VAI NOS DOIS NÓS.** A
      credencial `googleAdsOAuth2Api` do n8n TEM um campo "Developer Token",
      mas esse campo só é usado pelo nó oficial do Google Ads. Num nó HTTP
      Request com credencial predefinida o n8n manda só o OAuth, e o token
      nunca sai de dentro do n8n. Preencher a credencial não muda nada e o
      erro continua idêntico, o que faz parecer token errado. Hoje o header
      `developer-token` está nos nós "Google Ads: contas acessiveis" e
      "Google Ads: custo 7 dias".
      A conferência que resolve isso em um minuto: com o header ausente a API
      responde `DEVELOPER_TOKEN_PARAMETER_MISSING`; com um header de valor
      inventado ela passa a responder `DEVELOPER_TOKEN_INVALID`. Mudou de
      mensagem, então é o header que importa.
      **3. O primeiro OK veio da conta errada.** `listAccessibleCustomers`
      devolve SEIS contas (outros projetos e a gerente), e o código pegava
      `resourceNames[0]`. O braço gravou custo 0 de uma conta que não é a
      nossa. Entrou o nó "Google Ads: escolhe a conta do Mentorque", que
      procura o id **6724308347** (672-430-8347, a mesma ligada ao AppsFlyer)
      e devolve ERRO se ele não estiver na lista, em vez de cair na primeira.
      Conferido: essa conta se chama "Mentorque" e opera em BRL. O `contaId`
      agora sai gravado junto com o número.
      COMO ESCOLHER A VERSÃO quando ela morrer de novo (o Google aposenta uma
      por ano): NÃO confie no teste sem autenticação. Bater sem token dá 401
      tanto em versão viva quanto em versão que ainda não existe: a v26
      responde 401 sem token e `404 Method not found` com token de verdade.
      A única prova que vale é rodar o workflow e olhar a resposta. Subir uma
      versão por vez e parar na maior que devolver erro do Google Ads (e não
      404 do gateway).
      A lição vale para além do Google Ads: **erro de API guardado sem o
      corpo da resposta vira mistério**. Nove dias de "not found" pareciam
      falta de permissão e eram duas outras coisas. Por isso os nós que podem
      falhar por motivo externo agora usam `fullResponse` + `neverError` e o
      nó de normalizar cava o motivo de verdade antes de gravar.
- [x] AdMob: pronto e testado em 2026-08-23 (cliente Mentorque N8N + escopo
      admob.readonly). Dado real: receita diária em USD desde 15/08, cerca
      de US$ 1,64 na última semana.
- [x] App Store Connect: pronto e testado em 2026-08-23 (chave .p8 ES256,
      Key ID U25N5Y86SS). Primeira coleta: 1.1 WAITING_FOR_REVIEW e 1.0
      READY_FOR_SALE. Detalhe técnico: o nó JWT do n8n precisa das claims
      em modo JSON (iss/iat/exp/aud); os campos estruturados não convertem.

Pode ativar o workflow com só parte das credenciais prontas: os braços sem
credencial apenas registram o próprio erro na mesa. Quando tudo estiver
selecionado, ativar o workflow (botão Active) e conferir a primeira execução.

## Fora do workflow (limites conhecidos)

- Instalações do Play e downloads da Apple: as APIs oficiais entregam isso
  em relatórios (CSV no GCS e TSV gz); fica para uma fase 2 ou leitura
  manual nos consoles.
- Vercel Web Analytics não tem API pública estável; o braço vercel cobre
  deploys e saúde. AdMob cobre a receita de anúncio.
- Mídia paga: a captura de UTM no funil já está pronta do lado do site.

## Aprendizados

- O feed de avaliações da Apple é público e sem chave; o do Play não tem
  equivalente aberto.
- **Erro de coleta guardado sem o corpo da resposta vira mistério.** Nove
  dias de `The resource you are requesting could not be found` no braço do
  Google Ads pareciam falta de permissão e eram, empilhados, uma versão de
  API aposentada e um developer token que nunca foi preenchido. Nada disso
  aparecia na mensagem curta. Quem escreve braço novo: nó que pode falhar por
  motivo de fora usa `fullResponse` + `neverError`, e o nó de normalizar cava
  o motivo dentro de `body.error.details` antes de gravar.
- **Um erro pode estar escondendo outro, e foram três empilhados.** No Google
  Ads: primeiro o 404 do gateway (versão v20 aposentada), depois o developer
  token que faltava, depois a descoberta de que o campo de developer token da
  credencial do n8n nem é enviado por nó HTTP Request. Cada conserto não fez
  o braço funcionar, fez o próximo erro aparecer. Comemorar o primeiro e ir
  embora teria deixado tudo quebrado do mesmo jeito.
- **Preencher credencial não é prova de que a credencial é usada.** O n8n
  aceita campos numa credencial predefinida e ignora os que só o nó oficial
  daquele serviço lê. O teste que resolve em um minuto: pôr um valor
  INVENTADO no header e ver se a mensagem de erro muda. Se mudou, o header é
  o caminho; se não mudou, o valor está indo por outro lugar (ou não está
  indo).
- **Conta compartilhada exige escolha explícita, nunca o primeiro da lista.**
  Aconteceu duas vezes: no AdMob, cuja conta soma os outros apps do Rodrigo,
  e no Google Ads, onde `listAccessibleCustomers` devolve seis contas e o
  código pegava a primeira. Os dois braços agora fixam o id do Mentorque e
  gravam esse id junto com o número. Quando a API devolver uma LISTA, a
  pergunta certa não é "quantas vieram", é "qual delas é a nossa".
- **No n8n, salvar não é publicar.** Workflow ativo executa a versão
  PUBLICADA; o que a API de update salva é rascunho. Em 01/09 o braço do
  Google Ads foi consertado, a execução manual passou, e a execução de
  produção continuou gravando o número velho, porque a correção estava só no
  rascunho. Depois de mexer em workflow ligado: publicar e rodar uma vez em
  modo produção para conferir. Execução manual verde não prova nada sobre o
  que vai rodar às 5h30.
- **Este doc já mentiu sobre o próprio estado.** O título "esperando as
  chaves" ficou parado depois que as chaves chegaram, e em 01/09 eu repeti a
  frase dele para o Rodrigo sem conferir. Doc de estado envelhece; execução
  no n8n e linha na `metricas_diarias` não. Quando os dois discordarem, quem
  manda é a execução, e o doc é que está errado.

## Aprendizados sobre o funil (01/09/2026)

- **A lista de eventos mora em QUATRO lugares, e esquecer um some em
  silêncio.** São o tipo `EventoFunil` em `lib/app/funil.ts`, o
  `EVENTOS_DO_APP` em `app/api/funil/route.ts`, o `check` da tabela em
  `supabase/funil_eventos.sql` e a `NATUREZA` em `lib/funilCorreto.ts`.
  Esquecer na rota devolve 400 e a métrica some; esquecer no banco recusa o
  insert; esquecer na natureza deixa o funil sem saber se pode dividir.
  `npm run conferir:funil` lê os quatro arquivos e reprova se divergirem, e
  isso foi provado plantando o esquecimento em cada um.
- **Evento de SESSÃO e evento de ATO não se dividem.** A regra inteira está em
  `lib/funilCorreto.ts` e na skill de análise. O caso que a criou: o relatório
  de 31/08 publicou 17 → 8 → 2 → 2 → 2 como funil.
- **Quando existe tabela com o fato gravado, a tabela ganha do evento.**
  Cadastro passou a sair de `auth.users`, porque o evento só dispara para
  conta com menos de 7 dias e esse buraco nenhum build conserta.
- **Dedup de evento tem duas escalas, e escolher errado inventa crescimento.**
  `umaVez` guarda em memória e morre com a sessão, que é certo para "viu o
  paywall nesta visita". Para "terminou o onboarding", que acontece uma vez na
  vida, a marca vai no localStorage (`umaVezPorAparelho`) e o piso é um índice
  único no banco. Contar de novo a cada abertura faria a etapa só crescer.

## Direcionamentos do dono

- (vazio ainda)
