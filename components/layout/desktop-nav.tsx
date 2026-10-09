"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import { cn } from "@/lib/utils";
import { getProfileQueryOptionsForBrowser } from "@/domains/profile/query-options/get-profile.query-option.client";

const TABS = [
  { href: "/home", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/wardrobe", label: "Wardrobe" },
] as const;

export function DesktopNavProfileFallback() {
  return <div className="h-3.5 w-14 bg-muted animate-pulse rounded" />;
}

function DesktopNavProfile({ userId }: { userId: string }) {
  const { data: profile } = useSuspenseQuery({
    ...getProfileQueryOptionsForBrowser(userId),
  });

  return <span>{profile.display_name || "Profile"}</span>;
}

export function DesktopNavFallback() {
  const pathname = usePathname();

  return (
    <header
      data-testid="desktop-nav"
      className="sticky top-0 z-40 hidden lg:flex w-full items-center justify-between border-b border-border/40 px-12 py-5 bg-background/95 backdrop-blur-sm"
    >
      {/* Left container with flex-1 */}
      <div className="flex flex-1 items-center justify-start">
        <Link
          href="/home"
          prefetch
          className="flex items-center gap-2"
          data-testid="desktop-nav__brand"
        >
          <Sparkle className="size-5 text-foreground" />
          <span className="font-serif text-xl tracking-tight">loomette</span>
        </Link>
      </div>

      {/* Center navigation tabs (anchored at center) */}
      <nav className="flex items-center gap-8 shrink-0">
        {TABS.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              data-testid={`desktop-nav__tab-${label.toLowerCase()}`}
              className={cn(
                "text-xs uppercase tracking-wider transition-colors pb-1",
                isActive
                  ? "text-foreground font-semibold border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right container with flex-1 */}
      <div className="flex flex-1 items-center justify-end">
        <Link
          href="/profile"
          prefetch
          className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:opacity-80"
          data-testid="desktop-nav__profile"
        >
          <DesktopNavProfileFallback />
          <User className="size-4" />
        </Link>
      </div>
    </header>
  );
}

export function DesktopNav({
  userId,
  displayName,
}: {
  userId?: string;
  displayName?: string | null;
}) {
  const pathname = usePathname();

  return (
    <header
      data-testid="desktop-nav"
      className="sticky top-0 z-40 hidden lg:flex w-full items-center justify-between border-b border-border/40 px-12 py-5 bg-background/95 backdrop-blur-sm"
    >
      {/* Left container with flex-1 */}
      <div className="flex flex-1 items-center justify-start">
        <Link
          href="/home"
          prefetch
          className="flex items-center gap-2"
          data-testid="desktop-nav__brand"
        >
          <Sparkle className="size-5 text-foreground" />
          <span className="font-serif text-xl tracking-tight">loomette</span>
        </Link>
      </div>

      {/* Center navigation tabs (anchored at center) */}
      <nav className="flex items-center gap-8 shrink-0">
        {TABS.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              data-testid={`desktop-nav__tab-${label.toLowerCase()}`}
              className={cn(
                "text-xs uppercase tracking-wider transition-colors pb-1",
                isActive
                  ? "text-foreground font-semibold border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right container with flex-1 */}
      <div className="flex flex-1 items-center justify-end">
        <Link
          href="/profile"
          prefetch
          className="flex items-center gap-2 text-xs uppercase tracking-wider text-foreground hover:opacity-80"
          data-testid="desktop-nav__profile"
        >
          {displayName !== undefined ? (
            <span>{displayName || "Profile"}</span>
          ) : userId ? (
            <Suspense fallback={<DesktopNavProfileFallback />}>
              <DesktopNavProfile userId={userId} />
            </Suspense>
          ) : (
            <DesktopNavProfileFallback />
          )}
          <User className="size-4" />
        </Link>
      </div>
    </header>
  );
}
