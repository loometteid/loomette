export type WardrobeOption = {
  wardrobeItemId: string;
  itemId: string;
  name: string | null;
  category: string;
  subcategory: string;
  image_url: string | null;
};

export type CanvasItem = {
  wardrobeItemId: string;
  itemId: string;
  name: string | null;
  image_url: string | null;
  /** Normalized 0-1 fraction of canvas width/height, center-anchored. */
  x: number;
  y: number;
  layerOrder: number;
};
