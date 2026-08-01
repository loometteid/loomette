import type { Database } from "@/types/database.types";

export type Gender = Database["public"]["Enums"]["gender_type"];
export type WorkSetting = Database["public"]["Enums"]["work_setting_type"];
export type OutfitSize = Database["public"]["Enums"]["outfit_size_type"];
export type ShoeRegion = Database["public"]["Enums"]["shoe_size_region_type"];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "She / Her" },
  { value: "male", label: "He / Him" },
  { value: "non_binary", label: "They / Them" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const WORK_SETTING_OPTIONS: { value: WorkSetting; label: string }[] = [
  { value: "in_office", label: "In-Office" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on_the_go", label: "On The Go" },
];

export const OUTFIT_SIZE_OPTIONS: { value: OutfitSize; label: string }[] = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "it_varies", label: "It Varies" },
];

export const SHOE_REGIONS: ShoeRegion[] = ["uk", "us", "eu"];

// No schema-backed option list exists for body type -- the Figma only
// shows the currently-selected value ("Hourglass") in a collapsed
// dropdown, not the full set. This is a fixed set of common fashion
// body-shape categories, stored as plain text (see the body_type
// migration for the reasoning).
export const BODY_TYPE_OPTIONS = [
  "Hourglass",
  "Pear",
  "Apple",
  "Rectangle",
  "Inverted Triangle",
] as const;

export type MeasurementKey =
  | "height"
  | "weight"
  | "bust"
  | "waist"
  | "highHip"
  | "hip";
export type MeasurementColumn =
  | "height"
  | "weight"
  | "bust_size"
  | "waist_size"
  | "high_hip_size"
  | "hip_size";

export type MeasurementState = { value: string; unit: string };

export const LENGTH_UNITS = ["cm", "in"] as const;
export const WEIGHT_UNITS = ["kg", "lbs"] as const;

export const MEASUREMENT_FIELDS: {
  key: MeasurementKey;
  label: string;
  placeholder: string;
  units: readonly string[];
  column: MeasurementColumn;
  kind: "length" | "weight";
}[] = [
  {
    key: "height",
    label: "Height",
    placeholder: "e.g. 160",
    units: LENGTH_UNITS,
    column: "height",
    kind: "length",
  },
  {
    key: "weight",
    label: "Weight",
    placeholder: "e.g. 55",
    units: WEIGHT_UNITS,
    column: "weight",
    kind: "weight",
  },
  {
    key: "bust",
    label: "Bust Size",
    placeholder: "e.g. 90",
    units: LENGTH_UNITS,
    column: "bust_size",
    kind: "length",
  },
  {
    key: "waist",
    label: "Waist Size",
    placeholder: "e.g. 60",
    units: LENGTH_UNITS,
    column: "waist_size",
    kind: "length",
  },
  {
    key: "highHip",
    label: "High Hip",
    placeholder: "e.g. 80",
    units: LENGTH_UNITS,
    column: "high_hip_size",
    kind: "length",
  },
  {
    key: "hip",
    label: "Hip Size",
    placeholder: "e.g. 90",
    units: LENGTH_UNITS,
    column: "hip_size",
    kind: "length",
  },
];

export const EMPTY_MEASUREMENTS: Record<MeasurementKey, MeasurementState> = {
  height: { value: "", unit: "cm" },
  weight: { value: "", unit: "kg" },
  bust: { value: "", unit: "cm" },
  waist: { value: "", unit: "cm" },
  highHip: { value: "", unit: "cm" },
  hip: { value: "", unit: "cm" },
};

// Values are always stored canonically (cm / kg) -- this converts a
// user-entered value in whichever unit they picked back to that
// canonical form before saving.
export function toCanonicalMeasurement(
  value: number,
  unit: string,
  kind: "length" | "weight",
) {
  if (kind === "weight") {
    return Math.round(unit === "lbs" ? value * 0.453592 : value);
  }
  return Math.round(unit === "in" ? value * 2.54 : value);
}
