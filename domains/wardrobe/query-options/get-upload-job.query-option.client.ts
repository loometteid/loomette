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

      const job = (data as UploadJob) ?? null;
      if (!job) return null;

      const now = Date.now();
      const STALE_JOB_THRESHOLD_MS = 60 * 1000; // 60 seconds
      if (
        (job.status === "pending" || job.status === "analyzing") &&
        now - new Date(job.created_at).getTime() > STALE_JOB_THRESHOLD_MS
      ) {
        void supabase
          .from("upload_job")
          .update({
            status: "failed",
            error_message:
              "Outfit processing timed out. Please try again with a clearer photo.",
          })
          .eq("id", job.id);

        return {
          ...job,
          status: "failed",
          error_message:
            "Outfit processing timed out. Please try again with a clearer photo.",
        };
      }

      return job;
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
