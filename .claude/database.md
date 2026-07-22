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

- `gender_type`: `female` / `male` / `non_binary` / `prefer_not_to_say`
  (`non_binary` added 2026-07-17 to back the onboarding "how do you
  identify" step — see below)
- `item_source_type`: `catalog` / `user_upload` / `affiliate` — how an
  `item` row entered the catalog
- `subscription_tier`: `free` / `premium`
- `wardrobe_source`: `TikTok` / `Instagram` / `Original` — where a
  wardrobe item's inspiration/reference came from
- `work_setting_type`: `in_office` / `remote` / `hybrid` / `on_the_go`
  (onboarding step 3)
- `outfit_size_type`: `xs` / `s` / `m` / `l` / `xl` / `it_varies`
  (onboarding step 4)
- `shoe_size_region_type`: `uk` / `us` / `eu` (onboarding step 4 — the
  region the raw `shoe_size` text was entered in; sizes aren't
  normalized across regions, see below)
- `style_tag_type`: `clean_minimal` / `effortlessly_casual` /
  `office_ready` / `soft_feminine` / `bold_expressive` /
  `street_inspired` / `still_figuring_it_out` (onboarding step 5,
  multi-select — stored as `user.style_tags`, an array)
- `occasion_type`: `everyday` / `work` / `going_out` / `special` /
  `just_vibing` (v0.2.7.1 approval popup, multi-select — stored as
  `wardrobe_item.occasions`, an array, same shape as `style_tags`)

## Tables

### user

One row per app user. `email`/`username` unique. `subscription_tier`
defaults `free`. `user_id` is FK'd to `auth.users.id` and populated by
the `handle_new_user()` trigger — see the linkage section above.

`display_name` and `birthday` (added 2026-07-17, both nullable) are
collected during onboarding steps 1-2 (`app/onboarding/1`,
`app/onboarding/2`) — `display_name` is user-facing and distinct from
`username`, which stays the trigger-generated, uniqueness-constrained
handle. `gender` doubles as the "how do you identify" answer from step
2 (`female`→She/Her, `male`→He/Him, `non_binary`→They/Them,
`prefer_not_to_say`→Prefer not to say) rather than a separate pronouns
column — a deliberate simplification, not a claim that gender and
pronouns are the same thing. Both new columns needed an explicit
column-grant addition since `authenticated`'s UPDATE grant on this
table is an allowlist, not table-wide (see
`20260717022025_add_onboarding_profile_fields.sql`).

Onboarding steps 3-5 (`20260717043135_add_onboarding_lifestyle_and_body_fields.sql`)
added: `work_setting` (step 3, alongside the pre-existing `occupation`
for "your profession"); `outfit_size`, `shoe_size` +
`shoe_size_region`, `bust_size`, `waist_size`, `high_hip_size`,
`hip_size` (step 4 — all optional; also reuses the pre-existing
`height`/`weight` columns); `style_tags` (step 5, multi-select, `[]`
array). `height`/`weight`/`bust_size`/`waist_size`/`high_hip_size`/
`hip_size` are plain integers with no unit column — cm for lengths, kg
for weight — the step 4 UI's cm/in and kg/lbs toggles convert
client-side before saving. `shoe_size` is the one exception: UK/US/EU
sizing isn't a clean linear conversion, so the raw value and its
region are both stored as entered rather than normalized.

### item

Catalog/reference items — the shared "this garment exists" record
(`name`, `category`, `subcategory`, `color`, `brand`, `material`,
`image_url`, `source_type`). Not user-owned in general — but see the
`created_by_user_id` addition below for the one case where it is.

`name`/`category` are nullable (were `NOT NULL` until
`20260719043457_add_wardrobe_upload_approval_pipeline.sql`) —
`source_type = 'user_upload'` rows start with all metadata empty and
get filled in by the user via the approval popup (`app/wardrobe/
approval`) for now, and by the future Gemini integration later. Only
`user_upload` rows have `created_by_user_id` set (nullable, FK → `user`,
`on delete set null`); it exists specifically so post-creation edits
(the popup's Save button) can be gated by a real RLS policy
(`item_update_own_upload`, `created_by_user_id = auth.uid()`) instead
of an unsound "some wardrobe_item I own points at this item" check —
`item` is genuinely shared (`user 1—* wardrobe_item *—1 item`), so that
transitive check doesn't imply exclusive ownership.

There is deliberately no client-facing INSERT policy on `item`.
Creation goes through `create_wardrobe_upload()` (see below), a
`SECURITY DEFINER` function that sets `created_by_user_id` itself.

### wardrobe_item

A user's personal copy/instance of an `item` (FK → `item`, FK →
`user`). Adds `size` (now the `outfit_size_type` enum, reusing
onboarding's picker — was free text before v0.2.7.1), `price`,
`is_public`, `acquired_at`, `wear_count`, `is_wishlist`,
`source`/`source_url` (see `wardrobe_source` — this is inspiration/
reference, e.g. "saw it on TikTok", **not** where it was purchased),
and its own `image_url` — the user's own (original, pre-background-
removal) photo, distinct from `item.image_url`, which holds the
background-removed/catalog-style photo for `user_upload` rows.

v0.2.7.1 added `is_approved` (boolean, default `false` — reuses the
naming already established by `follow.is_approved` rather than a new
enum) and `purchase_location` (text, the popup's "BUY FROM" field —
kept distinct from `source`/`source_url` since it's a different
concept). An uploaded item is **not** visible in the Wardrobe grid
until `is_approved = true`; the Approval Queue is `is_approved = false`.

### Wardrobe upload/approval RPCs

`create_wardrobe_upload(p_original_url, p_processed_url) returns (item_id,
wardrobe_item_id)` and `discard_wardrobe_item(p_wardrobe_item_id)` —
both `SECURITY DEFINER`, mirroring `handle_new_user()`'s hardening
(`set search_path = ''`). Called from the client via `supabase.rpc(...)`.
They exist so the client never needs direct INSERT access to `item`
(which has no owner column) and so create/discard are atomic across
both tables. Normal edits (approval popup Save, Approve toggling
`is_approved`) are plain client-side `.update()` calls through existing
RLS — the RPCs are only for the two-table create/delete operations.

**Storage**: `wardrobe-images` bucket (public — read needs no auth,
writes are RLS-gated to `{user_id}/...` path prefixes via policies on
`storage.objects`). Path convention: `{user_id}/{upload_uuid}/
original.<ext>` and `.../processed.<ext>`, where `upload_uuid` is
client-generated (`crypto.randomUUID()`) since Storage upload happens
before any DB row exists.

**Gotcha, found via live-testing the discard flow, not by reading
docs**: a bucket's `public = true` flag only bypasses RLS for the
direct CDN-style GET endpoint used to render images
(`/storage/v1/object/public/...`). The Storage _management_ API
(delete-by-prefix, list, etc.) still resolves matching objects via a
normal `SELECT` against `storage.objects` first — with no `SELECT`
policy, delete-by-prefix calls returned `200` with an empty result,
silently deleting nothing, no error surfaced anywhere. Fixed in
`20260719045816_add_wardrobe_images_select_policy.sql`. If a future
bucket needs delete-by-prefix (or list) to work for `authenticated`,
it needs an explicit `SELECT` policy — the public flag alone is not
enough, this doesn't generalize the way it looks like it should.

### outfit

A user-authored combination of wardrobe items (FK → `user`).
`occasion`, `cover_image_url`, `wear_count`, `is_saved`, `is_public`.

> **Open question:** `item_not_available integer default 0` — the
> column name doesn't self-explain (a count? a boolean-as-int? a flag
> for "this outfit references a since-removed item"?). Not documented
> as fact here until confirmed with the founder — don't assume a
> meaning when building against it.

**Calendar / outfit diary (`app/(app)/calendar`, 2. Calendar.png)**
reuses this table as-is rather than adding a new one:
`cover_image_url` holds the user's daily outfit photo, with no
`outfit_item` rows yet — AI extraction of individual wardrobe items
from that photo is future work, and the schema already had the right
seam for it. Photos live in the `outfit-photos` Storage bucket
(public, RLS-gated writes to `{user_id}/{upload_uuid}/photo.<ext>`,
same shape as `wardrobe-images` including the delete-by-prefix select
policy gotcha noted there).

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
→ `outfit`, `worn_on` date). No uniqueness constraint on
`(user_id, worn_on)` — multiple outfits can be logged for the same
day (the Calendar UI shows the most-recently-created one per date,
via `order by worn_on, created_at desc` and keeping the first row per
date client-side).

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
