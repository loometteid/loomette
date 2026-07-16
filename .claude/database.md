# Database — Loomette

Source of truth is `supabase/migrations/` — this file is a
human-readable index, not the schema itself. If they disagree, the
migration wins; update this doc in the same commit as any migration.

## RLS and auth linkage (resolved 2026-07-16)

Both of the gaps that used to be documented here are closed, in
`supabase/migrations/20260716063354_link_auth_users.sql` and
`supabase/migrations/20260716063855_enable_rls_policies.sql`.

**Correction to the historical note**: the baseline migration's `SET
row_security = off;` (line 13) was a `pg_dump` **session** artifact
from how that migration was captured, not a persistent property — it
never disabled RLS on any table. The real (and only) gap was that no
table had `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, which is what
the second migration above fixes.

**`public.user.user_id`** now has a real FK to `auth.users.id` (`on
delete cascade`), with its `uuid_generate_v4()` default dropped — the
table is populated exclusively by the `handle_new_user()` trigger on
`auth.users` insert (`SECURITY DEFINER`, collision-safe username
derived from the email local-part, `profile_photo` seeded from Google
OAuth's `avatar_url` when present). A second trigger
(`handle_user_email_update`) keeps `public.user.email` in sync if a
user changes their email via Supabase Auth. Neither trigger ever
touches `profile_photo` after creation — that stays user-editable
once an in-app profile-edit feature exists.

**RLS is enabled on all 8 tables**, with per-command policies (not
blanket `FOR ALL`) using `(select auth.uid())` and explicit `to
authenticated`/`anon` role scoping (Supabase's documented RLS
performance practices). Summary — full policy SQL is in the migration:

- `user`: own-row SELECT/UPDATE only (UPDATE excludes `email` at the
  column-grant level); no INSERT (trigger-only) or DELETE (goes
  through the Auth Admin API instead, which cascades).
- `item`: public SELECT (catalog), writes are `service_role`-only.
- `wardrobe_item`, `outfit`: own-row CRUD, plus SELECT when
  `is_public = true`.
- `outfit_item`: ownership transitive via `outfit_id → outfit.user_id`
  (`EXISTS` subquery); SELECT also honors `outfit.is_public`.
- `outfit_recommendation`: own-row SELECT/UPDATE only — no
  INSERT/DELETE for `authenticated`, since this table is expected to
  be written by the future Gemini Edge Function via `service_role`.
  Revisit if that design changes.
- `follow`: two-sided — INSERT as yourself only (+ self-follow guard),
  SELECT visible to both parties, DELETE by the follower, UPDATE of
  `is_approved` by the followed party only (column-grant-restricted).
- `wear_log`: own-row CRUD only.

**Deliberately not built yet**: a `public.public_profile` view for
cross-user profile visibility (e.g. for a future follow/search
feature) — the base `user` table stays owner-only until that feature
exists, since RLS can't restrict columns and a loosened row policy
would leak `email` along with any "public" fields.

**Known pre-launch follow-up**: email confirmation is currently OFF
(founder's explicit call, for faster manual testing pre-launch) —
revisit before real users sign up. Password minimum length is 8, no
forced character-class complexity.

## How the baseline migration came to exist

The schema was originally hand-built directly in the Supabase
dashboard, then reverse-engineered via `supabase db dump` into
`supabase/migrations/20260713000000_baseline.sql` on 2026-07-13
(`supabase db pull`'s shadow-database diff incorrectly reported "no
changes," so `db dump` was used instead). Every schema change from
this point forward must be a new migration
(`supabase migration new <name>`) — no more dashboard edits (ADR 0001,
decision 4).

## Enums

- `gender_type`: `female` / `male` / `prefer_not_to_say`
- `item_source_type`: `catalog` / `user_upload` / `affiliate` — how an
  `item` row entered the catalog
- `subscription_tier`: `free` / `premium`
- `wardrobe_source`: `TikTok` / `Instagram` / `Original` — where a
  wardrobe item's inspiration/reference came from

## Tables

### user

One row per app user. `email`/`username` unique. `subscription_tier`
defaults `free`. `user_id` is FK'd to `auth.users.id` and populated by
the `handle_new_user()` trigger — see the linkage section above.

### item

Catalog/reference items — the shared "this garment exists" record
(`name`, `category`, `subcategory`, `color`, `brand`, `material`,
`image_url`, `source_type`). Not user-owned.

### wardrobe_item

A user's personal copy/instance of an `item` (FK → `item`, FK →
`user`). Adds `size`, `price`, `is_public`, `acquired_at`,
`wear_count`, `is_wishlist`, `source`/`source_url` (see
`wardrobe_source`), and its own `image_url` — the user's own photo,
distinct from `item.image_url`, which is the catalog photo.

### outfit

A user-authored combination of wardrobe items (FK → `user`).
`occasion`, `cover_image_url`, `wear_count`, `is_saved`, `is_public`.

> **Open question:** `item_not_available integer default 0` — the
> column name doesn't self-explain (a count? a boolean-as-int? a flag
> for "this outfit references a since-removed item"?). Not documented
> as fact here until confirmed with the founder — don't assume a
> meaning when building against it.

### outfit_item

Join table: `outfit` ↔ `wardrobe_item`, with `layer_order` (rendering
order) and `notes`.

### outfit_recommendation

An AI/algorithmic suggestion of an outfit to a user (FK → `outfit`, FK
→ `user`): `reason`, `occasion`, `score`, `is_clicked`, `is_saved`.
This is the table the future Gemini Edge Function will presumably
write to or read from — no Edge Function exists yet.

### follow

Social graph: `follower_id`/`following_id` (both FK → `user`, unique
pair), `is_approved` (for private-account follow requests, per
`user.is_private`).

### wear_log

Records that a user wore a specific outfit on a date (FK → `user`, FK
→ `outfit`, `worn_on` date).

## Relationships at a glance

```
user 1—* wardrobe_item *—1 item
user 1—* outfit 1—* outfit_item *—1 wardrobe_item
user 1—* outfit_recommendation *—1 outfit
user 1—* follow (self-referential: follower_id / following_id)
user 1—* wear_log *—1 outfit
```

## Keeping this doc updated

1. Add the migration under `supabase/migrations/`.
2. Regenerate types: `supabase gen types typescript --linked >
types/database.types.ts`, commit the diff.
3. Update the relevant table/enum section above in the same commit.
