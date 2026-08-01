import type { Database } from "@/types/database.types";

export type StyleTag = Database["public"]["Enums"]["style_tag_type"];

export const STYLE_TAG_OPTIONS: { value: StyleTag; label: string }[] = [
  { value: "clean_minimal", label: "Clean & Minimal" },
  { value: "effortlessly_casual", label: "Effortlessly Casual" },
  { value: "office_ready", label: "Office-Ready" },
  { value: "soft_feminine", label: "Soft & Feminine" },
  { value: "bold_expressive", label: "Bold & Expressive" },
  { value: "street_inspired", label: "Street-Inspired" },
  { value: "still_figuring_it_out", label: "Still Figuring It Out" },
];

export function styleTagLabel(tag: StyleTag) {
  return STYLE_TAG_OPTIONS.find((option) => option.value === tag)?.label ?? tag;
}
