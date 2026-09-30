"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { saveOutfitDiaryEntryMutationOptions } from "./mutation-options/save-outfit-diary-entry.mutation-option.client";
import { deleteOutfitPhotoMutationOptions } from "./mutation-options/delete-outfit-photo.mutation-option.client";
import { getDiaryEntriesQueryOptionsForBrowser } from "./query-options/get-diary-entries.query-option.client";

export function OutfitApproval() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useOutfitDiaryUploadStore((state) => state.draft);
  const result = useOutfitDiaryUploadStore((state) => state.result);
  const setSavedEntry = useOutfitDiaryUploadStore(
    (state) => state.setSavedEntry,
  );
  const reset = useOutfitDiaryUploadStore((state) => state.reset);
  const [showOriginal, setShowOriginal] = useState(false);

  const { mutate: saveOutfit, isPending: isSavingOutfit } = useMutation({
    ...saveOutfitDiaryEntryMutationOptions(),
    onSuccess: (savedEntry) => {
      setSavedEntry(savedEntry);

      const [yearStr, monthStr] = savedEntry.wornOn.split("-");
      const entryYear = Number(yearStr);
      const entryMonth = Number(monthStr) - 1;

      if (draft) {
        void queryClient.invalidateQueries({
          queryKey: getDiaryEntriesQueryOptionsForBrowser(
            draft.userId,
            entryYear,
            entryMonth,
          ).queryKey,
        });
      }

      toast.success("Outfit Saved");
      router.push("/calendar");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Couldn't save that outfit.",
      );
    },
  });

  const { mutate: deleteOutfit, isPending: isDeletingOUtfit } = useMutation({
    ...deleteOutfitPhotoMutationOptions(),
    onSettled: () => {
      reset();
      router.push("/calendar");
    },
  });

  const firstRedirect = useEffectEvent(() => {
    if (!draft || !result) {
      router.replace("/calendar");
    }
  })

  useEffect(() => {
    firstRedirect()
  }, [])

  if (!draft || !result) {
    return null
  }

  const isBusy = isSavingOutfit || isDeletingOUtfit;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        onClick={() => {
          deleteOutfit({ paths: [result.originalPath] });
        }}
        aria-label="Go back"
        disabled={isBusy}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="mt-6 flex items-center gap-2">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          Looking good?
        </Typography>
      </div>

      <div className="mt-8 flex flex-1 flex-col items-center gap-4">
        <div className="bg-secondary relative aspect-3/4 w-full max-w-64 overflow-hidden rounded-2xl">
          <Image
            src={result.previewUrl}
            alt="Outfit preview"
            fill
            className="object-cover"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowOriginal(true)}
          className="border-border rounded-full border px-4 py-2 text-xs font-medium tracking-wide uppercase"
        >
          See Original Photo
        </button>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => {
            deleteOutfit({ paths: [result.originalPath] });
          }}
          disabled={isBusy}
          className="bg-secondary text-secondary-foreground flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:pointer-events-none disabled:opacity-60"
        >
          {isDeletingOUtfit && <Loader2 className="size-4 animate-spin" />}
          Cancel
        </button>
        <button
          type="button"
          onClick={() => saveOutfit({
            userId: draft.userId,
            previewUrl: result.previewUrl,
            wornOn: draft.wornOn,
          })}
          disabled={isBusy}
          className="bg-foreground text-background flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:pointer-events-none disabled:opacity-60"
        >
          {isSavingOutfit && <Loader2 className="size-4 animate-spin" />}
          Save
        </button>
      </div>

      <Dialog open={showOriginal} onOpenChange={setShowOriginal}>
        <DialogPopup>
          <DialogTitle>Original photo</DialogTitle>
          <div className="bg-secondary relative aspect-3/4 w-full overflow-hidden rounded-2xl">
            <Image
              src={result.originalUrl}
              alt="Original outfit photo"
              fill
              className="object-cover"
            />
          </div>
        </DialogPopup>
      </Dialog>
    </main>
  );
}
