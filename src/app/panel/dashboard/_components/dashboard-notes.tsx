"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Quote, SquarePen } from "lucide-react";
import { toast } from "sonner";

import { updateDashboardNote } from "@/app/panel/dashboard/_api/dashboard.service";
import { dashboardQueryKeys } from "@/app/panel/dashboard/_constants/dashboard-query-keys";
import { dashboardNotesQueryOptions } from "@/app/panel/dashboard/_queries/dashboard.query";
import {
  updateNoteFormSchema,
  type NoteBoxKey,
  type UpdateNoteValues,
} from "@/app/panel/dashboard/_schemas/dashboard.schema";
import { FormTextareaField, type FormContext } from "@/components/shared/form";
import { RichText } from "@/components/shared/rich-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/api-error";

const boxes: { key: NoteBoxKey; icon: typeof Quote; fallback: string }[] = [
  { key: "dailyquote", icon: Quote, fallback: "جمله روز" },
  { key: "announcements", icon: Megaphone, fallback: "پیام مدیریت" },
];

/**
 * The two message boxes at the top of the panel. An expired box comes back
 * `null` and is not rendered — except for an administrator, who still gets an
 * edit button because the API hands them the raw text either way.
 */
export function DashboardNotes() {
  const queryClient = useQueryClient();
  const notes = useQuery(dashboardNotesQueryOptions());
  const [editing, setEditing] = useState<NoteBoxKey>();

  const form = useForm<UpdateNoteValues>({
    resolver: zodResolver(updateNoteFormSchema),
    defaultValues: { description: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: UpdateNoteValues) =>
      updateDashboardNote(editing!, values.description),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.notes() });
      setEditing(undefined);
      toast.success("متن ذخیره شد و برای همه نمایش داده می‌شود.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (notes.isPending) return <Skeleton className="h-24 rounded-xl" />;
  if (notes.isError || !notes.data) return null;

  const { can_edit: canEdit, editable } = notes.data;

  const visible = boxes.filter(
    (box) => notes.data[box.key] !== null || (canEdit && editable?.[box.key]),
  );

  if (visible.length === 0) return null;

  const openEditor = (key: NoteBoxKey) => {
    form.reset({ description: editable?.[key]?.description ?? "" });
    setEditing(key);
  };

  const context: FormContext<UpdateNoteValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-2">
        {visible.map((box) => {
          const live = notes.data[box.key];
          const draft = editable?.[box.key];
          const title = live?.title ?? draft?.title ?? box.fallback;

          return (
            <Card key={box.key}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <box.icon className="size-4 text-brand" />
                  {title}
                </CardTitle>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditor(box.key)}
                  >
                    <SquarePen data-icon="inline-start" />
                    ویرایش
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {live ? (
                  <RichText html={live.html ?? live.description} />
                ) : (
                  // Only an administrator reaches this: expired, so hidden
                  // from everyone else until it is edited again.
                  <p className="text-sm text-muted-foreground">
                    این متن منقضی شده و برای کاربران نمایش داده نمی‌شود.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(undefined)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              ویرایش {editing === "announcements" ? "پیام مدیریت" : "جمله روز"}
            </DialogTitle>
            <DialogDescription>
              این متن در داشبورد همه‌ی کاربران دیده می‌شود و پس از ذخیره دوباره
              منتشر می‌گردد.
            </DialogDescription>
          </DialogHeader>

          <form
            id="dashboard-note"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <FormTextareaField
              {...context}
              name="description"
              label="متن"
              rows={5}
              required
            />
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(undefined)}>
              انصراف
            </Button>
            <Button
              type="submit"
              form="dashboard-note"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Spinner data-icon="inline-start" />}
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
