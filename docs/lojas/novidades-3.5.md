# Novidades da versão 3.5

Aberta em 15/11/2026, quando a 3.4 (versionCode 75 ou mais) foi publicada no
Android. No iPhone a 3.4 não foi confirmada (a API da App Store responde 403
por acordo vencido desde 14/11), então a próxima versão do iPhone pode ser
esta. Tudo o que entra aqui **já roda na web** pelo deploy da Vercel; o
binário só importa para o app das lojas.

**Onde a 3.5 está:** aberta, nada gerado.

**O iPhone precisa dela antes do Android.** A 3.4 nunca chegou à Apple (o
último build lá é o 74, da 3.3, lido na API em 15/11 às 15h36 UTC), porque o
envio de 14/11 bateu num acordo vencido, já assinado. Até 15/11 às 15h40 UTC,
o binário da main é IGUAL ao da 3.4 (de 93bc0c7 para cá só mudaram os números
de versão, conferido no git), então um build do iPhone agora leva exatamente a
3.4, com o nome 3.5: os cards das aulas, o segundo pedido de conta e os textos
de 1 pergunta grátis. A compra avulsa não aparece no iPhone. Caminho: o
workflow "iOS → TestFlight" do Codemagic, depois "Enviar para revisão" no App
Store Connect.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem.)

## O que vai NO BINÁRIO

### Vai no binário, e a pessoa sente

(nada ainda)

## Ficou FORA do binário, de propósito

## A nota das lojas

## Plugin nativo nesta versão

## Roteiro de aparelho, escrito ANTES do build
