"use client";

import { useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Pencil, Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { getProfileQueryOptionsForBrowser } from "./query-options/get-profile.query-option.client";
import { updateProfileMutationOptions } from "./mutation-options/update-profile.mutation-option.client";
import { uploadProfilePhotoMutationOptions } from "./mutation-options/upload-profile-photo.mutation-option.client";
import { STYLE_TAG_OPTIONS, type StyleTag } from "@/lib/styleTags";
import {
  BODY_TYPE_OPTIONS,
  GENDER_OPTIONS,
  LENGTH_UNITS,
  MEASUREMENT_FIELDS,
  OUTFIT_SIZE_OPTIONS,
  SHOE_REGIONS,
  WEIGHT_UNITS,
  WORK_SETTING_OPTIONS,
  toCanonicalMeasurement,
  type Gender,
  type MeasurementState,
  type OutfitSize,
  type ShoeRegion,
  type WorkSetting,
} from "@/lib/profileOptions";
import { PillToggleGroup } from "@/components/features/onboarding/pill-toggle-group";
import {
  editProfileSchema,
  type EditProfileFormValues,
} from "./schemas/edit-profile.schema";
import type { Database } from "@/types/database.types";

function toMeasurementState(value: number | null, unit: string): MeasurementState {
  return { value: value == null ? "" : String(value), unit };
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
      className="border-transparent bg-secondary text-foreground h-8 rounded-lg border px-2 text-sm uppercase outline-none"
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
      <Label className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={state.value}
          onChange={(event) => onChange({ ...state, value: event.target.value })}
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

export function EditProfileForm({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );

  if (!profile) {
    notFound();
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      profilePhoto: profile.profile_photo,
      displayName: profile.display_name ?? "",
      birthday: profile.birthday ?? "",
      gender: profile.gender,
      occupation: profile.occupation ?? "",
      workSetting: profile.work_setting,
      outfitSize: profile.outfit_size,
      shoeSize: profile.shoe_size ?? "",
      shoeRegion: profile.shoe_size_region ?? "uk",
      measurements: {
        height: toMeasurementState(profile.height, "cm"),
        weight: toMeasurementState(profile.weight, "kg"),
        bust: toMeasurementState(profile.bust_size, "cm"),
        waist: toMeasurementState(profile.waist_size, "cm"),
        highHip: toMeasurementState(profile.high_hip_size, "cm"),
        hip: toMeasurementState(profile.hip_size, "cm"),
      },
      bodyType: profile.body_type,
      styleTags: (profile.style_tags as StyleTag[] | null) ?? [],
    },
  });

  const photoUrl = useWatch({
    control,
    name: "profilePhoto",
  });

  const uploadPhotoMutation = useMutation({
    ...uploadProfilePhotoMutationOptions(),
    onSuccess: ({ url }) => {
      setValue("profilePhoto", url);
    },
    onError: () => {
      toast.error("Couldn't upload that photo.");
    },
  });

  const updateProfileMutation = useMutation({
    ...updateProfileMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getProfileQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: ["user", "gender", userId],
      });
      toast.success("Profile updated");
      router.push("/profile");
    },
    onError: () => {
      toast.error("Couldn't save your profile.");
    },
  });

  const isBusy = uploadPhotoMutation.isPending || updateProfileMutation.isPending;

  function handlePhotoSelected(file: File) {
    uploadPhotoMutation.mutate({ userId, file });
  }

  function onSubmit(values: EditProfileFormValues) {
    const update: Database["public"]["Tables"]["user"]["Update"] = {
      display_name: values.displayName?.trim() || null,
      profile_photo: values.profilePhoto ?? null,
      birthday: values.birthday || null,
      gender: values.gender ?? null,
      occupation: values.occupation?.trim() || null,
      work_setting: values.workSetting ?? null,
      outfit_size: values.outfitSize ?? null,
      body_type: values.bodyType ?? null,
      style_tags: values.styleTags as StyleTag[],
    };

    if (values.shoeSize?.trim()) {
      update.shoe_size = values.shoeSize.trim();
      update.shoe_size_region = values.shoeRegion;
    } else {
      update.shoe_size = null;
    }

    for (const field of MEASUREMENT_FIELDS) {
      const state = values.measurements[field.key];
      const parsed = Number(state.value);
      update[field.column] =
        state.value.trim() && !Number.isNaN(parsed)
          ? toCanonicalMeasurement(parsed, state.unit, field.kind)
          : null;
    }

    updateProfileMutation.mutate({ userId, update });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8"
    >
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="rounded-xl"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl"
            onClick={() => toast("Coming soon.")}
            aria-label="Friends"
          >
            <Users className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl"
            onClick={() => router.push("/profile/settings")}
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Sparkle className="size-5 text-foreground" />
        <Typography variant="title" as="h1">
          Profile
        </Typography>
      </div>

      <div className="relative mx-auto aspect-square w-56">
        <div className="bg-secondary relative size-full overflow-hidden rounded-2xl">
          {photoUrl && (
            <Image src={photoUrl} alt="" fill className="object-cover" />
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadPhotoMutation.isPending}
          aria-label="Edit photo"
          className="bg-background absolute -bottom-2 -left-2 flex size-9 items-center justify-center rounded-xl shadow disabled:opacity-50"
        >
          <Pencil className="size-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handlePhotoSelected(file);
            event.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="edit-name"
          className="text-muted-foreground text-xs tracking-wide uppercase"
        >
          Name
        </Label>
        <Input
          id="edit-name"
          {...register("displayName")}
          endIcon={<Pencil />}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="edit-birthday"
          className="text-muted-foreground text-xs tracking-wide uppercase"
        >
          Birthday
        </Label>
        <Input
          id="edit-birthday"
          type="date"
          {...register("birthday")}
          endIcon={<Pencil />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          How do you identify?
        </Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <PillToggleGroup
              options={GENDER_OPTIONS}
              isSelected={(value) => field.value === value}
              onToggle={(value) =>
                field.onChange(field.value === value ? null : (value as Gender))
              }
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="edit-profession"
          className="text-muted-foreground text-xs tracking-wide uppercase"
        >
          Your profession
        </Label>
        <Input
          id="edit-profession"
          {...register("occupation")}
          endIcon={<Pencil />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Your work setting
        </Label>
        <Controller
          name="workSetting"
          control={control}
          render={({ field }) => (
            <PillToggleGroup
              options={WORK_SETTING_OPTIONS}
              isSelected={(value) => field.value === value}
              onToggle={(value) =>
                field.onChange(
                  field.value === value ? null : (value as WorkSetting),
                )
              }
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Outfit size
        </Label>
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
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="edit-shoe-size"
          className="text-muted-foreground text-xs tracking-wide uppercase"
        >
          Shoe size
        </Label>
        <div className="flex gap-2">
          <Input
            id="edit-shoe-size"
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

      <div className="flex flex-col gap-1.5">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Your body type
        </Label>
        <Controller
          name="bodyType"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="bg-secondary h-8 w-full border-transparent">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BODY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Your style, in your words
        </span>
        <Controller
          name="styleTags"
          control={control}
          render={({ field }) => (
            <PillToggleGroup
              options={STYLE_TAG_OPTIONS}
              isSelected={(value) => field.value.includes(value as StyleTag)}
              onToggle={(value) => {
                const tag = value as StyleTag;
                const current = field.value;
                const next = current.includes(tag)
                  ? current.filter((t) => t !== tag)
                  : [...current, tag];
                field.onChange(next);
              }}
            />
          )}
        />
      </div>

      <Button
        type="submit"
        disabled={isBusy || isSubmitting}
        className="w-full"
      >
        {updateProfileMutation.isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
