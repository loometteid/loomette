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
        logger.error("Error fetching latest upload job: {errorMessage}", {
          errorMessage: error.message,
          error,
          userId,
        });
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
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "pending" || data.status === "analyzing")) {
        return 2000;
      }
      return false;
    },
  });
