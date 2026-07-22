-- Calendar / outfit diary (2. Calendar.png): storage for the daily
-- outfit-of-the-day photo. No new tables needed -- outfit.cover_image_url
-- + wear_log.worn_on (both already own-row CRUD under existing RLS) is
-- exactly "a photo representing the outfit worn on a given date", which
-- is what this feature is. AI extraction of individual wardrobe items
-- from the photo (outfit_item rows) is explicitly future work.
--
-- Mirrors wardrobe-images' bucket + policy shape exactly, including the
-- select policy -- storage management calls (delete-by-prefix) resolve
-- via a normal SELECT against storage.objects first, which silently
-- returns nothing without one (see wardrobe-images' own follow-up
-- migration, discovered via live-testing the discard flow there).
insert into storage.buckets (id, name, public)
values ('outfit-photos', 'outfit-photos', true)
on conflict (id) do nothing;

create policy "outfit_photos_select_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'outfit-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "outfit_photos_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'outfit-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "outfit_photos_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'outfit-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'outfit-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "outfit_photos_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'outfit-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
