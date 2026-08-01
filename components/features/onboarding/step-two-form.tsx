"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { GENDER_OPTIONS, type Gender } from "@/lib/profileOptions";
import { OnboardingShell } from "./onboarding-shell";
import { PillToggleGroup } from "./pill-toggle-group";

export function StepTwoForm() {
  const router = useRouter();
  const [birthday, setBirthday] = useState("");
  const [identity, setIdentity] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!identity) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
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
      .update({ gender: identity, birthday: birthday || null })
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      setError(error.message);
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
      onSubmit={handleSubmit}
      continueLabel={loading ? "Saving…" : "Continue"}
      continueDisabled={loading || !identity}
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
          value={birthday}
          onChange={(event) => setBirthday(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs tracking-wide uppercase">
          How do you identify?
        </Label>
        <PillToggleGroup
          options={GENDER_OPTIONS}
          isSelected={(value) => identity === value}
          onToggle={(value) => setIdentity(value as Gender)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
