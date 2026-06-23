import { loadStripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const isStripeClientConfigured = Boolean(publishableKey);

export function getStripeBrowserClient() {
  if (!publishableKey) {
    throw new Error("支付服务暂时不可用，请稍后再试。");
  }

  return loadStripe(publishableKey);
}
