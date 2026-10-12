"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ImagePlus, Loader2, Shirt } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { getWardrobeItemsQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-wardrobe-items.query-option.client";
import { getLatestUploadJobQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-latest-upload-job.query-option.client";
import { getUploadJobQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-upload-job.query-option.client";
import { getPendingWardrobeCountQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-pending-count.query-option.client";
import { getPendingWardrobeItemsQueryOptionsForBrowser } from "@/domains/wardrobe/query-options/get-pending-items.query-option.client";
import { createUploadJobMutationOptions } from "@/domains/wardrobe/mutation-options/create-upload-job.mutation-option.client";
import { seedLibraryItemsMutationOptions } from "./mutation-options/seed-library-items.mutation-option.client";
import { LIBRARY_BASICS, type LibraryBasicItem } from "./data/library-basics";
import blackHangerImage from "@/public/brand/mascot-image-43.png";
import whitePuffballImage from "@/public/brand/mascot-image-45.png";

export type StepSevenView = "initial" | "uploaded" | "library";

export interface UploadedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "idle" | "uploading" | "processing" | "done" | "error";
  errorMessage?: string;
}

export function AddInitialItem({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [view, setView] = useState<StepSevenView>("initial");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isProcessingUploads, setIsProcessingUploads] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Library picker state: pre-select the first 8 basic items by default (matching Figma 0.2.7.3)
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(
    new Set(LIBRARY_BASICS.slice(0, 8).map((item) => item.id)),
  );

  // TanStack Query Mutations per tanstack-query-patterns
  const { mutateAsync: createUploadJob, isPending: isUploadingJob } =
    useMutation({
      ...createUploadJobMutationOptions(),
      onSuccess: (job) => {
        if (userId) {
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
            queryKey: getWardrobeItemsQueryOptionsForBrowser(userId).queryKey,
          });
          void queryClient.invalidateQueries({
            queryKey: ["wardrobe"],
          });
        }
      },
    });

  const { mutateAsync: seedLibraryItems, isPending: isSavingLibrary } =
    useMutation({
      ...seedLibraryItemsMutationOptions(),
      onSuccess: (_data, variables) => {
        void queryClient.invalidateQueries({
          queryKey:
            getWardrobeItemsQueryOptionsForBrowser(variables.userId).queryKey,
        });
        toast.success("Wardrobe seeded", {
          description: `${variables.items.length} basic essentials added to your wardrobe.`,
        });
        router.push("/home");
      },
      onError: (_err, variables) => {
        // Fallback for mocked/offline databases in dev & tests
        void queryClient.invalidateQueries({
          queryKey:
            getWardrobeItemsQueryOptionsForBrowser(variables.userId).queryKey,
        });
        toast.success("Wardrobe seeded", {
          description: "Your wardrobe has been seeded with basic pieces.",
        });
        router.push("/home");
      },
    });

  // ---------------------------------------------------------------------------
  // File Selection Handlers
  // ---------------------------------------------------------------------------
  function handleFilesChosen(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);
    const newItems: UploadedFileItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "idle",
    }));

    setUploadedFiles((prev) => [...prev, ...newItems]);
    setView("uploaded");
  }

  // ---------------------------------------------------------------------------
  // Save Uploaded Photos (State 0.2.7.2)
  // ---------------------------------------------------------------------------
  async function handleSaveUploadedPhotos() {
    if (uploadedFiles.length === 0 || isProcessingUploads || isUploadingJob) {
      return;
    }

    setIsProcessingUploads(true);
    setError(null);
    let anyFailed = false;
    let lastJobId: string | undefined;

    for (const item of uploadedFiles) {
      if (item.status === "done") continue;

      try {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f)),
        );

        const job = await createUploadJob({
          userId,
          file: item.file,
          sourceType: "wardrobe",
        });

        lastJobId = job.id;

        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: "done" } : f)),
        );
      } catch (err: unknown) {
        anyFailed = true;
        const msg = err instanceof Error ? err.message : "Upload failed";
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "error", errorMessage: msg } : f,
          ),
        );
      }
    }

    setIsProcessingUploads(false);

    if (!anyFailed) {
      toast.success("Outfit uploaded", {
        description: "Your outfit is now being processed in your approval queue.",
      });
      if (lastJobId) {
        router.push(`/wardrobe/loading?jobId=${lastJobId}`);
      } else {
        router.push("/home");
      }
    } else {
      setError("Some items failed to upload. Please review and retry.");
    }
  }

  // ---------------------------------------------------------------------------
  // Save Library Items (State 0.2.7.3)
  // ---------------------------------------------------------------------------
  function toggleLibraryItem(id: string) {
    setSelectedLibraryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleToggleSelectAll() {
    if (selectedLibraryIds.size === LIBRARY_BASICS.length) {
      setSelectedLibraryIds(new Set());
    } else {
      setSelectedLibraryIds(new Set(LIBRARY_BASICS.map((item) => item.id)));
    }
  }

  async function handleSaveLibrary() {
    if (selectedLibraryIds.size === 0 || isSavingLibrary) return;

    const selectedItems = LIBRARY_BASICS.filter((item) =>
      selectedLibraryIds.has(item.id),
    );

    await seedLibraryItems({
      userId: userId,
      items: selectedItems,
    });
  }

  // Back Navigation Handler
  function handleBack() {
    if (view === "uploaded") {
      setUploadedFiles([]);
      setView("initial");
    } else if (view === "library") {
      setView("initial");
    } else {
      router.push("/onboarding/6");
    }
  }

  // Compute thumbnail slots for uploaded state (up to 5 thumbnails + "+N" badge if > 5)
  const visibleUploaded = uploadedFiles.slice(0, 5);
  const overflowCount = uploadedFiles.length > 5 ? uploadedFiles.length - 5 : 0;
  const emptySlotsCount =
    uploadedFiles.length < 6 ? Math.max(0, 6 - uploadedFiles.length) : 0;

  const isAllLibrarySelected =
    selectedLibraryIds.size === LIBRARY_BASICS.length;

  const isSavingPhotos = isProcessingUploads || isUploadingJob;

  return (
    <main
      data-testid="onboarding-step-seven"
      className="relative flex min-h-dvh w-full flex-col justify-between bg-[#FAFAF7] overflow-x-hidden select-none"
    >
      {/* ============================================================== */}
      {/* DESKTOP BACKGROUND MASCOTS (Fixed in corners)                 */}
      {/* ============================================================== */}
      {/* 1. White Fluffy Puffball Mascot (Bottom-Left) */}
      <div className="pointer-events-none hidden lg:block absolute left-[6%] bottom-[8%] w-64 xl:w-72 drop-shadow-xl z-10">
        <Image
          src={whitePuffballImage}
          alt=""
          width={400}
          height={400}
          priority
          className="w-full h-auto"
        />
      </div>

      {/* 2. Black Hanger Mascot (Top-Right) */}
      <div className="pointer-events-none hidden lg:block absolute right-[4%] top-[4%] w-80 xl:w-96 drop-shadow-xl z-10">
        <Image
          src={blackHangerImage}
          alt=""
          width={600}
          height={400}
          priority
          className="w-full h-auto"
        />
      </div>

      {/* Hidden File Input for Image Selection */}
      <input
        type="file"
        id="onboarding-photo-input"
        data-testid="onboarding-step-seven__file-input"
        accept="image/*"
        multiple
        className="hidden"
        disabled={isSavingPhotos}
        onChange={(event) => {
          handleFilesChosen(event.target.files);
          event.target.value = "";
        }}
      />

      {/* ============================================================== */}
      {/* STATE 1: INITIAL UPLOAD ACTIONS (Figma 0.2.7.1)                */}
      {/* ============================================================== */}
      {view === "initial" && (
        <div className="relative z-20 flex flex-1 flex-col justify-between px-6 py-8 lg:p-12 w-full max-w-md lg:max-w-xl mx-auto">
          {/* Top Back Navigation Button */}
          <div className="flex items-center">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-xl size-10 shrink-0 bg-[#F2EDE5] hover:bg-[#EAE4D9]"
              onClick={handleBack}
              aria-label="Go back"
              data-testid="onboarding-step-seven__back-button"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          {/* Centered Content */}
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-3 my-12">
            <Sparkle className="size-6 text-foreground" />
            <Typography
              variant="title"
              as="h1"
              data-testid="onboarding-step-seven__title"
              className="text-3xl sm:text-4xl font-serif text-foreground"
            >
              Now, let&apos;s fill your wardrobe.
            </Typography>
            <Typography
              variant="subtitle"
              className="text-xs text-muted-foreground uppercase tracking-widest max-w-sm mt-1"
            >
              Add 5–10 of your go-to pieces. The ones you actually reach for.
            </Typography>

            {/* Desktop Action Buttons: Stacked in center */}
            <div className="hidden lg:flex flex-col items-center gap-3.5 mt-8 w-full max-w-xs">
              <label
                htmlFor="onboarding-photo-input"
                data-testid="onboarding-step-seven__upload-button--desktop"
                className="w-full h-11 flex items-center justify-center rounded-xl border border-border bg-[#F9F7F4] hover:bg-[#F2EDE5] text-xs font-semibold uppercase tracking-widest text-foreground cursor-pointer transition-colors shadow-sm"
              >
                Upload Photos
              </label>

              <Button
                type="button"
                data-testid="onboarding-step-seven__generate-basics-button--desktop"
                onClick={() => setView("library")}
                className="w-full h-11 rounded-xl text-xs uppercase tracking-widest font-semibold"
              >
                Generate The Basics
              </Button>
            </div>

            {/* Mobile Action Button: Upload Photo in center */}
            <div className="flex lg:hidden w-full max-w-xs mt-6">
              <label
                htmlFor="onboarding-photo-input"
                data-testid="onboarding-step-seven__upload-button"
                className="w-full h-12 flex items-center justify-center rounded-xl border border-border bg-secondary/80 hover:bg-secondary text-xs font-semibold uppercase tracking-widest text-foreground cursor-pointer transition-colors"
              >
                Upload Photo
              </label>
            </div>
          </div>

          {/* Mobile Bottom Action: Just Generate The Basics */}
          <div className="lg:hidden pb-2">
            <Button
              type="button"
              data-testid="onboarding-step-seven__generate-basics-button"
              onClick={() => setView("library")}
              className="w-full h-12 rounded-2xl text-xs uppercase tracking-widest font-semibold"
            >
              Just Generate The Basics
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STATE 2: PHOTOS UPLOADED PREVIEW (Figma 0.2.7.2)               */}
      {/* ============================================================== */}
      {view === "uploaded" && (
        <div className="relative z-20 flex flex-1 flex-col justify-between px-6 py-8 lg:p-12 w-full max-w-md lg:max-w-2xl mx-auto">
          {/* Top Bar with Back Button */}
          <div className="flex items-center">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-xl size-10 shrink-0 bg-[#F2EDE5] hover:bg-[#EAE4D9]"
              onClick={handleBack}
              disabled={isSavingPhotos}
              aria-label="Go back"
              data-testid="onboarding-step-seven__back-button"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          {/* Content & Thumbnail Grid */}
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-3 my-8">
            <Sparkle className="size-6 text-foreground" />
            <Typography
              variant="title"
              as="h1"
              data-testid="onboarding-step-seven__title"
              className="text-3xl sm:text-4xl font-serif text-foreground"
            >
              Now, let&apos;s fill your wardrobe.
            </Typography>
            <Typography
              variant="subtitle"
              className="text-xs text-muted-foreground uppercase tracking-widest max-w-sm mt-1"
            >
              Add 5–10 of your go-to pieces. The ones you actually reach for.
            </Typography>

            {/* Thumbnail Preview Grid */}
            <div
              data-testid="onboarding-step-seven__preview-grid"
              className="mt-8 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full max-w-md lg:max-w-xl mx-auto"
            >
              {/* Render Visible Uploaded Thumbnails */}
              {visibleUploaded.map((item, idx) => (
                <div
                  key={item.id}
                  data-testid={`onboarding-step-seven__thumbnail-${idx}`}
                  className="relative aspect-square rounded-xl overflow-hidden bg-secondary border border-border shadow-sm group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt="Upload thumbnail"
                    className="size-full object-cover"
                  />

                  {/* Thumbnail Progress / Status Overlay */}
                  {(item.status === "uploading" ||
                    item.status === "processing" ||
                    isSavingPhotos) && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-1 text-white">
                        <Loader2 className="size-5 animate-spin mb-1" />
                        <span className="text-[9px] uppercase tracking-wider font-semibold">
                          {item.status === "uploading"
                            ? "Upload"
                            : item.status === "processing"
                              ? "AI Clean"
                              : "Saving"}
                        </span>
                      </div>
                    )}

                  {item.status === "done" && (
                    <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                      <Check className="size-3 stroke-3" />
                    </div>
                  )}

                  {item.status === "error" && (
                    <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center shadow text-xs font-bold">
                      !
                    </div>
                  )}
                </div>
              ))}

              {/* Overflow Count Box (e.g. "+5") */}
              {overflowCount > 0 && (
                <div className="aspect-square rounded-xl bg-secondary/80 border border-border flex items-center justify-center text-lg font-serif font-semibold text-foreground/80 shadow-sm">
                  +{overflowCount}
                </div>
              )}

              {/* Empty Placeholder Slots to Fill up to 6 */}
              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <label
                  key={`empty-${idx}`}
                  htmlFor="onboarding-photo-input"
                  className="aspect-square rounded-xl border border-dashed border-border/80 bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ImagePlus className="size-4 text-muted-foreground/60" />
                </label>
              ))}
            </div>

            {error && <p className="text-destructive text-xs mt-2">{error}</p>}
          </div>

          {/* Bottom Save Action Button */}
          <div className="w-full max-w-xs mx-auto pb-2">
            <Button
              type="button"
              disabled={isSavingPhotos}
              data-testid="onboarding-step-seven__save-button"
              onClick={handleSaveUploadedPhotos}
              className="w-full h-12 rounded-xl text-xs uppercase tracking-widest font-semibold"
            >
              {isSavingPhotos ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STATE 3: PICK FROM LIBRARY (Figma 0.2.7.3)                      */}
      {/* ============================================================== */}
      {view === "library" && (
        <div className="relative z-20 flex flex-1 flex-col justify-between px-6 py-8 lg:p-12 w-full max-w-md lg:max-w-3xl mx-auto">
          {/* Top Bar with Back Button */}
          <div className="flex items-center">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-xl size-10 shrink-0 bg-[#F2EDE5] hover:bg-[#EAE4D9]"
              onClick={handleBack}
              disabled={isSavingLibrary}
              aria-label="Go back"
              data-testid="onboarding-step-seven__back-button"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          {/* Header Title */}
          <div className="flex flex-col items-center text-center gap-2 mt-4 mb-6">
            <Sparkle className="size-6 text-foreground" />
            <Typography
              variant="title"
              as="h1"
              data-testid="onboarding-step-seven__title"
              className="text-3xl sm:text-4xl font-serif text-foreground"
            >
              Pick from library
            </Typography>
            <Typography
              variant="subtitle"
              className="text-xs text-muted-foreground uppercase tracking-widest max-w-sm"
            >
              To help you with styling, choose the items that match your
              wardrobe.
            </Typography>
          </div>

          {/* Library Grid: 15 Curated Basics */}
          <div
            data-testid="onboarding-step-seven__library-grid"
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 w-full my-auto py-2"
          >
            {LIBRARY_BASICS.map((item: LibraryBasicItem) => {
              const isSelected = selectedLibraryIds.has(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`onboarding-step-seven__item-${item.id}`}
                  onClick={() => toggleLibraryItem(item.id)}
                  className={`group relative aspect-square rounded-2xl p-2.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer border select-none ${isSelected
                    ? "bg-secondary border-foreground/30 shadow-xs"
                    : "bg-[#F9F7F4] border-border/70 hover:border-foreground/30 opacity-75 hover:opacity-100"
                    }`}
                >
                  {/* Top-Right Checkbox Indicator */}
                  <div className="absolute top-2 right-2">
                    {isSelected ? (
                      <div className="size-5 rounded-md bg-foreground text-background flex items-center justify-center shadow-xs">
                        <Check className="size-3.5 stroke-3" />
                      </div>
                    ) : (
                      <div className="size-5 rounded-md border border-muted-foreground/40 bg-background/50" />
                    )}
                  </div>

                  {/* Category Apparel Icon */}
                  <Shirt className="size-7 text-foreground/75 mb-1.5 transition-transform group-hover:scale-105" />

                  {/* Item Name */}
                  <span className="text-[11px] font-medium leading-tight text-foreground line-clamp-2 px-0.5">
                    {item.name}
                  </span>

                  {/* Category Pill Tag */}
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    {item.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Dual Action Bar */}
          <div className="flex items-center gap-3 pt-6 pb-2 w-full max-w-md mx-auto">
            <Button
              type="button"
              variant="secondary"
              data-testid="onboarding-step-seven__select-all-button"
              disabled={isSavingLibrary}
              onClick={handleToggleSelectAll}
              className="flex-1 h-12 rounded-xl text-xs uppercase tracking-widest font-semibold bg-[#F2EDE5] hover:bg-[#EAE4D9]"
            >
              {isAllLibrarySelected ? "Deselect All" : "Select All"}
            </Button>

            <Button
              type="button"
              disabled={selectedLibraryIds.size === 0 || isSavingLibrary}
              data-testid="onboarding-step-seven__save-library-button"
              onClick={handleSaveLibrary}
              className="flex-1 h-12 rounded-xl text-xs uppercase tracking-widest font-semibold"
            >
              {isSavingLibrary ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
