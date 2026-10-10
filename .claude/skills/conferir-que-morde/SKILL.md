---
name: conferir-que-morde
description: Como escrever conferência que realmente pega o defeito, e como provar isso antes de confiar no verde. Use SEMPRE que for criar ou alterar qualquer script de `npm run conferir`, escrever teste, adicionar suíte de navegador, ou logo depois de consertar um defeito (todo conserto pede a conferência que o teria pego). Também quando uma conferência passar e você tiver qualquer dúvida se ela olhou alguma coisa. Nesta casa já houve conferência verde sobre defeito de pé mais de uma vez.
---

# Conferência que morde

Conferência verde é uma afirmação: "eu procurei o defeito e não achei". Ela só
vale se for verdade. Neste repositório, quatro conferências diferentes já
passaram verde com o defeito na frente delas, e cada uma passou por um motivo
diferente que valia a pena entender.

## A regra, e ela não tem exceção

**Plante o defeito que a conferência deveria pegar e veja ela gritar.**

Escreveu a conferência, ela passou? Isso não é notícia. Quebre o código de
propósito, rode de novo, confirme que reprova, e só então restaure. Leva um
minuto e é a diferença entre uma conferência e um enfeite.

Vale plantar mais de um formato do mesmo defeito. Ao consertar a espera pela
sessão no link de venda, plantei dois: tirar a espera, e esperar **depois** de
já ter decidido. A segunda é a que alguém faria sem querer numa refatoração.

## Os seis jeitos de passar verde sem conferir nada

### 1. A exceção que cega

O detector de corte lateral tinha uma exceção para roladores horizontais. Como
`overflow-y: auto` faz o `overflow-x` computar como `auto`, a exceção engoliu a
folha de avisos inteira. A suíte passava sem olhar nada.

Toda exceção numa conferência é um buraco. Escreva por que ela existe e o que
ela pode estar engolindo.

### 2. O comentário que satisfaz a busca

Conferência que procura código dentro de arquivo precisa **limpar os
comentários antes de procurar**. Aqui todo comentário explica o porquê citando
o código, então a explicação do conserto satisfaz a busca sozinha.

Aconteceu exatamente assim: tirei `rota: "quiz"` do código para ver a
conferência gritar, e ela aprovou, porque o comentário logo acima citava o mesmo
trecho. Ela estava conferindo a documentação do conserto.

```js
const semComentarios = (f) =>
  f.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
```

### 3. A conferência que olha o meio do caminho, não o fim

A suíte de venda confere que a compra pendente **sobrevive à recarga** do login
social. Ela nunca confere que o app **navega para o pagamento** depois.
Armazenamento intacto com fluxo quebrado passa igual por ela, e foi o que
aconteceu com o link mandado para 17 pessoas.

Pergunte sempre: **a conferência olha o resultado que o usuário sente, ou um
passo intermediário que é fácil de medir?** Passo intermediário verde é um
consolo, não uma garantia.

### 4. A conferência que confere consistência e não novidade

A `conferir:versoes` comparava os três números de versão **entre si**. Eles
concordavam: todos em 1.6, que já estava publicada. Ela aprovou, e a Apple
recusou o envio no fim de um build inteiro.

Concordância prova consistência, não correção. Pergunte o que mais precisa ser
verdade além de as partes combinarem entre si.


### 5. A conferência que afirma a regra e não afirma quem a usa

**O jeito mais comum de todos**, e o mais recente: em dois dias, cinco vezes.

| onde | o que ela afirmava | o que o plantio provou |
|---|---|---|
| `conferir:loja` | que a linha vizinha existia | trocar o argumento que decide o alarme passava verde |
| `conferir:saida` | "ou o log, ou a falha na resposta" | apagar o log passava verde |
| `conferir:cadastro` | que a variável `comCarro` existia | apagar a linha que exclui quem tem carro passava verde |
| `conferir:cadastro` | a regra pura e a rota de disparo | apagar a linha do cron que entrega a oferta passava verde |
| `conferir:midia` | que a frase pronta existia | o retrato não publicar a frase passava verde |

