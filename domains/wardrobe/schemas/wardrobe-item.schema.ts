import { z } from "zod";
import type { Occasion, OutfitSize } from "../types";

export const wardrobeItemFormSchema = z.object({
  name: z.string(),
  brand: z.string(),
  category: z.string().nullable().optional(),
  subcategory: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  size: z.custom<OutfitSize>().nullable().optional(),
  occasions: z.array(z.custom<Occasion>()),
  price: z.string(),
  purchaseLocation: z.string(),
});

export type WardrobeItemFormValues = z.infer<typeof wardrobeItemFormSchema>;
