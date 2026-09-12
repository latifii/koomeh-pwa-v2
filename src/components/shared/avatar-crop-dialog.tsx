"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";

/** The side of the square that leaves here — enough for a 128px avatar at 4×. */
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/**
 * Draws the chosen area onto a square canvas and hands back a JPEG.
 *
 * Rotation is applied about the image centre before the crop is read, the
 * same order the cropper uses to show it, so what leaves is what was seen.
 * JPEG at 0.9 rather than the original bytes: a phone photo is several
 * megabytes, and the 512px square is all the avatar ever shows.
 */
async function renderCrop(
  src: string,
  area: Area,
  rotation: number,
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("image"));
    element.src = src;
  });

  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  // The rotated image's bounding box, which is the space the crop is in.
  const boxWidth = image.width * cos + image.height * sin;
  const boxHeight = image.width * sin + image.height * cos;

  const stage = document.createElement("canvas");
  stage.width = Math.ceil(boxWidth);
  stage.height = Math.ceil(boxHeight);
  const stageContext = stage.getContext("2d");
  if (!stageContext) throw new Error("canvas");
  stageContext.translate(stage.width / 2, stage.height / 2);
  stageContext.rotate(radians);
  stageContext.drawImage(image, -image.width / 2, -image.height / 2);

  const output = document.createElement("canvas");
  output.width = OUTPUT_SIZE;
  output.height = OUTPUT_SIZE;
  const context = output.getContext("2d");
  if (!context) throw new Error("canvas");
  context.imageSmoothingQuality = "high";
  context.drawImage(
    stage,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    output.toBlob(resolve, "image/jpeg", 0.9),
  );
  if (!blob) throw new Error("blob");

  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

/**
 * The crop step between picking a file and uploading it, the way Telegram
 * does a profile picture: the photo behind a round window, drag to move it,
 * pinch or scroll or the slider to zoom, a quarter turn if it came in
 * sideways. What is inside the circle is what is uploaded — as a square,
 * since that is what the API stores and the avatar shows in a circle anyway.
 *
 * The dialog is the shell; the stage inside is keyed on the file, so every
 * new picture starts from a fresh crop, zoom and rotation without any state
 * having to be reset by hand.
 */
export function AvatarCropDialog({
  file,
  onCancel,
  onCropped,
}: {
  /** The picked file; `null` keeps the dialog closed. */
  file: File | null;
  onCancel: () => void;
  onCropped: (file: File) => void;
}) {
  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b p-4">
          <DialogTitle>برش عکس پروفایل</DialogTitle>
          <DialogDescription>
            عکس را بکشید تا جابه‌جا شود؛ با دو انگشت یا نوار پایین بزرگ‌نمایی
            کنید.
          </DialogDescription>
        </DialogHeader>

        {file && (
          <CropStage
            key={`${file.name}-${file.size}-${file.lastModified}`}
            file={file}
            onCancel={onCancel}
            onCropped={onCropped}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CropStage({
  file,
  onCancel,
  onCropped,
}: {
  file: File;
  onCancel: () => void;
  onCropped: (file: File) => void;
}) {
  // One object URL for the life of this stage, revoked when it unmounts.
  const src = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area | null>(null);
  const [rendering, setRendering] = useState(false);

  const onCropComplete = useCallback(
    (_: Area, pixels: Area) => setArea(pixels),
    [],
  );

  const confirm = async () => {
    if (!area) return;
    setRendering(true);
    try {
      onCropped(await renderCrop(src, area, rotation));
    } finally {
      setRendering(false);
    }
  };

  return (
    <>
      {/* The stage: dark, so the round window reads as the picture and the
          rest as what is being left out. */}
      <div className="relative aspect-square w-full bg-neutral-950">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={false}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          zoomWithScroll
          restrictPosition
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: "transparent" },
            cropAreaStyle: {
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
              border: "2px solid rgba(255,255,255,0.9)",
            },
          }}
        />
      </div>

      <div className="grid gap-3 p-4">
        <div className="flex items-center gap-3" dir="ltr">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="کوچک‌نمایی"
            onClick={() =>
              setZoom((current) =>
                Math.max(MIN_ZOOM, +(current - 0.25).toFixed(2)),
              )
            }
          >
            <ZoomOut />
          </Button>
          <Slider
            value={[zoom]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            onValueChange={(value) =>
              setZoom(Array.isArray(value) ? value[0] : value)
            }
            aria-label="بزرگ‌نمایی"
            className="flex-1"
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="بزرگ‌نمایی"
            onClick={() =>
              setZoom((current) =>
                Math.min(MAX_ZOOM, +(current + 0.25).toFixed(2)),
              )
            }
          >
            <ZoomIn />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRotation((current) => (current + 90) % 360)}
          >
            <RotateCw data-icon="inline-start" />
            چرخش ۹۰°
          </Button>
          <Typography variant="small" className="tabular-nums">
            {Math.round(zoom * 100).toLocaleString("fa-IR")}٪
          </Typography>
        </div>
      </div>

      <DialogFooter className="border-t p-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={rendering}
        >
          انصراف
        </Button>
        <Button type="button" onClick={confirm} disabled={!area || rendering}>
          {rendering && <Spinner data-icon="inline-start" />}
          تأیید و بارگذاری
        </Button>
      </DialogFooter>
    </>
  );
}
