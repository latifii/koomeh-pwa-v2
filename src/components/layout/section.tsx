import { cn } from "@/lib/utils";

import { Container } from "./container";

export function Section({
  tone = "default",
  spacing = "default",
  container = true,
  containerClassName,
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  tone?: "default" | "muted" | "primary";
  spacing?: "default" | "sm" | "none";
  container?: boolean;
  containerClassName?: string;
}) {
  return (
    <section
      className={cn(
        spacing === "default" && "py-section",
        spacing === "sm" && "py-section-sm",
        tone === "muted" && "bg-muted/40",
        tone === "primary" && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {container ? (
        <Container className={containerClassName}>{children}</Container>
      ) : (
        children
      )}
    </section>
  );
}
