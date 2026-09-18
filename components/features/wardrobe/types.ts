import type { Database } from "@/types/database.types";

export type OutfitSize = Database["public"]["Enums"]["outfit_size_type"];
export type Occasion = Database["public"]["Enums"]["occasion_type"];
export type Gender = Database["public"]["Enums"]["gender_type"];

export type PendingItem = {
  id: string;
  created_at: string;
  size: OutfitSize | null;
  price: number | null;
  purchase_location: string | null;
  occasions: Occasion[] | null;
  image_url: string | null;
  item: {
    item_id: string;
    name: string | null;
    category: string | null;
    subcategory: string | null;
    brand: string | null;
    color: string | null;
    material: string | null;
    image_url: string | null;
  } | null;
};

export const CATEGORY_OPTIONS = [
  { value: "Tops", label: "Tops" },
  { value: "Bottoms", label: "Bottoms" },
  { value: "Shoes", label: "Shoes" },
  { value: "Accessories", label: "Accessories" },
] as const;

// Figma's popup reference only specified Tops' subcategories
// (Shirt/Blouse/Polo); the others are a reasonable extrapolation from
// the labels visible in the 0.3 Wardrobe grid mock, not a literal spec
// — easy to adjust once real copy exists.
export const SUBCATEGORY_OPTIONS: Record<
  string,
  { value: string; label: string }[]
> = {
  Tops: [
    { value: "Shirt", label: "Shirt" },
    { value: "Blouse", label: "Blouse" },
    { value: "Polo", label: "Polo" },
  ],
  Bottoms: [
    { value: "Skirt", label: "Skirt" },
    { value: "Pants", label: "Pants" },
    { value: "Jeans", label: "Jeans" },
  ],
  Shoes: [
    { value: "Sneakers", label: "Sneakers" },
    { value: "Sandals", label: "Sandals" },
    { value: "Heels", label: "Heels" },
  ],
  Accessories: [
    { value: "Hijab", label: "Hijab" },
    { value: "Scarf", label: "Scarf" },
    { value: "Bag", label: "Bag" },
  ],
};

// Dress only shows up as a Tops subcategory for she/her users — a
// direct product call, not a general taxonomy rule.
export function getSubcategoryOptions(
  category: string | null,
  gender?: Gender | null,
) {
  if (!category) return [];
  const base = SUBCATEGORY_OPTIONS[category] ?? [];
  if (category === "Tops" && gender === "female") {
    return [...base, { value: "Dress", label: "Dress" }];
  }
  return base;
}

export const COLOR_OPTIONS = [
  { value: "white", label: "White", swatch: "#FFFFFF" },
  { value: "black", label: "Black", swatch: "#262420" },
  { value: "mint", label: "Mint", swatch: "#A9C8BE" },
  { value: "pink", label: "Pink", swatch: "#E6A0BA" },
  { value: "blue", label: "Blue", swatch: "#2E5A9C" },
  { value: "red", label: "Red", swatch: "#C1402C" },
] as const;

export const OUTFIT_SIZE_OPTIONS: { value: OutfitSize; label: string }[] = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
];

export const OCCASION_OPTIONS: { value: Occasion; label: string }[] = [
  { value: "everyday", label: "Everyday" },
  { value: "work", label: "Work" },
  { value: "going_out", label: "Going Out" },
  { value: "special", label: "Special" },
  { value: "just_vibing", label: "Just Vibing" },
];

export type TimesWorn = "never" | "1-5" | "6-10" | "a-lot";

export const TIMES_WORN_OPTIONS: { value: TimesWorn; label: string }[] = [
  { value: "never", label: "Never Worn" },
  { value: "1-5", label: "1-5 Times" },
  { value: "6-10", label: "6-10 Times" },
  { value: "a-lot", label: "Worn A Lot" },
];

export function matchesTimesWorn(wearCount: number, bucket: TimesWorn) {
  if (bucket === "never") return wearCount === 0;
  if (bucket === "1-5") return wearCount >= 1 && wearCount <= 5;
  if (bucket === "6-10") return wearCount >= 6 && wearCount <= 10;
  return wearCount > 10;
}

export type DateAdded = "week" | "month" | "year" | "older";

export const DATE_ADDED_OPTIONS: { value: DateAdded; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "older", label: "Older" },
];

export function matchesDateAdded(createdAt: string, bucket: DateAdded) {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  if (bucket === "week") return days <= 7;
  if (bucket === "month") return days <= 30;
  if (bucket === "year") return days <= 365;
  return days > 365;
}

export type WardrobeItem = {
  id: string;
  created_at: string;
  wear_count: number;
  occasions: Occasion[] | null;
  item: {
    item_id: string;
    name: string | null;
    category: string | null;
    subcategory: string | null;
    brand: string | null;
    color: string | null;
    image_url: string | null;
  } | null;
};

export type WardrobeFilters = {
  category: string | null;
  subcategory: string | null;
  colors: string[];
  occasions: Occasion[];
  timesWorn: TimesWorn | null;
  dateAdded: DateAdded | null;
};

export const EMPTY_FILTERS: WardrobeFilters = {
  category: null,
  subcategory: null,
  colors: [],
  occasions: [],
  timesWorn: null,
  dateAdded: null,
};

export function hasActiveFilters(filters: WardrobeFilters) {
  return (
    !!filters.category ||
    !!filters.subcategory ||
    filters.colors.length > 0 ||
    filters.occasions.length > 0 ||
    !!filters.timesWorn ||
    !!filters.dateAdded
  );
}

export function matchesFilters(row: WardrobeItem, filters: WardrobeFilters) {
  if (filters.category && row.item?.category !== filters.category) return false;
  if (filters.subcategory && row.item?.subcategory !== filters.subcategory)
    return false;
  if (
    filters.colors.length > 0 &&
    (!row.item?.color || !filters.colors.includes(row.item.color))
  )
    return false;
  if (
    filters.occasions.length > 0 &&
    !filters.occasions.some((o) => row.occasions?.includes(o))
  )
    return false;
  if (filters.timesWorn && !matchesTimesWorn(row.wear_count, filters.timesWorn))
    return false;
  if (filters.dateAdded && !matchesDateAdded(row.created_at, filters.dateAdded))
    return false;
  return true;
}
