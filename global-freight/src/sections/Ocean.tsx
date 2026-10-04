import { useRef } from 'react';
import { fillStats, useContent } from '../content';
import { gsap, MOTION_OK } from '../lib/gsap';
import { useGsap } from '../hooks/useGsap';
import { MediaFrame } from '../components/MediaFrame';
import { ShipGlyph } from '../components/VehicleIcons';

/** Where the ship sits on screen while the coast scrolls past (fraction of viewport width). */
const SHIP_X = 0.24;

/**
 * Ocean — overhead camera. The section pins and the coast slides past
 * horizontally while a ship holds its place on the sea lane.
 */
export function Ocean() {
  const t = useContent();
  const c = t.ocean;
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const trackEl = track.current!;
      const distance = () => trackEl.scrollWidth - window.innerWidth;

      // Transition in: container doors swing open from the centre.
      gsap.fromTo(
        '[data-ocean-doors]',
        { clipPath: 'inset(6% 42% 6% 42% round 18px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top top', scrub: true },
        },
      );

      const slide = gsap.to(trackEl, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // Photos drift against the slide: depth from a camera looking straight down.
      gsap.utils.toArray<HTMLElement>('[data-ocean-parallax]').forEach((el) => {
        gsap.fromTo(
          el,
          { xPercent: -7 },
          {
            xPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: el, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
          },
        );
      });

      // Copy blocks settle in as they reach the middle of the screen.
      gsap.utils.toArray<HTMLElement>('[data-ocean-copy]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          x: 60,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, containerAnimation: slide, start: 'left 90%', end: 'left 55%', scrub: true },
        });
      });

      // Ports light up as the ship passes them.
      gsap.utils.toArray<HTMLElement>('[data-port]').forEach((el) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            containerAnimation: slide,
            start: `left ${SHIP_X * 100}%`,
            toggleClass: { targets: el, className: 'is-passed' },
          },
        });
      });

    });
  });

  return (
    <section id="ocean" ref={root} tabIndex={-1} aria-labelledby="ocean-title" className="relative bg-navy-deep">
      <div
        data-ocean-doors
        className="relative h-svh min-h-[600px] overflow-hidden bg-navy motion-reduce:h-auto motion-reduce:min-h-0"
      >
        <div
          ref={track}
          className="relative flex h-full w-max will-change-transform motion-reduce:w-full motion-reduce:flex-col"
        >
          {/* Panel 1: heading, facts, the vessel from above */}
          <div className="flex w-screen shrink-0 flex-col gap-6 px-4 pb-[22svh] pt-24 sm:px-8 md:w-[94vw] md:flex-row md:items-center md:gap-12 md:pb-[18svh] md:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] motion-reduce:w-full motion-reduce:pb-16">
            <div className="md:w-[38%] md:shrink-0">
              <h2 id="ocean-title" className="type-display text-3xl">
                {c.heading}
              </h2>
              <p className="mt-4 max-w-[42ch] text-fog md:mt-6 md:text-lg">{c.intro}</p>
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-chart/20 pt-4 md:mt-10 md:grid-cols-1 md:gap-0 md:pt-0">
                {c.facts.map((f) => (
                  <div key={f.term} className="md:flex md:items-baseline md:justify-between md:gap-6 md:border-b md:border-chart/20 md:py-3">
                    <dt className="text-sm text-chart-light">{f.term}</dt>
                    <dd className="type-data mt-1 text-base text-fog md:mt-0 md:text-right md:text-lg">{fillStats(f.detail)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] md:h-[72%] motion-reduce:min-h-[55svh]">
              <div data-ocean-parallax className="absolute -inset-x-[9%] inset-y-0">
                <MediaFrame slot="oceanVessel" className="h-full w-full" />
              </div>
            </div>
          </div>

          {/* Panel 2: terminal, portrait */}
          <div className="flex w-screen shrink-0 flex-col gap-6 px-4 pb-[22svh] pt-24 sm:px-8 md:w-[72vw] md:flex-row md:items-center md:gap-12 md:pb-[18svh] motion-reduce:w-full motion-reduce:pb-16">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] md:h-[82%] md:max-w-[34vw] md:flex-none md:basis-[34vw] motion-reduce:min-h-[70svh]">
              <div data-ocean-parallax className="absolute -inset-x-[12%] inset-y-0">
                <MediaFrame slot="oceanTerminal" className="h-full w-full" />
              </div>
            </div>
            <div data-ocean-copy className="md:max-w-[36ch] md:self-end md:pb-[6svh]">
              <h3 className="type-heading text-2xl">{c.panels[0].heading}</h3>
              <p className="mt-4 text-fog md:text-lg">{c.panels[0].body}</p>
            </div>
          </div>

          {/* Panel 3: stacks + quay, overlapping */}
          <div className="flex w-screen shrink-0 flex-col gap-6 px-4 pb-[22svh] pt-24 sm:px-8 md:w-[86vw] md:flex-row md:items-center md:gap-14 md:pb-[18svh] motion-reduce:w-full motion-reduce:pb-16">
            <div data-ocean-copy className="order-2 md:order-1 md:max-w-[34ch] md:self-start md:pt-[8svh]">
              <h3 className="type-heading text-2xl">{c.panels[1].heading}</h3>
              <p className="mt-4 text-fog md:text-lg">{c.panels[1].body}</p>
            </div>
            <div className="relative order-1 min-h-0 flex-1 md:order-2 md:h-[80%] motion-reduce:min-h-[60svh]">
              <div className="absolute inset-0 overflow-hidden rounded-[28px] md:right-[18%] md:bottom-[22%]">
                <div data-ocean-parallax className="absolute -inset-x-[10%] inset-y-0">
                  <MediaFrame slot="oceanStacks" className="h-full w-full" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 hidden h-[46%] w-[46%] overflow-hidden rounded-[20px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-navy md:block">
                <MediaFrame slot="oceanQuay" className="h-full w-full" />
              </div>
            </div>
          </div>

          {/* Panel 4: hand-off to land */}
          <div className="flex w-screen shrink-0 flex-col justify-center px-4 pb-[22svh] pt-24 sm:px-8 md:w-[62vw] md:pb-[18svh] md:pr-[10vw] motion-reduce:w-full motion-reduce:pb-24">
            <div data-ocean-copy>
              <h3 className="type-display text-2xl md:max-w-[14ch] md:text-[clamp(2.25rem,4.4vw,4rem)]">{c.handoff.heading}</h3>
              <p className="mt-5 max-w-[40ch] text-fog md:text-lg">{c.handoff.body}</p>
            </div>
          </div>

          {/* Ports along the lane; they slide past the ship. */}
          <ol className="pointer-events-none absolute inset-x-0 bottom-[9svh] h-0 motion-reduce:hidden" aria-hidden="true">
            {c.ports.map((port, i) => (
              <li
                key={port}
                data-port
                className="group absolute flex -translate-y-1/2 flex-col items-center"
                // First port sits under the ship at the start, last port reaches it at the end.
                style={{ left: `calc(${SHIP_X * 100}vw + ${i / (c.ports.length - 1)} * (100% - 100vw))` }}
              >
                <span className="block h-3 w-3 rounded-full border-2 border-chart bg-navy transition-colors duration-300 group-[.is-passed]:border-signal group-[.is-passed]:bg-signal" />
                <span className="type-data absolute top-5 whitespace-nowrap text-sm text-chart-light transition-colors duration-300 group-[.is-passed]:text-fog">
                  {port}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* The sea lane: solid wake behind the ship, dashed course ahead. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[9svh] motion-reduce:hidden" aria-hidden="true">
          <div
            className="absolute left-0 h-[2px] -translate-y-1/2 bg-signal"
            style={{ width: `${SHIP_X * 100}vw` }}
          />
          <div
            className="absolute right-0 h-[2px] -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--color-chart)_0_8px,transparent_8px_16px)] opacity-60"
            style={{ left: `${SHIP_X * 100}vw` }}
          />
          <svg
            className="absolute -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_14px_rgb(255_95_31/0.55)]"
            style={{ left: `${SHIP_X * 100}vw` }}
            width="64"
            height="24"
            viewBox="-12 -4.5 24 9"
          >
            <g fill="var(--color-fog)" stroke="var(--color-signal)" strokeWidth="0.5">
              <ShipGlyph />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
