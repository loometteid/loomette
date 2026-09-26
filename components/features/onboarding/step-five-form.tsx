"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { STYLE_TAG_OPTIONS, type StyleTag } from "@/lib/styleTags";
import { OnboardingShell } from "./onboarding-shell";
import { PillToggleGroup } from "./pill-toggle-group";

const stepFiveSchema = z.object({
  styleTags: z.array(z.string()),
});

type StepFiveFormValues = z.infer<typeof stepFiveSchema>;

export function StepFiveForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<StepFiveFormValues>({
    resolver: zodResolver(stepFiveSchema),
    defaultValues: {
      styleTags: [],
    },
  });

  async function onSubmit(values: StepFiveFormValues) {
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
      .update({ style_tags: values.styleTags as StyleTag[] })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/onboarding/6");
  }

  return (
    <OnboardingShell
      step={5}
      totalSteps={5}
      title="Now the fun part."
      subtitle="Pick what resonates. You can always change this later."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isSubmitting ? "Saving…" : "Continue"}
      continueDisabled={isSubmitting}
    >
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
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

      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
