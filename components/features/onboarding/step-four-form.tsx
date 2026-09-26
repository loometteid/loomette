"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stepFourSchema,
  type StepFourFormValues,
} from "./schemas/step-four.schema";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import {
  EMPTY_MEASUREMENTS,
  LENGTH_UNITS,
  MEASUREMENT_FIELDS,
  OUTFIT_SIZE_OPTIONS,
  SHOE_REGIONS,
  WEIGHT_UNITS,
  toCanonicalMeasurement,
  type MeasurementState,
  type OutfitSize,
  type ShoeRegion,
} from "@/lib/profileOptions";
import { OnboardingShell } from "./onboarding-shell";
import { PillToggleGroup } from "./pill-toggle-group";

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
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<StepFourFormValues>({
    resolver: zodResolver(stepFourSchema),
    defaultValues: {
      outfitSize: null,
      shoeSize: "",
      shoeRegion: "uk",
      measurements: EMPTY_MEASUREMENTS,
    },
  });

  async function onSubmit(values: StepFourFormValues) {
    setError(null);
    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const update: Database["public"]["Tables"]["user"]["Update"] = {
      outfit_size: values.outfitSize ?? null,
    };

    if (values.shoeSize) {
      update.shoe_size = values.shoeSize;
      update.shoe_size_region = values.shoeRegion;
    }

    for (const field of MEASUREMENT_FIELDS) {
      const state = values.measurements[field.key];
      const parsed = Number(state.value);
      if (state.value.trim() && !Number.isNaN(parsed)) {
        update[field.column] = toCanonicalMeasurement(
          parsed,
          state.unit,
          field.kind,
        );
      }
    }

    const { error: updateError } = await supabase
      .from("user")
      .update(update)
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
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
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isSubmitting ? "Saving…" : "Continue"}
      continueDisabled={isSubmitting}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs tracking-wide uppercase">
            Outfit size
          </Label>
          <Badge>Optional</Badge>
        </div>
        <Controller
          name="outfitSize"
          control={control}
          render={({ field }) => (
            <PillToggleGroup
              options={OUTFIT_SIZE_OPTIONS}
              isSelected={(value) => field.value === value}
              onToggle={(value) => field.onChange(value as OutfitSize)}
            />
          )}
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
            {...register("shoeSize")}
            className="flex-1"
          />
          <Controller
            name="shoeRegion"
            control={control}
            render={({ field }) => (
              <UnitSelect
                value={field.value}
                units={SHOE_REGIONS}
                onChange={(value) => field.onChange(value as ShoeRegion)}
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Controller
          name="measurements.height"
          control={control}
          render={({ field }) => (
            <MeasurementField
              label="Height"
              placeholder="e.g. 160"
              units={LENGTH_UNITS}
              state={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="measurements.weight"
          control={control}
          render={({ field }) => (
            <MeasurementField
              label="Weight"
              placeholder="e.g. 55"
              units={WEIGHT_UNITS}
              state={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Controller
          name="measurements.bust"
          control={control}
          render={({ field }) => (
            <MeasurementField
              label="Bust Size"
              placeholder="e.g. 90"
              units={LENGTH_UNITS}
              state={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="measurements.waist"
          control={control}
          render={({ field }) => (
            <MeasurementField
              label="Waist Size"
              placeholder="e.g. 60"
              units={LENGTH_UNITS}
              state={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Controller
          name="measurements.highHip"
          control={control}
          render={({ field }) => (
            <MeasurementField
              label="High Hip"
              placeholder="e.g. 80"
              units={LENGTH_UNITS}
              state={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="measurements.hip"
          control={control}
          render={({ field }) => (
            <MeasurementField
              label="Hip Size"
              placeholder="e.g. 90"
              units={LENGTH_UNITS}
              state={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
