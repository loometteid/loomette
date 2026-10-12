import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { normalizeImageForUpload } from "@/lib/imageNormalization";

const BUCKET = "outfit-photos";

function extensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function uploadOutfitPhoto(
  userId: string,
  uploadId: string,
  file: Blob,
) {
  const supabase = createBrowserSupabaseClient();

  const normalized = await normalizeImageForUpload(file);
  const contentType = normalized.type || "image/jpeg";
  const path = `${userId}/${uploadId}/photo.${extensionFromMime(contentType)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, normalized, { contentType });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, url: publicUrl };
}

export async function deleteOutfitPhotos(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = createBrowserSupabaseClient();

  await supabase.storage.from(BUCKET).remove(paths);
}
