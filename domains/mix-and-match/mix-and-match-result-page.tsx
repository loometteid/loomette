"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
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
        queryKey: getOutfitResultQueryOptionsForBrowser(userId, outfitId)
          .queryKey,
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
        queryKey: getOutfitResultQueryOptionsForBrowser(userId, outfitId)
          .queryKey,
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
    <main className="mx-auto flex w-full max-w-sm lg:max-w-5xl xl:max-w-6xl flex-1 flex-col px-6 py-6 lg:py-12">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl lg:hidden mb-4 self-start"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-16">
        {/* Left Column: Title, Subtitle, Desktop Buttons */}
        <div className="flex flex-col lg:w-1/2 lg:justify-between lg:self-stretch">
          <div>
            <div className="flex items-start gap-2.5 lg:gap-3.5">
              <Sparkle className="text-[#444440] size-6 lg:size-8 shrink-0 mt-1" />
              <div className="flex flex-col gap-1 lg:gap-2">
                <Typography variant="title" as="h1" className="text-2xl lg:text-4xl font-serif text-[#444440]">
                  What a Match!
                </Typography>
                <p className="hidden lg:block font-sans text-xs lg:text-xl font-normal text-[#444440] leading-relaxed max-w-md">
                  You put this together and honestly, it works. Save it before you forget.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden lg:flex gap-4 mt-12 lg:mt-32">
            <button
              type="button"
              onClick={handleAddToCollection}
              disabled={isMutating}
              className="bg-[#F2EDE5] text-[#444440] hover:bg-[#e6e0d5] flex-1 rounded-2xl h-14 lg:h-16 text-xs lg:text-sm font-semibold tracking-wider uppercase transition-colors disabled:opacity-60 cursor-pointer"
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
              className="bg-[#383733] text-white hover:bg-[#2c2b28] flex-1 rounded-2xl h-14 lg:h-16 text-xs lg:text-sm font-semibold tracking-wider uppercase transition-colors disabled:opacity-60 cursor-pointer"
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
          <OutfitComposition items={items} className="aspect-5/6 w-full max-w-[420px] lg:max-w-[480px]" />

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
                className="font-serif text-title border-border w-full max-w-xs border-b bg-transparent text-center outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                disabled={updateNameMutation.isPending}
                className="inline-flex items-center gap-2 group cursor-pointer"
              >
                <Typography variant="title" as="span" className="text-xl lg:text-2xl">
                  {name}
                </Typography>
                <Pencil className="text-muted-foreground size-4 shrink-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Mobile action buttons */}
          <div className="flex lg:hidden gap-3 w-full mt-2">
            <button
              type="button"
              onClick={handleAddToCollection}
              disabled={isMutating}
              className="bg-[#F2EDE5] text-[#444440] hover:bg-[#e6e0d5] flex-1 rounded-2xl h-14 text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-60"
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
              className="bg-[#383733] text-white hover:bg-[#2c2b28] flex-1 rounded-2xl h-14 text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-60"
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

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogPopup showClose={false} className="max-w-md p-6 lg:p-8">
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            aria-label="Close"
            className="bg-[#F2EDE5] hover:bg-[#e6e0d5] absolute top-4 right-4 flex size-10 items-center justify-center rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-4 text-[#444440]" />
          </button>

          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Sparkle className="text-foreground -rotate-12 size-24 lg:size-28" />
            <Typography variant="title" as="p" className="text-2xl lg:text-3xl">
              Logged. <em className="italic underline">Love</em> this one.
            </Typography>
            <Typography variant="subtitle" className="text-muted-foreground">Your look is in.</Typography>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="bg-[#383733] text-white hover:bg-[#2c2b28] w-full rounded-2xl h-14 text-xs lg:text-sm font-semibold tracking-wider uppercase transition-colors mt-2 cursor-pointer"
            >
              Stay In
            </button>
          </div>
        </DialogPopup>
      </Dialog>

      <CalendarDateDialog
        open={calendarPickerOpen}
        onOpenChange={setCalendarPickerOpen}
        onConfirm={handleConfirmCalendarDate}
        saving={addToCalendarMutation.isPending}
      />
    </main>
  );
}
