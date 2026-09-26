import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function SettingsFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        disabled
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title" as="h1">
            Settings
          </Typography>
        </div>
        <Typography variant="subtitle">
          Manage how the app works for you.
        </Typography>
      </div>

      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((sectionIdx) => (
          <div key={sectionIdx} className="flex flex-col gap-3">
            <div className="bg-muted h-4 w-28 animate-pulse rounded" />
            <div className="flex flex-col gap-4">
              {[1, 2].map((rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex items-center justify-between"
                >
                  <div className="bg-muted h-3.5 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-5 w-9 animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
