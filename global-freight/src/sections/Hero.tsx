import { useRef } from 'react';
import { brand } from '../config/brand';
import { asset } from '../config/media';
import { useContent } from '../content';
import { gsap, MOTION_OK } from '../lib/gsap';
import { scrollToId } from '../lib/lenis';
import { useGsap } from '../hooks/useGsap';
import { MediaFrame } from '../components/MediaFrame';

/** One leaf of a container's end doors: ribbed steel with two locking bars. */
function Door({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      data-door={side}
      className={`absolute inset-y-0 w-1/2 will-change-transform [backface-visibility:hidden] ${
        side === 'left' ? 'left-0 origin-left' : 'right-0 origin-right'
      }`}
    >
      <div className="door-steel absolute inset-0" />
      {/* Locking bars with their handles, placed like the logo's cut lines */}
      {[0.3, 0.7].map((x) => (
        <div key={x} className="absolute inset-y-[4%] w-[clamp(6px,0.7vw,10px)] -translate-x-1/2 rounded-full bg-navy-deep/80 shadow-[inset_1px_0_0_rgb(126_147_168/0.25)]" style={{ left: `${x * 100}%` }}>
          <span className="absolute left-1/2 top-[54%] h-[clamp(40px,7vh,72px)] w-[clamp(14px,1.6vw,22px)] -translate-x-1/2 rounded-md bg-steel-light shadow-[0_0_0_1px_rgb(7_20_42/0.8)]" />
        </div>
      ))}
      <div data-door-shade className="absolute inset-0 bg-navy-deep opacity-0" />
    </div>
  );
}

/**
 * Opening shot: closed container doors carrying the logo and slogan.
 * Scrolling swings them open onto the night port; the copy follows.
 */
export function Hero() {
  const t = useContent();
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.set('[data-hero-reveal]', { opacity: 0, y: 24 });

      // Load: light leaks through the gap, the headline rises.
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-door-gap]', { scaleY: 0, opacity: 0, duration: 1.1, ease: 'power2.inOut' })
        .from('[data-hero-mark]', { opacity: 0, y: 12, duration: 0.8 }, 0.3)
        .from('[data-hero-line]', { yPercent: 110, duration: 1.1 }, 0.4)
        .from('[data-hero-hint]', { opacity: 0, duration: 0.6 }, 1);

      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: '+=120%', scrub: 0.6, pin: true },
        })
        .to('[data-door-gap]', { opacity: 0, duration: 0.15 }, 0)
        .to('[data-hero-hint]', { opacity: 0, duration: 0.1 }, 0)
        .to('[data-door="left"]', { rotateY: -108, ease: 'power2.in', duration: 0.7 }, 0)
        .to('[data-door="right"]', { rotateY: 108, ease: 'power2.in', duration: 0.7 }, 0)
        .to('[data-door-shade]', { opacity: 0.85, ease: 'none', duration: 0.6 }, 0.05)
        .fromTo('[data-hero-scene]', { scale: 1.25 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .to('[data-hero-mark]', { opacity: 0, y: -20, duration: 0.3 }, 0.1)
        .to('[data-hero-reveal]', { opacity: 1, y: 0, stagger: 0.08, duration: 0.3 }, 0.5);
    });
  });

  return (
    <section
      id="hero"
      ref={root}
      tabIndex={-1}
      aria-labelledby="hero-title"
      className="relative h-svh min-h-[560px] overflow-hidden bg-navy-deep"
    >
      {/* Behind the doors: the night port */}
      <div data-hero-scene className="absolute inset-0 will-change-transform">
        <MediaFrame slot="heroPort" className="!absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_45%,transparent_30%,rgb(7_20_42/0.85)_100%)]" />
      </div>

      <div aria-hidden="true" className="absolute inset-0 [perspective:1600px] motion-reduce:hidden">
        <Door side="left" />
        <Door side="right" />
        <span
          data-door-gap
          className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-signal shadow-[0_0_24px_6px_rgb(255_95_31/0.55)]"
        />
      </div>

      <div className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-8">
        <img data-hero-mark src={asset(brand.logo.mark)} alt="" width={64} height={64} className="mb-6 h-14 w-14 sm:h-16 sm:w-16" />
        <h1 id="hero-title" className="type-display text-display">
          <span className="sr-only">{brand.name}: </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-hero-line className="block">
              {brand.slogan}
            </span>
          </span>
        </h1>
        <p data-hero-reveal className="mt-6 max-w-[38ch] text-lg text-fog/90 sm:text-xl sm:leading-snug">
          {t.hero.lede}
        </p>
        <div data-hero-reveal className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#contact" className="btn btn-primary" onClick={(e) => (e.preventDefault(), scrollToId('contact'))}>
            {t.hero.primaryCta}
          </a>
          <a href="#air" className="btn btn-ghost" onClick={(e) => (e.preventDefault(), scrollToId('air'))}>
            {t.hero.secondaryCta}
          </a>
        </div>
      </div>

      <p data-hero-hint className="type-data absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 text-sm text-fog/80 motion-reduce:hidden">
        <span aria-hidden="true" className="block h-8 w-px origin-top animate-[scrollcue_2.4s_ease-in-out_infinite] bg-signal" />
        {t.hero.scrollHint}
      </p>
    </section>
  );
}
