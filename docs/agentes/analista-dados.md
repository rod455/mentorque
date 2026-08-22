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

## Fontes que ele ainda vai assumir

- Retrato diário consolidado: GET /api/dados (funil, assinaturas, cadastros,
  erros) publicado num lugar que o Diretor leia sem depender de conector.
- Stripe (receita), YouTube (views), Search Console (SEO): fáceis, com as
  credenciais do n8n.
- Mídia paga (Google Ads e Meta): entra junto com as campanhas; exige token
  de leitura de cada plataforma e captura de UTM no funil.

## Aprendizados

- O feed de avaliações da Apple é público e sem chave; o do Play não tem
  equivalente aberto.

## Direcionamentos do dono

- (vazio ainda)
