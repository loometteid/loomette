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
import { OutfitComposition } from "@/components/features/outfit/outfit-composition";
import { CalendarDateDialog } from "./calendar-date-dialog";
import { getOutfitResultQueryOptionsForBrowser } from "./query-options/get-outfit-result.query-option.client";
import { updateOutfitNameMutationOptions } from "./mutation-options/update-outfit-name.mutation-option.client";
import { addOutfitToCollectionMutationOptions } from "./mutation-options/add-outfit-to-collection.mutation-option.client";
import { addOutfitToCalendarMutationOptions } from "./mutation-options/add-outfit-to-calendar.mutation-option.client";
import { getLooksCountQueryOptionsForBrowser } from "@/components/features/home/query-options/get-looks-count.query-option.client";
import { getDiaryEntriesQueryOptionsForBrowser } from "@/components/features/calendar/query-options/get-diary-entries.query-option.client";

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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
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

      <div className="flex items-center gap-2">
        <Sparkle className="text-foreground size-5" />
        <Typography variant="title" as="h1">
          What a Match!
        </Typography>
      </div>

      <OutfitComposition items={items} className="aspect-5/6 w-full" />

      <div className="flex items-center justify-center gap-2 text-center">
        {editingName ? (
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            className="font-serif text-title border-border w-full border-b bg-transparent text-center outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            disabled={updateNameMutation.isPending}
            className="inline-flex items-center gap-2"
          >
            <Typography variant="title" as="span">
              {name}
            </Typography>
            <Pencil className="text-muted-foreground size-4 shrink-0" />
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddToCollection}
          disabled={isMutating}
          className="bg-secondary text-secondary-foreground flex-1 rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:opacity-60"
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
          className="bg-foreground text-background flex-1 rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:opacity-60"
        >
          {addToCalendarMutation.isPending
            ? "Adding…"
            : addedToCalendar
              ? "Added ✓"
              : "Add to Calendar"}
        </button>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogPopup showClose={false}>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            aria-label="Close"
            className="bg-secondary absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Sparkle className="text-foreground -rotate-12 size-28" />
            <Typography variant="title" as="p">
              Logged. <em className="italic underline">Love</em> this one.
            </Typography>
            <Typography variant="subtitle">Your look is in.</Typography>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="bg-foreground text-background w-full rounded-full py-3 text-sm font-medium tracking-wide uppercase"
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
