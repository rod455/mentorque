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
- [ ] AdMob: credencial "Google OAuth2 API" nova com escopo
      https://www.googleapis.com/auth/admob.readonly. Nos 2 nós.
- [ ] App Store Connect: credencial "JWT Auth" com a chave .p8 (algoritmo
      ES256) e, no nó "App Store: token", preencher os placeholders de
      Issuer ID e Key ID. Nos 2 nós.

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
