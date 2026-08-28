"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ApiImageProps = Omit<ImageProps, "src" | "unoptimized"> & {
  src: string;
  fallbackSrc: ImageProps["src"];
};

/**
 * A remote CMS image with a bundled fallback for broken URLs.
 *
 * These used to be rendered `unoptimized`, to keep a slow upstream from
 * blocking or flooding the Next server. The cost of that turned out to be
 * larger than the risk: `unoptimized` also suppresses `srcset`, so every
 * `sizes` prop on every caller was dead, and each one served whatever the
 * backend happened to store. Measured on the homepage, that was 14.4 MB across
 * 20 photos — one of them a 3.45 MB untouched camera upload — for cards a few
 * hundred pixels wide.
 *
 * Three things make routing them through the optimizer safe here:
 *
 * - The work is paid once per (url, width, quality). The backend sends
 *   `cache-control: max-age=31536000` on these files and its names are
 *   content-unique, so an optimized copy is reused rather than re-derived.
 * - `remotePatterns` in `next.config.ts` limits the optimizer to koomeh.ir and
 *   its media hosts, so the endpoint cannot be pointed at arbitrary origins.
 * - If the upstream fetch fails or times out, `onError` still swaps in the
 *   bundled fallback — the same safety net as before.
 *
 * `unoptimized` stays out of the props on purpose: whether these are optimized
 * is this component's policy, so it changes in one place.
 */
export function ApiImage({
  src,
  fallbackSrc,
  alt,
  onError,
  ...props
}: ApiImageProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const failed = failedSrc === src;

  return (
    <Image
      {...props}
      src={failed ? fallbackSrc : src}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        setFailedSrc(src);
      }}
    />
  );
}
