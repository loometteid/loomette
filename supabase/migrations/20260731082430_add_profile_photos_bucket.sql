-- Profile (4.1/4.3): storage for the user's avatar photo. Mirrors
-- wardrobe-images/outfit-photos exactly -- public read, RLS-gated
-- writes scoped to a {user_id}/... path prefix, including the SELECT
-- policy (delete-by-prefix silently deletes nothing without one, see
-- wardrobe-images' own follow-up migration for how that was found).
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "profile_photos_select_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "profile_photos_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "profile_photos_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "profile_photos_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
