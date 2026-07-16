import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  endIcon,
  ...props
}: React.ComponentProps<"input"> & { endIcon?: React.ReactNode }) {
  const field = (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-transparent bg-secondary px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        endIcon && "pr-8",
        !endIcon && className,
      )}
      {...props}
    />
  );

  if (!endIcon) {
    return field;
  }

  // When endIcon is present, `className` goes on the wrapper instead of the
  // field itself, so callers can still control layout (width, etc.) the
  // same way regardless of whether endIcon is used.
  return (
    <div className={cn("relative w-full", className)}>
      {field}
      <span
        data-slot="input-end-icon"
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground [&_svg]:size-4"
      >
        {endIcon}
      </span>
    </div>
  );
}

export { Input };
