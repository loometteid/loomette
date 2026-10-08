-- Add notification table and RLS policies for in-app notifications
create table if not exists public.notification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public."user" (user_id) on delete cascade,
  title text not null,
  description text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notification_user_id_idx on public.notification (user_id);
create index if not exists notification_user_id_is_read_idx on public.notification (user_id, is_read);

alter table public.notification enable row level security;

create policy "Users can view their own notifications"
  on public.notification
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own notifications"
  on public.notification
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notification
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on public.notification
  for delete
  to authenticated
  using (auth.uid() = user_id);
