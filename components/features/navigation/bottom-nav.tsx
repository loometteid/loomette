"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/wardrobe", label: "Wardrobe" },
  { href: "/profile", label: "Profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex w-full items-stretch justify-around bg-white/10 px-2 py-3 backdrop-blur-md">
      {TABS.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-1 text-xs font-medium tracking-wide uppercase",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
            <span
              className={cn(
                "size-1 rounded-full",
                isActive ? "bg-foreground" : "bg-transparent",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
