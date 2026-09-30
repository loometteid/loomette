import { z } from "zod";

export const stepTwoSchema = z.object({
  birthday: z.string().optional(),
  identity: z.enum(["female", "male", "non_binary", "prefer_not_to_say"] as const, {
    message: "Please select an identity",
  }),
});

export type StepTwoFormValues = z.infer<typeof stepTwoSchema>;
