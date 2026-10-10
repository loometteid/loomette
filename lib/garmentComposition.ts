import type { CompositionItem } from "@/domains/outfit/components/outfit-composition";

export type StagedGarmentRow = {
  id: string;
  item: {
    item_id: string;
    name: string | null;
    image_url: string | null;
    category: string | null;
    subcategory: string | null;
  } | null;
};

const OUTERWEAR_REGEX =
  /\b(jacket|blazer|coat|cardigan|vest|hoodie|outerwear|overcoat|bomber|parka|windbreaker|trench)\b/i;
const INNER_TOP_REGEX =
  /\b(shirt|t-shirt|tshirt|tee|blouse|polo|tank|undershirt|camisole|henley|sweater|knitwear)\b/i;
const DRESS_REGEX = /\b(dress|gown|jumpsuit|romper|overalls)\b/i;

const NECK_ACCESSORY_REGEX =
  /\b(tie|bow tie|collar|necklace|scarf|pashmina|choker|cravat|bandana)\b/i;
const HEAD_ACCESSORY_REGEX =
  /\b(hat|cap|beanie|glasses|sunglasses|eyewear|beret|headband|hijab)\b/i;
const BAG_ACCESSORY_REGEX =
  /\b(bag|purse|tote|backpack|clutch|handbag|crossbody|satchel)\b/i;
const WAIST_ACCESSORY_REGEX = /\b(belt|sash|corset)\b/i;
const WRIST_ACCESSORY_REGEX =
  /\b(watch|bracelet|ring|glove|mittens|cuff)\b/i;

function clamp01(n: number, min = 0.05, max = 0.95): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * Automatically computes normalized (x, y) coordinates and z-layer ordering
 * for garments extracted from a single photo so they form an aesthetically
 * arranged OutfitComposition.
 */
