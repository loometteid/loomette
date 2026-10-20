import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: Route | (string & {});
};

export function ProfileBreadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "hidden lg:flex items-center gap-2 font-sans text-xs font-normal tracking-wider text-muted-foreground uppercase",
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.label} className="inline-flex items-center gap-2">
            {index > 0 && <ChevronRight className="size-3 text-muted-foreground/60" />}
            {item.href && !isLast ? (
              <Link
                href={item.href as Route}
                prefetch
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && "text-foreground font-normal")}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
