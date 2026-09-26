import { z } from "zod";

export const stepOneSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type StepOneFormValues = z.infer<typeof stepOneSchema>;
