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
`stripe`, `appsflyer`, `vercel`, `youtube` (o Studio, onde moram retenção e
clique por impressão, que a API do coletor não traz), `supabase` (o SQL
Editor, para o comando destrutivo que a ferramenta do agente segura para
confirmação e que não chega numa sessão sem gente).

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
| 2026-10-08 | google-ads | **DECIDIR o que fazer com a campanha de busca "Mentorque Lançamento"**: mantém, corta orçamento ou pausa. Não é pedido de clique, é decisão de dinheiro, e o número agora existe | Ela voltou a entregar em 04/10, depois de 10 dias reprovada, e voltou gastando uns R$ 36 por dia contra os R$ 20 de antes: R$ 143,36 em oito dias, 33% de toda a mídia e 50% do dinheiro do Google. Trouxe 3 instalações atribuídas. As duas réguas concordam na direção: R$ 47,79 por instalação pela AppsFlyer e R$ 8,96 pela contagem do próprio Google, contra R$ 3,23 e R$ 0,50 da campanha de vídeo. É de 15 a 18 vezes mais caro por instalação. Ao custo medido hoje no vídeo, os mesmos R$ 143,36 semanais comprariam da ordem de 44 instalações em vez de 3, com a ressalva de que mover orçamento não preserva eficiência | Mídia paga |
| 2026-10-08 | appsflyer | **Ligar a integração de custo** na AppsFlyer (o campo de custo vem vazio em todas as linhas do relatório de parceiros) | Sem ela, o custo por instalação por campanha é calculado à mão a cada rodada, cruzando o gasto dos painéis com as instalações atribuídas. Com ela, o número sai do painel pronto e para de depender de a rodada acertar a janela dos dois lados. O aviso vem na própria coleta desde 08/10 | Mídia paga |
| 2026-10-06 | n8n | **Um clique no coletor de métricas**: abrir o fluxo "Analista: metricas externas", o nó "Search Console: top páginas", e trocar a credencial para "Google account" (a mesma dos três nós "Search Console" ao lado). Salvar e publicar | Provado em 06/10 na execução 8827 do coletor: esse nó responde "Request had insufficient authentication scopes" enquanto os irmãos, no mesmo endereço e com a mesma consulta, respondem. Existem duas credenciais Google OAuth no n8n ("Google account" e "AdMob API"); o nó nasceu em 08/09 ligado à errada. Por isso o retrato traz `topPaginas` vazio há quatro semanas e o SEO escolhe qual guia aprofundar sem saber qual página recebe cada impressão. A API do n8n não liga credencial em nó HTTP (tentado em 06/10, "Credentials not found") | Engenharia |
| 2026-10-06 | youtube | **Abrir o YouTube Studio e mandar dois números dos cinco vídeos do lote de 19/09**: a retenção média (%) e o clique por impressão (CTR, %). Caminho: Studio > Conteúdo > clicar no vídeo > Análises > aba Alcance (CTR) e aba Envolvimento (retenção). São cinco vídeos e uns cinco minutos. Se preferir, o print das duas abas de cada um resolve | Duas rodadas minhas concluíram sobre o canal só com VIEWS, que é a única coisa que o coletor traz e a que mais compõe com a própria distribuição: vídeo que pegou recebe mais porque pegou. Retenção e CTR são o que separa "o assunto estava errado" de "a capa estava errada", e sem eles a conclusão do canal vai ser a mesma frase repetida com números maiores. O lote de 19/09 é o caso raro em que isso dá para medir limpo: cinco vídeos no mesmo minuto, de 1770 a 20 views, com tudo o mais constante | Conteúdo e SEO |
| 2026-10-04 | meta | **Só se você quiser medir alcance e salvamento por post: gerar o token de novo** (Usuários do sistema > Analista Mentorque > Gerar token, app Mentorque, nunca expira, com as permissões de Instagram e de Página marcadas) e colar na credencial "Bearer Auth account" do n8n. Se não quiser isso agora, me diga e eu tiro a linha. Nada mais na Meta depende de você | Conferido em 04/10 no n8n: o webhook do Instagram recebe comentários (64 chamadas, zero erro, última em 04/10), todos os campos estão assinados, inclusive `messages`, e as permissões estão no app. A única coisa nova de hoje é `instagram_manage_insights`, e token carrega as permissões do momento em que nasce. A resposta no Direct a um comentário de terceiro eu confiro sozinho na próxima vez que alguém de fora comentar, sem pedir nada | Engenharia |
| 2026-10-01 | app-store | **Uma busca de um minuto, já dá (a 3.1 está na App Store desde 07/10)**: abrir a App Store no iPhone, buscar `manutencao` sem acento e ver se o Mentorque aparece. Se não aparecer, me avisar que eu devolvo a palavra ao campo de palavras-chave | É a conferência do risco escrito na ficha: o nome tem `manutenção` com acento e o campo de palavras-chave deixou de ter `manutencao` sem acento, apostando que a Apple normaliza. Só a loja publicada responde. O "Idioma: EN" da página pública não era a localização principal (você mostrou: Portuguese (Brazil)); era o binário, que só declarava inglês. Consertado no código em 04/10 e vai na 3.0 | ASO e Lojas |
| 2026-10-04 | google-ads | PRAZO 2026-10-30 **Fazer a verificação do anunciante** (o aviso amarelo "Confirme sua identidade" no topo do Google Ads, botão Começar) | O próprio Google diz na faixa que "alguns dos seus anúncios podem estar pausados ou limitados" até a verificação, com data limite 30/10/2026. Apareceu no print de 04/10 enquanto você abria a tela de conversões. É cadastro, não é coisa de código, e anúncio limitado em silêncio é gasto que não entrega. Não sei desde quando a faixa está lá | Mídia paga |
| 2026-10-10 | google-ads | **Marcar a instalação da AppsFlyer como ação de conversão PRINCIPAL** (Google Ads > Metas > Conversões > a ação "mentorque.app (Android) first_open" > Editar configurações > "Principal"), para a campanha passar a otimizar por ela e não pela contagem do próprio Google | A importação já foi feita, por você, em 04/10: relido em 10/10 no retrato (`acoesDeConversao`), existem duas ações de origem AppsFlyer, `first_open` e `session_start`, criadas em 04/10 à tarde. A linha anterior pedia a importação e ficou seis dias pedindo coisa feita; sai. O que o instrumento sugere que falta: `first_open` conta 77 em "todas as conversões" e 0 em "conversões", que no Google Ads é a assinatura de ação secundária (observação). Enquanto for secundária, a campanha segue otimizando pela ação do Play (651). Se você já marcou como principal depois das 09h de 10/10, me avise e eu releio | Mídia paga |
