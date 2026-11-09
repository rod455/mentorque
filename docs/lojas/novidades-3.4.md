# Novidades da versão 3.4

Aberta em 27/10/2026, quando a 3.3 (build 74) chegou às duas lojas. Tudo o que
entra aqui **já roda na web** pelo deploy da Vercel; o binário só importa para
o app das lojas.

**Onde a 3.4 está:** ainda não gerada.

**Árvore do build:** (escrever o commit NA HORA de apertar o botão do
Codemagic, antes de qualquer frase sobre o que o binário tem; a
`conferir:versoes` cobra que cada item citado abaixo seja ancestral dela.)

## O que vai NO BINÁRIO

1. **O sintoma "Perda de força" ganha o card da aula** (29/10, commit
   99889cc, rodada do Conteúdo). A aula `diag-perda-de-forca` já chega à 3.3
   pelo catálogo remoto; a ligação na tela do sintoma (`AULAS_DO_SINTOMA`) vai
   no binário. Se a tabela passar a viajar no catálogo remoto antes do build,
   este item sai daqui.

2. **O segundo pedido de conta, para o convidado que já tem algo a perder**
   (30/10, commit 7c52226, rodada do CRO, com o conserto de alcance da revisão
   do mesmo dia no commit seguinte). A folha "Salve sua garagem" é código do
   binário (`components/app/SalveSuaGaragem.tsx` e
   `lib/app/segundoPedidoDeConta.ts`); na web já roda. Sem a 3.4, quem usa o
   app das lojas nunca recebe o repique, e a aposta
   `a-conta-e-pedida-de-novo-a-quem-ja-tem-algo-a-perder` só lê depois que a
   3.4 passar de metade dos aparelhos ativos.

3. **O Biela grátis com 1 pergunta por mês, nos textos do app** (05/11,
   decisão do dono). O limite em si é do servidor e vale para todas as
   versões desde o deploy; o que vai no binário são os dois textos com o
   número: a tabela de planos ("Perguntas ao Biela, 1/mês", que na 3.3 ainda
   diz "3/mês") e o singular "1 pergunta grátis restante neste mês" (na 3.3
   sai "1 perguntas grátis restantes").

4. **O sintoma "Motor falhando" ganha o card da aula** (04/11, commit f1cea63,
   rodada do Conteúdo). Mesmo caso do item 1: a aula `diag-motor-falhando`
   chega pelo catálogo remoto, e a ligação na tela do sintoma
   (`AULAS_DO_SINTOMA`, `engine-misfire`) vai no binário. Faltava nesta lista
   até a revisão de 08/11.

5. **A compra avulsa pelo Stripe, na parede da Biela** (09/11, commits
   3376307 e 7c8c721; o servidor em 5270f77, que não depende de build). Quando
   a pergunta grátis do mês acaba, a parede mostra 2 perguntas por R$ 1,90, 10
   por R$ 4,90 e o passe de 7 dias por R$ 9,90, com o Premium abaixo. O toque
   abre o checkout do Stripe na aba do sistema, e a volta reabre o app pelo
   `mentorque://compra`. **No iPhone a folha não aparece.** Decisão do dono
   em 08/11: no Android pelo Stripe, e não pela cobrança da Play.
   - **O risco, dito ao dono antes da decisão e aceito por ele:** a política
     de pagamentos da Play exige a cobrança do Google para conteúdo digital
     dentro do app. Vender pelo Stripe pode fazer a Play recusar a versão ou
     tirar o app do ar. O Brasil tem um programa de escolha de cobrança, que
     exige a Play ao lado e a inscrição no Play Console; não estamos nele.
   - **Desligada até o SQL rodar.** A folha só aparece quando o servidor diz
     que a compra está ligada, e o servidor só liga com a tabela
     `compras_avulsas` e a coluna `biela_perguntas.pago_com`
     (`supabase/compras_avulsas.sql`). Sem elas, a 3.4 mostra a parede de
     antes, só com o Premium, e nada quebra.

## Ficou FORA do binário, de propósito

- **A compra avulsa no iPhone e pela cobrança das lojas.** A Apple não aceita
  pagamento externo por conteúdo digital, e a Play pela cobrança do Google
  exigiria produtos no Play Console e no RevenueCat.
- **O passe no card da tela do sintoma,** que o caderno também previa. Nesta
  versão a folha aparece só na parede da Biela.
- Tudo o que foi feito no servidor nesta semana já está no ar para todas as
  versões, sem build: o limite de 1 pergunta grátis, o manual do carro no
  Biela, a contagem de quem bate no limite, e a frase "conforme o manual"
  proibida quando não há trecho.

## A nota das lojas

