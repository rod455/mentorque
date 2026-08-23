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

## Workflow pronto, esperando as chaves (DESLIGADO)

3. **Métricas externas** (diário, 5h30 quando ligar)
   https://n8n.vocaboost.com.br/workflow/8HswG6ZPdzBSnlPv
   Um braço por fonte, todos independentes: braço sem credencial ou com erro
   grava o próprio erro e não derruba os demais. Cada braço grava um pacote
   por dia na mesa única POST /api/metricas (tabela metricas_diarias), que o
   /api/dados devolve em fontesExternas e o retrato diário resume na seção
   "Fontes externas". Exceção: o braço de avaliações do Play grava em
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

4. **Vigia de anomalias** (diário, 7h30 quando ligar; DESLIGADO)
   https://n8n.vocaboost.com.br/workflow/ljWzGCZ8J0nmlYRf
   Lê /api/dados e o frescor da mesa de métricas depois da coleta e SÓ
   manda e-mail (para os dois endereços do Rodrigo) quando algo foge do
   padrão: erros disparando, uso caindo forte, cancelamentos, crash acima
   de 2%, deploy quebrado, fonte muda há 2+ dias ou coleta parada. Dia
   normal é silêncio. Testado em 2026-08-23 (dia normal, nenhum e-mail).

## Downloads reais das lojas (metade construída)

Para fechar o primeiro degrau do funil (instalação → abertura → cadastro):
- Apple: braço construído no workflow de métricas (fonte
  app_store_downloads, Vendor Number 94182924, relatório diário SUMMARY
  que EXCLUI TestFlight). Pendente: chave .p8 nova com papel "Vendas e
  relatórios" (a chave Developer não alcança o endpoint; a Apple recusou
  com "API key does not allow this request"). Trocar a credencial e o
  Key ID no nó "App Store: token vendas".
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
- [ ] Google Ads: credencial "Google Ads OAuth2 API" (pede também o
      developer token da conta). Nos 2 nós. Se a API mudar de versão até lá,
      ajustar o v20 nas URLs.
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

## Direcionamentos do dono

- (vazio ainda)
