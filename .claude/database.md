# Database — Loomette

Source of truth is `supabase/migrations/` — this file is a
human-readable index, not the schema itself. If they disagree, the
migration wins; update this doc in the same commit as any migration.

## ⚠️ SECURITY: RLS is currently off

`SET row_security = off`, zero RLS policies, and `GRANT ALL` to `anon`,
`authenticated`, and `service_role` on every table (see the baseline
migration, roughly lines 13 and 301–352). Any holder of the public
anon key can read or write every row in every table right now,
including `user.email`. This is a pre-existing condition inherited
from a dashboard-built schema, not a decision made during scaffolding.
**It is not fixed by this scaffold.** Do not build or ship any feature
assuming access control exists until RLS policies are written and
reviewed — that requires product input on who-can-read-what and is
tracked as a separate, explicit follow-up.

## ⚠️ `public.user` is not linked to `auth.users`

No column or trigger currently ties a Supabase Auth user to a
`public.user` row (`user_id` is just a bare `uuid default
uuid_generate_v4()`). Needs a decision (auth trigger on signup vs.
shared-ID convention) before building sign-up/login flows.

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
defaults `free`. No auth linkage — see warning above.

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
