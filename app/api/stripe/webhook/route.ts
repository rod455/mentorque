import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertSubscription, cicloNoBanco } from "@/lib/subscriptionSync";
import { faturaDaVirada, fimDoCiclo, viradaDeCiclo } from "@/lib/ciclo";
import { eventoDeFunil } from "@/lib/funilServidor";

export const runtime = "nodejs";

// Stripe webhook — keeps the `subscriptions` table in sync with Stripe.
// Configure the endpoint in Stripe (Developers → Webhooks) pointing to
// /api/stripe/webhook and set STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !admin || !secret) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  // Funil: os eventos financeiros nascem no SERVIDOR, confirmados pelo
  // processador, nunca pelo app. O registro em si vive em lib/funilServidor.ts,
  // compartilhado com o /api/stripe/sync — as duas portas gravam o mesmo
  // `assinou` e o índice único do banco fica com um só.
  //
  // Antes, o insert daqui engolia QUALQUER erro (`.then(() => undefined)`).
  // Isso é o que faz uma etapa ficar em zero parecendo desinteresse de quem usa
  // o app, quando na verdade o banco recusou a linha. Agora duplicado sai em
  // silêncio, que é o esperado, e o resto vai para o log.
  const funil = (evento: string, userId?: string | null, extra?: Record<string, unknown>) =>
    eventoDeFunil(admin, evento, { userId, origem: "stripe", extra });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(admin, sub, session.client_reference_id);
          await funil("assinou", session.client_reference_id ?? sub.metadata?.user_id, { sub: sub.id });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // O CICLO QUE O BANCO AINDA GUARDA, lido ANTES do upsert.
        //
        // É isto que permite reconhecer a renovação, e a ordem não é detalhe:
        // depois do upsert o banco já tem o ciclo novo e a virada fica
        // invisível. Ver o bloco do `renovou` lá embaixo para o porquê.
        const cicloGravado =
          event.type === "customer.subscription.updated" ? await cicloNoBanco(admin, sub.id) : null;
        await upsertSubscription(admin, sub);
        const prev = (event.data as { previous_attributes?: { cancel_at_period_end?: boolean } }).previous_attributes;
        if (event.type === "customer.subscription.deleted") {
          await funil("expirou", sub.metadata?.user_id, { sub: sub.id });
          break;
        }
        // `renovou` e `cancelou` são perguntas INDEPENDENTES sobre o mesmo
        // evento, e não dois galhos de um `else`: a virada de ciclo e o
        // desligamento da renovação podem chegar na mesma entrega, e encadear
        // os dois faria o primeiro engolir o segundo, que é o churn.
        if (event.type === "customer.subscription.updated" && viradaDeCiclo(cicloGravado, sub)) {
          // RENOVOU, e este bloco nasceu de um buraco medido em 01/10/2026.
          //
          // Naquele dia caiu a PRIMEIRA cobrança real do produto. O ciclo do
          // cliente fcd41994 virou de 01/10 para 01/11 às 23:53:13, a
          // assinatura seguiu `active`, e `funil_eventos` não registrou nada:
          // o primeiro dinheiro de verdade do Mentorque não existe no funil.
          // A causa é esta rota, que nunca escreveu `renovou` em lugar nenhum
          // (só o gêmeo do RevenueCat escrevia, e a loja nunca vendeu). Como
          // `funilCorreto.ts` declara `renovou` mensurável desde 22/08, o
          // `renovacoes 0` do painel lia como "ninguém renovou" quando era
          // "ninguém mediu". É o zero estrutural de sempre, agora no dinheiro.
          //
          // POR QUE A VIRADA DO CICLO, E NÃO A FATURA. A fatura é quem sabe
          // quanto entrou, e seria a fonte certa. Mas o endpoint do Stripe
          // está cadastrado com QUATRO eventos (os três de subscription e o
          // checkout.session.completed), então um `case "invoice.paid"` aqui
          // nunca seria chamado: código novo esperando entrega que não vem.
          // A virada de ciclo chega na entrega que JÁ funciona, e a prova é
          // que foi ela que atualizou o banco em 01/10 às 23:53:13.
          //
          // E ela se protege de reentrega sozinha, sem índice: na segunda
          // entrega o banco já guarda o ciclo novo, então não há virada e não
          // há evento. Por isso o `cicloNoBanco` é lido antes do upsert.
          //
          // O VALOR ENTRA AQUI DESDE 02/10/2026, e a nota antiga deste bloco
          // dizia que ele não entraria. Ela dizia: "o que existe aqui é o
          // preço do plano, e preço não é caixa; quem responde quanto entrou é
          // a fatura, e para ela chegar o Rodrigo precisa acrescentar
          // `invoice.paid` à lista do endpoint".
          //
          // A primeira metade continua certa: preço de plano não é caixa, e um
          // cupom de 100% produz esta mesma virada com fatura de R$ 0,00. A
          // segunda metade era UMA saída, e não a única: a assinatura que
          // chega no evento carrega `latest_invoice`, e a fatura pode ser
          // BUSCADA agora, com a chave que esta casa já tem. Nada de painel,
          // nada de evento novo, a mesma entrega que já funciona mais uma
          // pergunta.
          //
          // `pagoCentavos` é dinheiro RECEBIDO. Zero é resposta legítima
          // (cortesia, cupom de 100%); ausente é "não deu para saber", e as
          // duas coisas não podem virar a mesma no caminho, senão receita some
          // com cara de cortesia. Por isso o campo só entra quando existe.
          const fatura = await faturaDaVirada(sub, (id) => stripe.invoices.retrieve(id));
          await funil("renovou", sub.metadata?.user_id, {
            sub: sub.id,
            ciclo: fimDoCiclo(sub),
            status: sub.status,
            ...(fatura
              ? { pagoCentavos: fatura.centavos, moeda: fatura.moeda, fatura: fatura.fatura }
              : { semValor: "fatura nao lida" }),
          });
        }
        if (event.type === "customer.subscription.updated" && prev?.cancel_at_period_end === false && sub.cancel_at_period_end) {
          // Desligou a renovação agora (o flip é o evento; o estado sozinho
          // repetiria "cancelou" a cada update qualquer da assinatura).
          await funil("cancelou", sub.metadata?.user_id, { sub: sub.id });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook]", err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
