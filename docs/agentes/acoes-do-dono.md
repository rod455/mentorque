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

| Desde | Ação | Por que ela importa | Quem levantou |
| --- | --- | --- | --- |
| 2026-09-03 | Aplicar as negativas no Google Ads: `curso`, `certificado`, `senai`, `apostila`, `presencial` | Três quartos do dinheiro com nome foi para quem procura curso de mecânica, e as conversões que o Google enxergou vieram desses termos, então o lance automático aprendeu a comprar mais deles | Diretor |
| 2026-09-04 | Abrir o Play Console, Android vitals, filtrar a 1.7 e tirar o stack trace | A nossa instrumentação não alcança este defeito: a migalha só fala na abertura seguinte, e quem fecha e desiste nunca volta para contar | QA |
| 2026-09-05 | Criar o OneLink na AppsFlyer | Os botões de baixar apontam para a ficha crua da loja, então o clique do anúncio morre no navegador e tudo chega como orgânico | Analista |
| 2026-09-07 | Trocar a conversão do Google Ads de "tocou em baixar" para "criou conta" | As nove contas da semana nasceram na web e a App Store teve zero downloads: o lance automático está sendo treinado por um sinal que não é o desfecho do negócio, e que parou em 04/09 | Esta rodada |
| 2026-09-07 | No Search Console, tocar na linha "Erro de redirecionamento" (ou EXPORTAR) e passar a lista de URLs | É o único dado que não dá para deduzir do código: todas as formas de URL que existem no repositório respondem certo, então o erro está em URL que só o Google viu | Esta rodada |
| 2026-09-10 | Instagram, o que falta (diagnóstico de 12/09 às 17h37): no painel do app 1226586899623385, (1) adicionar o produto **Messenger** e, nele, "Instagram settings": ligar a API de mensagens do Instagram e, em Webhooks, assinar `comments` e `messages` na URL `https://n8n.vocaboost.com.br/webhook/instagram-comentarios` com o token `mq-ig-7f3a9c2e51`; (2) gerar de novo o token da Página com as permissões `instagram_manage_messages`, `instagram_manage_comments`, `pages_messaging`, `pages_manage_metadata` e colar na credencial "Bearer Auth account" do n8n; (3) comentar de novo num post e conferir a execução | A resposta privada foi tentada com o token atual e a Meta recusou com "(#3) Application does not have the capability to make this API call": o app não tem o produto de mensagens. E nenhum dos 5 comentários de hoje chegou ao webhook: o campo `comments` não está assinado. Token, Página e Instagram estão certos (conferido pelo Graph) | Engenharia |
| 2026-09-08 | Ligar o Web Analytics do projeto `mentorque` no painel da Vercel (Analytics → Enable) | O componente já está no site e fica mudo até a chave virar; sem ela "qual guia recebe visita" continua sem resposta, e é o número que o papel de SEO tem que acompanhar | Esta rodada |
| 2026-09-08 | No n8n, abrir "Analista: metricas externas" → nó "Search Console: top páginas" → Credential → escolher "Google account" e salvar | O nó foi criado com a coleta por página, mas a ferramenta de agente não consegue atribuir credencial do Google; até o clique, `topPaginas` chega vazio com `erroPaginas` explicando, sem derrubar o resto da coleta | Esta rodada |
| 2026-09-12 | Abrir o resumo da jornada e as 7 cópias que chegaram em `contato@` às 14h33 de 12/09 e ler cada e-mail no celular; se algum texto estiver errado, `JORNADA_PAUSADA=sim` na Vercel e avisar. Roteiro em `docs/jornada.md` | A primeira rodada já saiu (18 e-mails) por ordem do dono, e a cópia de prova chegou junto, não antes. É a única leitura humana dos textos antes de o cron das 9h sair de novo | Engenharia |
| 2026-09-12 | Ligar os avisos no app do iPhone (Perfil) para gravar um token de push | As quatro chaves de push já estão na Vercel (visto em 12/09); o que falta para o push no iPhone ter sinal é um aparelho com token. Hoje só há 2 tokens, os dois Android | Engenharia |
| 2026-09-07 | Rotacionar as chaves que estão em texto puro nos fluxos do n8n do Vocaboost (Anthropic, OpenAI, `service_role` do Supabase, token do bot) | As duas primeiras têm cobrança ligada e a terceira passa por cima do RLS; elas saem em qualquer exportação ou cópia do workflow | Esta rodada |
| 2026-09-14 | No Google Ads, trocar a URL final do anúncio de `/app` para a home (`https://www.mentorque.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=lancamento`) | Nos últimos 7 dias, 138 dos 144 onboardings da web vêm de `google / cpc` e caem direto no `/app`, onde só 7 viraram conta (5%). O site não linka o `/app` desde 12/09, então o anúncio é o único caminho possível. A decisão de apontar para a home está escrita em `docs/utms.md` desde 03/09 e nunca foi aplicada no console | Engenharia |
