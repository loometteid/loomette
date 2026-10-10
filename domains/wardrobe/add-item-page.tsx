"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";
import { createUploadJobMutationOptions } from "./mutation-options/create-upload-job.mutation-option.client";
import { getLatestUploadJobQueryOptionsForBrowser } from "./query-options/get-latest-upload-job.query-option.client";
import { getUploadJobQueryOptionsForBrowser } from "./query-options/get-upload-job.query-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "./query-options/get-pending-count.query-option.client";
import { getPendingWardrobeItemsQueryOptionsForBrowser } from "./query-options/get-pending-items.query-option.client";
import { WebcamModal } from "./components/webcam-modal";

export function AddItemView({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );

  const [webcamOpen, setWebcamOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const uploadMutation = useMutation({
    ...createUploadJobMutationOptions(),
    onSuccess: (job) => {
      void queryClient.invalidateQueries({
        queryKey: getLatestUploadJobQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getUploadJobQueryOptionsForBrowser(job.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getPendingWardrobeCountQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getPendingWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: ["wardrobe"],
      });
      router.push(`/wardrobe/loading?jobId=${job.id}`);
    },
    onError: (err) => {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    },
  });

  const isBusy = uploadMutation.isPending;

  function handleFileSelected(file: File) {
    uploadMutation.mutate({
      userId,
      file,
      sourceType: "wardrobe",
    });
  }

  function handleTakePhotoClick() {
    if (typeof window !== "undefined") {
      const isTouchOrMobile =
        window.matchMedia("(pointer: coarse)").matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );

      if (isTouchOrMobile) {
        cameraInputRef.current?.click();
        return;
      }
    }
    setWebcamOpen(true);
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      data-testid="add-item-page"
    >
      <DesktopNav userId={userId} />
      {/* Mobile top bar */}
      <div className="flex items-center px-6 pt-8 lg:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          disabled={isBusy}
          data-testid="add-item-page__back-button"
          className="bg-[#F2EDE5] hover:bg-[#EAE4DC] text-foreground flex size-9 items-center justify-center rounded-xl transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* Centered Intake Card */}
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <Sparkle className="size-6 text-foreground" />
          <Typography
            variant="title"
            as="h1"
            className="text-3xl font-serif"
            data-testid="add-item-page__title"
          >
            Add a new item.
          </Typography>
          <p className="text-[#8C887B] text-xs uppercase tracking-widest font-medium">
            Snap it fresh or pull from your gallery.
          </p>
        </div>

        <div className="mt-16 flex w-full flex-col gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleTakePhotoClick}
            data-testid="add-item-page__take-photo-button"
            className="border border-[#EAE4DC] bg-[#FAF8F5] hover:bg-[#F2EDE5] text-foreground flex w-full items-center justify-center rounded-2xl py-4 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isBusy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Take a Photo
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => galleryInputRef.current?.click()}
            data-testid="add-item-page__upload-photo-button"
            className="border border-[#EAE4DC] bg-[#FAF8F5] hover:bg-[#F2EDE5] text-foreground flex w-full items-center justify-center rounded-2xl py-4 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isBusy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Upload a Photo
          </button>
        </div>

        {/* Native mobile camera trigger */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          data-testid="add-item-page__camera-input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) handleFileSelected(file);
          }}
        />

        {/* System gallery file picker */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          data-testid="add-item-page__gallery-input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) handleFileSelected(file);
          }}
        />

        {/* Desktop Webcam Viewfinder Modal */}
        <WebcamModal
          open={webcamOpen}
          onOpenChange={setWebcamOpen}
          onPhotoCaptured={handleFileSelected}
        />
      </main>
    </div>
  );
}
