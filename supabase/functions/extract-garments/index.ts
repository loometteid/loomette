import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenAI, Type } from "npm:@google/genai";
import { createLogger } from "./logger.ts";
import { createFetch } from "./fetch.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export type Occasion =
  "everyday" | "work" | "going_out" | "special" | "just_vibing";

interface ExtractedGarment {
  name: string;
  brand?: string;
  category: "Tops" | "Bottoms" | "Shoes" | "Accessories";
  subcategory: string;
  color?: string;
  occasions?: Occasion[];
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] (0 - 1000)
}

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

const rootLogger = createLogger({}, "extract-garments");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    rootLogger.debug("CORS preflight request handled");
    return new Response("ok", { headers: corsHeaders });
  }

  const requestTimer = rootLogger.startTimer("total_request");

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? "";

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

    // 3. Call Gemini Vision API using the official @google/genai SDK
    const phase3Timer = log.startTimer("phase3_gemini_vision");
    const prompt = `You are a fashion catalog expert for Loomette. Analyze this outfit or garment photo.
Identify each distinct garment, pair of shoes, or fashion accessory worn or shown.
Extract attributes: name, brand, category (Tops, Bottoms, Shoes, Accessories), subcategory, color, occasions (only choose from: everyday, work, going_out, special, just_vibing), and box_2d.`;

    let items: ExtractedGarment[] = [];

    if (geminiApiKey) {
      const modelName = "gemini-3.6-flash";
      log.info("Calling Gemini Vision API for garment decomposition", {
        model: modelName,
      });

      const { fetch: loggedFetch, getAttempt } = createFetch(log, modelName);
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          fetch: loggedFetch,
          timeout: 20_000, // 20s timeout per attempt to prevent indefinite socket hangs
          retryOptions: {
            attempts: 3, // 1 initial request + up to 2 retries
            initialDelay: 1.0, // 1.0s initial delay
            maxDelay: 4.0, // 4.0s max delay
            expBase: 2.0, // exponential backoff multiplier
            jitter: 1.0, // randomized jitter
            httpStatusCodes: [408, 429, 500, 502, 503, 504],
          },
        },
      });

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [
            prompt,
            {
              inlineData: {
                data: base64Image,
                mimeType: contentType,
              },
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              description:
                "List of clothing items and fashion accessories extracted from the image",
              properties: {
                items: {
                  type: Type.ARRAY,
                  description:
                    "Extracted clothing items, footwear, and fashion accessories detected in the image",
                  items: {
                    type: Type.OBJECT,
                    description:
                      "An individual garment or accessory detected in the photo",
                    properties: {
                      name: {
                        type: Type.STRING,
                        description:
                          "Descriptive item name (e.g., 'Dark Wash Straight Leg Jeans', 'White Cotton T-Shirt')",
                      },
                      brand: {
                        type: Type.STRING,
                        description:
                          "Brand or fashion designer name if visibly identifiable, otherwise an empty string",
                      },
                      category: {
                        type: Type.STRING,
                        enum: ["Tops", "Bottoms", "Shoes", "Accessories"],
                        description:
                          "Broad garment category classification (Tops, Bottoms, Shoes, or Accessories)",
                      },
                      subcategory: {
                        type: Type.STRING,
                        description:
                          "Specific item subcategory (e.g., Shirt, Blouse, Polo, Jeans, Pants, Skirt, Sneakers, Heels, Sandals, Bag, Scarf, Hijab)",
                      },
                      color: {
                        type: Type.STRING,
                        description:
                          "Primary visual color of the garment (e.g., White, Black, Navy, Light Blue, Red)",
                      },
                      occasions: {
                        type: Type.ARRAY,
                        description:
                          "List of suitable wearing occasions matching the application taxonomy",
                        items: {
                          type: Type.STRING,
                          enum: [
                            "everyday",
                            "work",
                            "going_out",
                            "special",
                            "just_vibing",
                          ],
                          description:
                            "Allowed occasion: everyday (casual/daily), work (office/business), going_out (evening/party), special (formal/events), or just_vibing (relaxed/lounge)",
                        },
                      },
                      box_2d: {
                        type: Type.ARRAY,
                        description:
                          "Bounding box coordinates of the detected item on the image normalized to 0-1000 in [ymin, xmin, ymax, xmax] format",
                        items: { type: Type.INTEGER },
                      },
                    },
                    required: ["name", "category", "subcategory"],
                  },
                },
              },
              required: ["items"],
            },
          },
        });
      } catch (geminiError) {
        log.error(
          "Gemini Vision API garment decomposition failed after all attempts",
          {
            model: "gemini-3.6-flash",
            totalAttempts: getAttempt(),
            durationMs: phase3Timer.elapsedMs(),
            error: geminiError,
          },
        );
        throw geminiError;
      }

      const rawText = response.text || "{}";
      const usage = response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            candidatesTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
          }
        : undefined;

      phase3Timer.done("Gemini Vision decomposition completed", {
        model: "gemini-3.6-flash",
        usage,
        rawTextLength: rawText.length,
      });

      try {
        const parsed = JSON.parse(rawText);
        items = Array.isArray(parsed.items) ? parsed.items : [];
      } catch (parseErr) {
        log.error("Failed to parse Gemini output as JSON", {
          rawText,
          error: parseErr,
        });
        throw new Error("Invalid JSON response from Gemini model");
      }

      log.info("Extracted garments parsed from Gemini response", {
        detectedCount: items.length,
        garments: items.map((i) => ({
          name: i.name,
          category: i.category,
          subcategory: i.subcategory,
        })),
      });
    } else {
      log.warn(
        "GEMINI_API_KEY is not configured. Falling back to mock garment extraction stub.",
      );
      items = [
        {
          name: "Blue shirt",
          brand: "",
          category: "Tops",
          subcategory: "Shirt",
          color: "Blue",
          occasions: ["everyday", "work"],
          box_2d: [100, 100, 500, 500],
        },
      ];
      phase3Timer.done("Mock garment extraction completed (no API key)");
    }

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

    // 5. Stage each extracted garment into item and wardrobe_item
    const phase5Timer = log.startTimer("phase5_stage_garments");
    log.info("Staging extracted garments into catalog and approval queue", {
      totalCount: items.length,
    });

    for (let i = 0; i < items.length; i++) {
      const g = items[i];

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

      // Insert catalog item
      const { data: insertedItem, error: itemErr } = await supabase
        .from("item")
        .insert({
          name: g.name || "Untitled",
          brand: g.brand || null,
          category: g.category || null,
          subcategory: g.subcategory || null,
          color: g.color || null,
          source_type: "user_upload",
          image_url: imageUrl,
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

      // Insert unapproved wardrobe item
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
        isDuplicate,
      });
    }

    phase5Timer.done("All extracted garments successfully staged", {
      count: items.length,
    });

    // 6. Complete the upload job
    const phase6Timer = log.startTimer("phase6_complete_job");
    const { error: completeErr } = await supabase
      .from("upload_job")
      .update({
        status: "completed",
        item_count: items.length,
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
  }
});