A regra pura é fácil de afirmar e é a metade que não quebra. O que quebra é o
consumidor: a rota que chama, o cron que roda todo dia, o retrato que imprime.
Conferência que só olha a regra mede um arquivo que ninguém usa.

**Então são DOIS plantios por conserto, sempre**: um na regra e um em QUEM
CHAMA a regra. Apague a linha que passa o valor, troque o argumento, desligue a
publicação. Verde ali é buraco.

E a asserção muda de forma junto. Procurar o nome é presença; procurar a chamada
com os argumentos que decidem é uso:

```js
/comCarro/                                 // presença: passa com a linha apagada
/const fora = new Set\(\[\s*\.\.\.comCarro,/  // uso: morde
```

É a irmã da regra da semana: **conserto na fonte que não muda o consumidor não
é conserto**, e conferência que não olha o consumidor não é conferência.


### 6. O plantio que não vale porque ela já estava vermelha

Não é jeito de a CONFERÊNCIA passar verde: é jeito de o PLANTIO mentir que ela
morde. Aconteceu em 03/10, três vezes no mesmo laço.

Eu plantei defeito num manual, o laço imprimiu MORDEU três vezes, e a
conferência estava reprovando ANTES de qualquer plantio, por uma asserção minha
com caixa errada (`/envelhece calada/` contra um texto em maiúsculas). Cada
plantio recebia a falha antiga como se fosse resposta ao defeito novo.

**O laço de plantio tem três passos, não um:**

```js
if (rodar() !== 0) throw new Error("ja estava vermelha: plantio nao vale nada");
// planta, roda, desfaz pela copia
if (rodar() !== 0) throw new Error("ficou vermelha depois: alguma copia nao voltou");
```

Verde ANTES prova que a falha veio do defeito. Verde DEPOIS prova que a cópia
voltou inteira. Sem os dois, "MORDEU" é só "estava vermelha", e é o tipo de
engano que faz confiar numa conferência que não olha nada.

**Para um plantio de uma troca de texto, use `npm run plantio`** (10/10/2026):
`npm run plantio -- conferir:X <arquivo> '<texto antigo>' '<texto novo>'`. Ele
escreve a cópia fora do repositório ANTES de mexer e para se não conseguir,
exige que o texto apareça uma vez só, roda a conferência sozinha lendo o
código de saída sem cano, e desfaz pela cópia conferindo byte a byte, inclusive
no Ctrl+C. Imprime MORDEU ou CEGA. Nasceu no dia em que um `|| git checkout`
rodou porque a cópia não existia.

## O limite que nenhuma conferência daqui atravessa

**Nada disso enxerga o lado nativo.** As suítes rodam num Chromium, e Chromium
não tem plugin do Capacitor. Um usuário relatou o app fechando ao responder o
quiz no Android e a suíte percorria o mesmo caminho, limpa.

Quando o defeito só aparece no aparelho, a testemunha não é a suíte: é a
migalha do último passo (`lib/app/ultimoPasso.ts`) virando linha em `app_erros`,
e o roteiro de teste manual no arquivo de notas da versão.

## Conferência de texto: quando serve e o que exigir dela

Buscar padrão no código-fonte é grosseiro, e às vezes é a única opção (ligação
que existe ou não existe, ordem de duas linhas, remendo em `node_modules`).
Quando usar, exija três coisas:

1. **limpe os comentários** antes de buscar;
2. **aponte para o elo que, quando faltou, deixou o defeito de pé**, e não para
   um detalhe de estilo;
3. **escreva no comentário por que é de texto e o que seria melhor**, para a
   dívida ficar visível em vez de virar hábito.

## Onde a conferência entra

`npm run conferir` roda a cada mudança, então cada script novo custa tempo de
todo mundo para sempre. Vale quando protege um defeito que já aconteceu ou que
falharia em silêncio. Não vale para reafirmar o que o compilador já garante.

Toda conferência nova entra na corrente do `conferir` no `package.json` e ganha
um `conferir:<nome>` próprio, para poder ser rodada sozinha enquanto se
trabalha nela.

O regime de duas velocidades (o que rodar para cada tamanho de mudança) está em
**`docs/mapa-do-codigo.md`**, junto com os casos em que esta disciplina salvou o
dia.
