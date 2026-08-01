export type DiaryOutfitItem = {
  id: string;
  image_url: string | null;
  name: string | null;
  x: number;
  y: number;
  layerOrder: number;
};

export type DiaryEntry = {
  id: string;
  worn_on: string;
  outfit: {
    id: string;
    cover_image_url: string | null;
    items: DiaryOutfitItem[];
  } | null;
};
