import { ClipboardCheck, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function WardrobeFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-col gap-6 lg:gap-10 px-6 lg:px-12 py-8 lg:py-10">
      {/* Mobile Title */}
      <div className="flex items-center justify-center gap-2 lg:hidden">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          Wardrobe
        </Typography>
      </div>

      {/* Search and Action Bar */}
      <div className="mx-auto flex w-full max-w-2xl lg:max-w-3xl items-center gap-2 lg:gap-3">
        <div className="border-border bg-secondary flex flex-1 items-center gap-2 rounded-lg lg:rounded-xl border px-3 lg:px-4 py-2 lg:py-3 opacity-60">
          <span className="text-muted-foreground w-full text-sm lg:text-base">
            Looking for your pairs?
          </span>
          <Search className="text-muted-foreground size-4 lg:size-5 shrink-0" />
        </div>
        <div
          aria-hidden
          className="border-border bg-secondary flex size-9 lg:size-11 shrink-0 items-center justify-center rounded-lg lg:rounded-xl border opacity-60"
        >
          <SlidersHorizontal className="size-4 lg:size-5" />
        </div>
        <div
          aria-hidden
          className="border-border bg-secondary relative flex size-9 lg:size-11 shrink-0 items-center justify-center rounded-lg lg:rounded-xl border opacity-60"
        >
          <ClipboardCheck className="size-4 lg:size-5" />
        </div>
      </div>

      {/* Skeletons for Categories */}
      <div className="flex flex-col gap-10 lg:gap-14">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-4 lg:gap-6 text-center"
          >
            <div className="bg-muted h-4 lg:h-5 w-20 lg:w-28 animate-pulse rounded-md" />
            <div className="flex gap-2 justify-center">
              <div className="bg-muted h-7 lg:h-8 w-16 lg:w-20 animate-pulse rounded-full" />
              <div className="bg-muted h-7 lg:h-8 w-20 lg:w-24 animate-pulse rounded-full" />
              <div className="bg-muted h-7 lg:h-8 w-16 lg:w-20 animate-pulse rounded-full" />
            </div>
            <div className="scrollbar-none flex gap-3 lg:gap-5 -mx-6 w-full overflow-x-auto lg:mx-0 lg:flex-wrap lg:justify-center px-6 lg:px-0">
              {[1, 2, 3, 4].map((cardIdx) => (
                <div
                  key={cardIdx}
                  className="bg-muted aspect-square w-32 lg:w-40 shrink-0 animate-pulse rounded-xl"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <div
        aria-hidden
        className="fixed right-6 bottom-24 lg:right-10 lg:bottom-10 z-50 flex size-14 items-center justify-center rounded-2xl shadow-lg bg-foreground text-background opacity-80"
      >
        <Plus className="size-6" />
      </div>
    </main>
  );
}