export function layoutExtractedGarments(
  stagedRows: StagedGarmentRow[],
): CompositionItem[] {
  const validRows = stagedRows.filter(
    (row): row is StagedGarmentRow & { item: NonNullable<StagedGarmentRow["item"]> } =>
      Boolean(row.item && row.item.image_url),
  );

  if (validRows.length === 0) {
    return [];
  }

  // Partition by broad category
  const dresses: typeof validRows = [];
  const outerwearTops: typeof validRows = [];
  const innerTops: typeof validRows = [];
  const otherTops: typeof validRows = [];
  const bottoms: typeof validRows = [];
  const shoes: typeof validRows = [];
  const accessories: typeof validRows = [];
  const others: typeof validRows = [];

  for (const row of validRows) {
    const category = row.item.category?.toLowerCase() ?? "";
    const sub = `${row.item.subcategory ?? ""} ${row.item.name ?? ""}`.toLowerCase();

    if (category === "shoes") {
      shoes.push(row);
    } else if (category === "bottoms") {
      bottoms.push(row);
    } else if (category === "accessories") {
      accessories.push(row);
    } else if (
      (category === "tops" || category === "") &&
      DRESS_REGEX.test(sub) &&
      !/\b(dress shirt|dress shoes|dress pants|dress sock)\b/i.test(sub)
    ) {
      dresses.push(row);
    } else if (category === "tops") {
      if (OUTERWEAR_REGEX.test(sub)) {
        outerwearTops.push(row);
      } else if (INNER_TOP_REGEX.test(sub)) {
        innerTops.push(row);
      } else {
        otherTops.push(row);
      }
    } else {
      others.push(row);
    }
  }

  const result: CompositionItem[] = [];

  // 1. Dresses (one-piece)
  dresses.forEach((row, idx) => {
    const count = dresses.length;
    const xOffset = count > 1 ? (idx - (count - 1) / 2) * 0.08 : 0;
    result.push({
      id: row.id,
      image_url: row.item.image_url,
      name: row.item.name,
      x: clamp01(0.5 + xOffset),
      y: 0.42,
      layerOrder: 15 + idx,
    });
  });

  // 2. Bottoms
  bottoms.forEach((row, idx) => {
    const count = bottoms.length;
    const xOffset = count > 1 ? (idx - (count - 1) / 2) * 0.08 : 0;
    result.push({
      id: row.id,
      image_url: row.item.image_url,
      name: row.item.name,
      x: clamp01(0.5 + xOffset),
      y: 0.58,
      layerOrder: 10 + idx,
    });
  });

  // 3. Inner tops (shirts, t-shirts)
  const hasOuterwear = outerwearTops.length > 0;
  innerTops.forEach((row, idx) => {
    const count = innerTops.length;
    const xOffset = count > 1 ? (idx - (count - 1) / 2) * 0.08 : 0;
    result.push({
      id: row.id,
      image_url: row.item.image_url,
      name: row.item.name,
      x: clamp01(0.5 + xOffset),
      y: hasOuterwear ? 0.26 : 0.28,
      layerOrder: 20 + idx,
    });
  });

  // 4. Other tops
  otherTops.forEach((row, idx) => {
    const count = otherTops.length;
    const xOffset = count > 1 ? (idx - (count - 1) / 2) * 0.08 : 0;
    result.push({
      id: row.id,
      image_url: row.item.image_url,
      name: row.item.name,
      x: clamp01(0.5 + xOffset),
      y: 0.28,
      layerOrder: 22 + idx,
    });
  });

  // 5. Outerwear tops (jackets, blazers, coats - sit on top of inner tops)
  outerwearTops.forEach((row, idx) => {
    const count = outerwearTops.length;
    const xOffset = count > 1 ? (idx - (count - 1) / 2) * 0.08 : 0;
    result.push({
      id: row.id,
      image_url: row.item.image_url,
      name: row.item.name,
      x: clamp01(0.5 + xOffset),
      y: 0.3,
      layerOrder: 26 + idx,
    });
  });

  // 6. Shoes
  shoes.forEach((row, idx) => {
    const count = shoes.length;
    const xOffset = count > 1 ? (idx - (count - 1) / 2) * 0.12 : 0;
    result.push({
      id: row.id,
      image_url: row.item.image_url,
      name: row.item.name,
      x: clamp01(0.5 + xOffset),
      y: 0.86,
      layerOrder: 40 + idx,
    });
  });

  // 7. Accessories
  let genericAccessoryCount = 0;
  accessories.forEach((row, idx) => {
    const sub = `${row.item.subcategory ?? ""} ${row.item.name ?? ""}`.toLowerCase();

    if (NECK_ACCESSORY_REGEX.test(sub)) {
      result.push({
        id: row.id,
        image_url: row.item.image_url,
        name: row.item.name,
        x: 0.5,
        y: 0.22,
        layerOrder: 35 + idx,
      });
    } else if (HEAD_ACCESSORY_REGEX.test(sub)) {
      result.push({
        id: row.id,
        image_url: row.item.image_url,
        name: row.item.name,
        x: 0.5,
        y: 0.1,
        layerOrder: 50 + idx,
      });
    } else if (BAG_ACCESSORY_REGEX.test(sub)) {
      result.push({
        id: row.id,
        image_url: row.item.image_url,
        name: row.item.name,
        x: 0.22,
        y: 0.45,
        layerOrder: 45 + idx,
      });
    } else if (WAIST_ACCESSORY_REGEX.test(sub)) {
      result.push({
        id: row.id,
        image_url: row.item.image_url,
        name: row.item.name,
        x: 0.5,
        y: 0.45,
        layerOrder: 28 + idx,
      });
    } else if (WRIST_ACCESSORY_REGEX.test(sub)) {
      result.push({
        id: row.id,
        image_url: row.item.image_url,
        name: row.item.name,
        x: 0.78,
        y: 0.5,
        layerOrder: 45 + idx,
      });
    } else {
      // Alternate left/right side
      const isLeft = genericAccessoryCount % 2 === 0;
      genericAccessoryCount++;
      result.push({
        id: row.id,
        image_url: row.item.image_url,
        name: row.item.name,
        x: isLeft ? 0.22 : 0.78,
        y: 0.2,
        layerOrder: 45 + idx,
      });
    }
  });

  // 8. Others
  others.forEach((row, idx) => {
    result.push({
      id: row.id,
      image_url: row.item.image_url,
      name: row.item.name,
      x: 0.5,
      y: 0.5,
      layerOrder: 12 + idx,
    });
  });

  return result;
}

/**
 * Returns the primary processed cutout image URL from the extracted items
 * to use as cover_image_url and previewUrl fallback.
 */
export function getPrimaryProcessedImageUrl(
  items: CompositionItem[],
  stagedRows?: StagedGarmentRow[],
): string | null {
  if (items.length === 0) return null;

  // Prefer outerwear top or top item
  if (stagedRows) {
    const outerwear = stagedRows.find(
      (r) =>
        r.item?.image_url &&
        r.item.category?.toLowerCase() === "tops" &&
        OUTERWEAR_REGEX.test(
          `${r.item.subcategory ?? ""} ${r.item.name ?? ""}`,
        ),
    );
    if (outerwear?.item?.image_url) return outerwear.item.image_url;

    const anyTop = stagedRows.find(
      (r) =>
        r.item?.image_url && r.item.category?.toLowerCase() === "tops",
    );
    if (anyTop?.item?.image_url) return anyTop.item.image_url;

    const dress = stagedRows.find(
      (r) =>
        r.item?.image_url &&
        DRESS_REGEX.test(`${r.item.subcategory ?? ""} ${r.item.name ?? ""}`),
    );
    if (dress?.item?.image_url) return dress.item.image_url;
  }

  // Fall back to first item with valid image_url
  const first = items.find((i) => Boolean(i.image_url));
  return first?.image_url ?? null;
}
