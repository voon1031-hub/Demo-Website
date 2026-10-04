import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';

let lenis: Lenis | null = null;

/** Starts smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function startLenis() {
  if (lenis || prefersReducedMotion()) return;
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
}

export function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(raf);
  lenis.destroy();
  lenis = null;
}

function raf(time: number) {
  lenis?.raf(time * 1000);
}

/** Scrolls to a section, smoothly when Lenis is running, natively otherwise. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  // Move focus for keyboard and screen-reader users without a second jump.
  el.focus({ preventScroll: true });
}
