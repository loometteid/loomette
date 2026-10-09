"use client";

import { Bell } from "lucide-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getNotificationsQueryOptionsForBrowser } from "../query-options/get-notifications.query-option.client";
import { getUnreadNotificationsCountQueryOptionsForBrowser } from "../query-options/get-unread-notifications-count.query-option.client";
import { markAllNotificationsAsReadMutationOptions } from "../mutation-options/mark-all-notifications-as-read.mutation-option.client";
import { NotificationList } from "./notification-list";

export function NotificationPopover({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const { data: notifications } = useSuspenseQuery(
    getNotificationsQueryOptionsForBrowser(userId),
  );
  const { data: unreadCount } = useSuspenseQuery(
    getUnreadNotificationsCountQueryOptionsForBrowser(userId),
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

  function handleOpenChange(open: boolean) {
    if (open && unreadCount > 0) {
      markAllMutation.mutate({ userId });
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Notifications"
            className="relative bg-secondary/80 hover:bg-secondary flex size-10 items-center justify-center rounded-xl transition-colors"
          >
            <Bell className="size-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-400 ring-2 ring-background" />
            )}
          </button>
        }
      />
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-96 rounded-3xl bg-[#FAFAF7] p-6 shadow-2xl border border-border/40"
      >
        <NotificationList notifications={notifications} />
      </PopoverContent>
    </Popover>
  );
}
