import { z } from "zod";

export const stepThreeSchema = z.object({
  profession: z.string().trim().optional(),
  workSetting: z
    .enum(["in_office", "remote", "hybrid", "on_the_go"] as const)
    .nullable()
    .optional(),
});

export type StepThreeFormValues = z.infer<typeof stepThreeSchema>;
