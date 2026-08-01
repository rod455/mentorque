import { loadStripe, type Stripe } from "@stripe/stripe-js";

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
