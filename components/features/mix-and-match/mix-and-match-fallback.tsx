import { ChevronLeft, Shuffle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function MixAndMatchFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4 px-6 py-8">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkle className="text-foreground size-5" />
          <Typography variant="title" as="h1">
            Mix &amp; Match
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-secondary flex size-10 items-center justify-center rounded-xl opacity-60">
            <Trash2 className="size-4" />
          </div>
          <div className="bg-secondary flex size-10 items-center justify-center rounded-xl opacity-60">
            <Shuffle className="size-4" />
          </div>
        </div>
      </div>

      <div className="border-border bg-secondary/30 relative flex aspect-5/6 w-full items-center justify-center overflow-hidden rounded-2xl border">
        <Sparkle className="text-foreground/20 size-24 animate-pulse" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {[16, 20, 24, 18].map((width, i) => (
            <div
              key={i}
              className="bg-secondary h-8 animate-pulse rounded-full"
              style={{ width: `${width * 4}px` }}
            />
          ))}
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-muted size-16 shrink-0 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
