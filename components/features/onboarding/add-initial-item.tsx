"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { removeBackground } from "@/lib/backgroundRemoval";
import { invokeGemini } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/client";
import {
  cropExtractedWardrobeItem,
  type WardrobeExtractionResponse,
} from "@/lib/wardrobeExtraction";
import {
  deleteWardrobeImages,
  uploadWardrobeImage,
} from "@/lib/wardrobeStorage";

type Stage =
  | "idle"
  | "uploading"
  | "scanning"
  | "extracting"
  | "removing-background"
  | "saving";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "Upload Photo",
  uploading: "Uploading…",
  scanning: "Scanning outfit…",
  extracting: "Extracting pieces…",
  "removing-background": "Removing background…",
  saving: "Saving…",
};

const MAX_AI_UPLOAD_BYTES = 10 * 1024 * 1024;
const AI_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function AddInitialItem({
  mode = "onboarding",
}: {
  mode?: "onboarding" | "wardrobe";
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  async function authenticatedUser() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) router.push("/sign-in");
    return { supabase, user };
  }

  async function handleFileSelected(file: File) {
    setError(null);
    const { supabase, user } = await authenticatedUser();

    if (!user) {
      return;
    }

    const uploadId = crypto.randomUUID();
    let originalPath: string | undefined;
    let processedPath: string | undefined;

    try {
      setStage("uploading");
      const original = await uploadWardrobeImage(
        user.id,
        uploadId,
        "original",
        file,
      );
      originalPath = original.path;

      setStage("removing-background");
      let processedBlob: Blob = file;
      try {
        processedBlob = await removeBackground(file);
      } catch {
        // Background removal is best-effort — never blocks the upload.
        processedBlob = file;
      }

      setStage("uploading");
      const processed = await uploadWardrobeImage(
        user.id,
        uploadId,
        "processed",
        processedBlob,
      );
      processedPath = processed.path;

      setStage("saving");
      const { error: rpcError } = await supabase.rpc("create_wardrobe_upload", {
        p_original_url: original.url,
        p_processed_url: processed.url,
      });
      if (rpcError) throw rpcError;

      toast.success("Item added", {
        description: "It's in your approval queue.",
      });
      if (mode === "wardrobe") {
        router.replace("/wardrobe/approval");
        router.refresh();
      } else {
        router.push("/home");
      }
    } catch (err) {
      await deleteWardrobeImages(
        [originalPath, processedPath].filter((p): p is string => !!p),
      );
      setStage("idle");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleOutfitSelected(file: File) {
    setError(null);
    if (!AI_IMAGE_TYPES.has(file.type)) {
      setError("Use a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_AI_UPLOAD_BYTES) {
      setError("The outfit photo must be 10 MB or smaller.");
      return;
    }

    const { supabase, user } = await authenticatedUser();
    if (!user) return;

    const uploadId = crypto.randomUUID();
    const uploadedPaths: string[] = [];

    try {
      setStage("uploading");
      const original = await uploadWardrobeImage(
        user.id,
        uploadId,
        "original",
        file,
      );
      uploadedPaths.push(original.path);

      setStage("scanning");
      const extraction = await invokeGemini<WardrobeExtractionResponse>(
        "extract-wardrobe-items",
        { imageUrl: original.url, mimeType: file.type },
      );

      if (!Array.isArray(extraction.items) || extraction.items.length === 0) {
        throw new Error(
          "No wardrobe pieces were found. Try a clearer, full-body photo.",
        );
      }

      setStage("extracting");
      const pendingItems: {
        processed_url: string;
        name: string;
        category: string;
        subcategory: string;
        color: string;
        material: string;
      }[] = [];

      // Sequential canvas work keeps memory bounded on mobile devices. A
      // single OOTD is intentionally capped at eight detections server-side.
      for (const [index, item] of extraction.items.entries()) {
        const cropped = await cropExtractedWardrobeItem(file, item);
        const uploaded = await uploadWardrobeImage(
          user.id,
          uploadId,
          `item-${index}`,
          cropped,
        );
        uploadedPaths.push(uploaded.path);
        pendingItems.push({
          processed_url: uploaded.url,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          color: item.color,
          material: item.material,
        });
      }

      setStage("saving");
      const { data: created, error: rpcError } = await supabase.rpc(
        "create_wardrobe_extraction",
        { p_items: pendingItems },
      );
      if (rpcError) throw rpcError;

      // The OOTD was only a temporary Gemini input. Pending wardrobe rows
      // reference their own extracted PNGs, so removing it is safe.
      uploadedPaths.splice(uploadedPaths.indexOf(original.path), 1);
      await deleteWardrobeImages([original.path]).catch(() => {});

      toast.success("Outfit scanned", {
        description: `${created ?? pendingItems.length} piece${pendingItems.length === 1 ? "" : "s"} ready for review.`,
      });
      router.replace("/wardrobe/approval");
      router.refresh();
    } catch (err) {
      await deleteWardrobeImages(uploadedPaths);
      setStage("idle");
      setError(
        err instanceof Error ? err.message : "The outfit could not be scanned",
      );
    }
  }

  const isBusy = stage !== "idle";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        onClick={() =>
          mode === "wardrobe" ? router.push("/wardrobe") : router.back()
        }
        aria-label="Go back"
        disabled={isBusy}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="mt-24 flex flex-1 flex-col items-center gap-2 text-center">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          {mode === "wardrobe"
            ? "Add to your wardrobe."
            : "Now, let's fill your wardrobe."}
        </Typography>
        <Typography variant="subtitle" className="max-w-xs">
          {mode === "wardrobe"
            ? "Scan an outfit to extract its pieces, or add one item manually."
            : "Add 5-10 of your go-to pieces. The ones you actually reach for."}
        </Typography>

        <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
          {mode === "wardrobe" && (
            <label
              className="hover:border-foreground/40 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-foreground bg-foreground px-4 py-4 text-xs font-medium tracking-wide text-background uppercase transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-60"
              aria-disabled={isBusy}
            >
              {isBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {isBusy ? STAGE_LABEL[stage] : "Scan an outfit photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void handleOutfitSelected(file);
                }}
              />
            </label>
          )}

          <label
            className="text-muted-foreground hover:border-foreground/40 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-4 text-xs font-medium tracking-wide uppercase transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-60"
            aria-disabled={isBusy}
          >
            {isBusy && mode !== "wardrobe" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {isBusy && mode !== "wardrobe"
              ? STAGE_LABEL[stage]
              : mode === "wardrobe"
                ? "Upload a single item"
                : STAGE_LABEL[stage]}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isBusy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void handleFileSelected(file);
              }}
            />
          </label>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      {mode === "onboarding" && (
        <Button type="button" disabled className="w-full">
          Just Generate The Basics
        </Button>
      )}
    </main>
  );
}
