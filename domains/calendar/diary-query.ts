import type { DiaryEntry } from "./types";

// Shared between the server-rendered initial load (app/(app)/calendar/
// page.tsx) and the client-side month-switch fetch (calendar-view.tsx)
// -- both need the exact same shape: not just a single representative
// cover_image_url, but every outfit_item (position + layer_order) so
// the full saved composition can be redrawn, not a single garment.
export const DIARY_ENTRY_SELECT =
  "id, worn_on, outfit:outfit_id(id, cover_image_url, outfit_item(layer_order, position_x, position_y, wardrobe_item:wardrobe_item_id(id, item:item_id(item_id, name, image_url))))";

export type RawDiaryRow = {
  id: string;
  worn_on: string;
  outfit: {
    id: string;
    cover_image_url: string | null;
    outfit_item:
      | {
          layer_order: number | null;
          position_x: number | null;
          position_y: number | null;
          wardrobe_item: {
            id: string;
            item: {
              item_id: string;
              name: string | null;
              image_url: string | null;
            } | null;
          } | null;
        }[]
      | null;
  } | null;
};

// outfit_item is the source of truth whenever it has rows (every Mix &
// Match outfit) -- cover_image_url is carried through only as a
// fallback for the separate photo-upload diary flow, which has no
// outfit_item rows at all. Callers (CalendarGrid, OutfitEntryDialog)
// must check `items.length` first and only fall back to
// cover_image_url when it's empty, never the other way around.
export function toDiaryEntries(rows: RawDiaryRow[]): DiaryEntry[] {
  return rows.map((row) => ({
    id: row.id,
    worn_on: row.worn_on,
    outfit: row.outfit && {
      id: row.outfit.id,
      cover_image_url: row.outfit.cover_image_url,
      items: (row.outfit.outfit_item ?? [])
        .filter((outfitItem) => outfitItem.wardrobe_item?.item)
        .map((outfitItem) => ({
          id: outfitItem.wardrobe_item!.id,
          image_url: outfitItem.wardrobe_item!.item!.image_url,
          name: outfitItem.wardrobe_item!.item!.name,
          x: outfitItem.position_x ?? 0.5,
          y: outfitItem.position_y ?? 0.5,
          layerOrder: outfitItem.layer_order ?? 0,
        })),
    },
  }));
}
