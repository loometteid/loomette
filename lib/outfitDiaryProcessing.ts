import { uploadOutfitPhoto } from "@/lib/outfitStorage";
import type { OutfitProcessingResult } from "@/stores/outfit-diary-upload-store";

/**
 * The one function to replace when real AI outfit extraction ships.
 * The upload is real today and stays real; everything after it is a
 * stand-in for a future Edge Function call (extract the outfit, remove
 * the wearer, generate a clean composite preview, eventually per-item
 * wardrobe extraction) that will return `previewUrl` distinct from
 * `originalUrl` instead of reusing it untouched. Callers (the loading
 * screen) only depend on this signature, not on how the result is
 * produced -- swapping the body is enough, no UI flow changes needed.
 */
export async function processOutfitPhoto(
  userId: string,
  file: File,
): Promise<OutfitProcessingResult> {
  const uploadId = crypto.randomUUID();
  const original = await uploadOutfitPhoto(userId, uploadId, file);

  return {
    originalUrl: original.url,
    originalPath: original.path,
    previewUrl: original.url,
  };
}
