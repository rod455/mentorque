import { getBrowserSupabase } from "@/lib/supabaseBrowser";

type BillingResult = { url?: string; clientSecret?: string; error?: string };

// POST to a Stripe route with the current Supabase access token attached.
async function authedPost(path: string, body?: unknown): Promise<BillingResult> {
  const supabase = getBrowserSupabase();
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body ?? {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data?.error ?? "error" };
    return data as BillingResult;
  } catch {
    return { error: "network" };
  }
}

export const startCheckout = (plan: "monthly" | "annual", platform?: string, offer?: string) =>
  authedPost("/api/stripe/checkout", { plan, platform, offer });
export const openBillingPortal = () => authedPost("/api/stripe/portal");
export const cancelSubscription = () => authedPost("/api/stripe/cancel");
export const reactivateSubscription = () => authedPost("/api/stripe/reactivate");
export const deleteAccount = () => authedPost("/api/account/delete");
