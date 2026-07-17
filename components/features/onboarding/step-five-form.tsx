"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OnboardingShell } from "./onboarding-shell";
import { PillToggleGroup } from "./pill-toggle-group";
import type { Database } from "@/types/database.types";

type StyleTag = Database["public"]["Enums"]["style_tag_type"];

const STYLE_TAG_OPTIONS: { value: StyleTag; label: string }[] = [
  { value: "clean_minimal", label: "Clean & Minimal" },
  { value: "effortlessly_casual", label: "Effortlessly Casual" },
  { value: "office_ready", label: "Office-Ready" },
  { value: "soft_feminine", label: "Soft & Feminine" },
  { value: "bold_expressive", label: "Bold & Expressive" },
  { value: "street_inspired", label: "Street-Inspired" },
  { value: "still_figuring_it_out", label: "Still Figuring It Out" },
];

export function StepFiveForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<StyleTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(value: StyleTag) {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((tag) => tag !== value)
        : [...prev, value],
    );
  }

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
      .update({ style_tags: selected })
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      setError(error.message);
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
      onSubmit={handleSubmit}
      continueLabel={loading ? "Saving…" : "Continue"}
      continueDisabled={loading}
    >
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Your style, in your words
        </span>
        <PillToggleGroup
          options={STYLE_TAG_OPTIONS}
          isSelected={(value) => selected.includes(value as StyleTag)}
          onToggle={(value) => toggleTag(value as StyleTag)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </OnboardingShell>
  );
}
