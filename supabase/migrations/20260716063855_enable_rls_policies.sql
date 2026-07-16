-- Enable Row Level Security and add per-table policies for every table.
-- See .claude/database.md for the per-table rationale. No GRANT changes
-- are needed: service_role has BYPASSRLS (untouched by any policy here),
-- and for anon/authenticated the existing GRANT ALL is a coarse gate —
-- these policies are the real fine-grained one.

-- ---------------------------------------------------------------------
-- user: own-row profile. No INSERT policy (rows come only from the
-- handle_new_user trigger, which is SECURITY DEFINER and bypasses RLS).
-- No DELETE policy (account deletion goes through the Auth Admin API
-- deleting auth.users, which cascades via the FK added in the previous
-- migration). UPDATE excludes the email column at the grant level, since
-- RLS can't restrict columns and a client could otherwise desync email
-- from auth.users (the sync trigger exists specifically to prevent that).
-- ---------------------------------------------------------------------
alter table public."user" enable row level security;

create policy "user_select_own" on public."user"
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "user_update_own" on public."user"
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke update on public."user" from authenticated;
grant update (username, profile_photo, is_private, occupation, gender, height, weight)
  on public."user" to authenticated;

-- ---------------------------------------------------------------------
-- item: shared catalog, not user-owned. Public read; writes are
-- service_role-only (bypasses RLS), no policy needed for that.
-- ---------------------------------------------------------------------
alter table public.item enable row level security;

create policy "item_select_all" on public.item
for select
to anon, authenticated
using (true);

-- ---------------------------------------------------------------------
-- wardrobe_item: own-row CRUD, plus SELECT when is_public = true.
-- ---------------------------------------------------------------------
alter table public.wardrobe_item enable row level security;

create policy "wardrobe_item_select" on public.wardrobe_item
for select to authenticated
using ((select auth.uid()) = user_id or is_public = true);

create policy "wardrobe_item_insert" on public.wardrobe_item
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "wardrobe_item_update" on public.wardrobe_item
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "wardrobe_item_delete" on public.wardrobe_item
for delete to authenticated
using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- outfit: same shape as wardrobe_item.
-- ---------------------------------------------------------------------
alter table public.outfit enable row level security;

create policy "outfit_select" on public.outfit
for select to authenticated
using ((select auth.uid()) = user_id or is_public = true);

create policy "outfit_insert" on public.outfit
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "outfit_update" on public.outfit
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "outfit_delete" on public.outfit
for delete to authenticated
using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- outfit_item: no direct user_id — ownership is transitive via
-- outfit_id -> outfit.user_id. SELECT also honors outfit.is_public
-- (a public outfit's composition should be viewable); writes stay
-- owner-only regardless of the public flag.
-- ---------------------------------------------------------------------
alter table public.outfit_item enable row level security;

create policy "outfit_item_select" on public.outfit_item
for select to authenticated
using (
  exists (
    select 1 from public.outfit o
    where o.id = outfit_item.outfit_id
      and ((select auth.uid()) = o.user_id or o.is_public = true)
  )
);

create policy "outfit_item_insert" on public.outfit_item
for insert to authenticated
with check (
  exists (
    select 1 from public.outfit o
    where o.id = outfit_item.outfit_id
      and (select auth.uid()) = o.user_id
  )
);

create policy "outfit_item_update" on public.outfit_item
for update to authenticated
using (
  exists (select 1 from public.outfit o where o.id = outfit_item.outfit_id and (select auth.uid()) = o.user_id)
)
with check (
  exists (select 1 from public.outfit o where o.id = outfit_item.outfit_id and (select auth.uid()) = o.user_id)
);

create policy "outfit_item_delete" on public.outfit_item
for delete to authenticated
using (
  exists (select 1 from public.outfit o where o.id = outfit_item.outfit_id and (select auth.uid()) = o.user_id)
);

-- ---------------------------------------------------------------------
-- outfit_recommendation: own-row SELECT/UPDATE only. No INSERT/DELETE
-- policy for authenticated — this table is written by the not-yet-built
-- Gemini Edge Function, which will use service_role (bypasses RLS).
-- ---------------------------------------------------------------------
alter table public.outfit_recommendation enable row level security;

create policy "outfit_recommendation_select" on public.outfit_recommendation
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "outfit_recommendation_update" on public.outfit_recommendation
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- follow: two-sided (follower_id and following_id are both real users).
-- INSERT only as yourself, with a self-follow guard. SELECT visible to
-- both parties. DELETE (unfollow) by the follower only. UPDATE of
-- is_approved by the followed party only, restricted at the grant level
-- to that single column so the followed party can't repoint the row to
-- a different follower/following pair.
-- ---------------------------------------------------------------------
alter table public.follow enable row level security;

create policy "follow_select" on public.follow
for select to authenticated
using ((select auth.uid()) = follower_id or (select auth.uid()) = following_id);

create policy "follow_insert" on public.follow
for insert to authenticated
with check ((select auth.uid()) = follower_id and follower_id <> following_id);

create policy "follow_update" on public.follow
for update to authenticated
using ((select auth.uid()) = following_id)
with check ((select auth.uid()) = following_id);

create policy "follow_delete" on public.follow
for delete to authenticated
using ((select auth.uid()) = follower_id);

revoke update on public.follow from authenticated;
grant update (is_approved) on public.follow to authenticated;

-- ---------------------------------------------------------------------
-- wear_log: own-row CRUD only, no public sharing.
-- ---------------------------------------------------------------------
alter table public.wear_log enable row level security;

create policy "wear_log_select" on public.wear_log
for select to authenticated using ((select auth.uid()) = user_id);

create policy "wear_log_insert" on public.wear_log
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "wear_log_update" on public.wear_log
for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "wear_log_delete" on public.wear_log
for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- Supporting indexes. Postgres doesn't auto-index FK columns (only
-- PK/unique constraints get one) — these back the policy predicates
-- above. follow.follower_id isn't listed: the existing
-- unique(follower_id, following_id) constraint already covers it as a
-- leftmost prefix.
-- ---------------------------------------------------------------------
create index if not exists wardrobe_item_user_id_idx on public.wardrobe_item (user_id);
create index if not exists outfit_user_id_idx on public.outfit (user_id);
create index if not exists outfit_item_outfit_id_idx on public.outfit_item (outfit_id);
create index if not exists outfit_recommendation_user_id_idx on public.outfit_recommendation (user_id);
create index if not exists follow_following_id_idx on public.follow (following_id);
create index if not exists wear_log_user_id_idx on public.wear_log (user_id);
