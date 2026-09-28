export type ResultItem = {
  id: string;
  name: string | null;
  image_url: string | null;
  x: number;
  y: number;
  layerOrder: number;
};

export type OutfitResultData = {
  outfit: {
    id: string;
    name: string | null;
    userId: string;
    isSaved: boolean;
  };
  items: ResultItem[];
};
