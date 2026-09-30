import { mutationOptions } from "@tanstack/react-query";
import { deleteOutfitPhotos } from "@/lib/outfitStorage";

export type DeleteOutfitPhotoVariables = {
  paths: string[];
};

export const deleteOutfitPhotoMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ paths }: DeleteOutfitPhotoVariables): Promise<void> => {
      await deleteOutfitPhotos(paths);
    },
  });
