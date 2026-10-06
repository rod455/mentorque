# A fila entre papéis

O que um papel deixa com outro. Uma linha por pedido, com a data em que ENTROU.
Ao concluir, apague a linha e escreva o desfecho no `DIARIO.md`. A regra inteira
está em `DIRETRIZES.md` ("A fila entre papéis").

`npm run entre` ordena por idade e agrupa por quem recebe. `npm run conferir:entre`
confere o formato: data que o calendário tem, papéis que a tabela do time tem.
Pedido para o dono não entra aqui: vai para `acoes-do-dono.md`.

Papéis válidos (apelidos da tabela em DIRETRIZES, mais Engenharia): Diretor,
QA, CRO, Conteúdo, Mídia, ASO, Guardião, Segurança, Sentinela, Analista,
Engenharia.

| Desde | De | Para | Pedido | Por que |
| --- | --- | --- | --- | --- |
| 2026-10-05 | Diretor | CRO | Na rodada de sexta (10/10): o portão do aviso passa a gravar a RECUSA com o motivo. Hoje `convite_aviso` e `aceitou_convite_aviso` dizem o que, nunca o porquê | 41 de 237 visitantes viram o convite na semana (17%), contra 19% na anterior; com 41 exibições por semana nenhuma aposta partida em dois braços chega a critério de parada, então o próximo passo é saber por que quem recusa recusa |
| 2026-10-05 | Diretor | Mídia | Na rodada de quinta (09/10): uma tela só, a lista de OneLink no console da AppsFlyer, e a resposta decide se o conserto é uma linha em `lib/stores.ts` ou um clique do dono mais a linha | Em 04 e 05/10, 10 de 12 `clicou_baixar` chegaram com etiqueta e 0 de 10 `cadastro` chegaram com ela: a etiqueta voltou na web e morre na instalação. O console não é alcançável por API (03/10), então começa por leitura de tela, não por clique do dono |
