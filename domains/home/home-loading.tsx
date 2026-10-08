import { Sparkle } from "@/components/ui/sparkle";

export function HomeFallback() {
  return (
    <main className="w-full">
      {/* Desktop Skeleton */}
      <div className="hidden lg:grid max-w-7xl mx-auto px-12 py-8 grid-cols-2 gap-12 items-start animate-pulse">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Sparkle className="size-7 text-muted-foreground/40" />
              <div className="bg-muted h-9 w-64 rounded-md" />
            </div>
            <div className="bg-muted/60 h-4 w-48 rounded ml-10" />
          </div>

          <div className="relative flex items-center justify-center py-6">
            <div className="bg-secondary/60 h-[480px] w-72 rounded-2xl" />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          <div className="flex justify-end">
            <div className="size-10 rounded-xl bg-secondary" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-muted h-7 w-40 rounded-md" />
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-secondary row-span-2 h-56 rounded-3xl" />
              <div className="bg-secondary h-26 rounded-3xl" />
              <div className="bg-secondary h-26 rounded-3xl" />
              <div className="bg-secondary h-26 rounded-3xl" />
              <div className="bg-secondary h-26 rounded-3xl" />
            </div>
          </div>

          <div className="border border-border/80 flex flex-col gap-4 rounded-3xl p-6">
            <div className="bg-muted h-6 w-36 rounded-md" />
            <div className="bg-secondary h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="flex lg:hidden mx-auto w-full max-w-sm flex-col gap-6 px-6 py-6 animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="bg-muted size-14 rounded-2xl" />
          <div className="bg-secondary size-11 rounded-2xl" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2.5">
            <Sparkle className="text-muted-foreground/40 size-6" />
            <div className="flex flex-col gap-2">
              <div className="bg-muted h-7 w-44 rounded-md" />
              <div className="bg-muted h-7 w-32 rounded-md" />
            </div>
          </div>
          <div className="bg-muted/70 h-3.5 w-48 rounded ml-8.5" />
        </div>

        {/* Hero */}
        <div className="mx-auto h-[400px] w-64 rounded-2xl bg-secondary/60" />

        {/* Prompt Card */}
        <div className="border border-border/80 flex flex-col gap-4 rounded-3xl p-5">
          <div className="bg-muted h-5 w-36 rounded-md" />
          <div className="bg-secondary h-10 w-full rounded-2xl" />
        </div>

        {/* Preferences */}
        <div className="flex flex-col gap-4 pt-2">
          <div className="bg-muted h-6 w-36 rounded-md" />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary row-span-2 h-48 rounded-3xl" />
            <div className="bg-secondary h-22 rounded-3xl" />
            <div className="bg-secondary h-22 rounded-3xl" />
            <div className="bg-secondary h-22 rounded-3xl" />
            <div className="bg-secondary h-22 rounded-3xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
