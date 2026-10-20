import Image from "next/image";
import Link from "next/link";
import { Pencil, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col lg:flex-row gap-0 lg:gap-14 px-0 lg:px-12 py-0 lg:py-12">
      {/* Mobile Header (< lg) */}
      <div className="relative h-60 w-full lg:hidden">
        <Image
          src="/brand/sky.png"
          alt=""
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="bg-background/40 size-18 animate-pulse rounded-2xl backdrop-blur-sm" />
              <Link
                href="/profile/edit"
                prefetch
                aria-label="Edit profile"
                className="bg-background absolute -bottom-2 -left-2 flex size-7 items-center justify-center rounded-full shadow opacity-60"
              >
                <Pencil className="size-3.5" />
              </Link>
            </div>

            <div
              aria-hidden
              className="bg-secondary/90 flex size-10 items-center justify-center rounded-xl opacity-60"
            >
              <Users className="size-4" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="bg-white/40 h-3 w-20 animate-pulse rounded" />
            <div className="bg-white/50 h-6 w-36 animate-pulse rounded-md" />
            <div className="bg-white/40 h-3 w-24 animate-pulse rounded" />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar Skeleton (lg:) */}
      <aside className="hidden lg:flex flex-col items-center gap-8 w-64 shrink-0 animate-pulse">
        <div className="size-36 rounded-3xl bg-muted" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-7 w-36 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="flex flex-col w-full gap-3 pt-4">
          <div className="h-12 w-full bg-muted rounded-2xl" />
          <div className="h-12 w-full bg-muted rounded-2xl" />
        </div>
      </aside>

      <div className="hidden lg:block w-px bg-border/60 self-stretch" />

      {/* Content Area */}
      <section className="flex flex-1 flex-col w-full">
        <div className="hidden lg:flex items-center justify-end gap-3 pb-6">
          <div className="h-9 w-24 bg-muted/60 rounded-xl" />
          <div className="h-9 w-24 bg-muted/60 rounded-xl" />
          <div className="h-9 w-24 bg-muted/60 rounded-xl" />
        </div>

        <div className="border-border flex lg:hidden items-center justify-between border-b px-6 pt-5">
          {["favorite", "travels", "wishlist"].map((value, i) => (
            <span
              key={value}
              className={cn(
                "pb-3 text-sm font-medium tracking-wide uppercase",
                i === 0
                  ? "text-foreground border-foreground border-b-2"
                  : "text-muted-foreground opacity-60",
              )}
            >
              {value}
            </span>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-6 px-6 lg:px-0 py-6">
          <div className="flex gap-2">
            {["all", "wardrobe", "outfit"].map((value, i) => (
              <div
                key={value}
                className={`rounded-full border px-4 py-2 text-xs font-medium tracking-wide uppercase ${
                  i === 0
                    ? "border-foreground text-foreground border-2"
                    : "border-border text-muted-foreground opacity-60"
                }`}
              >
                {value}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="flex flex-col gap-2 p-4 border border-border/40 rounded-2xl bg-secondary/30">
                <div className="bg-muted aspect-square animate-pulse rounded-xl" />
                <div className="bg-muted h-4 w-24 animate-pulse rounded mt-2" />
                <div className="bg-muted h-3 w-12 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
