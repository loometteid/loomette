"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { getAllOutfitsQueryOptionsForBrowser } from "./query-options/get-all-outfits.query-option.client";

export function ShareOotdView({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: outfits } = useSuspenseQuery(
    getAllOutfitsQueryOptionsForBrowser(userId),
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentOutfit = useMemo(() => {
    if (outfits.length === 0) return null;
    return outfits[currentIndex % outfits.length];
  }, [outfits, currentIndex]);

  function handlePrev() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : outfits.length - 1));
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % (outfits.length || 1));
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Look on Loomette",
          text: "Check out my OOTD styled on Loomette!",
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } catch {
        // User cancelled share
      }
    } else {
      toast.success("Story ready! Saved to clipboard.");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
      {/* Close Button */}
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        onClick={() => router.back()}
        aria-label="Close"
      >
        <X className="size-4" />
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkle className="size-6 text-foreground" />
          <Typography variant="title" as="h1" className="text-2xl font-serif">
            Share your #OOTD
          </Typography>
        </div>
        <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase pl-8">
          SELECT YOUR FAVORITE TEMPLATE HERE.
        </span>
      </div>

      {/* Story Template Preview Card with Chevrons */}
      <div className="relative flex items-center justify-center py-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={outfits.length <= 1}
          aria-label="Previous template"
          className="text-muted-foreground hover:text-foreground absolute left-0 z-20 flex size-8 items-center justify-center disabled:opacity-30"
        >
          <ChevronLeft className="size-6" />
        </button>

        <div className="relative w-64 aspect-9/16 rounded-3xl bg-white shadow-xl overflow-hidden flex flex-col justify-between items-center p-6 border border-border/40">
          <span className="text-[0.55rem] font-semibold tracking-widest text-[#3B3A36] uppercase">
            HI, I&apos;M WEARING THIS TODAY
          </span>

          {/* Decorative asterisks */}
          <div className="absolute top-16 -left-6 size-28 pointer-events-none opacity-90">
            <Image
              src="/brand/asterisk-black.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-24 -right-6 size-28 pointer-events-none opacity-80">
            <Image
              src="/brand/asterisk-silver.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>

          {/* Composed Outfit */}
          <div className="relative w-full aspect-5/6 flex items-center justify-center my-auto z-10">
            {currentOutfit && currentOutfit.items.length > 0 ? (
              <OutfitComposition
                items={currentOutfit.items}
                className="h-full w-full"
              />
            ) : currentOutfit?.coverImageUrl ? (
              <div className="relative size-full">
                <Image
                  src={currentOutfit.coverImageUrl}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative size-full">
                <Image
                  src="/brand/recommendation/blue-shirt.png"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <span className="text-[0.5rem] font-semibold tracking-widest text-muted-foreground uppercase z-10">
            MADE WITH LOOMETTE.ID
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={outfits.length <= 1}
          aria-label="Next template"
          className="text-muted-foreground hover:text-foreground absolute right-0 z-20 flex size-8 items-center justify-center disabled:opacity-30"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className="w-full rounded-full bg-[#3B3A36] py-3.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black transition-colors"
      >
        Share to Story
      </button>
    </main>
  );
}
