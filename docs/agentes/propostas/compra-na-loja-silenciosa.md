# PROPOSTA, não aplicada: a compra pela loja pode terminar em silêncio

Achado da rodada de QA de 02/09/2026, na varredura do fluxo de compra pelas
lojas. Não apliquei porque o conserto encosta no caminho de cobrança, que está
fora da alçada dos agentes. O raciocínio e o patch estão aqui para a decisão
custar minutos.

## O que acontece hoje

`components/app/screens/Subscribe.tsx`, função `buyNative`:

```ts
const res = await p?.purchasePackage({ aPackage: pkg });
if (res && hasActiveEntitlement(res.customerInfo)) {
  setPremium(true);
  refreshSubscription();
  back();
}
} catch { /* cancelado/erro — permanece na tela */ }
```

São dois buracos no mesmo trecho:

1. **A compra dá certo e o direito ainda não chegou.** `purchasePackage`
   retorna, mas `hasActiveEntitlement` é falso (propagação do RevenueCat,
   relógio de rede ruim, direito com nome diferente do configurado). O `if`
   não entra, e então NADA acontece: sem `setPremium`, sem `back()`, sem uma
   linha de texto. A pessoa acabou de ser cobrada pela Apple ou pela Play e
   continua olhando o paywall, com o botão de assinar do mesmo jeito.

2. **O `catch` trata desistência e falha como a mesma coisa.** Quem fechou a
   folha da loja de propósito não quer aviso nenhum, e está certo. Quem bateu
   num erro real também não recebe nada, e aí o silêncio vira "não funcionou,
   vou tentar de novo".

## Por que isso importa mais do que parece

É o MESMO defeito que já custou caro na web, em 25/08: o cliente pagou às
23:52:23, o app não soube, ele voltou para o paywall e começou um segundo
checkout às 23:52:37. Quase pagou duas vezes.

Aquilo foi consertado com a tela `ConfirmandoPagamento`, que cobre o app
inteiro enquanto confirma e nunca diz "deu erro" quando o dinheiro pode ter
entrado. O conserto foi feito só do lado da web. O caminho da loja continua
como o da web era antes, com um agravante: aqui não existe um
`/api/stripe/sync` de segunda porta, e a rota que libera o Premium é o webhook
do RevenueCat.

Hoje ninguém comprou pela loja ainda (`funil_eventos` tem `assinou` só de
origem `stripe`), então o defeito é gratuito de consertar. Com a 1.6 nas duas
lojas e anúncio pago entrando, a primeira compra de loja vai acontecer sem
aviso.

## Patch sugerido

Reaproveitar o que já existe em vez de inventar tela nova. O estado
`checkoutVoltando` do `lib/app/store.tsx` já tem os três desfechos certos
(`confirmando`, `liberado`, `demorou`) e a tela `ConfirmandoPagamento` já sabe
desenhar os três, incluindo o texto que manda esperar e olhar o e-mail em vez
de mandar tentar de novo.

```ts
const buyNative = async () => {
  const pkg = plan === "monthly" ? iap?.monthly ?? iap?.annual : iap?.annual ?? iap?.monthly;
  if (!pkg || iapBusy) return;
  if (!user) { go({ name: "auth" }); return; }
  funil("iniciou_checkout", { origem: `loja-${plan}`, userId: user.id });
  setIapBusy(true);
  try {
    const p = await initPurchases(user.id);
    const res = await p?.purchasePackage({ aPackage: pkg });
    if (res && hasActiveEntitlement(res.customerInfo)) {
      setPremium(true);
      refreshSubscription();
      back();
      return;
    }
    // A loja voltou sem erro e sem direito ativo: a compra provavelmente
    // entrou e o direito ainda não propagou. Nunca dizer que falhou.
    abrirConfirmacaoDeCompra();          // seta checkoutVoltando = "confirmando"
  } catch (err) {
    if (!compraCancelada(err)) abrirConfirmacaoDeCompra();
  } finally {
    setIapBusy(false);
  }
};
```

Faltam duas peças pequenas:

- `abrirConfirmacaoDeCompra()`: expor no store o que hoje só o retorno do
  Stripe aciona. A confirmação já consulta o banco até a assinatura aparecer,
  com teto de tempo, que é exatamente o que se quer aqui enquanto o webhook do
  RevenueCat não gravou.
- `compraCancelada(err)`: o plugin do RevenueCat marca desistência com
  `userCancelled` (e a Apple usa o código 1 de `SKError`). Só a desistência
  sai calada; qualquer outro erro cai na confirmação.

## O que eu NÃO recomendo

Chamar `setPremium(true)` quando o direito não veio. Isso libera Premium sem
confirmação da loja, que é mudar comportamento de cobrança e vale para quem
cancelou também. A confirmação com teto de tempo resolve sem prometer nada.

## Como conferir depois

O teste de aparelho é o mesmo desenho da 1.6: comprar em ambiente de teste da
loja, e no meio do caminho cortar a rede antes do retorno. Hoje isso deixa a
pessoa no paywall; com o patch ela vê a confirmação e o desfecho.
