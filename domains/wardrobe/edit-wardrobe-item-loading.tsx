import { ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesktopNavFallback } from "@/components/layout/desktop-nav";

export function EditItemFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNavFallback />

      <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl flex-1 flex-col gap-6 lg:gap-10 px-6 lg:px-12 py-8 pb-32">
        {/* Top Action Bar */}
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
            aria-label="Delete item"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {/* 2-Column Responsive Layout (D.3.3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left Column: Image, Toggle, Name, Brand */}
          <div className="flex flex-col items-center gap-6">
            <div className="bg-muted mx-auto aspect-square w-52 lg:w-80 animate-pulse rounded-2xl shadow-sm" />

            <div className="bg-muted mx-auto h-8 w-44 animate-pulse rounded-full" />

            <div className="flex flex-col items-center gap-2 text-center w-full max-w-xs mx-auto">
              <div className="bg-muted h-8 lg:h-9 w-48 animate-pulse rounded-md" />
              <div className="bg-muted h-3.5 w-24 animate-pulse rounded-md" />
            </div>
          </div>

          {/* Right Column: Taxonomy Pills & Form Fields */}
          <div className="flex flex-col gap-6">
            {/* Category */}
            <div className="flex flex-col gap-2">
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
              <div className="flex flex-wrap gap-2">
                {[20, 24, 18, 22].map((width, i) => (
                  <div
                    key={i}
                    className="bg-muted h-8 animate-pulse rounded-full"
                    style={{ width: `${width * 4}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Subcategory */}
            <div className="flex flex-col gap-2">
              <div className="bg-muted h-3 w-24 animate-pulse rounded" />
              <div className="flex flex-wrap gap-2">
                {[22, 26, 20].map((width, i) => (
                  <div
                    key={i}
                    className="bg-muted h-8 animate-pulse rounded-full"
                    style={{ width: `${width * 4}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Colors */}
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

            {/* Occasion */}
            <div className="flex flex-col gap-2">
              <div className="bg-muted h-3 w-20 animate-pulse rounded" />
              <div className="flex flex-wrap gap-2">
                {[14, 16, 14, 18, 14].map((width, i) => (
                  <div
                    key={i}
                    className="bg-muted h-8 animate-pulse rounded-full"
                    style={{ width: `${width * 4}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="flex flex-col gap-2">
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
              <div className="flex flex-wrap gap-2">
                {[20, 24, 18, 20].map((width, i) => (
                  <div
                    key={i}
                    className="bg-muted h-8 animate-pulse rounded-full"
                    style={{ width: `${width * 4}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <div className="bg-muted h-3 w-10 animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
            </div>

            {/* Size */}
            <div className="flex flex-col gap-1.5">
              <div className="bg-muted h-3 w-10 animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
            </div>

            {/* Storage Location */}
            <div className="flex flex-col gap-1.5">
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
            </div>

            <Button type="button" className="w-full opacity-60" disabled>
              Save
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
