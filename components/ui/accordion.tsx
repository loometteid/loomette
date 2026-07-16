import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium outline-none",
          className,
        )}
        {...props}
      >
        {children}
        <Plus className="size-4 shrink-0 text-muted-foreground group-data-[panel-open]/accordion-trigger:hidden" />
        <Minus className="hidden size-4 shrink-0 text-muted-foreground group-data-[panel-open]/accordion-trigger:block" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionPanel({
  className,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      className={cn("pb-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel };
