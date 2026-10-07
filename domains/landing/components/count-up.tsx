"use client";

import { useEffect, useRef, useState } from "react";

// Splits "340k+" into 340 / "k+" and counts the number up from zero
// once the stat scrolls into view. Server render (and reduced motion)
// shows the final value, so the figure is never wrong or empty.
export function CountUp({
  value,
  duration = 1400,
  className,
  ...props
}: {
  value: string;
  duration?: number;
  className?: string;
} & Record<`data-${string}`, string | undefined>) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!node || !match || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = Number(match[1]);
    const decimals = match[1].split(".")[1]?.length ?? 0;
    const suffix = match[2];
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(`${(target * eased).toFixed(decimals)}${suffix}`);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay(`${(0).toFixed(decimals)}${suffix}`);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className} aria-label={value} {...props}>
      {display}
    </span>
  );
}
