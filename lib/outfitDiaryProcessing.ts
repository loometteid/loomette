import { uploadOutfitPhoto } from "@/lib/outfitStorage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { OutfitProcessingResult } from "@/stores/outfit-diary-upload-store";

/**
 * Dual Action Calendar Ingestion:
 * Saves the outfit photo for the calendar diary entry and simultaneously
 * triggers the background Edge Function garment extraction pipeline into
 * the wardrobe approval queue.
 */
export async function processOutfitPhoto(
  userId: string,
  file: File,
): Promise<OutfitProcessingResult> {
  const uploadId = crypto.randomUUID();
  const original = await uploadOutfitPhoto(userId, uploadId, file);

  // Dual Action: initiate wardrobe garment extraction in background
  try {
    const supabase = createBrowserSupabaseClient();
    const { data: job } = await supabase
      .from("upload_job")
      .insert({
        user_id: userId,
        source_type: "calendar",
        original_image_url: original.url,
        status: "pending",
      })
      .select("id")
      .single();

    if (job?.id) {
      void supabase.functions
        .invoke("extract-garments", {
          body: {
            uploadJobId: job.id,
            imageUrl: original.url,
            userId,
          },
        })
        .catch((err) => {
          console.error("Background garment extraction invocation failed:", err);
        });
    }
  } catch (err) {
    // Non-blocking: diary flow continues even if extraction initiation fails
    console.error("Error staging wardrobe upload job from calendar:", err);
  }

  return {
    originalUrl: original.url,
    originalPath: original.path,
    previewUrl: original.url,
  };
}
