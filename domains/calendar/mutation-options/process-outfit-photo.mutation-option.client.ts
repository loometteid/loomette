import { mutationOptions } from "@tanstack/react-query";
import {
  processOutfitPhoto,
  type ProcessOutfitPhotoOptions,
} from "@/lib/outfitDiaryProcessing";
import type { OutfitProcessingResult } from "@/stores/outfit-diary-upload-store";

export type ProcessOutfitPhotoVariables = {
  userId: string;
  file: File;
  onStepChange?: ProcessOutfitPhotoOptions["onStepChange"];
};

export const processOutfitPhotoMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({
      userId,
      file,
      onStepChange,
    }: ProcessOutfitPhotoVariables): Promise<OutfitProcessingResult> => {
      return processOutfitPhoto(userId, file, { onStepChange });
    },
  });
