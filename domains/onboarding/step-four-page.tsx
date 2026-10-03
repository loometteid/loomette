"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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
  LENGTH_UNITS,
  MEASUREMENT_FIELDS,
  OUTFIT_SIZE_OPTIONS,
  SHOE_REGIONS,
  WEIGHT_UNITS,
  toCanonicalMeasurement,
  type MeasurementKey,
  type MeasurementState,
  type OutfitSize,
  type ShoeRegion,
} from "@/lib/profileOptions";
import { OnboardingShell } from "./components/onboarding-shell";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import { updateOnboardingProfileMutationOptions } from "./mutation-options/update-onboarding-profile.mutation-option.client";
import { getOnboardingProfileQueryOptionsForBrowser } from "./query-options/get-onboarding-profile.query-option.client";

function UnitSelect({
  value,
  units,
  onChange,
  dataTestId,
}: {
  value: string;
  units: readonly string[];
  onChange: (value: string) => void;
  dataTestId?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Unit"
      data-testid={dataTestId}
      className="h-11 rounded-xl border border-transparent bg-secondary px-2.5 text-xs font-semibold tracking-wider uppercase text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer"
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
  inputTestId,
  unitTestId,
}: {
  label: string;
  placeholder: string;
  units: readonly string[];
  state: MeasurementState;
  onChange: (next: MeasurementState) => void;
  inputTestId?: string;
  unitTestId?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {label}
        </Label>
        <Badge className="bg-secondary/60 text-[10px] text-muted-foreground uppercase border-none px-2 py-0.5">
          Optional
        </Badge>
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={state.value}
          data-testid={inputTestId}
          onChange={(event) =>
            onChange({ ...state, value: event.target.value })
          }
          className="h-11 flex-1 rounded-xl bg-secondary px-3.5 text-sm"
        />
        <UnitSelect
          value={state.unit}
          units={units}
          onChange={(unit) => onChange({ ...state, unit })}
          dataTestId={unitTestId}
        />
      </div>
    </div>
  );
}

export interface StepFourInitialData {
  outfitSize?: OutfitSize | null;
  shoeSize?: string | null;
  shoeRegion?: ShoeRegion | null;
  height?: number | null;
  weight?: number | null;
  bustSize?: number | null;
  waistSize?: number | null;
  highHipSize?: number | null;
  hipSize?: number | null;
}

export interface StepFourFormProps {
  userId: string;
  initialData?: StepFourInitialData;
}

