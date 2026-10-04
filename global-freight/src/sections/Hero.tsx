import { useRef } from 'react';
import { brand } from '../config/brand';
import { useContent } from '../content';
import { LAND_PATH, WORLD_VIEWBOX } from '../assets/world-land';
import { gsap, ScrollTrigger, MOTION_OK } from '../lib/gsap';
import { scrollToId } from '../lib/lenis';
import { useGsap } from '../hooks/useGsap';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { PlaneGlyph, ShipGlyph, TrainGlyph } from '../components/VehicleIcons';
import { RouteSwatch } from '../components/RouteSwatch';
import { backgroundRoutes, featuredRoutes, labelledHubs, type Hub, type Mode } from './heroRoutes';

const { width: W, height: H } = WORLD_VIEWBOX;
/** Wide view on desktop; on phones, frame the Asia–Europe corridor the routes run through. */
const VIEWBOX_WIDE = '215 30 700 400';
const VIEWBOX_NARROW = '488 62 362 196';

const glyphs: Record<Mode, () => React.JSX.Element> = { air: PlaneGlyph, ocean: ShipGlyph, land: TrainGlyph };
const dash: Record<Mode, string | undefined> = { air: '7 5', ocean: undefined, land: '2 4' };

const graticule = Array.from({ length: 23 }, (_, i) => (i + 1) * (W / 24));
const parallels = Array.from({ length: 11 }, (_, i) => (i + 1) * (H / 12));

function labelOffset(hub: Hub): { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' } {
  switch (hub.label) {
    case 'left':
      return { dx: -6, dy: 2.5, anchor: 'end' };
    case 'above':
      return { dx: 0, dy: -6, anchor: 'middle' };
    case 'below':
      return { dx: 0, dy: 10, anchor: 'middle' };
    default:
      return { dx: 6, dy: 2.5, anchor: 'start' };
  }
}

