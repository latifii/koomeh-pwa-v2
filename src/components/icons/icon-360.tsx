import { cn } from "@/lib/utils";

/**
 * A 360° panorama mark: an orbit ellipse with a direction arrowhead and the
 * "360" label at its center. Drawn locally because lucide has no 360 icon —
 * `Rotate3d` reads as a 3D-transform gizmo, not a virtual tour.
 */
export function Icon360({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-6", className)}
    >
      {/* Orbit, opened on the left so the arrowhead can sit on the path */}
      <path d="M8.6 6.6C4.7 7.4 2 9.2 2 12c0 3.3 4.5 6 10 6s10-2.7 10-6c0-2.5-2.6-4.6-6.2-5.5" />
      <path d="M10.4 4.6 8 6.8l2.6 1.9" />
      {/* "360" wordmark */}
      <g
        fill="currentColor"
        stroke="none"
        fontSize="7"
        fontWeight="700"
        fontFamily="inherit"
        textAnchor="middle"
      >
        <text x="12" y="14.6">
          360
        </text>
      </g>
    </svg>
  );
}
