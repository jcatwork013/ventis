/**
 * Hand-drawn SVG icon set for ART JOURNEYS.
 * Line style: 24x24 grid, no fill, 1.25–1.5 stroke, round caps — quiet and editorial.
 * No icon library; every mark is bespoke so the brand stays coherent.
 */
import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number };

function Base({ children, className = "h-5 w-5", strokeWidth = 1.4, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <Base {...props}>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="8 7 17 7 17 16" />
    </Base>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Base {...props}>
      <line x1="3.5" y1="12" x2="20" y2="12" />
      <polyline points="14 6 20 12 14 18" />
    </Base>
  );
}

export function Mail(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="M3.5 7 12 13l8.5-6" />
    </Base>
  );
}

export function Phone(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 4h3l1.6 4-2 1.2a12 12 0 0 0 5.2 5.2l1.2-2 4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4z" />
    </Base>
  );
}

export function Pin(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 21c4.5-4.4 7-7.9 7-11a7 7 0 1 0-14 0c0 3.1 2.5 6.6 7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </Base>
  );
}

export function Instagram(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.6" cy="7.4" r="0.6" fill="currentColor" stroke="none" />
    </Base>
  );
}

/** Compass — used for the journal / "explore". */
export function Compass(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5 11 11l-2.5 4.5L13 13z" />
    </Base>
  );
}

/** Curation — a framed landscape. */
export function Frame(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="5" width="16" height="14" rx="1" />
      <path d="M4.4 16.5 8 13l3 2.5 5-4.5 3.6 3.2" />
      <circle cx="9.4" cy="9.4" r="1.1" />
    </Base>
  );
}

/** Access — a key. */
export function Key(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="8.5" cy="8.5" r="3.6" />
      <line x1="11.1" y1="11.1" x2="19.5" y2="19.5" />
      <line x1="16.7" y1="15.2" x2="14.8" y2="17.1" />
      <line x1="19.4" y1="17.6" x2="17.7" y2="19.3" />
    </Base>
  );
}

/** Craft — a thrown vessel / amphora silhouette. */
export function Vessel(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 4.5h6" />
      <path d="M10.2 4.5C10.2 7 7.6 8 7.6 12.4 7.6 16.1 9.6 19 12 19s4.4-2.9 4.4-6.6C16.4 8 13.8 7 13.8 4.5" />
    </Base>
  );
}

/** Sustainability — a single leaf. */
export function Leaf(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
      <path d="M5.5 18.5C9.5 17.5 13.5 14.5 16.5 9.5" />
    </Base>
  );
}

/** Up arrow — used for the back-to-top control. */
export function ArrowUp(props: IconProps) {
  return (
    <Base {...props}>
      <line x1="12" y1="20" x2="12" y2="6" />
      <polyline points="6 12 12 6 18 12" />
    </Base>
  );
}

/** Down cue for the hero. */
export function ScrollCue(props: IconProps) {
  return (
    <Base {...props}>
      <line x1="12" y1="4" x2="12" y2="16" />
      <polyline points="7 11 12 16 17 11" />
    </Base>
  );
}

/** Custom close (X) for the mobile menu. */
export function Close(props: IconProps) {
  return (
    <Base {...props}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Base>
  );
}

export function Check(props: IconProps) {
  return (
    <Base {...props}>
      <polyline points="5 12.5 10 17 19 7" />
    </Base>
  );
}

export function Search(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6" />
      <line x1="15.5" y1="15.5" x2="20" y2="20" />
    </Base>
  );
}

export function Download(props: IconProps) {
  return (
    <Base {...props}>
      <line x1="12" y1="4" x2="12" y2="15" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="5" y1="19" x2="19" y2="19" />
    </Base>
  );
}

export function Trash(props: IconProps) {
  return (
    <Base {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <path d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12" />
      <path d="M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
    </Base>
  );
}

/** Custom menu glyph — two unequal rules, more editorial than a hamburger. */
export function Menu(props: IconProps) {
  return (
    <Base {...props}>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="14" y2="15" />
    </Base>
  );
}

/** Small diamond used as a bullet / divider ornament. */
export function Diamond(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 4 19 12 12 20 5 12z" />
    </Base>
  );
}

/** Vision — a long-sight eye over a horizon line. */
export function Vision(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </Base>
  );
}

/** Expansion — arrows reaching to four corners. */
export function Expansion(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 4H4v5" />
      <path d="M15 4h5v5" />
      <path d="M15 20h5v-5" />
      <path d="M9 20H4v-5" />
      <line x1="4" y1="4" x2="9.5" y2="9.5" />
      <line x1="20" y1="4" x2="14.5" y2="9.5" />
      <line x1="20" y1="20" x2="14.5" y2="14.5" />
      <line x1="4" y1="20" x2="9.5" y2="14.5" />
    </Base>
  );
}

/** Innovation — a four-point spark. */
export function Innovation(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3c.5 5 1 5.5 6 6-5 .5-5.5 1-6 6-.5-5-1-5.5-6-6 5-.5 5.5-1 6-6z" />
    </Base>
  );
}

/** Globe — used for the website link. */
export function Globe(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.5 2.5 3.8 5.5 3.8 8.5S14.5 18 12 20.5C9.5 18 8.2 15 8.2 12S9.5 6 12 3.5z" />
    </Base>
  );
}

/**
 * VENTIS brand mark — a serifed "V" with a gold wing rising from its right
 * stroke (the "VF" lockup, simplified to one coherent emblem).
 */
export function VentisMark({ className = "h-8 w-8", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true" {...rest}>
      {/* V */}
      <path d="M4 5.5 14 27 24 5.5" stroke="currentColor" strokeWidth={2.2}
            strokeLinecap="round" strokeLinejoin="round" />
      {/* rising wing */}
      <path d="M17.5 14.5 28 5.5c-1 5-4 8.2-8.4 9.8" stroke="currentColor"
            strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
    </svg>
  );
}

/**
 * Brand mark — a gallery arch (portal) with a keystone dot.
 * Reads as both architecture and a doorway into a journey.
 */
export function Monogram({ className = "h-7 w-7", strokeWidth = 1.4, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true" {...rest}>
      <path
        d="M5 27V14a11 11 0 0 1 22 0v13"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line x1="4" y1="27" x2="11" y2="27" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="21" y1="27" x2="28" y2="27" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="16" cy="13" r="1.6" fill="currentColor" />
    </svg>
  );
}
