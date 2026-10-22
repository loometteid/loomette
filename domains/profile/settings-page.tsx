"use client";

import { Activity, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getProfileQueryOptionsForBrowser } from "./query-options/get-profile.query-option.client";
import { updatePrivacySettingMutationOptions } from "./mutation-options/update-privacy-setting.mutation-option.client";
import { ProfileBreadcrumb } from "./components/profile-breadcrumb";
import { LogoutDialog } from "./components/logout-dialog";
import { DeleteAccountDialog } from "./components/delete-account-dialog";
import { deleteAccountAction } from "./actions/delete-account.action";
import { useNotificationSettings } from "./hooks/use-notification-settings";
import type { Route } from "next";

const SECTIONS = [
  { id: "pricing", label: "Pricing" },
  { id: "notification", label: "Notification" },
  { id: "appearance", label: "Appearance" },
  { id: "privacy-data", label: "Privacy & Data" },
  { id: "account", label: "Account" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function notImplemented() {
  toast("Coming soon.");
}

function SettingsSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="flex flex-col gap-4 scroll-mt-24">
      <Typography variant="h1" as="h2" className="font-serif text-lg md:text-xl font-normal text-foreground">
        {title}
      </Typography>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

function ChevronRow({
  label,
  onClick,
  href,
}: {
  label: string;
  onClick?: () => void;
  href?: Route;
}) {
  if (href) {
    return (
      <Link
        href={href}
        prefetch
        className="flex items-center justify-between text-left hover:opacity-80 transition-opacity"
      >
        <span className="font-sans text-xs font-normal tracking-wider uppercase text-foreground">
          {label}
        </span>
        <ChevronRight className="text-muted-foreground size-4" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between text-left hover:opacity-80 transition-opacity w-full"
    >
      <span className="font-sans text-xs font-normal tracking-wider uppercase text-foreground">
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
  testId,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  testId?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-xs font-normal tracking-wider uppercase text-foreground">
        {label}
      </span>
      <Switch
        data-testid={testId}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export function SettingsView({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile } = useSuspenseQuery(
    getProfileQueryOptionsForBrowser(userId),
  );

  const [activeSection, setActiveSection] = useState<SectionId>("pricing");
  const [isPrivate, setIsPrivate] = useState(profile?.is_private ?? false);
  const {
    outfitReminders,
    analysisReady,
    weeklyRecap,
    setOutfitReminders,
    setAnalysisReady,
    setWeeklyRecap,
  } = useNotificationSettings();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    try {
      setLoggingOut(true);
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      router.push("/sign-in");
    } catch {
      toast.error("Failed to log out");
      setLoggingOut(false);
    }
  }

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);
      await deleteAccountAction();
      toast.success("Account deleted");
      router.push("/sign-in");
    } catch {
      toast.error("Couldn't delete account. Please try again.");
      setIsDeleting(false);
    }
  }

  function scrollToSection(id: SectionId) {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Scrollspy effect on desktop to update active navigation tab
  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop - 160;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-[402px] lg:max-w-[1140px] flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
      {/* Breadcrumb (desktop) */}
      <ProfileBreadcrumb
        items={[
          { label: "PROFILE", href: "/profile" },
          { label: "SETTINGS" },
        ]}
      />

      {/* Mobile back button */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-10 rounded-xl bg-[#F2EDE5] text-[#383733] hover:bg-[#EAE4DC]"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="size-5" />
        </Button>
      </div>

      {/* Header title */}
      <div className="flex items-start gap-3.5 lg:gap-4">
        <Sparkle className="size-6 lg:size-8 text-[#444440] shrink-0 mt-1 lg:mt-2" />
        <div className="flex flex-col gap-1 lg:gap-2">
          <Typography variant="title" as="h1" className="font-serif text-[32px] md:text-4xl lg:text-[48px] font-normal text-[#444440] leading-tight">
            Settings
          </Typography>
          <p className="font-sans text-xs md:text-sm lg:text-xl font-normal text-[#444440] leading-snug">
            Manage how the app works for you.
          </p>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex flex-col lg:flex-row lg:gap-14 pt-2">
        {/* Left Sticky Navigation (desktop only) */}
        <nav
          aria-label="Settings sections"
          className="hidden lg:flex flex-col gap-2 w-64 shrink-0 sticky top-28 h-fit"
        >
          {SECTIONS.map(({ id, label }) => {
            const isActive = activeSection === id;
            const button = (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className={cn(
                  "text-left px-5 py-3 rounded-2xl font-sans text-xs lg:text-sm font-normal tracking-wide uppercase transition-colors",
                  isActive
                    ? "bg-[#F2EDE5] text-[#383733]"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#F2EDE5]/40",
                )}
              >
                {label}
              </button>
            );

            if (id === "notification") {
              return (
                <Activity key={id} mode="hidden">
                  {button}
                </Activity>
              );
            }

            return button;
          })}
        </nav>

        {/* Vertical divider on desktop */}
        <div className="hidden lg:block w-px bg-border/60 self-stretch" />

        {/* Right Content Sections (matches Figma 723px content width) */}
        <div className="flex flex-1 flex-col gap-10 lg:gap-12 w-full max-w-[723px]">
          <SettingsSection id="pricing" title="Pricing">
            <ChevronRow
              label="Your plan"
              href={"/profile/settings/pricing" as Route}
            />
          </SettingsSection>

          <Activity mode="hidden">
            <SettingsSection id="notification" title="Notification">
              <ToggleRow
                label="Outfit reminders"
                checked={outfitReminders}
                onCheckedChange={setOutfitReminders}
                testId="settings__outfit-reminders-toggle"
              />
              <ToggleRow
                label="Analysis ready"
                checked={analysisReady}
                onCheckedChange={setAnalysisReady}
                testId="settings__analysis-ready-toggle"
              />
              <ToggleRow
                label="Weekly recap"
                checked={weeklyRecap}
                onCheckedChange={setWeeklyRecap}
                testId="settings__weekly-recap-toggle"
              />
            </SettingsSection>
          </Activity>

          <SettingsSection id="appearance" title="Appearance">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-normal tracking-wider uppercase text-foreground">
                Language
              </span>
              <button
                type="button"
                onClick={notImplemented}
                data-testid="settings__language-button"
                aria-label="Select language"
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-2xl border border-[#C9C3B7] dark:border-border bg-transparent text-xs font-sans font-normal text-[#444440] dark:text-foreground hover:bg-[#F2EDE5]/50 dark:hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <span>EN</span>
                <ChevronDown className="size-3 text-[#444440] dark:text-foreground" />
              </button>
            </div>
          </SettingsSection>

          <SettingsSection id="privacy-data" title="Privacy & Data">
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
              href={"/profile/settings/privacy" as Route}
            />
          </SettingsSection>

          <SettingsSection id="account" title="Account">
            <ChevronRow
              label="Connected account"
              href={"/profile/settings/connected-accounts" as Route}
            />
            <ChevronRow
              label={loggingOut ? "Logging out…" : "Log out"}
              onClick={() => setLogoutDialogOpen(true)}
            />
            <ChevronRow
              label="Delete account"
              onClick={() => setDeleteDialogOpen(true)}
            />
          </SettingsSection>

          <Typography
            variant="subtitle"
            className="pt-6 pb-4 text-center font-sans text-[10px] font-normal uppercase tracking-wider text-muted-foreground/80"
          >
            loomette · version 0.0.1
          </Typography>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirmLogout={handleLogOut}
        isLoggingOut={loggingOut}
      />

      {/* Delete Account 3-Step Dialog */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
}
