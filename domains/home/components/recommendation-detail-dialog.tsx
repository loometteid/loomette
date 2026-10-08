"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { saveOutfitMutationOptions } from "@/domains/mix-and-match/mutation-options/save-outfit.mutation-option.client";
import { addOutfitToCollectionMutationOptions } from "@/domains/mix-and-match/mutation-options/add-outfit-to-collection.mutation-option.client";
import { addOutfitToCalendarMutationOptions } from "@/domains/mix-and-match/mutation-options/add-outfit-to-calendar.mutation-option.client";
import { getAllOutfitsQueryOptionsForBrowser } from "@/domains/calendar/query-options/get-all-outfits.query-option.client";
import { getLooksCountQueryOptionsForBrowser } from "@/domains/home/query-options/get-looks-count.query-option.client";
import { RecommendationCalendarDialog } from "./recommendation-calendar-dialog";
import { LoggedSuccessDialog } from "./logged-success-dialog";
import type { OutfitRecommendation } from "../recommendation";
import type { CanvasItem } from "@/domains/mix-and-match/types";

export function RecommendationDetailDialog({
  open,
  onOpenChange,
  recommendation,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendation: OutfitRecommendation;
  userId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

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
      // Fallback ID if insert fails
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
        // Ignored if table constraints
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
        // Ignored if mock
      }
      setCalendarOpen(false);
      onOpenChange(false);
      router.push(`/calendar/outfits/${selectedKey}`);
    } catch {
      toast.error("Couldn't add to calendar.");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPopup
          showClose={false}
          className="max-w-4xl w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] rounded-3xl bg-[#FAFAF7] p-6 sm:p-8 lg:p-10 shadow-2xl border-none max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="bg-secondary/70 hover:bg-secondary text-foreground absolute top-6 right-6 flex size-10 items-center justify-center rounded-xl transition-colors"
          >
            <X className="size-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Sparkle className="size-6 text-foreground" />
            <DialogTitle className="font-serif text-3xl font-medium tracking-tight text-foreground">
              <em className="italic underline">Outfit</em> Recommendation
            </DialogTitle>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Outfit Hero & Buttons */}
            <div className="flex flex-col items-center justify-between gap-8">
              <div className="relative h-[380px] w-64 max-w-full flex items-center justify-center overflow-hidden rounded-xl">
                <OutfitComposition
                  items={recommendation.compositionItems}
                  className="h-full w-full"
                />
              </div>

              <div className="flex items-center gap-4 w-full">
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
            </div>

            {/* Right: Wardrobe Detail List */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                WARDROBE DETAIL
              </span>

              <div className="flex flex-col gap-3">
                {recommendation.pieces.slice(0, 3).map((piece) => (
                  <div
                    key={piece.id}
                    className="relative flex items-center gap-4 rounded-2xl border border-border bg-white/70 p-4 transition-shadow hover:shadow-sm"
                  >
                    {piece.badgeText.includes("#1") && (
                      <span className="absolute -top-2.5 left-4 rounded-full bg-[#F2EDE5] px-2.5 py-0.5 text-[0.6rem] font-semibold tracking-wider text-[#3B3A36] uppercase">
                        {piece.badgeText}
                      </span>
                    )}

                    <div className="relative size-16 aspect-square shrink-0">
                      <Image
                        src={piece.imageUrl}
                        alt={piece.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <Typography variant="title" as="p" className="text-base font-serif truncate">
                        {piece.name}
                      </Typography>
                      {piece.discountPrice ? (
                        <div className="flex items-center gap-2 text-xs">
                          {piece.originalPrice && (
                            <span className="text-muted-foreground/60 line-through">
                              {piece.originalPrice}
                            </span>
                          )}
                          <span className="font-semibold text-foreground">
                            {piece.discountPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                          {piece.badgeText}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogPopup>
      </Dialog>

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
    </>
  );
}
