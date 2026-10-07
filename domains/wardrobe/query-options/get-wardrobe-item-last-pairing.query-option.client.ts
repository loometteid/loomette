import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type LastPairingOutfit = {
  id: string;
  cover_image_url: string | null;
  items: {
    id: string;
    image_url: string | null;
    name: string | null;
    x: number;
    y: number;
    layerOrder: number;
  }[];
};

export const getWardrobeItemLastPairingQueryOptionsForBrowser = (
  wardrobeItemId: string,
) =>
  queryOptions({
    queryKey: ["wardrobe", "item", "last-pairing", wardrobeItemId] as const,
    queryFn: async (): Promise<LastPairingOutfit | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("outfit_item")
        .select(
          "outfit:outfit_id(id, cover_image_url, outfit_item(layer_order, position_x, position_y, wardrobe_item:wardrobe_item_id(id, item:item_id(item_id, name, image_url))))",
        )
        .eq("wardrobe_item_id", wardrobeItemId)
        .limit(1);

      if (error || !data || data.length === 0) return null;
      const outfit = (data[0] as any)?.outfit;
      if (!outfit) return null;

      const items = (outfit.outfit_item ?? [])
        .filter((oi: any) => oi.wardrobe_item?.item)
        .map((oi: any) => ({
          id: oi.wardrobe_item.id,
          image_url: oi.wardrobe_item.item.image_url,
          name: oi.wardrobe_item.item.name,
          x: oi.position_x ?? 0.5,
          y: oi.position_y ?? 0.5,
          layerOrder: oi.layer_order ?? 0,
        }));

      return {
        id: outfit.id,
        cover_image_url: outfit.cover_image_url,
        items,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
