import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PanelDashboardPage() {
  return (
    <Card className="rounded-lg border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">صفحه داشبورد</CardTitle>
        <CardDescription>
          اطلاعات پنل بعد از آماده شدن سرویس ورود و داده‌های کاربر اینجا نمایش
          داده می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          صفحه داشبورد
        </div>
      </CardContent>
    </Card>
  );
}
