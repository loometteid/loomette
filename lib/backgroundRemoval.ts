import {
  FilesetResolver,
  ImageSegmenter,
  type ImageSegmenterResult,
} from "@mediapipe/tasks-vision";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-tasks/image_segmenter/selfie_segmentation.tflite";
const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

let segmenterPromise: Promise<ImageSegmenter> | null = null;

// MediaPipe's WASM runtime logs its own startup/inference chatter
// (TFLite delegate creation, glog-style "W0719 ..." warnings) via
// console.error rather than console.log, regardless of severity —
// this isn't an error, but Next.js's dev overlay treats any
// console.error as one and shows a full "Console Error" screen for it.
// Filter out only known MediaPipe/TFLite noise during calls that touch
// the WASM module; anything else still reaches the real console.error
// so unexpected problems aren't hidden.
const KNOWN_NOISE =
  /^(INFO:|W\d{4}\s|Created TensorFlow Lite|OpenGL error checking|Feedback manager requires)/;

async function withMediaPipeLogsSilenced<T>(
  fn: () => Promise<T> | T,
): Promise<T> {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && KNOWN_NOISE.test(args[0])) return;
    originalError(...args);
  };
  try {
    return await fn();
  } finally {
    console.error = originalError;
  }
}

function getSegmenter() {
  segmenterPromise ??= withMediaPipeLogsSilenced(() =>
    FilesetResolver.forVisionTasks(WASM_BASE).then((vision) =>
      ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      }),
    ),
  );
  return segmenterPromise;
}

/**
 * Cuts the foreground out of `file` using MediaPipe's selfie-segmentation
 * model, returning a transparent-background PNG blob. This model is tuned
 * for people, not flat-lay/hanger garment photos — quality on clothing
 * shots is unverified and may be mediocre (known tradeoff, see the
 * v0.2.7.1 architecture plan). Callers must treat any failure as
 * non-fatal and fall back to the original image.
 */
export async function removeBackground(file: File): Promise<Blob> {
  const segmenter = await getSegmenter();
  const imageBitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(imageBitmap, 0, 0);
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const result: ImageSegmenterResult = await withMediaPipeLogsSilenced(() =>
    segmenter.segment(canvas),
  );
  const confidenceMask = result.confidenceMasks?.[0];
  if (!confidenceMask) throw new Error("Segmenter returned no mask");

  const maskData = confidenceMask.getAsFloat32Array();
  const pixels = original.data;
  let confidenceSum = 0;
  for (let i = 0; i < maskData.length; i++) {
    pixels[i * 4 + 3] = Math.round(maskData[i] * 255);
    confidenceSum += maskData[i];
  }
  confidenceMask.close();
  result.close();

  // This model is tuned for people, not garment photos — on a photo
  // with nothing it recognizes as a person, it can return ~0 confidence
  // everywhere, producing a fully transparent, blank image. That's
  // worse than doing nothing, so treat it as a failure rather than
  // "succeeding" with an unusable result.
  const averageConfidence = confidenceSum / maskData.length;
  if (averageConfidence < 0.02) {
    throw new Error("Segmentation produced no visible foreground");
  }

  ctx.putImageData(original, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}
