import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "border-border data-[checked]:bg-foreground data-[checked]:border-foreground flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-background outline-none transition-colors",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex data-[unchecked]:hidden">
        <Check className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
