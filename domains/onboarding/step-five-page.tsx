"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { STYLE_TAG_OPTIONS, type StyleTag } from "@/lib/styleTags";
import { OnboardingShell } from "./components/onboarding-shell";
import { PillToggleGroup } from "@/components/ui/pill-toggle-group";
import {
  stepFiveSchema,
  type StepFiveFormValues,
} from "./schemas/step-five.schema";
import { updateOnboardingProfileMutationOptions } from "./mutation-options/update-onboarding-profile.mutation-option.client";
import { getOnboardingProfileQueryOptionsForBrowser } from "./query-options/get-onboarding-profile.query-option.client";

export interface StepFiveFormProps {
  userId: string;
  initialStyleTags?: StyleTag[];
}

export function StepFiveForm({ userId, initialStyleTags }: StepFiveFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile } = useSuspenseQuery(
    getOnboardingProfileQueryOptionsForBrowser(userId),
  );

  const { mutate, isPending, error } = useMutation({
    ...updateOnboardingProfileMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getOnboardingProfileQueryOptionsForBrowser(userId).queryKey,
      });
      router.push("/onboarding/6");
    },
  });

  const {
    control,
    handleSubmit,
  } = useForm<StepFiveFormValues>({
    resolver: zodResolver(stepFiveSchema),
    defaultValues: {
      styleTags:
        initialStyleTags ?? (profile?.style_tags as StyleTag[]) ?? [],
    },
  });

  async function onSubmit(values: StepFiveFormValues) {
    await mutate({
      userId,
      update: {
        style_tags: values.styleTags as StyleTag[],
      },
    });
  }

  return (
    <OnboardingShell
      data-testid="onboarding-step-five"
      step={5}
      totalSteps={5}
      title="Now the fun part."
      subtitle="Pick what resonates. You can always change this later."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isPending ? "Saving…" : "Continue"}
      continueDisabled={isPending}
      backHref="/onboarding/4"
    >
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase font-semibold">
          Your style, in your words
        </span>
        <Controller
          name="styleTags"
          control={control}
          render={({ field, fieldState }) => (
            <>
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
              {fieldState.error?.message && (
                <p className="text-destructive text-xs">{fieldState.error?.message}</p>
              )}
            </>
          )}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </OnboardingShell>
  );
}
