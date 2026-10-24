-- Mix & Match item resize support: persist user scale transformations on canvas
alter table public.outfit_item
  add column if not exists scale real default 1.0;
