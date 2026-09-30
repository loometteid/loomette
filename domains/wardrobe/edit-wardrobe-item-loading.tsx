import { ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditItemFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-8 pb-32">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          disabled
          aria-label="Go back"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          disabled
          aria-label="Delete item"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="bg-muted mx-auto aspect-square w-52 animate-pulse rounded-xl" />

      <div className="bg-muted mx-auto h-8 w-36 animate-pulse rounded-full" />

      <div className="flex flex-col items-center gap-2">
        <div className="bg-muted h-7 w-44 animate-pulse rounded-md" />
        <div className="bg-muted h-3.5 w-24 animate-pulse rounded-md" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-muted h-3 w-16 animate-pulse rounded" />
        <div className="flex flex-wrap gap-2">
          {[16, 20, 24, 20].map((width, i) => (
            <div
              key={i}
              className="bg-muted h-8 animate-pulse rounded-full"
              style={{ width: `${width * 4}px` }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-muted h-3 w-24 animate-pulse rounded" />
        <div className="flex flex-wrap gap-2">
          {[20, 24, 16].map((width, i) => (
            <div
              key={i}
              className="bg-muted h-8 animate-pulse rounded-full"
              style={{ width: `${width * 4}px` }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-muted h-3 w-12 animate-pulse rounded" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted size-8 animate-pulse rounded-full"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-muted h-3 w-20 animate-pulse rounded" />
        <div className="flex flex-wrap gap-2">
          {[12, 12, 12, 12, 12].map((width, i) => (
            <div
              key={i}
              className="bg-muted h-8 animate-pulse rounded-full"
              style={{ width: `${width * 4}px` }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-muted h-3 w-16 animate-pulse rounded" />
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

      <div className="flex flex-col gap-1.5">
        <div className="bg-muted h-3 w-10 animate-pulse rounded" />
        <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="bg-muted h-3 w-16 animate-pulse rounded" />
        <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
      </div>

      <Button type="button" className="w-full opacity-60" disabled>
        Save
      </Button>
    </main>
  );
}
