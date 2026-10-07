"use client";

import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

/**
 * Horizontally scrollable, center-snapped subcategory selector powered by Embla Carousel.
 * The active subcategory sits centered at full size/opacity; neighbors fade out
 * via a mask gradient. Matches figma/wardrobe/3. Wardrobe.png.
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
  const activeIndex = Math.max(0, options.indexOf(active));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    startIndex: activeIndex,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const selected = emblaApi.selectedScrollSnap();
    if (options[selected] && options[selected] !== active) {
      onChange(options[selected]);
    }
  }, [emblaApi, options, active, onChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const current = emblaApi.selectedScrollSnap();
    if (current !== activeIndex) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [emblaApi, activeIndex]);

  return (
    <div
      ref={emblaRef}
      className="w-full overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
      }}
    >
      <div className="flex touch-pan-y">
        {options.map((option, index) => (
          <div key={option} className="flex-none px-5">
            <button
              type="button"
              onClick={() => {
                emblaApi?.scrollTo(index);
                onChange(option);
              }}
              className={cn(
                "font-serif text-2xl lg:text-3xl whitespace-nowrap transition-all duration-200",
                option === active
                  ? "text-foreground font-semibold scale-105"
                  : "text-[#8C887B]/40 hover:text-foreground/70",
              )}
            >
              {option}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
