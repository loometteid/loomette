import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditTripFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8 pb-32">
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

      <div className="flex flex-col items-center gap-2">
        <div className="relative h-28 w-28">
          <Image
            src="/profile/koper.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div className="bg-muted h-7 w-40 animate-pulse rounded-md" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <div className="bg-muted h-3.5 w-16 animate-pulse rounded" />
            <div className="bg-muted h-9 w-full animate-pulse rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-muted h-3.5 w-16 animate-pulse rounded" />
            <div className="bg-muted h-9 w-full animate-pulse rounded-md" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-muted h-3.5 w-14 animate-pulse rounded" />
          <div className="flex flex-wrap gap-2">
            {[20, 24, 16, 20].map((width, i) => (
              <div
                key={i}
                className="bg-muted h-8 animate-pulse rounded-full"
                style={{ width: `${width * 4}px` }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-muted h-3.5 w-28 animate-pulse rounded" />
          <div className="flex flex-wrap gap-2">
            {[24, 20, 28].map((width, i) => (
              <div
                key={i}
                className="bg-muted h-8 animate-pulse rounded-full"
                style={{ width: `${width * 4}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-muted mt-6 h-10 w-full animate-pulse rounded-full" />
    </main>
  );
}
