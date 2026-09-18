-- P0 Outfit Recognition: atomically turn validated, client-cropped AI
-- detections into pending wardrobe items. Gemini only analyzes the photo;
-- writes still happen through auth.uid() and this narrowly scoped RPC.

create or replace function public.create_wardrobe_extraction(p_items jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_entry jsonb;
  v_item_id uuid;
  v_processed_url text;
  v_category text;
  v_subcategory text;
  v_color text;
  v_created integer := 0;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a JSON array';
  end if;

  if jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 8 then
    raise exception 'p_items must contain between 1 and 8 entries';
  end if;

  for v_entry in select value from jsonb_array_elements(p_items)
  loop
    v_processed_url := nullif(btrim(v_entry ->> 'processed_url'), '');
    if v_processed_url is null
       or v_processed_url not like '%/storage/v1/object/public/wardrobe-images/'
         || v_user_id::text || '/%' then
      raise exception 'invalid processed wardrobe image URL';
    end if;

    v_category := case
      when v_entry ->> 'category' in ('Tops', 'Bottoms', 'Shoes', 'Accessories')
        then v_entry ->> 'category'
      else null
    end;

    v_subcategory := case
      when v_category = 'Tops'
        and v_entry ->> 'subcategory' in ('Shirt', 'Blouse', 'Polo', 'Dress')
        then v_entry ->> 'subcategory'
      when v_category = 'Bottoms'
        and v_entry ->> 'subcategory' in ('Skirt', 'Pants', 'Jeans')
        then v_entry ->> 'subcategory'
      when v_category = 'Shoes'
        and v_entry ->> 'subcategory' in ('Sneakers', 'Sandals', 'Heels')
        then v_entry ->> 'subcategory'
      when v_category = 'Accessories'
        and v_entry ->> 'subcategory' in ('Hijab', 'Scarf', 'Bag')
        then v_entry ->> 'subcategory'
      else null
    end;

    v_color := case
      when v_entry ->> 'color' in ('white', 'black', 'mint', 'pink', 'blue', 'red')
        then v_entry ->> 'color'
      else null
    end;

    insert into public.item (
      name,
      category,
      subcategory,
      color,
      material,
      source_type,
      image_url,
      created_by_user_id
    ) values (
      nullif(left(btrim(v_entry ->> 'name'), 120), ''),
      v_category,
      v_subcategory,
      v_color,
      nullif(left(btrim(v_entry ->> 'material'), 60), ''),
      'user_upload',
      v_processed_url,
      v_user_id
    )
    returning item_id into v_item_id;

    insert into public.wardrobe_item (
      item_id,
      user_id,
      image_url,
      is_approved
    ) values (
      v_item_id,
      v_user_id,
      v_processed_url,
      false
    );

    v_created := v_created + 1;
  end loop;

  return v_created;
end;
$$;

revoke all on function public.create_wardrobe_extraction(jsonb) from public;
grant execute on function public.create_wardrobe_extraction(jsonb) to authenticated;
