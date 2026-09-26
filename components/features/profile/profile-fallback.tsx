import Image from "next/image";
import { Users } from "lucide-react";

export function ProfileFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col">
      <div className="relative h-60 w-full">
        <Image
          src="/brand/sky.png"
          alt=""
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="bg-background/40 size-18 animate-pulse rounded-2xl backdrop-blur-sm" />

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

      <div className="border-border flex items-center justify-between border-b px-6 pt-5">
        {["favorite", "travels", "wishlist"].map((value, i) => (
          <span
            key={value}
            className={`pb-3 text-sm font-medium tracking-wide uppercase ${
              i === 0
                ? "text-foreground border-foreground border-b-2"
                : "text-muted-foreground opacity-60"
            }`}
          >
            {value}
          </span>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 py-6">
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

        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="bg-muted aspect-square animate-pulse rounded-2xl" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-12 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
