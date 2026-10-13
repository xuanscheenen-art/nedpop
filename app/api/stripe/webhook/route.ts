import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { mergeUnlockedLevels, normalizeUnlockedLevels, type UnlockableLevel } from "@/lib/access-control";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isPaidPlanId, paidPlanConfig } from "@/lib/stripe/plans";

function parseMetadataUnlockedLevels(value: string | null | undefined): UnlockableLevel[] {
  return normalizeUnlockedLevels(value?.split(",").map((item) => item.trim()));
}

function stripeId(value: string | { id: string } | null): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id;
}

async function grantEntitlementForSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId || !planId || !isPaidPlanId(planId)) {
    return { ok: true as const };
  }

  const supabase = getSupabaseAdminClient();
  const planLevels = paidPlanConfig[planId].unlockedLevels;
  const metadataLevels = parseMetadataUnlockedLevels(session.metadata?.unlocked_levels);
  const nextLevels = metadataLevels.length ? metadataLevels : planLevels;
  const affiliateCode = session.custom_fields
    ?.find((field) => field.key === "affiliate_code")
    ?.text?.value
    ?.trim()
    .toUpperCase() || null;

  const { data: currentUser, error: readError } = await supabase
    .from("users")
    .select("unlocked_levels")
    .eq("id", userId)
    .maybeSingle();

  if (readError) {
    return { ok: false as const, message: "Could not read user entitlements." };
  }

  const unlockedLevels = mergeUnlockedLevels(
    normalizeUnlockedLevels(currentUser?.unlocked_levels),
    nextLevels,
  );

  const { error: writeError } = await supabase.from("users").upsert({
    id: userId,
    email: session.customer_details?.email ?? session.customer_email ?? null,
    stripe_customer_id: stripeId(session.customer),
    unlocked_levels: unlockedLevels,
    updated_at: new Date().toISOString(),
  });

  if (writeError) {
    return { ok: false as const, message: "Could not grant entitlement." };
  }

  const { error: purchaseError } = await supabase.from("user_purchases").upsert(
    {
      user_id: userId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: stripeId(session.payment_intent),
      stripe_customer_id: stripeId(session.customer),
      plan_id: planId,
      unlocked_levels: nextLevels,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      affiliate_code: affiliateCode,
    },
    { onConflict: "stripe_checkout_session_id" },
  );

  if (purchaseError) {
    return { ok: false as const, message: "Could not record purchase." };
  }

  if (affiliateCode && session.payment_status === "paid") {
    const { data: affiliate, error: affiliateError } = await supabase
      .from("affiliate_codes")
      .select("id, code, affiliate_name")
      .eq("code", affiliateCode)
      .eq("is_active", true)
      .maybeSingle();

    if (affiliateError) {
      return { ok: false as const, message: "Could not verify affiliate code." };
    }

    if (affiliate) {
      const { data: previousPurchase, error: previousError } = await supabase
        .from("user_purchases")
        .select("id")
        .eq("user_id", userId)
        .eq("payment_status", "paid")
        .neq("stripe_checkout_session_id", session.id)
        .limit(1)
        .maybeSingle();

      if (previousError) {
        return { ok: false as const, message: "Could not verify first purchase." };
      }

      if (!previousPurchase) {
        const { error: commissionError } = await supabase.from("affiliate_orders").insert({
          affiliate_code_id: affiliate.id,
          affiliate_code: affiliateCode,
          affiliate_name: affiliate.affiliate_name,
          user_id: userId,
          plan_id: planId,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: stripeId(session.payment_intent),
          purchase_amount_minor: session.amount_total ?? 0,
          purchase_currency: session.currency ?? "eur",
          payment_status: session.payment_status,
          commission_amount_minor: planId === "a1-pack" ? 300 : 500,
          commission_currency: "eur",
          commission_status: "pending",
        });

        // Replayed webhooks and concurrent first checkouts must never create a second commission.
        if (commissionError && commissionError.code !== "23505") {
          return { ok: false as const, message: "Could not record affiliate commission." };
        }
      }
    }
  }

  return { ok: true as const };
}

async function recordRefund(charge: Stripe.Charge) {
  const paymentIntentId = stripeId(charge.payment_intent);
  if (!paymentIntentId) return { ok: true as const };

  const supabase = getSupabaseAdminClient();
  const fullyRefunded = charge.amount_refunded >= charge.amount;
  const paymentStatus = fullyRefunded ? "refunded" : "partially_refunded";
  const { error: purchaseError } = await supabase
    .from("user_purchases")
    .update({ payment_status: paymentStatus })
    .eq("stripe_payment_intent_id", paymentIntentId);

  if (purchaseError) {
    return { ok: false as const, message: "Could not update refunded purchase." };
  }

  const { error: affiliateError } = await supabase
    .from("affiliate_orders")
    .update({
      payment_status: paymentStatus,
      refunded_amount_minor: charge.amount_refunded,
      commission_status: fullyRefunded ? "cancelled" : "review",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_payment_intent_id", paymentIntentId);

  if (affiliateError) {
    return { ok: false as const, message: "Could not update affiliate refund status." };
  }
  return { ok: true as const };
}

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Payment service is temporarily unavailable." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
      return NextResponse.json({ received: true, pending: true });
    }

    const result = await grantEntitlementForSession(session);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  }

  if (event.type === "charge.refunded") {
    const result = await recordRefund(event.data.object as Stripe.Charge);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
