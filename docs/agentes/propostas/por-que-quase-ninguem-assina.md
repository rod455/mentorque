# Por que quase ninguém assina

Pedido do dono em 17/10/2026: "só temos 1 assinante. Precisamos revisar tudo
para entender como melhorar essa taxa. Talvez o que é oferecido não vale".
Escrito pela Engenharia. Cada número diz de onde veio e quando foi lido.

## O funil inteiro, de uma vez

Janela de 15/09 a 17/10, `funil_canonico('2026-09-15')`, por aparelho, lido em
17/10 às 10h UTC.

| degrau | aparelhos | de onde |
|---|---|---|
| começaram o onboarding | 1.376 | `comecou_onboarding` |
| terminaram o onboarding | 1.040 (1.001 Android, 15 iPhone, 24 web) | `terminou_onboarding` |
| cadastraram carro | 612 | `cadastrou_carro` |
| criaram conta | 286 pelo evento, 308 pelo `auth.users` | `cadastro` e `contas_criadas_desde` |
| viram o paywall | 174 (100 sem conta, 74 com conta) | `viu_paywall` |
| tocaram em assinar | 16 | `iniciou_checkout` ou `tentou_assinar` |
| compraram | 1 | pedido do Play, abaixo |

E a volta, que decide se existe chance de vender assinatura: dos 879
aparelhos que começaram o onboarding de 15/09 a 08/10, **139 tiveram qualquer
evento 24 horas depois do primeiro (16%) e 55 depois de 7 dias (6%)**.
É PISO: a régua é o `anon_id`, e evento de uso que só carrega conta escapa.
Não conferi contra a retenção da AppsFlyer nem a do Play Console, que medem a
mesma coisa por outro caminho.

O único cliente que paga é a compra do Play de 25/09. Os três assinantes do
Stripe de agosto e setembro entraram com cupom de 100%, saíram em 02/10 e a
única cobrança cheia foi estornada (tabela "LEIA ISTO" do DIARIO). Receita
realizada até hoje: R$ 20,99 bruto.

## O que já está provado: a loja não entrega o que a tela promete

**1. Não existe teste grátis no Android.** Lido pela API do Play
(`monetization.subscriptions`), com a conta de serviço que o coletor já usa,
em 17/10 às 10h55 UTC: a assinatura `annual100` tem os planos `monthly`
(R$ 29,99) e `annual` (R$ 239,99) ativos e três ofertas, `exit10`, `exit25` e
`save30`. **Nenhuma oferta de teste grátis.** Segundo instrumento, o
RevenueCat (API v2, mesma hora): `trial_duration` nulo nos dois produtos e 0
testes ativos.

A nossa tela, nos mesmos aparelhos, diz "Começar 7 dias grátis" e, na letra
miúda, "Após o período grátis, R$ 239,99 cobrado anual"
(`components/app/screens/Subscribe.tsx`, `trialDaysFor` dá 7 no Android). A
pessoa toca esperando sete dias de graça e a folha do Google cobra na hora.

**2. O botão principal compra a oferta errada.** O pedido da única venda,
GPA.3319-9481-4117-99885, lido pela API de pedidos do Play em 17/10: plano
`monthly`, **oferta `save30`, fase introdutória, R$ 20,99**. A `save30` é a
oferta de RETENÇÃO, feita para quem vai cancelar. A pessoa não era
assinante; ela tocou no botão principal do plano mensal (`iniciou_checkout`
`loja-monthly` às 00h59 de 25/09, pedido às 01h00).

A causa está documentada pelo RevenueCat: o `purchasePackage` compra a
`defaultOption`, que é a opção com o teste grátis mais longo ou, sem teste, a
de primeira fase mais barata, ignorando só as ofertas marcadas com a etiqueta
`rc-ignore-offer`. Oferta com elegibilidade "determinada pelo desenvolvedor"
entra na escolha. O comentário em `lib/app/purchases.ts` dizia que o
`purchasePackage` "nunca seleciona sozinho" essas ofertas; estava errado e foi
corrigido junto com este texto.

No anual, a mesma regra escolheria a `exit25` (R$ 179,99 no primeiro ano), a
de primeira fase mais barata. **Isso é inferência**: nenhum pedido anual
existe para provar.

