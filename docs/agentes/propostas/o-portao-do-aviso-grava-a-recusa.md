# O portão do aviso: o que o dado já responde, e o evento que falta

Resposta do CRO ao pedido do Diretor que entrou na fila em 05/10/2026 (data
corrigida por ele em 12/10 para a rodada de 16/10). O pedido: "o portão do
aviso passa a gravar a RECUSA com o motivo; hoje `convite_aviso` e
`aceitou_convite_aviso` dizem o que, nunca o porquê".

Tudo abaixo foi lido no `funil_eventos` do banco do Mentorque em **16/10/2026
às 11h10 UTC**, por consulta própria, contando **aparelhos distintos**
(`anon_id`) e semana começando na segunda.

## Primeiro, a parte que NÃO precisava de evento novo

O pedido tratava o porquê como desconhecido. Metade dele já estava no dado, numa
dimensão que existe desde 13/09 e que ninguém tinha cortado: o `origem` do
`convite_aviso`, que diz em QUE MOMENTO o pedido apareceu.

Desde 21/09, por aparelho:

| onde o pedido aparece | convites | aceitaram | aceitação |
|---|---|---|---|
| depois de salvar o carro (`carro`) | 39 | 11 | 28 de cada 100 |
| no calendário (`calendario`) | 93 | 15 | 16 de cada 100 |
| no onboarding (`onboarding`) | 54 | 4 | 7 de cada 100 |
| depois do quiz (`quiz`) | 2 | 0 | sem leitura |

**O lugar do pedido explica quatro vezes de diferença.** Pedido logo depois de
a pessoa salvar o carro aceita 28 de cada 100; o mesmo pedido no onboarding, 7.
Isso é o princípio do timing do pedido (skill `besci.md`) medido na nossa
própria base, e é a primeira vez que esta casa tem o número.

E a composição mudou junto, semana a semana (convites por aparelho):

    semana    carro   calendario   onboarding
    21/09       10        21           10
    28/09        7        18           15
    05/10        9        27           14
    12/10       13        27           15   (semana aberta, piso)

O calendário virou a maior fonte de pedidos e é a de aceitação média; o
onboarding cresceu e é a pior. Ou seja: **a queda da aceitação total é, em boa
parte, mix, e não "as pessoas pioraram".** Ausência não é causa, e nem
"piorou" é causa.

### Uma divergência de leitura, declarada em vez de escondida

O Diretor leu em 12/10 "24 de 40, depois 20 de 41, agora 17 de 55" para quem
ligou o aviso. Minha consulta reproduz os denominadores dele quase exatos
(convites por EVENTO: 42, 41, 53), mas não os numeradores: por aparelho eu leio
11, 8 e 7 em `aceitou_convite_aviso`, e 13, 14 e 11 na união com
`permissao_aviso_concedida`. **Não identifiquei o corte que produz 24, 20 e 17**,
e fica dito em vez de escolhido: os dois instrumentos concordam na DIREÇÃO (a
aceitação cai nas cinco semanas) e discordam no NÍVEL. Quem precisar do nível
usa a consulta desta página, que está escrita acima.

### E o sistema quase nunca é o problema

`permissao_aviso_negada` tem **5 eventos na vida inteira** (desde 01/10). A
caixa do Android e do iPhone não é onde as pessoas somem: elas somem na NOSSA
folha, antes de a caixa do sistema aparecer. Isso estreita o lugar do conserto
de dois candidatos para um.

## O que o evento novo precisa ser

O que falta não é "o motivo" no sentido de a pessoa explicar: é o DESFECHO da
folha. Hoje, de 93 convites no calendário, 15 aceitaram e os outros 78 não
deixam rastro nenhum: não se sabe se tocaram "Agora não", se tocaram fora, se
fecharam o app ou se a folha nem foi vista até o fim.

Proposta, um evento só:

- **`recusou_convite_aviso`**, com `origem` igual à do `convite_aviso` que ele
  responde (`carro`, `calendario`, `onboarding`, `quiz`), e com o COMO da
  recusa em `extra`, num campo curto: `botao` (tocou no "Agora não"),
  `fora` (tocou fora da folha), `voltar` (botão de voltar do Android),
  `saiu` (trocou de tela ou fechou o app com a folha aberta).
- Com ele, `convite_aviso = aceitou + recusou + sumiu`, e o `sumiu` passa a ser
  um número pequeno em vez de 80% do degrau.
- A leitura que isso abre, e é a que decide: se o `fora` e o `saiu` dominarem, o
  problema é a folha aparecer em momento ruim (interrupção), e o conserto é
  mover o pedido. Se o `botao` dominar, a pessoa leu e disse não, e o conserto é
  o texto da promessa.

## Por que ele não entrou nesta rodada

A lista de eventos é guardada em DOIS lugares: a `EVENTOS_DO_APP` em
`app/api/funil/route.ts` (minha alçada) e a restrição `CHECK` da tabela
`funil_eventos` no banco (não é). Pela alçada em DIRETRIZES, alterar o banco
além de tabelas novas é "nunca sem o Rodrigo pedir explicitamente", e subir só
a metade do código faria o app mandar um evento que a rota recusa com 400,
calado. Então o pedido vai para a Engenharia, que mexe no banco com o dono, com
o comando exato pronto:

```sql
alter table public.funil_eventos drop constraint funil_eventos_evento_check;
alter table public.funil_eventos add constraint funil_eventos_evento_check
  check (evento = any (array[
    'abriu_app','cadastro','viu_paywall','iniciou_checkout','abriu_trilha',
    'cadastrou_carro','atribuicao','assinou','renovou','cancelou','expirou',
    'comecou_onboarding','terminou_onboarding','abriu_cadastro_de_carro',
    'convite_aviso','aceitou_convite_aviso','recusou_convite_aviso',
    'permissao_aviso_concedida','permissao_aviso_negada',
    'viu_aula','consultou_sintoma','registrou_servico','analisou_orcamento',
    'registrou_abastecimento','lancou_ganho','tentou_assinar','clicou_baixar',
    'clicou_consultoria','perguntou_biela','clicou_atalho','abriu_quiz'
  ]));
```

A lista acima é a atual do banco, lida em 16/10, mais `recusou_convite_aviso`.
Nada sai.

## O que fica decidido sem esperar o evento

A área do portão de aviso tem aposta ABERTA
(`convite-do-carro-nao-queima-com-convidado`, ler em 23/10), então ela está
congelada para mudança até o veredito, pela regra de 04/09. O que a leitura
acima entrega hoje é a candidata do próximo teste, já com número: **mover o
pedido do onboarding (7 de cada 100) para depois de uma primeira ação de valor,
que é onde o pedido do carro já prova render 28 de cada 100.** Isso fica
registrado aqui e no mapa vivo, não como mudança desta semana.
