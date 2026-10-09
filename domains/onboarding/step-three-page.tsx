"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { WORK_SETTING_OPTIONS, type WorkSetting } from "@/lib/profileOptions";
import { OnboardingShell } from "./components/onboarding-shell";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import {
  stepThreeSchema,
  type StepThreeFormValues,
} from "./schemas/step-three.schema";
import { updateOnboardingProfileMutationOptions } from "./mutation-options/update-onboarding-profile.mutation-option.client";
import { getOnboardingProfileQueryOptionsForBrowser } from "./query-options/get-onboarding-profile.query-option.client";

export interface StepThreeFormProps {
  userId: string;
  initialProfession?: string | null;
  initialWorkSetting?: WorkSetting | null;
}

export function StepThreeForm({
  userId,
  initialProfession,
  initialWorkSetting,
}: StepThreeFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: profile } = useSuspenseQuery(
    getOnboardingProfileQueryOptionsForBrowser(userId),
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<StepThreeFormValues>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      profession: initialProfession ?? profile?.occupation ?? "",
      workSetting:
        (initialWorkSetting ??
          (profile?.work_setting as WorkSetting)) ??
        null,
    },
  });

  const { mutateAsync, isPending } = useMutation({
    ...updateOnboardingProfileMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getOnboardingProfileQueryOptionsForBrowser(userId).queryKey,
      });
      router.push("/onboarding/4");
    },
  });

  async function onSubmit(values: StepThreeFormValues) {
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
          occupation:
            values.profession && values.profession.trim()
              ? values.profession.trim()
              : null,
          work_setting: values.workSetting ?? null,
        },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update work details";
      setError(message);
    }
  }

  const isBusy = isSubmitting || isPending;

  return (
    <OnboardingShell
      step={3}
      totalSteps={5}
      title="What does your day-to-day look like?"
      subtitle="WE'LL HELP YOU DRESS FOR WHERE YOU ACTUALLY GO."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isBusy ? "Saving…" : "Continue"}
      continueDisabled={isBusy}
      data-testid="onboarding-step-three"
    >
      <Link href="/onboarding/4" prefetch className="hidden" aria-hidden />

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="onboarding-profession"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          Your profession
        </Label>
        <Input
          id="onboarding-profession"
          data-testid="onboarding-step-three__profession-input"
          placeholder="e.g. Product manager, teacher, freelancer…"
          className="h-11 rounded-xl bg-secondary px-3.5 text-sm"
          {...register("profession")}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
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
              data-testid="onboarding-step-three__work-setting-group"
            />
          )}
        />
      </div>

      {error && (
        <p
          data-testid="onboarding-step-three__error"
          className="text-destructive text-sm"
        >
          {error}
        </p>
      )}
    </OnboardingShell>
  );
}
