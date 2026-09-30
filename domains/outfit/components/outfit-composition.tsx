import Image from "next/image";
import { cn } from "@/lib/utils";

export type CompositionItem = {
  id: string;
  image_url: string | null;
  name: string | null;
  /** Normalized 0-1 fraction of the container's width/height, center-anchored. */
  x: number;
  y: number;
  layerOrder: number;
};

// Matches Mix & Match's canvas (140px item in a ~336px-wide canvas).
// Shared so every place that renders a saved composition -- the
// canvas itself, the result screen, Calendar's grid thumbnail and its
// entry dialog -- is a true proportional scale of the same layout,
// not a separately-tuned approximation.
export const ITEM_SIZE_RATIO = 0.42;

// Default arrangement Shuffle (and the Homepage hero, which has no
// saved composition of its own) fall back to.
export const DEFAULT_SLOT_POSITIONS: Record<string, { x: number; y: number }> = {
  Tops: { x: 0.5, y: 0.28 },
  Bottoms: { x: 0.5, y: 0.58 },
  Shoes: { x: 0.5, y: 0.86 },
  Accessories: { x: 0.22, y: 0.18 },
};

export function OutfitComposition({
  items,
  itemSizeRatio = ITEM_SIZE_RATIO,
  imageSizes = "140px",
  className,
}: {
  items: CompositionItem[];
  itemSizeRatio?: number;
  imageSizes?: string;
  className?: string;
}) {
  const sorted = [...items].sort((a, b) => a.layerOrder - b.layerOrder);

  return (
    <div className={cn("relative", className)}>
      {sorted.map((item) => (
        <div
          key={item.id}
          style={{
            left: `${item.x * 100}%`,
            top: `${item.y * 100}%`,
            zIndex: item.layerOrder,
            width: `${itemSizeRatio * 100}%`,
          }}
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
        >
          {item.image_url && (
            <Image
              src={item.image_url}
              alt={item.name ?? ""}
              fill
              className="object-contain"
              sizes={imageSizes}
            />
          )}
        </div>
      ))}
    </div>
  );
}
