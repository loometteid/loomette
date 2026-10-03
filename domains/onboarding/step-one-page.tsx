"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { OnboardingShell } from "./components/onboarding-shell";
import {
  stepOneSchema,
  type StepOneFormValues,
} from "./schemas/step-one.schema";
import { updateOnboardingProfileMutationOptions } from "./mutation-options/update-onboarding-profile.mutation-option.client";
import { getOnboardingProfileQueryOptionsForBrowser } from "./query-options/get-onboarding-profile.query-option.client";
import { useAlreadyOnboardedGuard } from "./hooks/use-already-onboarded-guard";

export interface StepOneFormProps {
  userId: string;
  email: string;
  initialName?: string;
}

export function StepOneForm({
  userId,
  email,
  initialName = "",
}: StepOneFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: profile } = useSuspenseQuery(
    getOnboardingProfileQueryOptionsForBrowser(userId),
  );
  useAlreadyOnboardedGuard(profile);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StepOneFormValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      name: initialName || profile?.display_name || "",
    },
  });

  const name = useWatch({
    control,
    name: "name",
  });

  const { mutateAsync, isPending } = useMutation({
    ...updateOnboardingProfileMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getOnboardingProfileQueryOptionsForBrowser(userId).queryKey,
      });
      router.push("/onboarding/2");
    },
  });

  async function onSubmit(values: StepOneFormValues) {
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

    try {
      await mutateAsync({
        userId: resolvedUserId,
        update: { display_name: values.name.trim() },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile name";
      setError(message);
    }
  }

  const isBusy = isSubmitting || isPending;

  return (
    <OnboardingShell
      step={1}
      totalSteps={5}
      title="First, let's make this yours."
      subtitle="NO SPAM. JUST YOUR WARDROBE, PERSONALIZED."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isBusy ? "Saving…" : "Continue"}
      continueDisabled={isBusy || !name || name.trim().length === 0}
      data-testid="onboarding-step-one"
    >
      <Link href="/onboarding/2" prefetch className="hidden" aria-hidden />

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="onboarding-name"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          What do we call you?
        </Label>
        <Input
          id="onboarding-name"
          data-testid="onboarding-step-one__name-input"
          placeholder="e.g. Gonjoi"
          className="h-11 rounded-xl bg-secondary px-3.5 text-sm"
          {...register("name")}
        />
        {errors.name && (
          <p
            data-testid="onboarding-step-one__name-error"
            className="text-destructive text-xs"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="onboarding-email"
          className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
        >
          Your email
        </Label>
        <Input
          id="onboarding-email"
          data-testid="onboarding-step-one__email-input"
          type="email"
          value={email}
          placeholder="you@example.com"
          disabled
          className="h-11 rounded-xl bg-secondary/70 px-3.5 text-sm text-foreground/80 cursor-not-allowed"
        />
      </div>

      {error && (
        <p
          data-testid="onboarding-step-one__error"
          className="text-destructive text-sm"
        >
          {error}
        </p>
      )}
    </OnboardingShell>
  );
}
