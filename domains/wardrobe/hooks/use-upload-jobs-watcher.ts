"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getActiveUploadJobsQueryOptionsForBrowser } from "../query-options/get-active-upload-jobs.query-option.client";
import { getPendingWardrobeItemsQueryOptionsForBrowser } from "../query-options/get-pending-items.query-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "../query-options/get-pending-count.query-option.client";
import { getWardrobeItemsQueryOptionsForBrowser } from "../query-options/get-wardrobe-items.query-option.client";
import type { UploadJob } from "../types";

export interface UseUploadJobsWatcherOptions {
  showToast?: boolean;
  onJobCompleted?: (job: UploadJob) => void;
  onJobFailed?: (job: UploadJob) => void;
}

export function useUploadJobsWatcher(
  userId: string | null | undefined,
  options: UseUploadJobsWatcherOptions = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { showToast = true, onJobCompleted, onJobFailed } = options;

  const { data: jobs = [] } = useQuery(
    getActiveUploadJobsQueryOptionsForBrowser(userId),
  );

  const prevStatusesRef = useRef<Map<string, string>>(new Map());
  const isInitializedRef = useRef(false);

  const activeJobs = jobs.filter(
    (job) => job.status === "pending" || job.status === "analyzing",
  );
  const hasActiveJobs = activeJobs.length > 0;
  const latestFailedJob =
    jobs.find((job) => job.status === "failed") ?? null;

  useEffect(() => {
    if (!userId || jobs.length === 0) return;

    // On initial mount, record current statuses so pre-existing completed jobs don't notify
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      for (const job of jobs) {
        prevStatusesRef.current.set(job.id, job.status);
      }
      return;
    }

    // Inspect job status transitions
    const isDedicatedLoadingRoute =
      pathname === "/wardrobe/loading" || pathname === "/calendar/loading";

    for (const job of jobs) {
      const prevStatus = prevStatusesRef.current.get(job.id);
      prevStatusesRef.current.set(job.id, job.status);

      // Check if job completed during this session
      if (
        (prevStatus === "pending" || prevStatus === "analyzing" || !prevStatus) &&
        job.status === "completed" &&
        prevStatus !== "completed"
      ) {
        // 1. Reactive Query Invalidation across the app
        void queryClient.invalidateQueries({
          queryKey:
            getPendingWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
        });
        void queryClient.invalidateQueries({
          queryKey:
            getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
        });
        void queryClient.invalidateQueries({
          queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
        });
        void queryClient.invalidateQueries({
          queryKey: ["wardrobe"],
        });

        onJobCompleted?.(job);

        // 2. Notify the user with action if not on dedicated loading page
        if (showToast && !isDedicatedLoadingRoute) {
          const count = job.item_count || 1;
          toast.success("Outfit analyzed!", {
            description: `${count} item${count > 1 ? "s" : ""} added to your approval queue.`,
            action: {
              label: "Review",
              onClick: () => router.push("/wardrobe/approval"),
            },
          });
        }
      }

      // Check if job failed during this session
      if (
        (prevStatus === "pending" || prevStatus === "analyzing" || !prevStatus) &&
        job.status === "failed" &&
        prevStatus !== "failed"
      ) {
        onJobFailed?.(job);

        if (showToast && !isDedicatedLoadingRoute) {
          toast.error("Couldn't analyze outfit", {
            description:
              job.error_message ||
              "We couldn't detect garments in that photo. Please try another.",
          });
        }
      }
    }
  }, [jobs, userId, pathname, queryClient, router, showToast, onJobCompleted, onJobFailed]);

  return {
    jobs,
    activeJobs,
    hasActiveJobs,
    latestFailedJob,
  };
}
