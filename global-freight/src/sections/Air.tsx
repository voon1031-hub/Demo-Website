import { useEffect, useRef } from 'react';
import { useContent } from '../content';
import { gsap, MOTION_OK, prefersReducedMotion } from '../lib/gsap';
import { useGsap } from '../hooks/useGsap';
import { MediaFrame } from '../components/MediaFrame';
import { asset, media } from '../config/media';
import { useScrubVideo } from '../hooks/useScrubVideo';
import type { Globe } from '../lib/globe';

/**
 * Air, one continuous fall from orbit to the plane:
 *   1. three.js globe zooms to its hand-off frame
 *   2. the canvas gives way to the descent clip, whose first frame is that
 *      same image, so nothing visibly changes
 *   3. scrolling plays the clip down through the clouds to the plane
 *   4. the looping plane footage takes over, then the copy comes in
 */
export function Air() {
  const t = useContent();
  const c = t.air;
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const globe = useRef<Globe | null>(null);
  const zoom = useRef({ p: 0 });
  const descent = useRef<HTMLVideoElement>(null);
  const descentAt = useScrubVideo(descent, media.airDescent.video!, root);

  // Build the globe while the page is idle, well before the visitor scrolls
  // here, so loading three.js and compiling shaders never lands mid-scroll.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let disposed = false;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    const handle = window.setTimeout(() => {
      idle(() => {
        import('../lib/globe').then(({ createGlobe }) => {
          if (disposed || !canvas.current) return;
          globe.current = createGlobe(canvas.current, asset('media/globe-land.webp'));
          globe.current.setProgress(zoom.current.p);
        });
      });
    }, 800);
    return () => {
      disposed = true;
      window.clearTimeout(handle);
      globe.current?.dispose();
      globe.current = null;
    };
  }, []);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.set(['[data-air-video]', '[data-air-descent]'], { opacity: 0 });
      gsap.set('[data-air-copy] > *', { opacity: 0, x: -40 });

      // Timeline positions (fractions of the pinned scroll).
      const GLOBE_END = 0.3;
      const DESCENT = [0.32, 0.76];

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=340%',
            scrub: 0.7,
            pin: true,
            onUpdate: (self) => {
              descentAt.current = Math.min(1, Math.max(0, (self.progress - DESCENT[0]) / (DESCENT[1] - DESCENT[0])));
            },
          },
        })
        .to(zoom.current, {
          p: 1,
          ease: 'none',
          duration: GLOBE_END,
          onUpdate: () => globe.current?.setProgress(zoom.current.p),
        })
        .to('[data-air-label]', { opacity: 0, duration: 0.08 }, 0.04)
        // Swap: the clip's first frame is already showing what the canvas shows.
        .set('[data-air-descent]', { opacity: 1 }, GLOBE_END - 0.005)
        .to('[data-air-globe]', { opacity: 0, duration: 0.02 }, GLOBE_END)
        .to('[data-air-video]', { opacity: 1, ease: 'sine.inOut', duration: 0.06 }, DESCENT[1] - 0.02)
        .to('[data-air-copy] > *', { opacity: 1, x: 0, stagger: 0.03, duration: 0.1 }, 0.84)
        .to({}, { duration: 0.06 });
    });
  });

  return (
    <section id="air" ref={root} tabIndex={-1} aria-labelledby="air-title" className="relative bg-navy-deep">
      <div className="relative h-svh min-h-[600px] overflow-hidden motion-reduce:h-auto motion-reduce:min-h-0">

        <p
          data-air-label
          className="type-data pointer-events-none absolute left-1/2 top-[18%] flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy/70 px-4 py-2 text-sm text-fog backdrop-blur motion-reduce:hidden"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-signal" />
          {c.routeLabel}
        </p>

        {/* Descent clip: its first frame is the globe's hand-off frame, so it is
            shown ungraded to match the canvas pixel for pixel. */}
        <div data-air-descent className="absolute inset-0 bg-navy-deep motion-reduce:hidden">
          <img src={media.airDescent.poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          <video ref={descent} className="absolute inset-0 h-full w-full object-cover" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
        </div>

        <div
          data-air-video
          className="absolute inset-0 motion-reduce:relative motion-reduce:aspect-video motion-reduce:max-h-[70svh] motion-reduce:w-full motion-reduce:!opacity-100"
        >
          <MediaFrame slot="airFreighter" className="!absolute inset-0" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/70 to-navy-deep/10" />
        </div>

        {/* Above the footage, so the clouds drift over it as it fades in */}
        <div data-air-globe className="pointer-events-none absolute inset-0 motion-reduce:hidden">
          <canvas ref={canvas} className="h-full w-full" role="img" aria-label={c.globeLabel} />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-14 pt-24 sm:px-8 sm:pb-20 motion-reduce:h-auto">
          <div data-air-copy className="text-legible max-w-xl">
            <h2 id="air-title" className="type-display text-3xl">
              {c.heading}
            </h2>
            <p className="mt-4 max-w-[42ch] text-fog md:mt-6 md:text-lg">{c.intro}</p>
            <dl className="mt-6 grid gap-4 border-t border-chart/25 pt-4 sm:grid-cols-3 md:mt-8">
              {c.facts.map((f) => (
                <div key={f.term}>
                  <dt className="text-sm text-chart-light">{f.term}</dt>
                  <dd className="type-data mt-1 text-fog">{f.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
