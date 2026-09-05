import Link from "next/link";
import {
  ArrowUpFromLine,
  Archive,
  ArchiveRestore,
  BadgeCheck,
  Eye,
  EyeOff,
  Images,
  MapPin,
  MessageSquareWarning,
  MoreVertical,
  Phone,
  Rotate3d,
  Send,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";

import type { PanelEstateRow } from "@/app/panel/properties/_mappers/panel-estates.mapper";
import type { PanelEstateAction } from "@/app/panel/properties/_types/panel-estates.types";
import apartmentImage from "@/assets/images/card/apartman.webp";
import { ApiImage } from "@/components/shared/api-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * One listing in the panel. Which actions appear is decided entirely by the
 * row's own `permissions` — the API already accounts for the caller's role and
 * the file's state, so nothing here re-derives it.
 */
export function PanelPropertyRow({
  row,
  onAction,
}: {
  row: PanelEstateRow;
  onAction: (id: string, title: string, action: PanelEstateAction) => void;
}) {
  const { permissions: can } = row;

  type MenuItem = {
    action: PanelEstateAction;
    label: string;
    icon: typeof Archive;
    allowed: boolean;
    danger?: boolean;
  };

  const menuItems: MenuItem[] = (
    [
      { action: "publish", label: "تأیید نمایش", icon: BadgeCheck, allowed: can.can_publish },
      { action: "ladder", label: "نردبان", icon: ArrowUpFromLine, allowed: can.can_ladder },
      { action: "archive", label: "آرشیو کردن", icon: Archive, allowed: can.can_archive },
      { action: "restore", label: "جاری کردن", icon: ArchiveRestore, allowed: can.can_restore },
      { action: "notify-owner", label: "معرفی مشاور به مالک", icon: Send, allowed: can.can_edit, danger: true },
      { action: "absence", label: "پیامک عدم حضور", icon: MessageSquareWarning, allowed: can.can_edit, danger: true },
      { action: "delete", label: "حذف آگهی", icon: Trash2, allowed: can.can_delete, danger: true },
    ] satisfies MenuItem[]
  ).filter((item) => item.allowed);

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row">
      <Link
        href={row.href}
        className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40"
      >
        <ApiImage
          src={row.coverImage ?? ""}
          fallbackSrc={apartmentImage}
          alt={row.title}
          fill
          sizes="160px"
          className="object-cover"
        />
        {row.imageCount > 0 && (
          <span className="absolute bottom-1.5 inset-s-1.5 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
            <Images className="size-3" />
            {row.imageCount.toLocaleString("fa-IR")}
          </span>
        )}
        {row.hasVirtualTour && (
          <span className="absolute bottom-1.5 inset-e-1.5 flex size-5 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Rotate3d className="size-3" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={row.href}>
              <Typography variant="h4" as="h3" className="truncate sm:text-sm">
                {row.title}
              </Typography>
            </Link>
            <Typography variant="small" className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>کد {row.numericId.toLocaleString("fa-IR")}</span>
              <span>{row.estateTypeLabel}</span>
              <span>{row.dealTypeLabel}</span>
              {row.area && <span>{row.area.toLocaleString("fa-IR")} متر</span>}
            </Typography>
          </div>

          {menuItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label={`عملیات ${row.title}`} />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {can.can_edit && (
                  <>
                    <DropdownMenuItem
                      render={<Link href={routes.panel.editProperty(row.id)} />}
                    >
                      <Pencil className="size-4" />
                      ویرایش آگهی
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href={routes.panel.adManagement(row.id)} />}
                    >
                      <SquarePen className="size-4" />
                      مدیریت آگهی
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {menuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.action}
                    onClick={() => onAction(row.id, row.title, item.action)}
                    className={cn(item.danger && "text-destructive")}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {row.locationLabel && (
          <Typography variant="small" className="flex items-center gap-1">
            <MapPin className="size-3.5 text-brand/70" />
            {row.locationLabel}
          </Typography>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{row.confirmationLabel}</Badge>
          <Badge
            variant="secondary"
            className={cn(
              "gap-1",
              row.isVisible
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            )}
          >
            {row.isVisible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
            {row.isVisible ? "قابل نمایش" : "مخفی"}
          </Badge>
          {row.fromDivar && <Badge variant="secondary">دیوار</Badge>}
          {row.expertName && <Badge variant="secondary">{row.expertName}</Badge>}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t pt-2">
          <div className="min-w-0">
            <Typography variant="h4" as="p" className="text-brand dark:text-white sm:text-sm">
              {row.priceLabel}
            </Typography>
            {row.perMeterLabel && (
              <Typography variant="small" className="text-[11px]">
                متری {row.perMeterLabel}
              </Typography>
            )}
          </div>

          {/* Only shown when the API says this caller may see it. */}
          {can.can_view_owner_contact && row.ownerPhone && (
            <Typography
              as="a"
              variant="small"
              href={`tel:${row.ownerPhone}`}
              className="flex items-center gap-1 font-medium text-foreground hover:text-brand"
            >
              <Phone className="size-3.5 text-brand/70" />
              {row.ownerName ? `${row.ownerName} · ` : ""}
              {row.ownerPhone}
            </Typography>
          )}
        </div>
      </div>
    </article>
  );
}
