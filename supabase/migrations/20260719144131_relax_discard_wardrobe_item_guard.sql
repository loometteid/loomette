-- discard_wardrobe_item was written for the approval queue's "reject
-- this suggestion" action, guarded to only touch is_approved = false
-- rows. The Edit Item screen (app/wardrobe/[id]) needs the identical
-- two-table delete for *approved* items too (its trash icon). Rather
-- than add a near-duplicate function, drop the is_approved guard --
-- ownership (user_id = auth.uid()) is the only check that actually
-- matters here, regardless of approval state.
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
    and user_id = auth.uid();

  if not found then
    raise exception 'wardrobe item not found or not permitted';
  end if;

  delete from public.wardrobe_item where id = p_wardrobe_item_id;
  delete from public.item where item_id = v_item_id and created_by_user_id = auth.uid();
end;
$$;
