import { ChevronLeft, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditProfileFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8 pb-32">
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
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl"
            disabled
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl"
            disabled
            aria-label="Friends"
          >
            <Users className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="bg-muted size-24 animate-pulse rounded-3xl" />
        <div className="bg-muted h-7 w-32 animate-pulse rounded-md" />
      </div>

      <div className="flex flex-col gap-4">
        {[1, 2].map((idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <div className="bg-muted h-3 w-16 animate-pulse rounded" />
          <div className="flex flex-wrap gap-2">
            {[16, 16, 28, 24].map((width, i) => (
              <div
                key={i}
                className="bg-muted h-8 animate-pulse rounded-full"
                style={{ width: `${width * 4}px` }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="bg-muted h-3 w-20 animate-pulse rounded" />
          <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
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
          <div className="bg-muted h-3 w-24 animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-muted h-10 animate-pulse rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>

      <Button type="button" className="w-full opacity-60" disabled>
        Save Profile
      </Button>
    </main>
  );
}
