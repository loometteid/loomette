import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function NotificationsFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl opacity-60"
        disabled
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
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
        <div className="divide-border flex flex-col divide-y">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-2 ${idx > 1 ? "pt-4" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-muted size-1.5 shrink-0 animate-pulse rounded-full" />
                  <div className="bg-muted h-4 w-36 animate-pulse rounded" />
                </div>
                <div className="bg-secondary h-6 w-16 animate-pulse rounded-full" />
              </div>
              <div className="bg-muted/70 h-3 w-4/5 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-muted h-4 w-20 animate-pulse rounded" />
        <div className="divide-border flex flex-col divide-y">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-2 ${idx > 1 ? "pt-4" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="bg-muted h-4 w-40 animate-pulse rounded" />
                <div className="bg-secondary h-6 w-20 animate-pulse rounded-full" />
              </div>
              <div className="bg-muted/70 h-3 w-4/5 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
