"use client";

import { useEffect, useState } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { usePrototype } from "@/lib/app/store";
import { startCheckout } from "@/lib/app/billing";
import { getStripeJs } from "@/lib/app/stripeClient";
import { trialPlatform } from "@/lib/app/platform";
import { isLocalDev } from "@/lib/app/wrapper";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, LegalLinks, useContent } from "../ui";

// O pagamento: o checkout do Stripe embutido, logo depois do paywall.
//
// Fica separado do paywall porque é outra tela e outro estado. O paywall
// convence; aqui já está convencido e o que resta é não atrapalhar.

export function CheckoutScreen({ plan, offer }: { plan: "monthly" | "annual"; offer?: string }) {
  const c = useContent();
  const sub = c.subscribe;
  const { setPremium } = usePrototype();
  const { back } = useNav();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await startCheckout(plan, trialPlatform(), offer);
      if (cancelled) return;
      if (res.clientSecret) { setClientSecret(res.clientSecret); return; }
      // Stripe não configurado: em dev local cai no demo; em produção mostra erro.
      if ((res.error === "not_configured" || res.error === "no_price") && isLocalDev()) { setPremium(true); back(); return; }
      setErr(res.error === "unauthorized" ? sub.needLogin : sub.checkoutError);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  return (
    <div>
      <AppHeader title={sub.title} />
      {err ? (
        <Card className="text-center">
          <p className="text-sm text-coral">{err}</p>
          <Button variant="secondary" className="mt-3" onClick={back}>{c.common.cancel}</Button>
        </Card>
      ) : clientSecret ? (
        <div className="overflow-hidden rounded-2xl bg-white">
          <EmbeddedCheckoutProvider stripe={getStripeJs()} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-cream/55">{sub.working}</p>
      )}
      {/* Também no checkout da web: é uma tela de compra, e o pedido da Apple
          vale como bom hábito em qualquer lugar onde se cobra. */}
      <p className="mt-5 text-center text-xs text-cream/45"><LegalLinks /></p>
    </div>
  );
}