Pela regra da casa: o ganho, não o defeito; o verbo na ação da pessoa; nada
que não tenha sido conferido. Fora dela de propósito: a mudança de 3 para 1
pergunta grátis (não é ganho para a pessoa, e o texto da tabela de planos já
diz o número certo).

```
Agora o app volta a lembrar de salvar sua garagem quando você já tem serviço, abastecimento ou aula guardados, para nada se perder se trocar de celular.

Nos sintomas "Perda de força" e "Motor falhando", a aula que explica o problema está a um toque.

Acabou a pergunta grátis do mês? Agora dá para continuar conversando com o Biela sem assinar: pacotes de perguntas ou um passe de 7 dias.
```

A terceira frase só entra se o SQL da compra avulsa tiver rodado antes do
envio; sem ele, a folha não aparece e a frase prometeria o que o app não
mostra.

## Plugin nativo nesta versão

Nenhum plugin novo. De `android/`, `ios/` e `capacitor.config.ts`, desde a
árvore da 3.3 (e39b866), mudaram só os números de versão (3.4 e o piso 75).

A compra avulsa usa dois caminhos nativos que JÁ estão no binário desde o
login social: o `Browser.open`/`Browser.close` (`@capacitor/browser`, por
`openExternal` e `closeExternal` em `lib/app/wrapper.ts`) e o `appUrlOpen` do
`@capacitor/app` com o esquema `mentorque` do `AndroidManifest.xml`. O que é
novo é a URL: `mentorque://compra`. O ouvinte do login (`lib/app/auth.tsx`)
ignora tudo que não começa com `mentorque://auth-callback`, então as duas
voltas não se pisam.

## Roteiro de aparelho, escrito ANTES do build

**Itens 1 e 4, os cards de aula.** No app atualizado, abrir o Biela, escolher
os sintomas "Perda de força" e "Motor falhando": cada um mostra o card da aula
na tela do sintoma, e tocar abre o leitor na aula certa
(`diag-perda-de-forca` e `diag-motor-falhando`).

**Item 3, os textos do Biela.** Num aparelho sem Premium e sem pergunta feita
no mês: o Biela mostra "1 pergunta grátis restante neste mês", no singular, e
a tabela de planos diz "1/mês".

**Item 2, o segundo pedido.** Num aparelho que já tinha o app como convidado,
com carro e pelo menos um serviço registrado, e que nunca criou conta:

1. Atualizar para a 3.4 e abrir. A folha "Salve sua garagem" aparece sozinha
   na abertura, sem cadastrar carro. Se não aparecer, anotar se o aparelho
   tem serviço, abastecimento ou aula concluída; sem nenhum dos três, não
   aparecer é o certo.
2. Tocar em "Agora não". Fechar o app de verdade e abrir de novo: a folha NÃO
   volta, nem nesta abertura nem nas seguintes.
3. Num aparelho com conta: abrir o app e conferir que a folha não pisca na
   abertura, nem por um instante.
4. No banco, depois: `convite_conta` com `extra.detalhe = 'repique'` e o
   `recusou_convite_conta` com `botao-2` do mesmo aparelho.

**Item 5, a compra avulsa (só Android, e só com o SQL rodado).** Num Android
sem Premium, com a pergunta grátis do mês já gasta:

1. Abrir a Biela e perguntar. A parede mostra "Ou pague só pelo que precisar,
   sem assinatura" com 2 perguntas (R$ 1,90), 10 perguntas (R$ 4,90) e o
   passe de 7 dias (R$ 9,90), e o Premium abaixo. Se só aparecer o Premium,
   o SQL não rodou ou o deploy não leu a tabela.
2. Tocar em "2 perguntas". O Stripe abre numa aba do sistema (barra do
   Chrome em cima), NÃO dentro do app.
3. Pagar com cartão de verdade, o menor valor. Na página "Pagamento
   recebido", o app reabre sozinho ou pelo botão "Voltar para o Mentorque".
   A aba fecha, aparece "Pronto, compra confirmada" e o campo volta com "2
   perguntas restantes".
4. Fazer a pergunta: responde, e o saldo cai para 1.
5. Repetir o passo 2 e fechar a aba no meio, sem pagar. Voltar ao app: a
   parede continua, nada foi cobrado.
6. Repetir, pagar e fechar a aba SEM tocar em voltar. Trocar para o app:
   ele confirma sozinho ao voltar para a frente.
7. No iPhone: gastar a grátis e conferir que a parede mostra só o Premium.
8. No banco, depois: `compras_avulsas` com as duas compras, `plataforma =
   android`, e uma linha só por sessão; `comprou_avulsa` no funil; as
   perguntas pagas com `pago_com = 'credito'`; e nenhuma linha nova em
   `subscriptions`.
