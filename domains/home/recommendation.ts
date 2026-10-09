import {
  DEFAULT_SLOT_POSITIONS,
  type CompositionItem,
} from "@/domains/outfit/components/outfit-composition";
import type { WardrobeItem } from "@/domains/wardrobe/types";

export type RecommendationPiece = {
  id: string;
  name: string;
  category: "Tops" | "Bottoms" | "Shoes" | "Accessories";
  imageUrl: string;
  sourceType: "wardrobe" | "ai_generated" | "trending";
  badgeText: string;
  originalPrice?: string;
  discountPrice?: string;
  wardrobeItemId?: string;
  x: number;
  y: number;
  layerOrder: number;
  sizeRatio?: number;
};

export type OutfitRecommendation = {
  id: string;
  title: string;
  pieces: RecommendationPiece[];
  compositionItems: CompositionItem[];
};

export const RECOMMENDATION_SLOT_CONFIG: Record<
  "Tops" | "Bottoms" | "Shoes" | "Accessories",
  { x: number; y: number; sizeRatio: number }
> = {
  Accessories: { x: 0.30, y: 0.18, sizeRatio: 0.46 },
  Tops: { x: 0.50, y: 0.28, sizeRatio: 0.72 },
  Bottoms: { x: 0.50, y: 0.58, sizeRatio: 0.76 },
  Shoes: { x: 0.58, y: 0.86, sizeRatio: 0.40 },
};

const FALLBACK_PIECES: Record<string, Omit<RecommendationPiece, "x" | "y" | "layerOrder">> = {
  Tops: {
    id: "fallback-top",
    name: "Blue shirt",
    category: "Tops",
    imageUrl: "/brand/recommendation/blue-shirt.png",
    sourceType: "wardrobe",
    badgeText: "FROM WARDROBE",
  },
  Bottoms: {
    id: "fallback-bottom",
    name: "Polkadot skirt",
    category: "Bottoms",
    imageUrl: "/brand/recommendation/polkadot-skirt.png",
    sourceType: "ai_generated",
    badgeText: "AI GENERATED",
  },
  Shoes: {
    id: "fallback-shoes",
    name: "Pink sneakers",
    category: "Shoes",
    imageUrl: "/brand/recommendation/pink-sneakers.png",
    sourceType: "ai_generated",
    badgeText: "AI GENERATED",
  },
  Accessories: {
    id: "fallback-acc",
    name: "Pink Pashmina",
    category: "Accessories",
    imageUrl: "/brand/recommendation/pink-pashmina.png",
    sourceType: "trending",
    badgeText: "#1 TRENDING",
    originalPrice: "Rp39.000",
    discountPrice: "Rp29.000",
  },
};

export function generateRandomRecommendations(
  wardrobeItems: WardrobeItem[],
  seedOffset = 0,
): OutfitRecommendation {
  const tops = wardrobeItems.filter((i) => i.item?.category === "Tops" && i.item?.image_url);
  const bottoms = wardrobeItems.filter((i) => i.item?.category === "Bottoms" && i.item?.image_url);
  const shoes = wardrobeItems.filter((i) => i.item?.category === "Shoes" && i.item?.image_url);
  const accessories = wardrobeItems.filter((i) => i.item?.category === "Accessories" && i.item?.image_url);

  function pickItem(list: WardrobeItem[], cat: "Tops" | "Bottoms" | "Shoes" | "Accessories"): RecommendationPiece {
    const slot = RECOMMENDATION_SLOT_CONFIG[cat];
    const layerOrder = cat === "Bottoms" ? 0 : cat === "Tops" ? 1 : cat === "Shoes" ? 2 : 3;

    if (list.length > 0) {
      const idx = Math.abs((seedOffset * 7 + 3)) % list.length;
      const picked = list[idx];
      return {
        id: picked.id,
        name: picked.item?.name || cat,
        category: cat,
        imageUrl: picked.item!.image_url!,
        sourceType: "wardrobe",
        badgeText: "FROM WARDROBE",
        wardrobeItemId: picked.id,
        x: slot.x,
        y: slot.y,
        layerOrder,
        sizeRatio: slot.sizeRatio,
      };
    }

    const fallback = FALLBACK_PIECES[cat];
    return {
      ...fallback,
      x: slot.x,
      y: slot.y,
      layerOrder,
      sizeRatio: slot.sizeRatio,
    };
  }

  const pieces: RecommendationPiece[] = [
    pickItem(tops, "Tops"),
    pickItem(bottoms, "Bottoms"),
    pickItem(shoes, "Shoes"),
    pickItem(accessories, "Accessories"),
  ];

  const compositionItems: CompositionItem[] = pieces.map((p) => ({
    id: p.id,
    name: p.name,
    image_url: p.imageUrl,
    x: p.x,
    y: p.y,
    layerOrder: p.layerOrder,
    sizeRatio: p.sizeRatio,
  }));

  return {
    id: `rec-${seedOffset}`,
    title: "Outfit Recommendation",
    pieces,
    compositionItems,
  };
}
