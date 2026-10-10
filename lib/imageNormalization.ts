/**
 * Normalizes an image file or blob to standard image/jpeg before upload.
 * - Converts unsupported MIME types (like image/avif, image/heic) to image/jpeg
 *   so OpenRouter image generation and Vision models never reject the format.
 * - Resizes images exceeding 2048px on their longest side to avoid slow uploads.
 * - Falls back safely to original blob if canvas/DOM operations are unavailable.
 */
export async function normalizeImageForUpload(file: Blob): Promise<Blob> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext?.("2d");
    if (!ctx || typeof canvas.toBlob !== "function") {
      return file;
    }

    // Attempt decoding using createImageBitmap or fallback to HTMLImageElement
    let width = 0;
    let height = 0;
    let drawable: ImageBitmap | HTMLImageElement | null = null;

    if (typeof createImageBitmap === "function") {
      try {
        drawable = await createImageBitmap(file);
        width = drawable.width;
        height = drawable.height;
      } catch {
        drawable = null;
      }
    }

    if (!drawable) {
      drawable = await new Promise<HTMLImageElement | null>((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });
      if (drawable) {
        width = drawable.naturalWidth || drawable.width;
        height = drawable.naturalHeight || drawable.height;
      }
    }

    if (!drawable || width === 0 || height === 0) {
      return file;
    }

    const maxDim = 2048;
    let targetWidth = width;
    let targetHeight = height;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        targetHeight = Math.round((height * maxDim) / width);
        targetWidth = maxDim;
      } else {
        targetWidth = Math.round((width * maxDim) / height);
        targetHeight = maxDim;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(drawable, 0, 0, targetWidth, targetHeight);

    const convertedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        "image/jpeg",
        0.92,
      );
    });

    return convertedBlob || file;
  } catch {
    return file;
  }
}
