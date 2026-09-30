import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";

export function OnboardingFallback({ step = 1 }: { step?: number }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
      <div className="flex items-center gap-3">
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
        <div className="bg-secondary h-1 flex-1 overflow-hidden rounded-full">
          <div
            className="bg-foreground h-full rounded-full transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Sparkle className="size-5 text-foreground" />
        <div className="bg-muted h-7 w-48 animate-pulse rounded-md" />
        <div className="bg-muted/70 h-4 w-64 animate-pulse rounded" />
      </div>

      <div className="mt-8 flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="bg-muted h-3.5 w-20 animate-pulse rounded" />
          <div className="bg-muted h-10 w-full animate-pulse rounded-md" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-muted h-3.5 w-28 animate-pulse rounded" />
          <div className="bg-muted h-10 w-full animate-pulse rounded-md" />
        </div>
      </div>

      <div className="bg-muted h-10 w-full animate-pulse rounded-full" />
    </main>
  );
}
