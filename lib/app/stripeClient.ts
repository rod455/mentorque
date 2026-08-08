import type { Stripe } from "@stripe/stripe-js";
// `/pure` não injeta o script do Stripe no import — ele só é baixado quando
// o checkout embutido é aberto. No app da loja isso nunca acontece (iOS usa
// a compra da Apple), então nada de Stripe sai pela rede lá.
import { loadStripe } from "@stripe/stripe-js/pure";

// Loads Stripe.js once (client-side) using the publishable key. Returns a
// resolved-null promise when the key isn't set, so callers degrade gracefully.
let promise: Promise<Stripe | null> | null = null;

export function getStripeJs(): Promise<Stripe | null> {
  if (promise) return promise;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  promise = key ? loadStripe(key) : Promise.resolve(null);
  return promise;
}

export const stripeConfigured = () => Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
