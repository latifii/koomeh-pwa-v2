"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Star, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

type Upload = {
  /** Local key while uploading; replaced by the API's id on success. */
  key: string;
  preview: string;
  progress: number;
  id?: number;
  error?: string;
};

/** A picture already attached to whatever is being edited. */
export type ExistingImage = { id: number; url: string };

/**
 * Uploads one file per request and hands the resulting ids up to the form.
 *
 * Written once and given the upload call rather than hard-wired to one: the
 * listing form and the branch form both do exactly this against different
 * endpoints, and the fiddly parts — the object-URL preview so a picture appears
 * before the round trip finishes, the room left, the cover, the confirmation on
 * a deletion that cannot be undone — are the parts worth not having twice.
 */
export function ImageUploader({
  imageIds,
  coverImageId,
  maxImages,
  upload,
  onChange,
  onCoverChange,
  existing = [],
  onRemoveExisting,
}: {
  imageIds: number[];
  coverImageId: number | null;
  maxImages: number;
  /** Sends one file and answers with the id to list in `images[]`. */
  upload: (
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<{ id: number }>;
  onChange: (ids: number[]) => void;
  onCoverChange: (id: number | null) => void;
  existing?: ExistingImage[];
  onRemoveExisting?: (id: number) => Promise<void>;
}) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const patch = (key: string, changes: Partial<Upload>) =>
    setUploads((current) =>
      current.map((item) => (item.key === key ? { ...item, ...changes } : item)),
    );

  const accept = async (files: FileList | null) => {
    if (!files?.length) return;

    const room = maxImages - imageIds.length;
    if (room <= 0) {
      toast.error(
        `حداکثر ${maxImages.toLocaleString("fa-IR")} تصویر می‌توانید اضافه کنید.`,
      );
      return;
    }

    const chosen = Array.from(files).slice(0, room);
    if (files.length > room) {
      toast.warning(
        `فقط ${room.toLocaleString("fa-IR")} تصویر دیگر جا دارد؛ بقیه اضافه نشد.`,
      );
    }

    for (const file of chosen) {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(`${file.name}: فقط jpg، png و webp پذیرفته می‌شود.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: حجم تصویر باید کمتر از ۵ مگابایت باشد.`);
        continue;
      }

      const key = `${file.name}-${file.size}-${file.lastModified}`;
      const preview = URL.createObjectURL(file);
      setUploads((current) => [...current, { key, preview, progress: 0 }]);

      try {
        const { id } = await upload(file, (percent) =>
          patch(key, { progress: percent }),
        );
        patch(key, { id, progress: 100 });

        const next = [...imageIds, id];
        onChange(next);
        // The first successful upload becomes the cover unless one is chosen.
        if (coverImageId === null) onCoverChange(id);
      } catch (error) {
        patch(key, { error: getApiErrorMessage(error) });
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (upload: Upload) => {
    URL.revokeObjectURL(upload.preview);
    setUploads((current) => current.filter((item) => item.key !== upload.key));

    if (upload.id === undefined) return;
    const next = imageIds.filter((id) => id !== upload.id);
    onChange(next);
    if (coverImageId === upload.id) onCoverChange(next[0] ?? null);
  };

  const removeExisting = async (id: number) => {
    if (!onRemoveExisting) return;
    setDeleting(id);
    try {
      await onRemoveExisting(id);
      setConfirming(null);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography variant="small">
          تا {maxImages.toLocaleString("fa-IR")} تصویر · jpg، png یا webp ·
          حداکثر ۵ مگابایت
        </Typography>
        <Typography variant="small">
          {imageIds.length.toLocaleString("fa-IR")} تصویر
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {existing.map((image) => (
          <figure
            key={image.id}
            className={cn(
              "relative aspect-4/3 overflow-hidden rounded-xl border bg-muted",
              image.id === coverImageId && "ring-2 ring-brand",
            )}
          >
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 200px, 45vw"
              className="object-cover"
            />

            {confirming === image.id ? (
              <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 p-2 text-center">
                <Typography as="span" variant="small" light className="text-[11px]">
                  این تصویر حذف شود؟
                </Typography>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    disabled={deleting === image.id}
                    onClick={() => void removeExisting(image.id)}
                  >
                    {deleting === image.id ? <Spinner /> : null}
                    حذف
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setConfirming(null)}
                  >
                    انصراف
                  </Button>
                </div>
              </figcaption>
            ) : (
              <div className="absolute end-1.5 top-1.5 flex gap-1">
                {image.id !== coverImageId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="انتخاب به عنوان تصویر اصلی"
                    onClick={() => onCoverChange(image.id)}
                    className="size-7 border-white/30 bg-black/45 text-white backdrop-blur-md hover:bg-black/65 hover:text-white"
                  >
                    <Star className="size-3.5" />
                  </Button>
                )}
                {onRemoveExisting && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="حذف تصویر"
                    onClick={() => setConfirming(image.id)}
                    className="size-7 border-white/30 bg-black/45 text-white backdrop-blur-md hover:bg-black/65 hover:text-white"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            )}

            {image.id === coverImageId && confirming !== image.id && (
              <span className="absolute bottom-1.5 inset-s-1.5 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                تصویر اصلی
              </span>
            )}
          </figure>
        ))}

        {uploads.map((upload) => (
          <figure
            key={upload.key}
            className={cn(
              "relative aspect-4/3 overflow-hidden rounded-xl border bg-muted",
              upload.error && "border-destructive",
              upload.id !== undefined &&
                upload.id === coverImageId &&
                "ring-2 ring-brand",
            )}
          >
            {/* Local preview: a blob URL Next's optimizer cannot process. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={upload.preview} alt="" className="size-full object-cover" />

            {upload.error ? (
              <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/85 p-2 text-center text-white">
                <TriangleAlert className="size-4" />
                <Typography as="span" variant="small" light className="text-[11px]">
                  {upload.error}
                </Typography>
              </figcaption>
            ) : upload.progress < 100 ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5">
                <span className="block h-1 overflow-hidden rounded-full bg-white/30">
                  <span
                    className="block h-full bg-secondary transition-[width]"
                    style={{ width: `${upload.progress}%` }}
                  />
                </span>
              </figcaption>
            ) : null}

            <div className="absolute end-1.5 top-1.5 flex gap-1">
              {upload.id !== undefined && upload.id !== coverImageId && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="انتخاب به عنوان تصویر اصلی"
                  onClick={() => onCoverChange(upload.id!)}
                  className="size-7 border-white/30 bg-black/45 text-white backdrop-blur-md hover:bg-black/65 hover:text-white"
                >
                  <Star className="size-3.5" />
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="حذف تصویر"
                onClick={() => remove(upload)}
                className="size-7 border-white/30 bg-black/45 text-white backdrop-blur-md hover:bg-black/65 hover:text-white"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            {upload.id !== undefined && upload.id === coverImageId && (
              <span className="absolute bottom-1.5 inset-s-1.5 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                تصویر اصلی
              </span>
            )}
          </figure>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-4/3 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
        >
          <ImagePlus className="size-6" />
          <Typography as="span" variant="small">
            افزودن تصویر
          </Typography>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        hidden
        onChange={(event) => void accept(event.target.files)}
      />
    </div>
  );
}
