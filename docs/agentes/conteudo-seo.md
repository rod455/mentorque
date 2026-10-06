# Conteúdo & SEO: manual do papel

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

## A aposta da busca: a régua de desfecho, escrita antes de reler

Escrita em 06/10/2026 porque o dono cobrou, com razão: "leitura cujos dois
resultados levam à mesma ação não é ponto de decisão, é adiamento com data". A
régua abaixo tem número e cada ramo manda fazer coisa diferente.

**O estado de hoje, 06/10**, Search Console, janela de 28 dias: **1 clique** (o
primeiro da história do site), 38 impressões, 10 consultas listadas. Delas, 9
são de categoria somando 15 impressões e 1 é de marca com 2. Posição de
categoria: melhor 19, **mediana 71**, pior 89. Cinco guias no ar, o mais antigo
de 04/09.

**PRÓXIMA LEITURA: 03/11/2026** (quatro semanas). A métrica é a MEDIANA da
posição de categoria, não o total de impressões, porque impressão sobe só por
existir mais página e mediana não.

| se em 03/11 a mediana de categoria estiver | então |
|---|---|
| **melhor que 40** (metade das consultas na página 4 ou acima) | o domínio está ganhando força: volta a abrir guia novo, um por rodada, pelo sintoma sem guia de maior demanda |
| **entre 40 e 65** | continua o aprofundamento, uma página por rodada, sempre a de melhor posição, e nenhuma página nova |
| **pior que 65**, com cinco guias e dois meses no ar | PARA de escrever para busca. A conclusão passa a ser que o limite é autoridade de domínio e não quantidade de página, e a recomendação do papel muda para conseguir a primeira citação de fora. O slot de guia do rodízio vira artigo do catálogo até isso mudar |

**Por que a mediana e não o clique.** Um clique em 28 dias não distingue sorte
de tendência, e dois meses de dado não dão base para falar de taxa. A mediana
move junto com a força do domínio e não com o número de páginas, que é
exatamente a variável que este papel controla e por isso não pode ser a régua.

**O que esta régua NÃO responde, e já está pedido.** Qual página recebeu cada
impressão: o campo `topPaginas` do coletor passou a existir e vem VAZIO em
06/10, o que não é a mesma coisa que não existir. Sem ele, a escolha de qual
guia aprofundar usa a posição da consulta, que é o melhor disponível.

## A régua da rodada: o que é uma rodada bem feita

Antes de publicar, leia a sua própria rodada contra a lista e **diga no artifact
e no diário qual critério você não cumpriu, e por quê**. Falhar com o motivo
escrito é rodada honesta; falhar em silêncio é o que a lista existe para
impedir. Cada linha é conferível por quem não acompanhou a rodada: "está bom"
não é critério, "tem o número e a janela do lado" é.

| # | critério | como se vê que passou |
|---|---|---|
| 1 | **UMA entrega concreta, publicada** | commit na main, não descrição do que seria feito |
| 2 | **O formato alternou** | LP, pauta ou artigo, conferido na rodada anterior no DIARIO |
| 3 | **Nenhum número inventado** | toda cifra e porcentagem com fonte e data por perto |
| 4 | **Nenhuma certeza mecânica absoluta** | o texto não promete diagnóstico que só se vê no aparelho |
| 5 | **Sem preço no corpo** | valor em real fica fora do conteúdo |
| 6 | **Guia novo entrou no registro E no sitemap** | página fora do mapa é página que ninguém acha, sem dar erro |
| 7 | **Título e descrição cabem no buscador** | conferido, não estimado |
| 8 | **Âncoras únicas e FAQ de verdade** | pergunta com resposta, não título solto |
| 9 | **Português natural, sem travessão** | vale para LP, artigo e pauta |

**Nem toda linha vale para todo formato (observado em 22/09/2026).** As linhas
6, 7 e 8 são de rodada de GUIA: registro, sitemap, metadados de busca e âncoras
não existem num roteiro de vídeo nem numa aula do catálogo. Numa rodada de
pauta, as aplicáveis são 1, 2, 3, 4, 5 e 9. Dizer "não se aplica" com o motivo
é resposta válida; o que a régua não admite é marcar como cumprido um critério
que a rodada nem podia tocar.

