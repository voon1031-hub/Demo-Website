import { useRef } from 'react';
import { fillStats, useContent } from '../content';
import { gsap, MOTION_OK } from '../lib/gsap';
import { useGsap } from '../hooks/useGsap';

/**
 * Why us: one lead reason with its figure, three supporting ones. Sizes and
 * offsets differ on purpose; they arrive staggered as the block scrolls in.
 */
export function WhyUs() {
  const c = useContent().why;
  const root = useRef<HTMLElement>(null);
  const [lead, ...rest] = c.items;

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from('[data-why]', {
        opacity: 0,
        y: (i: number) => 40 + i * 24,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-why-grid]', start: 'top 78%' },
      });
    });
  });

  return (
    <section id="why" ref={root} tabIndex={-1} aria-labelledby="why-title" className="relative bg-navy px-4 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-7xl">
        <h2 id="why-title" className="type-display max-w-[16ch] text-3xl text-signal-text">
          {c.heading}
        </h2>

        <ul data-why-grid className="mt-14 grid gap-5 md:grid-cols-2">
          <li data-why className="why-card flex flex-col justify-between gap-10 rounded-[28px] bg-steel p-8 md:row-span-3 md:p-10">
            <p className="type-display text-[clamp(3.5rem,9vw,7.5rem)] leading-none text-signal-text">{fillStats(lead.figure ?? '')}</p>
            <div>
              <h3 className="type-heading text-2xl text-fog">{lead.title}</h3>
              <p className="mt-3 max-w-[40ch] text-fog">{lead.body}</p>
            </div>
          </li>
          {/* The middle card steps in slightly: a staggered column rather than a uniform stack. */}
          {rest.map((item, i) => (
            <li
              key={item.title}
              data-why
              className={`why-card rounded-[20px] border border-chart/25 p-7 ${i === 1 ? 'md:ml-10' : ''}`}
            >
              <h3 className="type-heading text-xl text-fog">{item.title}</h3>
              <p className="mt-2 max-w-[44ch] text-fog">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
