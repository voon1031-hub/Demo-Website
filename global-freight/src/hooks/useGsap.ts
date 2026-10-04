import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';

/**
 * Runs GSAP setup scoped to a container and reverts every tween and
 * ScrollTrigger it created on unmount (and on StrictMode re-mounts).
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: () => void, deps: unknown[] = []) {
  useLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(setup, scope.current);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
