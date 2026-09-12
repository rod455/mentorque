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
| 2026-09-10 | Ligar o Instagram ao fluxo "comentário vira Direct" do n8n: Instagram profissional ligado a uma Página; permissões de comentários e mensagens no app da Meta; token da Página numa credencial Bearer do n8n chamada "Instagram Direct (token da Pagina)" e escolhida no nó "Responder no Direct"; webhook `comments` apontando para `https://n8n.vocaboost.com.br/webhook/instagram-comentarios` com o token de verificação `mq-ig-7f3a9c2e51`; aprovar os textos A e B na tabela `instagram_regras` e ligar `ativa` | O fluxo está pronto e publicado, com as duas regras desligadas: nada sai até o dono aprovar o texto. Para o público em geral receber, a Meta exige revisão do app nas permissões de mensagem; com contas que têm papel no app, funciona na hora e serve para o teste | Esta rodada |
| 2026-09-07 | Ao publicar a 2.5, acrescentar `"2.5"` à lista `JA_PUBLICADAS` em `scripts/verifica-versoes.mjs` | Foi esquecer isto na 1.8 que deixou a conferência calada e mandou um segundo build com o mesmo nome de versão, cegando o funil e a tabela de erros para a diferença entre os dois | Esta rodada |
| 2026-09-08 | Ligar o Web Analytics do projeto `mentorque` no painel da Vercel (Analytics → Enable) | O componente já está no site e fica mudo até a chave virar; sem ela "qual guia recebe visita" continua sem resposta, e é o número que o papel de SEO tem que acompanhar | Esta rodada |
| 2026-09-08 | No n8n, abrir "Analista: metricas externas" → nó "Search Console: top páginas" → Credential → escolher "Google account" e salvar | O nó foi criado com a coleta por página, mas a ferramenta de agente não consegue atribuir credencial do Google; até o clique, `topPaginas` chega vazio com `erroPaginas` explicando, sem derrubar o resto da coleta | Esta rodada |
| 2026-09-12 | Na manhã seguinte ao deploy, abrir o resumo da jornada e as cópias que chegam em `contato@` e ler cada e-mail no celular; se algum texto estiver errado, `JORNADA_PAUSADA=sim` na Vercel e avisar. Roteiro em `docs/jornada.md` | A jornada está ligada por ordem do dono e a cópia de prova chega junto com o primeiro envio, não antes. É a única leitura humana dos textos antes de o segundo dia sair | Engenharia |
| 2026-09-12 | Cadastrar `mentorque.com.br` no relay de e-mail da Apple (Certificates, Identifiers & Profiles, Services, Sign in with Apple for Email Communication) | Quatro contas entraram com "ocultar meu e-mail"; sem o domínio cadastrado, todo e-mail da jornada para elas volta | Engenharia |
| 2026-09-12 | Colocar as quatro chaves de push na Vercel (`FCM_CONTA_SERVICO`, `APNS_CHAVE_P8`, `APNS_KEY_ID`, `APNS_TEAM_ID`, ver `docs/push.md`) | O push da jornada está pronto e sai sozinho onde há token, mas sem as chaves a resposta do cron diz `push: { android: false, ios: false }` e ninguém recebe | Engenharia |
| 2026-09-07 | Rotacionar as chaves que estão em texto puro nos fluxos do n8n do Vocaboost (Anthropic, OpenAI, `service_role` do Supabase, token do bot) | As duas primeiras têm cobrança ligada e a terceira passa por cima do RLS; elas saem em qualquer exportação ou cópia do workflow | Esta rodada |
