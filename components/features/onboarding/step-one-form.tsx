"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { OnboardingShell } from "./onboarding-shell";
import {
  stepOneSchema,
  type StepOneFormValues,
} from "./schemas/step-one.schema";

export function StepOneForm({ email }: { email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StepOneFormValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      name: "",
    },
  });


  const name = useWatch({
    control,
    name: "name"
  });

  async function onSubmit(values: StepOneFormValues) {
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
      .update({ display_name: values.name })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/onboarding/2");
  }

  return (
    <OnboardingShell
      step={1}
      totalSteps={5}
      title="First, let's make this yours."
      subtitle="No spam. Just your wardrobe, personalized."
      onSubmit={handleSubmit(onSubmit)}
      continueLabel={isSubmitting ? "Saving…" : "Continue"}
      continueDisabled={isSubmitting || !name || name.trim().length === 0}
    >
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="onboarding-name"
          className="text-muted-foreground text-xs tracking-wide uppercase"
        >
          What do we call you?
        </Label>
        <Input
          id="onboarding-name"
          placeholder="e.g. Rebecca"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="onboarding-email"
          className="text-muted-foreground text-xs tracking-wide uppercase"
        >
          Your email
        </Label>
        <Input id="onboarding-email" type="email" value={email} disabled />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
