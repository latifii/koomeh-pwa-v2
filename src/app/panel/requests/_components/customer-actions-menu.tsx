"use client";

import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  ArrowUpFromLine,
  MessageSquareWarning,
  MoreVertical,
  SquarePen,
  UserMinus,
  UserPlus,
} from "lucide-react";

import {
  customerActionCopy,
  type CustomerAction,
  type useCustomerActions,
} from "@/app/panel/requests/_hooks/use-customer-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Permissions = {
  can_edit: boolean;
  can_archive: boolean;
  can_restore: boolean;
};

/**
 * The demand's action menu and its confirmation. What appears is decided by the
 * row's own permissions plus whether a case already has an agent — the API
 * only accepts "assign to me" while it has none.
 */
export function CustomerActionsMenu({
  customerId,
  permissions,
  hasAgent,
  actions,
}: {
  customerId: string;
  permissions: Permissions;
  hasAgent: boolean;
  actions: ReturnType<typeof useCustomerActions>;
}) {
  const items: { action: CustomerAction; icon: typeof Archive; allowed: boolean }[] =
    [
      { action: "assign-to-me", icon: UserPlus, allowed: !hasAgent },
      { action: "remove-agent", icon: UserMinus, allowed: hasAgent && permissions.can_edit },
      { action: "ladder", icon: ArrowUpFromLine, allowed: permissions.can_edit },
      { action: "archive", icon: Archive, allowed: permissions.can_archive },
      { action: "restore", icon: ArchiveRestore, allowed: permissions.can_restore },
      { action: "absence", icon: MessageSquareWarning, allowed: permissions.can_edit },
    ];

  const visible = items.filter((item) => item.allowed);
  const dialog = actions.pending ? customerActionCopy[actions.pending] : undefined;

  return (
    <>
      {(visible.length > 0 || permissions.can_edit) && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="icon-lg" aria-label="عملیات تقاضا" />}
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {permissions.can_edit && (
              <>
                <DropdownMenuItem
                  render={<Link href={routes.panel.editRequest(customerId)} />}
                >
                  <SquarePen className="size-4" />
                  ویرایش تقاضا
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {visible.map((item) => {
              const copy = customerActionCopy[item.action];
              return (
                <DropdownMenuItem
                  key={item.action}
                  onClick={() => actions.ask(item.action)}
                  className={cn(copy.danger && "text-destructive")}
                >
                  <item.icon className="size-4" />
                  {copy.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog
        open={Boolean(actions.pending)}
        onOpenChange={(open) => !open && actions.cancel()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog?.title}</DialogTitle>
            <DialogDescription>{dialog?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={actions.cancel}>
              انصراف
            </Button>
            <Button
              variant={dialog?.danger ? "destructive" : "default"}
              onClick={actions.confirm}
              disabled={actions.isRunning}
            >
              {actions.isRunning && <Spinner data-icon="inline-start" />}
              {dialog?.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
