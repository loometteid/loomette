"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { OnboardingShell } from "./onboarding-shell";

export function StepOneForm({ email }: { email: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
      .update({ display_name: name })
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      setError(error.message);
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
      onSubmit={handleSubmit}
      continueLabel={loading ? "Saving…" : "Continue"}
      continueDisabled={loading || name.trim().length === 0}
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
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
