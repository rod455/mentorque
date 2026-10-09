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
| 2026-10-09 | Engenharia | CRO | Na rodada de sexta (16/10): a definição NOVA de ativação por coorte, com numerador e denominador escritos, para Engenharia aplicar na view `ativacao_coortes`. Sugestão a validar: "fez algo de valor além do carro em 7 dias" (abriu_trilha, registrou_servico, registrou_abastecimento, consultou_sintoma, perguntou_biela) | A view conta ação em ou depois do `cadastro`, e desde 12/09 o carro vem antes da conta no Android. Testado em 09/10: na coorte de 21/09, 45 de 51 têm o carro antes da conta; mover a janela um dia para trás dá 47 de 51 e 56 de 57 na de 28/09, teto por construção. A métrica perdeu o sentido, não a janela; quem define o sentido é o CRO |
| 2026-10-05 | Diretor | CRO | Na rodada de sexta (10/10): o portão do aviso passa a gravar a RECUSA com o motivo. Hoje `convite_aviso` e `aceitou_convite_aviso` dizem o que, nunca o porquê | 41 de 237 visitantes viram o convite na semana (17%), contra 19% na anterior; com 41 exibições por semana nenhuma aposta partida em dois braços chega a critério de parada, então o próximo passo é saber por que quem recusa recusa |
| 2026-10-05 | Diretor | Mídia | Na rodada de quinta (09/10): uma tela só, a lista de OneLink no console da AppsFlyer, e a resposta decide se o conserto é uma linha em `lib/stores.ts` ou um clique do dono mais a linha | Em 04 e 05/10, 10 de 12 `clicou_baixar` chegaram com etiqueta e 0 de 10 `cadastro` chegaram com ela: a etiqueta voltou na web e morre na instalação. O console não é alcançável por API (03/10), então começa por leitura de tela, não por clique do dono |
