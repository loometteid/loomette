import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@/components/ui/sparkle";
import { Typography } from "@/components/ui/typography";
import { ProfileBreadcrumb } from "./components/profile-breadcrumb";

export function SettingsFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12">
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
          className="rounded-xl opacity-60"
          disabled
          aria-label="Go back"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Sparkle className="size-6 text-foreground" />
          <Typography variant="title" as="h1" className="font-serif text-[32px] md:text-4xl font-normal text-foreground leading-tight">
            Settings
          </Typography>
        </div>
        <Typography variant="subtitle" className="font-sans text-xs font-normal uppercase tracking-wider text-muted-foreground">
          Manage how the app works for you.
        </Typography>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex flex-col lg:flex-row lg:gap-16 pt-2">
        {/* Left Sticky Navigation Skeleton (desktop only) */}
        <nav
          aria-label="Settings sections skeleton"
          className="hidden lg:flex flex-col gap-2 w-64 shrink-0"
        >
          {["Pricing", "Notification", "Appearance", "Privacy & Data", "Account"].map((item, idx) => (
            <div
              key={item}
              className={`px-5 py-3 rounded-2xl ${
                idx === 0 ? "bg-[#F2EDE5]" : "bg-muted/40"
              } h-11 w-full animate-pulse`}
            />
          ))}
        </nav>

        {/* Vertical divider on desktop */}
        <div className="hidden lg:block w-px bg-border/60 self-stretch" />

        {/* Right Content Sections */}
        <div className="flex flex-1 flex-col gap-12 max-w-2xl">
          {[1, 2, 3].map((sectionIdx) => (
            <div key={sectionIdx} className="flex flex-col gap-4">
              <div className="bg-muted h-6 w-32 animate-pulse rounded-md" />
              <div className="flex flex-col gap-5">
                {[1, 2].map((rowIdx) => (
                  <div key={rowIdx} className="flex items-center justify-between">
                    <div className="bg-muted h-4 w-40 animate-pulse rounded" />
                    <div className="bg-muted h-5 w-9 animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
