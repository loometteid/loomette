import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MixAndMatchResultFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
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

      <div className="bg-muted aspect-5/6 w-full animate-pulse rounded-2xl" />

      <div className="flex items-center justify-center">
        <div className="bg-muted h-7 w-40 animate-pulse rounded-md" />
      </div>

      <div className="flex gap-3">
        <div className="bg-secondary h-11 flex-1 animate-pulse rounded-full" />
        <div className="bg-foreground/80 h-11 flex-1 animate-pulse rounded-full" />
      </div>
    </main>
  );
}
