import { z } from "zod";

export const measurementStateSchema = z.object({
  value: z.string(),
  unit: z.string(),
});

export const stepFourSchema = z.object({
  outfitSize: z
    .enum(["xs", "s", "m", "l", "xl", "it_varies"] as const)
    .nullable()
    .optional(),
  shoeSize: z.string().trim().optional(),
  shoeRegion: z.enum(["uk", "us", "eu"] as const),
  measurements: z.object({
    height: measurementStateSchema,
    weight: measurementStateSchema,
    bust: measurementStateSchema,
    waist: measurementStateSchema,
    highHip: measurementStateSchema,
    hip: measurementStateSchema,
  }),
});

export type StepFourFormValues = z.infer<typeof stepFourSchema>;
