import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import type { UploadJob } from "../types";

export const getLatestUploadJobQueryOptionsForBrowser = (userId: string) =>
  queryOptions({
    queryKey: ["wardrobe", "latest-upload-job", userId] as const,
    queryFn: async (): Promise<UploadJob | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("upload_job")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        const logger = getLogger(["query", "wardrobe"]);
        logger.error(
          "Error fetching latest upload job: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            userId,
          },
        );
        return null;
      }

      return (data as UploadJob) ?? null;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "pending" || data.status === "analyzing")) {
        return 2000;
      }
      return false;
    },
  });
