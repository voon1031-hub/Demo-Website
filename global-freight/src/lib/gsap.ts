import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Don't re-measure every pinned scene when a phone's address bar shows or hides.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Media query every scroll/ambient animation is gated behind. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };
