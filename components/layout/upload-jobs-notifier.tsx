"use client";

import { useUploadJobsWatcher } from "@/domains/wardrobe/hooks/use-upload-jobs-watcher";

/**
 * Headless client component mounted in authenticated app layout.
 * Listens for in-flight upload jobs across the app, displays toasts
 * with direct navigation to the approval queue, and keeps wardrobe
 * query caches fresh.
 */
export function UploadJobsNotifier({ userId }: { userId: string }) {
  useUploadJobsWatcher(userId, { showToast: true });
  return null;
}
