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
import { ProfileBreadcrumb } from "@/domains/profile/components/profile-breadcrumb";
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
    <main className="mx-auto flex w-full max-w-sm lg:max-w-5xl xl:max-w-6xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-xl lg:hidden"
            onClick={() => router.back()}
            aria-label="Go back"
            data-testid="trip-form__back-button"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <ProfileBreadcrumb
            items={[
              { label: "PROFILE", href: "/profile" },
              { label: "TRAVEL DETAIL", href: trip ? `/trip/${trip.id}` : undefined },
              { label: isEdit ? "EDIT TRAVEL" : "NEW TRAVEL" },
            ]}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 pt-2"
        data-testid="trip-form"
        data-entity-id={trip?.id}
      >
        {/* Left Column: Suitcase and Trip Name */}
        <div className="flex flex-col items-center gap-4 text-center w-full lg:w-72 shrink-0">
          <div className="relative h-44 w-44 lg:h-64 lg:w-64">
            <Image
              src="/profile/koper.png"
              alt=""
              fill
              className="object-contain drop-shadow-md"
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
              className="font-serif text-[32px] lg:text-[44px] border-border w-full border-b bg-transparent text-center outline-none text-foreground py-1 leading-tight"
              data-testid="trip-form__name-input"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
              data-testid="trip-form__name-display"
            >
              <Typography variant="title" as="h1" className="font-serif text-[32px] lg:text-[44px] font-normal text-foreground leading-tight">
                {name && name.trim().length > 0 ? name : "Trip to..."}
              </Typography>
              <Pencil className="text-muted-foreground size-4 shrink-0" />
            </button>
          )}
        </div>

        {/* Right Column: Form Fields */}
        <div className="flex flex-1 flex-col gap-6 w-full max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trip-start-date" className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate">
                Start date
              </Label>
              <Input
                id="trip-start-date"
                type="date"
                aria-invalid={!!errors.startDate}
                data-testid="trip-form__start-date-input"
                className="bg-linen border-transparent"
                {...register("startDate")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trip-end-date" className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate">
                End date
              </Label>
              <Input
                id="trip-end-date"
                type="date"
                aria-invalid={!!errors.endDate}
                data-testid="trip-form__end-date-input"
                className="bg-linen border-transparent"
                {...register("endDate")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate">Season</Label>
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
            <Label className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate">Travel companion</Label>
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

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-[#2A2926] text-white py-4 rounded-xl font-sans text-sm md:text-base font-normal uppercase tracking-wider shadow-sm"
              data-testid="trip-form__submit-button"
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
