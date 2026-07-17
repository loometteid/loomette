"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { OnboardingShell } from "./onboarding-shell";
import { PillToggleGroup } from "./pill-toggle-group";
import type { Database } from "@/types/database.types";

type OutfitSize = Database["public"]["Enums"]["outfit_size_type"];
type ShoeRegion = Database["public"]["Enums"]["shoe_size_region_type"];

const OUTFIT_SIZE_OPTIONS: { value: OutfitSize; label: string }[] = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL" },
  { value: "it_varies", label: "It Varies" },
];

const SHOE_REGIONS: ShoeRegion[] = ["uk", "us", "eu"];

type MeasurementKey =
  "height" | "weight" | "bust" | "waist" | "highHip" | "hip";
type MeasurementColumn =
  | "height"
  | "weight"
  | "bust_size"
  | "waist_size"
  | "high_hip_size"
  | "hip_size";

type MeasurementState = { value: string; unit: string };

const LENGTH_UNITS = ["cm", "in"] as const;
const WEIGHT_UNITS = ["kg", "lbs"] as const;

const MEASUREMENT_FIELDS: {
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

const EMPTY_MEASUREMENTS: Record<MeasurementKey, MeasurementState> = {
  height: { value: "", unit: "cm" },
  weight: { value: "", unit: "kg" },
  bust: { value: "", unit: "cm" },
  waist: { value: "", unit: "cm" },
  highHip: { value: "", unit: "cm" },
  hip: { value: "", unit: "cm" },
};

function toCanonical(value: number, unit: string, kind: "length" | "weight") {
  if (kind === "weight") {
    return Math.round(unit === "lbs" ? value * 0.453592 : value);
  }
  return Math.round(unit === "in" ? value * 2.54 : value);
}

function UnitSelect({
  value,
  units,
  onChange,
}: {
  value: string;
  units: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Unit"
      className="border-transparent bg-secondary text-foreground rounded-lg border px-2 text-sm uppercase outline-none"
    >
      {units.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </select>
  );
}

function MeasurementField({
  label,
  placeholder,
  units,
  state,
  onChange,
}: {
  label: string;
  placeholder: string;
  units: readonly string[];
  state: MeasurementState;
  onChange: (next: MeasurementState) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          {label}
        </Label>
        <Badge>Optional</Badge>
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={state.value}
          onChange={(event) =>
            onChange({ ...state, value: event.target.value })
          }
          className="flex-1"
        />
        <UnitSelect
          value={state.unit}
          units={units}
          onChange={(unit) => onChange({ ...state, unit })}
        />
      </div>
    </div>
  );
}

export function StepFourForm() {
  const router = useRouter();
  const [outfitSize, setOutfitSize] = useState<OutfitSize | null>(null);
  const [shoeSize, setShoeSize] = useState("");
  const [shoeRegion, setShoeRegion] = useState<ShoeRegion>("uk");
  const [measurements, setMeasurements] =
    useState<Record<MeasurementKey, MeasurementState>>(EMPTY_MEASUREMENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateMeasurement(key: MeasurementKey, next: MeasurementState) {
    setMeasurements((prev) => ({ ...prev, [key]: next }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/sign-in");
      return;
    }

    const update: Record<string, unknown> = {
      outfit_size: outfitSize,
    };

    if (shoeSize.trim()) {
      update.shoe_size = shoeSize.trim();
      update.shoe_size_region = shoeRegion;
    }

    for (const field of MEASUREMENT_FIELDS) {
      const state = measurements[field.key];
      const parsed = Number(state.value);
      if (state.value.trim() && !Number.isNaN(parsed)) {
        update[field.column] = toCanonical(parsed, state.unit, field.kind);
      }
    }

    const { error } = await supabase
      .from("user")
      .update(update)
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/onboarding/5");
  }

  return (
    <OnboardingShell
      step={4}
      totalSteps={5}
      title="Dress for your body, not the other way."
      subtitle="All optional. Fill in what's useful to you."
      onSubmit={handleSubmit}
      continueLabel={loading ? "Saving…" : "Continue"}
      continueDisabled={loading}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs tracking-wide uppercase">
            Outfit size
          </Label>
          <Badge>Optional</Badge>
        </div>
        <PillToggleGroup
          options={OUTFIT_SIZE_OPTIONS}
          isSelected={(value) => outfitSize === value}
          onToggle={(value) => setOutfitSize(value as OutfitSize)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="onboarding-shoe-size"
            className="text-muted-foreground text-xs tracking-wide uppercase"
          >
            Shoe size
          </Label>
          <Badge>Optional</Badge>
        </div>
        <div className="flex gap-2">
          <Input
            id="onboarding-shoe-size"
            placeholder="e.g. 38, 39 — whatever you go by"
            value={shoeSize}
            onChange={(event) => setShoeSize(event.target.value)}
            className="flex-1"
          />
          <UnitSelect
            value={shoeRegion}
            units={SHOE_REGIONS}
            onChange={(value) => setShoeRegion(value as ShoeRegion)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MeasurementField
          label="Height"
          placeholder="e.g. 160"
          units={LENGTH_UNITS}
          state={measurements.height}
          onChange={(next) => updateMeasurement("height", next)}
        />
        <MeasurementField
          label="Weight"
          placeholder="e.g. 55"
          units={WEIGHT_UNITS}
          state={measurements.weight}
          onChange={(next) => updateMeasurement("weight", next)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MeasurementField
          label="Bust Size"
          placeholder="e.g. 90"
          units={LENGTH_UNITS}
          state={measurements.bust}
          onChange={(next) => updateMeasurement("bust", next)}
        />
        <MeasurementField
          label="Waist Size"
          placeholder="e.g. 60"
          units={LENGTH_UNITS}
          state={measurements.waist}
          onChange={(next) => updateMeasurement("waist", next)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MeasurementField
          label="High Hip"
          placeholder="e.g. 80"
          units={LENGTH_UNITS}
          state={measurements.highHip}
          onChange={(next) => updateMeasurement("highHip", next)}
        />
        <MeasurementField
          label="Hip Size"
          placeholder="e.g. 90"
          units={LENGTH_UNITS}
          state={measurements.hip}
          onChange={(next) => updateMeasurement("hip", next)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
