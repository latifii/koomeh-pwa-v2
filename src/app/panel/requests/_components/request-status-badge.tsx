import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/app/panel/_data/panel";
const meta: Record<RequestStatus, { label: string; variant: "default" | "secondary" | "outline" }> = { new: { label: "جدید", variant: "secondary" }, following: { label: "در حال پیگیری", variant: "default" }, matched: { label: "فایل مناسب یافت شد", variant: "outline" }, closed: { label: "بسته‌شده", variant: "outline" } };
export function RequestStatusBadge({ status }: { status: RequestStatus }) { const item = meta[status]; return <Badge variant={item.variant}>{item.label}</Badge>; }

