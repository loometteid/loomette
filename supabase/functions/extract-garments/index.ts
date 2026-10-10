import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenRouter } from "npm:@openrouter/sdk";
import { z } from "npm:zod";
import { createLogger, Logger } from "./logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export const OccasionSchema = z.enum([
  "everyday",
  "work",
  "going_out",
  "special",
  "just_vibing",
]);
export type Occasion = z.infer<typeof OccasionSchema>;

export const ExtractedGarmentSchema = z.object({
  name: z
    .string()
    .describe(
      "Descriptive, polished fashion item name (e.g. 'Dark Wash Straight Leg Jeans', 'White Cotton T-Shirt')",
    ),
  brand: z
    .string()
    .optional()
    .default("")
    .describe(
      "Brand or fashion designer name if visibly identifiable, otherwise an empty string",
    ),
  category: z
    .enum(["Tops", "Bottoms", "Shoes", "Accessories"])
    .describe(
      "Broad garment category classification (Tops, Bottoms, Shoes, or Accessories)",
    ),
  subcategory: z
    .string()
    .describe(
      "Specific item subcategory (e.g., Shirt, Blouse, Polo, Jeans, Pants, Skirt, Sneakers, Heels, Sandals, Bag, Scarf, Hijab)",
    ),
  color: z
    .string()
    .optional()
    .default("")
    .describe(
      "Primary visual color and precise shade of the garment (e.g., White, Black, Navy, Light Blue, Red)",
    ),
  material: z
    .string()
    .optional()
    .default("")
    .describe(
      "Fabric, texture, or material of the garment if recognizable from visual appearance",
    ),
  visual_details: z
    .string()
    .optional()
    .default("")
    .describe(
      "Granular physical description of the garment's design (neckline, sleeve length, buttons, zippers, pockets, distressing, silhouette, pattern, stitching, collar style)",
    ),
  occasions: z
    .array(OccasionSchema)
    .optional()
    .default([])
    .describe(
      "List of suitable wearing occasions matching the application taxonomy",
    ),
  box_2d: z
    .tuple([z.number(), z.number(), z.number(), z.number()])
    .optional()
    .describe(
      "Bounding box coordinates of the detected item on the image normalized to 0-1000 in [ymin, xmin, ymax, xmax] format",
    ),
});

export const GarmentExtractionResponseSchema = z.object({
  items: z
    .array(ExtractedGarmentSchema)
    .describe(
      "Extracted clothing items, footwear, and fashion accessories detected in the image",
    ),
});

export type ExtractedGarment = z.infer<typeof ExtractedGarmentSchema>;