**De onde veio esta régua (19/09/2026).** O dono perguntou se a gente usa a
função Outcomes do Claude (uma rubrica com um corretor separado). Ela é de
outro produto e não existe nas rotinas agendadas que rodam estes papéis, mas a
metade que importa é de graça: a rubrica escrita. Quem corrige de fora é o
Diretor, na segunda, e o dono lendo o artifact.

## Alçada

Pode: criar/editar páginas de conteúdo do site e artigos do catálogo, subir
na main. Não pode: prometer números, citar marcas de forma arriscada, mudar
preço/planos, tocar em telas de app fora de conteúdo.

## O buraco do catálogo: o plano com data, e a régua que o substitui

Escrito em 06/10/2026 porque o dono cobrou: "você achou, mediu três vezes e não
fechou, e ele é seu". Procede. Aqui está a conta e a data.

**A régua antiga não fechava nunca, e esse era o defeito.** Eu vinha reportando
"freio, suspensão e pneu somam 10 de 109 aulas". Essa fração não tem como ficar
boa: motor tem 54 aulas porque motor tem mais o que ensinar, e nenhum plano
honesto vai empatar isso. Repetir a fração era garantir que o achado voltasse
para sempre.

**A régua que substitui, e que termina:** todo sintoma que o app PERGUNTA nesses
três sistemas tem uma aula que responde ele de frente. São nove sintomas, e
hoje faltam QUATRO:

| sintoma | hoje | falta |
|---|---|---|
| `brake-noise` barulho ao frear | `diag-noises` e `diag-freio-avisos` | coberto |
| `brake-soft-pedal` pedal baixo ou mole | `diag-freio-avisos` | coberto |
| `suspension-noise` barulho na suspensão | `diag-noises` e `diag-suspensao-avisos` | coberto |
| `suspension-bounce` carro balançando demais | `diag-suspensao-avisos` | coberto |
| `steering-vibration` vibração no volante | `diag-vibracao` | coberto |
| `steering-hard` direção pesada ou dura | nada | **aula nova** |
| `tire-pressure-loss` pneu perdendo pressão | `tire-calibragem` fala de calibrar, não de perder | **aula nova** |
| `tire-uneven-wear` desgaste irregular do pneu | aparece como consequência em outras duas | **aula nova** |
| `brake-pull` puxa para um lado ao frear | uma linha dentro da `diag-freio-avisos` | **aula nova** |

**O compromisso, em datas.** Uma aula por rodada de artigo, que é o slot (c) do
rodízio e cai a cada três semanas: **27/10, 17/11, 08/12 e 29/12**. Nessa última
data a régua fecha e este achado para de aparecer em relatório, porque passa a
ser "9 de 9 sintomas cobertos" em vez de uma fração que nunca melhora.

**O custo acumulado, dito de uma vez**: são 29 dias desde que o recorte apareceu
(08/09) e as duas únicas aulas que entraram nesses sistemas nesse período foram
as duas que este papel escreveu. Ao longo dos 12 dias de atraso que o rodízio
impõe por ciclo, o que fica descoberto é a pergunta que o app já faz e não sabe
responder, e `steering-hard` é a pior delas porque tem zero cobertura hoje.

**Se três meses for lento demais, a decisão é deste papel e não do dono**: o
caminho é usar o slot (c) para duas aulas em vez de uma, fechando em 17/11. Não
fiz isso agora porque a regra da casa é UMA entrega concreta por rodada, e
trocar essa regra sem o dono ver custa mais do que seis semanas de espera.

## Aprendizados

