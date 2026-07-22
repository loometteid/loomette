"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/client";
import { deleteOutfitPhotos } from "@/lib/outfitStorage";
import { useOutfitDiaryUploadStore } from "@/stores/outfit-diary-upload-store";

export function OutfitApproval() {
  const router = useRouter();
  const draft = useOutfitDiaryUploadStore((state) => state.draft);
  const result = useOutfitDiaryUploadStore((state) => state.result);
  const setSavedEntry = useOutfitDiaryUploadStore(
    (state) => state.setSavedEntry,
  );
  const reset = useOutfitDiaryUploadStore((state) => state.reset);
  const [saving, setSaving] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    if (!draft || !result) {
      router.replace("/calendar");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancel() {
    if (result) await deleteOutfitPhotos([result.originalPath]);
    reset();
    router.push("/calendar");
  }

  async function handleSave() {
    if (!draft || !result) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: outfitRow, error: outfitError } = await supabase
        .from("outfit")
        .insert({
          user_id: draft.userId,
          cover_image_url: result.previewUrl,
          is_saved: true,
        })
        .select("id, cover_image_url")
        .single();
      if (outfitError) throw outfitError;

      const { data: wearLogRow, error: wearLogError } = await supabase
        .from("wear_log")
        .insert({
          user_id: draft.userId,
          outfit_id: outfitRow.id,
          worn_on: draft.wornOn,
        })
        .select("id, worn_on")
        .single();
      if (wearLogError) throw wearLogError;

      setSavedEntry({
        wearLogId: wearLogRow.id,
        outfitId: outfitRow.id,
        coverImageUrl: outfitRow.cover_image_url ?? result.previewUrl,
        wornOn: wearLogRow.worn_on,
      });
      toast.success("Outfit Saved");
      router.push("/calendar");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't save that outfit.",
      );
      setSaving(false);
    }
  }

  if (!draft || !result) return null;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        onClick={handleCancel}
        aria-label="Go back"
        disabled={saving}
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
          onClick={handleCancel}
          disabled={saving}
          className="bg-secondary text-secondary-foreground flex-1 rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:pointer-events-none disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-background flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:pointer-events-none disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
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
