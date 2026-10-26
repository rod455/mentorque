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
4. **Carro antigo tem o ano dele** (21/10, commit 7973b66). O cadastro do
   carro oferecia só de 2026 a 2000; agora vai de 1960 até o ano que vem, e a
   lista anda com o calendário. Pedido de um motorista com carro de 1984, que
   cadastrou como 2000 por falta de opção.
5. **O km pedido na tela de saúde, e o quiz de saúde medido** (22/10, commit b1f3b27). Sem
   odômetro, a ressalva "km estimado pela idade" passa a ter um campo para
   informar o km ali mesmo. E três eventos novos: quem abre e quem termina o
   quiz de saúde, e quem informa o km pela saúde.
6. **O convite do aviso aparece onde a pessoa cai, e o onboarding fica com
   cinco páginas** (23/10, commit d22e5e8, rodada do CRO). Quem cadastra o
   carro como convidado e depois cria conta cai na tela do carro, e o convite
   para ligar os avisos esperava na garagem, por onde essa pessoa não passa.
   E o A/B `onboarding-curto` fechou a favor da versão de cinco páginas (mais
   contas criadas), que vira a única. A aposta do CRO
   (`convite-do-carro-aparece-onde-a-pessoa-cai`) só começa a contar quando a
   3.3 passar de metade dos aparelhos ativos.
7. **O cadastro por e-mail volta a entrar no app** (26/10, commit e8ec9e9).
   Dentro do app a página é `https://localhost`, e o link de confirmação pedia
   para voltar a `https://localhost/app`; o Supabase recusava e mandava a
   pessoa para o site. Desde 28/09, nenhuma das 32 contas por e-mail entrou no
   app. Na 3.3 o link volta pela ponte. O site já conserta as versões antigas
   desde o deploy de 26/10.
8. **O sintoma leva à aula, e a aula diz por onde abriu** (26/10, commit
   2ce344c). Card "Para entender de vez" em 12 dos 19 sintomas, e o
   `viu_aula` com a porta no `detalhe`.
9. **A volta ao paywall depois da conta é contada** (26/10, commit 0aff863).
   `viu_paywall` com origem `pos-conta`.
10. **A compra é retomada depois da conta** (26/10, decisão do dono). Quem
   toca em assinar sem conta, cria a conta e volta tem a folha da loja
   reaberta no plano que tocou, sem segundo toque. Conta que já assina não vê
   compra; depois de dez minutos não retoma nada.

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
4. **O cadastro por e-mail entra no app.** Com um e-mail que nunca teve conta:
   "Criar conta" por e-mail no app, abrir o e-mail de confirmação NO MESMO
   celular, tocar no link. Tem de abrir o app já logado. No banco, a conta tem
   de ter linha em `user_state`. É a prova que nenhuma conferência daqui dá.
5. **Do paywall, pela conta, direto para a compra.** Sem conta, tocar em
   "Começar 7 dias grátis" no plano MENSAL, entrar com o Google: a folha da
   Google tem de abrir sozinha no mensal. Desistir na folha deixa a pessoa no
   paywall. No banco: `viu_paywall` com origem `pos-conta` e
   `iniciou_checkout` com origem `loja-monthly`. Se a folha não abrir, o
   defeito é o caminho nativo do Google, que o navegador não roda. Repetir com
   uma conta que já assina: nenhuma folha.
6. **O sintoma abre a aula.** "Barulho ao frear", tocar no card da aula: no
   banco, `viu_aula` com `extra.detalhe = sintoma`.
