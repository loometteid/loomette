import type { Database } from "@/types/database.types";

export type Season = Database["public"]["Enums"]["season_type"];
export type TravelCompanion = Database["public"]["Enums"]["travel_companion_type"];

export const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
];

export const TRAVEL_COMPANION_OPTIONS: { value: TravelCompanion; label: string }[] = [
  { value: "solo_trip", label: "Solo Trip" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "business", label: "Business" },
];
