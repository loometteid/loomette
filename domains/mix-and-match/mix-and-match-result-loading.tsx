import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function MixAndMatchResultFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-12 py-6 lg:py-10">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-10 rounded-xl bg-linen opacity-60 lg:hidden mb-4 self-start"
        disabled
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-16">
        <div className="flex flex-col lg:w-1/2 lg:justify-between lg:self-stretch">
          <div className="flex items-start gap-3 lg:gap-4">
            <Sparkle className="text-foreground size-6 lg:size-8 shrink-0 mt-1 lg:mt-2" />
            <div className="flex flex-col gap-1 lg:gap-2">
              <Typography
                variant="title"
                as="h1"
                className="font-serif text-[32px] md:text-4xl lg:text-[48px] font-normal leading-tight text-foreground"
              >
                What a Match!
              </Typography>
              <div className="bg-linen-dark/50 h-5 w-64 animate-pulse rounded-md" />
            </div>
          </div>

          <div className="hidden lg:flex gap-4 mt-12 lg:mt-32">
            <div className="bg-linen h-16 flex-1 animate-pulse rounded-2xl" />
            <div className="bg-linen-dark h-16 flex-1 animate-pulse rounded-2xl" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 lg:w-1/2">
          <div className="border border-linen-dark bg-background/50 aspect-square w-full max-w-[360px] lg:max-w-[480px] animate-pulse rounded-2xl" />

          <div className="bg-linen-dark/50 h-8 w-44 animate-pulse rounded-md" />

          <div className="flex lg:hidden gap-3 w-full mt-2">
            <div className="bg-linen h-14 flex-1 animate-pulse rounded-2xl" />
            <div className="bg-linen-dark h-14 flex-1 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
