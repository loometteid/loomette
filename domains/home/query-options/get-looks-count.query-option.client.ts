import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";

export const getLooksCountQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["outfits", "saved-count", userId] as const,
    queryFn: async (): Promise<number> => {
      const supabase = createBrowserSupabaseClient();
      const { count, error } = await supabase
        .from("outfit")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_saved", true);

      if (error) {
        const logger = getLogger(["query", "outfits"]);
        logger.error(
          "Error fetching looks count in getLooksCountQueryOptionsForBrowser: {errorMessage}",
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
