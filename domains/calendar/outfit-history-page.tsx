"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Heart, SlidersHorizontal } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { getAllOutfitsQueryOptionsForBrowser } from "./query-options/get-all-outfits.query-option.client";

type SortOption = "newest" | "most_worn";

function formatTimestamp(isoString: string) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "19/05/26 18.00";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}.${minutes}`;
}

export function OutfitHistoryView({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: outfits } = useSuspenseQuery(
    getAllOutfitsQueryOptionsForBrowser(userId),
  );

  const [sort, setSort] = useState<SortOption>("newest");
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});

  const sortedOutfits = useMemo(() => {
    return [...outfits].sort((a, b) => {
      if (sort === "most_worn") {
        return b.wearCount - a.wearCount;
      }
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
  }, [outfits, sort]);

  function toggleFavorite(id: string, initial: boolean) {
    setFavoriteMap((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !initial,
    }));
  }

  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl flex-1 flex-col gap-6 lg:gap-8 px-6 lg:px-12 py-8 lg:py-12">
      {/* Mobile Back Button */}
      <div className="flex items-center lg:hidden">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Sparkle className="size-6 text-foreground shrink-0 mt-1" />
          <Typography variant="title" as="h1" className="text-2xl lg:text-3xl font-serif">
            Your looks, all of them.
          </Typography>
        </div>
        <span className="text-[0.65rem] lg:text-xs font-semibold tracking-wider text-muted-foreground uppercase pl-9">
          {outfits.length} OUTFITS COLLECTION SO FAR.
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSort("newest")}
          className={cn(
            "rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors",
            sort === "newest"
              ? "border-foreground bg-transparent text-foreground"
              : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
          )}
        >
          Newest First
        </button>
        <button
          type="button"
          onClick={() => setSort("most_worn")}
          className={cn(
            "rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors",
            sort === "most_worn"
              ? "border-foreground bg-transparent text-foreground"
              : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
          )}
        >
          Most Worn
        </button>
        <button
          type="button"
          aria-label="Filter"
          className="bg-secondary/70 flex size-10 items-center justify-center rounded-xl text-foreground hover:bg-secondary transition-colors"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      {/* Outfits Grid */}
      {sortedOutfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Typography variant="subtitle">No saved outfits in your collection yet.</Typography>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pt-2">
          {sortedOutfits.map((outfit) => {
            const isFav = favoriteMap[outfit.id] ?? outfit.isSaved;

            return (
              <div
                key={outfit.id}
                className="group relative flex flex-col items-center justify-between rounded-3xl border border-border p-4 bg-background transition-shadow hover:shadow-md aspect-3/4"
              >
                <button
                  type="button"
                  onClick={() => toggleFavorite(outfit.id, isFav)}
                  aria-label="Favorite"
                  className="absolute top-3 right-3 z-10 p-1 text-rose-500 hover:scale-110 transition-transform"
                >
                  <Heart
                    className={cn(
                      "size-4 transition-colors",
                      isFav ? "fill-rose-500 text-rose-500" : "text-muted-foreground/50",
                    )}
                  />
                </button>

                <div className="relative w-full flex-1 flex items-center justify-center my-2">
                  {outfit.items.length > 0 ? (
                    <OutfitComposition
                      items={outfit.items}
                      className="h-full w-full"
                    />
                  ) : outfit.coverImageUrl ? (
                    <div className="relative h-full w-full overflow-hidden rounded-xl bg-secondary flex items-center justify-center">
                      <Image
                        src={outfit.coverImageUrl}
                        alt={outfit.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Typography variant="subtitle">No preview</Typography>
                    </div>
                  )}
                </div>

                <span className="text-[0.6rem] font-medium tracking-wide text-muted-foreground/60 whitespace-nowrap">
                  {formatTimestamp(outfit.addedAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
