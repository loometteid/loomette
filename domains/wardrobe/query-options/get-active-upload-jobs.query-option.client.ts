import { queryOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getLogger } from "@/lib/logging";
import type { UploadJob } from "../types";

export const getActiveUploadJobsQueryOptionsForBrowser = (
  userId: string | null | undefined,
) =>
  queryOptions({
    queryKey: ["wardrobe", "active-upload-jobs", userId] as const,
    queryFn: async (): Promise<UploadJob[]> => {
      if (!userId) return [];
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("upload_job")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        const logger = getLogger(["query", "wardrobe"]);
        logger.error("Error fetching active upload jobs: {errorMessage}", {
          errorMessage: error.message,
          error,
          userId,
        });
        return [];
      }

      const rawJobs = (data as UploadJob[]) ?? [];
      const now = Date.now();
      const STALE_JOB_THRESHOLD_MS = 60 * 1000; // 60 seconds

      return rawJobs.map((job) => {
        const isStuck =
          (job.status === "pending" || job.status === "analyzing") &&
          now - new Date(job.created_at).getTime() > STALE_JOB_THRESHOLD_MS;

        if (isStuck) {
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
      });
    },
    enabled: !!userId,
    refetchInterval: (query) => {
      const jobs = query.state.data ?? [];
      const hasActive = jobs.some(
        (job) => job.status === "pending" || job.status === "analyzing",
      );
      // Poll every 2 seconds ONLY while ANY job is in flight; 0 background traffic when idle
      return hasActive ? 2000 : false;
    },
  });
