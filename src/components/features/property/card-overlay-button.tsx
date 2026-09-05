/**
 * The look of a control that sits on a listing's photograph.
 *
 * Shared rather than copied because the saved-files page adds a second one
 * beside the heart, and two buttons an inch apart in different shapes is worse
 * than either shape on its own — which is exactly what the pin looked like when
 * it was styled as an outline button and dropped on top of a glass circle.
 */
export const cardOverlayButton =
  "relative z-20 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-black/50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";
