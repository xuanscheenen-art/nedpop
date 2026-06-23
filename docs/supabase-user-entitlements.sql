create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  stripe_customer_id text,
  unlocked_levels text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_unlocked_levels_valid check (
    unlocked_levels <@ array['A1', 'A2', 'B1']::text[]
  )
);

create table if not exists public.words (
  id text primary key,
  dutch text not null,
  meaning_zh text,
  meaning_en text,
  level text not null check (level in ('A0', 'A1', 'A2', 'B1')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_reviewed_words (
  user_id uuid not null references public.users(id) on delete cascade,
  word_id text not null references public.words(id) on delete cascade,
  reviewed_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create table if not exists public.user_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  plan_id text not null check (plan_id in ('a1-pack', 'a2-pack', 'b1-pack', 'bundle')),
  unlocked_levels text[] not null,
  amount_total integer,
  currency text,
  payment_status text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.words enable row level security;
alter table public.user_reviewed_words enable row level security;
alter table public.user_purchases enable row level security;

drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can update own profile basics" on public.users;
drop policy if exists "Anyone can read words" on public.words;
drop policy if exists "Users can read own reviewed words" on public.user_reviewed_words;
drop policy if exists "Users can insert own reviewed words" on public.user_reviewed_words;
drop policy if exists "Users can delete own reviewed words" on public.user_reviewed_words;
drop policy if exists "Users can read own purchases" on public.user_purchases;

create policy "Users can read own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile basics"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and unlocked_levels = (select unlocked_levels from public.users where id = auth.uid())
);

create policy "Anyone can read words"
on public.words
for select
to anon, authenticated
using (true);

create policy "Users can read own reviewed words"
on public.user_reviewed_words
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own reviewed words"
on public.user_reviewed_words
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete own reviewed words"
on public.user_reviewed_words
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read own purchases"
on public.user_purchases
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists words_level_idx on public.words(level);
create index if not exists user_reviewed_words_user_reviewed_at_idx
  on public.user_reviewed_words(user_id, reviewed_at desc);
create index if not exists user_purchases_user_created_at_idx
  on public.user_purchases(user_id, created_at desc);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set
      email = excluded.email,
      display_name = coalesce(excluded.display_name, public.users.display_name),
      avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.handle_new_auth_user();

-- Entitlements are granted by the Stripe webhook with SUPABASE_SERVICE_ROLE_KEY.
-- Client-side users can read their own unlocked_levels but cannot grant paid access to themselves.
