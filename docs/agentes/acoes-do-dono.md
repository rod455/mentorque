# Ações que só o dono faz

Lista curta do que está parado esperando alguém que não é agente. Chave,
console de terceiro, decisão de dinheiro, publicação em loja.

**Por que ela existe (07/09/2026).** O diagnóstico da operação está bom e a
execução do que depende do dono é que envelhece calada. O caso que ensinou: as
palavras negativas do Google Ads estavam escritas desde 03/09, e quatro dias
depois seguiam sem aplicar enquanto a campanha gastava uns R$ 35 por dia num
público que o próprio relatório mediu como errado. Ninguém errou: o relatório é
semanal e cobra as prioridades da semana anterior, então uma coisa parada há
quatro dias ainda não tinha chegado a nenhuma cobrança.

O relatório semanal continua sendo o lugar da análise. Esta lista é outra coisa:
ela só conta há quantos dias cada item está parado, todo dia, sem opinar.

**Como mexer.** Uma linha por ação, com a data em que ela ENTROU (não a data em
que foi feita). Ao concluir, apague a linha e escreva o desfecho no
`DIARIO.md`, senão a lista vira um cemitério e ninguém lê mais.

A `npm run acoes` ordena por idade. A `npm run conferir:acoes` confere o
formato: data que não existe, data no futuro ou coluna faltando reprovam, porque
uma lista de idade com data errada mente com cara de dado.

**A coluna `Onde`, e por que ela existe (02/10/2026).** Em 02/10 a lista tinha
13 itens e parecia 13 tarefas. Agrupados por painel, eram SEIS destinos, e
cinco dos treze estavam no mesmo console do Google Ads, o mais antigo há 29
dias. Uma sessão de vinte minutos fechava cinco. A fila não era grande, era
mal apresentada.

O destino é ETIQUETA, não adivinhação: a `npm run acoes` agrupa pelo que está
escrito nesta coluna e a conferência reprova destino fora da lista, pelo mesmo
motivo que as perguntas da Biela são etiquetadas na gravação em vez de
adivinhadas na leitura. Palavra do texto muda, classificação por palavra
apodrece, e ninguém percebe.

Os destinos válidos: `google-ads`, `play-console`, `app-store`, `lojas` (as
avaliações, que ficam nos dois consoles), `meta`, `n8n`, `revenuecat`,
`stripe`, `appsflyer`, `vercel`, `search-console` (acrescentado em
20/10/2026: o relatório de LINKS não existe na API, só na tela), `youtube` (o
Studio, onde mora o clique por
impressão: a YouTube Analytics API, ligada em 16/10, entrega a retenção e
responde "The query is not supported" para o clique), `supabase` (o SQL
Editor, para o comando destrutivo que a ferramenta do agente segura para
confirmação e que não chega numa sessão sem gente), `registro-br` (o DNS do
domínio mentorque.com.br, entrou em 15/10/2026: os servidores de nome são do
Registro.br e nenhuma ferramenta da casa escreve neles).

**Prazo, quando existir (03/10/2026).** Escreva `PRAZO AAAA-MM-DD` no começo do
texto da ação. A `npm run acoes` imprime esses itens num bloco ANTES de tudo,
ordenados pelo que vence primeiro, e a conferência reprova quem escrever a
palavra PRAZO sem uma data que o calendário tenha ("PRAZO: fim do mês" não
passa).

Por que ele existe: no dia em que a lista virou sessão, entrou um item com 28
dias de prazo, cujo vencimento tira os nove apps do Google Play. Ordenado por
idade, ele aparecia por último, atrás de uma negativa de Google Ads que espera
há 29 dias e custa uns R$ 65 por mês. **Idade não é urgência**: a lista media
quanto tempo uma coisa esperou, e não o que acontece se ela não for feita.

A data aqui é lida do TEXTO, e isso contradiz de propósito a regra do destino
logo acima. A diferença é real: destino é classificação, que é palpite e
apodrece quando o texto muda; prazo é um dado literal em formato fixo, que a
conferência obriga a existir.

**A regra dos 21 dias (02/10/2026).** Item parado há mais de três semanas não
volta ao relatório como recomendação repetida: volta com o CUSTO DE HOJE, ou
com a decisão de não fazer. A `npm run acoes` separa esses em bloco próprio
para o agente que levantou não ter como não ver. A conferência continua NÃO
reprovando por idade, de propósito: travar o push de quem programa porque
alguém não entrou num console de terceiro castiga a pessoa errada.

