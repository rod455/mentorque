import Stripe from "stripe";

// Server-side Stripe client. Returns null when STRIPE_SECRET_KEY isn't set so
// the app degrades gracefully (falls back to the local demo toggle).
let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  cached = key ? new Stripe(key) : null;
  return cached;
}

// Price IDs come from env so the same code works in test and live modes.
export const priceFor = (plan: "monthly" | "annual") =>
  plan === "monthly" ? process.env.STRIPE_PRICE_MONTHLY ?? "" : process.env.STRIPE_PRICE_ANNUAL ?? "";

export function planForPrice(priceId?: string | null): "monthly" | "annual" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return "annual";
  return null;
}
