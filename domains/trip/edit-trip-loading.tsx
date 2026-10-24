import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileBreadcrumb } from "@/domains/profile/components/profile-breadcrumb";

export function EditTripFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-5xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
      {/* Top Bar with Breadcrumb and Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl lg:hidden opacity-60"
            disabled
            aria-label="Go back"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <ProfileBreadcrumb
            items={[
              { label: "PROFILE", href: "/profile" },
              { label: "TRAVEL DETAIL" },
              { label: "EDIT TRAVEL" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 pt-2">
        {/* Left Column: Suitcase and Trip Name Skeleton */}
        <div className="flex flex-col items-center gap-4 text-center w-full lg:w-72 shrink-0">
          <div className="relative h-44 w-44 lg:h-64 lg:w-64">
            <Image
              src="/profile/koper.png"
              alt=""
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
          <div className="bg-muted h-10 w-48 animate-pulse rounded-md" />
        </div>

        {/* Right Column: Form Fields Skeleton */}
        <div className="flex flex-1 flex-col gap-6 w-full max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="bg-muted h-3.5 w-16 animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="bg-muted h-3.5 w-16 animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded-xl" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-muted h-3.5 w-14 animate-pulse rounded" />
            <div className="flex flex-wrap gap-2">
              {[20, 24, 16, 20].map((width, i) => (
                <div
                  key={i}
                  className="bg-muted h-9 animate-pulse rounded-full"
                  style={{ width: `${width * 4}px` }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-muted h-3.5 w-28 animate-pulse rounded" />
            <div className="flex flex-wrap gap-2">
              {[24, 20, 28, 22].map((width, i) => (
                <div
                  key={i}
                  className="bg-muted h-9 animate-pulse rounded-full"
                  style={{ width: `${width * 4}px` }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <div className="bg-muted h-12 w-full animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