const garmentResponseJsonSchema = {
  type: "object",
  description:
    "List of clothing items and fashion accessories extracted from the image",
  properties: {
    items: {
      type: "array",
      description:
        "Extracted clothing items, footwear, and fashion accessories detected in the image",
      items: {
        type: "object",
        description: "An individual garment or accessory detected in the photo",
        properties: {
          name: {
            type: "string",
            description:
              "Descriptive item name (e.g., 'Dark Wash Straight Leg Jeans', 'White Cotton T-Shirt')",
          },
          brand: {
            type: "string",
            description:
              "Brand or fashion designer name if visibly identifiable, otherwise an empty string",
          },
          category: {
            type: "string",
            enum: ["Tops", "Bottoms", "Shoes", "Accessories"],
            description:
              "Broad garment category classification (Tops, Bottoms, Shoes, or Accessories)",
          },
          subcategory: {
            type: "string",
            description:
              "Specific item subcategory (e.g., Shirt, Blouse, Polo, Jeans, Pants, Skirt, Sneakers, Heels, Sandals, Bag, Scarf, Hijab)",
          },
          color: {
            type: "string",
            description:
              "Primary visual color of the garment (e.g., White, Black, Navy, Light Blue, Red)",
          },
          material: {
            type: "string",
            description:
              "Fabric, texture, or material of the garment if recognizable from visual appearance (e.g., Denim, Cotton, Leather, Wool, Silk, Linen, Knit, Corduroy, Polyester, Nylon), otherwise an empty string",
          },
          visual_details: {
            type: "string",
            description:
              "Granular physical description of the garment's design (neckline, sleeve length, buttons, zippers, pockets, distressing, silhouette, pattern, stitching, collar style)",
          },
          occasions: {
            type: "array",
            description:
              "List of suitable wearing occasions matching the application taxonomy",
            items: {
              type: "string",
              enum: [
                "everyday",
                "work",
                "going_out",
                "special",
                "just_vibing",
              ],
              description:
                "Allowed occasion: everyday, work, going_out, special, or just_vibing",
            },
          },
          box_2d: {
            type: "array",
            description:
              "Bounding box coordinates of the detected item on the image normalized to 0-1000 in [ymin, xmin, ymax, xmax] format",
            items: { type: "integer" },
          },
        },
        required: ["name", "category", "subcategory"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

interface RequestPayload {
  uploadJobId: string;
  imageUrl: string;
  userId: string;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(cleanBase64, "base64"));
  }
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function extractJson(text: string): { items?: ExtractedGarment[] } {
  const trimmed = text.trim();
  const cleaned = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Unable to parse JSON from model output");
  }
}

async function generateGarmentCutout(
  openRouter: OpenRouter,
  garment: ExtractedGarment,
  sourceImageUrl: string,
  modelName: string,
  log: Logger,
): Promise<Uint8Array | null> {
  const promptParts = [
    `Isolated commercial product catalog photograph of a single ${garment.color ? garment.color + " " : ""}${garment.material ? garment.material + " " : ""}${garment.name} (${garment.subcategory}, ${garment.category}).`,
    garment.visual_details ? `Visual design details: ${garment.visual_details}.` : "",
    `Pure transparent background with zero opacity alpha channel (PNG).`,
    `Centered flat-lay or invisible ghost mannequin display, crisp sharp cutout edges, bright studio commercial lighting.`,
    `Strictly single garment only: no human body or limbs, no mannequin parts, no hanger, no drop shadow, no gray or white solid backdrop, perfectly isolated transparent PNG.`
  ].filter(Boolean).join(" ");

  try {
    const res = await openRouter.images.generate({
      imageGenerationRequest: {
        model: modelName,
        prompt: promptParts,
        background: "transparent",
        outputFormat: "png",
        aspectRatio: "1:1",
        inputReferences: [
          {
            type: "image_url",
            imageUrl: {
              url: sourceImageUrl,
            },
          },
        ],
      },
    });

    const firstImage = res?.data?.[0] as
      | { b64Json?: string; b64_json?: string; url?: string }
      | undefined;
    const b64 = firstImage?.b64Json || firstImage?.b64_json;
    if (b64) {
      return base64ToUint8Array(b64);
    }
    if (firstImage?.url) {
      const fetched = await fetch(firstImage.url);
      if (fetched.ok) {
        return new Uint8Array(await fetched.arrayBuffer());
      }
    }
    return null;
  } catch (imgErr) {
    log.warn(
      "Image generation failed with inputReferences, retrying without reference...",
      {
        error: imgErr instanceof Error ? imgErr.message : String(imgErr),
        garment: garment.name,
      },
    );
    try {
      const res = await openRouter.images.generate({
        imageGenerationRequest: {
          model: modelName,
          prompt: promptParts,
          background: "transparent",
          outputFormat: "png",
          aspectRatio: "1:1",
        },
      });

      const firstImage = res?.data?.[0] as
        | { b64Json?: string; b64_json?: string; url?: string }
        | undefined;
      const b64 = firstImage?.b64Json || firstImage?.b64_json;
      if (b64) {
        return base64ToUint8Array(b64);
      }
      if (firstImage?.url) {
        const fetched = await fetch(firstImage.url);
        if (fetched.ok) {
          return new Uint8Array(await fetched.arrayBuffer());
        }
      }
    } catch (retryErr) {
      log.warn(
        "Image generation retry also failed, falling back to original image",
        {
          error: retryErr instanceof Error ? retryErr.message : String(retryErr),
          garment: garment.name,
        },
      );
    }
    return null;
  }
}

const rootLogger = createLogger({}, "extract-garments");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    rootLogger.debug("CORS preflight request handled");
    return new Response("ok", { headers: corsHeaders });
  }

  const requestTimer = rootLogger.startTimer("total_request");

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const openrouterApiKey = Deno.env.get("OPENROUTER_API_KEY") ?? "";
  const visionModel =
    Deno.env.get("OPENROUTER_VISION_MODEL") || "google/gemini-3.8-flash";
  const imageModel =
    Deno.env.get("OPENROUTER_IMAGE_MODEL") || "openai/gpt-image-2.5-flare";

  if (!supabaseUrl || !supabaseServiceKey) {
    rootLogger.error(
      "Missing critical Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let payload: RequestPayload;
  try {
    payload = await req.json();
  } catch (parseErr) {
    rootLogger.error("Failed to parse request JSON payload", {
      error: parseErr,
      method: req.method,
    });
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { uploadJobId, imageUrl, userId } = payload;
  if (!uploadJobId || !imageUrl || !userId) {
    rootLogger.warn("Request rejected due to missing required fields", {
      missing: {
        uploadJobId: !uploadJobId,
        imageUrl: !imageUrl,
        userId: !userId,
      },
    });
    return new Response(
      JSON.stringify({
        error: "Missing required fields: uploadJobId, imageUrl, userId",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const log = rootLogger.child({ jobId: uploadJobId, userId });
  log.info("Garment extraction job accepted", { imageUrl });

  if (!openrouterApiKey) {
    log.error("OPENROUTER_API_KEY is not configured");
    await supabase
      .from("upload_job")
      .update({
        status: "failed",
        error_message: "AI service configuration error: OPENROUTER_API_KEY is missing.",
      })
      .eq("id", uploadJobId);

    return new Response(
      JSON.stringify({ error: "Missing OPENROUTER_API_KEY configuration" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const openRouter = new OpenRouter({
    apiKey: openrouterApiKey,
  });

  // Safety timeout guard: before the HTTP gateway hard-terminates the worker,
  // mark the job as failed in PostgreSQL so it never stays stuck in analyzing.
  const timeoutGuard = setTimeout(async () => {
    log.error(
      "Execution approaching platform timeout limit (45s), marking upload_job as failed",
      { uploadJobId },
    );
    try {
      await supabase
        .from("upload_job")
        .update({
          status: "failed",
          error_message:
            "Outfit processing timed out. Please try again with a clearer photo.",
        })
        .eq("id", uploadJobId);
    } catch (e) {
      log.error("Failed to mark upload_job as timed out in database", {
        error: e,
      });
    }
  }, 45000);

  try {
    // 1. Mark job as analyzing
    const phase1Timer = log.startTimer("phase1_mark_analyzing");
    const { error: updateAnalyzingErr } = await supabase
      .from("upload_job")
      .update({ status: "analyzing" })
      .eq("id", uploadJobId);

    if (updateAnalyzingErr) {
      log.error("Failed to update upload_job status to analyzing", {
        error: updateAnalyzingErr,
      });
      throw updateAnalyzingErr;
    }
    phase1Timer.done("Upload job marked as analyzing");

    // 2. Fetch original image
    const phase2Timer = log.startTimer("phase2_fetch_image");
    log.info("Fetching outfit image from storage", { imageUrl });
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      log.error("Failed to fetch outfit image from URL", {
        status: imageRes.status,
        statusText: imageRes.statusText,
        durationMs: phase2Timer.elapsedMs(),
      });
      throw new Error(
        `Failed to fetch image (${imageRes.status}): ${imageRes.statusText}`,
      );
    }
    const imageBuffer = await imageRes.arrayBuffer();
    const base64Image = bufferToBase64(imageBuffer);
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const sizeKb = Math.round(imageBuffer.byteLength / 1024);
    phase2Timer.done("Image downloaded successfully", {
      sizeKb,
      contentType,
    });

    // 3. Call OpenRouter Vision API for garment decomposition using Gemini 3.8 Flash
    const phase3Timer = log.startTimer("phase3_vision_decomposition");
    const prompt = `You are a fashion catalog expert for Loomette. Analyze this outfit or garment photo.
Identify each distinct garment, pair of shoes, or fashion accessory worn or shown.
Extract attributes with extreme precision:
- name: Descriptive, polished fashion item name (e.g. 'Washed Vintage Straight-Leg Denim Jeans', 'Chunky Cable-Knit Cream Wool Sweater')
- brand: Brand or fashion designer name if visibly identifiable, otherwise empty string
- category: Broad garment classification. Must be exactly one of: 'Tops', 'Bottoms', 'Shoes', 'Accessories'
- subcategory: Specific item subcategory (e.g. Shirt, Blouse, Polo, T-Shirt, Jeans, Pants, Skirt, Shorts, Dress, Jacket, Coat, Blazer, Hoodie, Sweater, Cardigan, Sneakers, Boots, Loafers, Heels, Sandals, Bag, Belt, Hat, Scarf, Sunglasses, Jewelry)
- color: Primary visual color and precise shade (e.g. 'Washed Vintage Indigo', 'Ivory Ecru', 'Charcoal Heather')
- material: Fabric, texture, or weave if recognizable (e.g. 'Heavyweight Cotton Denim', 'Fine Ribbed Knit', 'Supple Matte Leather', '100% Linen')
- visual_details: Granular physical description of the garment's design (neckline, sleeve length, buttons, zippers, pockets, distressing, silhouette, pattern, stitching, collar style)
- occasions: List of suitable wearing occasions matching the taxonomy: everyday (casual/daily), work (office/business), going_out (evening/party), special (formal/events), just_vibing (relaxed/lounge)
- box_2d: Bounding box coordinates of the detected item on the image normalized to 0-1000 in [ymin, xmin, ymax, xmax] format`;

    let items: ExtractedGarment[] = [];

    log.info("Calling OpenRouter Vision API for garment decomposition", {
      model: visionModel,
    });

    let response;
    try {
      response = await openRouter.chat.send({
        chatRequest: {
          model: visionModel,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  imageUrl: {
                    url: `data:${contentType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          responseFormat: {
            type: "json_schema",
            jsonSchema: {
              name: "garment_extraction_response",
              strict: true,
              schema: garmentResponseJsonSchema,
            },
          },
        },
      });
    } catch (openrouterErr) {
      log.error(
        "OpenRouter Vision API garment decomposition failed",
        {
          model: visionModel,
          durationMs: phase3Timer.elapsedMs(),
          error: openrouterErr,
        },
      );
      throw openrouterErr;
    }

    const rawText = response.choices?.[0]?.message?.content || "{}";
    phase3Timer.done("OpenRouter Vision decomposition completed", {
      model: visionModel,
      rawTextLength: rawText.length,
    });

    try {
      const parsed = extractJson(rawText);
      const validated = GarmentExtractionResponseSchema.parse(parsed);
      items = validated.items;
    } catch (parseErr) {
      log.error("Failed to parse and validate OpenRouter vision output with Zod schema", {
        rawText,
        error: parseErr,
      });
      throw new Error("Invalid schema response from vision model");
    }

    log.info("Extracted garments parsed and validated from OpenRouter response", {
      detectedCount: items.length,
      garments: items.map((i) => ({
        name: i.name,
        category: i.category,
        subcategory: i.subcategory,
        material: i.material,
      })),
    });

    if (items.length === 0) {
      log.warn("No garments could be detected in this photo", {
        step: "validate_garments",
      });
      await supabase
        .from("upload_job")
        .update({
          status: "failed",
          error_message: "No garments could be detected in this photo.",
        })
        .eq("id", uploadJobId);

      return new Response(
        JSON.stringify({ success: false, message: "No garments detected" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 4. Query user's existing approved wardrobe items for advisory duplicate detection
    const phase4Timer = log.startTimer("phase4_duplicate_detection");
    log.info(
      "Querying user's existing approved wardrobe items for duplicate comparison",
    );
    const { data: existingWardrobe, error: existingErr } = await supabase
      .from("wardrobe_item")
      .select("id, item:item_id (name, category, subcategory, color)")
      .eq("user_id", userId)
      .eq("is_approved", true);

    if (existingErr) {
      log.warn(
        "Failed to query existing wardrobe items for duplicate check. Continuing without duplicate flags.",
        { error: existingErr },
      );
    }

    interface ExistingWardrobeRow {
      id: string;
      item: {
        name: string | null;
        category: string | null;
        subcategory: string | null;
        color: string | null;
      } | null;
    }

    const existingItems =
      (existingWardrobe as unknown as ExistingWardrobeRow[]) ?? [];
    phase4Timer.done("Existing wardrobe items fetched for comparison", {
      existingApprovedCount: existingItems.length,
    });

    // 5. Stage each extracted garment into item and wardrobe_item (with Image Generation)
    const phase5Timer = log.startTimer("phase5_stage_garments_and_image_gen");
    log.info("Generating cutout images and staging extracted garments", {
      totalCount: items.length,
    });

    const stagePromises = items.map(async (g, i) => {
      // Check for duplicate flag: same category and matching subcategory
      const isDuplicate = existingItems.some((ew) => {
        const ewItem = ew.item;
        if (!ewItem) return false;
        const sameCategory =
          ewItem.category?.toLowerCase() === g.category?.toLowerCase();
        const sameSubcategory =
          ewItem.subcategory?.toLowerCase() === g.subcategory?.toLowerCase();
        return sameCategory && sameSubcategory;
      });

      if (isDuplicate) {
        log.info(
          `Advisory duplicate detected for item ${i + 1}/${items.length}: "${g.name}" (${g.category} - ${g.subcategory})`,
          {
            index: i + 1,
            name: g.name,
            category: g.category,
            subcategory: g.subcategory,
          },
        );
      }

      // Generate isolated transparent catalog cutout image for the garment
      let processedImageUrl = imageUrl;
      const genTimer = log.startTimer(`image_gen_item_${i + 1}`);
      log.info(
        `Generating transparent cutout image for item ${i + 1}/${items.length}: "${g.name}"`,
        { model: imageModel, garment: g.name },
      );

      const cutoutBytes = await generateGarmentCutout(
        openRouter,
        g,
        imageUrl,
        imageModel,
        log,
      );

      if (cutoutBytes) {
        const fileName = `processed-${i + 1}-${crypto.randomUUID().slice(0, 8)}.png`;
        const storagePath = `${userId}/${uploadJobId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("wardrobe-images")
          .upload(storagePath, cutoutBytes, {
            contentType: "image/png",
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("wardrobe-images")
            .getPublicUrl(storagePath);
          processedImageUrl = publicData.publicUrl;
          genTimer.done(
            `Image generation and storage upload completed for item ${i + 1}`,
            {
              storagePath,
              publicUrl: processedImageUrl,
            },
          );
        } else {
          log.warn("Failed to upload generated cutout image to storage", {
            error: uploadError,
            storagePath,
          });
        }
      } else {
        log.warn(
          `Image generation returned no image bytes for item ${i + 1}, using original photo as fallback`,
        );
      }

      // Insert catalog item (stores the transparent cutout processed image)
      const { data: insertedItem, error: itemErr } = await supabase
        .from("item")
        .insert({
          name: g.name || "Untitled",
          brand: g.brand || null,
          category: g.category || null,
          subcategory: g.subcategory || null,
          color: g.color || null,
          material: g.material || null,
          source_type: "user_upload",
          image_url: processedImageUrl,
          created_by_user_id: userId,
        })
        .select("item_id")
        .single();

      if (itemErr) {
        log.error(
          `Failed to insert catalog item ${i + 1}/${items.length} into item table`,
          {
            error: itemErr,
            garment: g,
          },
        );
        throw itemErr;
      }

      // Insert unapproved wardrobe item (stores original photo for Source Preview)
      const { error: wardrobeErr } = await supabase
        .from("wardrobe_item")
        .insert({
          item_id: insertedItem.item_id,
          user_id: userId,
          upload_job_id: uploadJobId,
          image_url: imageUrl,
          is_approved: false,
          is_duplicate: isDuplicate,
          occasions: g.occasions ?? [],
        });

      if (wardrobeErr) {
        log.error(
          `Failed to stage wardrobe item ${i + 1}/${items.length} into wardrobe_item table`,
          {
            error: wardrobeErr,
            itemId: insertedItem.item_id,
          },
        );
        throw wardrobeErr;
      }

      log.info(`Staged garment ${i + 1}/${items.length}`, {
        index: i + 1,
        itemId: insertedItem.item_id,
        name: g.name,
        category: g.category,
        subcategory: g.subcategory,
        material: g.material,
        isDuplicate,
        processedImageUrl,
      });

      return insertedItem.item_id;
    });

    const settledResults = await Promise.allSettled(stagePromises);
    const successfulCount = settledResults.filter(
      (r) => r.status === "fulfilled",
    ).length;

    phase5Timer.done("Extracted garments and cutouts staging completed", {
      total: items.length,
      successfulCount,
    });

    if (successfulCount === 0) {
      log.error("Failed to stage any garments into database", {
        errors: settledResults
          .filter((r) => r.status === "rejected")
          .map((r) => (r as PromiseRejectedResult).reason),
      });
      await supabase
        .from("upload_job")
        .update({
          status: "failed",
          error_message: "Failed to stage extracted garments into wardrobe.",
        })
        .eq("id", uploadJobId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to stage extracted garments",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 6. Complete the upload job
    const phase6Timer = log.startTimer("phase6_complete_job");
    const { error: completeErr } = await supabase
      .from("upload_job")
      .update({
        status: "completed",
        item_count: successfulCount,
      })
      .eq("id", uploadJobId);

    if (completeErr) {
      log.error("Failed to update upload_job status to completed", {
        error: completeErr,
      });
      throw completeErr;
    }
    phase6Timer.done("Upload job marked as completed in database");

    requestTimer.done("Extraction pipeline successfully completed", {
      itemCount: items.length,
    });

    return new Response(
      JSON.stringify({ success: true, count: items.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to extract garments";
    log.error("Garment extraction pipeline failed with unhandled error", {
      error: err,
      totalDurationMs: requestTimer.elapsedMs(),
    });

    try {
      await supabase
        .from("upload_job")
        .update({
          status: "failed",
          error_message: message,
        })
        .eq("id", uploadJobId);
    } catch (dbErr) {
      log.error("Failed to update upload_job to failed status", {
        error: dbErr,
      });
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timeoutGuard);
  }
});
