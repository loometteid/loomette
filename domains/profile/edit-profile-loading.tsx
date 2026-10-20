import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function EditProfileFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl lg:hidden"
          disabled
          aria-label="Go back"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="hidden lg:block h-4 w-36 bg-muted rounded" />

        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-muted" />
          <div className="size-10 rounded-xl bg-muted" />
        </div>
      </div>

      <div className="h-8 w-32 bg-muted rounded-xl" />

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 pt-2">
        <div className="size-56 lg:size-64 rounded-3xl bg-muted shrink-0" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full flex-1">
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded-xl" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded-xl" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EditProfileLoading() {
  return <EditProfileFallback />;
}
