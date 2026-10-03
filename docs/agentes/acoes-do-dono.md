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
`stripe`.

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
| 2026-09-03 | google-ads | Aplicar as negativas no Google Ads: `curso`, `certificado`, `senai`, `apostila`, `presencial` | Três quartos do dinheiro com nome foi para quem procura curso de mecânica, e as conversões que o Google enxergou vieram desses termos, então o lance automático aprendeu a comprar mais deles | Diretor |
| 2026-09-07 | google-ads | Trocar a conversão do Google Ads de "tocou em baixar" para "criou conta" | As nove contas da semana nasceram na web e a App Store teve zero downloads: o lance automático está sendo treinado por um sinal que não é o desfecho do negócio, e que parou em 04/09 | Esta rodada |
| 2026-09-10 | meta | Instagram, o que falta (diagnóstico de 12/09 às 17h37): no painel do app 1226586899623385, (1) adicionar o produto **Messenger** e, nele, "Instagram settings": ligar a API de mensagens do Instagram e, em Webhooks, assinar `comments` e `messages` na URL `https://n8n.vocaboost.com.br/webhook/instagram-comentarios` com o token `mq-ig-7f3a9c2e51`; (2) gerar de novo o token da Página com as permissões `instagram_manage_messages`, `instagram_manage_comments`, `pages_messaging`, `pages_manage_metadata` e colar na credencial "Bearer Auth account" do n8n; (3) comentar de novo num post e conferir a execução | A resposta privada foi tentada com o token atual e a Meta recusou com "(#3) Application does not have the capability to make this API call": o app não tem o produto de mensagens. E nenhum dos 5 comentários de hoje chegou ao webhook: o campo `comments` não está assinado. Token, Página e Instagram estão certos (conferido pelo Graph) | Engenharia |
| 2026-09-27 | n8n | No n8n, desligar o quinto fluxo: **"Conteúdo/SEO (Blog)" do Vocaboost** (id `mIsag1ifLfNWzCxh`). Quatro dos cinco de 20/09 você desligou; este ficou ligado | Ele dispara terça e sexta às 9h, gera o artigo inteiro com a IA (a chamada a Claude termina com SUCESSO, 3.963 tokens de saída na rodada de 25/09) e só então morre ao tentar gravar, porque o Supabase do Vocaboost não existe mais: o endereço não resolve em DNS. Ou seja, paga o artigo e joga fora, duas vezes por semana, e ninguém olha. Foram quatro falhas seguidas que eu consigo ver, em 15, 18, 22 e 25/09. O dinheiro é pequeno e NÃO é o motivo: o motivo é que um fluxo de produto morto continua armado e falhando sem ninguém ver. Desligar fluxo não é da minha alçada | Segurança |
| 2026-09-24 | google-ads | **Colar a etiqueta na URL final do anúncio de busca**, que hoje é o `/baixar` limpo. O valor exato, pela convenção de `docs/utms.md`: `https://www.mentorque.com.br/baixar?utm_source=google&utm_medium=cpc&utm_campaign=lancamento`. Antes de trocar, confira no painel qual é a URL final de hoje, porque quem enxerga o campo é quem abre a conta | Desde 20/09 nenhum clique da busca chega com nome: o rastro etiquetado no funil caiu de 21 para 0 no dia 20 e no mesmo dia apareceram 24 toques anônimos no botão de baixar, do mesmo tamanho dos cliques da campanha. A busca gastou R$ 84,73 de 20 a 24/09 sem que dê para dizer se trouxe uma conta ou dez, e são uns R$ 640 por mês nesse ritmo. Etiqueta não mexe em lance, orçamento, público nem região. Devolve o custo por clique-para-a-loja por campanha; NÃO devolve a conta, que nasce dentro do app. **CONDICIONADA em 02/10: só vale se a busca voltar a entregar.** Ela parou no dia 24/09, sem ser pausada, e gastou R$ 5,67 em oito dias com 98 impressões. Etiquetar anúncio que recebe dois cliques por semana não compra informação | Mídia paga |
| 2026-10-02 | play-console | **Abrir o relatório de aquisição do Play Console e passar as linhas por fonte**: Adquirir usuários > Aquisição de usuários > agrupar por fonte de tráfego > últimos 7 dias. Interessam três linhas: Google Ads, Facebook e busca orgânica na loja. De passagem, olhar também a parcela de impressões perdida por orçamento e por classificação das duas campanhas do Google, que diz por que a busca parou | R$ 280,68 saíram na semana de 24 a 30/09 divididos quase ao meio entre duas campanhas de instalação (Google R$ 151,83 e Meta R$ 132,11), e não existe NENHUMA forma do nosso lado de dizer qual metade trouxe as 47 contas novas: campanha de loja não carrega etiqueta. Esta é a mais barata das três saídas conhecidas, é uma tela do painel que já existe, não precisa de versão nova do app nem de gasto novo. Também separa quanto da instalação é orgânica, que é a parte que nenhuma plataforma de anúncio tem interesse em mostrar | Mídia paga |
| 2026-09-19 | google-ads | Depois de criar a ação de conversão "Criou conta", importar as 20 contas já medidas por GCLID: Ferramentas > Medição > Conversões > Importações > baixar o modelo e subir uma linha por conta, com o gclid e a hora do cadastro. A planilha o agente de mídia monta na hora em que for pedida | O gclid do clique está guardado em TODOS os 20 cadastros etiquetados desde 23/08 (10 de 10 na última semana, 8 de 8 na anterior), e o prazo de 90 dias cobre tudo, porque o clique mais antigo é de 03/09. O Google não recebe sinal de desfecho desde 04/09: foram R$ 575,10 gastos com o lance sendo decidido às cegas enquanto 20 desfechos reais esperam no nosso banco. É a metade retroativa da linha de 07/09, não uma troca dela. **PERDEU PRIORIDADE em 24/09**, e é honesto dizer: ela treinaria a campanha de busca, que desde 20/09 manda para a loja, e os 20 cliques já têm três semanas. Continua valendo, atrás da etiqueta na URL e das negativas | Mídia paga |
| 2026-09-19 | meta | Junto com os passos do Instagram de 10/09, pedir também a permissão `instagram_manage_insights` no app da Meta | É ela que libera alcance, salvamento e visita ao perfil por post. Hoje não existe NENHUMA medição de post orgânico, e o pedido de acompanhar a evolução das postagens não tem fonte de dado sem isso | Mídia paga |
| 2026-10-01 | lojas | **Colar as 12 respostas às avaliações**, prontas em `docs/lojas/respostas.md` (7 da App Store, 5 da Play, cada uma já medida contra o limite da loja). Ao colar cada uma, marcar `respondido = true` na tabela `lojas_avaliacoes`, senão a rodada seguinte rascunha de novo. A da App Store assinada por "Moraes455" não tem rascunho: confirme se é você, e se for, apague a avaliação pela própria conta | São 12 pessoas que gastaram um minuto elogiando o app, todas 5 estrelas, e nenhuma foi respondida. A mais antiga espera desde 02/09. Resposta pública é o único lugar onde quem ainda não baixou vê que existe gente atendendo do outro lado, e avaliação respondida três semanas depois não parece atendimento, parece mala direta. A do Moraes455 é risco de política: avaliação do desenvolvedor no próprio app é manipulação de avaliação nas duas lojas | ASO e Lojas |
| 2026-10-01 | app-store | **No próximo envio à Apple, trocar na mesma tela o nome para `Mentorque: manutenção do carro` e as palavras-chave para `mecanica,barulho,painel,obd2,revisao,pneu,freio,motor,diagnostico,gastos,oleo,bateria,suspensao`** (os dois valores exatos estão em `docs/lojas/ficha.md`) | Na Apple esses campos só mudam junto com envio de versão, e já passaram QUATRO envios desde que a troca foi proposta em 01/09: a 2.6, a 2.7, a 2.8 e a 2.9, todas READY_FOR_SALE. Hoje a Play diz "manutenção do carro" e a App Store diz "cuidar do carro", sobre o mesmo app. Custa dois minutos SE for lembrado na hora do envio, e nada se for esquecido de novo | ASO e Lojas |
| 2026-10-01 | play-console | **Abrir o Play Console em Aquisição de usuários, origem "Pesquisa do Google Play", e colar os 30 dias**, mais a taxa de conversão da ficha. É uma tela | Sem isso não existe veredito possível para a troca de título de 01/09 nem para a proposta de descrição curta de hoje: aquisição por origem e conversão da ficha NÃO vêm em nenhum coletor (o `play_console` do retrato traz só ANR e crash, conferido no pacote de hoje). Enquanto a tela não for aberta, toda proposta de ficha da Play é decidida no escuro e nenhuma pode ser julgada | ASO e Lojas |
| 2026-10-02 | stripe | **Acrescentar `invoice.paid` à lista de eventos do endpoint do Stripe** (Desenvolvedores > Webhooks > o endpoint de produção > editar eventos). Uma caixa marcada, sem mexer em cobrança, preço ou plano | É o que transforma "quanto entrou" em pergunta de banco. Hoje o endpoint tem quatro eventos (três de assinatura e o checkout) e NENHUM traz valor pago, então toda vez que alguém quer saber o caixa real alguém precisa abrir duas telas do painel: foi assim em 01/10, na primeira cobrança do produto, e vai ser assim todo mês. Com o evento ligado, o `renovou` passa a carregar o valor da fatura (o código que lê a fatura já está no ar desde 02/10, e hoje ele depende de buscar a fatura na mão) | QA e Produto |
| 2026-10-02 | lojas | **Gerar as duas chaves de resposta a avaliação**: na Play, uma conta de serviço com a permissão de responder avaliações (Play Console > Configuração > Acesso à API); na Apple, uma chave do App Store Connect com acesso a Customer Reviews. Me mande o caminho delas, não o conteúdo, e eu armo a rota de resposta | Rascunho para colar não cola: são 12 respostas prontas desde 15/09 e nenhuma foi publicada em 29 dias, em duas rodadas corretas do agente de ASO. Com as chaves, a resposta sai pelo mesmo desenho do e-mail de cancelamento: eu preparo e deixo armado, você dispara uma vez e as 12 saem, e a marca no banco impede sair duas vezes. Enquanto isso não existir, a lista vai continuar pedindo colagem manual | Esta rodada |
| 2026-10-03 | play-console | **PRAZO 2026-10-31: resolver a verificação da forma de pagamento no Play Console**, ou o perfil de desenvolvedor e os 9 apps saem do Google Play. O primeiro passo é abrir "Mais detalhes" no aviso vermelho da página inicial e ler o motivo exato. A conta bancária precisa ser PJ, no CNPJ da AppFactory.RLM, com a razão social batendo com o perfil de pagamentos: conta pessoa física em perfil de organização é reprovada, e o tipo do perfil NÃO dá para trocar depois de criado (trocar exigiria outra conta de desenvolvedor e republicar os 9 apps do zero) | É a única coisa aberta na operação que acaba com o produto em vez de custar dinheiro. Tira do ar os 9 apps, inclusive o Mentorque, que acabou de registrar a primeira venda de loja (25/09, recuperada em 03/10). Também trava o repasse do dinheiro que a Play já tem para pagar, e deixa a 3.0 sem para onde ir. Vinte e oito dias de prazo, e verificação de documento de empresa costuma levar dias em cada rodada de correção, então o relógio real é mais curto que o do aviso | Esta rodada |
| 2026-10-03 | play-console | **PRAZO 2026-10-31: tirar do ar o pagamento externo do app do bolão**, que está na MESMA conta AppFactory.RLM e segue com link direto de pagamento para compra feita dentro do app. O caminho mais rápido, e o recomendado, é despublicar o app, já que a Copa acabou em julho. Se ele precisar continuar no ar, então publicar uma versão sem o pagamento, ou aderir ao programa oficial de link externo (vale no Brasil desde junho/2026, com adesão declarada e taxa do Google por cima). Tirar o link só do código NÃO resolve: o que o Google olha é a versão publicada | Compra de conteúdo digital consumido dentro do app tem que passar pelo faturamento do Play, e isso vale para o bolão igual ao Premium do Mentorque. Não ter dado problema até hoje não é permissão, é não ter sido pego. E a punição desse tipo de violação é na CONTA, não no app: encontrada agora, enquanto a conta está sob revisão por causa da verificação de pagamento, ela não vira um processo separado, vira peso somado no mesmo, e o que está em risco são os 9 apps, inclusive o Mentorque | Esta rodada |
| 2026-10-03 | stripe | **Ler no painel do Stripe quantos resgates o cupom `LANCAMENTO1MES` ainda aguenta** e me passar o número, ou autorizar um cupom novo com teto maior. O e-mail de "termine o cadastro" está armado e a rota EXIGE esse número para disparar: ela não manda para mais gente do que o cupom suporta | O teto do cupom é 25 e `max_redemptions` não é editável no Stripe (registrado em 03/09, quando subir de 10 para 25 só foi possível criando cupom novo). A lista tem 32 pessoas. Se o teto já tiver sido consumido em parte, o e-mail entrega preço cheio para quem clicar depois do limite, calado, na tela de quem acabou de ler "por nossa conta". Com o número na mão, ou a gente manda para quantos cabem e diz quantos ficaram para a próxima, ou você autoriza um cupom novo | Esta rodada |
