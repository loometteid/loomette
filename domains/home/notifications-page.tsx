"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { getNotificationsQueryOptionsForBrowser } from "./query-options/get-notifications.query-option.client";
import { getUnreadNotificationsCountQueryOptionsForBrowser } from "./query-options/get-unread-notifications-count.query-option.client";
import { markAllNotificationsAsReadMutationOptions } from "./mutation-options/mark-all-notifications-as-read.mutation-option.client";
import { NotificationList } from "./components/notification-list";

export function NotificationsView({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications } = useSuspenseQuery(
    getNotificationsQueryOptionsForBrowser(userId),
  );

  const markAllMutation = useMutation({
    ...markAllNotificationsAsReadMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getUnreadNotificationsCountQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getNotificationsQueryOptionsForBrowser(userId).queryKey,
      });
    },
  });

  useEffect(() => {
    markAllMutation.mutate({ userId });
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Sparkle className="text-foreground size-6" />
        <Typography variant="title" as="h1" className="text-2xl font-serif">
          Notifications
        </Typography>
      </div>

      <NotificationList notifications={notifications} />
    </main>
  );
}
