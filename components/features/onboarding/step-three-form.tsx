"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  WORK_SETTING_OPTIONS,
  type WorkSetting,
} from "@/lib/profileOptions";
import { OnboardingShell } from "./onboarding-shell";
import { PillToggleGroup } from "./pill-toggle-group";

const stepThreeSchema = z.object({
  profession: z.string().trim().optional(),
  workSetting: z.enum(["in_office", "remote", "hybrid", "on_the_go"] as const).nullable().optional(),
});

type StepThreeFormValues = z.infer<typeof stepThreeSchema>;

export function StepThreeForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<StepThreeFormValues>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      profession: "",
      workSetting: null,
    },
  });

  async function onSubmit(values: StepThreeFormValues) {
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
      .update({
        occupation: values.profession || null,
        work_setting: values.workSetting ?? null,
      })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/onboarding/4");
  }

  return (
    <OnboardingShell
      step={3}
      totalSteps={5}
      title="What does your day-to-day look like?"
      subtitle="We'll help you dress for where you actually go."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isSubmitting ? "Saving…" : "Continue"}
      continueDisabled={isSubmitting}
    >
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="onboarding-profession"
          className="text-muted-foreground text-xs tracking-wide uppercase"
        >
          Your profession
        </Label>
        <Input
          id="onboarding-profession"
          placeholder="e.g. Product manager, teacher, freelancer…"
          {...register("profession")}
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
              onToggle={(value) => field.onChange(value as WorkSetting)}
            />
          )}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
