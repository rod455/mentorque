# Ligar a venda no Android

Decisão do dono em 27/09/2026 ("mas então não consigo comprar pelo Android?
vamos corrigir"), fechando o item aberto desde 24/09.

**Não há conserto de código a fazer.** Este documento existe porque o trabalho
que falta é todo fora do repositório, e porque a forma mais provável de ele dar
errado é um identificador digitado diferente no painel da Play.

## O estado de hoje, conferido no fonte

O app já está pronto para vender no Android, e está há semanas. Conferido em
27/09, arquivo por arquivo:

| O quê | Onde | Estado |
|---|---|---|
| Biblioteca do RevenueCat no binário Android | `capacitor.config.ts` → `android.includePlugins` | **já entra** |
| Projeto Gradle do plugin | `android/capacitor.settings.gradle:20` | **já entra** |
| Caminho de compra comum às duas lojas | `lib/app/purchases.ts` → `initPurchases` | **pronto** |
| Compra de uma oferta do Google | `purchaseSubscriptionOption` | **pronto** |
| Troca de plano na retenção | `googleProductChangeInfo` | **pronto** |
| Decisão de mostrar ou não o botão | `lib/app/wrapper.ts` → `sellsInApp()` | **pronto** |

`sellsInApp()` é `!isNativeApp() || !!iapKey()`, e `iapKey()` no Android lê
`NEXT_PUBLIC_REVENUECAT_ANDROID_KEY`. **A ausência da chave é o interruptor.**
Com ela no build, o paywall, a faixa de upgrade e o botão do house ad voltam
sozinhos: nenhuma tela muda de código.

O plugin já viaja no binário da 2.8 que está na Play, inerte.

## O que falta, e por que nada disso sou eu que faço

Tudo o que resta está na lista de "nunca sem o dono" do `CLAUDE.md`: preço e
planos, cobrança, chaves e publicar nas lojas.

1. **Perfil de pagamentos na Google Play.** Sem ele a Play não deixa criar
   assinatura. Play Console → Configurar → Perfil de pagamentos.
2. **Criar a assinatura e os planos base** (preço: decisão sua).
3. **Criar as três ofertas** que o app procura pelo nome (abaixo).
4. **Ligar o RevenueCat na Play**, com uma conta de serviço do Google Cloud.
5. **Pegar a chave pública `goog_…`** e colocar no grupo de variáveis
   `Mentorque` do Codemagic.
6. **Gerar build e subir**, com o roteiro de aparelho do fim deste arquivo.

## Os identificadores EXATOS

**Esta é a parte que quebra.** Se um nome sair diferente, o RevenueCat devolve
uma lista vazia de pacotes, o paywall abre sem preço e sem botão, e isso é
**visualmente idêntico ao modo leitor**. Não dá erro, não gera relato: parece
que a chave não pegou.

### Pacotes (RevenueCat, no offering marcado como `current`)

| Pacote | O que o app procura | Onde |
|---|---|---|
| Mensal | `packageType === "MONTHLY"`, ou identificador `$rc_monthly` | `OnboardingFlow.tsx:100`, `Profile.tsx:183`, `Subscribe.tsx` |
| Anual | `packageType === "ANNUAL"`, ou identificador `$rc_annual` | idem |

Os dois são os tipos padrão do RevenueCat. Basta arrastar o plano base certo
para "Monthly" e "Annual" no offering.

### Ofertas do Google (dentro da assinatura, no Play Console)

O app procura **pelo id da oferta**, e aceita tanto `exit10` quanto
`planoBase:exit10` (`googleOffer` em `lib/app/purchases.ts:46`).

| Id da oferta | Em qual plano base | Para quê | Onde no código |
|---|---|---|---|
| `exit10` | **anual** | 10% OFF quando a pessoa sai do paywall | `Subscribe.tsx:327` |
| `exit25` | **anual** | 25% OFF em tela cheia, na segunda saída | `Subscribe.tsx:327` |
| `save30` | **mensal** | retenção: 30% OFF antes de cancelar | `Profile.tsx:184` |

**Elegibilidade das três: "determinada pelo desenvolvedor".** É por isso que o
app usa `purchaseSubscriptionOption` e não `purchasePackage`: o segundo nunca
seleciona uma oferta sozinho.

### Direito (entitlement)

**O nome não importa.** `hasActiveEntitlement` (`purchases.ts:105`) considera
Premium quem tiver QUALQUER direito ativo. Um direito só, ligado aos dois
planos base, resolve.

### O que NÃO existe no Android

Os produtos `mentorque_annual_10` e `mentorque_annual_25` são da **Apple**, que
não deixa aplicar desconto a quem nunca assinou. No Android o desconto é oferta
dentro da mesma assinatura, e o RevenueCat nem devolve aqueles pacotes.
`Subscribe.tsx:150` já trata os dois casos sem conflito.

## O passo a passo

### 1. Play Console

1. Monetizar → Produtos → **Assinaturas** → Criar assinatura.
2. Id do produto: qualquer um, **desde que seja o mesmo no RevenueCat**. O
   comentário do código usa `annual100` como exemplo.
3. Criar dois **planos base**: um mensal e um anual, renovação automática.
4. Preço: **sua decisão.** O da web hoje é `R$ 29,90` por mês
   (`app/api/email/lancamento/route.ts:58`). A Play cobra 15% nos primeiros
   US$ 1 milhão por ano, contra os 2,9% + R$ 0,39 do Stripe, então preço
   igual nas duas pontas significa margem menor aqui. Isso é escolha, não
   conta minha.
5. Criar as três ofertas com os ids **exatos** da tabela acima, elegibilidade
   "determinada pelo desenvolvedor".
6. Ativar tudo.

### 2. RevenueCat

1. Project → Apps → adicionar o app do Google Play com o pacote
   `mentorque.app`.
2. Subir o JSON da **conta de serviço** do Google Cloud com acesso à Play
   (é o que deixa o RevenueCat validar compra). Play Console → Configurar →
   Acesso à API.
3. Products → importar a assinatura criada.
4. Entitlements → ligar os dois planos base ao direito existente.
5. Offerings → no offering `current`, pôr o plano mensal em **Monthly** e o
   anual em **Annual**.
6. Project → API keys → copiar a chave pública do app da Play (`goog_…`).

### 3. Codemagic

Colocar `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` = `goog_…` no grupo de variáveis
**`Mentorque`** (Applications → Mentorque → Environment variables). É o mesmo
grupo que os dois workflows usam.

**Chave pública, não segredo**: ela viaja dentro do binário de qualquer jeito.
O que não pode vazar é o JSON da conta de serviço, e ele nunca sai do
RevenueCat.

### 4. Build

Workflow `android-play`. A chave é variável de **build**: trocar no painel não
muda nada em quem já tem o app instalado.

## Roteiro de aparelho, escrito ANTES do build

Regra do dono de 09/09/2026: build sem roteiro não sai, e conferência verde
prova o que a conferência olha, não o binário. **Nenhuma conferência desta casa
alcança o Play Billing**, porque elas rodam em node e em Chromium, e Chromium
não tem plugin do Capacitor.

Use a faixa de **teste interno** e uma conta de testador licenciado (Play
Console → Configurar → Teste de licença), que compra sem cobrar de verdade.

1. **O paywall mostra preço.** Abrir a tela de assinatura e conferir que os
   dois planos aparecem **com valor em reais**. Sem valor = a lista de pacotes
   veio vazia = identificador errado, e não a chave.
2. **Comprar o anual.** A folha da Play abre, a compra conclui, e o app volta
   com o Premium ligado.
3. **O Premium chega na CONTA, não no aparelho.** Sair, entrar em outro
   aparelho ou no site com o mesmo e-mail, e conferir que o Premium está lá. É
   o passo que prova que o `appUserID` foi amarrado ao id do Supabase. Um furo
   antigo aqui fazia a pessoa pagar e o Premium ficar num usuário anônimo do
   RevenueCat (já consertado em `initPurchases`, e é exatamente isto que se
   confere).
4. **A oferta de saída.** Abrir o paywall e SAIR pelo X: tem que aparecer o
   10% OFF com o preço com desconto. Sair de novo depois: o 25% em tela cheia.
5. **A retenção no cancelamento.** Com o mensal ativo, ir ao Perfil e começar a
   cancelar: tem que aparecer o `save30`. Aceitar e conferir que a troca de
   plano acontece sem cobrar uma assinatura nova por cima.
6. **Restaurar compra**, com o app reinstalado.

## Como vamos saber que funcionou, sem depender de ninguém contar

O sinal já existe e está sendo medido:

- Hoje, `iniciou_checkout` no Android é **zero, por construção**. No dia em que
  a venda ligar, ele deixa de ser zero. Se continuar zero com a chave no build,
  alguma das etapas acima não pegou.
- A anomalia `acao que costuma ser a ultima` mostra hoje
  **`viu_paywall` 20 de 45 no Android (44,4%), contra base de 17,5%**. É 2,5
  vezes a base da plataforma, e é gente batendo numa tela que oferece e não
  vende. Esse número tem que cair.

## O que este documento NÃO promete

Que a venda vai acontecer. Ele descreve como tirar a trava. Preço, margem
depois dos 15% da Play e se vale mais vender pelo app ou continuar mandando
para o site são decisões suas, e nenhuma delas está resolvida aqui.
