"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Pencil } from "lucide-react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import {
  SEASON_OPTIONS,
  TRAVEL_COMPANION_OPTIONS,
  type Season,
  type TravelCompanion,
} from "@/lib/tripOptions";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import { getTripsQueryOptionsForBrowser } from "@/domains/profile/query-options/get-trips.query-option.client";
import { getTripByIdQueryOptionsForBrowser } from "./query-options/get-trip-by-id.query-option.client";
import { getTripDetailQueryOptionsForBrowser } from "./query-options/get-trip-detail.query-option.client";
import { createTripMutationOptions } from "./mutation-options/create-trip.mutation-option.client";
import { updateTripMutationOptions } from "./mutation-options/update-trip.mutation-option.client";
import {
  editTripSchema,
  type EditTripFormValues,
} from "./schemas/edit-trip.schema";
import type { Trip } from "./types";

export function EditTripForm({
  userId,
  tripId,
}: {
  userId: string;
  tripId?: string;
}) {
  if (tripId) {
    return <EditTripFetcher userId={userId} tripId={tripId} />;
  }
  return <TripFormContent userId={userId} />;
}

function EditTripFetcher({
  userId,
  tripId,
}: {
  userId: string;
  tripId: string;
}) {
  const { data: trip } = useSuspenseQuery(
    getTripByIdQueryOptionsForBrowser(userId, tripId),
  );

  if (!trip) {
    notFound();
  }

  return <TripFormContent userId={userId} trip={trip} />;
}

function TripFormContent({ userId, trip }: { userId: string; trip?: Trip }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!trip;
  const [editingName, setEditingName] = useState(!isEdit);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
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

  const createMutation = useMutation({
    ...createTripMutationOptions(),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: getTripsQueryOptionsForBrowser(userId).queryKey,
      });
      router.push(`/trip/${data.id}`);
    },
    onError: () => {
      toast.error("Couldn't save that trip.");
    },
  });

  const updateMutation = useMutation({
    ...updateTripMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getTripsQueryOptionsForBrowser(userId).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getTripByIdQueryOptionsForBrowser(userId, trip!.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getTripDetailQueryOptionsForBrowser(userId, trip!.id)
          .queryKey,
      });
      router.push(`/trip/${trip!.id}`);
    },
    onError: () => {
      toast.error("Couldn't save that trip.");
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onInvalid = (fieldErrors: FieldErrors<EditTripFormValues>) => {
    if (fieldErrors.startDate?.message) {
      toast.error(fieldErrors.startDate.message);
    } else if (fieldErrors.endDate?.message) {
      toast.error(fieldErrors.endDate.message);
    }
  };

  function onSubmit(values: EditTripFormValues) {
    if (isEdit && trip) {
      updateMutation.mutate({
        id: trip.id,
        userId,
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        season: (values.season as Season) ?? null,
        companion: (values.companion as TravelCompanion) ?? null,
      });
    } else {
      createMutation.mutate({
        userId,
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        season: (values.season as Season) ?? null,
        companion: (values.companion as TravelCompanion) ?? null,
      });
    }
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
        data-testid="trip-form__back-button"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-6"
        data-testid="trip-form"
        data-entity-id={trip?.id}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative h-40 w-40">
            <Image
              src="/profile/koper.png"
              alt=""
              fill
              className="object-contain"
            />
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
              data-testid="trip-form__name-input"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="inline-flex items-center gap-2"
              data-testid="trip-form__name-display"
            >
              <Typography variant="title" as="h1">
                {name && name.trim().length > 0 ? name : "Trip to..."}
              </Typography>
              <Pencil className="text-muted-foreground size-4 shrink-0" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="trip-start-date">Start date</Label>
              <Input
                id="trip-start-date"
                type="date"
                aria-invalid={!!errors.startDate}
                data-testid="trip-form__start-date-input"
                {...register("startDate")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="trip-end-date">End date</Label>
              <Input
                id="trip-end-date"
                type="date"
                aria-invalid={!!errors.endDate}
                data-testid="trip-form__end-date-input"
                {...register("endDate")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Season</Label>
            <Controller
              control={control}
              name="season"
              render={({ field }) => (
                <PillToggleGroup
                  options={SEASON_OPTIONS}
                  isSelected={(value) => value === field.value}
                  onToggle={(value) =>
                    field.onChange(value === field.value ? null : value)
                  }
                  data-testid="trip-form__season-toggle"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Travel companion</Label>
            <Controller
              control={control}
              name="companion"
              render={({ field }) => (
                <PillToggleGroup
                  options={TRAVEL_COMPANION_OPTIONS}
                  isSelected={(value) => value === field.value}
                  onToggle={(value) =>
                    field.onChange(value === field.value ? null : value)
                  }
                  data-testid="trip-form__companion-toggle"
                />
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          data-testid="trip-form__submit-button"
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </main>
  );
}
