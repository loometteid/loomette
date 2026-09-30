"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrollable, center-snapped subcategory selector — not
 * tabs. The active subcategory sits centered at full size/opacity;
 * neighbors are partially visible at the edges and fade out via a
 * mask gradient, hinting there's more to scroll. Matches
 * figma/wardrobe/3. Wardrobe.png, not a segmented control.
 */
export function SubcategoryCarousel({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressScrollSync = useRef(false);

  useEffect(() => {
    const el = itemRefs.current.get(active);
    if (!el) return;
    suppressScrollSync.current = true;
    el.scrollIntoView({
      behavior: "instant" as ScrollBehavior,
      inline: "center",
      block: "nearest",
    });
    // Let the instant scroll settle before re-enabling scroll-driven sync.
    setTimeout(() => {
      suppressScrollSync.current = false;
    }, 50);
    // Only re-run when the set of options changes identity (new category
    // data) — `active` changes are driven by the scroll handler itself
    // for user-initiated scrolls, and by the click handler below for taps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  function syncActiveFromScroll() {
    const container = containerRef.current;
    if (!container || suppressScrollSync.current) return;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closest: string | null = null;
    let closestDistance = Infinity;
    for (const [value, el] of itemRefs.current) {
      const itemCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(itemCenter - containerCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = value;
      }
    }
    if (closest && closest !== active) onChange(closest);
  }

  function handleScroll() {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(syncActiveFromScroll, 120);
  }

  function handleClick(value: string) {
    const el = itemRefs.current.get(value);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    onChange(value);
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="scrollbar-none flex w-full snap-x snap-mandatory gap-10 overflow-x-auto px-[30%]"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          ref={(el) => {
            if (el) itemRefs.current.set(option, el);
            else itemRefs.current.delete(option);
          }}
          type="button"
          onClick={() => handleClick(option)}
          className={cn(
            "shrink-0 snap-center font-serif text-2xl whitespace-nowrap transition-colors",
            option === active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
