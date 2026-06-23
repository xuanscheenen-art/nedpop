import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { isPaidPlanId, paidPlanConfig } from "@/lib/stripe/plans";

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Payment is temporarily unavailable." }, { status: 500 });
  }

  const body = await request.json().catch(() => null) as { planId?: string } | null;
  const planId = body?.planId;
  if (!planId || !isPaidPlanId(planId)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const config = paidPlanConfig[planId];
  const priceId = process.env[config.priceEnvKey];
  if (!priceId) {
    return NextResponse.json({ error: `Missing ${config.priceEnvKey}.` }, { status: 500 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 500 });
  }

  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Please sign in before checkout." }, { status: 401 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.headers.get("origin") ?? new URL(request.url).origin;
  const stripe = new Stripe(stripeSecretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Leave payment_method_types unset so Checkout uses Dashboard-managed dynamic payment methods.
    client_reference_id: userData.user.id,
    customer_email: userData.user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success&plan=${planId}`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    metadata: {
      user_id: userData.user.id,
      plan_id: planId,
      access_level: config.accessLevel,
      unlocked_levels: config.unlockedLevels.join(","),
    },
  });

  return NextResponse.json({ sessionId: session.id, url: session.url });
}
