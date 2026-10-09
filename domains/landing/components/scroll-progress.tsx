"use client";

import { useEffect, useRef } from "react";

// A hairline along the bottom of the sticky header that fills as the
// visitor moves down the page.
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        node.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-testid="landing-page__scroll-progress"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-slate/70"
    />
  );
}
