"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  WORK_SETTING_OPTIONS,
  type WorkSetting,
} from "@/lib/profileOptions";
import { OnboardingShell } from "./onboarding-shell";
import { PillToggleGroup } from "./pill-toggle-group";

export function StepThreeForm() {
  const router = useRouter();
  const [profession, setProfession] = useState("");
  const [workSetting, setWorkSetting] = useState<WorkSetting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/sign-in");
      return;
    }

    const { error } = await supabase
      .from("user")
      .update({
        occupation: profession.trim() || null,
        work_setting: workSetting,
      })
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      setError(error.message);
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
      onSubmit={handleSubmit}
      continueLabel={loading ? "Saving…" : "Continue"}
      continueDisabled={loading}
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
          value={profession}
          onChange={(event) => setProfession(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          Your work setting
        </Label>
        <PillToggleGroup
          options={WORK_SETTING_OPTIONS}
          isSelected={(value) => workSetting === value}
          onToggle={(value) => setWorkSetting(value as WorkSetting)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
