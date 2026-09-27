import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLogger } from "@/lib/logging";
import type { OutfitResultData, ResultItem } from "../result-types";

type OutfitItemRow = {
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
};

export const getOutfitResultQueryOptionsForServer = (
  userId: string,
  outfitId: string,
) =>
  queryOptions({
    queryKey: ["mix-and-match", "result", outfitId, userId] as const,
    queryFn: async (): Promise<OutfitResultData | null> => {
      const supabase = await createServerSupabaseClient();
      const { data: outfit, error: outfitError } = await supabase
        .from("outfit")
        .select("id, name, user_id, is_saved")
        .eq("id", outfitId)
        .eq("user_id", userId)
        .single();

      if (outfitError || !outfit) {
        const logger = getLogger(["query", "mix-and-match"]);
        logger.error(
          "Error fetching outfit in getOutfitResultQueryOptionsForServer: {errorMessage}",
          {
            errorMessage: outfitError?.message ?? "Outfit not found",
            error: outfitError,
            userId,
            outfitId,
          },
        );
        return null;
      }

      const { data: rows, error: itemsError } = await supabase
        .from("outfit_item")
        .select(
          "layer_order, position_x, position_y, wardrobe_item:wardrobe_item_id(id, item:item_id(item_id, name, image_url))",
        )
        .eq("outfit_id", outfitId)
        .returns<OutfitItemRow[]>();

      if (itemsError) {
        const logger = getLogger(["query", "mix-and-match"]);
        logger.error(
          "Error fetching outfit items in getOutfitResultQueryOptionsForServer: {errorMessage}",
          {
            errorMessage: itemsError.message,
            error: itemsError,
            userId,
            outfitId,
          },
        );
        return null;
      }

      const items: ResultItem[] = (rows ?? [])
        .filter((row) => row.wardrobe_item)
        .map((row) => ({
          id: row.wardrobe_item!.id,
          name: row.wardrobe_item!.item?.name ?? null,
          image_url: row.wardrobe_item!.item?.image_url ?? null,
          x: row.position_x ?? 0.5,
          y: row.position_y ?? 0.5,
          layerOrder: row.layer_order ?? 0,
        }));

      return {
        outfit: {
          id: outfit.id,
          name: outfit.name,
          userId: outfit.user_id ?? userId,
          isSaved: outfit.is_saved ?? false,
        },
        items,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