export function Hero() {
  const t = useContent();
  const root = useRef<HTMLElement>(null);
  const narrow = useMediaQuery('(max-width: 767px)');

  useGsap(
    root,
    () => {
      const vehicles = gsap.utils.toArray<SVGGElement>('[data-vehicle]');
      const travel = vehicles.map((v, i) =>
        gsap.to(v, {
          motionPath: {
            path: `[data-route-path="${i}"]`,
            align: `[data-route-path="${i}"]`,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
          duration: featuredRoutes[i].duration,
          ease: 'none',
          repeat: -1,
          paused: true,
        }),
      );

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // One orchestrated load moment: routes draw, hubs light, headline rises.
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
          .from('[data-route-draw]', { strokeDashoffset: 1, duration: 2.2, stagger: 0.25, ease: 'power2.inOut' })
          .from('[data-hub]', { opacity: 0, scale: 0, transformOrigin: 'center', duration: 0.5, stagger: 0.05 }, 0.6)
          .from('[data-hero-line]', { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0.15)
          .from('[data-hero-fade]', { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, 0.7)
          .from(vehicles, { opacity: 0, duration: 0.6 }, 1.6)
          .add(() => travel.forEach((tw) => tw.play()), 1.4);

        // Vehicles only move while the hero is on screen.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => travel.forEach((tw) => (self.isActive ? tw.play() : tw.pause())),
        });

        // Camera descends towards the corridor as you scroll; headline lifts away.
        gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: 'top top', end: '+=90%', scrub: 0.6, pin: true },
          })
          .to('[data-hero-camera]', { scale: 1.45, yPercent: 6, ease: 'none' }, 0)
          .to('[data-hero-copy]', { y: -80, opacity: 0, scale: 0.94, ease: 'none' }, 0)
          .to('[data-hero-legend]', { opacity: 0, y: -30, ease: 'none' }, 0)
          .to('[data-hero-shade]', { opacity: 1, ease: 'none' }, 0.35);

        return () => travel.forEach((tw) => tw.pause());
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Static frame: routes drawn, each vehicle parked part-way along.
        travel.forEach((tw) => tw.progress(0.55).pause());
      });
    },
    [narrow],
  );

  return (
    <section
      id="hero"
      ref={root}
      tabIndex={-1}
      aria-labelledby="hero-title"
      className="relative h-svh min-h-[560px] overflow-hidden bg-navy-deep"
    >
      {/* Map: the "wide aerial shot". Replace with video by swapping this layer. */}
      <div data-hero-camera className="absolute inset-0 origin-[68%_32%] will-change-transform max-md:inset-x-0 max-md:top-16 max-md:bottom-auto max-md:h-[42svh] max-md:[mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
        <svg
          viewBox={narrow ? VIEWBOX_NARROW : VIEWBOX_WIDE}
          preserveAspectRatio={narrow ? 'xMidYMid meet' : 'xMidYMid slice'}
          className="h-full w-full"
          role="img"
          aria-label={t.hero.mapLabel}
        >
          <g stroke="var(--color-chart)" strokeOpacity="0.09" strokeWidth="0.5" vectorEffect="non-scaling-stroke">
            {graticule.map((x) => (
              <line key={`m${x}`} x1={x} y1={0} x2={x} y2={H} vectorEffect="non-scaling-stroke" />
            ))}
            {parallels.map((y) => (
              <line key={`p${y}`} x1={0} y1={y} x2={W} y2={y} vectorEffect="non-scaling-stroke" />
            ))}
          </g>

          <path d={LAND_PATH} fill="var(--color-steel)" stroke="var(--color-chart)" strokeOpacity="0.28" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />

          <g fill="none" stroke="var(--color-chart)" strokeOpacity="0.32" strokeWidth="1" vectorEffect="non-scaling-stroke">
            {backgroundRoutes.map((d) => (
              <path key={d} d={d} strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
            ))}
          </g>

          {featuredRoutes.map((route, i) => {
            const Glyph = glyphs[route.mode];
            return (
              <g key={route.mode}>
                <path data-route-path={i} d={route.d} fill="none" stroke="none" />
                {/* The mask draws in; the visible line keeps its dash pattern. */}
                <mask id={`route-mask-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                  <path
                    data-route-draw
                    d={route.d}
                    pathLength={1}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="8"
                    strokeDasharray="1 1"
                    strokeDashoffset="0"
                  />
                </mask>
                <path
                  d={route.d}
                  mask={`url(#route-mask-${i})`}
                  fill="none"
                  stroke="var(--color-signal)"
                  strokeWidth={route.mode === 'ocean' ? 2.2 : 1.7}
                  strokeLinecap="round"
                  strokeDasharray={dash[route.mode]}
                  vectorEffect="non-scaling-stroke"
                />
                <g data-vehicle fill="var(--color-fog)" stroke="var(--color-navy-deep)" strokeWidth="0.6">
                  <g transform={narrow ? 'scale(0.75)' : 'scale(0.85)'}>
                    <Glyph />
                  </g>
                </g>
              </g>
            );
          })}

          {labelledHubs.map((hub) => {
            const { dx, dy, anchor } = labelOffset(hub);
            return (
              <g key={hub.name} data-hub>
                <circle cx={hub.at[0]} cy={hub.at[1]} r={2.2} fill="var(--color-signal)" />
                <circle cx={hub.at[0]} cy={hub.at[1]} r={5} fill="none" stroke="var(--color-signal)" strokeOpacity="0.45" vectorEffect="non-scaling-stroke" />
                <text
                  x={hub.at[0] + dx}
                  y={hub.at[1] + dy}
                  textAnchor={anchor}
                  className="type-data"
                  fontSize={narrow ? 9 : 8}
                  fill="var(--color-fog)"
                  fillOpacity="0.8"
                >
                  {hub.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Edge shading keeps the headline legible over the map. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_30%,transparent_35%,var(--color-navy-deep)_88%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-transparent" />
      <div data-hero-shade aria-hidden="true" className="pointer-events-none absolute inset-0 bg-navy opacity-0" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-8 sm:pb-14">
        <div data-hero-copy className="origin-bottom-left">
          <h1 id="hero-title" className="type-display text-display">
            <span className="sr-only">{brand.name}: </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block">
                {brand.slogan}
              </span>
            </span>
          </h1>
          <p data-hero-fade className="mt-5 max-w-[34ch] text-lg text-fog/85 sm:mt-6 sm:text-xl sm:leading-snug">
            {t.hero.lede}
          </p>
          <div data-hero-fade className="mt-7 flex flex-wrap gap-3">
            <a href="#contact" className="btn btn-primary" onClick={(e) => (e.preventDefault(), scrollToId('contact'))}>
              {t.hero.primaryCta}
            </a>
            <a href="#network" className="btn btn-ghost" onClick={(e) => (e.preventDefault(), scrollToId('network'))}>
              {t.hero.secondaryCta}
            </a>
          </div>
        </div>

        <div data-hero-legend className="mt-10 flex items-end justify-between gap-8">
          <p data-hero-fade className="type-data flex items-center gap-3 text-sm text-chart">
            <span aria-hidden="true" className="block h-8 w-px origin-top animate-[scrollcue_2.4s_ease-in-out_infinite] bg-signal motion-reduce:animate-none" />
            {t.hero.scrollHint}
          </p>
          <dl data-hero-fade className="hidden gap-x-6 gap-y-2 text-sm md:grid md:grid-cols-[auto_auto]" aria-label={t.hero.legendTitle}>
            {t.hero.legend.map((row) => (
              <div key={row.mode} className="contents">
                <dt className="flex items-center gap-3 text-fog/90">
                  <RouteSwatch mode={row.mode} />
                  {row.route}
                </dt>
                <dd className="type-data text-chart">{row.transit}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
