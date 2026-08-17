"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ApiImageProps = Omit<ImageProps, "src" | "unoptimized"> & {
  src: string;
  fallbackSrc: ImageProps["src"];
};

/**
 * Remote CMS images bypass Next's server optimizer so a slow upstream cannot
 * block or spam the Next server. Broken URLs fall back to a bundled asset.
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
      unoptimized={!failed}
      onError={(event) => {
        onError?.(event);
        setFailedSrc(src);
      }}
    />
  );
}
