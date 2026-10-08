"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Heart } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { getOutfitsByDateQueryOptionsForBrowser } from "./query-options/get-outfits-by-date.query-option.client";

function formatDisplayDate(dateKey: string) {
  const parts = dateKey.split("-").map(Number);
  if (parts.length < 3) return dateKey;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  const dayStr = String(d.getDate()).padStart(2, "0");
  const monthStr = d.toLocaleDateString("en-US", { month: "short" });
  const yearStr = d.getFullYear();
  return `${dayStr} ${monthStr} ${yearStr}`;
}

export function OutfitDetailsView({
  userId,
  date,
}: {
  userId: string;
  date: string;
}) {
  const router = useRouter();
  const { data: entries } = useSuspenseQuery(
    getOutfitsByDateQueryOptionsForBrowser(userId, date),
  );

  const [favoritedMap, setFavoritedMap] = useState<Record<string, boolean>>({});

  const formattedDate = useMemo(() => formatDisplayDate(date), [date]);

  function toggleFavorite(id: string, initial: boolean) {
    setFavoritedMap((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !initial,
    }));
  }

  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
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

      {/* Date Header */}
      <div className="flex items-center gap-3">
        <Sparkle className="size-6 text-foreground" />
        <Typography variant="title" as="h1" className="text-2xl lg:text-3xl font-serif">
          {formattedDate}
        </Typography>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Typography variant="subtitle">No outfits logged for this day yet.</Typography>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row lg:flex-wrap items-center lg:items-start justify-center gap-12 lg:gap-16 pt-4">
          {entries.map((entry, index) => {
            const outfit = entry.outfit;
            if (!outfit) return null;
            const isFav = favoritedMap[outfit.id] ?? outfit.isSaved ?? true;

            return (
              <div
                key={entry.id}
                className="flex flex-col items-center gap-4 w-full max-w-[280px]"
              >
                <div className="relative w-full aspect-5/6 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(outfit.id, isFav)}
                    aria-label="Toggle favorite"
                    className="absolute top-2 right-2 z-10 p-2 text-rose-500 hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={cn("size-5 transition-colors", isFav ? "fill-rose-500 text-rose-500" : "text-muted-foreground")}
                    />
                  </button>

                  {outfit.items.length > 0 ? (
                    <OutfitComposition
                      items={outfit.items}
                      className="h-full w-full"
                    />
                  ) : outfit.cover_image_url ? (
                    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-secondary flex items-center justify-center">
                      <Image
                        src={outfit.cover_image_url}
                        alt={outfit.name || "Outfit"}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary rounded-2xl">
                      <Typography variant="subtitle">No image</Typography>
                    </div>
                  )}
                </div>

                {/* Outfit Name */}
                <Typography variant="title" as="h2" className="text-xl font-serif text-center">
                  {outfit.name || "Chic Kinda Day"}
                </Typography>

                {/* Desktop Set Badge */}
                <div className="hidden lg:flex items-center justify-center">
                  <span className="rounded-full bg-[#F2EDE5] px-6 py-2 text-xs font-semibold uppercase tracking-wider text-[#444440]">
                    SET {index + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
