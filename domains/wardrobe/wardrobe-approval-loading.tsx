import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { DesktopNavFallback } from "@/components/layout/desktop-nav";

export function ApprovalFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNavFallback />

      <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl flex-1 flex-col px-6 py-8 pb-32 lg:pb-16">
        {/* Mobile Back Button */}
        <div className="flex items-center lg:hidden">
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
        </div>

        {/* Title Header */}
        <div className="mt-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkle className="size-6 text-foreground" />
            <Typography variant="title" as="h1" className="text-3xl font-serif">
              We found these pieces.
            </Typography>
          </div>
          <p className="text-muted-foreground text-[0.68rem] font-medium uppercase tracking-widest">
            Select what to add to your wardrobe.
          </p>
        </div>

        {/* Responsive Grid Skeletons (4 cols on lg) */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-3xl border border-border/60 bg-white/40 p-3 text-left"
            >
              <div className="flex items-center justify-end w-full">
                <div className="bg-muted size-5 animate-pulse rounded" />
              </div>
              <div className="bg-muted aspect-square w-full rounded-2xl animate-pulse mt-2" />
              <div className="mt-3 flex flex-col gap-1.5">
                <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
                <div className="flex gap-1.5 mt-1">
                  <div className="bg-muted h-5 w-12 animate-pulse rounded-md" />
                  <div className="bg-muted h-5 w-14 animate-pulse rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-4 mt-8">
          <div className="bg-muted h-12 w-36 animate-pulse rounded-2xl" />
          <div className="bg-muted h-12 w-28 animate-pulse rounded-2xl" />
        </div>

        {/* Mobile Fixed Bottom Action Bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/40 bg-background/95 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-12 flex-1 animate-pulse rounded-full" />
            <div className="bg-muted size-12 animate-pulse rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
