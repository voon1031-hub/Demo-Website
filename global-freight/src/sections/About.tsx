import { useRef } from 'react';
import { brand } from '../config/brand';
import { fillStats, useContent } from '../content';
import { gsap, MOTION_OK } from '../lib/gsap';
import { useGsap } from '../hooks/useGsap';
import { MediaFrame } from '../components/MediaFrame';

type StatKey = 'countries' | 'annualTonnes' | 'onTimeRate';

/** How each headline number is written out. */
const format: Record<StatKey, (n: number) => string> = {
  countries: (n) => Math.round(n).toLocaleString(brand.locale),
  annualTonnes: (n) => `${(n / 1_000_000).toFixed(1)}M`,
  onTimeRate: (n) => `${n.toFixed(1)}%`,
};

/**
 * About: low-angle shot of a gantry crane, the camera settling as you
 * arrive, and the three headline numbers counting up once.
 */
export function About() {
  const c = useContent().about;
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      // Looking up at the crane: the frame tilts down and settles as the section arrives.
      gsap.fromTo(
        '[data-about-scene]',
        { scale: 1.18, yPercent: -6 },
        { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true } },
      );
      gsap.from('[data-about-copy] > *', {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-about-copy]', start: 'top 80%' },
      });
      // Count up once, when the numbers come into view.
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const key = el.dataset.count as StatKey;
        const value = { n: 0 };
        el.textContent = format[key](0);
        gsap.to(value, {
          n: brand.stats[key],
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => (el.textContent = format[key](value.n)),
        });
      });
    });
  });

  return (
    <section id="about" ref={root} tabIndex={-1} aria-labelledby="about-title" className="relative overflow-hidden bg-navy-deep">
      <div data-about-scene className="absolute inset-0 origin-bottom will-change-transform">
        <MediaFrame slot="aboutCrane" className="!absolute inset-0" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/75 to-navy-deep/30" />

      <div className="text-legible relative mx-auto flex min-h-svh max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-8 sm:pb-24">
        <div data-about-copy className="max-w-3xl">
          <h2 id="about-title" className="type-display text-3xl text-signal-text">
            {c.heading}
          </h2>
          <p className="mt-5 max-w-[48ch] text-fog md:text-lg">{fillStats(c.intro)}</p>
        </div>
        <dl className="mt-12 grid gap-8 border-t border-chart/25 pt-8 sm:grid-cols-3 sm:gap-6">
          {c.stats.map((s) => (
            // Label first in the markup (dt before dd), number shown on top.
            <div key={s.key} className="flex flex-col-reverse gap-3">
              <dt className="text-chart-light">{s.label}</dt>
              <dd data-count={s.key} className="type-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-fog">
                {format[s.key](brand.stats[s.key])}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
