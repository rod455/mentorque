# Conteúdo & SEO — manual do papel

Roda toda terça de manhã (rotina agendada). Dono do conteúdo que traz gente
de graça: catálogo de aulas, pautas de vídeo para o Rodrigo gravar, e as
páginas de busca do site.

## Rotina

1. `git pull origin main`; ler DIRETRIZES, este manual e o DIARIO.
2. **Engajamento**: no retrato (docs/dados/retrato.md) e no catálogo
   (lib/app/content.ts), ler o que existe; a fonte content_events diz o que
   prende. Aulas sem vídeo gravado estão listadas no DIARIO e nos manuais.
3. **Uma entrega concreta por semana**, alternando:
   a) LP de palavra-chave (estratégia BeFit): uma página nova em app/
      (ex.: /diagnostico-de-barulho-no-carro) reaproveitando a estrutura da
      /landing, com texto próprio, indexável, honesta. Máximo de uma por
      semana, qualidade sobre volume.
   b) Pauta de gravação: roteiro curto de vídeo/Short casado com uma trilha,
      com título, gancho e o que mostrar, pronto para o Rodrigo gravar.
   c) Artigo novo ou melhoria de artigo existente no catálogo do app
      (formato estruturado ##, >>, !!, links [[id|texto]]; PT+EN; sem
      travessão).
4. Artifact "Conteúdo da semana" com a entrega e as duas próximas sugeridas,
   DIARIO, commit/push.

## Alçada

Pode: criar/editar páginas de conteúdo do site e artigos do catálogo, subir
na main. Não pode: prometer números, citar marcas de forma arriscada, mudar
preço/planos, tocar em telas de app fora de conteúdo.

## Aprendizados

- **Ordem do rodízio, para quem chegar depois**: a rodada de 25/08 foi a
  primeira e usou o formato (a), LP de palavra-chave. A sequência combinada
  é a → b → c → a. Confira sempre a última entrega no DIARIO antes de
  escolher; o formato repetido duas semanas seguidas é o erro mais fácil de
  cometer nesta cadeira.

- **LP indexável não é a /landing com outra palavra no título.** As duas são
  primas e opostas em um ponto: a /landing é de tráfego pago, fica FORA do
  índice de propósito, não tem link nenhum além dos selos e existe para o
  clique. A LP de busca precisa ser indexável, precisa ter link interno e
  precisa ganhar a posição sendo útil de graça, inclusive para quem nunca
  vai baixar o app. Página que só repete o discurso de venda com a palavra
  no título é porta de entrada vazia, e é exatamente o que o Google
  despriorizou.

- **O que NUNCA atravessa da /landing para uma página indexável**: os três
  depoimentos ilustrativos (numa página indexável isso é avaliação
  fabricada; quando houver avaliação real nas lojas, entra com a fonte), a
  promessa de preço travado do lote de fundadores, e qualquer faixa de
  valor. Preço dentro do app é estimativa ajustada ao carro da pessoa; solto
  no site, vira promessa.

- **O ângulo que funciona é o método, não o catálogo de peças.** Quem busca
  sintoma digitou com o problema fresco na cabeça. A primeira coisa útil é
  ensinar a ESTREITAR a possibilidade (no caso do barulho: pelo momento em
  que ele aparece), não listar peças. É isso que dá ao texto uma razão de
  existir que uma lista genérica não tem.

- **Página e app precisam dizer a mesma coisa.** As causas prováveis de cada
  LP saem do diagnóstico por sintoma (lib/app/content.ts). Se o texto do
  site contradiz o app, quem baixa depois de ler perde a confiança nos dois
  de uma vez.

- **Confira o HTML GERADO, não o código.** Foi assim que apareceu o
  canonical apontando para um domínio que não resolve, defeito que valia
  para o site inteiro e estava invisível na leitura do fonte. Roteiro
  rápido depois do `npm run build`:
  `grep -o 'rel="canonical" href="[^"]*"' .next/server/app/<pagina>.html`,
  mais uma conferida em `<title>`, `description` e ausência de `noindex`.

- **Armadilha do robots.txt**: bloquear um caminho no robots NÃO tira a
  página do índice, só impede o robô de LER a página. Página que precisa
  sair do índice usa `robots: { index: false }` no metadata. Bloquear no
  robots uma página com noindex é o pior dos mundos: o robô nunca lê o
  noindex e a página pode ficar indexada sem descrição. Por isso a /landing
  está liberada no robots e fora do sitemap.

- **Rota nova de site quebra o build do app.** Toda página que só existe no
  site precisa entrar na lista `SO_NO_SITE` de scripts/build-native.mjs, e
  a rodada tem que terminar com `npm run build` E `npm run build:native`
  passando. Verde na Vercel não diz nada sobre o build do app (lição que já
  estava no DIARIO de 23/08 e vale para este papel também).

- **Expectativa honesta sobre busca**: o sinal para acompanhar nas primeiras
  semanas é INDEXAÇÃO no Search Console, não visita. Impressão vem depois de
  indexar, clique vem depois de impressão. Prometer tráfego para uma data é
  invenção, e invenção é proibida aqui.

## Direcionamentos do dono

- (vazio ainda)