- **⚠️ A "lição do canal" de 22 e 29/09 está ERRADA, e a correção é de
  29/09/2026.** Duas rodadas seguidas concluíram, a partir das views do
  YouTube, que existe um padrão de gancho: "vídeo que pega distribuição
  continua pegando, o que não pegou morreu", e daí "a decisão que importa é a
  de antes de publicar". A série diária do banco mostra outra coisa.

  Os oito vídeos da tabela **saltaram todos no MESMO dia, 21/09**, e o tamanho
  do salto de cada um é exatamente o que separou os "que pegaram" dos "que
  morreram":

  | vídeo | 20/09 | 21/09 |
  |---|---|---|
  | Perde força na serra | 61 | 836 |
  | Água de torneira | 31 | 724 |
  | A pergunta na oficina | 1 | 540 |
  | Esquentar o carro parado | 36 | 479 |
  | O número no pneu | 10 | 99 |
  | Etanol ou gasolina | 36 | 85 |
  | Poça embaixo do carro | 4 | 9 |
  | Erro silencioso | 0 | 2 |

  São cerca de 2.600 views num dia só. **No mesmo 20 e 21/09 entrou no ar a
  campanha "APP | Android | Instalações | BR" (canal MULTI_CHANNEL, que serve
  no YouTube)**, que saiu de R$ 0,17 e 30 impressões para R$ 44,30 e 3.619
  impressões. Não está provado que uma coisa causou a outra, e é exatamente
  por isso que a conclusão de gancho não se sustenta: existe uma explicação
  concorrente que bate no dia e não foi descartada.

  E o contraexemplo mata a regra por dentro: **"Esquentar o carro parado"
  ficou em 34 → 36 views durante DEZESSETE dias** (04 a 20/09) e hoje é o
  maior do canal, com 3.169. "Não existe deixa rodar que ele aparece" foi
  escrito sobre o vídeo que fez exatamente isso.

  **A regra que fica: view de YouTube desta casa não é sinal de conteúdo
  enquanto pago e orgânico não vierem separados.** O coletor traz só o total.
  Enquanto não trouxer `trafficSourceType` (ou enquanto a campanha de app
  estiver rodando), a rodada não conclui nada sobre título, capa ou gancho, e
  escreve que não dá para concluir. É a mesma regra do resto da casa: número
  publicado sem o que o torna legível vira decisão errada
  (`docs/dados/auditoria-das-medidas.md`).

- **⚠️ Duas rodadas em cada três não produzem nada indexável, e isso precisa
  estar na conta (29/09/2026).** O catálogo (109 aulas) vive DENTRO do app: não
  tem rota no site, não está no sitemap, e o Google não o enxerga. Indexável
  mesmo são os 5 guias em `app/<sintoma>/`, e **o último subiu em 15/09**. O
  rodízio a → b → c faz com que só uma rodada em três produza página. Se a
  meta da cadeira é busca, o rodízio é o que está segurando, e isso é decisão
  do dono, não ajuste silencioso: leve a pergunta a ele em vez de mudar o
  rodízio sozinho.

