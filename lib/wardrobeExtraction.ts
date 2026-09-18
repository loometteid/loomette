export type ExtractedWardrobeItem = {
  name: string;
  category: "Tops" | "Bottoms" | "Shoes" | "Accessories";
  subcategory: string;
  color: string;
  material: string;
  /** [ymin, xmin, ymax, xmax], normalized to the full image. */
  box_2d: [number, number, number, number];
  /** [x, y] contour points normalized inside `box_2d`. */
  mask: [number, number][];
};

export type WardrobeExtractionResponse = {
  items: ExtractedWardrobeItem[];
  model: string;
};

const MAX_OUTPUT_DIMENSION = 1200;

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create the extracted item image"));
    }, "image/png");
  });
}

/**
 * Applies Gemini's contour to the original upload. The crop is produced in
 * the browser so the Gemini API never generates or subtly changes the user's
 * garment; pixels always come from the source photo.
 */
export async function cropExtractedWardrobeItem(
  file: File,
  item: ExtractedWardrobeItem,
) {
  const image = await createImageBitmap(file);
  try {
    const clamp = (value: number) => Math.max(0, Math.min(1000, value));
    const [ymin, xmin, ymax, xmax] = item.box_2d.map(clamp);

    const boxX = (xmin / 1000) * image.width;
    const boxY = (ymin / 1000) * image.height;
    const boxWidth = ((xmax - xmin) / 1000) * image.width;
    const boxHeight = ((ymax - ymin) / 1000) * image.height;
    if (boxWidth < 2 || boxHeight < 2) {
      throw new Error("Gemini returned an invalid garment area");
    }

    // Leave a small transparent margin so pieces do not touch card edges.
    const padding = Math.max(boxWidth, boxHeight) * 0.04;
    const sourceX = Math.max(0, boxX - padding);
    const sourceY = Math.max(0, boxY - padding);
    const sourceRight = Math.min(image.width, boxX + boxWidth + padding);
    const sourceBottom = Math.min(image.height, boxY + boxHeight + padding);
    const sourceWidth = sourceRight - sourceX;
    const sourceHeight = sourceBottom - sourceY;
    const scale = Math.min(
      1,
      MAX_OUTPUT_DIMENSION / Math.max(sourceWidth, sourceHeight),
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context unavailable");

    const validMask = item.mask.filter(
      (point) =>
        Array.isArray(point) &&
        point.length === 2 &&
        point.every((coordinate) => Number.isFinite(coordinate)),
    );

    if (validMask.length >= 3) {
      context.beginPath();
      validMask.forEach(([x, y], index) => {
        const sourcePointX = boxX + (clamp(x) / 1000) * boxWidth;
        const sourcePointY = boxY + (clamp(y) / 1000) * boxHeight;
        const outputX = (sourcePointX - sourceX) * scale;
        const outputY = (sourcePointY - sourceY) * scale;
        if (index === 0) context.moveTo(outputX, outputY);
        else context.lineTo(outputX, outputY);
      });
      context.closePath();
      context.clip();
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return await canvasBlob(canvas);
  } finally {
    image.close();
  }
}
