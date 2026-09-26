"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { GENDER_OPTIONS, type Gender } from "@/lib/profileOptions";
import { OnboardingShell } from "./onboarding-shell";
import { PillToggleGroup } from "./pill-toggle-group";
import {
  stepTwoSchema,
  type StepTwoFormValues,
} from "./schemas/step-two.schema";

export function StepTwoForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StepTwoFormValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      birthday: "",
      identity: undefined,
    },
  });

  const identity = useWatch({
    control,
    name: "identity",
  });

  async function onSubmit(values: StepTwoFormValues) {
    setError(null);
    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const { error: updateError } = await supabase
      .from("user")
      .update({ gender: values.identity, birthday: values.birthday || null })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/onboarding/3");
  }

  return (
    <OnboardingShell
      step={2}
      totalSteps={5}
      title="A little more about you."
      subtitle="Helps us tailor suggestions that actually fit."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isSubmitting ? "Saving…" : "Continue"}
      continueDisabled={isSubmitting || !identity}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="onboarding-birthday"
            className="text-muted-foreground text-xs tracking-wide uppercase"
          >
            When&apos;s your birthday?
          </Label>
          <Badge>Optional</Badge>
        </div>
        <Input
          id="onboarding-birthday"
          type="date"
          {...register("birthday")}
        />
        {errors.birthday && (
          <p className="text-destructive text-xs">{errors.birthday.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
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
            />
          )}
        />
        {errors.identity && (
          <p className="text-destructive text-xs">{errors.identity.message}</p>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
