import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";

export const getPendingWardrobeCountQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["wardrobe", "pending-count", userId] as const,
    queryFn: async (): Promise<number> => {
      const supabase = createBrowserSupabaseClient();
      const { count, error } = await supabase
        .from("wardrobe_item")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_approved", false);

      if (error) {
        const logger = getLogger(["query", "wardrobe"]);
        logger.error(
          "Error fetching pending wardrobe count in getPendingWardrobeCountQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
          },
        );
        return 0;
      }

      return count ?? 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
