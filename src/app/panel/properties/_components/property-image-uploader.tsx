"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { ImageItem } from "../_types/property-form.types";

export function PropertyImageUploader({
  images,
  onChange,
}: {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(
    () => () =>
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url)),
    [],
  );

  const addImages = (files: File[]) => {
    const valid = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024,
    );
    setError(
      valid.length === files.length
        ? ""
        : "فقط تصاویر JPG، PNG یا WEBP با حجم کمتر از ۱۰ مگابایت قابل انتخاب هستند.",
    );
    const existing = new Set(
      images.map(({ file }) => `${file.name}-${file.size}`),
    );
    const next = valid
      .filter((file) => !existing.has(`${file.name}-${file.size}`))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    onChange([...images, ...next]);
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    addImages(Array.from(event.target.files ?? []));
    event.target.value = "";
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addImages(Array.from(event.dataTransfer.files));
  };
  const remove = (index: number) => {
    const removed = images[index];
    if (removed) URL.revokeObjectURL(removed.url);
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "rounded-xl border border-dashed p-6 text-center transition-all",
          isDragging
            ? "border-brand bg-brand/15 ring-4 ring-brand/10"
            : "border-brand/40 bg-brand/5 hover:border-brand hover:bg-brand/10",
        )}
      >
        <div
          className={cn(
            "mx-auto flex size-12 items-center justify-center rounded-full",
            isDragging
              ? "bg-brand text-brand-foreground"
              : "bg-brand/10 text-brand",
          )}
        >
          <Upload className="size-6" />
        </div>
        <Typography variant="body" className="mt-3 font-medium">
          تصاویر ملک را اضافه کنید
        </Typography>
        <Typography variant="small" className="mt-1">
          تصاویر را اینجا رها کنید یا از دستگاه انتخاب کنید؛ JPG، PNG و WEBP تا
          ۱۰ مگابایت
        </Typography>
        <Label
          htmlFor="property-images"
          className="mx-auto mt-4 inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
        >
          انتخاب تصاویر
        </Label>
        <Input
          id="property-images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only !size-px !border-0 !p-0"
          onChange={onInput}
        />
        {error && (
          <Typography variant="small" className="mt-3 text-destructive">
            {error}
          </Typography>
        )}
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image.file.name}-${image.file.size}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
            >
              <Image
                src={image.url}
                alt={`تصویر ملک ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
              {index === 0 && (
                <Badge className="absolute start-2 top-2 bg-brand text-brand-foreground">
                  تصویر اصلی
                </Badge>
              )}
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`حذف تصویر ${index + 1}`}
                className="absolute end-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-destructive opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