- **A lista de demanda mais rica que esta casa tem não está sendo usada
  (29/09/2026).** O Search Console deu 37 impressões em 28 dias. Os **termos de
  pesquisa do Google Ads**, no mesmo período, trazem cerca de 50 buscas reais
  com custo e conversão ao lado ("carro liga parte elétrica mas não dá
  partida", "luz de injeção eletrônica acesa e não apaga", "fumaça branca no
  escapamento", "carro esquentando mesmo com água no radiador", "quando o
  carro está perdendo a força"). São perguntas que a casa está PAGANDO para
  responder e que dizem qual guia escrever. Estão em
  `fontesExternas.google_ads.termos` no retrato, e `termosSemConversao` é a
  lista de quem clicou e não virou nada, que é ainda mais direta.

- **O Biela já recebeu 46 perguntas de verdade em 12 dias, e o texto delas não
  é guardado.** `biela_perguntas` conta, mas não armazena o que foi perguntado.
  Se o dono quiser usar as perguntas reais como pauta, isso é decisão dele
  (é dado de cliente), e hoje a resposta honesta é: não temos o texto.

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

- **Vídeo que não pega nos primeiros dias não se recupera, e isso decide
  onde gastar esforço.** Uma semana depois do lote de 19/09, os que tinham
  pegado seguiram crescendo (515 → 3169, 895 → 1770, 742 → 1113, 553 → 963)
  e os que não pegaram renderam de 1 a 9 views na semana inteira (122 → 123,
  99 → 108, 14 → 20, 4 → 5). Nenhum se recuperou, e a distância dentro do
  lote passou de 64 para cerca de 88 vezes sem ninguém publicar nada. A
  consequência para este papel: toda a alavanca está ANTES de publicar, no
  assunto e no gancho. Não existe "deixa rodar que ele aparece", então
  também não existe motivo para gastar rodada mexendo em vídeo publicado.

- **Short entrega UMA ideia; a lista de casos é do texto, não do vídeo.**
  Em 19/09 cinco vídeos subiram no mesmo lote, entre 13h26 e 13h29, e três
  dias depois estavam em 895, 553, 122, 99 e 14 views. Dentro de um lote
  tudo o mais está constante, então a diferença está no vídeo; o que NÃO dá
  para dizer é qual pedaço, porque título, capa, primeiros segundos e
  assunto mudam juntos e o coletor só traz views, sem retenção nem CTR.
  Como hipótese: ganharam o fenômeno que a pessoa já SENTIU e nunca teve
  explicado, e UMA coisa concreta para fazer, em assunto de todo mundo;
  perderam a estrutura de triagem ("quando é A, quando é B, quando é C") e
  o assunto de nicho. A estrutura de triagem é boa no guia e na aula, onde
  quem lê procura o caso dele, e ruim no Short, onde ela pede que a pessoa
  espere a vez dela chegar. Amostra pequena e distribuição irregular: é
  direção, não lei, e a seção completa está em docs/conteudo/pautas.md.

- **Aprofundar a página de melhor posição vale mais que abrir a próxima, e
  a conta que decide é a posição.** Em 06/10, com cinco guias no ar, quatro
  estavam na página 6 ou pior e um estava na 19. Abrir o sexto o colocaria
  junto dos quatro; mexer no de posição 19 é o único lugar onde clique é
  plausível. A régua geral: **página 2 se move, página 8 não.** E quando
  mexer, mexa no que a CONSULTA pede, não no que você acha que falta: a
  consulta era `luz injeção vermelha` e a página só falava de vermelho no
  quarto bloco. Ler as consultas palavra por palavra é metade do trabalho.

- **Pedir o instrumento é parte da rodada, não favor.** Duas rodadas
  concluíram sobre o canal só com views, que é a única coisa que o coletor
  traz e a que mais compõe com a própria distribuição. A regra, que vale
  para qualquer veredito deste papel: **no dia em que você percebe que falta
  o instrumento que o seu veredito vai precisar, ele entra na lista do dono**
  (`docs/agentes/acoes-do-dono.md`), com caminho de tela e escopo fechado.
  Sem isso, a conclusão vira a mesma frase repetida com números maiores.
  Destino novo se acrescenta em `scripts/acoes-do-dono.ts`, que valida a
  lista fechada; foi assim que `youtube` entrou em 06/10.

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

- **Qual conferência rodar: `npm run conferir` e pronto, SEMPRE, inclusive
  em rodada de guia.** Esta regra já esteve errada aqui. Ela dizia que
  rodada de LP era a exceção que pedia os dois builds, e em 15/09 eu rodei
  os dois por causa dela, gastando minutos que o dono pediu explicitamente
  para não gastar ("crie projetos menores e não faça uma bateria 360
  sempre", 12/09, no CLAUDE.md). O motivo da exceção deixou de existir: a
  `conferir:guias` confere o `SO_NO_SITE` guia a guia, que é exatamente o
  que o `build:native` pegaria, e o `tsc` pega o resto. Build local só antes
  de release para as lojas. Aprendizado maior que o item: quando uma
  conferência nova cobre o motivo de uma cerimônia, a cerimônia sai do
  manual junto, senão ela sobrevive por inércia.

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

- **O par Short mais aula é o formato padrão deste papel para um sistema
  vazio.** Funcionou duas vezes seguidas, e a divisão é sempre a mesma: o
  Short pega UMA ideia contraintuitiva sobre algo que a pessoa já sentiu, e
  a aula gratuita carrega a lista completa de sinais, que é onde lista
  funciona. Freio: Pauta 01 mais `diag-freio-avisos`. Suspensão: Pauta 02
  mais `diag-suspensao-avisos`. Ao escrever a aula, guarde de propósito
  para ela o que não coube no Short (na de suspensão foi a troca aos pares)
  e diga isso no comentário, senão a próxima rodada acha que é repetição.

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

- **Cada superfície tem o SEU critério de escolha, e misturá-los produz
  proposta ruim.** Guia do site se escolhe por DEMANDA DE BUSCA; aula do
  catálogo se escolhe pelo EQUILÍBRIO do acervo contra o que o app pergunta.
  Em 08/09 eu acertei o segundo (aula de freio, pelo recorte) e usei o mesmo
  argumento para propor um guia de "carro puxando para um lado", que não
  tinha sinal de procura nenhum. A rodada de 15/09 descartou essa proposta e
  escolheu bateria, que é o irmão da única família de consultas que existe.
  Antes de propor guia, olhe `topConsultas`; antes de propor aula, rode o
  recorte por sistema.

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

## Retorno do dono sobre a rodada de 29/09/2026

Mandado escrever por ele em 03/10, para os sete papéis que rodaram desde 27/09.
O veredito é sobre o registro no diário e sobre o que foi medido desde então.

Primeiro o que manter.

**A SEGUNDA LIÇÃO DO CANAL É DO MELHOR TIPO QUE EXISTE AQUI: um padrão, medido
no mesmo lote uma semana depois, com a consequência dita em uma frase.** Os que
pegaram continuaram crescendo e os que não pegaram morreram, e a distância
dentro do lote de 19/09 foi de 64 para cerca de 88 vezes sozinha, sem ninguém
publicar nada. "Não existe deixa rodar que ele aparece" muda o que se faz na
segunda de manhã, e é o oposto do que o instinto manda fazer, que é publicar
mais.

**E PERGUNTAR SE AS DUAS PAUTAS JÁ ESCRITAS CONTINUAM DE PÉ ANTES DE ESCREVER A
TERCEIRA.** "Escrever roteiro para uma fila que não anda é produzir estoque" é a
mesma lição que o ASO aprendeu doendo em 01/10, e você chegou nela sozinho,
antes de ela virar regra da casa.

Agora o que precisa melhorar, em três pontos.

**1. DUAS RODADAS SEGUIDAS CONCLUÍRAM SOBRE O CANAL SEM O INSTRUMENTO QUE
DECIDIRIA, e ele é uma tela.** Views é a única métrica que o coletor traz, e é a
que mais compõe com a distribuição: vídeo que pegou recebe mais porque pegou.
Retenção e clique por impressão, que separam "o assunto estava errado" de "a
capa estava errada", existem no YouTube Studio e nunca foram pedidos. Você
escreveu "direção, não lei", que é honesto, e parou aí. O passo que falta é o
que o ASO passou a fazer: **o instrumento que o seu veredito vai precisar entra
na lista do dono no dia em que você percebe que ele falta.** Enquanto não
entrar, a conclusão do canal vai ser a mesma frase repetida com números maiores.

**2. ZERO CLIQUES EM 28 DIAS, E A ÚNICA SAÍDA DA RODADA FOI RELER EM 06/10.**
Trinta e sete impressões, posições 53 a 80, sete consultas distintas para o
mesmo problema e a página que responde já existe. Reler pode ser a decisão
certa; o que falta é a regra de desfecho escrita ANTES, como o ASO fez com o
título em 01/09: **o que muda se a leitura de 06/10 disser a mesma coisa?**
Leitura cujos dois resultados levam à mesma ação não é ponto de decisão, é
adiamento com data. Escreva o critério antes de reler: posição mediana, número
de impressões, ou a página sai da fila de busca e vira outra coisa.

**3. O BURACO DO CATÁLOGO VOCÊ ACHOU, MEDIU TRÊS VEZES E NÃO FECHOU, E ELE É
SEU.** Freio, suspensão e pneu somam 10 de 109 aulas, e nas três semanas desde
que o recorte apareceu as duas únicas aulas que entraram nesses sistemas foram
as suas duas. O rodízio de formato (artigo, guia, pauta) é escolha deste papel,
não do dono: fechar o buraco não depende de ninguém. Pela regra dos 21 dias que
entrou em DIRETRIZES, achado repetido pela terceira vez ou traz o custo
acumulado ou vira plano com data. Aqui dá para ter os dois: diga quantas aulas
faltam para o recorte parar de aparecer, e em quantas rodadas elas saem.
