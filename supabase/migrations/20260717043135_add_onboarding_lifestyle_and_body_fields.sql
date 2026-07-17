-- Fields collected during onboarding steps 3-5 (0.2.3/0.2.4/0.2.5 in
-- Figma). `occupation`, `height`, `weight` already existed and are
-- reused for step 3's profession and step 4's height/weight — the rest
-- are new. See .claude/database.md.
--
-- Unit handling: height/weight/bust/waist/high_hip/hip are stored as
-- plain integers with no unit column, matching the existing height/
-- weight convention — cm for lengths, kg for weight. The step 4 UI
-- offers cm/in and kg/lbs toggles and converts client-side before
-- saving; nothing downstream needs to know which unit the user typed
-- in. Shoe size is the exception: UK/US/EU sizing isn't a clean linear
-- conversion, so both the raw value and the region it was entered in
-- are stored as-is rather than normalized.

create type "public"."work_setting_type" as enum (
  'in_office',
  'remote',
  'hybrid',
  'on_the_go'
);

create type "public"."outfit_size_type" as enum (
  'xs',
  's',
  'm',
  'l',
  'xl',
  'it_varies'
);

create type "public"."shoe_size_region_type" as enum (
  'uk',
  'us',
  'eu'
);

create type "public"."style_tag_type" as enum (
  'clean_minimal',
  'effortlessly_casual',
  'office_ready',
  'soft_feminine',
  'bold_expressive',
  'street_inspired',
  'still_figuring_it_out'
);

alter table public."user"
  add column "work_setting" "public"."work_setting_type",
  add column "outfit_size" "public"."outfit_size_type",
  add column "shoe_size" text,
  add column "shoe_size_region" "public"."shoe_size_region_type",
  add column "bust_size" integer,
  add column "waist_size" integer,
  add column "high_hip_size" integer,
  add column "hip_size" integer,
  add column "style_tags" "public"."style_tag_type"[] default '{}';

grant update (
  work_setting, outfit_size, shoe_size, shoe_size_region,
  bust_size, waist_size, high_hip_size, hip_size, style_tags
) on public."user" to authenticated;
