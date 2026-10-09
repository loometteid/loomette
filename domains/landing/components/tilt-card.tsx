"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Tilts its child a few degrees toward the pointer, like a card being
// picked up. Mouse/pen only; touch and reduced motion stay flat.
export function TiltCard({
  className,
  maxTilt = 6,
  children,
}: {
  className?: string;
  maxTilt?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const reset = () => {
    ref.current?.style.setProperty("--tilt-x", "0deg");
    ref.current?.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={ref}
      className={cn("landing-tilt h-full", className)}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        node.style.setProperty("--tilt-x", `${(-y * maxTilt).toFixed(2)}deg`);
        node.style.setProperty("--tilt-y", `${(x * maxTilt).toFixed(2)}deg`);
      }}
      onPointerLeave={reset}
    >
      {children}
    </div>
  );
}
