import { z } from "zod";
import type {
  Gender,
  OutfitSize,
  ShoeRegion,
  WorkSetting,
} from "@/lib/profileOptions";

export const measurementStateSchema = z.object({
  value: z.string(),
  unit: z.string(),
});

export const editProfileSchema = z.object({
  profilePhoto: z.string().nullable().optional(),
  displayName: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.custom<Gender>().nullable().optional(),
  occupation: z.string().optional(),
  workSetting: z.custom<WorkSetting>().nullable().optional(),
  outfitSize: z.custom<OutfitSize>().nullable().optional(),
  shoeSize: z.string().optional(),
  shoeRegion: z.custom<ShoeRegion>(),
  measurements: z.object({
    height: measurementStateSchema,
    weight: measurementStateSchema,
    bust: measurementStateSchema,
    waist: measurementStateSchema,
    highHip: measurementStateSchema,
    hip: measurementStateSchema,
  }),
  bodyType: z.string().nullable().optional(),
  styleTags: z.array(z.string()),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
