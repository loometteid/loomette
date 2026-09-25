import { ClipboardCheck, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function WardrobeFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-center gap-2">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          Wardrobe
        </Typography>
      </div>

      <div className="flex items-center gap-2">
        <div className="border-border bg-secondary flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 opacity-60">
          <span className="text-muted-foreground w-full text-sm">Search</span>
          <Search className="text-muted-foreground size-4 shrink-0" />
        </div>
        <div
          aria-hidden
          className="border-border bg-secondary flex size-9 shrink-0 items-center justify-center rounded-lg border opacity-60"
        >
          <SlidersHorizontal className="size-4" />
        </div>
        <div
          aria-hidden
          className="border-border bg-secondary flex size-9 shrink-0 items-center justify-center rounded-lg border opacity-60"
        >
          <ClipboardCheck className="size-4" />
        </div>
      </div>

      {/* Skeletons for categories */}
      <div className="flex flex-col gap-8">
        {[1].map((idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <div className="bg-muted h-6 w-24 animate-pulse rounded-md" />
            <div className="bg-muted h-8 w-48 animate-pulse rounded-full" />
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((cardIdx) => (
                <div
                  key={cardIdx}
                  className="bg-muted aspect-square w-32 shrink-0 animate-pulse rounded-xl"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className="bg-foreground text-background fixed right-6 bottom-24 flex size-14 items-center justify-center rounded-2xl shadow-lg opacity-80"
      >
        <Plus className="size-6" />
      </div>
    </main>
  );
}
