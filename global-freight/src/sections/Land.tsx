import { useRef } from 'react';
import { useContent } from '../content';
import { media } from '../config/media';
import { gsap, MOTION_OK } from '../lib/gsap';
import { useScrubVideo } from '../hooks/useScrubVideo';
import { useGsap } from '../hooks/useGsap';

/**
 * Land: a drone sweeps once around a truck crossing a sea bridge, from one
 * side past the front to the other. The clip doesn't play on its own; scroll
 * position sets the frame, so scrolling turns the camera.
 */
export function Land() {
  const c = useContent().land;
  const slot = media.landOrbit;
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const target = useScrubVideo(video, slot.video, root);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.set('[data-land-copy] > *', { opacity: 0, y: 30 });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=240%',
            scrub: true,
            pin: true,
            onUpdate: (self) => (target.current = self.progress),
          },
        })
        .fromTo('[data-land-scene]', { scale: 1.12 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .to('[data-land-copy] > *', { opacity: 1, y: 0, stagger: 0.05, duration: 0.2 }, 0.25)
        .to({}, { duration: 0.3 });
    });
  });

  return (
    <section id="land" ref={root} tabIndex={-1} aria-labelledby="land-title" className="relative bg-navy-deep">
      <div className="relative h-svh min-h-[600px] overflow-hidden motion-reduce:h-auto motion-reduce:min-h-0">
        <div data-land-scene className="media-frame !absolute inset-0 will-change-transform motion-reduce:!relative motion-reduce:aspect-video motion-reduce:max-h-[70svh]">
          <img src={slot.poster} alt={slot.alt} loading="lazy" decoding="async" />
          <video ref={video} className="absolute inset-0" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
          <span className="media-tint" aria-hidden="true" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/50 to-transparent motion-reduce:hidden" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep/85 via-navy-deep/35 to-transparent motion-reduce:hidden" />

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-14 sm:px-8 sm:pb-20 motion-reduce:h-auto motion-reduce:pt-10">
          <div data-land-copy className="text-legible max-w-xl">
            <h2 id="land-title" className="type-display text-3xl">
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
