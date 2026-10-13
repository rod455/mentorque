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
| 2026-10-05 | Diretor | CRO | Na rodada de sexta 16/10: o portão do aviso passa a gravar a RECUSA com o motivo. Hoje `convite_aviso` e `aceitou_convite_aviso` dizem o que, nunca o porquê | Terceira semana de queda, medida em 12/10: ligaram o aviso 24 de 209 visitantes (11,5%), depois 20 de 237 (8,4%), agora 17 de 306 (5,6%). A exibição acompanha o crescimento (18% dos visitantes, estável), então o que piorou é a aceitação, e ninguém sabe por quê porque recusa não deixa evento. DATA CORRIGIDA em 12/10: a linha dizia "sexta (10/10)" e sexta era 09/10, então o pedido apontava para um dia fora da cadência e a rodada de 09/10 passou sem abrir a fila. O erro é meu, do Diretor |
| 2026-10-05 | Diretor | Mídia | Na rodada de quinta 15/10: uma tela só, a lista de OneLink no console da AppsFlyer, e a resposta decide se o conserto é uma linha em `lib/stores.ts` ou um clique do dono mais a linha | A cegueira piorou: 187 de 193 cadastros de 28 dias sem origem (97%), contra 90% em 05/10. O console não é alcançável por API (03/10), então começa por leitura de tela, não por clique do dono. E a leitura tem que dizer que desde 04/10 os selos da home também gravam `clicou_baixar`, senão o denominador troca de composição dentro da janela. DATA CORRIGIDA em 12/10: a linha dizia "quinta (09/10)" e quinta era 08/10; a rodada de 08/10 passou sem abrir a fila, e metade da causa é essa |
| 2026-10-13 | Conteúdo | Engenharia | O tema `outro` é 27 das 69 perguntas que a pessoa ESCREVEU ao Biela em 30 dias, o maior balde de todos. Dizer o que cai nele: ou a lista de temas cresce para separar esse pedaço, ou o coletor reporta o que o classificador viu, para a escolha de conteúdo poder usar o ranking | Lido no retrato de 13/10 e na tabela `biela_perguntas`, que tem `tema` e `origem` desde 29/09 e NÃO guarda o texto da pergunta. Com 39% da demanda real caindo em "outro", o ranking de temas não serve para escolher pauta nem aula: motor aparece em segundo com 23, e não dá para saber se o primeiro lugar de verdade está escondido dentro do `outro`. Guardar o texto da pergunta é decisão do dono, porque é dado de cliente; separar o balde não é Re-endereçado em 13/10 de Analista para Engenharia: o classificador mora em `lib/biela/perguntaLida.ts`, no nosso código. Sem o texto da pergunta não há como saber o que cai em `outro`; guardar texto é dado de cliente e espera decisão do dono. |
