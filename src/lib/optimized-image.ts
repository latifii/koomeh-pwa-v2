/**
 * Builds a same-origin URL for a remote image by routing it through Next's
 * image optimizer.
 *
 * WebGL refuses to texture a cross-origin image unless the host sends CORS
 * headers, and the media host does not. Serving the file from our own origin
 * keeps the canvas untainted, which is what the 360° viewer needs.
 *
 * `width` must be one of Next's configured device sizes and `quality` one of
 * `images.qualities` in `next.config.ts`, or the optimizer rejects the request.
 */
export function optimizedImageUrl(
  src: string,
  width: 1920 | 2048 | 3840 = 3840,
  quality: 75 | 90 = 90,
): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
