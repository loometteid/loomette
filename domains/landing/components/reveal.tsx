"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Fades its children up into place the first time they scroll into
// view. The hidden starting state lives in globals.css under
// `@media (scripting: enabled)`, so without JS (and under
// prefers-reduced-motion) everything simply renders in place.
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
  ...props
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
} & Record<`data-${string}`, string | number | undefined>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = "true";
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.revealed = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
