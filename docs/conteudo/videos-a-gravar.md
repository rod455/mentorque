# Vídeos a gravar

As sete aulas que prometiam vídeo e não tinham. Em 01/09/2026 elas viraram
artigo com explicação completa, então hoje nenhuma promete o que não entrega.
Este arquivo existe para o dia da gravação: ele diz o que gravar, em que
ordem, e como devolver o vídeo para a aula sem quebrar nada.

## Por que elas foram destrancadas primeiro

O catálogo tinha 50 aulas marcadas como `type: "video"` e só 43 com vídeo de
verdade. As sete restantes mostravam a arte de "vídeo ainda não publicado".
A tela degradava bem, então não era defeito de código, era promessa não
cumprida. E seis das sete eram as aulas DE MÃO, justamente as que a pessoa
abre em pé do lado do carro, quando ela mais precisa de resposta.

Agora cada uma é um artigo que se sustenta sozinho: explica quando fazer,
como saber que passou da hora, o que custa adiar, e quando vale levar na
oficina em vez de fazer. O passo a passo por nível (iniciante, avançado,
mecânico) continua intacto embaixo do texto. O vídeo, quando vier, entra como
reforço, não como a única entrega.

## A ordem, e o porquê de cada posição

| # | Aula | Sistema | Por que nesta posição |
|---|---|---|---|
| 1 | **Trocar as palhetas do limpador** (`diy-wipers`) | elétrica | É o vídeo mais fácil de gravar de todos: dura minutos, não precisa levantar o carro, não precisa de oficina, e o resultado aparece na imagem. Bom primeiro vídeo para acertar enquadramento e ritmo com risco zero. |
| 2 | **Trocar o filtro de ar** (`diy-airfilter`) | motor | Segundo mais fácil, e resolve uma confusão real: quase todo mundo troca filtro de ar do motor achando que é o de cabine, ou o contrário. Mostrar os dois lugares no mesmo vídeo vale mais que o passo a passo. |
| 3 | **Trocar a bateria** (`diy-battery`) | elétrica | A ordem dos polos (negativo sai primeiro, entra por último) é a coisa que texto explica e imagem GRAVA na cabeça. É o melhor argumento de vídeo da lista. |
| 4 | **Como usar seu scanner OBD2** (`obd2-scan`) | motor | Casa com a porta de entrada do app, que é diagnóstico, e é o único da lista que mostra tela em vez de peça. Grava rápido e serve de isca para quem chegou pela luz do painel. |
| 5 | **Como trocar o óleo** (`oil-change`) | motor | O mais buscado da lista, e o mais trabalhoso de gravar: precisa de carro no cavalete, óleo escorrendo e tempo real de dreno. Vale a produção, mas não é o primeiro. |
| 6 | **Trocar a pastilha de freio** (`brake-pads`) | freios | Único premium da lista, e o de maior responsabilidade: erro em freio não perdoa. Só gravar com bancada boa, cavalete de verdade e sem pressa. |
| 7 | **Breve história do automóvel** (`cult-history`) | geral | O único que não é de mão. O artigo já é completo e se sustenta sozinho, então o vídeo aqui é bônus, não conserto. Deixe por último. |

Recomendação de sequência: gravar 1, 2 e 3 no mesmo dia, que são rápidos e
usam o mesmo cenário. O 4 é de tela e pode ser gravado em casa. O 5 e o 6
pedem um dia próprio, com o carro suspenso.

## Como devolver o vídeo para a aula

Duas linhas em `lib/app/conteudo/aulas.ts`, na aula correspondente:

1. Trocar `type: "article"` de volta para `type: "video"`.
2. Acrescentar o campo `media` com o id do YouTube:

```ts
media: { provider: "youtube", src: "ID_DO_VIDEO", vertical: true },
```

O `src` é só o id, o pedaço depois de `v=` no link do YouTube (por exemplo
`it8V3v7XEp8`). Use `vertical: true` em Short 9:16 e omita em vídeo
horizontal.

**Não apague o `body`.** O artigo continua aparecendo abaixo do player, e é
ele que responde a quem prefere ler a ver, ou está num lugar sem som. A tela
foi feita para os dois conviverem: o player em cima, o texto embaixo, o passo
a passo por nível depois.

**A conferência que protege isso:** `npm run conferir` reprova se uma aula
voltar a dizer `type: "video"` sem ter `media`. Foi essa contagem que achou
as sete.

## Se você gravar só uma

Grave a da bateria (`diy-battery`). É a única da lista em que a ordem certa
evita uma faísca de verdade embaixo do capô, e é a que mais ganha em ser
vista em vez de lida.
