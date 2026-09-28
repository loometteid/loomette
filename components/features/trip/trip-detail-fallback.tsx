import Image from "next/image";
import { ChevronLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";

export function TripDetailFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
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
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl opacity-60"
          disabled
          aria-label="Edit trip"
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="relative h-28 w-28">
          <Image
            src="/profile/koper.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div className="bg-muted h-7 w-36 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-20 animate-pulse rounded" />
      </div>

      <div className="border-border flex items-center justify-between border-b">
        <span className="border-foreground text-foreground -mb-px border-b-2 pb-3 text-xs font-medium tracking-wide uppercase">
          Outfit Plan
        </span>
        <span className="text-muted-foreground pb-3 text-xs font-medium tracking-wide uppercase opacity-60">
          Packing List
        </span>
      </div>

      <div className="flex flex-col">
        <div className="relative flex gap-4 pb-8">
          <Sparkle className="text-foreground mt-1 size-5 shrink-0" />
          <div className="flex flex-1 flex-col gap-4">
            <div className="bg-muted h-5 w-32 animate-pulse rounded" />
            <div className="bg-muted aspect-5/6 w-full animate-pulse rounded-2xl" />
            <div className="bg-muted h-9 w-28 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
