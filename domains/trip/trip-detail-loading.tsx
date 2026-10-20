import Image from "next/image";
import { ChevronLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { ProfileBreadcrumb } from "@/domains/profile/components/profile-breadcrumb";

export function TripDetailFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-5xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
      {/* Breadcrumb on desktop */}
      <ProfileBreadcrumb
        items={[
          { label: "PROFILE", href: "/profile" },
          { label: "TRAVEL DETAIL" },
        ]}
      />

      {/* Mobile top navigation buttons */}
      <div className="flex items-center justify-between lg:hidden">
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

      {/* Header with suitcase and trip metadata */}
      <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-6 lg:gap-10 text-center lg:text-left pt-2 pb-4">
        <div className="relative h-36 w-36 lg:h-52 lg:w-52 shrink-0">
          <Image
            src="/profile/koper.png"
            alt=""
            fill
            className="object-contain drop-shadow-md"
          />
        </div>
        <div className="flex flex-col items-center lg:items-start gap-2">
          <div className="hidden lg:block bg-[#F2EDE5] h-7 w-28 animate-pulse rounded-full" />
          <div className="bg-muted h-9 w-44 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-28 animate-pulse rounded" />
        </div>
      </div>

      {/* Desktop Tabs Header (Pill Style) */}
      <div className="hidden lg:flex items-center justify-center gap-3">
        <div className="bg-[#F2EDE5] h-10 w-32 animate-pulse rounded-xl" />
        <div className="bg-muted/50 h-10 w-32 animate-pulse rounded-xl" />
      </div>

      {/* Mobile Tabs Header (Underline Style) */}
      <div className="border-border flex lg:hidden items-center justify-between border-b pb-3">
        <span className="border-foreground text-foreground -mb-px border-b-2 pb-3 font-sans text-xs font-normal tracking-wider uppercase">
          Outfit Plan
        </span>
        <span className="text-muted-foreground pb-3 font-sans text-xs font-normal tracking-wider uppercase opacity-60">
          Packing List
        </span>
      </div>

      {/* Timeline skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-4">
        {[1, 2].map((day) => (
          <div key={day} className="relative flex gap-4 pb-8">
            <Sparkle className="text-foreground mt-1 size-5 shrink-0 opacity-40" />
            <div className="flex flex-1 flex-col gap-4">
              <div className="bg-muted h-6 w-44 animate-pulse rounded" />
              <div className="bg-muted aspect-5/6 w-full max-w-sm animate-pulse rounded-2xl" />
              <div className="bg-muted h-10 w-36 animate-pulse rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
