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
| 2026-11-13 | supabase | **Reconectar a integração do Supabase na organização do Mentorque.** Em 20/10 você fez isso em minutos ("pode tentar novamente") e o banco voltou na hora; ela saiu de lugar outra vez. Hoje o `list_projects` das sessões de agente traz a organização `ianjvpotzelxokbdupmx` (financasrodlu e sipatgo) e NÃO traz o Mentorque, e toda consulta responde "You do not have permission to perform this action" | Segunda vez em quatro semanas. Em 20/10 ela parou a rodada do Diretor inteira; hoje parou metade da minha. O retrato continua chegando (ele é gerado no n8n, por outro caminho), então o diagnóstico semanal não morre, mas **todo corte fino morre**: por `origem`, por `versao`, por `detalhe` do evento, e as leituras por aparelho que fecham veredito. Nesta rodada eu não pude abrir aposta nova por causa disso, pelo critério 11 do meu manual (a métrica tem de ser lida no instrumento no dia em que a aposta abre). O `/api/funil`, que seria o plano B, não resolve: ele devolve as mesmas semanas que o retrato já traz, e o detalhe fino é justamente o que mora no banco | CRO, 13/11, com o desfecho de 20/10 do Diretor como precedente |
| 2026-11-08 | n8n | **Colar o App Secret da Meta numa credencial do n8n, para o webhook do Instagram passar a conferir a assinatura.** No n8n: Credentials > New > "Header Auth" (ou Generic > Query/Header), nome "Meta: app secret", e colar o valor que está em developers.facebook.com > o app do Mentorque > Configurações > Básico > Chave Secreta do Aplicativo. Só isso do seu lado; a engenharia liga o nó de conferência depois (linha de 08/11 em `entre-papeis.md`). NÃO precisa girar nada e nada para de funcionar enquanto isso | O webhook que recebe os comentários do Instagram não autentica nada hoje, e o fluxo responde no Direct pela nossa conta a partir do corpo que recebe. Quem souber o endereço pode fabricar um comentário e escolher em qual conversa a nossa conta responde (o texto, não: ele sai da nossa tabela de regras). Medido em 08/11: as 11 execuções da janela guardada são todas da Meta de verdade, e **cada entrega dela já chega com o cabeçalho de assinatura**, que é o que fecharia a porta e está sendo ignorado. Ou seja: a prova de origem chega de graça e falta só a chave para conferir. Sem evidência de abuso, e por isso isto não é urgente; é porta aberta com a tranca ao lado | Segurança |
| 2026-10-30 | n8n | **Uma frase de decisão: o modo motorista de aplicativo continua existindo ou sai do app?** A peça está pronta e desligada desde 13/09, e a pergunta que ficou com você nesse dia nunca foi fechada: para quem o Mentorque fala, motorista de aplicativo ou dono de carro comum. Se continuar, ela precisa de campanha e de texto que falem com esse público, e isso é gasto novo; se sair, eu removo o interruptor e os dois campos de estado numa rodada | Medido em 23/10 no `user_state`: **zero de 402 contas** que têm a chave no estado ligaram o interruptor, e o evento `lancou_ganho` nunca foi gravado uma única vez. O zero NÃO é estrutural: a chave existir nas 402 prova que elas rodam a versão com a peça, então ela foi publicada e ninguém a quis. A ficha das lojas mira esse público e o app nunca falou com ele. O custo de manter é quase zero (interruptor desligado, nada na frente de ninguém); o custo de não decidir é um experimento morto no código sem dono, que é o que o retorno de 26/10 cobrou de mim | CRO, 30/10, atrasado 43 dias por falha minha |
| 2026-10-17 | app-store | **Criar o teste grátis de 3 dias nas duas assinaturas da Apple** (a chave da API que a casa usa só lê, a Apple recusou a criação com 403): App Store Connect > Apps > Mentorque > Assinaturas > grupo "Premium" > "Mentorque Anual" > em "Preços da assinatura", "Configurar oferta introdutória" > todos os países > início hoje, sem fim > tipo "Teste gratuito" > duração "3 dias" > Confirmar. Repetir em "Mentorque Mensal". NÃO criar nas "Anual 10off" e "Anual 25off" | Lido pela API da App Store em 17/10 às 11h29 UTC: as quatro assinaturas do grupo têm zero ofertas introdutórias, e o app no iPhone diz "Começar 3 dias grátis" no paywall e "Aproveite seus primeiros 3 dias, grátis" no onboarding. São 3 dias porque é o que a tela já promete; mudar para 7 pede build. Mesmo defeito que o Play tinha, consertado lá pela API no mesmo dia | Engenharia |
| 2026-10-16 | lojas | **Trocar a captura de tela com a prova social antiga, nas DUAS lojas**: na Play é a 4ª captura ("Amado por motoristas de todo o Brasil", 4,8, 10.000+, 5.000+ e quatro depoimentos com nome); na App Store é a 5ª (o celular mostra os mesmos 4,8, 10.000+ e 5.000+). Tirar ou trocar por uma captura atual do app | Lido em 16/10 nas páginas públicas das duas lojas (imagens salvas em `docs/lojas/play-ficha-2026-10-16/` e `docs/lojas/appstore-ficha-2026-10-16/`). Em 04/10 o dono decidiu tirar esses números do app, porque nenhum instrumento os sustentava, e o app hoje mostra 5,0, 170+ e 250+ com dois depoimentos reais (`lib/app/content.ts`). As lojas continuaram com a versão antiga: é a mesma promessa sem lastro, agora na vitrine que recebe o tráfego pago. A nota real nas duas lojas é 5,0 | Engenharia, 16/10, ao conferir a lista do dono |
| 2026-10-20 | appsflyer | **Uma tela: a AppsFlyer tem algum OneLink?** Console da AppsFlyer > Configuration > OneLink. Se existir, me diga o nome e eu aponto o `/baixar` para ele por código; se não existir, criar um (o console não tem API) e eu aponto depois. Não precisa de mais nada seu nesta volta | A Mídia reduziu a pergunta em 15/10 com dois instrumentos que ela alcança: no fonte, `lib/stores.ts` tem os dois endereços crus das lojas e nenhum OneLink, então a linha de código é necessária de qualquer jeito; e as únicas fontes pagas da atribuição se atribuem sozinhas. O conserto é clique mais linha. ESCOPO CORRIGIDO EM 20/10 (Engenharia): o OneLink serve ao `/baixar`, o clique do site até a loja (uns 150 aparelhos por mês). Ele NÃO é o que deixa os cadastros sem origem: as instalações pagas da Meta e do Google não passam por ele, e a causa daquela cegueira era o app nunca escutar o retorno de conversão da AppsFlyer, consertado no código em 20/10 e chegando com a 3.3. Prioridade baixa. ATENÇÃO ao histórico desta linha: em 22/09 um item de OneLink saiu desta lista marcado como FEITO com base no painel da Meta, que responde outra pergunta; por isso este pedido começa por leitura e não por criação | Diretor, 20/10, ao achar que o pedido saiu da fila entre papéis sem destino |
| 2026-10-20 | search-console | **Uma tela, uns dois minutos: abrir o Search Console do mentorque.com.br, menu Links, e me mandar o print** (ou os números de "Sites com mais links" e "Páginas mais linkadas"). Não precisa mexer em nada | ACONTECEU O QUE ESTA LINHA PREVIA (atualizado em 03/11, sem repetir o pedido): a régua leu hoje, a mediana de posição de categoria está em 98 com uma consulta só, e as cinco leituras (9, 4, 2, 2 e 1 consultas) caem todas no ramo "pior que 65". A cadeira PAROU de escrever página nova para busca e a recomendação dela passou a ser conseguir a primeira citação de fora, que é exatamente o que esta tela mede o ponto de partida. O relatório de links NÃO está na API do Search Console, que serve só busca, sitemap e inspeção de URL, então nenhuma rotina da casa consegue ler isso: é tela, e ninguém nesta casa nunca abriu essa tela. Sem ela, "temos zero citação de fora" é suposição minha, não medida, e um plano de conseguir citação sem saber o ponto de partida não tem como ser conferido depois | Conteúdo e SEO |
| 2026-11-01 | lojas | **Reordenar as capturas da Play, sem desenhar nada**: pôr em 1º a atual 2ª ("Entenda sintomas e evite gastos"), em 2º a atual 3ª ("Tenha o histórico completo"), em 3º a atual 1ª ("Cadastre seu carro") e mandar a do paywall (5ª, com os preços) para o fim. É arrastar no console, na MESMA visita da linha de 16/10 sobre a prova social inventada | Abri as 8 capturas da Play uma a uma em 01/11 (as que foram salvas em 16/10). Elas são o onboarding capturado na ordem do onboarding, com barra de progresso, seletor PT/EN e o botão "Continuar" dentro da imagem: é o fluxo desenhado para quem JÁ instalou. Quem chega vê duas, no máximo três, sem arrastar, e hoje a primeira pede cadastro enquanto a única que diz problema e desfecho juntos está na segunda. Essa frase é a mesma tese da descrição curta que subiu em 04/10, e o relatório de conversão sugere que foi ela que moveu "Ads and referrals" de 34,9% para 54,1%. Volta atrás em um minuto, porque são as mesmas imagens em outra ordem | ASO e Lojas |
| 2026-11-04 | n8n | **Uma pergunta, sem clique nenhum: três coisas no n8n parecem não ter mais uso, e eu não desligo nada antes de você dizer por que estão ligadas.** (1) A credencial "Header Auth account", que nenhum fluxo conhecido usa; (2) os 47 fluxos de produtos desligados (44 de Vocaboost, 3 de Dermato), que ficam guardados com as definições deles; (3) o fluxo de Conteúdo e SEO do blog do Vocaboost (id `mIsag1ifLfNWzCxh`), que continua ATIVO. Me diga o que pode sair e eu levo na próxima rodada; se algo fica de propósito, escreva o motivo e eu paro de trazer | É o inventário mensal de permissões, cuja data estava marcada desde 04/10, e é a primeira vez que ele sai com a lista inteira na mão: 21 credenciais e 74 fluxos no n8n, 1 colaborador no GitHub (você, admin) e 1 membro na Vercel (você, OWNER), lidos em 04/11. As três linhas de cima importam porque qualquer um que edite fluxo nesse n8n alcança as 21 credenciais, inclusive as do Mentorque, e porque fluxo guardado guarda a definição dele mesmo parado. Em 22/09 você já decidiu NÃO girar as chaves em texto puro, e isto não reabre aquilo: aqui a pergunta é sobre o que pode ser APAGADO, não sobre girar. Também não é urgente: nenhuma dessas três é um buraco aberto hoje, é porta que ninguém usa | Segurança |
| 2026-10-13 | youtube | **Gravar um Short de uns 50 segundos: qual cabo da bateria soltar primeiro.** Roteiro pronto, plano por plano, em `docs/conteudo/pautas.md` (Pauta 03). Precisa do seu carro e de uma chave de boca 10mm: nada para comprar, nada para desmontar. Se preferir gravar outra das três pautas escritas, me diga qual e eu adapto o roteiro | Conferido em 13/10 no pacote `youtube` do retrato: o canal não publica desde 19/09, são 24 dias. E `diy-battery` é a aula mais aberta do catálogo entre as que ainda não têm vídeo (35 aparelhos distintos em 30 dias, lido no banco em 13/10, contra 17 do filtro de ar e 9 das palhetas). Gravar esta fecha duas coisas num take: a promessa de vídeo daquela aula, aberta desde 01/09, e a volta do canal. As duas pautas anteriores ficaram 42 e 21 dias só dentro de um arquivo, sem contador de idade, e isso é falha minha contra a obrigação 3 de DIRETRIZES | Conteúdo e SEO |
