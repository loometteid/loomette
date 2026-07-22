-- v0.2.7.1 Add Initial Item: upload -> approval -> wardrobe pipeline.
--
-- item.name/category become nullable -- nothing populates them until
-- the user fills them in via the approval popup (or, later, Gemini).
-- item also gets a real ownership column (created_by_user_id), scoped
-- to user_upload rows only.
--
-- A transitive-ownership-via-wardrobe_item RLS policy on item (mirroring
-- outfit_item's pattern) was considered and rejected: item is
-- documented as genuinely shared (user 1--* wardrobe_item *--1 item),
-- so "some wardrobe_item you own points at this item_id" does not
-- imply exclusive ownership the way it does for outfit_item -> outfit
-- (which is never shared). A real ownership column avoids that hole.

alter table public.item
  alter column name drop not null,
  alter column category drop not null,
  add column created_by_user_id uuid references public."user" (user_id) on delete set null;

create type public.occasion_type as enum (
  'everyday',
  'work',
  'going_out',
  'special',
  'just_vibing'
);

alter table public.wardrobe_item
  add column is_approved boolean not null default false,
  add column purchase_location text,
  add column occasions public.occasion_type[] default '{}';

-- size was free text; the picker is the same fixed XS-XL set already
-- modeled by outfit_size_type for onboarding step 4 (user.outfit_size)
-- -- reuse it instead of keeping a second untyped representation of
-- the same concept. Safe cast: no rows exist in this pre-launch table.
alter table public.wardrobe_item
  alter column size type public.outfit_size_type using size::public.outfit_size_type;

-- Every other transitive-ownership-style query in this schema
-- (outfit_item -> outfit) has an index backing its join column;
-- wardrobe_item.item_id was missing one.
create index if not exists wardrobe_item_item_id_idx on public.wardrobe_item (item_id);

-- Atomic create/discard via SECURITY DEFINER functions, mirroring
-- handle_new_user()'s pattern (same search_path hardening). This
-- avoids needing any INSERT policy on item at all -- item has no
-- owner column to check at insert time, so the function sets
-- created_by_user_id itself instead of relying on RLS to enforce it.
create or replace function public.create_wardrobe_upload(
  p_original_url text,
  p_processed_url text
)
returns table (item_id uuid, wardrobe_item_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_id uuid;
  v_wardrobe_item_id uuid;
begin
  insert into public.item (name, category, source_type, image_url, created_by_user_id)
  values (null, null, 'user_upload', p_processed_url, auth.uid())
  returning public.item.item_id into v_item_id;

  insert into public.wardrobe_item (item_id, user_id, image_url, is_approved)
  values (v_item_id, auth.uid(), p_original_url, false)
  returning public.wardrobe_item.id into v_wardrobe_item_id;

  return query select v_item_id, v_wardrobe_item_id;
end;
$$;

grant execute on function public.create_wardrobe_upload(text, text) to authenticated;

create or replace function public.discard_wardrobe_item(p_wardrobe_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_id uuid;
begin
  select item_id into v_item_id
  from public.wardrobe_item
  where id = p_wardrobe_item_id
    and user_id = auth.uid()
    and is_approved = false;

  if not found then
    raise exception 'wardrobe item not found or not permitted';
  end if;

  delete from public.wardrobe_item where id = p_wardrobe_item_id;
  delete from public.item where item_id = v_item_id and created_by_user_id = auth.uid();
end;
$$;

grant execute on function public.discard_wardrobe_item(uuid) to authenticated;

-- Editing after creation (approval popup Save) is a plain owner
-- update, not atomic multi-table logic, so it doesn't go through the
-- functions above and needs a real RLS policy. item's other grants
-- are the baseline's blanket `grant all ... to authenticated` (no
-- column-allowlist like "user" has), so RLS alone gates this.
create policy "item_update_own_upload" on public.item
for update to authenticated
using (created_by_user_id = (select auth.uid()))
with check (created_by_user_id = (select auth.uid()));

-- Storage bucket for original + background-removed photos. Public
-- (read requires no auth; writes stay RLS-gated below) -- matches
-- wardrobe_item.image_url already being a directly-renderable URL
-- elsewhere, and wardrobe_item.is_public already implying items are
-- meant to be shareable.
insert into storage.buckets (id, name, public)
values ('wardrobe-images', 'wardrobe-images', true)
on conflict (id) do nothing;

create policy "wardrobe_images_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'wardrobe-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "wardrobe_images_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'wardrobe-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'wardrobe-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "wardrobe_images_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'wardrobe-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
