# Novidades da versão 3.1

Aberta em 05/10/2026, logo depois de a 3.0 ser aprovada nas duas lojas. Tudo o
que entra aqui **já roda na web** pelo deploy da Vercel; o binário só importa
para o app das lojas.

**Onde a 3.1 está:** ainda não gerada.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem. A 3.0 saiu sem
o item principal da nota porque esta linha não existia; a `conferir:versoes`
cobra que cada item citado abaixo seja ancestral dela.)

## O que vai NO BINÁRIO

### Vai no binário, e a pessoa sente

1. **O Início tem uma ação só, e a aba "Problemas" virou "Biela"** (04/10,
   commit 28f13e1). Ficou fora da 3.0 por ter entrado na `main` quase cinco
   horas depois da árvore do build 70. A pergunta "O que está acontecendo com
   o seu carro?" é a porta para todo mundo, com ou sem carro, com três
   atalhos (Barulho, Luz do painel, Cheiro) que abrem o chat já preenchido. O
   carro é o segundo bloco, "Registrar serviço" e "Aprender" são as
   secundárias, o Premium desceu para o fim da tela e a grade de ações
   rápidas saiu. Na barra de baixo, a aba "Problemas" passou a chamar "Biela"
   e abre o chat; os sintomas continuam inteiros, a um toque dentro do chat
   ("Ver sintomas comuns") e nos problemas comuns do Início. Apostas
   `inicio-pergunta-unica` e `aba-biela` do caderno.

## A nota das lojas

A quarta frase da nota da 3.0 ("O Biela ganhou a própria aba") descrevia este
item e foi publicada sem ele. A nota da 3.1 repete a promessa, agora com o
binário cumprindo:

```
O Biela ganhou a própria aba: descreva o barulho, a luz ou o cheiro e ele responde na hora.

O Início agora faz uma pergunta só, "o que está acontecendo com o seu carro?", com atalhos para barulho, luz do painel e cheiro. O seu carro, o custo da semana e as revisões continuam logo abaixo.
```

## Plugin nativo nesta versão

Nenhum plugin novo e nenhuma mudança em `capacitor.config.ts`, `ios/` ou
`android/` além do piso do versionCode (71) e do nome da versão.

## Roteiro de aparelho, escrito ANTES do build

Regra do dono de 09/09/2026: build sem roteiro não sai. Nenhuma suíte daqui
alcança a WebView do aparelho.

1. **O Início novo e a aba Biela.** Com carro cadastrado, o Início abre com a
   pergunta e os três atalhos; tocar em "Luz do painel" abre o chat com a
   frase já escrita. A barra de baixo mostra "Biela" no lugar de "Problemas",
   e dentro do chat "Ver sintomas comuns" abre a tela de sintomas de sempre.
   Nada pode estar cortado no herói num celular estreito. (É o passo 7 da
   3.0, que não se aplicava a ela.)
2. **O Premium no fim do Início.** Rolar até o fim: o card "Teste o Premium
   grátis" está depois dos problemas comuns, e abre o paywall.

## Antes de promover a produção

- `npm run conferir` inteiro, a bateria completa de navegador e o build local
  (regime de release);
- **escrever a árvore do build nesta ficha no momento do botão**, e conferir
  com `git merge-base --is-ancestor <commit do item> <árvore>` que cada item
  está nela: é o que faltou na 3.0;
- acrescentar `3.1` à lista `JA_PUBLICADAS` e a árvore em `ARVORE_DO_BUILD`
  em `scripts/verifica-versoes.mjs` **só depois** da aprovação;
- o `/api/app/latest` aponta para o que está em PRODUÇÃO.
