"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup } from "@/components/ui/dialog";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { OutfitComposition } from "@/domains/outfit/components/outfit-composition";
import { CalendarDateDialog } from "./components/calendar-date-dialog";
import { getOutfitResultQueryOptionsForBrowser } from "./query-options/get-outfit-result.query-option.client";
import { updateOutfitNameMutationOptions } from "./mutation-options/update-outfit-name.mutation-option.client";
import { addOutfitToCollectionMutationOptions } from "./mutation-options/add-outfit-to-collection.mutation-option.client";
import { addOutfitToCalendarMutationOptions } from "./mutation-options/add-outfit-to-calendar.mutation-option.client";
import { getLooksCountQueryOptionsForBrowser } from "@/domains/home/query-options/get-looks-count.query-option.client";
import { getDiaryEntriesQueryOptionsForBrowser } from "@/domains/calendar/query-options/get-diary-entries.query-option.client";

export function MixAndMatchResult({
  userId,
  outfitId,
}: {
  userId: string;
  outfitId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(
    getOutfitResultQueryOptionsForBrowser(userId, outfitId),
  );

  if (!data) {
    notFound();
  }

  const { outfit, items } = data;
  const [name, setName] = useState(outfit.name ?? "My Look");
  const [editingName, setEditingName] = useState(false);
  const [addedToCollection, setAddedToCollection] = useState(outfit.isSaved);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [calendarPickerOpen, setCalendarPickerOpen] = useState(false);

  const updateNameMutation = useMutation({
    ...updateOutfitNameMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getOutfitResultQueryOptionsForBrowser(userId, outfitId).queryKey,
      });
    },
    onError: () => {
      toast.error("Couldn't update outfit name.");
    },
  });

  const addToCollectionMutation = useMutation({
    ...addOutfitToCollectionMutationOptions(),
    onSuccess: () => {
      setAddedToCollection(true);
      setShowSuccess(true);
      void queryClient.invalidateQueries({
        queryKey: getOutfitResultQueryOptionsForBrowser(userId, outfitId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getLooksCountQueryOptionsForBrowser(userId).queryKey,
      });
    },
    onError: () => {
      toast.error("Couldn't add that to your collection.");
    },
  });

  const addToCalendarMutation = useMutation({
    ...addOutfitToCalendarMutationOptions(),
    onSuccess: (_, variables) => {
      setAddedToCalendar(true);
      setCalendarPickerOpen(false);
      setShowSuccess(true);
      const [yearStr, monthStr] = variables.wornOn.split("-");
      const entryYear = Number(yearStr);
      const entryMonth = Number(monthStr) - 1;
      void queryClient.invalidateQueries({
        queryKey: getDiaryEntriesQueryOptionsForBrowser(
          userId,
          entryYear,
          entryMonth,
        ).queryKey,
      });
    },
    onError: () => {
      toast.error("Couldn't add that to your calendar.");
    },
  });

  function commitName() {
    setEditingName(false);
    const trimmed = name.trim() || "My Look";
    setName(trimmed);
    updateNameMutation.mutate({ outfitId, name: trimmed });
  }

  function handleAddToCollection() {
    if (addedToCollection) return;
    addToCollectionMutation.mutate({ outfitId });
  }

  function handleAddToCalendar() {
    if (addedToCalendar) return;
    setCalendarPickerOpen(true);
  }

  function handleConfirmCalendarDate(selectedKey: string) {
    addToCalendarMutation.mutate({
      userId,
      outfitId,
      wornOn: selectedKey,
    });
  }

  const isMutating =
    addToCollectionMutation.isPending || addToCalendarMutation.isPending;

  return (
    <main
      className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-12 py-6 lg:py-10"
      data-testid="mix-and-match-result"
    >
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-10 rounded-xl bg-linen hover:bg-linen-dark text-foreground lg:hidden mb-4 self-start cursor-pointer"
        onClick={() => router.back()}
        aria-label="Go back"
        data-testid="mix-and-match-result__back-button"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-16">
        {/* Left Column: Title, Subtitle, Desktop Action Buttons */}
        <div className="flex flex-col lg:w-1/2 lg:justify-between lg:self-stretch">
          <div>
            <div className="flex items-start gap-3 lg:gap-4">
              <Sparkle className="text-foreground size-6 lg:size-8 shrink-0 mt-1 lg:mt-2" />
              <div className="flex flex-col gap-1 lg:gap-2">
                <Typography
                  variant="title"
                  as="h1"
                  className="font-serif text-[32px] md:text-4xl lg:text-[48px] font-normal leading-tight text-foreground"
                  data-testid="mix-and-match-result__title"
                >
                  What a Match!
                </Typography>
                <p className="font-sans text-xs md:text-sm lg:text-xl font-normal text-foreground leading-relaxed max-w-md">
                  You put this together and honestly, it works. Save it before you
                  forget.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop action buttons matching Figma D.3.4.2 */}
          <div className="hidden lg:flex gap-4 mt-12 lg:mt-32">
            <button
              type="button"
              onClick={handleAddToCollection}
              disabled={isMutating}
              data-testid="mix-and-match-result__add-collection-button"
              className="bg-linen hover:bg-linen-dark text-foreground flex-1 rounded-2xl h-14 lg:h-16 text-xs lg:text-sm font-semibold tracking-wider uppercase transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {addToCollectionMutation.isPending
                ? "Adding…"
                : addedToCollection
                  ? "Added ✓"
                  : "Add to Collection"}
            </button>
            <button
              type="button"
              onClick={handleAddToCalendar}
              disabled={isMutating}
              data-testid="mix-and-match-result__add-calendar-button"
              className="bg-primary hover:bg-primary/90 text-white flex-1 rounded-2xl h-14 lg:h-16 text-xs lg:text-sm font-semibold tracking-wider uppercase transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {addToCalendarMutation.isPending
                ? "Adding…"
                : addedToCalendar
                  ? "Added ✓"
                  : "Add to Calendar"}
            </button>
          </div>
        </div>

        {/* Right Column: Outfit preview & editable name */}
        <div className="flex flex-col items-center gap-6 lg:w-1/2">
          <OutfitComposition
            items={items}
            className="aspect-[342/480] lg:aspect-square w-full max-w-[360px] lg:max-w-[480px] rounded-2xl border border-linen-dark bg-background/50 p-2"
          />

          <div className="flex items-center justify-center gap-2 text-center w-full">
            {editingName ? (
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={commitName}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                data-testid="mix-and-match-result__name-input"
                className="font-serif text-2xl lg:text-4xl text-foreground border-stone w-full max-w-sm border-b bg-transparent text-center outline-none py-1"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                disabled={updateNameMutation.isPending}
                data-testid="mix-and-match-result__outfit-name"
                className="inline-flex items-center gap-2.5 group cursor-pointer"
              >
                <Typography
                  variant="title"
                  as="span"
                  className="text-2xl lg:text-4xl font-serif text-foreground font-normal"
                >
                  {name}
                </Typography>
                <Pencil className="text-muted-foreground size-4 lg:size-5 shrink-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Mobile action buttons matching Figma 3.4.2 */}
          <div className="flex lg:hidden gap-3 w-full mt-2">
            <button
              type="button"
              onClick={handleAddToCollection}
              disabled={isMutating}
              data-testid="mix-and-match-result__mobile-add-collection-button"
              className="bg-linen hover:bg-linen-dark text-foreground flex-1 rounded-2xl h-14 text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {addToCollectionMutation.isPending
                ? "Adding…"
                : addedToCollection
                  ? "Added ✓"
                  : "Add to Collection"}
            </button>
            <button
              type="button"
              onClick={handleAddToCalendar}
              disabled={isMutating}
              data-testid="mix-and-match-result__mobile-add-calendar-button"
              className="bg-primary hover:bg-primary/90 text-white flex-1 rounded-2xl h-14 text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {addToCalendarMutation.isPending
                ? "Adding…"
                : addedToCalendar
                  ? "Added ✓"
                  : "Add to Calendar"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal matching Figma 3.4.3 & D.3.4.3 */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogPopup
          showClose={false}
          className="max-w-md lg:max-w-2xl xl:max-w-3xl p-6 lg:p-10 relative"
          data-testid="mix-and-match-result__success-dialog"
        >
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            aria-label="Close"
            data-testid="mix-and-match-result__success-close-button"
            className="bg-linen hover:bg-linen-dark absolute top-4 right-4 flex size-10 lg:size-12 items-center justify-center rounded-xl lg:rounded-2xl transition-colors cursor-pointer text-foreground"
          >
            <X className="size-4 lg:size-5" />
          </button>

          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 py-4 lg:py-6">
            {/* Mascot Illustration from Figma image-43 */}
            <div className="relative size-36 lg:size-64 shrink-0 flex items-center justify-center">
              <Image
                src="/brand/mascot-image-43.png"
                alt="Loomette Mascot"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 144px, 256px"
              />
            </div>

            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-3 lg:gap-4 flex-1">
              <Typography
                variant="title"
                as="h2"
                className="font-serif text-2xl lg:text-4xl xl:text-5xl font-normal leading-tight text-foreground"
              >
                Logged. <span className="italic underline">Love</span> this one.
              </Typography>
              <p className="font-sans text-sm lg:text-lg text-foreground/80 font-normal">
                Your look is in.
              </p>

              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                data-testid="mix-and-match-result__stay-in-button"
                className="bg-primary hover:bg-primary/90 text-white w-full max-w-xs rounded-2xl h-12 lg:h-14 text-xs lg:text-sm font-semibold tracking-wider uppercase transition-colors mt-2 cursor-pointer shadow-sm"
              >
                Stay In
              </button>

              {!addedToCalendar && (
                <p className="text-xs lg:text-sm font-sans text-foreground/70 mt-1">
                  or add to{" "}
                  <button
                    type="button"
                    data-testid="mix-and-match-result__success-add-calendar-link"
                    onClick={() => {
                      setShowSuccess(false);
                      setCalendarPickerOpen(true);
                    }}
                    className="font-medium underline uppercase text-foreground hover:opacity-80 cursor-pointer"
                  >
                    Calendar
                  </button>
                </p>
              )}
            </div>
          </div>
        </DialogPopup>
      </Dialog>

      {/* Calendar Date Dialog matching Figma 3.4.2.1 & D.3.4.2.1 */}
      <CalendarDateDialog
        open={calendarPickerOpen}
        onOpenChange={setCalendarPickerOpen}
        onConfirm={handleConfirmCalendarDate}
        saving={addToCalendarMutation.isPending}
      />
    </main>
  );
}
