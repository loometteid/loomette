import { createClient } from "@/lib/supabase/client";

const BUCKET = "wardrobe-images";

function extensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function uploadWardrobeImage(
  userId: string,
  uploadId: string,
  variant: "original" | "processed",
  file: Blob,
) {
  const supabase = createClient();
  const contentType = file.type || "image/jpeg";
  const path = `${userId}/${uploadId}/${variant}.${extensionFromMime(contentType)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, url: publicUrl };
}

export async function deleteWardrobeImages(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove(paths);
}

/** Recovers the storage path from a public URL previously returned by
 * `uploadWardrobeImage` (`{user_id}/{upload_id}/{variant}.<ext>`). */
export function pathFromPublicUrl(url: string | null | undefined) {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}
