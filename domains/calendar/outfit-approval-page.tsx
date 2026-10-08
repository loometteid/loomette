"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
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
      router.push(`/calendar/outfits/${savedEntry.wornOn}`);
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
  });

  useEffect(() => {
    firstRedirect();
  }, []);

  if (!draft || !result) {
    return null;
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
              <Typography
                variant="title"
                as="h1"
                className="text-3xl lg:text-4xl font-serif"
              >
                <em className="italic">Looking</em> Good?
              </Typography>
            </div>

            <p className="text-muted-foreground text-xs lg:text-sm uppercase tracking-widest max-w-sm leading-relaxed">
              Here&apos;s what we pulled from your look. Add the ones that are
              right.
            </p>

            {/* Desktop Action Buttons (D.2.1.2) */}
            <div className="hidden lg:flex items-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  deleteOutfit({ paths: [result.originalPath] });
                }}
                disabled={isBusy}
                className="bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] px-10 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase transition-all active:scale-95 disabled:opacity-60"
              >
                {isDeletingOUtfit && (
                  <Loader2 className="size-4 animate-spin inline mr-2" />
                )}
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
                className="bg-[#444440] hover:bg-[#333330] text-white px-10 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase transition-all active:scale-95 disabled:opacity-60 shadow-md"
              >
                {isSavingOutfit && (
                  <Loader2 className="size-4 animate-spin inline mr-2" />
                )}
                Save
              </button>
            </div>
          </div>

          {/* Right Column: Preview Image & See Original Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex flex-col items-center justify-center w-full max-w-64 lg:max-w-xs aspect-3/4">
              <div className="relative h-full w-full flex items-center justify-center">
                <Image
                  src={result.previewUrl}
                  alt="Outfit preview"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div className="h-2 w-32 rounded-full bg-black/10 blur-[3px]" />
            </div>

            <button
              type="button"
              onClick={() => setShowOriginal(true)}
              className="border-[#C9C3B7] bg-transparent rounded-full border px-6 py-2 text-xs font-medium tracking-wide uppercase transition-colors hover:bg-[#F2EDE5] text-[#444440]"
            >
              See Original Photo
            </button>

            {/* Title with inline pencil (Figma 2.1.2) */}
            <div className="flex items-center gap-1.5 mt-1 lg:hidden">
              <span className="font-serif text-2xl text-[#444440]">Chic Kinda Day</span>
              <Pencil className="size-3.5 text-[#444440]" />
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons (Figma 2.1.2) */}
        <div className="mt-8 flex gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => router.push("/calendar/share")}
            disabled={isBusy}
            className="bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-xs font-semibold tracking-wider uppercase transition-colors disabled:pointer-events-none disabled:opacity-60"
          >
            Share
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
            className="bg-[#444440] hover:bg-[#333330] text-white flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-xs font-semibold tracking-wider uppercase transition-colors shadow-md disabled:pointer-events-none disabled:opacity-60"
          >
            {isSavingOutfit && <Loader2 className="size-4 animate-spin" />}
            Save
          </button>
        </div>

        <Dialog open={showOriginal} onOpenChange={setShowOriginal}>
          <DialogPopup
            showClose={false}
            className="h-fit max-w-[340px] lg:max-w-md w-[calc(100%-3rem)] p-6 lg:p-8 rounded-[24px] bg-[#FAFAF7] border-none text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowOriginal(false)}
              aria-label="Close"
              className="absolute top-4 right-4 size-10 rounded-xl bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex items-center justify-center transition-colors"
            >
              <X className="size-4" />
            </button>
            <div className="flex flex-col items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Sparkle className="size-5 text-[#444440]" />
                <DialogTitle className="font-serif text-2xl lg:text-3xl text-[#444440]">
                  Source Preview
                </DialogTitle>
              </div>
              <div className="bg-[#ECE7DF] relative aspect-3/4 w-full max-w-[260px] overflow-hidden rounded-2xl">
                <Image
                  src={result.originalUrl}
                  alt="Original outfit photo"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowOriginal(false)}
                className="w-full bg-[#444440] hover:bg-[#333330] text-white py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors mt-2"
              >
                Okay
              </button>
            </div>
          </DialogPopup>
        </Dialog>
      </main>
    </div>
  );
}
