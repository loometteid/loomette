"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { removeBackground } from "@/lib/backgroundRemoval";
import { createClient } from "@/lib/supabase/client";
import {
  deleteWardrobeImages,
  uploadWardrobeImage,
} from "@/lib/wardrobeStorage";

type Stage = "idle" | "uploading" | "removing-background" | "saving";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "Upload Photo",
  uploading: "Uploading…",
  "removing-background": "Removing background…",
  saving: "Saving…",
};

export function AddInitialItem() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/sign-in");
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
      router.push("/home");
    } catch (err) {
      await deleteWardrobeImages(
        [originalPath, processedPath].filter((p): p is string => !!p),
      );
      setStage("idle");
      setError(err instanceof Error ? err.message : "Upload failed");
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
        onClick={() => router.back()}
        aria-label="Go back"
        disabled={isBusy}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="mt-24 flex flex-1 flex-col items-center gap-2 text-center">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          Now, let&apos;s fill your wardrobe.
        </Typography>
        <Typography variant="subtitle" className="max-w-xs">
          Add 5-10 of your go-to pieces. The ones you actually reach for.
        </Typography>

        <label
          className="text-muted-foreground hover:border-foreground/40 mt-6 flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-4 text-xs font-medium tracking-wide uppercase transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-60"
          aria-disabled={isBusy}
        >
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {STAGE_LABEL[stage]}
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

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      <Button type="button" disabled className="w-full">
        Just Generate The Basics
      </Button>
    </main>
  );
}
