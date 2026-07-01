"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Buttery momentum scrolling for the whole document (Lenis).
 * `anchors` makes in-page #links glide instead of jump, offset for the fixed header.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.14,
        wheelMultiplier: 1,
        smoothWheel: true,
        anchors: { offset: -90 },
      }}
    >
      {children}
    </ReactLenis>
  );
}
