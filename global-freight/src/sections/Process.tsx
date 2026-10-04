import { useRef } from 'react';
import { useContent } from '../content';
import { gsap, MOTION_OK } from '../lib/gsap';
import { useGsap } from '../hooks/useGsap';

/**
 * How it works: five steps along a route line. The line draws with scroll
 * (across on desktop, down on phones) and each step arrives as it's reached.
 */
export function Process() {
  const c = useContent().process;
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and (min-width: 768px)`, () => build('scaleX'));
    mm.add(`${MOTION_OK} and (max-width: 767px)`, () => build('scaleY'));

    function build(axis: 'scaleX' | 'scaleY') {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '[data-steps]', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
      });
      tl.fromTo('[data-route]', { [axis]: 0 }, { [axis]: 1, ease: 'none', duration: 1 }, 0);
      gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el, i, all) => {
        const at = (i / all.length) * 0.9;
        tl.from(el, { opacity: 0, [axis === 'scaleX' ? 'y' : 'x']: 24, duration: 0.18, ease: 'power2.out' }, at);
        tl.fromTo(el.querySelector('[data-step-dot]'), { scale: 0.4, backgroundColor: '#263649' }, { scale: 1, backgroundColor: '#ff5f1f', duration: 0.1 }, at);
      });
    }
  });

  return (
    <section id="process" ref={root} tabIndex={-1} aria-labelledby="process-title" className="relative bg-navy-deep px-4 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-7xl">
        <h2 id="process-title" className="type-display text-3xl text-signal-text">
          {c.heading}
        </h2>
        <p className="mt-4 max-w-[46ch] text-fog md:text-lg">{c.intro}</p>

        <ol data-steps className="relative mt-16 grid gap-10 pl-10 md:grid-cols-5 md:gap-6 md:pl-0 md:pt-12">
          {/* Route line: vertical on phones, horizontal from md up */}
          <span aria-hidden="true" className="absolute bottom-2 left-[11px] top-2 w-[2px] bg-chart/25 md:inset-x-0 md:bottom-auto md:left-0 md:top-[11px] md:h-[2px] md:w-auto" />
          <span data-route aria-hidden="true" className="absolute bottom-2 left-[11px] top-2 w-[2px] origin-top bg-signal md:inset-x-0 md:bottom-auto md:left-0 md:top-[11px] md:h-[2px] md:w-auto md:origin-left" />
          {c.steps.map((step, i) => (
            <li key={step.title} data-step className="relative">
              <span
                data-step-dot
                aria-hidden="true"
                className="absolute -left-10 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-signal ring-4 ring-navy-deep md:-top-12 md:left-0"
              />
              <span className="type-data text-sm text-chart-light">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="type-heading mt-1 text-xl text-fog">{step.title}</h3>
              <p className="mt-2 max-w-[32ch] text-fog">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
