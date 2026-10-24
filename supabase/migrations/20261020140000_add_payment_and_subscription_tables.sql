-- Add payment_order and subscription tables for multi-gateway payments
create table if not exists public.payment_order (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  user_id uuid not null references public."user" (user_id) on delete cascade,
  provider text not null,
  plan text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'IDR',
  status text not null default 'pending',
  checkout_url text,
  provider_session_id text,
  provider_transaction_id text,
  paid_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_order_user_id_idx on public.payment_order (user_id);
create index if not exists payment_order_order_id_idx on public.payment_order (order_id);
create index if not exists payment_order_status_idx on public.payment_order (status);

alter table public.payment_order enable row level security;

create policy "Users can view their own payment orders"
  on public.payment_order
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own payment orders"
  on public.payment_order
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own payment orders"
  on public.payment_order
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Subscription table
create table if not exists public.subscription (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public."user" (user_id) on delete cascade,
  tier text not null default 'premium',
  status text not null default 'active',
  billing_cycle text not null default 'monthly',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  latest_order_id text references public.payment_order (order_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscription_user_id_idx on public.subscription (user_id);

alter table public.subscription enable row level security;

create policy "Users can view their own subscription"
  on public.subscription
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on public.subscription
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
