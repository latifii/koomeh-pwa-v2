"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImageUp, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { AvatarCropDialog } from "@/components/shared/avatar-crop-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * One picture: the profile photo.
 *
 * Click or drop, then the crop step — the picture behind a round window,
 * drag and zoom, as Telegram does it — and only what is inside the circle
 * goes up: a preview the moment it is confirmed (an object URL, so nothing
 * waits on the upload), a ring that fills as it goes up, and a way to take
 * the picture down again. The two things that go wrong are caught
 * before the round trip — a file that is not an image, a file over the limit
 * — with the same words the API would use, so the answer is instant.
 */
export function AvatarUploader({
  src,
  name,
  pending = false,
  upload,
  remove,
  onChanged,
}: {
  src?: string | null;
  name: string;
  /** Waiting on an administrator: shown, but said. */
  pending?: boolean;
  upload: (
    file: File,
    onProgress: (percent: number) => void,
  ) => Promise<{ photo: string }>;
  remove: () => Promise<{ photo: string }>;
  onChanged: (photo: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);
  const [over, setOver] = useState(false);
  /** The picked file, waiting to be cropped. */
  const [cropping, setCropping] = useState<File | null>(null);

  // Object URLs leak until revoked; each preview is revoked when replaced.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Picking only opens the crop; the size limit is checked on what leaves
  // the crop, since a 6 MB phone photo comes out of it as a 512px square.
  const pick = (file: File | undefined) => {
    if (!file) return;

    if (!ACCEPT.includes(file.type)) {
      toast.error("فقط jpg، png و webp پذیرفته می‌شود.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setCropping(file);
  };

  const send = async (file: File) => {
    setCropping(null);

    if (file.size > MAX_BYTES) {
      toast.error("حجم عکس نباید بیش از ۲ مگابایت باشد.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setProgress(0);

    try {
      const result = await upload(file, setProgress);
      onChanged(result.photo);
      toast.success("عکس پروفایل ذخیره شد.");
    } catch (error) {
      setPreview(null);
      toast.error(getApiErrorMessage(error));
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const takeDown = async () => {
    setRemoving(true);
    try {
      const result = await remove();
      setPreview(null);
      onChanged(result.photo);
      toast.success("عکس پروفایل برداشته شد.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setRemoving(false);
    }
  };

  const busy = progress !== null || removing;
  const shown = preview ?? src ?? undefined;
  // The ring: a conic sweep behind the picture that fills with the upload.
  const ring =
    progress === null
      ? undefined
      : `conic-gradient(var(--brand) ${progress * 3.6}deg, transparent 0)`;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        className={cn(
          "group relative rounded-full p-1 outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50",
          over && "ring-3 ring-brand/40",
        )}
        style={{ background: ring }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          void pick(event.dataTransfer.files?.[0]);
        }}
        disabled={busy}
        aria-label="تغییر عکس پروفایل"
      >
        <Avatar className="size-28 border-4 border-background shadow-sm">
          {shown && (
            <AvatarImage src={shown} alt={name} className="object-cover" />
          )}
          <AvatarFallback className="bg-brand/10 text-brand">
            <UserRound className="size-12" />
          </AvatarFallback>
        </Avatar>

        {/* What clicking does, said on hover and always on touch screens. */}
        <span
          className={cn(
            "absolute inset-1 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-0",
            busy && "opacity-100",
          )}
        >
          {busy ? (
            <Spinner className="size-6" />
          ) : (
            <Camera className="size-6" />
          )}
        </span>

        {progress !== null && (
          <span className="absolute -bottom-1 start-1/2 -translate-x-1/2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white rtl:translate-x-1/2">
            {progress.toLocaleString("fa-IR")}٪
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => void pick(event.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <ImageUp data-icon="inline-start" />
          {src || preview ? "تغییر عکس" : "بارگذاری عکس"}
        </Button>
        {(src || preview) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={takeDown}
            disabled={busy}
          >
            <Trash2 data-icon="inline-start" />
            حذف
          </Button>
        )}
      </div>

      <Typography variant="small" className="text-center">
        jpg، png یا webp · می‌توانید عکس را همین‌جا رها کنید · پیش از بارگذاری
        برش می‌خورد
        {pending && (
          <>
            <br />
            <span className="text-brand">
              عکس تازه پس از تأیید مدیر برای بقیه نمایش داده می‌شود.
            </span>
          </>
        )}
      </Typography>

      <AvatarCropDialog
        file={cropping}
        onCancel={() => {
          setCropping(null);
          if (inputRef.current) inputRef.current.value = "";
        }}
        onCropped={(file) => void send(file)}
      />
    </div>
  );
}
