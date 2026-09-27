import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function MixAndMatchResultFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
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

      <div className="flex items-center gap-2">
        <Sparkle className="text-foreground size-5" />
        <Typography variant="title" as="h1">
          What a Match!
        </Typography>
      </div>

      <div className="border-border bg-muted/40 aspect-5/6 w-full animate-pulse rounded-2xl border" />

      <div className="flex items-center justify-center gap-2">
        <div className="bg-muted h-7 w-32 animate-pulse rounded-md" />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1 opacity-60"
          disabled
        >
          Add to Collection
        </Button>
        <Button type="button" className="flex-1 opacity-60" disabled>
          Add to Calendar
        </Button>
      </div>
    </main>
  );
}
