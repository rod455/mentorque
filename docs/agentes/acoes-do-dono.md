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
`stripe`, `appsflyer`, `vercel`.

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
| 2026-10-04 | meta | **Só se você quiser medir alcance e salvamento por post: gerar o token de novo** (Usuários do sistema > Analista Mentorque > Gerar token, app Mentorque, nunca expira, com as permissões de Instagram e de Página marcadas) e colar na credencial "Bearer Auth account" do n8n. Se não quiser isso agora, me diga e eu tiro a linha. Nada mais na Meta depende de você | Conferido em 04/10 no n8n: o webhook do Instagram recebe comentários (64 chamadas, zero erro, última em 04/10), todos os campos estão assinados, inclusive `messages`, e as permissões estão no app. A única coisa nova de hoje é `instagram_manage_insights`, e token carrega as permissões do momento em que nasce. A resposta no Direct a um comentário de terceiro eu confiro sozinho na próxima vez que alguém de fora comentar, sem pedir nada | Engenharia |
| 2026-09-24 | google-ads | **Colar a etiqueta na URL final do anúncio de busca**, que hoje é o `/baixar` limpo. O valor exato, pela convenção de `docs/utms.md`: `https://www.mentorque.com.br/baixar?utm_source=google&utm_medium=cpc&utm_campaign=lancamento`. Antes de trocar, confira no painel qual é a URL final de hoje, porque quem enxerga o campo é quem abre a conta | Desde 20/09 nenhum clique da busca chega com nome: o rastro etiquetado no funil caiu de 21 para 0 no dia 20 e no mesmo dia apareceram 24 toques anônimos no botão de baixar, do mesmo tamanho dos cliques da campanha. A busca gastou R$ 84,73 de 20 a 24/09 sem que dê para dizer se trouxe uma conta ou dez, e são uns R$ 640 por mês nesse ritmo. Etiqueta não mexe em lance, orçamento, público nem região. Devolve o custo por clique-para-a-loja por campanha; NÃO devolve a conta, que nasce dentro do app. **CONDICIONADA em 02/10: só vale se a busca voltar a entregar.** Ela parou no dia 24/09, sem ser pausada, e gastou R$ 5,67 em oito dias com 98 impressões. Etiquetar anúncio que recebe dois cliques por semana não compra informação **Reconferido em 04/10 no funil**: desde 19/09, ZERO cadastros com UTM ou gclid, em 28 dias com 110 cadastros. Antes de 19/09 chegavam 1 a 3 por dia com etiqueta. Continua aberto, e vale só para a campanha de busca (3,7% do gasto); a campanha de app instala pela loja e não passa pela web. | Mídia paga |
| 2026-10-01 | app-store | **Depois que a 3.0 publicar na Apple, uma busca de um minuto**: abrir a App Store no iPhone, buscar `manutencao` sem acento e ver se o Mentorque aparece. Se não aparecer, me avisar que eu devolvo a palavra ao campo de palavras-chave | É a conferência do risco escrito na ficha: o nome tem `manutenção` com acento e o campo de palavras-chave deixou de ter `manutencao` sem acento, apostando que a Apple normaliza. Só a loja publicada responde. O "Idioma: EN" da página pública não era a localização principal (você mostrou: Portuguese (Brazil)); era o binário, que só declarava inglês. Consertado no código em 04/10 e vai na 3.0 | ASO e Lojas |
| 2026-10-04 | google-ads | PRAZO 2026-10-30 **Fazer a verificação do anunciante** (o aviso amarelo "Confirme sua identidade" no topo do Google Ads, botão Começar) | O próprio Google diz na faixa que "alguns dos seus anúncios podem estar pausados ou limitados" até a verificação, com data limite 30/10/2026. Apareceu no print de 04/10 enquanto você abria a tela de conversões. É cadastro, não é coisa de código, e anúncio limitado em silêncio é gasto que não entrega. Não sei desde quando a faixa está lá | Mídia paga |
| 2026-10-04 | google-ads | **Importar a instalação da AppsFlyer como ação de conversão** na conta Mentorque: Metas > Conversões > Criar ação de conversão > App > Editar fontes de dados > em "Análise de aplicativos de terceiros" marcar a AppsFlyer e o evento de instalação do Android e do iPhone > Concluído e salvar. De passagem, na tabela "Análise de aplicativos de terceiros", apagar a linha do Adjust (Opções), criada por engano | Os dois vínculos estão feitos e ATIVOS na conta certa (conferido no print de 04/10: AppsFlyer / mentorque.app / Ativo e AppsFlyer / 6797291865 / Ativo). O que falta é o Google passar a USAR o que a AppsFlyer manda: sem importar, ele continua contando instalação sozinho (as 401 de origem GOOGLE_PLAY) e a campanha otimiza para o número dele, não para o medido. A faixa amarela da AppsFlyer ("make sure to measure your app conversions in Google Ads") some quando este passo é feito. Eu confiro pelos dois instrumentos na coleta das 05:30: `googleadwords_int` no pacote da AppsFlyer (primeiro dia possível 05/10) e uma ação de origem THIRD_PARTY_APP_ANALYTICS na API do Google Ads | Mídia paga |
