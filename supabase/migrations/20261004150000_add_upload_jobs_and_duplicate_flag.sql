-- Migration: Add upload_job table and duplicate flag on wardrobe_item
-- Supports asynchronous Edge Function garment extraction pipeline (ADR 0008, 0009)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'upload_job_status') then
    create type public.upload_job_status as enum (
      'pending',
      'analyzing',
      'completed',
      'failed'
    );
  end if;
end;
$$;

create table if not exists public.upload_job (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public."user" (user_id) on delete cascade,
  source_type text not null default 'wardrobe',
  original_image_url text not null,
  status public.upload_job_status not null default 'pending',
  item_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for querying user's recent jobs
create index if not exists upload_job_user_id_idx on public.upload_job (user_id, created_at desc);

-- RLS on upload_job
alter table public.upload_job enable row level security;

create policy "upload_job_select_own" on public.upload_job
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "upload_job_insert_own" on public.upload_job
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "upload_job_update_own" on public.upload_job
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Advisory duplicate flag on wardrobe_item
alter table public.wardrobe_item
  add column if not exists is_duplicate boolean not null default false;

-- Trigger to maintain updated_at on upload_job
create or replace function public.set_upload_job_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists upload_job_set_updated_at on public.upload_job;
create trigger upload_job_set_updated_at
before update on public.upload_job
for each row
execute function public.set_upload_job_updated_at();
