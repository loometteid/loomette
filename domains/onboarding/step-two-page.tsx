"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { GENDER_OPTIONS, type Gender } from "@/lib/profileOptions";
import { OnboardingShell } from "./components/onboarding-shell";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import {
  stepTwoSchema,
  type StepTwoFormValues,
} from "./schemas/step-two.schema";
import { updateOnboardingProfileMutationOptions } from "./mutation-options/update-onboarding-profile.mutation-option.client";
import { getOnboardingProfileQueryOptionsForBrowser } from "./query-options/get-onboarding-profile.query-option.client";

export interface StepTwoFormProps {
  userId: string;
  initialBirthday?: string | null;
  initialIdentity?: Gender | null;
}

export function StepTwoForm({
  userId,
  initialBirthday,
  initialIdentity,
}: StepTwoFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: profile } = useSuspenseQuery(
    getOnboardingProfileQueryOptionsForBrowser(userId),
  );

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StepTwoFormValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      birthday: initialBirthday ?? profile?.birthday ?? "",
      identity:
        (initialIdentity ?? (profile?.gender as Gender)) ?? undefined,
    },
  });

  const identity = useWatch({
    control,
    name: "identity",
  });

  const { mutateAsync, isPending } = useMutation({
    ...updateOnboardingProfileMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getOnboardingProfileQueryOptionsForBrowser(userId).queryKey,
      });
      router.push("/onboarding/3");
    },
  });

  async function onSubmit(values: StepTwoFormValues) {
    setError(null);
    let resolvedUserId = userId;

    if (!resolvedUserId) {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/waitlist");
        return;
      }
      resolvedUserId = user.id;
    }

    try {
      await mutateAsync({
        userId: resolvedUserId,
        update: {
          gender: values.identity,
          birthday:
            values.birthday && values.birthday.trim() ? values.birthday : null,
        },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
    }
  }

  const isBusy = isSubmitting || isPending;

  return (
    <OnboardingShell
      step={2}
      totalSteps={5}
      title="A little more about you."
      subtitle="HELPS US TAILOR SUGGESTIONS THAT ACTUALLY FIT."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isBusy ? "Saving…" : "Continue"}
      continueDisabled={isBusy || !identity}
      data-testid="onboarding-step-two"
    >
      <Link href="/onboarding/3" prefetch className="hidden" aria-hidden />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="onboarding-birthday"
            className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
          >
            When&apos;s your birthday?
          </Label>
          <Badge className="bg-secondary/60 text-[10px] text-muted-foreground uppercase border-none px-2.5 py-0.5">
            Optional
          </Badge>
        </div>
        <Controller
          name="birthday"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="onboarding-birthday"
              data-testid="onboarding-step-two__birthday-picker"
              value={field.value}
              onChange={field.onChange}
              placeholder="DD / MM / YYYY"
            />
          )}
        />
        {errors.birthday && (
          <p
            data-testid="onboarding-step-two__birthday-error"
            className="text-destructive text-xs"
          >
            {errors.birthday.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          How do you identify?
        </Label>
        <Controller
          name="identity"
          control={control}
          render={({ field }) => (
            <PillToggleGroup
              options={GENDER_OPTIONS}
              isSelected={(value) => field.value === value}
              onToggle={(value) => field.onChange(value as Gender)}
              data-testid="onboarding-step-two__identity-group"
            />
          )}
        />
        {errors.identity && (
          <p
            data-testid="onboarding-step-two__identity-error"
            className="text-destructive text-xs"
          >
            {errors.identity.message}
          </p>
        )}
      </div>

      {error && (
        <p
          data-testid="onboarding-step-two__error"
          className="text-destructive text-sm"
        >
          {error}
        </p>
      )}
    </OnboardingShell>
  );
}
