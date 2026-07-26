import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "font-heading text-3xl font-bold leading-tight sm:text-5xl sm:leading-tight",
      h2: "font-heading text-2xl font-bold sm:text-3xl",
      h3: "font-heading text-lg font-semibold sm:text-xl",
      h4: "font-heading text-sm font-semibold sm:text-base",
      eyebrow: "text-sm font-medium text-primary dark:text-primary",
      lead: "text-sm text-muted-foreground sm:text-base",
      body: "text-sm leading-relaxed",
      muted: "text-sm text-muted-foreground",
      small: "text-xs text-muted-foreground",
    },
    light: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { variant: "eyebrow", light: true, className: "text-secondary" },
    { variant: "h1", light: true, className: "text-white" },
    { variant: "h2", light: true, className: "text-white" },
    { variant: "h3", light: true, className: "text-white" },
    { variant: "h4", light: true, className: "text-white" },
    { variant: "lead", light: true, className: "text-white/80" },
    { variant: "body", light: true, className: "text-white/80" },
    { variant: "muted", light: true, className: "text-white/70" },
    { variant: "small", light: true, className: "text-white/70" },
  ],
  defaultVariants: {
    variant: "body",
    light: false,
  },
});

const defaultElement = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  eyebrow: "span",
  lead: "p",
  body: "p",
  muted: "p",
  small: "small",
} as const;

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

export function Typography<
  T extends keyof React.JSX.IntrinsicElements = "p",
>({
  variant = "body",
  light,
  as,
  className,
  ...props
}: {
  variant?: TypographyVariant;
  light?: boolean;
  as?: T;
} & Omit<React.ComponentProps<T>, "as">) {
  const Component = (as ??
    defaultElement[variant ?? "body"]) as React.ElementType;

  return (
    <Component
      className={cn(typographyVariants({ variant, light }), className)}
      {...props}
    />
  );
}
