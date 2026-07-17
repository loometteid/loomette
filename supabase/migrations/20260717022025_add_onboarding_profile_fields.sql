-- Fields collected during onboarding steps 1-2 (0.2.1/0.2.2 in Figma):
-- a real display name distinct from the auto-generated, uniqueness-
-- constrained `username`, plus birthday. Also adds the missing
-- they/them option on gender_type so it can back the "how do you
-- identify" question (was female/male/prefer_not_to_say only — no
-- non-binary equivalent). See .claude/database.md.

alter table public."user"
  add column "display_name" text;

alter table public."user"
  add column "birthday" date;

alter type "public"."gender_type" add value 'non_binary';

-- authenticated's UPDATE grant on public.user is an explicit column
-- allowlist (email is deliberately excluded) — new columns don't
-- inherit it automatically.
grant update (display_name, birthday)
  on public."user" to authenticated;
