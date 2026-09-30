"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

function NotificationItem({
  bullet,
  title,
  time,
  description,
  size,
  className,
}: {
  bullet?: boolean;
  title: string;
  time: string;
  description: string;
  size: "h1" | "title";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {bullet && (
            <span className="bg-foreground size-1.5 shrink-0 rounded-full" />
          )}
          <Typography variant={size} as="p">
            {title}
          </Typography>
        </div>
        <span className="bg-secondary text-muted-foreground shrink-0 rounded-full px-3 py-1.5 text-[0.65rem] font-medium tracking-wide whitespace-nowrap uppercase">
          {time}
        </span>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// Static content matching the Figma exactly -- there is no notification
// backend yet (outfit generation, upload processing, and weekly recaps
// are all still stubs elsewhere in the app), so this screen is presentational
// only, like Settings' Privacy & Policy page before it.
export function NotificationsView() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-8">
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
        <Sparkle className="text-foreground size-5" />
        <Typography variant="title" as="h1">
          Notifications
        </Typography>
      </div>

      <div className="flex flex-col gap-3">
        <Typography variant="subtitle">Today</Typography>
        <div className="divide-border flex flex-col divide-y">
          <NotificationItem
            bullet
            size="h1"
            title="Your look is ready."
            time="2 min ago"
            description="We've analyzed your outfit. Head back to review and approve the pieces."
          />
          <NotificationItem
            bullet
            size="h1"
            title="What are you wearing?"
            time="8:00 AM"
            description="Log today's look before the day slips by."
            className="pt-4"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Typography variant="subtitle">This week</Typography>
        <div className="divide-border flex flex-col divide-y">
          <NotificationItem
            size="title"
            title="Your week in looks."
            time="Mon, 23 Jun"
            description="You logged 4 outfits this week. Your most worn piece: white linen shirt."
          />
          <NotificationItem
            size="title"
            title="Something went wrong."
            time="Wed, 18 Jun"
            description="We couldn't process your upload. Try again with a clearer shot."
            className="pt-4"
          />
        </div>
      </div>
    </main>
  );
}
