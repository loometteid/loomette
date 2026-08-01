-- Trip (4.2/4.2.1/4.2.2.1): a labeled date range with light travel
-- metadata. No existing table models this, so it's genuinely new --
-- everything else (which outfits are planned for which day of the
-- trip) deliberately reuses what already exists instead of adding a
-- second parallel structure:
--
-- - "day" is never stored as its own row. It's just a date computed
--   by iterating trip.start_date..trip.end_date -- there is nothing
--   about a day that needs persisting beyond that.
-- - "which outfits are planned for day N" reuses wear_log exactly as
--   the regular Calendar diary already does: insert a wear_log row
--   with worn_on = that day's date and outfit_id = the saved Mix &
--   Match outfit. wear_log already has no uniqueness constraint on
--   (user_id, worn_on), which is exactly what "PLAN OUTFIT stays
--   visible, multiple outfits per day" needs -- no new join table
--   required. It also means a trip-planned outfit is automatically a
--   real Calendar diary entry on that date, which is the correct
--   behavior (an outfit worn during a trip is still just an outfit
--   worn on that date), not an incidental side effect.
create type public.season_type as enum (
  'winter',
  'spring',
  'summer',
  'autumn'
);

create type public.travel_companion_type as enum (
  'solo_trip',
  'couple',
  'family',
  'business'
);

create table public.trip (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public."user" (user_id) on delete cascade,
  name text,
  start_date date not null,
  end_date date not null,
  season public.season_type,
  travel_companion public.travel_companion_type,
  created_at timestamp without time zone default now(),
  constraint trip_dates_check check (end_date >= start_date)
);

alter table public.trip enable row level security;

create policy "trip_select" on public.trip
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "trip_insert" on public.trip
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "trip_update" on public.trip
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "trip_delete" on public.trip
for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists trip_user_id_idx on public.trip (user_id);
