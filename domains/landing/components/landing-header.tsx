"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// The sticky header picks up a hairline border and soft shadow once
// the page has scrolled, so it reads as floating over the content.
export function LandingHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => {
      node.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      ref={ref}
      data-testid="landing-page__header"
      className={cn(
        "border-b border-transparent transition-[border-color,box-shadow] duration-300 data-[scrolled=true]:border-stone/40 data-[scrolled=true]:shadow-[0_6px_24px_-18px_rgba(20,20,15,0.35)]",
        className,
      )}
    >
      {children}
    </header>
  );
}
