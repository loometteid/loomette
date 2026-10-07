import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import type { UploadJob } from "../types";

export const getUploadJobQueryOptionsForBrowser = (jobId: string | null) =>
  queryOptions({
    queryKey: ["wardrobe", "upload-job", jobId] as const,
    queryFn: async (): Promise<UploadJob | null> => {
      if (!jobId) return null;
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("upload_job")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (error) {
        const logger = getLogger(["query", "wardrobe"]);
        logger.error(
          "Error fetching upload job in getUploadJobQueryOptionsForBrowser: {errorMessage}",
          {
            errorMessage: error.message,
            error,
            jobId,
          },
        );
        return null;
      }

      return (data as UploadJob) ?? null;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "completed" || data.status === "failed")) {
        return false;
      }
      return 1500; // Poll every 1.5s while pending/analyzing
    },
  });