O que isso NÃO prova: que a folha do Google é onde as 15 pessoas desistiram.
A folha não grava desistência (`app_erros` não tem nenhuma linha de compra
cancelada) e a API do Play só mostra pedidos concluídos. É a explicação mais
forte para 16 toques virarem 1 compra, e ela tem conserto barato, mas o
número de quem abriu a folha e voltou não existe hoje.

**3. Duas linhas do comparativo não batem com o app.** "Diagnóstico ilimitado
com o Biela" aparece com cadeado na coluna grátis, e o grátis tem 5 perguntas
por mês. "Plano de revisão do seu carro" aparece com cadeado, e o grátis tem
o plano; o Premium tem a versão feita por IA. Prometer menos do que se
entrega no grátis não perde venda direto, mas ensina a pessoa a desconfiar da
tabela.

## O que é hipótese: o valor do Premium

O dono perguntou se o que é oferecido vale. O dado responde uma parte:

- **O que as pessoas usam é quase todo grátis.** Desde 15/09, por aparelho:
  aula vista 201, sintoma consultado 172, pergunta ao Biela 69, serviço
  registrado 35, abastecimento 15, orçamento analisado 5 (funil, 17/10).
- **Quase ninguém bate num limite.** Pela `origem` do `viu_paywall` desde
  15/09: o limite do Biela levou 8 pessoas ao paywall, o da garagem 4, o do
  histórico 2, o do orçamento nenhuma. O grosso das entradas é vitrine:
  saúde por sistema 30, revisões 27, Início 22.
- **A pessoa fica pouco tempo.** Com 16% voltando depois do primeiro dia,
  a maioria não chega a precisar do que o Premium destrava, que é
  acompanhamento ao longo do tempo (saúde, plano de revisão, histórico).
- **As promessas do topo são genéricas.** "Diagnóstico rápido e soluções na
  hora" e "Informações detalhadas sobre o seu carro". O que os usuários
  elogiam nas avaliações é economizar na oficina e controlar gastos.

Leitura honesta: o Premium vende continuidade para um público que, na média,
usa o app uma vez. Isso é hipótese com dado a favor, não conclusão: com 16
toques em um mês, nenhum teste de texto ou de preço lê em menos de meses.

## O que fazer, em ordem

**A. Hoje, sem build, no Play Console (decisão do dono, porque é cobrança):**

1. Criar uma oferta de teste grátis de 7 dias nos dois planos (`monthly` e
   `annual`), com elegibilidade "aquisição de novo cliente". Assim a folha do
   Google passa a dizer o que a nossa tela já diz, em todas as versões
   instaladas, inclusive a 3.1. A web já dá 7 dias pelo Stripe.
2. Pôr a etiqueta `rc-ignore-offer` nas três ofertas (`exit10`, `exit25`,
   `save30`). Elas continuam compráveis pelo caminho explícito que o app usa
   para a oferta de saída e para a retenção; só deixam de ser escolhidas
   sozinhas pelo botão principal. **A confirmar no primeiro teste depois da
   mudança**: que a oferta de saída ainda aparece.

Se o dono preferir não dar teste no Android, o passo 1 vira o contrário: a
tela deixa de prometer teste no Android, e isso só chega com build.

**B. Na 3.2, no código (Engenharia):**

1. No Android, o botão principal compra a opção explícita (teste grátis se
   existir, senão o plano cheio) com `purchaseSubscriptionOption`, em vez de
   depender da escolha automática. Assim o preço cobrado nunca depende de
   etiqueta no console.
2. Gravar o desfecho da folha da loja (comprou, desistiu, erro), para a
   próxima rodada medir onde as pessoas param. Evento novo mexe no CHECK do
   banco: precisa do ok do dono.
3. Corrigir as duas linhas do comparativo.

**C. Depois de A e B estarem no ar (CRO, com o dono):** revisar o que o
Premium promete, a partir do que as pessoas usam e do que elogiam. E o
pedido de conta a quem volta (achado de 17/10 no retorno ao CRO: 43 dos 200
convidados sem conta voltaram e ninguém pediu de novo). Preço só depois: com
uma compra por mês, mudar preço agora é mexer no escuro.

## O que este diagnóstico não alcança

- O iPhone (15 aparelhos no período): não li as ofertas da App Store. A tela
  promete 3 dias no iPhone.
- Quantas pessoas abriram a folha do Google e desistiram: não existe
  instrumento.
- Retenção por outro instrumento (AppsFlyer, Play Console): não conferida.
