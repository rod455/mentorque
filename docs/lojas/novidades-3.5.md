# Novidades da versão 3.5

Aberta em 15/11/2026, quando a 3.4 (versionCode 75 ou mais) foi publicada no
Android. No iPhone a 3.4 não foi confirmada (a API da App Store responde 403
por acordo vencido desde 14/11), então a próxima versão do iPhone pode ser
esta. Tudo o que entra aqui **já roda na web** pelo deploy da Vercel; o
binário só importa para o app das lojas.

**Onde a 3.5 está:** iPhone em revisão na Apple. Lido na API da App Store
Connect às 16h13 UTC de 15/11 (fluxo manual do n8n "Engenharia: builds da App
Store", que agora também lê a nota): o build **76**, versão de binário **3.5**,
chegou às 16h03 UTC (VALID), e a versão da loja criada às 16h04 UTC tem o nome
**3.4**, o build 76 ligado e o estado WAITING_FOR_REVIEW. A nota enviada é a
desta ficha, sem a frase dos pacotes, conferida palavra por palavra na API.
Android: nada gerado, e não precisa (a 3.4 da Play já tem o mesmo conteúdo).

**Os dois números do iPhone não batem, e isso tem consequência.** A loja vai
mostrar "Versão 3.4"; o app, por dentro, diz 3.5.0 (é o que chega ao funil e ao
RevenueCat como versão). Depois da aprovação: `BUILD_PUBLICADO["3.4"].ios`
passa a 76, o `/api/app/latest` do iPhone sobe para 76, e o "3.5" entra no
`JA_PUBLICADAS`, porque o binário 3.5 terá saído na Apple e o próximo envio do
iPhone precisa de número de binário maior. A próxima versão do repositório é a
3.6, nas duas lojas, e a versão criada no App Store Connect deve levar o mesmo
número do binário.

**O iPhone precisa dela antes do Android.** A 3.4 nunca chegou à Apple (o
último build lá é o 74, da 3.3, lido na API em 15/11 às 15h36 UTC), porque o
envio de 14/11 bateu num acordo vencido, já assinado. Até 15/11 às 15h40 UTC,
o binário da main é IGUAL ao da 3.4 (de 93bc0c7 para cá só mudaram os números
de versão, conferido no git), então um build do iPhone agora leva exatamente a
3.4, com o nome 3.5: os cards das aulas, o segundo pedido de conta e os textos
de 1 pergunta grátis. A compra avulsa não aparece no iPhone. Caminho: o
workflow "iOS → TestFlight" do Codemagic, depois "Enviar para revisão" no App
Store Connect.

**Árvore do build:** bc30de0, provável. Instrumento: o git e a hora de envio da
Apple. O binário diz 3.5, então a árvore é 38dc9ec (que abriu a 3.5, 10h58 UTC)
ou posterior; o build chegou à Apple às 16h03 UTC, e a `main` estava em
bc30de0 desde 15h50 UTC. Qualquer commit dessa faixa dá o MESMO binário: de
93bc0c7 (a árvore da 3.4) até bc30de0, o que entra no app (`lib/app`,
`components`, `app/app`, `android`, `ios`, dependências) só mudou nos números
de versão. O commit exato está na tela do Codemagic, que eu não vi.

## O que vai NO BINÁRIO

### Vai no binário, e a pessoa sente

(nada ainda)

## Ficou FORA do binário, de propósito

## O que muda para quem está na 3.3 do iPhone

O mesmo conteúdo dos itens da 3.4 (`novidades-3.4.md`), MENOS a compra avulsa,
que o código esconde no iPhone (`avulsaDisponivel`, cobrada pela
`conferir:avulsa`):

1. Card da aula no sintoma "Perda de força" (99889cc).
2. O segundo pedido para salvar a garagem, para quem já tem serviço,
   abastecimento ou aula guardados e disse "agora não" (7c52226).
3. Os textos da Biela com o limite certo: "1/mês" na tabela de planos e
   "1 pergunta grátis restante neste mês" (1303fc7). A 3.3 do iPhone diz
   "3/mês" enquanto o servidor libera 1.
4. Card da aula no sintoma "Motor falhando" (f1cea63).
5. Card da aula no sintoma "Fumaça no escapamento" (dd38f73).

O que o iPhone JÁ tem sem build, porque é servidor: o limite de 1 pergunta, o
manual do carro na Biela, a resposta sem travessão e a contagem de recusas.

## A nota das lojas

**Para a App Store (só o iPhone), SEM a frase dos pacotes**, que no iPhone
prometeria o que o app não mostra:

```
Agora o app volta a lembrar de salvar sua garagem quando você já tem serviço, abastecimento ou aula guardados, para nada se perder se trocar de celular.

Nos sintomas "Perda de força", "Motor falhando" e "Fumaça no escapamento", a aula que explica o problema está a um toque.
```

## Plugin nativo nesta versão

## Roteiro de aparelho, escrito ANTES do build

**iPhone (o build que leva a 3.4 com o nome 3.5).**
1. Abrir os sintomas "Perda de força", "Motor falhando" e "Fumaça no
   escapamento": cada um mostra o card da aula, e o toque abre a aula certa.
2. Sem Premium, perguntar à Biela: aparece "1 pergunta grátis restante neste
   mês" antes e, depois da resposta, a parede com SÓ o Premium, sem os
   pacotes. Se os pacotes aparecerem no iPhone, é defeito e o build não sobe.
3. Planos: a tabela diz "1/mês" para as perguntas ao Biela.
