import { mutationOptions } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { uploadWardrobeImage } from "@/lib/wardrobeStorage";
import { getLogger } from "@/lib/logging";
import type { UploadJob } from "../types";

export interface CreateUploadJobInput {
  userId: string;
  file: File;
  sourceType?: "wardrobe" | "calendar";
}

export const createUploadJobMutationOptions = () =>
  mutationOptions({
    mutationKey: ["wardrobe", "create-upload-job"],
    mutationFn: async ({
      userId,
      file,
      sourceType = "wardrobe",
    }: CreateUploadJobInput): Promise<UploadJob> => {
      const supabase = createBrowserSupabaseClient();
      const uploadId = crypto.randomUUID();

      // 1. Upload original photo
      const { url: originalUrl } = await uploadWardrobeImage(
        userId,
        uploadId,
        "original",
        file,
      );

      // 2. Insert upload_job record
      const { data: job, error: jobError } = await supabase
        .from("upload_job")
        .insert({
          user_id: userId,
          source_type: sourceType,
          original_image_url: originalUrl,
          status: "pending",
        })
        .select("*")
        .single();

      if (jobError) {
        const logger = getLogger(["mutation", "wardrobe"]);
        logger.error("Failed to create upload_job: {errorMessage}", {
          errorMessage: jobError.message,
          jobError,
          userId,
        });
        throw jobError;
      }

      // 3. Trigger Edge Function asynchronously
      void supabase.functions
        .invoke("extract-garments", {
          body: {
            uploadJobId: job.id,
            imageUrl: originalUrl,
            userId,
          },
        })
        .catch((err) => {
          const logger = getLogger(["mutation", "wardrobe"]);
          logger.error("Edge function invocation error: {errorMessage}", {
            errorMessage: err instanceof Error ? err.message : String(err),
            jobId: job.id,
          });
        });

      return job as UploadJob;
    },
  });
