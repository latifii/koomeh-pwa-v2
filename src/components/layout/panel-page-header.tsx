import { Typography } from "@/components/ui/typography";

export function PanelPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Typography as="h1" variant="h3">{title}</Typography>
        {description && <Typography variant="muted" className="mt-1 leading-6">{description}</Typography>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

