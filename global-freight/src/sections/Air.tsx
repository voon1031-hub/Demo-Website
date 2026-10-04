import { useEffect, useRef } from 'react';
import { useContent } from '../content';
import { gsap, MOTION_OK, prefersReducedMotion } from '../lib/gsap';
import { useGsap } from '../hooks/useGsap';
import { MediaFrame } from '../components/MediaFrame';
import type { Globe } from '../lib/globe';

/**
 * Air: the camera falls from orbit onto a cargo flight (three.js globe),
 * then cuts to the plane footage and the air freight copy.
 */
export function Air() {
  const t = useContent();
  const c = t.air;
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const globe = useRef<Globe | null>(null);
  const zoom = useRef({ p: 0 });

  // Load three.js only when the section is getting close.
  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    let disposed = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        import('../lib/globe').then(({ createGlobe }) => {
          if (disposed || !canvas.current) return;
          globe.current = createGlobe(canvas.current);
          globe.current.setProgress(zoom.current.p);
        });
      },
      { rootMargin: '150% 0px' },
    );
    io.observe(root.current);
    return () => {
      disposed = true;
      io.disconnect();
      globe.current?.dispose();
      globe.current = null;
    };
  }, []);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.set('[data-air-video]', { opacity: 0, scale: 1.18 });
      gsap.set('[data-air-copy] > *', { opacity: 0, x: -40 });

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=260%', scrub: 0.7, pin: true },
        })
        .to(zoom.current, {
          p: 1,
          ease: 'none',
          duration: 0.62,
          onUpdate: () => globe.current?.setProgress(zoom.current.p),
        })
        .to('[data-air-label]', { opacity: 0, duration: 0.12 }, 0.08)
        // While the camera is inside the clouds, the footage fades in behind
        // them and the globe dissolves, so the plane emerges as the clouds clear.
        .to('[data-air-video]', { opacity: 1, scale: 1, ease: 'sine.inOut', duration: 0.3 }, 0.44)
        .to('[data-air-globe]', { opacity: 0, ease: 'sine.inOut', duration: 0.14 }, 0.5)
        .to('[data-air-copy] > *', { opacity: 1, x: 0, stagger: 0.04, duration: 0.14 }, 0.76)
        .to({}, { duration: 0.1 });
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

        <div
          data-air-video
          className="absolute inset-0 will-change-transform motion-reduce:relative motion-reduce:aspect-video motion-reduce:max-h-[70svh] motion-reduce:w-full"
        >
          <MediaFrame slot="airFreighter" className="!absolute inset-0" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy-deep/40 to-transparent" />
        </div>

        {/* Above the footage, so the clouds drift over it as it fades in */}
        <div data-air-globe className="pointer-events-none absolute inset-0 motion-reduce:hidden">
          <canvas ref={canvas} className="h-full w-full" role="img" aria-label={c.globeLabel} />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-14 pt-24 sm:px-8 sm:pb-20 motion-reduce:h-auto">
          <div data-air-copy className="max-w-xl">
            <h2 id="air-title" className="type-display text-3xl">
              {c.heading}
            </h2>
            <p className="mt-4 max-w-[42ch] text-fog/90 md:mt-6 md:text-lg">{c.intro}</p>
            <dl className="mt-6 grid gap-4 border-t border-chart/25 pt-4 sm:grid-cols-3 md:mt-8">
              {c.facts.map((f) => (
                <div key={f.term}>
                  <dt className="text-sm text-chart">{f.term}</dt>
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