export function StepFourForm({ initialData, userId }: StepFourFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: profile } = useSuspenseQuery(
    getOnboardingProfileQueryOptionsForBrowser(userId),
  );

  const resolvedHeight =
    initialData?.height != null
      ? String(initialData.height)
      : profile?.height != null
        ? String(profile.height)
        : "";
  const resolvedWeight =
    initialData?.weight != null
      ? String(initialData.weight)
      : profile?.weight != null
        ? String(profile.weight)
        : "";
  const resolvedBust =
    initialData?.bustSize != null
      ? String(initialData.bustSize)
      : profile?.bust_size != null
        ? String(profile.bust_size)
        : "";
  const resolvedWaist =
    initialData?.waistSize != null
      ? String(initialData.waistSize)
      : profile?.waist_size != null
        ? String(profile.waist_size)
        : "";
  const resolvedHighHip =
    initialData?.highHipSize != null
      ? String(initialData.highHipSize)
      : profile?.high_hip_size != null
        ? String(profile.high_hip_size)
        : "";
  const resolvedHip =
    initialData?.hipSize != null
      ? String(initialData.hipSize)
      : profile?.hip_size != null
        ? String(profile.hip_size)
        : "";

  const initialMeasurements: Record<MeasurementKey, MeasurementState> = {
    height: { value: resolvedHeight, unit: "cm" },
    weight: { value: resolvedWeight, unit: "kg" },
    bust: { value: resolvedBust, unit: "cm" },
    waist: { value: resolvedWaist, unit: "cm" },
    highHip: { value: resolvedHighHip, unit: "cm" },
    hip: { value: resolvedHip, unit: "cm" },
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<StepFourFormValues>({
    resolver: zodResolver(stepFourSchema),
    defaultValues: {
      outfitSize:
        (initialData?.outfitSize ??
          (profile?.outfit_size as OutfitSize)) ??
        null,
      shoeSize:
        initialData?.shoeSize ?? profile?.shoe_size ?? "",
      shoeRegion:
        (initialData?.shoeRegion ??
          (profile?.shoe_size_region as ShoeRegion)) ??
        "uk",
      measurements: initialMeasurements,
    },
  });

  const { mutateAsync, isPending } = useMutation({
    ...updateOnboardingProfileMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getOnboardingProfileQueryOptionsForBrowser(userId).queryKey,
      });
      router.push("/onboarding/5");
    },
  });

  async function onSubmit(values: StepFourFormValues) {
    setError(null);
    let resolvedUserId = userId;

    if (!resolvedUserId) {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/welcome");
        return;
      }
      resolvedUserId = user.id;
    }

    const update: Database["public"]["Tables"]["user"]["Update"] = {
      outfit_size: values.outfitSize ?? null,
    };

    if (values.shoeSize && values.shoeSize.trim()) {
      update.shoe_size = values.shoeSize.trim();
      update.shoe_size_region = values.shoeRegion;
    } else {
      update.shoe_size = null;
    }

    for (const field of MEASUREMENT_FIELDS) {
      const state = values.measurements[field.key];
      const parsed = Number(state.value);
      if (state.value && state.value.trim() && !Number.isNaN(parsed)) {
        update[field.column] = toCanonicalMeasurement(
          parsed,
          state.unit,
          field.kind,
        );
      } else {
        update[field.column] = null;
      }
    }

    try {
      await mutateAsync({
        userId: resolvedUserId,
        update,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update sizing";
      setError(message);
    }
  }

  const isBusy = isSubmitting || isPending;

  return (
    <OnboardingShell
      step={4}
      totalSteps={5}
      title="Dress for your body, not the other way."
      subtitle="ALL OPTIONAL. FILL IN WHAT'S USEFUL TO YOU."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isBusy ? "Saving…" : "Continue"}
      continueDisabled={isBusy}
      data-testid="onboarding-step-four"
    >
      <Link href="/onboarding/5" prefetch className="hidden" aria-hidden />

      {/* Outfit Size */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Outfit size
          </Label>
          <Badge className="bg-secondary/60 text-[10px] text-muted-foreground uppercase border-none px-2 py-0.5">
            Optional
          </Badge>
        </div>
        <Controller
          name="outfitSize"
          control={control}
          render={({ field }) => (
            <PillToggleGroup
              options={OUTFIT_SIZE_OPTIONS}
              isSelected={(value) => field.value === value}
              onToggle={(value) =>
                field.onChange(
                  field.value === value ? null : (value as OutfitSize),
                )
              }
              data-testid="onboarding-step-four__outfit-size-group"
            />
          )}
        />
      </div>

      {/* Shoe Size */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="onboarding-shoe-size"
            className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
          >
            Shoe size
          </Label>
          <Badge className="bg-secondary/60 text-[10px] text-muted-foreground uppercase border-none px-2 py-0.5">
            Optional
          </Badge>
        </div>
        <div className="flex gap-2">
          <Input
            id="onboarding-shoe-size"
            placeholder="e.g. 38, 39 — whatever you go by"
            {...register("shoeSize")}
            data-testid="onboarding-step-four__shoe-size-input"
            className="h-11 flex-1 rounded-xl bg-secondary px-3.5 text-sm"
          />
          <Controller
            name="shoeRegion"
            control={control}
            render={({ field }) => (
              <UnitSelect
                value={field.value}
                units={SHOE_REGIONS}
                onChange={(value) => field.onChange(value as ShoeRegion)}
                dataTestId="onboarding-step-four__shoe-region-select"
              />
            )}
          />
        </div>
      </div>

      {/* Height & Weight */}
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
              inputTestId="onboarding-step-four__height-input"
              unitTestId="onboarding-step-four__height-unit"
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
              inputTestId="onboarding-step-four__weight-input"
              unitTestId="onboarding-step-four__weight-unit"
            />
          )}
        />
      </div>

      {/* Bust & Waist */}
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
              inputTestId="onboarding-step-four__bust-input"
              unitTestId="onboarding-step-four__bust-unit"
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
              inputTestId="onboarding-step-four__waist-input"
              unitTestId="onboarding-step-four__waist-unit"
            />
          )}
        />
      </div>

      {/* High Hip & Hip */}
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
              inputTestId="onboarding-step-four__high-hip-input"
              unitTestId="onboarding-step-four__high-hip-unit"
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
              inputTestId="onboarding-step-four__hip-input"
              unitTestId="onboarding-step-four__hip-unit"
            />
          )}
        />
      </div>

      {error && (
        <p
          data-testid="onboarding-step-four__error"
          className="text-destructive text-sm"
        >
          {error}
        </p>
      )}
    </OnboardingShell>
  );
}
