import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import type { WardrobeOption } from "../types";

type WardrobeRow = {
  id: string;
  item: {
    item_id: string;
    name: string | null;
    category: string | null;
    subcategory: string | null;
    image_url: string | null;
  } | null;
};

export const getMixAndMatchOptionsQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["mix-and-match", "options", userId] as const,
    queryFn: async (): Promise<WardrobeOption[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data: rows, error } = await supabase
        .from("wardrobe_item")
        .select(
          "id, item:item_id(item_id, name, category, subcategory, image_url)",
        )
        .eq("user_id", userId)
        .eq("is_approved", true)
        .returns<WardrobeRow[]>();

      if (error) {
        const logger = getLogger(["query", "mix-and-match"]);
        logger.error(
          "Error fetching mix-and-match options in getMixAndMatchOptionsQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
          },
        );
        return [];
      }

      return (rows ?? [])
        .filter((row) => row.item?.category && row.item?.subcategory)
        .map((row) => ({
          wardrobeItemId: row.id,
          itemId: row.item!.item_id,
          name: row.item!.name,
          category: row.item!.category!,
          subcategory: row.item!.subcategory!,
          image_url: row.item!.image_url,
        }));
    },
    staleTime: 1000 * 60 * 5,
  });
