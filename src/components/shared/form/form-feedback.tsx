import { Check, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

export function FormProgressCard({
  title,
  completion,
  description,
}: {
  title: string;
  completion: number;
  description: string;
}) {
  return (
    <Card className="border-brand/20 bg-brand/5 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Typography variant="h4">{title}</Typography>
          <Badge variant="secondary" className="bg-brand/10 text-brand">
            {completion}%
          </Badge>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand/10">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        <Typography variant="small" className="mt-3">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function FormSubmitButton({
  isSubmitting,
  idleLabel,
}: {
  isSubmitting: boolean;
  idleLabel: string;
}) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
      <Save />
      {isSubmitting ? "در حال ذخیره..." : idleLabel}
    </Button>
  );
}

export function FormSuccessMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-success">
      <Check className="size-4" />
      <Typography variant="small" className="text-current">
        {message}
      </Typography>
    </div>
  );
}
