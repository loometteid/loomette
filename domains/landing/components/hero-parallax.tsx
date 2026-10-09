"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Tracks the pointer across the hero as --mx / --my (-1 to 1) and how
// far the hero has scrolled away as --sy (0 to 1), set on the hero
// section so the mascots and the hero copy can both respond. The
// motion itself is pure CSS (`landing-parallax`, `landing-hero-copy`).
export function HeroParallax({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = ref.current?.parentElement;
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pointerFrame = 0;
    let scrollFrame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        hero.style.setProperty("--mx", x.toFixed(3));
        hero.style.setProperty("--my", y.toFixed(3));
      });
    };
    const onLeave = () => {
      hero.style.setProperty("--mx", "0");
      hero.style.setProperty("--my", "0");
    };
    const onScroll = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const progress = Math.min(
          Math.max(window.scrollY / hero.offsetHeight, 0),
          1,
        );
        hero.style.setProperty("--sy", progress.toFixed(3));
      });
    };

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (finePointer) {
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(scrollFrame);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
