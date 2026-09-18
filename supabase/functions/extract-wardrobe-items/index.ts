import { corsHeaders } from "../_shared/cors.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

// Gemini's image-understanding guide currently documents segmentation with
// this model. It has a free tier; GEMINI_MODEL can override it without a code
// change if pricing or model availability changes.
const DEFAULT_MODEL = "gemini-3.8-flash";
const MAX_ITEMS = 8;
const CATEGORIES = ["Tops", "Bottoms", "Shoes", "Accessories"] as const;
const SUBCATEGORIES = [
  "Shirt",
  "Blouse",
  "Polo",
  "Dress",
  "Skirt",
  "Pants",
  "Jeans",
  "Sneakers",
  "Sandals",
  "Heels",
  "Hijab",
  "Scarf",
  "Bag",
  "Other",
] as const;
const COLORS = [
  "white",
  "black",
  "mint",
  "pink",
  "blue",
  "red",
  "other",
] as const;

const responseSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "A short, user-friendly English name for the garment, without guessing a brand.",
          },
          category: {
            type: "string",
            enum: CATEGORIES,
          },
          subcategory: {
            type: "string",
            enum: SUBCATEGORIES,
          },
          color: {
            type: "string",
            enum: COLORS,
          },
          material: {
            type: "string",
            description:
              "The visible material, such as cotton, denim, leather, knit, or unknown.",
          },
          box_2d: {
            type: "array",
            description:
              "The garment bounding box as [ymin, xmin, ymax, xmax], normalized from 0 to 1000.",
            items: { type: "integer" },
          },
          mask: {
            type: "array",
            description:
              "The garment contour inside its bounding box as [x, y] points normalized from 0 to 1000.",
            items: {
              type: "array",
              items: { type: "integer" },
            },
          },
        },
        required: [
          "name",
          "category",
          "subcategory",
          "color",
          "material",
          "box_2d",
          "mask",
        ],
      },
    },
  },
  required: ["items"],
};

type GeminiItem = {
  name: unknown;
  category: unknown;
  subcategory: unknown;
  color: unknown;
  material: unknown;
  box_2d: unknown;
  mask: unknown;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function publishableKey() {
  const legacyKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacyKey) return legacyKey;

  const rawKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (!rawKeys) return null;
  try {
    const keys = JSON.parse(rawKeys) as Record<string, string>;
    return keys.default ?? Object.values(keys)[0] ?? null;
  } catch {
    return null;
  }
}

async function authenticatedUserId(request: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const apiKey = publishableKey();
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !apiKey || !authorization) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: apiKey },
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: string };
  return user.id ?? null;
}

function validSourceUrl(imageUrl: string, userId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) return false;

  try {
    const source = new URL(imageUrl);
    const project = new URL(supabaseUrl);
    const expectedPath = `/storage/v1/object/public/wardrobe-images/${userId}/`;
    return (
      source.origin === project.origin &&
      source.pathname.startsWith(expectedPath)
    );
  } catch {
    return false;
  }
}

function numberInRange(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(1000, Math.round(value)))
    : null;
}

function normalizeItem(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const item = value as GeminiItem;

  if (!Array.isArray(item.box_2d) || item.box_2d.length !== 4) return null;
  const box = item.box_2d.map(numberInRange);
  if (box.some((coordinate) => coordinate === null)) return null;
  const [ymin, xmin, ymax, xmax] = box as number[];
  if (ymax - ymin < 10 || xmax - xmin < 10) return null;

  const mask = Array.isArray(item.mask)
    ? item.mask
        .map((point) => {
          if (!Array.isArray(point) || point.length !== 2) return null;
          const x = numberInRange(point[0]);
          const y = numberInRange(point[1]);
          return x === null || y === null ? null : [x, y];
        })
        .filter((point): point is number[] => point !== null)
        .slice(0, 300)
    : [];

  const text = (input: unknown, fallback: string, maxLength = 80) =>
    typeof input === "string" && input.trim()
      ? input.trim().slice(0, maxLength)
      : fallback;

  const category = CATEGORIES.includes(
    item.category as (typeof CATEGORIES)[number],
  )
    ? (item.category as (typeof CATEGORIES)[number])
    : "Accessories";
  const subcategory = SUBCATEGORIES.includes(
    item.subcategory as (typeof SUBCATEGORIES)[number],
  )
    ? (item.subcategory as (typeof SUBCATEGORIES)[number])
    : "Other";
  const color = COLORS.includes(item.color as (typeof COLORS)[number])
    ? (item.color as (typeof COLORS)[number])
    : "other";

  return {
    name: text(item.name, "Untitled piece", 120),
    category,
    subcategory,
    color,
    material: text(item.material, "unknown", 60),
    box_2d: [ymin, xmin, ymax, xmax],
    mask,
  };
}

function outputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string") return record.output_text;

  const steps = record.steps;
  if (Array.isArray(steps)) {
    for (const step of [...steps].reverse()) {
      if (!step || typeof step !== "object") continue;
      const content = (step as Record<string, unknown>).content;
      if (!Array.isArray(content)) continue;
      const text = content
        .map((part) =>
          part && typeof part === "object"
            ? (part as Record<string, unknown>).text
            : null,
        )
        .find((part): part is string => typeof part === "string");
      if (text) return text;
    }
  }

  // Keep compatibility with GenerateContent-style responses.
  const candidates = record.candidates;
  if (!Array.isArray(candidates)) return null;
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const content = (candidate as Record<string, unknown>).content;
    if (!content || typeof content !== "object") continue;
    const parts = (content as Record<string, unknown>).parts;
    if (!Array.isArray(parts)) continue;
    const text = parts
      .map((part) =>
        part && typeof part === "object"
          ? (part as Record<string, unknown>).text
          : null,
      )
      .find((part): part is string => typeof part === "string");
    if (text) return text;
  }
  return null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const userId = await authenticatedUserId(request);
    if (!userId) return json(401, { error: "Sign in is required" });

    const body = (await request.json()) as {
      imageUrl?: unknown;
      mimeType?: unknown;
    };
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
    const mimeType =
      typeof body.mimeType === "string" &&
      ["image/jpeg", "image/png", "image/webp"].includes(body.mimeType)
        ? body.mimeType
        : "image/jpeg";

    if (!validSourceUrl(imageUrl, userId)) {
      return json(400, { error: "Invalid wardrobe image URL" });
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return json(500, { error: "GEMINI_API_KEY is not configured" });
    }

    const model = Deno.env.get("GEMINI_MODEL") ?? DEFAULT_MODEL;
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          model,
          store: false,
          input: [
            {
              type: "text",
              text: `Identify only distinct wearable fashion items visibly worn or carried by the main person. Include tops, bottoms, dresses, shoes, hijabs, scarves, and bags. Exclude the person, skin, hair, background, phones, furniture, and jewelry. Do not invent hidden garments or brands. Return at most ${MAX_ITEMS} items. Use the closest allowed category, subcategory, and color; use Other/other when none fits. For every item, return a tight box_2d and a contour mask. The box is [ymin, xmin, ymax, xmax] normalized to 0-1000 across the full image. Each mask point is [x, y] normalized to 0-1000 inside that item's bounding box.`,
            },
            { type: "image", uri: imageUrl, mime_type: mimeType },
          ],
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: responseSchema,
          },
          generation_config: { thinking_level: "low" },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const detail = (await geminiResponse.text()).slice(0, 500);
      console.error("Gemini request failed", geminiResponse.status, detail);
      const message =
        geminiResponse.status === 429
          ? "Gemini's free quota is temporarily exhausted. Please try again later."
          : "Gemini could not analyze this photo.";
      return json(502, { error: message });
    }

    const geminiPayload = (await geminiResponse.json()) as unknown;
    const rawText = outputText(geminiPayload);
    if (!rawText) return json(502, { error: "Gemini returned no result" });

    const parsed = JSON.parse(rawText) as { items?: unknown };
    const items = Array.isArray(parsed.items)
      ? parsed.items
          .map(normalizeItem)
          .filter((item) => item !== null)
          .slice(0, MAX_ITEMS)
      : [];

    return json(200, { items, model });
  } catch (error) {
    console.error("extract-wardrobe-items failed", error);
    return json(500, { error: "The outfit could not be analyzed" });
  }
});
