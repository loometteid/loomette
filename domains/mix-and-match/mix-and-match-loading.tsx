import { ChevronLeft, Shuffle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";

export function MixAndMatchFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-6 lg:gap-8 px-4 sm:px-6 lg:px-12 py-6 lg:py-10">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-10 rounded-xl bg-linen opacity-60 lg:hidden self-start"
        disabled
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 lg:gap-4">
          <Sparkle className="size-6 lg:size-8 text-foreground shrink-0" />
          <Typography
            variant="title"
            as="h1"
            className="font-serif text-[32px] md:text-4xl lg:text-[48px] font-normal leading-tight text-foreground"
          >
            Mix &amp; Match
          </Typography>
        </div>

        <div className="flex items-center gap-2.5 lg:gap-3.5">
          <div className="bg-linen flex size-10 lg:size-14 items-center justify-center rounded-xl lg:rounded-2xl opacity-60">
            <Trash2 className="size-4 lg:size-6" />
          </div>
          <div className="bg-linen flex size-10 lg:size-14 items-center justify-center rounded-xl lg:rounded-2xl opacity-60">
            <Shuffle className="size-4 lg:size-6" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 xl:gap-16 pt-2">
        {/* Canvas placeholder */}
        <div className="w-full lg:w-[480px] xl:w-[560px] shrink-0">
          <div className="border-border bg-linen/30 relative flex aspect-[316/335] lg:aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border">
            <Sparkle className="text-foreground/20 size-20 lg:size-28 animate-pulse" />
          </div>
        </div>

        {/* Picker placeholder */}
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 bg-linen lg:bg-transparent rounded-3xl p-4 sm:p-5 lg:p-0">
          <div className="flex gap-2">
            {[20, 24, 28, 22].map((width, i) => (
              <div
                key={i}
                className="bg-linen-dark/50 h-10 animate-pulse rounded-2xl"
                style={{ width: `${width * 4}px` }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((section) => (
              <div key={section} className="border-border border-b pb-4 flex flex-col gap-3">
                <div className="bg-linen-dark/40 h-5 w-28 animate-pulse rounded-md" />
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-background border border-linen-dark aspect-square w-full animate-pulse rounded-2xl"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
