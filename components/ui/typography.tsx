import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      "mega-title": "font-serif text-mega-title",
      title: "font-serif text-title",
      h1: "font-serif text-h1",
      subtitle:
        "font-sans text-subtitle text-muted-foreground uppercase tracking-wide",
    },
  },
  defaultVariants: {
    variant: "mega-title",
  },
});

type TypographyVariant = "mega-title" | "title" | "h1" | "subtitle";

const defaultTag: Record<TypographyVariant, React.ElementType> = {
  "mega-title": "h1",
  title: "h2",
  h1: "h3",
  subtitle: "p",
};

type TypographyProps<T extends React.ElementType> = {
  as?: T;
  variant?: TypographyVariant;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "variant">;

function Typography<T extends React.ElementType = "p">({
  as,
  variant = "mega-title",
  className,
  ...props
}: TypographyProps<T>) {
  const Tag = (as ?? defaultTag[variant]) as React.ElementType;

  return (
    <Tag
      data-slot="typography"
      data-variant={variant}
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Typography, typographyVariants };
