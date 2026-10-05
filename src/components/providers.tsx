"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Lenis gives the whole page inertial scrolling; it drives the native scroll
 * position, so Motion's useScroll keeps working unchanged. Both respect
 * prefers-reduced-motion: Lenis drops its smoothing, and Motion skips
 * transform animations while keeping fades.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.085, wheelMultiplier: 0.95, anchors: true, stopInertiaOnNavigate: true }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
