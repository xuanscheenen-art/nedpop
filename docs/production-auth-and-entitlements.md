# Production Auth And Entitlements

## Google Login

NedPop uses Supabase Auth with Google OAuth.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

In Supabase:

1. Enable Authentication > Providers > Google.
2. Add the Google OAuth client ID and secret.
3. Copy the callback URL shown by Supabase for the Google provider.
4. Add these site redirect URLs in Authentication > URL Configuration:
   - `http://localhost:3001/auth/callback`
   - `http://localhost:3003/auth/callback`
   - `https://YOUR_DOMAIN/auth/callback`

In Google Cloud OAuth settings:

1. Create an OAuth Client ID for a Web application.
2. Add the Supabase Google provider callback URL as an authorized redirect URI. It usually looks like:

```text
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

3. Add these authorized JavaScript origins:

```text
http://localhost:3001
http://localhost:3003
https://YOUR_DOMAIN
```

## Local Preview Login

Local development can show a preview login only when explicitly enabled. It grants local bundle access so A1/A2/B1 content can be reviewed without touching Supabase or Stripe.

Production builds disable this path even if the flag is accidentally set. Keep both flags `false` or unset for public production:

```bash
NEXT_PUBLIC_ENABLE_REVIEW_LOGIN=false
NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK=false
```

Only set them to `true` temporarily in local development.

## WeChat Login

Google login is the primary production login path for the current codebase.

WeChat login is possible, but it is a separate project because Supabase does not provide a built-in WeChat social provider in the same one-click way as Google. A production WeChat login usually needs one of these paths:

- WeChat Open Platform website login: users scan a QR code, and the app exchanges the WeChat authorization code on the server. This usually requires a verified WeChat Open Platform account and approved website application.
- A custom OAuth bridge: build a server route that handles WeChat OAuth, then creates or links a Supabase user through a secure backend flow.
- A third-party auth provider that already supports WeChat, then connect it to the app separately.

Do Google first. Add WeChat only after the core purchase and entitlement flow is stable.

## Paid Entitlements

The app reads paid access from `public.users.unlocked_levels`.

Run the SQL in `docs/supabase-user-entitlements.sql` in the Supabase SQL editor.

Stripe writes this array from the webhook after successful checkout. Until Stripe is connected, A1/A2/B1 stay locked unless `unlocked_levels` is granted manually.

## Stripe Checkout

NedPop creates Checkout Sessions from `/api/checkout` and receives payment events at `/api/stripe/webhook`.

Checkout uses Stripe Dashboard-managed dynamic payment methods. Enable Cards, Apple Pay, Google Pay, Alipay, and WeChat Pay in Stripe Dashboard payment method settings. Stripe only shows methods that are eligible for the buyer's device, country, currency, and payment flow.

The webhook should listen for:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
```

Entitlements are granted only after Stripe reports the Checkout Session as paid.

Required Stripe environment variables:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_A1=
STRIPE_PRICE_A2=
STRIPE_PRICE_B1=
STRIPE_PRICE_BUNDLE=
```

Optional for future Stripe.js client flows:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Do not commit live keys to the repo. Configure them in the deployment provider environment settings.

Key types:

- Optional publishable browser key: reserved for future Stripe.js client flows as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Server secret key: used only as `STRIPE_SECRET_KEY` by `/api/checkout`.
- Webhook signing secret: used only as `STRIPE_WEBHOOK_SECRET` by `/api/stripe/webhook`.
- Stripe Price IDs: used as `STRIPE_PRICE_A1`, `STRIPE_PRICE_A2`, `STRIPE_PRICE_B1`, and `STRIPE_PRICE_BUNDLE`.

If a key was pasted into chat or source code, rotate it in Stripe before launch.

Full launch checklist: `docs/vercel-production-checklist.md`.
