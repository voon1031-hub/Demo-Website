import { useRef } from 'react';
import { brand } from '../config/brand';
import { fillStats, useContent } from '../content';
import { LAND_PATH, WORLD_VIEWBOX } from '../assets/world-land';
import { gsap, MOTION_OK } from '../lib/gsap';
import { useGsap } from '../hooks/useGsap';

const { width: W, height: H } = WORLD_VIEWBOX;
const at = (lon: number, lat: number): [number, number] => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];

/** Hub positions, keyed by the names used in content (network.regions[].hubs). */
const HUBS: Record<string, [number, number]> = {
  Shanghai: at(121.5, 31.2),
  'Hong Kong': at(114.2, 22.3),
  Singapore: at(103.8, 1.3),
  Tokyo: at(139.7, 35.7),
  Sydney: at(151.2, -33.9),
  Dubai: at(55.3, 25.2),
  Jeddah: at(39.2, 21.5),
  Rotterdam: at(4.5, 51.9),
  Frankfurt: at(8.7, 50.1),
  Duisburg: at(6.8, 51.4),
  Warsaw: at(21, 52.2),
  'New York': at(-74, 40.7),
  Chicago: at(-87.6, 41.9),
  'Los Angeles': at(-118.2, 34),
  Santos: at(-46.3, -23.9),
};

/** Lanes drawn when each region (same order as content) lights up. */
const LANES: [string, string][][] = [
  [['Shanghai', 'Tokyo'], ['Shanghai', 'Hong Kong'], ['Hong Kong', 'Singapore'], ['Singapore', 'Sydney']],
  [['Singapore', 'Dubai'], ['Shanghai', 'Dubai'], ['Dubai', 'Jeddah']],
  [['Jeddah', 'Rotterdam'], ['Dubai', 'Frankfurt'], ['Shanghai', 'Duisburg'], ['Rotterdam', 'Warsaw']],
  [['Rotterdam', 'New York'], ['New York', 'Chicago'], ['Chicago', 'Los Angeles'], ['New York', 'Santos']],
];

function lane(a: string, b: string) {
  const [x1, y1] = HUBS[a];
  const [x2, y2] = HUBS[b];
  const lift = Math.hypot(x2 - x1, y2 - y1) * 0.22;
  return `M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 - lift} ${x2},${y2}`;
}

/**
 * Global network: the map stays pinned while scrolling lights up one
 * region at a time, its hubs and the lanes that join it to the rest.
 */
export function Network() {
  const c = useContent().network;
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-region-item]');
      gsap.set('[data-hub]', { opacity: 0.18 });
      gsap.set('[data-lane]', { strokeDashoffset: 1 });
      gsap.set('[data-hub-ring]', { scale: 0.3, opacity: 0, transformOrigin: 'center' });
      items.forEach((el) => (el.dataset.active = 'false'));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=220%',
          scrub: 0.5,
          pin: true,
          onUpdate: (self) => {
            const lit = Math.min(c.regions.length - 1, Math.floor(self.progress * c.regions.length * 0.999));
            items.forEach((el, i) => (el.dataset.active = String(i === lit)));
          },
        },
      });
      c.regions.forEach((_, i) => {
        tl.to(`[data-hub="${i}"]`, { opacity: 1, duration: 0.3 }, i)
          .to(`[data-hub-ring="${i}"]`, { scale: 1, opacity: 0.6, duration: 0.4 }, i)
          .to(`[data-lane="${i}"]`, { strokeDashoffset: 0, duration: 0.7, stagger: 0.1, ease: 'power1.inOut' }, i + 0.1);
      });
    });
  });

  return (
    <section id="network" ref={root} tabIndex={-1} aria-labelledby="network-title" className="relative overflow-hidden bg-navy">
      <div className="mx-auto grid min-h-svh max-w-7xl content-center gap-8 px-4 py-24 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
        <div className="lg:order-1">
          <h2 id="network-title" className="type-display text-3xl text-signal-text lg:text-[clamp(2.25rem,3.6vw,3.5rem)]">
            {c.heading}
          </h2>
          <p className="mt-4 max-w-[40ch] text-fog md:text-lg">{fillStats(c.intro)}</p>
          <p className="mt-6 flex items-baseline gap-3">
            <span className="type-display text-[clamp(2.5rem,5vw,4rem)] leading-none text-fog">{brand.stats.hubs}</span>
            <span className="text-chart-light">{c.hubsLabel}</span>
          </p>
          <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-chart/25 pt-6">
            {c.regions.map((r) => (
              <li key={r.name} data-region-item className="group">
                <span className="type-heading flex items-center gap-2 text-lg text-fog transition-colors duration-300 group-data-[active=true]:text-signal-text">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-chart transition-transform duration-300 group-data-[active=true]:scale-150 group-data-[active=true]:bg-signal" />
                  {r.name}
                </span>
                <span className="type-data mt-1 block text-sm text-chart-light">{r.hubs.join(', ')}</span>
              </li>
            ))}
          </ol>
        </div>

        <svg viewBox={`0 40 ${W} ${H - 110}`} className="h-auto w-full lg:order-2" role="img" aria-label={c.mapLabel}>
          <path d={LAND_PATH} fill="var(--color-steel)" stroke="var(--color-chart)" strokeOpacity="0.3" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          {LANES.map((group, i) =>
            group.map(([a, b]) => (
              <path
                key={`${a}-${b}`}
                data-lane={i}
                d={lane(a, b)}
                pathLength={1}
                strokeDasharray="1 1"
                fill="none"
                stroke="var(--color-signal)"
                strokeWidth="1.4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )),
          )}
          {c.regions.map((r, i) =>
            r.hubs.map((name) => {
              const [x, y] = HUBS[name];
              return (
                <g key={name}>
                  <circle data-hub-ring={i} cx={x} cy={y} r={7} fill="none" stroke="var(--color-signal)" strokeWidth="1" opacity={0.6} />
                  <circle data-hub={i} cx={x} cy={y} r={3} fill="var(--color-signal)" />
                </g>
              );
            }),
          )}
        </svg>
      </div>
    </section>
  );
}
