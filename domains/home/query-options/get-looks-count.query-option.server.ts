import { queryOptions } from "@tanstack/react-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLogger } from "@/lib/logging";

export const getLooksCountQueryOptionsForServer = (userId: string) =>
  queryOptions({
    queryKey: ["outfits", "saved-count", userId] as const,
    queryFn: async (): Promise<number> => {
      const supabase = await createServerSupabaseClient();
      const { count, error } = await supabase
        .from("outfit")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_saved", true);

      if (error) {
        const logger = getLogger(["query", "outfits"]);
        logger.error(
          "Error fetching looks count in getLooksCountQueryOptionsForServer: {errorMessage}",
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