| Desde | Onde | Ação | Por que ela importa | Quem levantou |
| --- | --- | --- | --- | --- |
| 2026-10-17 | app-store | **Criar o teste grátis de 3 dias nas duas assinaturas da Apple** (a chave da API que a casa usa só lê, a Apple recusou a criação com 403): App Store Connect > Apps > Mentorque > Assinaturas > grupo "Premium" > "Mentorque Anual" > em "Preços da assinatura", "Configurar oferta introdutória" > todos os países > início hoje, sem fim > tipo "Teste gratuito" > duração "3 dias" > Confirmar. Repetir em "Mentorque Mensal". NÃO criar nas "Anual 10off" e "Anual 25off" | Lido pela API da App Store em 17/10 às 11h29 UTC: as quatro assinaturas do grupo têm zero ofertas introdutórias, e o app no iPhone diz "Começar 3 dias grátis" no paywall e "Aproveite seus primeiros 3 dias, grátis" no onboarding. São 3 dias porque é o que a tela já promete; mudar para 7 pede build. Mesmo defeito que o Play tinha, consertado lá pela API no mesmo dia | Engenharia |
| 2026-10-16 | lojas | **Trocar a captura de tela com a prova social antiga, nas DUAS lojas**: na Play é a 4ª captura ("Amado por motoristas de todo o Brasil", 4,8, 10.000+, 5.000+ e quatro depoimentos com nome); na App Store é a 5ª (o celular mostra os mesmos 4,8, 10.000+ e 5.000+). Tirar ou trocar por uma captura atual do app | Lido em 16/10 nas páginas públicas das duas lojas (imagens salvas em `docs/lojas/play-ficha-2026-10-16/` e `docs/lojas/appstore-ficha-2026-10-16/`). Em 04/10 o dono decidiu tirar esses números do app, porque nenhum instrumento os sustentava, e o app hoje mostra 5,0, 170+ e 250+ com dois depoimentos reais (`lib/app/content.ts`). As lojas continuaram com a versão antiga: é a mesma promessa sem lastro, agora na vitrine que recebe o tráfego pago. A nota real nas duas lojas é 5,0 | Engenharia, 16/10, ao conferir a lista do dono |
| 2026-10-20 | appsflyer | **Uma tela: a AppsFlyer tem algum OneLink?** Console da AppsFlyer > Configuration > OneLink. Se existir, me diga o nome e eu aponto o `/baixar` para ele por código; se não existir, criar um (o console não tem API) e eu aponto depois. Não precisa de mais nada seu nesta volta | A Mídia reduziu a pergunta em 15/10 com dois instrumentos que ela alcança: no fonte, `lib/stores.ts` tem os dois endereços crus das lojas e nenhum OneLink, então a linha de código é necessária de qualquer jeito; e as únicas fontes pagas da atribuição se atribuem sozinhas. O conserto é clique mais linha. ESCOPO CORRIGIDO EM 20/10 (Engenharia): o OneLink serve ao `/baixar`, o clique do site até a loja (uns 150 aparelhos por mês). Ele NÃO é o que deixa os cadastros sem origem: as instalações pagas da Meta e do Google não passam por ele, e a causa daquela cegueira era o app nunca escutar o retorno de conversão da AppsFlyer, consertado no código em 20/10 e chegando com a 3.3. Prioridade baixa. ATENÇÃO ao histórico desta linha: em 22/09 um item de OneLink saiu desta lista marcado como FEITO com base no painel da Meta, que responde outra pergunta; por isso este pedido começa por leitura e não por criação | Diretor, 20/10, ao achar que o pedido saiu da fila entre papéis sem destino |
| 2026-10-06 | n8n | **Um clique no coletor de métricas**: abrir o fluxo "Analista: metricas externas", o nó "Search Console: top páginas", e trocar a credencial para "Google account" (a mesma dos três nós "Search Console" ao lado). Salvar e publicar | Provado em 06/10 na execução 8827 do coletor: esse nó responde "Request had insufficient authentication scopes" enquanto os irmãos, no mesmo endereço e com a mesma consulta, respondem. Existem duas credenciais Google OAuth no n8n ("Google account" e "AdMob API"); o nó nasceu em 08/09 ligado à errada. Por isso o retrato traz `topPaginas` vazio há quatro semanas e o SEO escolhe qual guia aprofundar sem saber qual página recebe cada impressão. A API do n8n não liga credencial em nó HTTP (tentado em 06/10, "Credentials not found") | Engenharia |
| 2026-10-20 | search-console | **Uma tela, uns dois minutos: abrir o Search Console do mentorque.com.br, menu Links, e me mandar o print** (ou os números de "Sites com mais links" e "Páginas mais linkadas"). Não precisa mexer em nada | É a leitura de partida do único ramo da minha régua de busca que não tem instrumento. Se em 03/11 a mediana de posição de categoria estiver pior que 65, a recomendação deste papel muda de "escrever mais página" para "conseguir a primeira citação de fora", e a mediana já está em 93,5 (06/10 era 71, 13/10 era 82). O relatório de links NÃO está na API do Search Console, que serve só busca, sitemap e inspeção de URL, então nenhuma rotina da casa consegue ler isso: é tela, e ninguém nesta casa nunca abriu essa tela. Sem ela, "temos zero citação de fora" é suposição minha, não medida, e um plano de conseguir citação sem saber o ponto de partida não tem como ser conferido depois | Conteúdo e SEO |
| 2026-10-13 | youtube | **Gravar um Short de uns 50 segundos: qual cabo da bateria soltar primeiro.** Roteiro pronto, plano por plano, em `docs/conteudo/pautas.md` (Pauta 03). Precisa do seu carro e de uma chave de boca 10mm: nada para comprar, nada para desmontar. Se preferir gravar outra das três pautas escritas, me diga qual e eu adapto o roteiro | Conferido em 13/10 no pacote `youtube` do retrato: o canal não publica desde 19/09, são 24 dias. E `diy-battery` é a aula mais aberta do catálogo entre as que ainda não têm vídeo (35 aparelhos distintos em 30 dias, lido no banco em 13/10, contra 17 do filtro de ar e 9 das palhetas). Gravar esta fecha duas coisas num take: a promessa de vídeo daquela aula, aberta desde 01/09, e a volta do canal. As duas pautas anteriores ficaram 42 e 21 dias só dentro de um arquivo, sem contador de idade, e isso é falha minha contra a obrigação 3 de DIRETRIZES | Conteúdo e SEO |
