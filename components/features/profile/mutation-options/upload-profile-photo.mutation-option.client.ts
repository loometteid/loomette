import { mutationOptions } from "@tanstack/react-query";
import { uploadProfilePhoto } from "@/lib/profileStorage";

export type UploadProfilePhotoVariables = {
  userId: string;
  file: File;
};

export const uploadProfilePhotoMutationOptions = () =>
  mutationOptions({
    mutationFn: async ({ userId, file }: UploadProfilePhotoVariables) => {
      return await uploadProfilePhoto(userId, file);
    },
  });
