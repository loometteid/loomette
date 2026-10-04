"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/wardrobe", label: "Wardrobe" },
] as const;

export function DesktopNav({ username }: { username?: string | null }) {
  const pathname = usePathname();

  return (
    <header
      data-testid="desktop-nav"
      className="hidden lg:flex w-full items-center justify-between border-b border-border/40 px-12 py-5 bg-background"
    >
      <Link
        href="/home"
        prefetch
        className="flex items-center gap-2"
        data-testid="desktop-nav__brand"
      >
        <Sparkle className="size-5 text-foreground" />
        <span className="font-serif text-xl tracking-tight">loomette</span>
      </Link>

      <nav className="flex items-center gap-8">
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

      <Link
        href="/profile"
        prefetch
        className="flex items-center gap-2 text-xs uppercase tracking-wider text-foreground hover:opacity-80"
        data-testid="desktop-nav__profile"
      >
        <span>{username || "Profile"}</span>
        <User className="size-4" />
      </Link>
    </header>
  );
}
