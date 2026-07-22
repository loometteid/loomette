-- The wardrobe-images bucket's `public = true` flag only bypasses RLS
-- for the direct CDN-style GET endpoint
-- (/storage/v1/object/public/...) used to actually render images.
-- Storage API management operations (delete-by-prefix in particular)
-- resolve which objects match via a normal SELECT against
-- storage.objects first, which was silently returning zero rows for
-- `authenticated` with no SELECT policy in place -- delete-by-prefix
-- calls were succeeding (200) but deleting nothing, discovered via
-- live testing of the discard flow.
create policy "wardrobe_images_select_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'wardrobe-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
