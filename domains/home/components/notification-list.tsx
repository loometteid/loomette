"use client";

import { useMemo } from "react";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { AppNotification } from "../types";

export function formatNotificationTime(createdAt: string): string {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "JUST NOW";
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);

  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)} MIN AGO`;
  }

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).toUpperCase();
}

export function NotificationList({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const { todayList, olderList } = useMemo(() => {
    const now = new Date();
    const today: AppNotification[] = [];
    const older: AppNotification[] = [];

    for (const notif of notifications) {
      const d = new Date(notif.createdAt);
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        today.push(notif);
      } else {
        older.push(notif);
      }
    }

    return { todayList: today, olderList: older };
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
        <Sparkle className="size-8 text-foreground/80" />
        <span className="font-serif text-xl font-medium text-foreground">
          No notifications yet
        </span>
        <span className="text-xs text-muted-foreground">
          You&apos;re completely caught up!
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {todayList.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
            TODAY
          </span>
          <div className="divide-border/40 flex flex-col divide-y">
            {todayList.map((item, idx) => (
              <NotificationItemRow key={item.id} item={item} isFirst={idx === 0} />
            ))}
          </div>
        </div>
      )}

      {olderList.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
            THIS WEEK
          </span>
          <div className="divide-border/40 flex flex-col divide-y">
            {olderList.map((item, idx) => (
              <NotificationItemRow key={item.id} item={item} isFirst={idx === 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItemRow({
  item,
  isFirst,
}: {
  item: AppNotification;
  isFirst: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 py-3", !isFirst && "pt-3")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {!item.isRead && (
            <span className="size-1.5 shrink-0 rounded-full bg-foreground" />
          )}
          <Typography variant="h1" as="p" className="text-base font-serif font-medium">
            {item.title}
          </Typography>
        </div>
        <span className="rounded-full bg-[#F2EDE5] px-2.5 py-1 text-[0.6rem] font-semibold tracking-wider text-muted-foreground whitespace-nowrap uppercase">
          {formatNotificationTime(item.createdAt)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
        {item.description}
      </p>
    </div>
  );
}
