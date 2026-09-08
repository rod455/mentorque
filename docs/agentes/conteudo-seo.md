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
  site precisa entrar na lista `SO_NO_SITE` de scripts/build-native.mjs.
  Verde na Vercel não diz nada sobre o build do app (lição que já estava no
  DIARIO de 23/08 e vale para este papel também).

- **Qual conferência rodar, pelo regime do CLAUDE.md.** Rodada de pauta ou
  de artigo do catálogo é mudança localizada: `npm run conferir` e pronto,
  sem build local, que a Vercel builda a cada push. Rodada de LP é a
  exceção que pede os dois builds (`npm run build` e `npm run build:native`),
  porque rota nova mexe em código compartilhado do empacotamento.

- **Onde o catálogo mora, e como contar buraco nele.** As aulas saíram de
  `lib/app/content.ts` para `lib/app/conteudo/aulas.ts` (sintomas,
  equipamentos e serviços têm arquivo próprio no mesmo diretório). Antes de
  escolher pauta ou artigo, CONTE em vez de achar. O bloco de cada aula vai
  de um `id: "..."` ao próximo, então dá para varrer o arquivo assim e
  achar, por exemplo, aula marcada como vídeo que não tem vídeo, ou sistema
  do carro sem nenhuma aula:

  ```
  node -e "
  const fs=require('fs');const s=fs.readFileSync('lib/app/conteudo/aulas.ts','utf8');
  const idx=[...s.matchAll(/\bid: \"([a-z0-9-]+)\"/g)];
  for(let i=0;i<idx.length;i++){
    const b=s.slice(idx[i].index,(idx[i+1]?idx[i+1].index:s.length));
    if(/type: \"video\"/.test(b) && !/media: \{/.test(b)) console.log(idx[i][1]);
  }"
  ```

  Foi assim que a rodada de 01/09 achou o argumento dela: 43 Shorts e nenhum
  sobre freio, e uma única aula de freio no catálogo inteiro, premium e sem
  vídeo. Argumento contado convence; argumento sentido, não.

- **A fila pode ser consumida por outra rodada.** O item #2 deixado em 25/08
  (reescrever `diag-noises`) foi feito pela rodada de IA do mesmo dia, e a
  rodada seguinte quase o refez. Antes de pegar o próximo da fila, confira
  no DIARIO e no próprio código se ele ainda está aberto.

- **Gancho de diagnóstico não vai atrás do paywall.** Vídeo ou artigo que
  serve de porta (a pessoa chegou assustada com um barulho) entra como
  conteúdo gratuito, mesmo quando existe uma aula premium sobre o mesmo
  assunto. O passo a passo de execução pode ser premium; o "o que é isso que
  estou ouvindo" não pode, senão o gancho é desperdiçado.

- **Não dá para abrir o site por esta sessão, mas dá para provar que ele
  está no ar.** O proxy recusa a conexão com www.mentorque.com.br (403 no
  CONNECT). Isso NÃO é motivo para parar: a API da Vercel responde e diz o
  estado do deploy de produção. `list_teams` devolve
  `team_yuqh4yUR9jZyckA6KS3QqgKq`, `list_projects` devolve o projeto
  `mentorque` (`prj_J84gfQIYgY76qtOyVUrNJARJtam5`) e `list_deployments`
  mostra `state: READY, target: production` com o commit de cada um. O que
  ela não faz é ler o HTML servido; para isso, o caminho é pedir ao dono uma
  olhada de dois segundos. "Bloqueado" é meia frase; a outra metade é quem
  destrava.

- **Conferência vermelha nesta sessão é suspeita de dependência velha antes
  de ser notícia.** Em 08/09 o `conferir:appsflyer` reprovou e o relatório
  chegou a ser escrito dizendo que o portão estava quebrado na main. Não
  estava: aquela conferência olha um remendo aplicado por `postinstall`
  dentro de `node_modules`, que não é versionado, e o `node_modules` do
  contêiner era anterior ao remendo. Rodar o script de postinstall à mão (ou
  `npm ci`) resolveu e o `conferir` passou inteiro. O teste custa segundos e
  evita mandar o Diretor caçar defeito que não existe. Reprovou numa
  conferência que não tem nada a ver com a sua mudança: rode `npm ci` antes
  de escrever a palavra "defeito".

- **Expectativa honesta sobre busca**: o sinal para acompanhar nas primeiras
  semanas é INDEXAÇÃO no Search Console, não visita. Impressão vem depois de
  indexar, clique vem depois de impressão. Prometer tráfego para uma data é
  invenção, e invenção é proibida aqui.

