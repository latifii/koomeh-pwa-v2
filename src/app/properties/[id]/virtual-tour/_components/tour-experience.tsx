"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  LoaderCircle,
  Maximize,
  Minimize,
  Minus,
  Move,
  Pause,
  Play,
  Plus,
  Rotate3d,
  X,
} from "lucide-react";

import { Typography } from "@/components/ui/typography";
import type { EstateTour } from "@/data/virtual-tour";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

// WebGL viewer touches `window`, so it only ever loads in the browser.
const PanoramaViewer = dynamic(
  () => import("./panorama-viewer").then((mod) => mod.PanoramaViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-primary-deep">
        <LoaderCircle className="size-8 animate-spin text-white/60" />
      </div>
    ),
  }
);

const MIN_FOV = 40;
const MAX_FOV = 90;

/**
 * The full-screen tour: a fixed overlay covering the site chrome, with the 360
 * stage front and centre and a scene rail plus a control cluster over it.
 */
export function TourExperience({ tour }: { tour: EstateTour }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [gyro, setGyro] = useState(false);
  const [fov, setFov] = useState(70);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = tour.scenes[activeIndex];
  const multiScene = tour.scenes.length > 1;

  // Lock the page behind the overlay while the tour is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // The first drag/tap dismisses the "drag to look around" hint.
  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(() => setShowHint(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showHint]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      rootRef.current?.requestFullscreen?.();
    }
  };

  const enableGyro = async () => {
    // iOS gates device orientation behind an explicit permission prompt.
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof DOE?.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        if (result !== "granted") return;
      } catch {
        return;
      }
    }
    setGyro((value) => !value);
  };

  const step = (delta: number) =>
    setActiveIndex(
      (index) => (index + delta + tour.scenes.length) % tour.scenes.length
    );

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-primary-deep select-none"
    >
      {/* Stage */}
      <div
        className="relative flex-1"
        onPointerDown={() => setShowHint(false)}
      >
        <PanoramaViewer
          scene={active}
          autoRotate={autoRotate && !gyro}
          gyro={gyro}
          fov={fov}
        />

        {/* Top gradient + header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-linear-to-b from-black/60 to-transparent p-4">
          <Link
            href={routes.property(tour.estateId)}
            aria-label="بازگشت به صفحه ملک"
            className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50"
          >
            <X className="size-5" />
          </Link>

          <div className="pointer-events-none min-w-0 flex-1 text-center">
            <Typography
              as="span"
              variant="small"
              className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-secondary"
            >
              <Rotate3d className="size-3.5" />
              تور مجازی ۳۶۰ درجه
            </Typography>
            <Typography
              variant="h4"
              as="h1"
              className="truncate text-white sm:text-sm"
            >
              {tour.title}
            </Typography>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "خروج از تمام‌صفحه" : "نمای تمام‌صفحه"}
            className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50"
          >
            {isFullscreen ? (
              <Minimize className="size-5" />
            ) : (
              <Maximize className="size-5" />
            )}
          </button>
        </div>

        {/* Drag hint */}
        {showHint && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-xs font-medium text-white backdrop-blur-md duration-500 animate-in fade-in-0">
              <Move className="size-4 animate-pulse" />
              برای نگاه به اطراف، تصویر را بکشید
            </span>
          </div>
        )}

        {/* Scene arrows (multi-scene only) */}
        {multiScene && (
          <>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="فضای بعدی"
              className="absolute inset-s-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/55"
            >
              <ChevronRight className="size-6 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="فضای قبلی"
              className="absolute inset-e-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/55"
            >
              <ChevronLeft className="size-6 rtl:rotate-180" />
            </button>
          </>
        )}

        {/* Control cluster */}
        <div className="absolute bottom-4 inset-e-4 flex flex-col gap-2">
          <ControlButton
            active={autoRotate && !gyro}
            disabled={gyro}
            onClick={() => setAutoRotate((v) => !v)}
            label={autoRotate ? "توقف چرخش" : "چرخش خودکار"}
          >
            {autoRotate && !gyro ? (
              <Pause className="size-4.5" />
            ) : (
              <Play className="size-4.5" />
            )}
          </ControlButton>
          <ControlButton active={gyro} onClick={enableGyro} label="حالت ژیروسکوپ">
            <Compass className="size-4.5" />
          </ControlButton>
          <div className="flex flex-col overflow-hidden rounded-full border border-white/20 bg-black/35 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setFov((f) => Math.max(MIN_FOV, f - 8))}
              aria-label="بزرگ‌نمایی"
              className="flex size-10 items-center justify-center text-white transition-colors hover:bg-white/15"
            >
              <Plus className="size-4.5" />
            </button>
            <span className="mx-auto h-px w-5 bg-white/20" />
            <button
              type="button"
              onClick={() => setFov((f) => Math.min(MAX_FOV, f + 8))}
              aria-label="کوچک‌نمایی"
              className="flex size-10 items-center justify-center text-white transition-colors hover:bg-white/15"
            >
              <Minus className="size-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scene rail */}
      {multiScene && (
        <div className="shrink-0 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 pt-2.5">
            <Typography
              variant="h4"
              as="p"
              className="text-white sm:text-[13px]"
            >
              {active.name}
            </Typography>
            <Typography
              as="span"
              variant="small"
              className="text-[11px] text-white/60"
            >
              <span className="text-secondary">
                {(activeIndex + 1).toLocaleString("fa-IR")}
              </span>{" "}
              از {tour.scenes.length.toLocaleString("fa-IR")} فضا
            </Typography>
          </div>

          <div className="flex gap-2 overflow-x-auto p-4 pt-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tour.scenes.map((scene, index) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === activeIndex}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors",
                  index === activeIndex
                    ? "border-secondary bg-white/10"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    index === activeIndex
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-white/10 text-white/70"
                  )}
                >
                  <Rotate3d className="size-4.5" />
                </span>
                <Typography
                  as="span"
                  variant="small"
                  className={cn(
                    "whitespace-nowrap text-[11px]",
                    index === activeIndex ? "text-white" : "text-white/60"
                  )}
                >
                  {scene.name}
                </Typography>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex size-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors disabled:opacity-40",
        active
          ? "border-secondary bg-secondary text-secondary-foreground"
          : "border-white/20 bg-black/35 text-white hover:bg-black/55"
      )}
    >
      {children}
    </button>
  );
}
