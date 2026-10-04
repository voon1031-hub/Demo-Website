import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/gsap';

/**
 * Drives a video's playhead from scroll instead of playing it. Returns a ref:
 * write a 0–1 progress into `.current` (e.g. from a ScrollTrigger) and the
 * video eases towards that point. The file is attached only when `near`
 * comes within a screen of the viewport. Encode such clips with short
 * keyframe intervals (the "scrub" kind in scripts/fetch-media.sh).
 */
export function useScrubVideo(video: RefObject<HTMLVideoElement | null>, src: string, near: RefObject<HTMLElement | null>) {
  const target = useRef(0);

  useEffect(() => {
    const v = video.current;
    if (!v || !near.current || prefersReducedMotion()) return;
    let raf = 0;
    const tick = () => {
      if (v.readyState >= 1 && v.duration) {
        const goal = target.current * (v.duration - 0.05);
        if (Math.abs(goal - v.currentTime) > 0.01) v.currentTime += (goal - v.currentTime) * 0.2;
      }
      raf = requestAnimationFrame(tick);
    };
    // Attach the file when the section is a screen away; run the seek loop only while it is near.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!v.src) {
            v.src = src;
            v.load();
            // iOS only paints seeked frames after the video has played once.
            v.addEventListener('loadeddata', () => v.play().then(() => v.pause()).catch(() => {}), { once: true });
          }
          if (!raf) raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(near.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [video, src, near]);

  return target;
}