- **O sinal que separa conteúdo de campanha é a CONSULTA, não o total.**
  Impressão por `mentorque` é marca, e campanha paga faz marca subir
  sozinha (o Google Ads começou em 01/09). O que mede este papel é consulta
  de CATEGORIA: alguém que procurava um problema e não a gente. Em 08/09
  apareceu a primeira, `carro nao quer pegar`, 1 impressão na posição 80.
  Ao ler a busca, sempre separe as duas famílias antes de dizer se subiu.
  As consultas estão no pacote `search_console` do retrato, campo
  `topConsultas`; o pacote traz consulta e não página, então não dá para
  atribuir a impressão a um guia específico daqui.

- **Toda aposta de conteúdo sai com data de releitura e com o que se faz em
  cada desfecho.** "0 clique é esperado numa página de uma semana" está
  certo e é inútil sozinho, porque não diz quando deixa de ser esperado. A
  releitura de 06/10 está escrita no artifact de 08/09 com três desfechos, e
  um deles muda a recomendação do papel de "escrever mais página" para
  "conseguir a primeira citação de fora". Rodada que só descreve não decide
  nada.

- **Como escolher conteúdo pelo que o app PERGUNTA, e não pelo que falta.**
  A contagem por sistema em `aulas.ts` sozinha diz onde há buraco; ela fica
  muito mais forte cruzada com `sintomas.ts`, que é o que o app pergunta à
  pessoa. Em 08/09: 47% dos 19 sintomas são de freio, suspensão ou pneu,
  contra 9% das 104 aulas. Um desequilíbrio desses é melhor argumento que
  "falta conteúdo de freio", porque descreve uma promessa quebrada e não um
  gosto. Contas rápidas (use o módulo, não regex: `id:` também casa com
  curso e categoria, e o `art()` resolve `system` ausente para `geral`):

  ```
  node --experimental-strip-types -e "
  import('./lib/app/conteudo/aulas.ts').then(({aulas})=>{
    const {lessons}=aulas((pt)=>pt); const por={};
    for(const l of lessons) por[l.system]=(por[l.system]||0)+1;
    console.log(lessons.length, por);
  })"
  ```

  Lembre que `addedAt` no futuro segura a aula: o número do `conferir:catalogo`
  conta o arquivo, e o que está publicado hoje é menor.

## Feedback da rodada de 01/09/2026 (pauta do freio)

**O que mordeu, e é para manter.** Todos os números da pauta foram conferidos
no código e batem exatamente: 43 Shorts com vídeo (são 50 aulas `type: video`
menos as 7 sem `media`), 7 aulas marcadas como vídeo sem vídeo com os ids
certos, e UMA aula com `system: "brakes"` (a `brake-pads`, premium, marcada
como vídeo sem ter vídeo). Escolher a pauta contando o catálogo em vez de
achar que freio faltava é o padrão do papel. Idem para os guarda-corpos do
roteiro e para a decisão de o vídeo virar aula gratuita fora da `brake-pads`.

**1. Achou o buraco e parou no buraco.** A mesma contagem que revelou "1 aula
de freio" mostra a forma do catálogo inteiro, e ninguém pediu esse número:

| sistema | aulas |
|---|---|
| engine | 50 |
| geral | 37 |
| electrical | 6 |
| tires | 5 |
| suspension | 2 |
| **brakes** | **1** |

De 101 aulas, **8** falam dos três sistemas que a pessoa SENTE no dia a dia
(freio, suspensão, pneu). Freio não é um buraco, é sintoma da forma. E a fila
proposta reforça o viés: o item 2 é uma LP sobre luz de injeção, que é motor
de novo. Regra: quando um recorte explicar um item, rodar o recorte INTEIRO e
olhar a distribuição antes de propor a fila.

**2. As 7 aulas que prometem vídeo e entregam arte são mais graves que a
pauta, e não entraram na fila.** Seis das sete são as de mão (óleo, pastilha,
scanner, bateria, filtro de ar, palhetas), exatamente as que a pessoa abre em
pé do lado do carro. A pauta depende de o dono gravar; essas já estão na
prateleira quebrando promessa hoje. O conserto é barato e é decisão do dono:
gravar, ou trocar `type` para `article`. Achado desse tamanho vira ITEM DE
FILA com nome, não observação de rodapé.

