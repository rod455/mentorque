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

## Fontes que ele ainda vai assumir

- Avaliações do Google Play: falta só colar o JSON da conta de serviço como
  credencial no n8n (o braço do workflow já está desenhado).
- Stripe (receita real e MRR): precisa de chave restrita de leitura.
- YouTube (views dos vídeos): precisa de credencial OAuth do YouTube no n8n.
- Search Console (buscas que trazem o site): a credencial Google do n8n já
  tem o escopo autorizado; é só construir o workflow.
- Mídia paga (Google Ads e Meta): entra junto com as campanhas; exige token
  de leitura de cada plataforma. A captura de UTM no funil já está pronta
  do lado do site.

## Aprendizados

- O feed de avaliações da Apple é público e sem chave; o do Play não tem
  equivalente aberto.

## Direcionamentos do dono

- (vazio ainda)
