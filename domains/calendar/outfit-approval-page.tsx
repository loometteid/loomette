"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";
import { saveOutfitDiaryEntryMutationOptions } from "./mutation-options/save-outfit-diary-entry.mutation-option.client";
import { deleteOutfitPhotoMutationOptions } from "./mutation-options/delete-outfit-photo.mutation-option.client";
import { getDiaryEntriesQueryOptionsForBrowser } from "./query-options/get-diary-entries.query-option.client";

export function OutfitApproval({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useOutfitDiaryUploadStore((state) => state.draft);
  const result = useOutfitDiaryUploadStore((state) => state.result);
  const setSavedEntry = useOutfitDiaryUploadStore(
    (state) => state.setSavedEntry,
  );
  const reset = useOutfitDiaryUploadStore((state) => state.reset);
  const [showOriginal, setShowOriginal] = useState(false);

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );

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
    <div className="flex min-h-screen flex-col bg-background">
      <DesktopNav userId={userId} />
      <main className="mx-auto flex w-full max-w-sm lg:max-w-5xl flex-1 flex-col px-6 lg:px-12 py-8 lg:py-16">
        {/* Mobile Back Button */}
        <div className="flex items-center lg:hidden">
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
        </div>

        {/* 2-column layout on desktop, stacked on mobile */}
        <div className="mt-6 lg:mt-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center flex-1">
          {/* Left Column: Title, Subtitle, Actions on desktop */}
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="flex items-center gap-3">
              <Sparkle className="size-6 lg:size-8 text-foreground" />
              <Typography variant="title" as="h1" className="text-3xl lg:text-4xl font-serif">
                <em className="italic">Looking</em> Good?
              </Typography>
            </div>

            <p className="text-muted-foreground text-xs lg:text-sm uppercase tracking-widest max-w-sm leading-relaxed">
              Here&apos;s what we pulled from your look. Add the ones that are right.
            </p>

            {/* Desktop Action Buttons (D.2.1.2) */}
            <div className="hidden lg:flex items-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  deleteOutfit({ paths: [result.originalPath] });
                }}
                disabled={isBusy}
                className="bg-[#EAE4DC] hover:bg-[#dcd4c8] text-foreground flex-1 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase transition-all active:scale-95 disabled:opacity-60"
              >
                {isDeletingOUtfit && <Loader2 className="size-4 animate-spin inline mr-2" />}
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  saveOutfit({
                    userId: draft.userId,
                    previewUrl: result.previewUrl,
                    wornOn: draft.wornOn,
                  })
                }
                disabled={isBusy}
                className="bg-[#393735] hover:bg-[#2b2a27] text-white flex-1 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase transition-all active:scale-95 disabled:opacity-60 shadow-md"
              >
                {isSavingOutfit && <Loader2 className="size-4 animate-spin inline mr-2" />}
                Save
              </button>
            </div>
          </div>

          {/* Right Column: Preview Image & See Original Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-secondary relative aspect-3/4 w-full max-w-64 lg:max-w-xs overflow-hidden rounded-2xl shadow-sm">
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
              className="border-border rounded-full border px-5 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors hover:bg-secondary"
            >
              See Original Photo
            </button>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="mt-8 flex gap-3 lg:hidden">
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
            onClick={() =>
              saveOutfit({
                userId: draft.userId,
                previewUrl: result.previewUrl,
                wornOn: draft.wornOn,
              })
            }
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
    </div>
  );
}
