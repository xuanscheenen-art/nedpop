# Vercel Production Checklist

This app is ready for production configuration through Vercel Environment Variables. Do not commit real keys.

## 1. Supabase

Run `docs/supabase-user-entitlements.sql` in the Supabase SQL editor.

Enable Google login in Supabase Auth and add redirect URLs:

```text
http://localhost:3001/auth/callback
http://localhost:3003/auth/callback
https://YOUR_DOMAIN/auth/callback
```

In Google Cloud OAuth settings, add the Supabase provider callback URL as the authorized redirect URI:

```text
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

Add these Vercel variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ENABLE_REVIEW_LOGIN=false
NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK=false
```

## 2. Stripe

Create four one-time Stripe Prices:

```text
A1 Life Foundation Pack: €19
A2 Practical Life Task Pack: €39
B1 Work & Study Pack: €39
All Access Pass: €59
```

Copy the four `price_...` IDs.

Add these Vercel variables:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_A1=
STRIPE_PRICE_A2=
STRIPE_PRICE_B1=
STRIPE_PRICE_BUNDLE=
```

Optional:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

The current Checkout flow redirects with the server-created Stripe Checkout URL, so the publishable key is not required for that redirect. Keep it available for future Stripe.js client flows.

### Payment Methods

NedPop uses Stripe Checkout with dynamic payment methods. In Stripe Dashboard:

```text
Settings -> Payment methods
```

Enable the methods you want Stripe to show when eligible:

```text
Cards
Apple Pay
Google Pay
Alipay
WeChat Pay
```

Apple Pay and Google Pay are wallet methods. They only appear when the buyer's device, browser, country, currency, and wallet setup are eligible. Alipay and WeChat Pay also depend on Stripe account country, presentment currency, and customer eligibility. With the current EUR one-time Checkout flow, Stripe filters incompatible methods automatically.

If Stripe asks for wallet domain setup, add the production domains in:

```text
Settings -> Payment method domains
```

Add both root and `www` versions if both can serve the site:

```text
YOUR_DOMAIN
www.YOUR_DOMAIN
```

## 3. Stripe Webhook

After the Vercel production URL is live, create a Stripe webhook endpoint:

```text
https://YOUR_DOMAIN/api/stripe/webhook
```

Listen for these events:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
```

The app grants access only when `payment_status` is `paid`. The async event is needed if a payment method finishes later.

Copy the webhook signing secret (`whsec_...`) into:

```env
STRIPE_WEBHOOK_SECRET=
```

## 4. Vercel Environments

Use live Stripe keys only for Production. Use test keys for Preview and Development if you enable those environments.

In Vercel:

```text
Project Settings -> Environment Variables
```

Add all required variables for Production, then redeploy.

## 5. Local Check

If you pull Vercel envs locally:

```bash
vercel env pull .env.local --environment=production
pnpm run check:env
```

Expected result:

```text
Ready: required production variables are present and basic formats look right.
```

## 6. Purchase Flow To Test

1. Open `/pricing`.
2. Click A1, A2, B1, or Bundle.
3. Sign in with Google.
4. Complete Stripe Checkout.
5. Return to `/dashboard?checkout=success`.
6. Confirm the row exists in `public.users`.
7. Confirm `unlocked_levels` contains the purchased level.
8. Confirm A1/A2/B1 content is unlocked only for owned levels.

If a user buys A1 and later buys B1, the webhook merges `unlocked_levels` so both packs stay unlocked.
