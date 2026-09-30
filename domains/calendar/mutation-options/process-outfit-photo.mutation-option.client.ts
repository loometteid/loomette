import { mutationOptions } from "@tanstack/react-query";
import { processOutfitPhoto } from "@/lib/outfitDiaryProcessing";
import type { OutfitProcessingResult } from "@/stores/outfit-diary-upload-store";

export type ProcessOutfitPhotoVariables = {
  userId: string;
  file: File;
};

export const processOutfitPhotoMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      userId,
      file,
    }: ProcessOutfitPhotoVariables): Promise<OutfitProcessingResult> => {
      return processOutfitPhoto(userId, file);
    },
  });
