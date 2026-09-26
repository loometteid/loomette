"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getProfileQueryOptionsForBrowser } from "./query-options/get-profile.query-option.client";
import { updatePrivacySettingMutationOptions } from "./mutation-options/update-privacy-setting.mutation-option.client";

function notImplemented() {
  toast("Coming soon.");
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Typography variant="h1" as="h2">
        {title}
      </Typography>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function ChevronRow({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between text-left"
    >
      <span className="text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <ChevronRight className="text-muted-foreground size-4" />
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function SettingsView({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );

  const [isPrivate, setIsPrivate] = useState(profile?.is_private ?? false);
  const [outfitReminders, setOutfitReminders] = useState(true);
  const [analysisReady, setAnalysisReady] = useState(true);
  const [weeklyRecap, setWeeklyRecap] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const privacyMutation = useMutation({
    ...updatePrivacySettingMutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getProfileQueryOptionsForBrowser(userId).queryKey,
      });
    },
    onError: () => {
      setIsPrivate((prev) => !prev);
      toast.error("Couldn't update that.");
    },
  });

  function handlePrivacyToggle(next: boolean) {
    setIsPrivate(next);
    privacyMutation.mutate({ userId, isPrivate: next });
  }

  async function handleLogOut() {
    setLoggingOut(true);
    const supabase = createBrowserSupabaseClient();

    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-6 py-8">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-xl"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkle className="size-5 text-foreground" />
          <Typography variant="title" as="h1">
            Settings
          </Typography>
        </div>
        <Typography variant="subtitle">
          Manage how the app works for you.
        </Typography>
      </div>

      <SettingsSection title="Pricing">
        <ChevronRow label="Your plan" onClick={notImplemented} />
      </SettingsSection>

      <SettingsSection title="Notification">
        <ToggleRow
          label="Outfit reminders"
          checked={outfitReminders}
          onCheckedChange={setOutfitReminders}
        />
        <ToggleRow
          label="Analysis ready"
          checked={analysisReady}
          onCheckedChange={setAnalysisReady}
        />
        <ToggleRow
          label="Weekly recap"
          checked={weeklyRecap}
          onCheckedChange={setWeeklyRecap}
        />
      </SettingsSection>

      <SettingsSection title="Appearance">
        <button
          type="button"
          onClick={notImplemented}
          className="flex items-center justify-between text-left"
        >
          <span className="text-xs font-medium tracking-wide uppercase">
            Language
          </span>
          <span className="border-border text-muted-foreground flex items-center gap-1 rounded-full border px-3 py-1 text-xs uppercase">
            EN
            <ChevronDown className="size-3.5" />
          </span>
        </button>
      </SettingsSection>

      <SettingsSection title="Privacy & Data">
        <ToggleRow
          label="Private account"
          checked={isPrivate}
          onCheckedChange={handlePrivacyToggle}
        />
        {privacyMutation.isPending && (
          <span className="text-muted-foreground -mt-2 text-xs">Saving…</span>
        )}
        <ChevronRow
          label="Privacy & Policy"
          onClick={() => router.push("/profile/settings/privacy")}
        />
      </SettingsSection>

      <SettingsSection title="Account">
        <ChevronRow label="Connected account" onClick={notImplemented} />
        <ChevronRow
          label={loggingOut ? "Logging out…" : "Log out"}
          onClick={handleLogOut}
        />
        <ChevronRow label="Delete account" onClick={notImplemented} />
      </SettingsSection>

      <Typography
        variant="subtitle"
        className="pb-4 text-center text-xs tracking-wide"
      >
        loomette · version 0.0.1
      </Typography>
    </main>
  );
}
