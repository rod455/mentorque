# Novidades da versão 3.3

Aberta em 18/10/2026, quando a 3.2 (build 73) chegou às duas lojas. Tudo o que
entra aqui **já roda na web** pelo deploy da Vercel; o binário só importa para
o app das lojas.

**Onde a 3.3 está:** ainda não gerada.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem; a
`conferir:versoes` cobra que cada item citado abaixo seja ancestral dela.)

## O que vai NO BINÁRIO

### Vai no binário, e a pessoa sente

1. **O botão de compra do Android escolhe a opção** (18/10, commit 38c7d54).
   O teste grátis quando o Google o oferece, senão o plano cheio, nunca um
   desconto; e quem já assinou antes vê "Assinar o Premium", sem a promessa
   de dias grátis. Até a 3.3, quem segura a escolha certa é a etiqueta
   `rc-ignore-offer` no Play.
2. **Next 15** (18/10, commits 505435b e 4193e05). A camada do app inteiro
   sobe de versão; a pessoa não deve sentir nada. Junto, a lista de Carros
   deixa de ter botão dentro de botão (o lápis e o "Revisão vencida"
   continuam funcionando).

3. **De onde veio cada instalação** (20/10, commit a1a91f2). O app passa a escutar o retorno de conversão da AppsFlyer e a
   etiquetar o aparelho com a fonte (Google, Meta ou orgânico) e a campanha.
   A pessoa não sente nada; é o que faltava para separar a retenção por
   origem. Na 3.2 e antes, nenhum cadastro do app tem campanha.

## Plugin nativo nesta versão

Nenhum plugin novo. Muda o USO de um que já está no binário: o
`appsflyer-capacitor-plugin` passa a ter um ouvinte do `conversion_callback`.
Caminho lido no fonte antes de ligar, pela regra de 09/09: no Android,
`AppsFlyerPlugin.kt` (`initSDK` lê `registerConversionListener`, padrão
`true`; `getConversionListener` emite `onConversionDataSuccess` com `data`);
no iPhone, `AppsFlyerPlugin.swift` (`conversion` padrão `true`,
`onConversionDataSuccess` emite o mesmo). A emissão não é retida, por isso o
ouvinte entra antes do `initSDK`. As travas (`reject`) do `initSDK` são sobre
dev key nula e chamada repetida, que o app já não faz.

## Roteiro de aparelho, escrito ANTES do build

1. **A compra no Android.** Conta do Google que nunca assinou: "Começar 7 dias
   grátis" abre a folha do Google com 7 dias grátis. Conta que já assinou:
   o botão diz "Assinar o Premium" e a folha cobra o plano cheio, sem
   desconto.
2. **A atribuição da instalação.** Instalar a 3.3 por um anúncio (ou, sem
   anúncio, de forma orgânica), abrir, cadastrar um carro e criar conta. No
   banco, o `cadastro` desse aparelho tem de trazer `extra.utm.utm_medium =
   instalacao` e um `utm_source` (a fonte do anúncio ou `organico`).
3. **O Next 15 não quebrou a casca.** Abrir o app, entrar com o Google, abrir
   Carros (tocar na linha abre o carro; o lápis edita o apelido), abrir uma
   aula, abrir o Premium.
