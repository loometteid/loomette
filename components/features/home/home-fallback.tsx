import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";

export function HomeFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="bg-muted size-14 animate-pulse rounded-2xl" />
        <div
          aria-hidden
          className="bg-secondary flex size-10 items-center justify-center rounded-xl opacity-60"
        >
          <Bell className="text-muted-foreground size-4" />
        </div>
      </div>

      {/* Greeting */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Sparkle className="text-foreground mt-2 size-5 shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="bg-muted h-7 w-44 animate-pulse rounded-md" />
            <div className="bg-muted h-7 w-32 animate-pulse rounded-md" />
          </div>
        </div>
        <div className="bg-muted/70 h-4 w-48 animate-pulse rounded" />
      </div>

      {/* Hero Look Carousel */}
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="text-muted-foreground/40 absolute left-0 flex size-8 shrink-0 items-center justify-center"
        >
          <ChevronLeft className="size-5" />
        </div>

        <div className="bg-secondary/60 relative h-[420px] w-[180px] animate-pulse rounded-2xl" />

        <div
          aria-hidden
          className="text-muted-foreground/40 absolute right-0 flex size-8 shrink-0 items-center justify-center"
        >
          <ChevronRight className="size-5" />
        </div>
      </div>

      {/* Prompt Card */}
      <div className="border-border flex flex-col gap-4 rounded-3xl border p-6">
        <div className="bg-muted h-6 w-36 animate-pulse rounded-md" />

        <div className="flex flex-wrap gap-2">
          <div className="border-border bg-secondary/50 h-8 w-24 animate-pulse rounded-full border" />
          <div className="border-border bg-secondary/50 h-8 w-20 animate-pulse rounded-full border" />
        </div>

        <div className="bg-secondary h-11 w-full animate-pulse rounded-full" />
      </div>

      {/* Preferences Section */}
      <div className="flex flex-col gap-4">
        <div className="bg-muted h-6 w-36 animate-pulse rounded-md" />

        <div className="grid grid-cols-2 gap-3">
          {/* Coded card (tall) */}
          <div className="bg-secondary/80 row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl p-5">
            <div className="flex flex-col gap-2">
              <div className="bg-muted h-5 w-24 animate-pulse rounded" />
              <div className="bg-muted h-5 w-16 animate-pulse rounded" />
            </div>
            <Sparkle className="text-muted/40 size-20 self-end" />
          </div>

          {/* Top card */}
          <div className="bg-secondary relative flex h-28 flex-col justify-between overflow-hidden rounded-3xl p-5 animate-pulse">
            <div className="bg-muted h-3 w-16 rounded" />
            <div className="bg-muted h-5 w-20 rounded" />
          </div>

          {/* Bottom card */}
          <div className="bg-secondary relative flex h-28 flex-col justify-between overflow-hidden rounded-3xl p-5 animate-pulse">
            <div className="bg-muted h-3 w-16 rounded" />
            <div className="bg-muted h-5 w-20 rounded" />
          </div>

          {/* Wardrobe count card */}
          <div className="border-border flex flex-col justify-between gap-6 rounded-3xl border p-5">
            <div className="flex gap-1">
              <Sparkle className="text-muted-foreground size-4" />
              <Sparkle className="text-muted-foreground size-4" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="bg-muted h-2.5 w-24 animate-pulse rounded" />
              <div className="bg-muted h-6 w-16 animate-pulse rounded" />
            </div>
          </div>

          {/* Looks count card */}
          <div className="bg-secondary relative flex flex-col justify-between overflow-hidden rounded-3xl p-5">
            <div className="flex flex-col gap-1.5">
              <div className="bg-muted h-2.5 w-20 animate-pulse rounded" />
              <div className="bg-muted h-6 w-12 animate-pulse rounded" />
            </div>
            <Sparkle className="text-muted/40 absolute -right-2 -bottom-2 size-16" />
          </div>
        </div>
      </div>
    </main>
  );
}
