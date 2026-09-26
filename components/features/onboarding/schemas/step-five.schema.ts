import { z } from "zod";

export const stepFiveSchema = z.object({
  styleTags: z.array(z.string()),
});

export type StepFiveFormValues = z.infer<typeof stepFiveSchema>;
