-- Mix & Match (3.4.1-3.4.3): a free-form canvas where the user places
-- wardrobe items anywhere and moves them around, not a fixed template.
-- outfit_item already modeled "which wardrobe items make up this
-- outfit" with layer_order for stacking -- it just had nowhere to put
-- where on the canvas each item sits. Adding that here rather than a
-- new table, since outfit_item is otherwise exactly the right shape.
--
-- Positions are normalized fractions (0-1) of canvas width/height, not
-- pixels, so a saved composition still renders correctly regardless of
-- the viewport it's redrawn in later (e.g. the 3.4.2 result screen).
alter table public.outfit_item
  add column position_x real,
  add column position_y real;

-- 3.4.2's "Chic Kinda Day" editable outfit name has no existing column
-- to live in -- occasion is a different concept (categorization, not a
-- display name) and is left alone.
alter table public.outfit
  add column name text;
