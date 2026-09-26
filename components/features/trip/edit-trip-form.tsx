"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Pencil } from "lucide-react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  SEASON_OPTIONS,
  TRAVEL_COMPANION_OPTIONS,
  type Season,
  type TravelCompanion,
} from "@/lib/tripOptions";
import { PillToggleGroup } from "@/components/features/onboarding/pill-toggle-group";
import {
  editTripSchema,
  type EditTripFormValues,
} from "./schemas/edit-trip.schema";
import type { Trip } from "./types";

export function EditTripForm({ trip }: { trip?: Trip }) {
  const router = useRouter();
  const isEdit = !!trip;
  const [editingName, setEditingName] = useState(!isEdit);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditTripFormValues>({
    resolver: zodResolver(editTripSchema),
    defaultValues: {
      name: trip?.name ?? "",
      startDate: trip?.start_date ?? "",
      endDate: trip?.end_date ?? "",
      season: trip?.season ?? null,
      companion: trip?.travel_companion ?? null,
    },
  });

  const name = useWatch({
    control,
    name: "name",
  });

  const onInvalid = (fieldErrors: FieldErrors<EditTripFormValues>) => {
    if (fieldErrors.startDate?.message) {
      toast.error(fieldErrors.startDate.message);
    } else if (fieldErrors.endDate?.message) {
      toast.error(fieldErrors.endDate.message);
    }
  };

  async function onSubmit(values: EditTripFormValues) {
    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const payload = {
      name: values.name.trim() || null,
      start_date: values.startDate,
      end_date: values.endDate,
      season: (values.season as Season) ?? null,
      travel_companion: (values.companion as TravelCompanion) ?? null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("trip")
        .update(payload)
        .eq("id", trip.id);
      if (error) {
        toast.error("Couldn't save that trip.");
        return;
      }
      router.push(`/trip/${trip.id}`);
      return;
    }

    const { data, error } = await supabase
      .from("trip")
      .insert({ ...payload, user_id: user.id })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Couldn't save that trip.");
      return;
    }
    router.push(`/trip/${data.id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
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

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative h-40 w-40">
            <Image src="/profile/koper.png" alt="" fill className="object-contain" />
          </div>

          {editingName ? (
            <input
              autoFocus
              {...register("name")}
              onBlur={() => setEditingName(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              placeholder="Trip to..."
              className="font-serif text-title border-border w-full border-b bg-transparent text-center outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="inline-flex items-center gap-2"
            >
              <Typography variant="title" as="span">
                {name || "Trip to..."}
              </Typography>
              <Pencil className="text-muted-foreground size-4 shrink-0" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trip-start" className="text-muted-foreground text-xs tracking-wide uppercase">
              Start
            </Label>
            <Input
              id="trip-start"
              type="date"
              {...register("startDate")}
              className="h-11"
            />
            {errors.startDate && (
              <p className="text-destructive text-xs">{errors.startDate.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trip-end" className="text-muted-foreground text-xs tracking-wide uppercase">
              End
            </Label>
            <Input
              id="trip-end"
              type="date"
              {...register("endDate")}
              
              className="h-11"
            />
            {errors.endDate && (
              <p className="text-destructive text-xs">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            Season
          </span>
          <Controller
            name="season"
            control={control}
            render={({ field }) => (
              <PillToggleGroup
                options={SEASON_OPTIONS}
                isSelected={(value) => value === field.value}
                onToggle={(value) =>
                  field.onChange(value === field.value ? null : value)
                }
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            Travel Companion
          </span>
          <Controller
            name="companion"
            control={control}
            render={({ field }) => (
              <PillToggleGroup
                options={TRAVEL_COMPANION_OPTIONS}
                isSelected={(value) => value === field.value}
                onToggle={(value) =>
                  field.onChange(value === field.value ? null : value)
                }
              />
            )}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-foreground text-background rounded-full py-3 text-sm font-medium tracking-wide uppercase disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save"}
        </button>
      </form>
    </main>
  );
}
