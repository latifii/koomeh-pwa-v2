import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Expand, Move, Smartphone } from "lucide-react";

import introImage from "@/assets/images/intro/intro1.webp";
import { Icon360 } from "@/components/icons/icon-360";
import { Typography } from "@/components/ui/typography";

/**
 * The "360° box" on the detail page: a preview of the space with a pulsing tour
 * badge and simulated hotspots that reads as an invitation to step inside, then
 * hands off to the full-screen tour route.
 */
export function EstateTourCard({
  estateId,
  title,
  sceneCount,
}: {
  estateId: string;
  title: string;
  sceneCount: number;
}) {
  const preview = introImage;

  return (
    <Link
      href={`/estate/${estateId}/tour`}
      aria-label={`ورود به تور مجازی ۳۶۰ درجه ${title}`}
      className="group relative block overflow-hidden rounded-2xl border sm:rounded-3xl"
    >
      <div className="relative aspect-16/9 w-full sm:aspect-21/9">
        <Image
          src={preview}
          alt={`تور مجازی ${title}`}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary-deep/90 via-primary-deep/45 to-primary-deep/25" />

        {/* Faint blueprint grid for a tech feel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_left,var(--color-white)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-white)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,var(--color-black),transparent_72%)]"
        />

        {/* Simulated navigation hotspots */}
        <span
          aria-hidden
          className="absolute start-[26%] top-[54%] flex size-8 items-center justify-center"
        >
          <span className="absolute size-8 animate-ping rounded-full bg-white/30" />
          <span className="size-3.5 rounded-full border-2 border-white bg-secondary shadow-lg" />
        </span>
        <span
          aria-hidden
          className="absolute end-[30%] top-[46%] flex size-6 items-center justify-center"
        >
          <span className="absolute size-6 animate-ping rounded-full bg-white/25 [animation-delay:0.6s]" />
          <span className="size-3 rounded-full border-2 border-white bg-white/80" />
        </span>

        {/* Centre play affordance */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="relative flex size-16 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 sm:size-20">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/10" />
            <Icon360 className="size-8 sm:size-10" />
          </span>
        </span>

        {/* Bottom bar */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div>
            <Typography
              as="span"
              variant="small"
              className="flex items-center gap-1.5 text-[11px] font-medium text-secondary"
            >
              <Move className="size-3.5" />
              بازدید آنلاین ۳۶۰ درجه
            </Typography>
            <Typography variant="h3" as="h2" light className="text-lg sm:text-xl">
              تور مجازی این ملک
            </Typography>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1 text-[11px] text-white/75"
              >
                <Expand className="size-3.5 text-secondary" />
                {sceneCount.toLocaleString("fa-IR")} فضای قابل بازدید
              </Typography>
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1 text-[11px] text-white/75"
              >
                <Smartphone className="size-3.5 text-secondary" />
                بدون نصب اپلیکیشن
              </Typography>
            </div>
          </div>

          <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 font-heading text-sm font-semibold text-secondary-foreground transition-transform group-hover:scale-105">
            ورود به تور
            <ArrowLeft className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
