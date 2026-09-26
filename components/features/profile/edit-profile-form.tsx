"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Pencil, Settings, Users } from "lucide-react";
import { toast } from "sonner";
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
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { uploadProfilePhoto } from "@/lib/profileStorage";
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
  type MeasurementKey,
  type MeasurementState,
  type OutfitSize,
  type ShoeRegion,
  type WorkSetting,
} from "@/lib/profileOptions";
import { PillToggleGroup } from "@/components/features/onboarding/pill-toggle-group";
import type { Database } from "@/types/database.types";

type UserProfile = Pick<
  Database["public"]["Tables"]["user"]["Row"],
  | "username"
  | "display_name"
  | "profile_photo"
  | "birthday"
  | "gender"
  | "occupation"
  | "work_setting"
  | "outfit_size"
  | "shoe_size"
  | "shoe_size_region"
  | "height"
  | "weight"
  | "bust_size"
  | "waist_size"
  | "high_hip_size"
  | "hip_size"
  | "body_type"
  | "style_tags"
>;

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

export function EditProfileForm({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState(profile.profile_photo);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [birthday, setBirthday] = useState(profile.birthday ?? "");
  const [gender, setGender] = useState<Gender | null>(profile.gender);
  const [occupation, setOccupation] = useState(profile.occupation ?? "");
  const [workSetting, setWorkSetting] = useState<WorkSetting | null>(
    profile.work_setting,
  );
  const [outfitSize, setOutfitSize] = useState<OutfitSize | null>(
    profile.outfit_size,
  );
  const [shoeSize, setShoeSize] = useState(profile.shoe_size ?? "");
  const [shoeRegion, setShoeRegion] = useState<ShoeRegion>(
    profile.shoe_size_region ?? "uk",
  );
  const [measurements, setMeasurements] = useState<
    Record<MeasurementKey, MeasurementState>
  >({
    height: toMeasurementState(profile.height, "cm"),
    weight: toMeasurementState(profile.weight, "kg"),
    bust: toMeasurementState(profile.bust_size, "cm"),
    waist: toMeasurementState(profile.waist_size, "cm"),
    highHip: toMeasurementState(profile.high_hip_size, "cm"),
    hip: toMeasurementState(profile.hip_size, "cm"),
  });
  const [bodyType, setBodyType] = useState<string | null>(profile.body_type);
  const [styleTags, setStyleTags] = useState<StyleTag[]>(
    (profile.style_tags as StyleTag[] | null) ?? [],
  );
  const [saving, setSaving] = useState(false);

  function updateMeasurement(key: MeasurementKey, next: MeasurementState) {
    setMeasurements((prev) => ({ ...prev, [key]: next }));
  }

  function toggleStyleTag(tag: StyleTag) {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handlePhotoSelected(file: File) {
    setUploadingPhoto(true);
    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploadingPhoto(false);
      router.push("/sign-in");
      return;
    }
    try {
      const { url } = await uploadProfilePhoto(user.id, file);
      setPhotoUrl(url);
    } catch {
      toast.error("Couldn't upload that photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      router.push("/sign-in");
      return;
    }

    const update: Database["public"]["Tables"]["user"]["Update"] = {
      display_name: displayName.trim() || null,
      profile_photo: photoUrl,
      birthday: birthday || null,
      gender,
      occupation: occupation.trim() || null,
      work_setting: workSetting,
      outfit_size: outfitSize,
      body_type: bodyType,
      style_tags: styleTags,
    };

    if (shoeSize.trim()) {
      update.shoe_size = shoeSize.trim();
      update.shoe_size_region = shoeRegion;
    } else {
      update.shoe_size = null;
    }

    for (const field of MEASUREMENT_FIELDS) {
      const state = measurements[field.key];
      const parsed = Number(state.value);
      update[field.column] =
        state.value.trim() && !Number.isNaN(parsed)
          ? toCanonicalMeasurement(parsed, state.unit, field.kind)
          : null;
    }

    const { error } = await supabase
      .from("user")
      .update(update)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Couldn't save your profile.");
      return;
    }
    toast.success("Profile updated");
    router.push("/profile");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
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
          disabled={uploadingPhoto}
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
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
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
          value={birthday}
          onChange={(event) => setBirthday(event.target.value)}
          endIcon={<Pencil />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          How do you identify?
        </Label>
        <PillToggleGroup
          options={GENDER_OPTIONS}
          isSelected={(value) => gender === value}
          onToggle={(value) => setGender(value as Gender)}
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
          value={occupation}
          onChange={(event) => setOccupation(event.target.value)}
          endIcon={<Pencil />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Your work setting
        </Label>
        <PillToggleGroup
          options={WORK_SETTING_OPTIONS}
          isSelected={(value) => workSetting === value}
          onToggle={(value) => setWorkSetting(value as WorkSetting)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Outfit size
        </Label>
        <PillToggleGroup
          options={OUTFIT_SIZE_OPTIONS}
          isSelected={(value) => outfitSize === value}
          onToggle={(value) => setOutfitSize(value as OutfitSize)}
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

      <div className="flex flex-col gap-1.5">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Your body type
        </Label>
        <Select value={bodyType} onValueChange={setBodyType}>
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
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Your style, in your words
        </span>
        <PillToggleGroup
          options={STYLE_TAG_OPTIONS}
          isSelected={(value) => styleTags.includes(value as StyleTag)}
          onToggle={(value) => toggleStyleTag(value as StyleTag)}
        />
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={saving || uploadingPhoto}
        className="w-full"
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </main>
  );
}
