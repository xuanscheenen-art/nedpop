-- Run after docs/supabase-user-entitlements.sql.
-- Admin access is granted only by a trusted operator setting users.is_admin.

alter table public.users
  add column if not exists is_admin boolean not null default false;

alter table public.user_purchases
  add column if not exists affiliate_code text;

create table if not exists public.affiliate_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  affiliate_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists affiliate_codes_normalized_code_uidx
  on public.affiliate_codes (upper(trim(code)));

create table if not exists public.affiliate_orders (
  id uuid primary key default gen_random_uuid(),
  affiliate_code_id uuid references public.affiliate_codes(id) on delete set null,
  affiliate_code text not null,
  affiliate_name text not null,
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('a1-pack', 'a2-pack', 'b1-pack', 'bundle')),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  purchase_amount_minor integer not null,
  purchase_currency text not null,
  payment_status text not null,
  commission_amount_minor integer not null check (commission_amount_minor in (300, 500)),
  commission_currency text not null default 'eur' check (commission_currency = 'eur'),
  commission_status text not null default 'pending'
    check (commission_status in ('pending', 'approved', 'review', 'cancelled')),
  refunded_amount_minor integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One lifetime first-purchase commission per user, regardless of later checkouts/codes.
create unique index if not exists affiliate_orders_one_commission_per_user_uidx
  on public.affiliate_orders(user_id);
create index if not exists affiliate_orders_code_created_idx
  on public.affiliate_orders(affiliate_code_id, created_at desc);
create index if not exists affiliate_orders_created_idx
  on public.affiliate_orders(created_at desc);
create index if not exists affiliate_orders_payment_intent_idx
  on public.affiliate_orders(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table public.affiliate_codes enable row level security;
alter table public.affiliate_orders enable row level security;

-- Prevent a signed-in user from promoting their own profile through the existing
-- self-update policy after the new administrator column is added.
drop policy if exists "Users can update own profile basics" on public.users;
create policy "Users can update own profile basics"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and unlocked_levels = (select profile.unlocked_levels from public.users as profile where profile.id = auth.uid())
  and is_admin = (select profile.is_admin from public.users as profile where profile.id = auth.uid())
);

-- All reads and writes go through authenticated server routes using the service role.
revoke all on public.affiliate_codes from anon, authenticated;
revoke all on public.affiliate_orders from anon, authenticated;

comment on column public.user_purchases.affiliate_code is
  'Optional customer-entered affiliate code captured on Stripe Checkout; does not apply a discount.';
comment on table public.affiliate_orders is
  'Verified paid first-purchase referrals and their commission/refund review state.';

-- After promoting an operator account, manually grant admin access with:
-- update public.users set is_admin = true where id = '<auth.users UUID>';