**3. Quando a conferência direta está bloqueada, dizer qual é o outro
caminho.** O relatório disse que não deu para confirmar se a LP está no ar
porque o proxy recusa o site, e parou aí. Honesto, mas incompleto: existem
duas outras rotas, a API da Vercel (que o coletor de métricas já usa, e que
diz se o deploy de produção está READY) e pedir ao dono uma conferência de
dois segundos. "Bloqueado" é meia frase; a outra metade é quem destrava.

**4. Nenhuma data para reler, nenhum critério.** "Busca segue 0 clique,
esperado para uma página de uma semana" está certo, mas quando deixa de ser
esperado? Toda aposta de conteúdo sai com data de releitura e com o que se
faz em cada desfecho. Dado fresco de 01/09, agora que a coleta voltou: **0
cliques e 2 impressões em 28 dias, e a ÚNICA consulta é `mentorque`**, a
marca, na posição 1. Nenhuma impressão para termo de categoria. É o número
que a próxima rodada tem que reler.

## O que mudou nos guias em 08/09/2026, e o que isso cobra de quem escreve

Rodada pedida pelo dono ("vamos evoluir todos os pontos"). O que o próximo guia
precisa trazer, além do texto:

- **`publicadoEm` e `atualizadoEm`** no registro. Aparecem na página, vão no
  `lastModified` do sitemap e no `Article` do dado estruturado. Mudou texto,
  sobe a `atualizadoEm`; mudou só estrutura, não.
- **`relerEm`** quando o guia carrega fato com validade (o de gasolina vence em
  10/01/2027). A `conferir:guias` REPROVA quando a data passa; o conserto é
  reler o fato, corrigir e mover a data.
- **Link no meio do texto** com `[[/caminho#ancora|texto]]`, nunca no FAQ.
  Cada guia novo linka pelo menos um irmão onde o assunto aparece, e é linkado
  de volta. A conferência cobra que caminho e âncora existam.
- **O caminho do guia entra em `SO_NO_SITE`** (`scripts/build-native.mjs`).
  Três dos quatro guias viajaram dentro do app por semanas porque só o primeiro
  estava lá. Agora a conferência compara a lista com o registro.
- **A imagem de compartilhamento nasce sozinha** em `/og/<caminho>`; nada a
  fazer.

**FAQ rich result não existe para nós.** Desde agosto de 2023 o Google só
mostra caixinha de FAQ para sites de governo e saúde. O `FAQPage` fica por ser
descrição honesta da página, não por resultado. O que descreve um guia para o
buscador é o `Article` com datas, autor e publicador, e o `BreadcrumbList`.

**A medição por página existe a partir daqui**, em duas metades: a Vercel
Analytics no site (chave no painel da Vercel, lista do dono) e `topPaginas` no
coletor do Search Console (n8n, precisa da credencial escolhida no nó, lista do
dono). É esse o número que o mandato manda acompanhar, e até 08/09 ele não
existia.

**Próximo guia, escolhido por dado e não por gosto.** A única consulta de
categoria que o Search Console registrou em 28 dias foi "carro nao quer pegar",
posição 80, no `/carro-nao-pega`. Partida e bateria são o que apareceu. O
irmão natural é **bateria do carro descarregando** (por que arria, como testar
antes de trocar, quando é o alternador), que conversa com o bloco
`girando-devagar` do guia de partida e com o diagnóstico do app. Volume de
busca não dá para medir daqui e não foi inventado. A pergunta que decide a
rodada seguinte: quantas impressões cada guia teve em `topPaginas`.

## Direcionamentos do dono

- **01/09/2026: as 7 aulas que prometiam vídeo viraram artigo, e o dono quer
  explicações robustas antes do vídeo.** Decisão dele, com a razão: até
  gravar, a aula tem que se sustentar sozinha. As sete ganharam corpo de
  artigo completo (quando fazer, como saber que passou da hora, o que custa
  adiar, quando levar na oficina) e o passo a passo por nível continua
  intacto embaixo. Quando o vídeo for gravado, ele volta como REFORÇO, não
  como a entrega: o `body` não se apaga. A lista priorizada para gravar e o
  caminho de volta estão em `docs/conteudo/videos-a-gravar.md`.
- **01/09/2026: os anúncios do Google Ads começaram.** Toda leitura de
  aquisição a partir daqui tem tráfego pago misturado, e campanha faz subir a
  busca por MARCA. O dado desta data, para comparar depois: 28 dias, 0
  cliques, 2 impressões, e a única consulta é `mentorque`.
- **01/09/2026: a indexação da home e da /barulho-no-carro foi solicitada** no
  Search Console pelo dono. O pedido que este papel repetia duas rodadas está
  fechado; a próxima rodada lê o resultado, não repete o pedido.
