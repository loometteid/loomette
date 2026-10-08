"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { getWardrobeItemsQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-wardrobe-items.query-option.client";
import { saveOutfitMutationOptions } from "@/domains/mix-and-match/mutation-options/save-outfit.mutation-option.client";
import { addOutfitToCollectionMutationOptions } from "@/domains/mix-and-match/mutation-options/add-outfit-to-collection.mutation-option.client";
import { addOutfitToCalendarMutationOptions } from "@/domains/mix-and-match/mutation-options/add-outfit-to-calendar.mutation-option.client";
import { getAllOutfitsQueryOptionsForBrowser } from "@/domains/calendar/query-options/get-all-outfits.query-option.client";
import { getLooksCountQueryOptionsForBrowser } from "@/domains/home/query-options/get-looks-count.query-option.client";
import { RecommendationCalendarDialog } from "./components/recommendation-calendar-dialog";
import { LoggedSuccessDialog } from "./components/logged-success-dialog";
import { generateRandomRecommendations } from "./recommendation";
import type { CanvasItem } from "@/domains/mix-and-match/types";

export function RecommendationPageView({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: wardrobeItems } = useSuspenseQuery(
    getWardrobeItemsQueryOptionsForBrowser(userId),
  );

  const recommendation = useMemo(() => {
    return generateRandomRecommendations(wardrobeItems, 0);
  }, [wardrobeItems]);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loggedOpen, setLoggedOpen] = useState(false);
  const [createdOutfitId, setCreatedOutfitId] = useState<string | null>(null);

  const saveOutfitMutation = useMutation(saveOutfitMutationOptions());
  const addToCollectionMutation = useMutation(addOutfitToCollectionMutationOptions());
  const addToCalendarMutation = useMutation(addOutfitToCalendarMutationOptions());

  async function ensureOutfitSaved(): Promise<string> {
    if (createdOutfitId) return createdOutfitId;
    const canvasItems: CanvasItem[] = recommendation.pieces.map((p) => ({
      wardrobeItemId: p.wardrobeItemId ?? p.id,
      itemId: p.id,
      name: p.name,
      image_url: p.imageUrl,
      x: p.x,
      y: p.y,
      layerOrder: p.layerOrder,
    }));

    try {
      const res = await saveOutfitMutation.mutateAsync({
        userId,
        items: canvasItems,
      });
      setCreatedOutfitId(res.outfitId);
      return res.outfitId;
    } catch {
      const fallbackId = `outfit-${Date.now()}`;
      setCreatedOutfitId(fallbackId);
      return fallbackId;
    }
  }

  async function handleAddToCollection() {
    try {
      const outfitId = await ensureOutfitSaved();
      try {
        await addToCollectionMutation.mutateAsync({ outfitId });
      } catch {
        // Ignored
      }
      void queryClient.invalidateQueries({
        queryKey: getAllOutfitsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getLooksCountQueryOptionsForBrowser(userId).queryKey,
      });
      setLoggedOpen(true);
    } catch {
      toast.error("Couldn't add to collection.");
    }
  }

  function handleOpenCalendar() {
    setCalendarOpen(true);
  }

  async function handleConfirmCalendarDate(selectedKey: string) {
    try {
      const outfitId = await ensureOutfitSaved();
      try {
        await addToCalendarMutation.mutateAsync({
          userId,
          outfitId,
          wornOn: selectedKey,
        });
      } catch {
        // Ignored
      }
      setCalendarOpen(false);
      router.push(`/calendar/outfits/${selectedKey}`);
    } catch {
      toast.error("Couldn't add to calendar.");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
      {/* Back Button */}
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

      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkle className="size-6 text-foreground" />
        <Typography variant="title" as="h1" className="text-2xl font-serif">
          <em className="italic underline">Outfit</em> Recommendation
        </Typography>
      </div>

      {/* Hero Outfit */}
      <div className="relative mx-auto h-96 w-64 flex items-center justify-center my-2">
        <OutfitComposition
          items={recommendation.compositionItems}
          className="h-full w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full">
        <button
          type="button"
          onClick={handleAddToCollection}
          disabled={saveOutfitMutation.isPending || addToCollectionMutation.isPending}
          className="flex-1 rounded-full bg-[#F2EDE5] py-3.5 text-xs font-semibold tracking-wider text-[#3B3A36] uppercase hover:bg-[#EAE4DC] transition-colors disabled:opacity-60"
        >
          Add to Collection
        </button>
        <button
          type="button"
          onClick={handleOpenCalendar}
          disabled={saveOutfitMutation.isPending}
          className="flex-1 rounded-full bg-[#3B3A36] py-3.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black transition-colors disabled:opacity-60"
        >
          Add to Calendar
        </button>
      </div>

      {/* Wardrobe Detail List */}
      <div className="flex flex-col gap-3 pt-4">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          WARDROBE DETAIL
        </span>

        <div className="grid grid-cols-2 gap-3">
          {recommendation.pieces.slice(0, 3).map((piece) => (
            <div
              key={piece.id}
              className="relative flex flex-col items-center justify-between rounded-2xl border border-border bg-white/70 p-4 text-center aspect-square"
            >
              {piece.badgeText.includes("#1") && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#F2EDE5] px-2.5 py-0.5 text-[0.55rem] font-semibold tracking-wider text-[#3B3A36] uppercase whitespace-nowrap">
                  {piece.badgeText}
                </span>
              )}

              <div className="relative size-20 aspect-square my-auto">
                <Image
                  src={piece.imageUrl}
                  alt={piece.name}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col gap-0.5 w-full">
                <Typography variant="title" as="p" className="text-sm font-serif truncate">
                  {piece.name}
                </Typography>
                {piece.discountPrice ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs">
                    {piece.originalPrice && (
                      <span className="text-muted-foreground/60 line-through text-[0.65rem]">
                        {piece.originalPrice}
                      </span>
                    )}
                    <span className="font-semibold text-foreground text-xs">
                      {piece.discountPrice}
                    </span>
                  </div>
                ) : (
                  <span className="text-[0.6rem] font-medium tracking-wider text-muted-foreground uppercase">
                    {piece.badgeText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RecommendationCalendarDialog
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        onConfirm={handleConfirmCalendarDate}
        onOpenCollection={handleAddToCollection}
        saving={addToCalendarMutation.isPending}
      />

      <LoggedSuccessDialog
        open={loggedOpen}
        onOpenChange={setLoggedOpen}
        onOpenCalendar={handleOpenCalendar}
      />
    </main>
  );
}
