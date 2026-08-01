-- Edit Profile (4.4 Figma): adds "Your Body Type" field. The Figma only
-- shows the currently-selected value ("Hourglass") in a collapsed
-- dropdown, not a full option list, so this is plain nullable text
-- rather than a guessed enum -- the app renders a fixed set of common
-- fashion body-shape options and stores the chosen label as-is.
alter table public."user"
  add column "body_type" text;

-- authenticated's UPDATE grant on public.user is an explicit column
-- allowlist (see 20260716063855_enable_rls_policies.sql) -- new columns
-- don't inherit it automatically.
grant update (body_type)
  on public."user" to authenticated;
