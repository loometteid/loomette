import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const BUCKET = "profile-photos";

function extensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function uploadProfilePhoto(userId: string, file: Blob) {
  const supabase = createBrowserSupabaseClient();

  const contentType = file.type || "image/jpeg";
  const path = `${userId}/avatar-${Date.now()}.${extensionFromMime(contentType)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, url: publicUrl };
}
