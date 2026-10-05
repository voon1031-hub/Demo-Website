import type { SpringOptions, Transition } from "motion/react";

/**
 * Cubic-bezier curves, shared with the CSS tokens in globals.css
 * (--ease-out-expo, --ease-out-quint, --ease-in-out-quart).
 */
export const ease = {
  /** Fast start, very long settle. Reveals, lines drawing, cover zoom. */
  outExpo: [0.16, 1, 0.3, 1],
  /** A softer settle for opacity and blur. */
  outQuint: [0.22, 1, 0.36, 1],
  /** Symmetric, for things that swap places (rolling labels). */
  inOutQuart: [0.76, 0, 0.24, 1],
} as const;

/** The name rising over the horizon: quick, one soft overshoot, then rest. */
export const riseSpring: Transition = { type: "spring", visualDuration: 0.85, bounce: 0.28 };

/** Blocks settling into place as they scroll in. No bounce. */
export const settleSpring: Transition = { type: "spring", visualDuration: 0.9, bounce: 0 };

/** Pointer-driven values (magnetic button): light and quick to follow. */
export const followSpring: SpringOptions = { stiffness: 180, damping: 16, mass: 0.35 };

/** Card tilt and lift: a little heavier, so cards feel like objects. */
export const tiltSpring: SpringOptions = { stiffness: 210, damping: 22, mass: 0.6 };
