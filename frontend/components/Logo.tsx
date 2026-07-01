/**
 * VENTIS GROUP brand mark — the full transparent lockup served from the CDN.
 * A CSS filter flattens whatever colour the source art uses to a flat tone:
 *   - `light`  → pure white, for the emerald chrome (top nav, footer).
 *   - `dark`   → near-black, for the light/cream glass nav once scrolled.
 *   - `silver` → metallic silver (~#C0C0C0), for the emerald chrome.
 */
const FILTERS = {
  light: "brightness(0) invert(1)",
  dark: "brightness(0)",
  // black → silver: invert to a flat 0.78 grey, then lift contrast a touch
  // so the lockup reads as brushed metal rather than dull grey.
  silver: "brightness(0) invert(0.78) contrast(1.1)",
} as const;

export function Logo({
  className = "h-11 md:h-14",
  variant = "light",
}: {
  className?: string;
  compact?: boolean;
  variant?: "light" | "dark" | "silver";
}) {
  return (
    <img
      src="https://image.9bricks.com/ventis/logo-transparent.avif"
      alt="VENTIS GROUP"
      className={`w-auto select-none ${className}`}
      style={{ filter: FILTERS[variant] }}
    />
  );
}
