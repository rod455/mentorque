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
| 2026-09-07 | Ao publicar a 1.9, acrescentar `"1.9"` à lista `JA_PUBLICADAS` em `scripts/verifica-versoes.mjs` | Foi esquecer isto na 1.8 que deixou a conferência calada e mandou um segundo build com o mesmo nome de versão, cegando o funil e a tabela de erros para a diferença entre os dois | Esta rodada |
| 2026-09-07 | Rotacionar as chaves que estão em texto puro nos fluxos do n8n do Vocaboost (Anthropic, OpenAI, `service_role` do Supabase, token do bot) | As duas primeiras têm cobrança ligada e a terceira passa por cima do RLS; elas saem em qualquer exportação ou cópia do workflow | Esta rodada |
