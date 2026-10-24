-- Trip Packing List (4.2.3 / D.4.2.3)
-- Persists checklist items per trip for a user so that packing lists sync across devices.
create table public.trip_packing_item (
  id uuid primary key default extensions.uuid_generate_v4(),
  trip_id uuid not null references public.trip (id) on delete cascade,
  user_id uuid not null references public."user" (user_id) on delete cascade,
  name text not null,
  is_packed boolean not null default false,
  created_at timestamp without time zone default now()
);

alter table public.trip_packing_item enable row level security;

create policy "trip_packing_item_select" on public.trip_packing_item
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "trip_packing_item_insert" on public.trip_packing_item
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "trip_packing_item_update" on public.trip_packing_item
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "trip_packing_item_delete" on public.trip_packing_item
for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists trip_packing_item_trip_id_idx on public.trip_packing_item (trip_id);
create index if not exists trip_packing_item_user_id_idx on public.trip_packing_item (user_id);
